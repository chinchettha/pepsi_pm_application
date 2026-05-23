import type { Pool } from 'pg'
import type { z } from 'zod'
import {
  appendInFilter,
  FACTORY_CODE,
  sqlFactoryScope,
  getMoveOverColor,
  mapOrderRowToEvent,
  monthRangeSec,
  type CalendarEvent,
  type OrderRow,
} from './scheduling-shared.js'
import { buildWktypeFilterOptions } from '../lib/wktype-zd-mapping.js'
import { loadWorkflowSuffixMap } from './work-order-workflow.js'
import type {
  calendarFilterDetailResponseSchema,
  calendarFilterOptionsResponseSchema,
  calendarSearchBodySchema,
} from '../schemas/calendar.js'

type CalendarSearch = z.infer<typeof calendarSearchBodySchema>
type FilterOptions = z.infer<typeof calendarFilterOptionsResponseSchema>
type CalendarFilterDetail = z.infer<typeof calendarFilterDetailResponseSchema>

function padMatLabel(mat: string, descrip: string | null): string {
  const n = Number(mat)
  const code = Number.isFinite(n) ? String(n).padStart(2, '0') : mat
  return descrip ? `${code} = ${descrip}` : code
}

function parseIsoYyyyMmDdToSec(v: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v.trim())
  if (!m) return null
  const yyyy = Number(m[1])
  const mm = Number(m[2])
  const dd = Number(m[3])
  if (!Number.isFinite(yyyy) || !Number.isFinite(mm) || !Number.isFinite(dd)) return null
  const dt = new Date(yyyy, mm - 1, dd)
  const ms = dt.getTime()
  if (!Number.isFinite(ms)) return null
  return Math.floor(ms / 1000)
}

async function listStatusOptions(pool: Pool): Promise<{ code: string; label: string }[]> {
  try {
    const r = await pool.query<{ syst: string; wkstreason: string | null }>(
      `SELECT syst, wkstreason FROM app.tbwkstatus
       WHERE syst <> 'MOVE OVER'
       ORDER BY syst`,
    )
    return r.rows.map((row) => ({
      code: row.syst,
      label: row.wkstreason ? `${row.syst} = ${row.wkstreason}` : row.syst,
    }))
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (!message.includes('wkstreason')) throw err
    const r = await pool.query<{ syst: string }>(
      `SELECT syst FROM app.tbwkstatus
       WHERE syst <> 'MOVE OVER'
       ORDER BY syst`,
    )
    return r.rows.map((row) => ({ code: row.syst, label: row.syst }))
  }
}

export async function listCalendarFilterOptions(pool: Pool): Promise<FilterOptions> {
  const factory = `%${FACTORY_CODE}%`

  const [activitiesR, wktypesR, wktypesMasterR, statusOpts, wcR, fnR, fnMasterR, eqR] = await Promise.all([
    pool.query<{ mat: string; matdescrip: string | null }>(
      `SELECT mat, matdescrip FROM app.tbactivitytype ORDER BY mat`,
    ),
    pool.query<{ wktype: string }>(
      `SELECT DISTINCT wktype
       FROM app.tbiw37n
       WHERE wktype IS NOT NULL AND wktype <> ''
         AND ${sqlFactoryScope('', '$1')}
       ORDER BY wktype`,
      [factory],
    ),
    pool.query<{ wkzb: string; zbdescrip: string | null }>(
      `SELECT wkzb, zbdescrip FROM app.tbwkzb ORDER BY wkzb`,
    ),
    listStatusOptions(pool),
    pool.query<{ wkctr: string; namewkctr: string | null; surnamewkctr: string | null }>(
      `SELECT wkctr, namewkctr, surnamewkctr FROM app.tbworkcenter ORDER BY wkctr`,
    ),
    pool.query<{ functionalloc: string; funcdescrip: string | null }>(
      `SELECT DISTINCT functionalloc, funcdescrip
       FROM app.tbiw37n
       WHERE functionalloc IS NOT NULL AND functionalloc <> ''
         AND ${sqlFactoryScope('', '$1')}
       ORDER BY functionalloc`,
      [factory],
    ),
    pool.query<{ functionalloc: string; funldescrip: string | null }>(
      `SELECT functionalloc, funldescrip FROM app.tbfunctional ORDER BY functionalloc`,
    ),
    pool.query<{ equipment: string; equdescrip: string | null }>(
      `SELECT DISTINCT equipment, equdescrip
       FROM app.tbiw37n
       WHERE equipment IS NOT NULL AND equipment <> ''
         AND ${sqlFactoryScope('', '$1')}
       ORDER BY equipment`,
      [factory],
    ),
  ])

  return {
    activities: activitiesR.rows.map((r) => ({
      code: r.mat,
      label: padMatLabel(r.mat, r.matdescrip),
    })),
    wktypes: buildWktypeFilterOptions(wktypesMasterR.rows, wktypesR.rows),
    statuses: statusOpts,
    workcenters: wcR.rows.map((r) => {
      const name = [r.namewkctr, r.surnamewkctr].filter(Boolean).join(' ').trim()
      return { code: r.wkctr, label: name ? `${r.wkctr} = ${name}` : r.wkctr }
    }),
    teams: [
      { code: 'A', label: 'A' },
      { code: 'B', label: 'B' },
      { code: '', label: 'Null' },
    ],
    functionals:
      fnMasterR.rows.length > 0
        ? fnMasterR.rows.map((r) => ({
            code: r.functionalloc,
            label: r.funldescrip ? `${r.functionalloc} = ${r.funldescrip}` : r.functionalloc,
          }))
        : fnR.rows.map((r) => ({
            code: r.functionalloc,
            label: r.funcdescrip ? `${r.functionalloc} = ${r.funcdescrip}` : r.functionalloc,
          })),
    equipments: eqR.rows.map((r) => ({
      code: r.equipment,
      label: r.equdescrip ? `${r.equipment} = ${r.equdescrip}` : r.equipment,
    })),
  }
}

