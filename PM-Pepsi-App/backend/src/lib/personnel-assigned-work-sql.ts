import { PLANNER_DISPATCH_WHERE_MP, PLANNER_DISPATCH_WHERE_MPW } from './planner-dispatch-status.js'

/** งานที่จ่ายให้ช่าง — ตรง scope assignee ของ plan-calendar */

/** งานที่ planner จ่ายจริง (pwteam P/G) ในช่วง bscstart — ใช้กับ /manhours Performance */
export const MANHOUR_DISPATCHED_WO_COUNT_SQL = `
SELECT COUNT(DISTINCT i.idiw37)::text AS n
FROM app.tbplangingwork mp
INNER JOIN app.tbworkcenter wc ON wc.wkctr = mp.wkctr
INNER JOIN app.tbiw37n i ON i.idiw37 = mp.idiw37
WHERE wc.idwkctr = $1
  AND ${PLANNER_DISPATCH_WHERE_MP}
  AND i.bscstart BETWEEN $2 AND $3`

export const MANHOUR_DISPATCHED_WO_BY_TYPE_SQL = `
SELECT COUNT(DISTINCT i.idiw37)::text AS n
FROM app.tbplangingwork mp
INNER JOIN app.tbworkcenter wc ON wc.wkctr = mp.wkctr
INNER JOIN app.tbiw37n i ON i.idiw37 = mp.idiw37
WHERE wc.idwkctr = $1
  AND i.wktype = $2
  AND ${PLANNER_DISPATCH_WHERE_MP}
  AND i.bscstart BETWEEN $3 AND $4`

export const MANHOUR_DISPATCHED_WO_BY_PERSON_SQL = `
SELECT wc.wkctr, i.wktype, COUNT(DISTINCT i.idiw37)::text AS n
FROM app.tbplangingwork mp
INNER JOIN app.tbworkcenter wc ON wc.wkctr = mp.wkctr
INNER JOIN app.tbiw37n i ON i.idiw37 = mp.idiw37
WHERE i.wktype = ANY($1)
  AND ${PLANNER_DISPATCH_WHERE_MP}
  AND i.bscstart BETWEEN $2 AND $3
GROUP BY wc.wkctr, i.wktype`

export const PERSONNEL_ASSIGNED_PLAN_COUNT_SQL = `
SELECT
  CASE WHEN i.syst IN ('CRTD', 'REL') THEN 'open' ELSE 'closed' END AS syst,
  COUNT(DISTINCT i.idiw37)::text AS n
FROM app.tbplangingwork mp
INNER JOIN app.tbworkcenter wc ON wc.wkctr = mp.wkctr
INNER JOIN app.tbiw37n i ON i.idiw37 = mp.idiw37
WHERE wc.idwkctr = $1
GROUP BY 1`

export const PERSONNEL_ASSIGNED_PARTIAL_COUNT_SQL = `
SELECT COUNT(DISTINCT i.idiw37)::text AS n
FROM app.tbplangingwork mp
INNER JOIN app.tbworkcenter wc ON wc.wkctr = mp.wkctr
INNER JOIN app.tbiw37n i ON i.idiw37 = mp.idiw37
WHERE wc.idwkctr = $1
  AND i.syst IN ('CRTD', 'REL')
  AND EXISTS (
    SELECT 1 FROM app.tbwrkclose w
    WHERE w.idiw37 = i.idiw37
      AND w.wkctr = mp.wkctr
      AND w.close_kind = 'partial'
      AND NOT EXISTS (
        SELECT 1 FROM app.tbwrkclose c
        WHERE c.idiw37 = i.idiw37
          AND c.wkctr = w.wkctr
          AND c.close_kind = 'complete'
      )
  )`

export const PERSONNEL_ASSIGNED_RECENT_OPEN_SQL = `
SELECT i.idiw37, i.wkorder, i.wktype, i.operationshorttext, i.functionalloc, i.equdescrip,
       i.bscstart::text AS bscstart, i.syst
FROM app.tbplangingwork mp
INNER JOIN app.tbworkcenter wc ON wc.wkctr = mp.wkctr
INNER JOIN app.tbiw37n i ON i.idiw37 = mp.idiw37
WHERE wc.idwkctr = $1 AND i.syst IN ('CRTD', 'REL')
ORDER BY i.bscstart DESC NULLS LAST
LIMIT 5`

/** Scheduling — filter by assigned technician (tbplangingwork only, not SAP import wkctr). */
export function appendCalendarAssignedWkctrFilter(
  wkctrs: string[] | undefined,
  orderAlias: string,
  params: unknown[],
): string {
  const list = (wkctrs ?? []).map((v) => v.trim()).filter(Boolean)
  if (list.length === 0) return ''
  const alias = orderAlias.trim()
  if (!alias) {
    throw new Error('appendCalendarAssignedWkctrFilter requires a non-empty order table alias')
  }
  const o = `${alias}.`
  const start = params.length + 1
  const placeholders = list.map((_, i) => `$${start + i}`).join(', ')
  params.push(...list)
  return ` AND EXISTS (
    SELECT 1 FROM app.tbplangingwork mpw
    WHERE mpw.idiw37 = ${o}idiw37
      AND mpw.wkctr IN (${placeholders})
      AND ${PLANNER_DISPATCH_WHERE_MPW}
  )`
}
