import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const TH_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
] as const

function buildYearOptions(min: number, max: number): number[] {
  const lo = Math.min(min, max)
  const hi = Math.max(min, max)
  return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)
}

export type CalendarPeriodPickerProps = {
  year: number
  month: number
  onChange: (year: number, month: number) => void
  /** ปีต่ำสุดใน dropdown (ค่าเริ่มต้น: ปีปัจจุบัน − 20) */
  yearMin?: number
  /** ปีสูงสุดใน dropdown (ค่าเริ่มต้น: ปีปัจจุบัน + 2) */
  yearMax?: number
  className?: string
}

export function CalendarPeriodPicker({
  year,
  month,
  onChange,
  yearMin,
  yearMax,
  className,
}: CalendarPeriodPickerProps) {
  const now = new Date()
  const minY = yearMin ?? now.getFullYear() - 20
  const maxY = yearMax ?? now.getFullYear() + 2
  const years = buildYearOptions(minY, maxY)

  const clampYear = (y: number) => Math.min(maxY, Math.max(minY, y))

  const goToday = () => {
    onChange(now.getFullYear(), now.getMonth() + 1)
  }

  const shiftYear = (delta: number) => {
    onChange(clampYear(year + delta), month)
  }

  const shiftMonth = (delta: number) => {
    let y = year
    let m = month + delta
    while (m < 1) {
      m += 12
      y -= 1
    }
    while (m > 12) {
      m -= 12
      y += 1
    }
    onChange(clampYear(y), m)
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-end gap-3 rounded-card border border-app bg-app-subtle/80 px-3 py-3',
        className,
      )}
    >
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 shrink-0"
          aria-label="ปีก่อนหน้า"
          onClick={() => shiftYear(-1)}
        >
          <ChevronLeft className="size-4" aria-hidden />
        </Button>
        <div className="space-y-1">
          <Label htmlFor="cal-pick-year" className="text-xs text-app-muted">
            ปี
          </Label>
          <select
            id="cal-pick-year"
            className="h-9 min-w-[5.5rem] rounded-button border border-app bg-white px-2 text-body-sm shadow-sm"
            value={year}
            onChange={(e) => onChange(clampYear(Number(e.target.value)), month)}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 shrink-0"
          aria-label="ปีถัดไป"
          onClick={() => shiftYear(1)}
        >
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>

      <div className="space-y-1">
        <Label htmlFor="cal-pick-month" className="text-xs text-app-muted">
          เดือน
        </Label>
        <select
          id="cal-pick-month"
          className="h-9 min-w-[9.5rem] rounded-button border border-app bg-white px-2 text-body-sm shadow-sm"
          value={month}
          onChange={(e) => onChange(year, Number(e.target.value))}
        >
          {TH_MONTHS.map((name, idx) => (
            <option key={name} value={idx + 1}>
              {idx + 1} — {name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2 pb-1">
        <Button type="button" variant="outline" size="sm" onClick={() => shiftMonth(-1)}>
          ‹ เดือนก่อน
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => shiftMonth(1)}>
          เดือนถัดไป ›
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={goToday}>
          เดือนนี้
        </Button>
      </div>

      <p className="w-full text-caption sm:w-auto sm:flex-1 sm:text-right">
        เลือกปี/เดือนตรงนี้ — ไม่ต้องกดลูกศรบนปฏิทินทีละเดือน
      </p>
    </div>
  )
}
