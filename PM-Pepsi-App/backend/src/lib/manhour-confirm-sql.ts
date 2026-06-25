/**
 * Manhour "Confirm / Done" metrics — supervisor `tbcofirm` + technician `tbwrkclose`.
 * Legacy chart counted only `view_exportconfirm`; technicians close via `tbwrkclose` first.
 */
import { personnelIsActiveSql } from './personnel-active-sql.js'

/** Sum confirm minutes (supervisor + technician complete close, no double-count per WO+wkctr). */
export const MANHOUR_CONFIRM_MINUTES_SUM_SQL = `
SELECT COALESCE(SUM(src.mins), 0)::text AS total
FROM (
  SELECT c.timewk::numeric AS mins
  FROM app.view_exportconfirm c
  WHERE c.wkctr = $1 AND c.endate BETWEEN $2 AND $3
  UNION ALL
  SELECT w.wktimewk::numeric AS mins
  FROM app.tbwrkclose w
  WHERE w.wkctr = $1
    AND w.close_kind = 'complete'
    AND w.wktimeclose BETWEEN $2 AND $3
    AND NOT EXISTS (
      SELECT 1 FROM app.tbcofirm cf
      WHERE cf.idiw37 = w.idiw37 AND cf.wkctr = w.wkctr
    )
) src`

/** Distinct closed WO count; optional wktype filter ($2 = wktype, omit with NULL). */
export const MANHOUR_CONFIRMED_WO_COUNT_SQL = `
SELECT COUNT(DISTINCT src.idiw37)::text AS n
FROM (
  SELECT c.idiw37
  FROM app.view_exportconfirm c
  WHERE c.wkctr = $1
    AND ($2::text IS NULL OR c.wktype = $2)
    AND c.endate BETWEEN $3 AND $4
  UNION
  SELECT w.idiw37
  FROM app.tbwrkclose w
  INNER JOIN app.tbiw37n i ON i.idiw37 = w.idiw37
  WHERE w.wkctr = $1
    AND w.close_kind = 'complete'
    AND w.wktimeclose BETWEEN $3 AND $4
    AND ($2::text IS NULL OR i.wktype = $2)
) src`

/** Per-person confirmed counts grouped by wkctr + wktype (for zb-by-person). */
export const MANHOUR_CONFIRMED_WO_BY_PERSON_SQL = `
SELECT wkctr, wktype, COUNT(DISTINCT idiw37)::text AS n
FROM (
  SELECT c.wkctr, c.wktype, c.idiw37
  FROM app.view_exportconfirm c
  WHERE c.wktype = ANY($1) AND c.endate BETWEEN $2 AND $3
  UNION
  SELECT w.wkctr, i.wktype, w.idiw37
  FROM app.tbwrkclose w
  INNER JOIN app.tbiw37n i ON i.idiw37 = w.idiw37
  WHERE i.wktype = ANY($1)
    AND w.close_kind = 'complete'
    AND w.wktimeclose BETWEEN $2 AND $3
) src
GROUP BY wkctr, wktype`

/** `/worktime` — closed WO count by wktype ($1 = wktype[], $2/$3 = unix range). */
export const WORKTIME_CONFIRMED_COUNT_BY_WKTYPE_SQL = `
SELECT wktype, COUNT(DISTINCT idiw37)::text AS n
FROM (
  SELECT c.wktype, c.idiw37
  FROM app.view_exportconfirm c
  WHERE c.wktype = ANY($1) AND c.endate BETWEEN $2 AND $3
  UNION
  SELECT i.wktype, w.idiw37
  FROM app.tbwrkclose w
  INNER JOIN app.tbiw37n i ON i.idiw37 = w.idiw37
  WHERE i.wktype = ANY($1)
    AND w.close_kind = 'complete'
    AND w.wktimeclose BETWEEN $2 AND $3
) src
GROUP BY wktype`

/** `/worktime` PM summary — ZB02 closed WO in range ($1 = wktype, $2/$3 = unix). */
export const WORKTIME_PM_COMPLETED_COUNT_SQL = `
SELECT COUNT(DISTINCT idiw37)::text AS n
FROM (
  SELECT c.idiw37
  FROM app.view_exportconfirm c
  WHERE c.wktype = $1 AND c.endate BETWEEN $2 AND $3
  UNION
  SELECT w.idiw37
  FROM app.tbwrkclose w
  INNER JOIN app.tbiw37n i ON i.idiw37 = w.idiw37
  WHERE i.wktype = $1
    AND w.close_kind = 'complete'
    AND w.wktimeclose BETWEEN $2 AND $3
) src`

