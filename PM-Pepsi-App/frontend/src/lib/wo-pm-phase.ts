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
    label: 'Create',
    title: 'Create (CRTD) — แผนใหม่จาก SAP ยังไม่ assign ช่าง',
    className: 'border-amber-300 bg-amber-100 text-amber-950 ring-amber-200',
  },
  rel: {
    label: 'REL',
    title: 'REL — งานเปิด กำลังดำเนินการ',
    className: 'border-blue-300 bg-blue-100 text-blue-950 ring-blue-200',
  },
  confirm: {
    label: 'Confirm',
    title: 'Confirm — ปิดแล้ว พร้อมส่งกลับ SAP',
    className: 'border-emerald-300 bg-emerald-100 text-emerald-950 ring-emerald-200',
  },
}

export const PM_PHASE_FILTER_OPTIONS: { code: WoPmPhase; label: string }[] = [
  { code: 'create', label: 'Create (CRTD)' },
  { code: 'rel', label: 'REL' },
  { code: 'confirm', label: 'Confirm' },
]

export function pmPhaseCalendarClass(phase?: WoPmPhase): string {
  if (phase === 'create') return 'pm-cal-event--phase-create'
  if (phase === 'rel') return 'pm-cal-event--phase-rel'
  if (phase === 'confirm') return 'pm-cal-event--phase-confirm'
  return ''
}
