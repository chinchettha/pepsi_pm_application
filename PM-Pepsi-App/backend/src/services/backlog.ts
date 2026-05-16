import type { Pool } from 'pg'
import type { z } from 'zod'
import type {
  backlogFilterOptionsResponseSchema,
  backlogSearchBodySchema,
} from '../schemas/backlog.js'
import {
  appendInFilter,
  FACTORY_CODE,
  getMoveOverColor,
  mapOrderRowToEvent,
  monthRangeSec,
  type CalendarEvent,
  type OrderRow,
} from './scheduling-shared.js'

type BacklogSearch = z.infer<typeof backlogSearchBodySchema>
type FilterOptions = z.infer<typeof backlogFilterOptionsResponseSchema>

function padMatLabel(mat: string, descrip: string | null): string {
  const n = Number(mat)
  const code = Number.isFinite(n) ? String(n).padStart(2, '0') : mat
  return descrip ? `${code} = ${descrip}` : code
}

export async function listBacklogFilterOptions(pool: Pool): Promise<FilterOptions> {
  const factory = `%${FACTORY_CODE}%`

  const [activitiesR, wktypesR, wktypesMasterR, wcR, fnR, fnMasterR, eqR] = await Promise.all([
    pool.query<{ mat: string; matdescrip: string | null }>(
      `SELECT mat, matdescrip FROM app.tbactivitytype ORDER BY mat`,
    ),
    pool.query<{ wktype: string }>(
      `SELECT DISTINCT wktype
       FROM app.tbiw37n
       WHERE wktype IS NOT NULL AND wktype <> ''
         AND syst IN ('CRTD', 'REL')
         AND functionalloc LIKE $1
       ORDER BY wktype`,
      [factory],
    ),
    pool.query<{ wkzb: string; zbdescrip: string | null }>(
      `SELECT wkzb, zbdescrip FROM app.tbwkzb ORDER BY wkzb`,
    ),
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
        : wktypesR.rows.map((r) => ({
            code: r.wktype,
            label: r.wktype,
          })),
    workcenters: wcR.rows.map((r) => {
      const name = [r.namewkctr, r.surnamewkctr].filter(Boolean).join(' ').trim()
      return {
        code: r.wkctr,
        label: name ? `${r.wkctr} = ${name}` : r.wkctr,
      }
    }),
    functionals:
      fnMasterR.rows.length > 0
        ? fnMasterR.rows.map((r) => ({
            code: r.functionalloc,
            label: r.funldescrip
              ? `${r.functionalloc} = ${r.funldescrip}`
              : r.functionalloc,
          }))
        : fnR.rows.map((r) => ({
            code: r.functionalloc,
            label: r.funcdescrip
              ? `${r.functionalloc} = ${r.funcdescrip}`
              : r.functionalloc,
          })),
    equipments: eqR.rows.map((r) => ({
      code: r.equipment,
      label: r.equdescrip ? `${r.equipment} = ${r.equdescrip}` : r.equipment,
    })),
  }
}

export async function listBacklogEvents(
  pool: Pool,
  body: BacklogSearch,
): Promise<CalendarEvent[]> {
  const { year, month } = body
  const { startSec, endSec, prefix } = monthRangeSec(year, month)
  const moveColor = await getMoveOverColor(pool)

  const params: unknown[] = [startSec, endSec, `%${FACTORY_CODE}%`]
  let sql = `
    SELECT idiw37, wkorder, wktype, bscstart, actfinish, cday, syst, operationshorttext, wkstcolor
    FROM app.view_order
    WHERE functionalloc LIKE $3
      AND syst IN ('CRTD', 'REL')
      AND bscstart IS NOT NULL
      AND bscstart > 0
      AND (
        (bscstart >= $1 AND bscstart < $2)
        OR (actfinish >= $1 AND actfinish < $2)
        OR (cday >= $1 AND cday < $2)
      )`

  sql += appendInFilter('mat', body.activity, params)
  sql += appendInFilter('wktype', body.wktype, params)
  sql += appendInFilter('functionalloc', body.functionalloc, params)
  sql += appendInFilter('equipment', body.equipment, params)
  sql += appendInFilter('wkctr', body.wkctr, params)

  sql += ` ORDER BY bscstart DESC LIMIT 2500`

  const r = await pool.query<OrderRow>(sql, params)
  const items: CalendarEvent[] = []
  for (const row of r.rows) {
    const ev = mapOrderRowToEvent(row, moveColor)
    if (ev && ev.date.startsWith(prefix)) items.push(ev)
  }
  return items
}
