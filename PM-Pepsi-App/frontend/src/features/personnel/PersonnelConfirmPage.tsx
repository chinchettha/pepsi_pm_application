/**
 * Personnel Confirmation Dashboard — เทียบ PHP `M_personel_confirm.php`
 *
 * - Admin only — ดู % การปิดงานของช่างต่อ WO (อ่าน `view_countpersonelclose`)
 * - Filter: text search + status (ทั้งหมด/ยังไม่เริ่ม/กำลังทำ/เสร็จ)
 * - แต่ละแถวมีปุ่ม Confirm ที่เปิด `WorkOrderDetailDialog` ด้วย `initialTab="confirm"`
 *   (เทียบ `M_personel_confirm_form.php` ที่เป็น modal 4 แท็บ)
 */
import { AppCard } from '@/components/layout/AppCard'
import { AppPageShell } from '@/components/layout/AppPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MassConfirmBar, MASS_CONFIRM_MAX } from '@/components/confirmation/MassConfirmBar'
import { WorkOrderDetailDialog } from '@/components/scheduling/WorkOrderDetailDialog'
import { getStoredAuthUser } from '@/features/auth/login-api'
import { fetchPersonnelConfirm } from '@/lib/api-public'
import { useAnyPermission } from '@/lib/use-permission'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  CheckCircle2,
  CircleDashed,
  ClipboardList,
  Filter,
  RefreshCcw,
  Search,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

type StatusFilter = 'all' | 'not_started' | 'in_progress' | 'done' | 'qc_pending'

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'qc_pending', label: 'รอ Admin QC' },
  { id: 'not_started', label: 'ยังไม่เริ่ม' },
  { id: 'in_progress', label: 'กำลังทำ' },
  { id: 'done', label: 'ปิดครบ' },
]

function QcStatusBadge({ status }: { status: string | null }) {
  if (!status) return null
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-900 ring-amber-200',
    approved: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    rejected: 'bg-red-100 text-red-800 ring-red-200',
  }
  const label =
    status === 'pending'
      ? 'รอ QC'
      : status === 'approved'
        ? 'QC ผ่าน'
        : 'ส่งกลับ'
  return (
    <span
      className={`inline-flex rounded px-2 py-1 text-badge font-medium ring-1 ${map[status] ?? ''}`}
    >
      {label}
    </span>
  )
}

function ProgressBar({ percent }: { percent: number }) {
  const safe = Math.max(0, Math.min(100, Math.round(percent || 0)))
  const color =
    safe >= 100
      ? 'bg-emerald-600'
      : safe >= 60
        ? 'bg-blue-600'
        : safe > 0
          ? 'bg-amber-500'
          : 'bg-[var(--app-border)]'
  return (
    <div
      className="h-5 w-full overflow-hidden rounded bg-app-muted ring-1 ring-app"
      title={`${safe}%`}
    >
      <div
        className={`flex h-full items-center justify-center text-badge font-medium text-white transition-all ${color}`}
        style={{ width: `${safe}%`, minWidth: safe > 0 ? '1.5rem' : 0 }}
      >
        {safe > 0 ? `${safe}%` : ''}
      </div>
    </div>
  )
}

