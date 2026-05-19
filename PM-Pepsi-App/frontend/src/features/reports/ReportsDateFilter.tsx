import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { format, subDays } from 'date-fns'
import { Search } from 'lucide-react'
import { useState } from 'react'

export type ReportsDateFilterValue = {
  from: string
  to: string
  weeksBack?: number
}

export function defaultReportsDateRange(days = 30): ReportsDateFilterValue {
  const to = new Date()
  const from = subDays(to, days)
  return {
    from: format(from, 'yyyy-MM-dd'),
    to: format(to, 'yyyy-MM-dd'),
  }
}

type Props = {
  initial?: ReportsDateFilterValue
  showWeeksBack?: boolean
  onSearch: (value: ReportsDateFilterValue) => void
}

export function ReportsDateFilter({ initial, showWeeksBack, onSearch }: Props) {
  const base = initial ?? defaultReportsDateRange()
  const [fromDate, setFromDate] = useState(base.from)
  const [toDate, setToDate] = useState(base.to)
  const [weeksBack, setWeeksBack] = useState(String(base.weeksBack ?? 8))

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="space-y-1">
        <Label htmlFor="reports-from">เริ่มวันที่</Label>
        <DatePicker id="reports-from" value={fromDate} onChange={setFromDate} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="reports-to">ถึงวันที่</Label>
        <DatePicker id="reports-to" value={toDate} onChange={setToDate} />
      </div>
      {showWeeksBack ? (
        <div className="space-y-1">
          <Label htmlFor="reports-weeks">สัปดาห์ย้อนหลัง (ถ้าไม่ระบุวัน)</Label>
          <Input
            id="reports-weeks"
            type="number"
            min={4}
            max={16}
            className="w-24"
            value={weeksBack}
            onChange={(e) => setWeeksBack(e.target.value)}
          />
        </div>
      ) : null}
      <Button
        type="button"
        onClick={() =>
          onSearch({
            from: fromDate,
            to: toDate,
            weeksBack: showWeeksBack ? Number(weeksBack) || 8 : undefined,
          })
        }
        disabled={!fromDate || !toDate}
      >
        <Search className="mr-2 size-4" />
        ค้นหา
      </Button>
    </div>
  )
}
