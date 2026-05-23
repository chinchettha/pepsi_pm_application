import type { SummaryWeeklyRow } from '@/api/schemas'
import { format, startOfMonth, subDays } from 'date-fns'

/** ป้ายแกน X แบบ Excel: `PAC010 (Narit)` */
export function formatEngUtilizationLabel(
  wkctr: string,
  displayName: string | null | undefined,
): string {
  if (!displayName?.trim()) return wkctr
  const first = displayName.trim().split(/\s+/)[0]
  return first ? `${wkctr} (${first})` : wkctr
}

/** Total ใน Excel = %PM + %Reactive (ไม่รวม RCA) — ค่า 0–100 */
export function excelStylePercentTotal(percentPm: number, percentReactive: number): number {
  return Math.round((percentPm + percentReactive) * 100) / 100
}

export type EngUtilizationChartRow = {
  idwkctr: string
  label: string
  wkctr: string
  hasImage: boolean
  percentPm: number
  percentReactive: number
  percentRca: number
  percentTotalExcel: number
  pmHours: number
  reactiveHours: number
  rcaHours: number
  hrHour: number
  otHour: number
  woCount: number
}

/** ชั่วโมง HR สำหรับแสดงบนการ์ด — ทศนิยม 1 ตำแหน่ง */
export function formatEngUtilizationHrHour(hrHour: number): string {
  return hrHour.toLocaleString('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  })
}

export function toEngUtilizationChartRows(rows: SummaryWeeklyRow[]): EngUtilizationChartRow[] {
  return rows
    .filter((r) => r.hrHour > 0)
    .map((r) => ({
      idwkctr: r.idwkctr,
      label: formatEngUtilizationLabel(r.wkctr, r.displayName),
      wkctr: r.wkctr,
      hasImage: r.hasImage,
      percentPm: r.percentPm,
      percentReactive: r.percentReactive,
      percentRca: r.percentRca,
      percentTotalExcel: excelStylePercentTotal(r.percentPm, r.percentReactive),
      pmHours: r.pmHours,
      reactiveHours: r.reactiveHours,
      rcaHours: r.rcaWork,
      hrHour: r.hrHour,
      otHour: r.otHour,
      woCount: r.woCount,
    }))
}

export type EngUtilizationPeriodId = 'daily' | 'weekly' | 'monthly' | 'yearly'

export type EngUtilizationPeriodPreset = {
  id: EngUtilizationPeriodId
  label: string
  /** คำอธิบายช่วงที่ตั้งให้อัตโนมัติ */
  hint: string
}

/** เทียบแผ่น Summary Daily / Weekly / Monthly / Year ใน Eng Utilization 2026.xlsx */
export const ENG_UTILIZATION_PERIOD_PRESETS: readonly EngUtilizationPeriodPreset[] = [
  { id: 'daily', label: 'รายวัน', hint: 'เมื่อวาน' },
  { id: 'weekly', label: 'รายสัปดาห์', hint: '7 วันล่าสุด' },
  { id: 'monthly', label: 'รายเดือน', hint: 'ต้นเดือน – วันนี้' },
  { id: 'yearly', label: 'รายปี', hint: 'ปีก่อนหน้าเต็มปี' },
] as const

/** ปีเต็มสำหรับปุ่ม「รายปี」— ปีปฏิทินก่อนหน้าของวันอ้างอิง (เช่น 2026 → 2025) */
export function engUtilizationFullYear(refDate: Date = new Date()): number {
  return refDate.getFullYear() - 1
}

export function resolveEngUtilizationDateRange(
  periodId: EngUtilizationPeriodId,
  refDate: Date = new Date(),
): { from: string; to: string } {
  let from: Date
  let to: Date
  switch (periodId) {
    case 'daily': {
      const yesterday = subDays(refDate, 1)
      from = yesterday
      to = yesterday
      break
    }
    case 'weekly':
      from = subDays(refDate, 6)
      to = refDate
      break
    case 'monthly':
      from = startOfMonth(refDate)
      to = refDate
      break
    case 'yearly': {
      const y = engUtilizationFullYear(refDate)
      from = new Date(y, 0, 1)
      to = new Date(y, 11, 31)
      break
    }
  }
  return {
    from: format(from, 'yyyy-MM-dd'),
    to: format(to, 'yyyy-MM-dd'),
  }
}

/** ข้อความช่วงรายปีสำหรับ UI (เช่น `ปี 2025 เต็มปี`) */
export function engUtilizationYearlyHint(refDate: Date = new Date()): string {
  const y = engUtilizationFullYear(refDate)
  return `ปี ${y} เต็มปี (1 ม.ค. – 31 ธ.ค.)`
}

export function getEngUtilizationPeriodPreset(
  id: EngUtilizationPeriodId,
): EngUtilizationPeriodPreset {
  return ENG_UTILIZATION_PERIOD_PRESETS.find((p) => p.id === id)!
}
