import { AppCard, AppTableShell } from '@/components/layout/AppCard'
import { AppPageShell } from '@/components/layout/AppPageShell'
import { KpiStatCard } from '@/components/kpi/KpiStatCard'
import { KpiStatGrid } from '@/components/kpi/KpiStatGrid'
import { WoPmPhaseLegend } from '@/components/scheduling/WoPmPhaseBadge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { DialogContentSize } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { SpinnerBlock } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  toastDeleted,
  toastError,
  toastInfo,
  toastSaved,
  toastSuccess,
  toastWarning,
} from '@/lib/app-toast'
import { Inbox } from 'lucide-react'
import { useState, type ReactNode } from 'react'

const DIALOG_SIZES: DialogContentSize[] = ['sm', 'md', 'lg', 'full']

const DIALOG_SIZE_HINT: Record<DialogContentSize, string> = {
  sm: 'max-w-md — confirm สั้น',
  md: 'max-w-lg — default',
  lg: 'max-w-2xl — WO modal ย่อ',
  full: '64rem max — WO modal ขยาย',
}

/** ตัวอย่าง component U0 — มีเฉพาะ `import.meta.env.DEV` ที่ `/dev/ui` */
export function UiPlaygroundPage() {
  const [dialogSize, setDialogSize] = useState<DialogContentSize | null>(null)

  return (
    <AppPageShell
      title="UI Playground"
      description="ตัวอย่าง component มาตรฐาน — ใช้เป็นต้นแบบหน้าใหม่ (ไม่ขึ้น production menu)"
      contentClassName="space-y-8"
    >
      <section className="space-y-4" aria-labelledby="ui-playground-overlays">
        <div>
          <h2 id="ui-playground-overlays" className="text-heading-section">
            Overlays & feedback (U4a/U4b)
          </h2>
          <p className="mt-1 text-caption text-app-muted">
            Sonner · AlertDialog · Dialog sizes · Sheet — ตรวจสอบ glass · Esc · focus · dark mode
          </p>
        </div>

        <AppCard pad="compact" className="space-y-6">
          <UiPlaygroundBlock
            title="Sonner"
            hint="AppToaster ใน main.tsx · lucide icons · brand CSS tokens · richColors off"
          >
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => toastSuccess('บันทึกแล้ว')}>
                success
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => toastError('ผิดพลาด', 'รายละเอียด')}>
                error
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => toastWarning('คำเตือน')}>
                warning
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => toastInfo('ข้อมูล')}>
                info
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => toastSaved()}>
                toastSaved()
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => toastDeleted()}>
                toastDeleted()
              </Button>
            </div>
          </UiPlaygroundBlock>

          <UiPlaygroundBlock
            title="AlertDialog"
            hint="ยืนยันอันตราย — Cancel + destructive · Esc ปิด · แทน window.confirm"
          >
            <div className="flex flex-wrap gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" size="sm" variant="outline">
                    destructive
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>ลบรายการนี้?</AlertDialogTitle>
                    <AlertDialogDescription>
                      การกระทำนี้ไม่สามารถย้อนกลับได้ ข้อมูลจะถูกลบถาวร
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                    <AlertDialogAction variant="destructive">ลบ</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" size="sm" variant="outline">
                    default action
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>ส่งแจ้งเตือน?</AlertDialogTitle>
                    <AlertDialogDescription>ระบบจะส่งข้อความไปยังกลุ่ม Telegram ที่เลือก</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                    <AlertDialogAction>ส่ง</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </UiPlaygroundBlock>

          <UiPlaygroundBlock
            title="Dialog"
            hint="DialogContent size= sm | md | lg | full · backdrop-blur overlay"
          >
            <div className="flex flex-wrap gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" size="sm" variant="outline">
                    md (trigger)
                  </Button>
                </DialogTrigger>
                <DialogContent size="md">
                  <DialogHeader>
                    <DialogTitle>Dialog ปกติ</DialogTitle>
                    <DialogDescription>size=&quot;md&quot; — ค่าเริ่มต้นเมื่อไม่ระบุ</DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
              {DIALOG_SIZES.map((size) => (
                <Button
                  key={size}
                  type="button"
                  size="sm"
                  variant={size === 'lg' || size === 'full' ? 'default' : 'outline'}
                  onClick={() => setDialogSize(size)}
                >
                  {size}
                </Button>
              ))}
            </div>
            <Dialog open={dialogSize != null} onOpenChange={(open) => !open && setDialogSize(null)}>
              <DialogContent
                size={dialogSize ?? 'md'}
                className={
                  dialogSize === 'full'
                    ? 'flex max-h-[min(85dvh,720px)] flex-col gap-0 overflow-hidden p-0'
                    : undefined
                }
              >
                {dialogSize === 'full' ? (
                  <>
                    <DialogHeader className="border-b border-app px-6 py-4">
                      <DialogTitle>size=&quot;full&quot;</DialogTitle>
                      <DialogDescription>{DIALOG_SIZE_HINT.full}</DialogDescription>
                    </DialogHeader>
                    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
                      <p className="text-body-sm text-app-muted">เนื้อหา scroll ภายใน — แบบ WO modal ขยาย</p>
                    </div>
                  </>
                ) : (
                  <DialogHeader>
                    <DialogTitle>size=&quot;{dialogSize}&quot;</DialogTitle>
                    <DialogDescription>
                      {dialogSize ? DIALOG_SIZE_HINT[dialogSize] : null}
                    </DialogDescription>
                  </DialogHeader>
                )}
              </DialogContent>
            </Dialog>
          </UiPlaygroundBlock>

          <UiPlaygroundBlock
            title="Sheet"
            hint="slide ขวา/ล่าง · focus trap · แทน FilterDateDrawer ad-hoc"
          >
            <div className="flex flex-wrap gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button type="button" size="sm" variant="outline">
                    side=right
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>ตัวกรอง (ขวา)</SheetTitle>
                    <SheetDescription>แผงรายละเอียดหรือเมนูย่อย</SheetDescription>
                  </SheetHeader>
                  <SheetBody className="py-4">
                    <FormField label="สถานะ" htmlFor="sheet-side-status">
                      <Input id="sheet-side-status" placeholder="เช่น REL" />
                    </FormField>
                  </SheetBody>
                  <SheetFooter>
                    <Button type="button" size="sm" onClick={() => toastSuccess('ใช้ตัวกรองแล้ว')}>
                      ใช้ตัวกรอง
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              <Sheet>
                <SheetTrigger asChild>
                  <Button type="button" size="sm" variant="outline">
                    side=bottom
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="gap-0 p-0">
                  <SheetHeader className="pr-12">
                    <SheetTitle>ช่วงวันที่ (ล่าง)</SheetTitle>
                    <SheetDescription>รูปแบบ FilterDateDrawer บนมือถือ</SheetDescription>
                  </SheetHeader>
                  <SheetBody className="py-4">
                    <p className="text-body-sm text-app-muted">เนื้อหาฟิลเตอร์ · scroll ได้</p>
                  </SheetBody>
                  <SheetFooter>
                    <Button
                      type="button"
                      className="w-full sm:w-auto"
                      onClick={() => toastSuccess('Apply')}
                    >
                      ใช้ตัวกรอง
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </UiPlaygroundBlock>
        </AppCard>
      </section>

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

function UiPlaygroundBlock({
  title,
  hint,
  children,
}: {
  title: string
  hint: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2 border-b border-app pb-5 last:border-0 last:pb-0">
      <div>
        <h3 className="text-body font-semibold text-app">{title}</h3>
        <p className="text-caption text-app-muted">{hint}</p>
      </div>
      {children}
    </div>
  )
}