/** Total confirm minutes in range — supervisor + technician ($1/$2 = unix). */
export const WORKTIME_CONFIRM_MINUTES_SUM_SQL = `
SELECT COALESCE(SUM(src.mins), 0)::text AS total
FROM (
  SELECT c.timewk::numeric AS mins
  FROM app.view_exportconfirm c
  WHERE c.endate BETWEEN $1 AND $2
  UNION ALL
  SELECT w.wktimewk::numeric AS mins
  FROM app.tbwrkclose w
  WHERE w.close_kind = 'complete'
    AND w.wktimeclose BETWEEN $1 AND $2
    AND NOT EXISTS (
      SELECT 1 FROM app.tbcofirm cf
      WHERE cf.idiw37 = w.idiw37 AND cf.wkctr = w.wkctr
    )
) src`

/** Per-technician confirm stats ($1 = wktype[], $2/$3 = unix). */
export const WORKTIME_TECHNICIAN_CONFIRM_STATS_SQL = `
SELECT
  wc.idwkctr,
  wc.wkctr,
  NULLIF(TRIM(CONCAT(
    COALESCE(wc.titlewkctr,''),
    COALESCE(wc.namewkctr,''),
    ' ',
    COALESCE(wc.surnamewkctr,'')
  )), '') AS display_name,
  (octet_length(wc.imgmember_data) > 0) AS has_image,
  COUNT(DISTINCT src.idiw37)::text AS completed_orders,
  COALESCE(SUM(src.mins), 0)::text AS confirm_minutes
FROM (
  SELECT c.wkctr, c.idiw37, c.timewk::numeric AS mins
  FROM app.view_exportconfirm c
  WHERE c.wktype = ANY($1) AND c.endate BETWEEN $2 AND $3
  UNION ALL
  SELECT w.wkctr, w.idiw37, w.wktimewk::numeric AS mins
  FROM app.tbwrkclose w
  INNER JOIN app.tbiw37n i ON i.idiw37 = w.idiw37
  WHERE i.wktype = ANY($1)
    AND w.close_kind = 'complete'
    AND w.wktimeclose BETWEEN $2 AND $3
    AND NOT EXISTS (
      SELECT 1 FROM app.tbcofirm cf
      WHERE cf.idiw37 = w.idiw37 AND cf.wkctr = w.wkctr
    )
) src
INNER JOIN app.tbworkcenter wc ON wc.wkctr = src.wkctr
WHERE ${personnelIsActiveSql('wc')}
GROUP BY wc.idwkctr, wc.wkctr, wc.titlewkctr, wc.namewkctr, wc.surnamewkctr, wc.imgmember_data
ORDER BY COALESCE(SUM(src.mins), 0) DESC
LIMIT 25`

/** Eng utilization confirm minutes by wkctr ($1/$2 = unix). */
export const ENG_UTIL_CONFIRM_MINUTES_BY_WKCTR_SQL = `
SELECT
  src.wkctr,
  COALESCE(SUM(CASE WHEN src.wktype = 'ZB02' THEN src.mins ELSE 0 END), 0)::text AS pm_minutes,
  COALESCE(SUM(CASE WHEN src.wktype = 'ZB05' THEN src.mins ELSE 0 END), 0)::text AS reactive_minutes,
  COALESCE(SUM(CASE WHEN src.wktype = 'ZB01' THEN src.mins ELSE 0 END), 0)::text AS rca_minutes
FROM (
  SELECT c.wkctr, c.wktype, c.timewk::numeric AS mins
  FROM app.view_exportconfirm c
  WHERE c.endate BETWEEN $1 AND $2
    AND c.wktype IN ('ZB01','ZB02','ZB05')
  UNION ALL
  SELECT w.wkctr, i.wktype, w.wktimewk::numeric AS mins
  FROM app.tbwrkclose w
  INNER JOIN app.tbiw37n i ON i.idiw37 = w.idiw37
  WHERE w.close_kind = 'complete'
    AND w.wktimeclose BETWEEN $1 AND $2
    AND i.wktype IN ('ZB01','ZB02','ZB05')
    AND NOT EXISTS (
      SELECT 1 FROM app.tbcofirm cf
      WHERE cf.idiw37 = w.idiw37 AND cf.wkctr = w.wkctr
    )
) src
GROUP BY src.wkctr`

/** Minutes stored as Min — convert to hours for utilization vs tbmanhours (hours). */
export function manhourConfirmMinutesToHours(totalMinutes: number): number {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return 0
  return Math.round((totalMinutes / 60) * 100) / 100
}
