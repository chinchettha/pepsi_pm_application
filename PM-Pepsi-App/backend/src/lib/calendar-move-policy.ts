import { isPlanMovableStatus } from '../services/scheduling-shared.js'

/** วันที่แสดงบนปฏิทินเลยกำหนดแล้ว (เทียบสไลด์ — สีแดง) */
export function isCalendarDisplayDateOverdue(
  displayUnix: number,
  now: Date = new Date(),
): boolean {
  const d = new Date(displayUnix * 1000)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const displayDay = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  return displayDay.getTime() < today.getTime()
}

/** TECO ใน SAP แต่ยังไม่ปิดงาน/confirm ในโปรแกรม — แสดงระฆังบน block */
export function resolveCalendarTecoBellAlert(input: {
  syst?: string | null
  percentClose?: string | number | null
  hasConfirm?: string | number | boolean | null
  confirmQcStatus?: string | null
}): boolean {
  const syst = (input.syst ?? '').trim().toUpperCase()
  if (syst !== 'TECO') return false

  const raw = input.percentClose
  const pct =
    raw == null || raw === ''
      ? 0
      : Math.max(0, Math.min(100, Number(raw)))
  const qc = (input.confirmQcStatus ?? '').trim().toLowerCase()
  const hasConfirm =
    input.hasConfirm === true ||
    input.hasConfirm === 'true' ||
    input.hasConfirm === '1' ||
    (typeof input.hasConfirm === 'number' && input.hasConfirm > 0) ||
    (typeof input.hasConfirm === 'string' &&
      input.hasConfirm.trim() !== '' &&
      input.hasConfirm !== '0' &&
      input.hasConfirm.toLowerCase() !== 'false')

  if (qc === 'approved' || pct >= 100) return false
  return true
}

export function hasCalendarPlanMove(input: {
  cday?: string | number | null
  mpcount?: number | null
  syst?: string | null
}): boolean {
  const cday = input.cday != null && input.cday !== '' ? Number(input.cday) : 0
  const mpcount = input.mpcount != null ? Number(input.mpcount) : 0
  const syst = (input.syst ?? '').trim()
  return cday > 0 && mpcount >= 1 && (syst === 'REL' || syst === 'CRTD')
}

/**
 * เหตุผลย้ายแผน — บังคับเมื่อส้ม/แดง (ย้ายแล้วหรือเลยกำหนด)
 * ไม่บังคับเมื่องานม่วง/น้ำเงิน (CRTD/REL ปกติ)
 */
export function resolveCalendarMoveReasonRequired(input: {
  syst?: string | null
  displayUnix: number
  cday?: string | number | null
  mpcount?: number | null
}): boolean {
  if (!isPlanMovableStatus(input.syst)) return false
  if (hasCalendarPlanMove(input)) return true
  if (isCalendarDisplayDateOverdue(input.displayUnix)) return true
  return false
}