function appendTeamFilter(values: string[], params: unknown[]): string {
  if (values.length === 0) return ''
  const includeNull = values.includes('')
  const nonEmpty = values.filter((x) => x !== '')
  let sql = ''
  if (nonEmpty.length > 0) {
    const start = params.length + 1
    const placeholders = nonEmpty.map((_, i) => `$${start + i}`).join(', ')
    params.push(...nonEmpty)
    sql += ` AND team IN (${placeholders})`
  }
  if (includeNull) {
    sql += nonEmpty.length > 0 ? ` OR (team IS NULL OR team = '')` : ` AND (team IS NULL OR team = '')`
    if (nonEmpty.length > 0) sql = ` AND (${sql.slice(5)})`
  }
  return sql
}

export async function listCalendarEvents(
  pool: Pool,
  year: number,
  month: number,
): Promise<CalendarEvent[]> {
  const body: CalendarSearch = {
    year,
    month,
    activity: [],
    wktype: [],
    status: [],
    wkctr: [],
    team: [],
    functionalloc: [],
    equipment: [],
  }
  return listCalendarEventsFiltered(pool, body)
}

function buildCalendarFilteredFrom(
  body: CalendarSearch,
  includeWktype: boolean,
): { where: string; params: unknown[] } {
  const { year, month } = body
  const { startSec: monthStart, endSec: monthEnd } = monthRangeSec(year, month)
  const fromSec = body.fromDate ? parseIsoYyyyMmDdToSec(body.fromDate) : null
  const toSec = body.toDate ? parseIsoYyyyMmDdToSec(body.toDate) : null
  const startSec = fromSec != null ? fromSec : monthStart
  const endSec = toSec != null ? toSec + 86400 : monthEnd

  const params: unknown[] = [startSec, endSec, `%${FACTORY_CODE}%`]
  const source = body.wkctr.length > 0 ? 'app.view_confrim' : 'app.view_order'
  let where = `
    FROM ${source}
    WHERE ${sqlFactoryScope('', '$3')}
      AND bscstart IS NOT NULL
      AND bscstart > 0
      AND (
        (bscstart >= $1 AND bscstart < $2)
        OR (actfinish >= $1 AND actfinish < $2)
        OR (cday >= $1 AND cday < $2)
      )`

  where += appendInFilter('mat', body.activity, params)
  if (includeWktype) where += appendInFilter('wktype', body.wktype, params)
  where += appendInFilter('syst', body.status, params)
  where += appendInFilter('wkctr', body.wkctr, params)
  where += appendInFilter('functionalloc', body.functionalloc, params)
  where += appendInFilter('equipment', body.equipment, params)
  where += appendTeamFilter(body.team, params)
  return { where, params }
}

