import { PageHeader } from '@/components/layout/PageHeader'
import { PlaceholderBlock } from '@/components/layout/PlaceholderBlock'
import { Button } from '@/components/ui/button'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

function Shell({
  title,
  description,
  phpModules,
  hint,
}: {
  title: string
  description: string
  phpModules: string[]
  hint?: ReactNode
}) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <PlaceholderBlock title="Parity กับระบบ PHP (sap/pages)">
        <ul className="list-inside list-disc space-y-1">
          {phpModules.map((m) => (
            <li key={m}>
              <code className="rounded bg-zinc-200 px-1">{m}</code>
            </li>
          ))}
        </ul>
        {hint ? <div className="mt-4">{hint}</div> : null}
      </PlaceholderBlock>
    </div>
  )
}

/** `index.php?module=line_calendar` — คนละมุมกับปฏิทินรายเดือน */
export function LineCalendarParityPage() {
  return (
    <Shell
      title="ปฏิทินเส้น / Line scheduling"
      description="เทียบ `line_calendar.php` (default บน index.php) — มุมมองเส้นเวลา / resource"
      phpModules={['line_calendar.php']}
      hint={
        <Button variant="outline" size="sm" asChild>
          <Link to="/calendar">ไปปฏิทินรายเดือน (mock) ชั่วคราว</Link>
        </Button>
      }
    />
  )
}

/** Admin: `M_confirmation.php` — ช่าง: ใช้ `W_planwork_view` เป็นเมนู Confirmation ในเมนูสำรอง */
export function ConfirmationParityPage() {
  return (
    <Shell
      title="รับรอง / Confirmation"
      description="เทียบเมนู Confirmation — ผู้ดูแล: `M_confirmation.php`; ช่าง/ผู้ใช้: flow จาก `W_planwork_view.php`"
      phpModules={['M_confirmation.php', 'W_planwork_view.php']}
      hint={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/planning">แผนงาน (ใกล้เคียง W_planwork_view)</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/work-orders">ใบงาน / WO</Link>
          </Button>
        </div>
      }
    />
  )
}

/** `W_worktime_view.php` */
export function WorktimeViewParityPage() {
  return (
    <Shell
      title="ดู Worktime ทั้งหมด"
      description="เทียบ `W_worktime_view.php` — รายการชั่วโมง/ช่วงเวลา"
      phpModules={['W_worktime_view.php']}
      hint={
        <Button variant="outline" size="sm" asChild>
          <Link to="/manhours">Manhours (mock)</Link>
        </Button>
      }
    />
  )
}

/** `W_manhours_hr.php` */
export function ManhoursHrParityPage() {
  return (
    <Shell
      title="Manhour HR"
      description="เทียบ `W_manhours_hr.php` — รายงาน manhour ฝั่ง HR"
      phpModules={['W_manhours_hr.php']}
      hint={
        <Button variant="outline" size="sm" asChild>
          <Link to="/reports">รายงานรวม</Link>
        </Button>
      }
    />
  )
}

/** `W_summary_weekly*.php` */
export function SummaryWeeklyParityPage() {
  return (
    <Shell
      title="สรุปรายสัปดาห์"
      description="เทียบ `W_summary_weekly.php` และชุด chart ที่เกี่ยวข้อง"
      phpModules={['W_summary_weekly.php', 'W_summary_weekly_chart.php', 'W_summary_weekly_chart_full.php']}
      hint={
        <Button variant="outline" size="sm" asChild>
          <Link to="/reports">รายงาน / กราฟ (mock)</Link>
        </Button>
      }
    />
  )
}
