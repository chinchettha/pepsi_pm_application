/**
 * KPI "ปิดแล้ว" บน dashboard / board — นับหลัง Foreman อนุมัติ QC เท่านั้น
 * @see database/migrations/080_tbiw37n_confirm_qc.sql
 * @see docs/customer-requirements/CONFIRM-QC-FLOW.md
 */
export function dashboardClosedWhere(alias = 'i'): string {
  const a = alias.trim() || 'i'
  return `${a}.actfinish IS NOT NULL
     AND LOWER(TRIM(COALESCE(${a}.confirm_qc_status, ''))) = 'approved'`
}

export function dashboardQcApprovedWhere(alias = 'i'): string {
  const a = alias.trim() || 'i'
  return `LOWER(TRIM(COALESCE(${a}.confirm_qc_status, ''))) = 'approved'`
}

/** Unix วันที่ปิดงาน — actfinish · confirm_qc_at · ช่างปิด (tbwrkclose) */
export function dashboardClosedEventSecExpr(alias = 'i'): string {
  const a = alias.trim() || 'i'
  return `COALESCE(
    NULLIF(${a}.actfinish, 0),
    FLOOR(EXTRACT(EPOCH FROM ${a}.confirm_qc_at))::bigint,
    (SELECT MAX(w.wktimeclose) FROM app.tbwrkclose w
     WHERE w.idiw37 = ${a}.idiw37 AND w.close_kind = 'complete')
  )`
}
