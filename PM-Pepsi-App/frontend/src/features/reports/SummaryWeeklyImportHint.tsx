import type { ReportsImportCoverage } from '@/api/schemas'
import { Button } from '@/components/ui/button'

type Props = {
  coverage: ReportsImportCoverage
  rowCount: number
  onApplySapRange: (from: string, to: string) => void
}

export function SummaryWeeklyImportHint({ coverage, rowCount, onApplySapRange }: Props) {
  const hasSap = coverage.iw37nCount > 0
  const hasMh = coverage.manhourCount > 0
  const emptyInRange =
    rowCount === 0 && coverage.workOrdersInRange === 0 && (hasSap || hasMh)
  const wrongRange = hasSap && !coverage.rangeOverlapsSap && coverage.suggestedSapRange

  if (!hasSap && !hasMh) {
    return (
      <div className="rounded-card border border-amber-200 bg-amber-50 px-4 py-3 text-body-sm text-amber-900">
        ยังไม่มีข้อมูล IW37N / manhour ในระบบ — นำเข้า SAP ที่{' '}
        <strong>/integration</strong> หรือบันทึก manhour ก่อน แล้วเลือกช่วงวันที่ให้ครอบข้อมูล
      </div>
    )
  }

  if (!emptyInRange && !wrongRange) {
    return (
      <div className="rounded-card border border-emerald-200 bg-emerald-50 px-4 py-3 text-body-sm text-emerald-900">
        ข้อมูลรายงานจาก DB หลัง import — IW37N {coverage.iw37nCount.toLocaleString()} แถว
        {coverage.iw37nBscstartFrom && coverage.iw37nBscstartTo
          ? ` · แผนงาน ${coverage.iw37nBscstartFrom} – ${coverage.iw37nBscstartTo}`
          : ''}
        {hasMh && coverage.manhourWorkdayFrom && coverage.manhourWorkdayTo
          ? ` · Manhour ${coverage.manhourWorkdayFrom} – ${coverage.manhourWorkdayTo}`
          : ''}
        {coverage.workOrdersInRange > 0
          ? ` · WO ในช่วงที่เลือก ${coverage.workOrdersInRange.toLocaleString()} ใบ`
          : ''}
      </div>
    )
  }

  const suggested = coverage.suggestedSapRange

  return (
    <div className="rounded-card border border-amber-200 bg-amber-50 px-4 py-3 text-body-sm text-amber-900 space-y-2">
      <p>
        ช่วงวันที่ที่เลือกไม่ทับข้อมูล SAP ใน DB
        {coverage.iw37nBscstartFrom && coverage.iw37nBscstartTo
          ? ` (ข้อมูล IW37N อยู่ ${coverage.iw37nBscstartFrom} – ${coverage.iw37nBscstartTo})`
          : ''}
        — รายงานสัปดาห์จึงว่างหรือไม่ตรงหลัง import
      </p>
      {suggested ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-amber-300 bg-white"
          onClick={() => onApplySapRange(suggested.from, suggested.to)}
        >
          ใช้ช่วงข้อมูล SAP ({suggested.from} – {suggested.to})
        </Button>
      ) : null}
      {!hasMh ? (
        <p className="text-xs text-amber-800">
          ยังไม่มี manhour — ตาราง %PM/%Reactive ต้องมี HR hour จาก manhour ในช่วงเดียวกัน
        </p>
      ) : null}
    </div>
  )
}
