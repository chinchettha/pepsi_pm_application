import type { Pool } from 'pg'
import type { z } from 'zod'
import { dashboardClosedEventSecExpr, dashboardQcApprovedWhere } from '../lib/dashboard-closed-filter.js'
import {
  SQL_OPEN_NOT_SUPERVISOR_CLOSED,
  SQL_OPEN_PARTIAL_WO_EXISTS,
} from '../lib/pipeline-counts.js'
import type { dashboardSummarySchema } from '../schemas/dashboard.js'

type Summary = z.infer<typeof dashboardSummarySchema>

const TREND_DAYS = 7

/** สร้างช่วง 7 วัน (unix วันเริ่มต้น 00:00 Asia/Bangkok) */
function last7DayUnixBounds(): { dayStarts: number[]; rangeStart: number; rangeEnd: number } {
  const now = new Date()
  const bangkokOffsetMs = 7 * 60 * 60 * 1000
  const local = new Date(now.getTime() + bangkokOffsetMs)
  const y = local.getUTCFullYear()
  const m = local.getUTCMonth()
  const d = local.getUTCDate()

  const dayStarts: number[] = []
  for (let i = TREND_DAYS - 1; i >= 0; i--) {
    const utcMidnight = Date.UTC(y, m, d - i, 0, 0, 0) - bangkokOffsetMs
    dayStarts.push(Math.floor(utcMidnight / 1000))
  }
  const rangeStart = dayStarts[0]!
  const rangeEnd = dayStarts[dayStarts.length - 1]! + 86400
  return { dayStarts, rangeStart, rangeEnd }
}

function bucketDaily(
  rows: { day_offset: number; n: string }[],
  length: number,
): number[] {
  const map = new Map(rows.map((r) => [Number(r.day_offset), Number(r.n)]))
  return Array.from({ length }, (_, i) => map.get(i) ?? 0)
}

const emptyTrend = (): Summary['trends'] => ({
  openDaily: Array(TREND_DAYS).fill(0),
  closedDaily: Array(TREND_DAYS).fill(0),
  pendingDaily: Array(TREND_DAYS).fill(0),
  importDaily: Array(TREND_DAYS).fill(0),
})

async function fetchDailyTrends(
  pool: Pool,
  rangeStart: number,
  rangeEnd: number,
  team: string | null,
): Promise<Summary['trends']> {
  const dayBucket = (col: string) =>
    `FLOOR((${col} - $1::bigint) / 86400)::int`

  try {
  const [openR, closedR, pendingR, importR] = await Promise.all([
    pool.query<{ day_offset: number; n: string }>(
      `SELECT ${dayBucket('i.bscstart')} AS day_offset, COUNT(*)::text AS n
       FROM app.tbiw37n i
       WHERE i.syst IN ('CRTD', 'REL')
         AND ($3::text IS NULL OR i.team = $3::text)
         AND i.bscstart IS NOT NULL
         AND i.bscstart >= $1 AND i.bscstart < $2
       GROUP BY 1`,
      [rangeStart, rangeEnd, team],
    ),
    pool.query<{ day_offset: number; n: string }>(
      `SELECT ${dayBucket(`(${dashboardClosedEventSecExpr('i')})`)} AS day_offset,
              COUNT(DISTINCT i.idiw37)::text AS n
       FROM app.tbiw37n i
       WHERE ${dashboardQcApprovedWhere('i')}
         AND (${dashboardClosedEventSecExpr('i')}) IS NOT NULL
         AND ($3::text IS NULL OR i.team = $3::text)
         AND (${dashboardClosedEventSecExpr('i')}) >= $1
         AND (${dashboardClosedEventSecExpr('i')}) < $2
       GROUP BY 1`,
      [rangeStart, rangeEnd, team],
    ),
    pool.query<{ day_offset: number; n: string }>(
      `SELECT ${dayBucket('i.bscstart')} AS day_offset, COUNT(*)::text AS n
       FROM app.tbiw37n i
       WHERE i.syst IN ('CRTD', 'REL')
         AND ($3::text IS NULL OR i.team = $3::text)
         AND i.bscstart IS NOT NULL
         AND i.bscstart >= $1 AND i.bscstart < $2
         AND NOT EXISTS (SELECT 1 FROM app.tbplangingwork p WHERE p.idiw37 = i.idiw37)
       GROUP BY 1`,
      [rangeStart, rangeEnd, team],
    ),
    pool.query<{ day_offset: number; n: string }>(
      `SELECT ${dayBucket('FLOOR(EXTRACT(EPOCH FROM b.imported_at))::bigint')} AS day_offset,
              COUNT(*)::text AS n
       FROM app.tbiw37n_import_batch b
       WHERE b.imported_at >= to_timestamp($1)
         AND b.imported_at < to_timestamp($2)
       GROUP BY 1`,
      [rangeStart, rangeEnd],
    ),
  ])

  return {
    openDaily: bucketDaily(openR.rows, TREND_DAYS),
    closedDaily: bucketDaily(closedR.rows, TREND_DAYS),
    pendingDaily: bucketDaily(pendingR.rows, TREND_DAYS),
    importDaily: bucketDaily(importR.rows, TREND_DAYS),
  }
  } catch {
    return emptyTrend()
  }
}

