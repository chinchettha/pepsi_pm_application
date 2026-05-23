import type { Pool } from 'pg'
import type { z } from 'zod'
import type {
  backlogFilterOptionsResponseSchema,
  backlogFilterDetailResponseSchema,
  backlogManhourResponseSchema,
  backlogManhourSearchBodySchema,
  backlogSearchBodySchema,
} from '../schemas/backlog.js'
import { formatUntimeUnit, manhourDateWhereSql } from '../lib/manhour-minutes.js'
import { buildWktypeFilterOptions } from '../lib/wktype-zd-mapping.js'
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
import { loadWorkflowSuffixMap } from './work-order-workflow.js'

type BacklogSearch = z.infer<typeof backlogSearchBodySchema>
type FilterOptions = z.infer<typeof backlogFilterOptionsResponseSchema>
type BacklogManhourSearch = z.infer<typeof backlogManhourSearchBodySchema>
type BacklogManhourSummary = z.infer<typeof backlogManhourResponseSchema>
type BacklogFilterDetail = z.infer<typeof backlogFilterDetailResponseSchema>

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

/** เทียบ ModalMHshow.php — แปลง H เป็นนาทีก่อนรวม */
const MH_WORK_MIN_SQL = `CASE
  WHEN UPPER(TRIM(COALESCE(untime::text, ''))) = 'H' THEN COALESCE(work, 0) * 60
  ELSE COALESCE(work, 0)
END`

const MH_ACT_MIN_SQL = `CASE
  WHEN UPPER(TRIM(COALESCE(untime::text, ''))) = 'H' THEN COALESCE(actwork, 0) * 60
  ELSE COALESCE(actwork, 0)
END`

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
         AND ${sqlFactoryScope('', '$1')}
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
    wktypes: buildWktypeFilterOptions(wktypesMasterR.rows, wktypesR.rows),
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
    WHERE ${sqlFactoryScope('', '$3')}
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

