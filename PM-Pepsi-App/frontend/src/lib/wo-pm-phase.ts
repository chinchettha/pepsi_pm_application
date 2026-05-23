/** สถานะ PM — ตรง backend `resolveWoPmPhase` + ประชุมครั้งที่ 2 */
export type WoPmPhase = 'create' | 'rel' | 'confirm'

export function resolveWoPmPhase(syst: string | null | undefined): WoPmPhase {
  const s = (syst ?? '').trim().toUpperCase()
  if (s === 'CRTD') return 'create'
  if (s === 'REL') return 'rel'
  return 'confirm'
}

export const WO_PM_PHASE_META: Record<
  WoPmPhase,
  { label: string; title: string; className: string }
> = {
  create: {
    label: 'สร้าง · CRTD',
    title: 'แผนใหม่ (CRTD) — จาก SAP ยังไม่ปิดงาน',
    className: 'border-amber-300 bg-amber-100 text-amber-950 ring-amber-200',
  },
  rel: {
    label: 'เปิด · REL',
    title: 'งานเปิด (REL) — ยังทำไม่เสร็จ',
    className: 'border-blue-300 bg-blue-100 text-blue-950 ring-blue-200',
  },
  confirm: {
    label: 'ปิด · Confirm',
    title: 'ปิดแล้ว (TECO/CLSD ฯลฯ) — พร้อมส่งกลับ SAP',
    className: 'border-emerald-300 bg-emerald-100 text-emerald-950 ring-emerald-200',
  },
}
