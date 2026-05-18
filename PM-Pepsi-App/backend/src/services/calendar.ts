import type { Pool } from 'pg'
import type { z } from 'zod'
import {
  appendInFilter,
  FACTORY_CODE,
  getMoveOverColor,
  mapOrderRowToEvent,
  monthRangeSec,
  type CalendarEvent,
  type OrderRow,
} from './scheduling-shared.js'
import type {
  calendarFilterOptionsResponseSchema,
  calendarSearchBodySchema,
} from '../schemas/calendar.js'

type CalendarSearch = z.infer<typeof calendarSearchBodySchema>
type FilterOptions = z.infer<typeof calendarFilterOptionsResponseSchema>

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
         AND functionalloc LIKE $1
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
         AND functionalloc LIKE $1
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
         AND functionalloc LIKE $1
       ORDER BY equipment`,
      [factory],
    ),
  ])

  return {
    activities: activitiesR.rows.map((r) => ({
      code: r.mat,
      label: padMatLabel(r.mat, r.matdescrip),
    })),
    wktypes:
      wktypesMasterR.rows.length > 0
        ? wktypesMasterR.rows.map((r) => ({
            code: r.wkzb,
            label: r.zbdescrip ? `${r.wkzb} = ${r.zbdescrip}` : r.wkzb,
          }))
        : wktypesR.rows.map((r) => ({ code: r.wktype, label: r.wktype })),
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

export async function listCalendarEventsFiltered(
  pool: Pool,
  body: CalendarSearch,
): Promise<CalendarEvent[]> {
  const { year, month } = body
  const { startSec: monthStart, endSec: monthEnd, prefix } = monthRangeSec(year, month)
  const moveColor = await getMoveOverColor(pool)

  const fromSec = body.fromDate ? parseIsoYyyyMmDdToSec(body.fromDate) : null
  const toSec = body.toDate ? parseIsoYyyyMmDdToSec(body.toDate) : null
  const startSec = fromSec != null ? fromSec : monthStart
  const endSec = toSec != null ? toSec + 86400 : monthEnd

  const params: unknown[] = [startSec, endSec, `%${FACTORY_CODE}%`]
  const source = body.wkctr.length > 0 ? 'app.view_confrim' : 'app.view_order'
  let sql = `
    SELECT idiw37, wkorder, wktype, bscstart, actfinish, cday, syst, operationshorttext, wkstcolor
    FROM ${source}
    WHERE functionalloc LIKE $3
      AND bscstart IS NOT NULL
      AND bscstart > 0
      AND (
        (bscstart >= $1 AND bscstart < $2)
        OR (actfinish >= $1 AND actfinish < $2)
        OR (cday >= $1 AND cday < $2)
      )`

  sql += appendInFilter('mat', body.activity, params)
  sql += appendInFilter('wktype', body.wktype, params)
  sql += appendInFilter('syst', body.status, params)
  sql += appendInFilter('wkctr', body.wkctr, params)
  sql += appendInFilter('functionalloc', body.functionalloc, params)
  sql += appendInFilter('equipment', body.equipment, params)
  sql += appendTeamFilter(body.team, params)
  sql += ` ORDER BY bscstart DESC LIMIT 2500`

  const r = await pool.query<OrderRow>(sql, params)

  const items: CalendarEvent[] = []
  for (const row of r.rows) {
    const ev = mapOrderRowToEvent(row, moveColor)
    if (ev && ev.date.startsWith(prefix)) items.push(ev)
  }
  return items
}
