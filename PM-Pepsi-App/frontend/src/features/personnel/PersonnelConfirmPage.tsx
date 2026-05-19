/**
 * Personnel Confirmation Dashboard — เทียบ PHP `M_personel_confirm.php`
 *
 * - Admin only — ดู % การปิดงานของช่างต่อ WO (อ่าน `view_countpersonelclose`)
 * - Filter: text search + status (ทั้งหมด/ยังไม่เริ่ม/กำลังทำ/เสร็จ)
 * - แต่ละแถวมีปุ่ม Confirm ที่เปิด `WorkOrderDetailDialog` ด้วย `initialTab="confirm"`
 *   (เทียบ `M_personel_confirm_form.php` ที่เป็น modal 4 แท็บ)
 */
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { WorkOrderDetailDialog } from '@/components/scheduling/WorkOrderDetailDialog'
import { getStoredAuthUser } from '@/features/auth/login-api'
import { fetchPersonnelConfirm } from '@/lib/api-public'
import { useQuery } from '@tanstack/react-query'
import {
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

type StatusFilter = 'all' | 'not_started' | 'in_progress' | 'done'

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'not_started', label: 'ยังไม่เริ่ม' },
  { id: 'in_progress', label: 'กำลังทำ' },
  { id: 'done', label: 'ปิดครบ' },
]

function ProgressBar({ percent }: { percent: number }) {
  const safe = Math.max(0, Math.min(100, Math.round(percent || 0)))
  const color =
    safe >= 100
      ? 'bg-emerald-600'
      : safe >= 60
        ? 'bg-blue-600'
        : safe > 0
          ? 'bg-amber-500'
          : 'bg-zinc-300'
  return (
    <div
      className="h-5 w-full overflow-hidden rounded bg-zinc-100 ring-1 ring-zinc-200"
      title={`${safe}%`}
    >
      <div
        className={`flex h-full items-center justify-center text-[10px] font-medium text-white transition-all ${color}`}
        style={{ width: `${safe}%`, minWidth: safe > 0 ? '1.5rem' : 0 }}
      >
        {safe > 0 ? `${safe}%` : ''}
      </div>
    </div>
  )
}

function SystBadge({ syst }: { syst: string | null }) {
  if (!syst) return <span className="text-xs text-zinc-400">—</span>
  const map: Record<string, string> = {
    CRTD: 'bg-amber-100 text-amber-800 ring-amber-200',
    REL: 'bg-blue-100 text-blue-800 ring-blue-200',
    TECO: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    COMP: 'bg-zinc-100 text-zinc-700 ring-zinc-200',
  }
  const cls = map[syst] ?? 'bg-zinc-100 text-zinc-700 ring-zinc-200'
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ring-1 ${cls}`}
    >
      {syst}
    </span>
  )
}

export function PersonnelConfirmPage() {
  const navigate = useNavigate()
  const authUser = getStoredAuthUser()
  const isAdmin = authUser?.userst === 'A'

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Admin only')
      navigate('/personnel', { replace: true })
    }
  }, [isAdmin, navigate])

  const [qInput, setQInput] = useState('')
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [detailId, setDetailId] = useState<string | null>(null)

  const listQ = useQuery({
    queryKey: ['personnel', 'confirm', 'list', q, status],
    queryFn: () =>
      fetchPersonnelConfirm({
        q: q || undefined,
        status,
        limit: 500,
      }),
    enabled: isAdmin,
    staleTime: 15_000,
  })

  const items = useMemo(() => listQ.data?.items ?? [], [listQ.data])
  const summary = listQ.data?.summary
  const errorMessage =
    listQ.error instanceof Error ? listQ.error.message : null

  const onSubmitSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setQ(qInput.trim())
  }

  return (
    <div>
      <PageHeader
        title="Personnel Confirmation"
        description="สรุป % การปิดงานของช่างต่อ WO (เทียบ M_personel_confirm.php → view_countpersonelclose)"
      >
        <Badge variant="secondary">Admin</Badge>
        <Button asChild variant="outline" size="sm">
          <Link to="/personnel">Personal Dashboard</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/personnel/admin">จัดการบุคลากร</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/confirmation">Confirmation</Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => listQ.refetch()}
          disabled={listQ.isFetching}
        >
          <RefreshCcw className="mr-1.5 size-3.5" />
          Refresh
        </Button>
      </PageHeader>

      <div className="space-y-4 px-4 py-6 sm:px-6">
        {/* Summary cards */}
        <div className="grid gap-3 sm:grid-cols-4">
          <SummaryCard
            label="WO ที่เปิดทั้งหมด"
            value={summary?.totalOpen ?? 0}
            icon={ClipboardList}
            tone="zinc"
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
        <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <form onSubmit={onSubmitSearch} className="flex flex-1 items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-zinc-400" />
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
          <div className="flex flex-wrap items-center gap-1.5 sm:flex-nowrap">
            <Filter className="size-4 text-zinc-500" />
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
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          {listQ.isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded" />
              ))}
            </div>
          ) : errorMessage ? (
            <div className="p-4 text-sm text-red-700">{errorMessage}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[15%]">Close (%)</TableHead>
                  <TableHead>Work Order</TableHead>
                  <TableHead>Maintenance plan</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>New Plan</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-12 text-center text-sm text-zinc-500"
                    >
                      ไม่พบ WO ตามเงื่อนไข
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((it) => (
                    <TableRow key={it.idiw37}>
                      <TableCell className="align-middle">
                        <div className="space-y-1">
                          <ProgressBar percent={it.percentClose} />
                          <div className="text-[11px] text-zinc-500 tabular-nums">
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
                        <div className="mt-1">
                          <SystBadge syst={it.syst} />
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
          )}
        </div>
      </div>

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
    </div>
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
  tone: 'zinc' | 'emerald' | 'blue' | 'amber'
  isLoading: boolean
}) {
  const toneMap: Record<typeof tone, string> = {
    zinc: 'bg-zinc-100 text-zinc-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
  }
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-zinc-500">
            {label}
          </div>
          <div className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">
            {isLoading ? <Skeleton className="h-7 w-12" /> : value}
          </div>
        </div>
        <div className={`rounded-lg p-2 ${toneMap[tone]}`}>
          <Icon className="size-5" aria-hidden />
        </div>
      </div>
    </div>
  )
}