/** สรุปตัวกรองปฏิทิน — เทียบ `#OrderDetail` ใน `M_filter_iw37.php` / W_calendar.php */
export async function getCalendarFilterDetail(
  pool: Pool,
  body: CalendarSearch,
): Promise<CalendarFilterDetail> {
  const { year, month } = body
  const { where: whereAll, params: paramsAll } = buildCalendarFilteredFrom(body, true)

  const totalsR = await pool.query<{
    total_orders: string
    completion_count: string
    team_a_count: string
    team_a_work: string
    team_b_count: string
    team_b_work: string
    team_p_count: string
    team_p_work: string
  }>(
    `SELECT
       COUNT(*)::text AS total_orders,
       COUNT(*) FILTER (WHERE syst NOT IN ('CRTD', 'REL'))::text AS completion_count,
       COUNT(*) FILTER (WHERE team = 'A')::text AS team_a_count,
       COALESCE(SUM(COALESCE(work, 0)) FILTER (WHERE team = 'A'), 0)::text AS team_a_work,
       COUNT(*) FILTER (WHERE team = 'B')::text AS team_b_count,
       COALESCE(SUM(COALESCE(work, 0)) FILTER (WHERE team = 'B'), 0)::text AS team_b_work,
       COUNT(*) FILTER (WHERE team = 'P')::text AS team_p_count,
       COALESCE(SUM(COALESCE(work, 0)) FILTER (WHERE team = 'P'), 0)::text AS team_p_work
     ${whereAll}`,
    paramsAll,
  )

  const totalOrders = Number(totalsR.rows[0]?.total_orders ?? 0) || 0
  const completionCount = Number(totalsR.rows[0]?.completion_count ?? 0) || 0
  const completionPercent =
    totalOrders > 0 ? Math.round((completionCount / totalOrders) * 100) : 0

  const { where: whereNoType, params: paramsNoType } = buildCalendarFilteredFrom(body, false)

  const byWkzbR = await pool.query<{
    wkzb: string
    zbdescrip: string | null
    cnt: string
  }>(
    `SELECT z.wkzb, z.zbdescrip, COALESCE(x.cnt, 0)::text AS cnt
     FROM app.tbwkzb z
     LEFT JOIN (
       SELECT wktype, COUNT(*)::int AS cnt
       ${whereNoType}
       GROUP BY wktype
     ) x ON x.wktype = z.wkzb
     ORDER BY z.wkzb`,
    paramsNoType,
  )

  return {
    year,
    month,
    totalOrders,
    completionCount,
    completionPercent,
    byWkzb: byWkzbR.rows.map((r) => ({
      code: r.wkzb,
      label: r.zbdescrip ? `${r.wkzb} = ${r.zbdescrip}` : r.wkzb,
      count: Number(r.cnt) || 0,
    })),
    teamA: {
      count: Number(totalsR.rows[0]?.team_a_count ?? 0) || 0,
      workSumMinutes: Number(totalsR.rows[0]?.team_a_work ?? 0) || 0,
    },
    teamB: {
      count: Number(totalsR.rows[0]?.team_b_count ?? 0) || 0,
      workSumMinutes: Number(totalsR.rows[0]?.team_b_work ?? 0) || 0,
    },
    teamP: {
      count: Number(totalsR.rows[0]?.team_p_count ?? 0) || 0,
      workSumMinutes: Number(totalsR.rows[0]?.team_p_work ?? 0) || 0,
    },
  }
}

export async function listCalendarEventsFiltered(
  pool: Pool,
  body: CalendarSearch,
): Promise<CalendarEvent[]> {
  const { year, month } = body
  const { prefix } = monthRangeSec(year, month)
  const moveColor = await getMoveOverColor(pool)

  const { where, params } = buildCalendarFilteredFrom(body, true)
  const sql = `
    SELECT idiw37, wkorder, wktype, bscstart, actfinish, cday, syst, operationshorttext, wkstcolor
    ${where}
    ORDER BY bscstart DESC LIMIT 2500`

  const r = await pool.query<OrderRow>(sql, params)

  const items: CalendarEvent[] = []
  for (const row of r.rows) {
    const ev = mapOrderRowToEvent(row, moveColor)
    if (ev && ev.date.startsWith(prefix)) items.push(ev)
  }
  const suffixMap = await loadWorkflowSuffixMap(
    pool,
    items.map((e) => Number(e.id)).filter((n) => Number.isFinite(n)),
  )
  return items.map((ev) => {
    const suffix = suffixMap.get(Number(ev.id))
    if (!suffix) return ev
    return { ...ev, title: `${ev.title}/${suffix}` }
  })
}
