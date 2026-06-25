/**
 * สถานะ PM ตามประชุมครั้งที่ 2 — แยกจาก wktype (ZB/ZD)
 * Create = CRTD ยังไม่จ่ายช่าง · REL = จ่ายแล้ว/กำลังทำ · Confirm = ปิดแล้ว
 */
export type WoPmPhase = 'create' | 'rel' | 'confirm'

export const woPmPhaseSchema = ['create', 'rel', 'confirm'] as const

export type WoPmPhaseContext = {
  assignCount?: number
  percentClose?: number | string | null
  hasConfirm?: number | boolean | string | null
  confirmQcStatus?: string | null
}

function coalesceHasConfirm(v: number | boolean | string | null | undefined): boolean {
  if (v === true) return true
  if (typeof v === 'number' && v > 0) return true
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase()
    if (!s || s === '0' || s === 'false' || s === 'f') return false
    const n = Number(s)
    return Number.isFinite(n) ? n > 0 : true
  }
  return false
}

/** Confirm = SAP ปิดแล้ว หรือปิดงาน/ QC ในแอปแล้ว */
export function isWoPmPhaseConfirm(
  syst: string | null | undefined,
  ctx?: WoPmPhaseContext,
): boolean {
  const s = (syst ?? '').trim().toUpperCase()
  if (s && s !== 'CRTD' && s !== 'REL') return true

  const pct = Number(ctx?.percentClose ?? 0)
  if (Number.isFinite(pct) && pct >= 100) return true

  const qc = (ctx?.confirmQcStatus ?? '').trim().toLowerCase()
  if (qc === 'approved') return true

  return coalesceHasConfirm(ctx?.hasConfirm)
}

export function resolveWoPmPhase(
  syst: string | null | undefined,
  ctx?: WoPmPhaseContext,
): WoPmPhase {
  if (isWoPmPhaseConfirm(syst, ctx)) return 'confirm'

  const s = (syst ?? '').trim().toUpperCase()
  const assigned = Number(ctx?.assignCount ?? 0) > 0
  if (s === 'REL' || assigned) return 'rel'
  return 'create'
}
