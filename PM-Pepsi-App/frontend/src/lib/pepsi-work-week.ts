/** สัปดาห์ทำงาน Pepsi — สอดคล้อง backend `pepsi-work-week.ts` */

export function describePepsiWorkWeekLabel(label: string): string {
  const m = /^(\d{4})-W(\d{2})$/.exec(label)
  if (!m) return label
  const year = Number(m[1])
  const week = Number(m[2])
  const startDoy = (week - 1) * 7 + 1
  const endDoy = startDoy + 6
  const start = doyToDate(year, startDoy)
  const end = doyToDate(year, endDoy)
  const fmt = new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short' })
  return `สัปดาห์ที่ ${week}/${year} (${fmt.format(start)} – ${fmt.format(end)})`
}

export const PEPSI_WORK_WEEK_HELP =
  'สัปดาห์ทำงานนับจาก 1 ม.ค. = สัปดาห์ที่ 1 (7 วันต่อสัปดาห์ · ไม่ใช่ ISO week)'

function doyToDate(year: number, doy: number): Date {
  const d = new Date(Date.UTC(year, 0, doy, 12, 0, 0))
  return new Date(d.getTime())
}