function SystBadge({ syst }: { syst: string | null }) {
  if (!syst) return <span className="text-xs text-app-muted">—</span>
  const map: Record<string, string> = {
    CRTD: 'bg-amber-100 text-amber-800 ring-amber-200',
    REL: 'bg-blue-100 text-blue-800 ring-blue-200',
    TECO: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    COMP: 'bg-app-muted text-app ring-app',
  }
  const cls = map[syst] ?? 'bg-app-muted text-app ring-app'
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-1 text-badge font-medium ring-1 ${cls}`}
    >
      {syst}
    </span>
  )
}

export function PersonnelConfirmPage() {
  const navigate = useNavigate()
  const authUser = getStoredAuthUser()
  const canConfirmRead =
    useAnyPermission(['personnel.confirm.read', 'personnel.write']) || authUser?.userst === 'A'

  useEffect(() => {
    if (!canConfirmRead) {
      toast.error('ไม่มีสิทธิ์เข้าถึง')
      navigate('/personnel', { replace: true })
    }
  }, [canConfirmRead, navigate])

  const [qInput, setQInput] = useState('')
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set())

  const listQ = useQuery({
    queryKey: ['personnel', 'confirm', 'list', q, status],
    queryFn: () =>
      fetchPersonnelConfirm({
        q: q || undefined,
        status,
        limit: 500,
      }),
    enabled: canConfirmRead,
    staleTime: 15_000,
    placeholderData: keepPreviousData,
  })

  const items = useMemo(() => listQ.data?.items ?? [], [listQ.data])
  const summary = listQ.data?.summary
  const errorMessage =
    listQ.error instanceof Error ? listQ.error.message : null

  const onSubmitSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setQ(qInput.trim())
    setSelectedIds(new Set())
  }

  const pageIds = useMemo(() => items.map((it) => it.idiw37), [items])
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id))

  const toggleSelectAllPage = () => {
    if (allPageSelected) {
      setSelectedIds(new Set())
      return
    }
    const next = new Set(pageIds.slice(0, MASS_CONFIRM_MAX))
    if (pageIds.length > MASS_CONFIRM_MAX) {
      toast.message(`เลือกได้สูงสุด ${MASS_CONFIRM_MAX} รายการ (SAP)`)
    }
    setSelectedIds(next)
  }

  const toggleSelectRow = (idiw37: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(idiw37)) {
        next.delete(idiw37)
        return next
      }
      if (next.size >= MASS_CONFIRM_MAX) {
        toast.error(`เลือกได้สูงสุด ${MASS_CONFIRM_MAX} รายการ`)
        return prev
      }
      next.add(idiw37)
      return next
    })
  }

  if (!canConfirmRead) {
    return (
      <AppPageShell title="ปิดงานรายบุคคล" description="สรุป % การปิดงานของช่างต่อ WO">
        <EmptyState
          icon={AlertCircle}
          title="ไม่มีสิทธิ์เข้าถึง"
          description={
            <>
              ต้องมีสิทธิ์ <code className="text-xs">personnel.confirm.read</code>
            </>
          }
        />
      </AppPageShell>
    )
  }

  return (
    <AppPageShell
      title="ปิดงานรายบุคคล"
      description="สรุป % การปิดงานของช่างต่อ WO (view_countpersonelclose)"
      contentClassName="space-y-4"
      headerActions={
        <>
          <Badge variant="secondary" className="text-xs">
            Admin / QC
          </Badge>
          <Button asChild variant="outline" size="sm">
            <Link to="/personnel">แดชบอร์ดส่วนตัว</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/users">จัดการผู้ใช้</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/confirmation">รับรองงาน</Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void listQ.refetch()}
            disabled={listQ.isFetching}
          >
            <RefreshCcw className="mr-2 size-3.5" aria-hidden />
            รีเฟรช
          </Button>
        </>
      }
    >
        {/* Summary cards */}
        <div className="grid gap-3 sm:grid-cols-4">
          <SummaryCard
            label="WO ที่เปิดทั้งหมด"
            value={summary?.totalOpen ?? 0}
            icon={ClipboardList}
            tone="neutral"
            isLoading={listQ.isLoading}
          />
          <SummaryCard
            label="ปิดครบทุกคน"
            value={summary?.fullyClosed ?? 0}
            icon={CheckCircle2}
            tone="emerald"
            isLoading={listQ.isLoading}
          />
          <SummaryCard
            label="กำลังทำ"
            value={summary?.inProgress ?? 0}
            icon={Users}
            tone="blue"
            isLoading={listQ.isLoading}
          />
          <SummaryCard
            label="ยังไม่เริ่ม"
            value={summary?.notStarted ?? 0}
            icon={CircleDashed}
            tone="amber"
            isLoading={listQ.isLoading}
          />
        </div>

        {/* Filters */}
        <AppCard pad="compact" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form onSubmit={onSubmitSearch} className="flex flex-1 items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-app-muted" />
              <Input
                placeholder="ค้นหา WO / Maintenance plan / Equipment / Description"
                className="pl-8"
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
              />
            </div>
            <Button type="submit" variant="default" size="sm">
              ค้นหา
            </Button>
            {q ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQInput('')
                  setQ('')
                }}
              >
                ล้าง
              </Button>
            ) : null}
          </form>
          <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
            <Filter className="size-4 text-app-muted" />
            {STATUS_TABS.map((t) => (
              <Button
                key={t.id}
                type="button"
                size="sm"
                variant={status === t.id ? 'default' : 'outline'}
                onClick={() => setStatus(t.id)}
              >
                {t.label}
                {summary
                  ? ` (${
                      t.id === 'all'
                        ? summary.totalOpen
                        : t.id === 'not_started'
                          ? summary.notStarted
                          : t.id === 'in_progress'
                            ? summary.inProgress
                            : summary.fullyClosed
                    })`
                  : ''}
              </Button>
            ))}
          </div>
        </AppCard>

        <MassConfirmBar
          selectedIds={[...selectedIds]}
          onClearSelection={() => setSelectedIds(new Set())}
          onComplete={() => void listQ.refetch()}
        />

        <AppCard pad="compact">
          {listQ.isLoading && !listQ.data ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded" />
              ))}
            </div>
          ) : errorMessage ? (
            <EmptyState
              icon={AlertCircle}
              title="โหลดรายการไม่สำเร็จ"
              description={errorMessage}
              action={{ label: 'ลองใหม่', onClick: () => void listQ.refetch() }}
            />
          ) : (
            <div className="app-table-shell overflow-x-auto">
            <Table embedded stickyHeader zebra>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      aria-label="เลือกทั้งหน้า"
                      checked={allPageSelected}
                      ref={(el) => {
                        if (el) {
                          el.indeterminate =
                            selectedIds.size > 0 && !allPageSelected
                        }
                      }}
                      onChange={toggleSelectAllPage}
                    />
                  </TableHead>
                  <TableHead className="w-[15%]">ปิด (%)</TableHead>
                  <TableHead>ใบงาน</TableHead>
                  <TableHead>แผนบำรุง</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>อุปกรณ์</TableHead>
                  <TableHead>แผน</TableHead>
                  <TableHead>แผนใหม่</TableHead>
                  <TableHead className="text-right">ดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="p-0">
                      <EmptyState
                        className="border-0 bg-transparent py-10"
                        title="ไม่พบใบงาน"
                        description="ลองเปลี่ยนตัวกรองหรือคำค้น"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((it) => (
                    <TableRow
                      key={it.idiw37}
                      className={selectedIds.has(it.idiw37) ? 'bg-emerald-50/40' : undefined}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          aria-label={`เลือก ${it.wkorder}`}
                          checked={selectedIds.has(it.idiw37)}
                          onChange={() => toggleSelectRow(it.idiw37)}
                        />
                      </TableCell>
                      <TableCell className="align-middle">
                        <div className="space-y-1">
                          <ProgressBar percent={it.percentClose} />
                          <div className="text-caption tabular-nums">
                            {it.closedCount}/{it.plannedCount} คน
                          </div>
                        </div>
                      </TableCell>
                      <TableCell title={it.shortText ?? ''}>
                        <button
                          type="button"
                          className="rounded px-2 py-1 text-xs font-medium ring-1 transition hover:brightness-95"
                          style={{
                            backgroundColor: it.wkstcolor ?? '#e2e8f0',
                            color: '#0f172a',
                            borderColor: it.wkstcolor ?? '#cbd5e1',
                          }}
                          onClick={() => setDetailId(String(it.idiw37))}
                        >
                          {it.wkorder}
                        </button>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <SystBadge syst={it.syst} />
                          <QcStatusBadge status={it.qcStatus} />
                        </div>
                      </TableCell>
                      <TableCell
                        className="max-w-[10rem] truncate text-xs"
                        title={it.mntplan ?? ''}
                      >
                        {it.mntplan ?? '—'}
                      </TableCell>
                      <TableCell className="text-xs">{it.wktype ?? '—'}</TableCell>
                      <TableCell
                        className="max-w-[16rem] truncate text-xs"
                        title={it.equdescrip ?? ''}
                      >
                        {it.equdescrip ?? '—'}
                      </TableCell>
                      <TableCell className="tabular-nums text-xs">
                        {it.bscStart ?? '—'}
                      </TableCell>
                      <TableCell className="tabular-nums text-xs">
                        {it.cday ?? '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={it.hasConfirm ? 'default' : 'outline'}
                          onClick={() => setDetailId(String(it.idiw37))}
                        >
                          {it.hasConfirm ? 'ดู / Confirm' : 'Confirm'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>
          )}
        </AppCard>

      <WorkOrderDetailDialog
        orderId={detailId}
        initialTab="confirm"
        onOpenChange={(open) => {
          if (!open) {
            setDetailId(null)
            listQ.refetch()
          }
        }}
      />
    </AppPageShell>
  )
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
  isLoading,
}: {
  label: string
  value: number
  icon: typeof Users
  tone: 'neutral' | 'emerald' | 'blue' | 'amber'
  isLoading: boolean
}) {
  const toneMap: Record<typeof tone, string> = {
    neutral: 'bg-app-muted text-app',
    emerald: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
  }
  return (
    <AppCard pad="compact">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-app-muted">
            {label}
          </div>
          <div className="mt-1 text-2xl font-semibold tabular-nums text-app">
            {isLoading ? <Skeleton className="h-7 w-12" /> : value}
          </div>
        </div>
        <div className={`rounded-card p-2 ${toneMap[tone]}`}>
          <Icon className="size-5" aria-hidden />
        </div>
      </div>
    </AppCard>
  )
}
