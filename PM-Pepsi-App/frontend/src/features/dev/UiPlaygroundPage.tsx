import { AppCard, AppTableShell } from '@/components/layout/AppCard'
import { AppPageShell } from '@/components/layout/AppPageShell'
import { KpiStatCard } from '@/components/kpi/KpiStatCard'
import { KpiStatGrid } from '@/components/kpi/KpiStatGrid'
import { WoPmPhaseLegend } from '@/components/scheduling/WoPmPhaseBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Spinner, SpinnerBlock } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toastSuccess } from '@/lib/app-toast'
import { Inbox } from 'lucide-react'

/** ตัวอย่าง component U0 — มีเฉพาะ `import.meta.env.DEV` ที่ `/dev/ui` */
export function UiPlaygroundPage() {
  return (
    <AppPageShell
      title="UI Playground"
      description="ตัวอย่าง component มาตรฐาน — ใช้เป็นต้นแบบหน้าใหม่ (ไม่ขึ้น production menu)"
      headerActions={
        <Button type="button" size="sm" onClick={() => toastSuccess('บันทึกแล้ว')}>
          ทดสอบ Toast
        </Button>
      }
      contentClassName="space-y-8"
    >
      <section className="space-y-3">
        <h2 className="text-heading-section">KPI แถว</h2>
        <KpiStatGrid>
          <KpiStatCard tone="amber" label="WorkOrder" value={128} footer="Completion 72%" />
          <KpiStatCard tone="emerald" label="Team A" value={45} />
          <KpiStatCard tone="rose" label="Team B" value={38} />
        </KpiStatGrid>
      </section>

      <section className="space-y-3">
        <h2 className="text-heading-section">การ์ด & ฟิลเตอร์</h2>
        <AppCard pad="compact" className="max-w-md space-y-3">
          <FormField label="Work Order" htmlFor="wo-demo" hint="ค้นหาแล้วกด Search">
            <Input id="wo-demo" placeholder="เช่น 10001234" />
          </FormField>
          <Button type="button" size="sm">
            Search
          </Button>
        </AppCard>
      </section>

      <section className="space-y-3">
        <h2 className="text-heading-section">สถานะ WO</h2>
        <p className="text-caption text-app-muted">
          Badge มีข้อความไทย + รหัส SAP — ไม่ใช้สีอย่างเดียว (ดู aria-label บน badge)
        </p>
        <WoPmPhaseLegend />
      </section>

      <section className="space-y-3">
        <h2 className="text-heading-section">Accessibility (U3)</h2>
        <AppCard pad="compact" className="app-glass-readable max-w-lg space-y-3">
          <p className="text-body-sm text-app">
            ข้อความบนพื้น glass — contrast เป้า WCAG AA (ตัวอย่าง)
          </p>
          <p className="text-caption text-app-muted">ข้อความรอง — อ่านได้บนพื้นโปร่ง</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm">
              ปุ่ม primary
            </Button>
            <Button type="button" size="sm" variant="outline">
              ปุ่ม outline
            </Button>
            <a href="#wo-demo" className="text-body-sm font-medium text-[var(--app-accent)] underline">
              ลิงก์ตัวอย่าง
            </a>
          </div>
          <p className="text-caption text-app-muted">กด Tab เพื่อดู focus ring บนปุ่มและลิงก์</p>
        </AppCard>
      </section>

      <section className="space-y-3">
        <h2 className="text-heading-section">ตาราง</h2>
        <AppTableShell className="max-h-48 overflow-auto">
          <Table embedded stickyHeader zebra>
            <TableHeader>
              <TableRow>
                <TableHead>Work Order</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((n) => (
                <TableRow key={n}>
                  <TableCell>WO{n}00000</TableCell>
                  <TableCell>
                    <Badge variant="outline">REL</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AppTableShell>
      </section>

      <section className="space-y-3">
        <h2 className="text-heading-section">โหลด & ว่าง</h2>
        <SpinnerBlock label="กำลังโหลดตัวอย่าง…" className="py-4" />
        <EmptyState
          icon={Inbox}
          title="ยังไม่มีข้อมูล"
          description="ข้อความไทยสั้น ๆ + CTA ถ้าต้องการ"
          action={{ label: 'ลองใหม่', onClick: () => toastSuccess('รีเฟรชแล้ว') }}
        />
      </section>

      <section className="rounded-card border border-dashed border-app bg-app-subtle p-4 text-caption text-app-muted">
        หน้า Admin ใช้ <code className="text-code">AdminPageShell</code> แทน — ดู{' '}
        <code className="text-code">docs/customer-requirements/NEW-PAGE-GUIDE.md</code>
      </section>
    </AppPageShell>
  )
}