export async function getBacklogManhourSummary(
  pool: Pool,
  body: BacklogManhourSearch,
): Promise<BacklogManhourSummary> {
  const fromSec = parseIsoYyyyMmDdToSec(body.fromDate)
  const toSec = parseIsoYyyyMmDdToSec(body.toDate)
  if (fromSec == null || toSec == null) {
    return {
      fromDate: body.fromDate,
      toDate: body.toDate,
      plannedMinutes: 0,
      plannedHours: 0,
      actualMinutes: 0,
      actualHours: 0,
      totalOrders: 0,
      completionCount: 0,
      completionPercent: 0,
      byWkzb: [],
      rows: [],
    }
  }

  const singleDay = body.fromDate === body.toDate
  const startSec = singleDay ? fromSec : Math.min(fromSec, toSec)
  const endSec = singleDay ? fromSec : Math.max(fromSec, toSec) + 86400
  const factory = `%${FACTORY_CODE}%`
  const dateWhere = manhourDateWhereSql(singleDay)
  const dateParams = singleDay ? [factory, startSec] : [factory, startSec, endSec]

  const aggR = await pool.query<{
    planned_min: string
    actual_min: string
    total_orders: string
    completion_count: string
  }>(
    `SELECT
       COALESCE(SUM(${MH_WORK_MIN_SQL}), 0)::text AS planned_min,
       COALESCE(SUM(${MH_ACT_MIN_SQL}), 0)::text AS actual_min,
       COUNT(*)::text AS total_orders,
       COUNT(*) FILTER (WHERE syst NOT IN ('CRTD', 'REL'))::text AS completion_count
     FROM app.view_order
     WHERE ${sqlFactoryScope('', '$1')}
       AND ${dateWhere}`,
    dateParams,
  )

  const plannedMinutes = Number(aggR.rows[0]?.planned_min ?? 0) || 0
  const actualMinutes = Number(aggR.rows[0]?.actual_min ?? 0) || 0
  const totalOrders = Number(aggR.rows[0]?.total_orders ?? 0) || 0
  const completionCount = Number(aggR.rows[0]?.completion_count ?? 0) || 0
  const completionPercent =
    totalOrders > 0 ? Math.round((completionCount / totalOrders) * 100) : 0

  const wkzbR = await pool.query<{
    wkzb: string
    zbdescrip: string | null
    cnt: string
  }>(
    `SELECT z.wkzb, z.zbdescrip, COALESCE(x.cnt, 0)::text AS cnt
     FROM app.tbwkzb z
     LEFT JOIN (
       SELECT wktype, COUNT(*)::int AS cnt
       FROM app.view_order
       WHERE ${sqlFactoryScope('', '$1')}
         AND ${dateWhere}
       GROUP BY wktype
     ) x ON x.wktype = z.wkzb
     ORDER BY z.wkzb`,
    dateParams,
  )

  const rowsR = await pool.query<{
    wkorder: string
    wktype: string | null
    syst: string | null
    work: string | number | null
    actwork: string | number | null
    untime: string | number | null
    operationshorttext: string | null
    bscstart: string | number | null
  }>(
    `SELECT wkorder, wktype, syst, work, actwork, untime, operationshorttext, bscstart
     FROM app.view_order
     WHERE ${sqlFactoryScope('', '$1')}
       AND ${dateWhere}
     ORDER BY bscstart DESC NULLS LAST
     LIMIT 2500`,
    dateParams,
  )

  return {
    fromDate: body.fromDate,
    toDate: body.toDate,
    plannedMinutes,
    plannedHours: Math.round((plannedMinutes / 60) * 100) / 100,
    actualMinutes,
    actualHours: Math.round((actualMinutes / 60) * 100) / 100,
    totalOrders,
    completionCount,
    completionPercent,
    byWkzb: wkzbR.rows.map((r) => ({
      code: r.wkzb,
      label: r.zbdescrip ? `${r.wkzb} = ${r.zbdescrip}` : r.wkzb,
      count: Number(r.cnt) || 0,
    })),
    rows: rowsR.rows.map((r) => ({
      wkorder: r.wkorder,
      wktype: r.wktype?.trim() ?? '',
      syst: r.syst?.trim() ?? '',
      work: r.work != null && r.work !== '' ? Number(r.work) || 0 : 0,
      actwork: r.actwork != null && r.actwork !== '' ? Number(r.actwork) || 0 : 0,
      unit: formatUntimeUnit(r.untime),
      operationshorttext: r.operationshorttext,
    })),
  }
}

export async function getBacklogFilterDetail(
  pool: Pool,
  body: BacklogSearch,
): Promise<BacklogFilterDetail> {
  const { year, month } = body
  const { startSec, endSec } = monthRangeSec(year, month)
  const factory = `%${FACTORY_CODE}%`

  const buildWhere = (includeWktype: boolean) => {
    const params: unknown[] = [startSec, endSec, factory]
    let where = `
      FROM app.view_order
      WHERE ${sqlFactoryScope('', '$3')}
        AND syst IN ('CRTD', 'REL')
        AND bscstart IS NOT NULL
        AND bscstart > 0
        AND (
          (bscstart >= $1 AND bscstart < $2)
          OR (actfinish >= $1 AND actfinish < $2)
          OR (cday >= $1 AND cday < $2)
        )`

    where += appendInFilter('mat', body.activity, params)
    if (includeWktype) where += appendInFilter('wktype', body.wktype, params)
    where += appendInFilter('functionalloc', body.functionalloc, params)
    where += appendInFilter('equipment', body.equipment, params)
    where += appendInFilter('wkctr', body.wkctr, params)
    return { where, params }
  }

  const { where: whereAll, params: paramsAll } = buildWhere(true)

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

  const { where: whereNoType, params: paramsNoType } = buildWhere(false)

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