export async function getDashboardSummary(
  pool: Pool,
  opts: { team?: 'A' | 'B' | 'EE' | 'UT' } = {},
): Promise<Summary> {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const startSec = Math.floor(monthStart.getTime() / 1000)
  const endSec = Math.floor(monthEnd.getTime() / 1000)
  const team = opts.team?.trim() || null

  const { rangeStart, rangeEnd } = last7DayUnixBounds()

  const [openR, closedR, pendingR, partialR, importR, trends] = await Promise.all([
    pool.query<{ n: string }>(
      `SELECT COUNT(*)::text AS n
       FROM app.tbiw37n
       WHERE syst IN ('CRTD', 'REL')
         AND ($1::text IS NULL OR team = $1::text)`,
      [team],
    ),
    pool.query<{ n: string }>(
      `SELECT COUNT(DISTINCT i.idiw37)::text AS n FROM app.tbiw37n i
       WHERE ${dashboardQcApprovedWhere('i')}
         AND (${dashboardClosedEventSecExpr('i')}) IS NOT NULL
         AND (${dashboardClosedEventSecExpr('i')}) >= $1
         AND (${dashboardClosedEventSecExpr('i')}) < $2
         AND ($3::text IS NULL OR i.team = $3::text)`,
      [startSec, endSec, team],
    ),
    pool.query<{ n: string }>(
      `SELECT COUNT(*)::text AS n
       FROM app.tbiw37n i
       WHERE i.syst IN ('CRTD', 'REL')
         AND ($1::text IS NULL OR i.team = $1::text)
         AND NOT EXISTS (SELECT 1 FROM app.tbplangingwork p WHERE p.idiw37 = i.idiw37)`,
      [team],
    ),
    pool.query<{ n: string }>(
      `SELECT COUNT(*)::text AS n
       FROM app.tbiw37n i
       WHERE i.syst IN ('CRTD', 'REL')
         AND ($1::text IS NULL OR i.team = $1::text)
         AND ${SQL_OPEN_PARTIAL_WO_EXISTS}
         AND ${SQL_OPEN_NOT_SUPERVISOR_CLOSED}`,
      [team],
    ),
    pool.query<{ t: Date | null }>(
      `SELECT MAX(imported_at) AS t FROM app.tbiw37n_import_batch`,
    ),
    fetchDailyTrends(pool, rangeStart, rangeEnd, team),
  ])

  const last = importR.rows[0]?.t

  return {
    openOrders: Number(openR.rows[0]?.n ?? 0),
    closedThisMonth: Number(closedR.rows[0]?.n ?? 0),
    pendingPersonnel: Number(pendingR.rows[0]?.n ?? 0),
    partialOpenOrders: Number(partialR.rows[0]?.n ?? 0),
    iw37nLastImport: last ? last.toISOString() : null,
    trends,
  }
}
