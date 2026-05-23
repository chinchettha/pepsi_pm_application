import { CanPermission } from '@/components/auth/CanPermission'
import { AppCard } from '@/components/layout/AppCard'
import { AppPageShell } from '@/components/layout/AppPageShell'
import { WorkOrderDetailDialog } from '@/components/scheduling/WorkOrderDetailDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { getStoredAuthUser } from '@/features/auth/login-api'
import { usePermission } from '@/lib/use-permission'
import {
  fetchPlanning,
  fetchWorkcenters,
  postPlanningAssign,
} from '@/lib/api-public'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, ClipboardList } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  OPEN: { label: 'รอจ่ายงาน', variant: 'secondary' },
  CONF: { label: 'จ่ายแล้ว', variant: 'default' },
  CLOS: { label: 'ปิด', variant: 'outline' },
}

type PlanningRow = {
  id: string
  wkorder?: string
  status: string
}

type AssignTarget = {
  idiw37: number
  wkorder: string
  defaultCode: string
}

export function PlanningPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const authUser = getStoredAuthUser()
  const canRead = usePermission('planning.read')
  const canAssign = usePermission('planning.assign')
  const [planningStatus, setPlanningStatus] = useState<'open' | 'closed'>('open')
  const [detailId, setDetailId] = useState<string | null>(null)
  const q = useQuery({
    queryKey: ['planning', planningStatus],
    queryFn: () => fetchPlanning({ status: planningStatus }),
    enabled: canRead,
    placeholderData: keepPreviousData,
  })
  const myCode = (authUser?.wkctr || authUser?.username || authUser?.idwkctr || '').trim()

  const [assignTarget, setAssignTarget] = useState<AssignTarget | null>(null)
  const [assignCode, setAssignCode] = useState('')
  const [assignTeam, setAssignTeam] = useState<'P' | 'G'>('P')
  const [assignComment, setAssignComment] = useState('')

  const workcentersQ = useQuery({
    queryKey: ['workcenters'],
    queryFn: fetchWorkcenters,
    enabled: canAssign && !!assignTarget,
    retry: 0,
  })

  useEffect(() => {
    if (assignTarget) {
      setAssignCode(assignTarget.defaultCode)
      setAssignTeam('P')
      setAssignComment('')
    }
  }, [assignTarget])

  const assignMut = useMutation({
    mutationFn: async (input: {
      idiw37: number
      mode: 'P' | 'G'
      code: string
      comment?: string
    }) => postPlanningAssign(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['planning'] })
      toast.success('จ่ายงานสำเร็จ')
      setAssignTarget(null)
    },
    onError: (err) => toast.error((err as Error).message || 'จ่ายงานไม่สำเร็จ'),
  })

  const openAssign = (row: PlanningRow) => {
    setAssignTarget({
      idiw37: Number(row.id),
      wkorder: row.wkorder ?? row.id,
      defaultCode: myCode,
    })
  }

  const onSubmitAssign = () => {
    if (!assignTarget) return
    const code = assignCode.trim()
    if (!code) {
      toast.error('ต้องเลือกศูนย์งานปลายทาง')
      return
    }
    assignMut.mutate({
      idiw37: assignTarget.idiw37,
      mode: assignTeam,
      code,
      comment: assignComment.trim() || undefined,
    })
  }

  const wcItems = useMemo(() => workcentersQ.data ?? [], [workcentersQ.data])
  const submitting = assignMut.isPending
  const rows = q.data ?? []

  if (!canRead) {
    return (
      <AppPageShell
        title="แผน PM / CM"
        description="งานตาม work center ที่ล็อกอิน — view_planwork"
      >
        <EmptyState
          icon={AlertCircle}
          title="ไม่มีสิทธิ์เข้าถึง"
          description={
            <>
              ต้องมีสิทธิ์ <code className="text-xs">planning.read</code>
            </>
          }
        />
      </AppPageShell>
    )
  }

  return (
    <>
      <AppPageShell
        title="แผน PM / CM"
        description="งานเปิด/ปิดตาม work center ของคุณ — จ่ายงาน · บันทึกปิดงาน · เปิดรายละเอียด WO"
        contentClassName="space-y-4"
        headerActions={
          <>
            <Badge variant="secondary" className="text-xs">
              {planningStatus === 'open' ? 'CRTD + REL' : 'ปิดแล้ว'}
            </Badge>
            <CanPermission permission="planning.read">
              <Button type="button" variant="outline" size="sm" asChild>
                <Link to="/plan-calendar">ปฏิทินจ่ายงาน</Link>
              </Button>
            </CanPermission>
            <CanPermission permission="work-orders.read">
              <Button type="button" variant="outline" size="sm" asChild>
                <Link to="/work-orders">ใบงาน WO</Link>
              </Button>
            </CanPermission>
            <CanPermission permission="iw37n.read">
              <Button type="button" variant="outline" size="sm" asChild>
                <Link to="/iw37n">นำเข้า IW37N</Link>
              </Button>
            </CanPermission>
          </>
        }
      >
        <AppCard pad="compact" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-caption text-app-muted">
              แสดงเฉพาะ `view_planwork` ที่ idwkctr ตรง user ที่ล็อกอิน
              {authUser
                ? ` (idwkctr=${authUser.idwkctr || '—'}, wkctr=${authUser.wkctr || '—'})`
                : ''}
              {' '}
              · คลิกเลข WO เพื่อเปิดรายละเอียด
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={planningStatus === 'open' ? 'default' : 'outline'}
                onClick={() => setPlanningStatus('open')}
              >
                งานเปิด
              </Button>
              <Button
                type="button"
                size="sm"
                variant={planningStatus === 'closed' ? 'default' : 'outline'}
                onClick={() => setPlanningStatus('closed')}
              >
                งานปิดแล้ว
              </Button>
            </div>
          </div>
        </AppCard>

        {q.isLoading && !q.data ? (
          <Skeleton className="h-56 w-full rounded-card" aria-label="กำลังโหลดแผนงาน" />
        ) : q.isError ? (
          <EmptyState
            icon={AlertCircle}
            title="โหลดแผนงานไม่สำเร็จ"
            description={(q.error as Error).message}
            action={{ label: 'ลองใหม่', onClick: () => void q.refetch() }}
          />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={planningStatus === 'open' ? 'ไม่มีงานเปิด' : 'ไม่มีงานปิดแล้ว'}
            description={
              planningStatus === 'open'
                ? 'นำเข้า IW37N หรือตรวจว่า wkctr ของใบงาน map กับ work center ที่ล็อกอิน'
                : 'ตรวจว่าใบงานมีสถานะปิดแล้วและอยู่ใน view_planwork ของคุณ'
            }
            action={
              planningStatus === 'open'
                ? { label: 'ไปนำเข้า IW37N', onClick: () => navigate('/iw37n') }
                : undefined
            }
          />
        ) : (
          <AppCard pad="compact" className="space-y-3">
            <p className="text-caption">
              แสดง {rows.length.toLocaleString('th-TH')} รายการ
              {q.isFetching ? ' · กำลังอัปเดต…' : ''}
            </p>
            <div className="app-table-shell max-h-[min(70vh,720px)] overflow-auto">
              <Table embedded stickyHeader zebra>
                <TableHeader>
                  <TableRow>
                    <TableHead>เลข WO</TableHead>
                    <TableHead>ประเภท</TableHead>
                    <TableHead>รายละเอียด</TableHead>
                    <TableHead>สาย / FL</TableHead>
                    <TableHead>แผน</TableHead>
                    <TableHead>ย้ายแผน</TableHead>
                    {planningStatus === 'closed' ? <TableHead>วันปิดแผน</TableHead> : null}
                    <TableHead>สถานะ</TableHead>
                    <TableHead>ผู้รับ</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((p) => {
                    const st = statusMap[p.status] ?? { label: p.status, variant: 'outline' as const }
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <Link
                            to={`/work-orders/${p.id}`}
                            className="font-mono text-body-sm text-[var(--brand-pepsi-blue)] hover:underline"
                            title="ดูในรายการใบงาน"
                          >
                            {p.wkorder ?? p.id}
                          </Link>
                        </TableCell>
                        <TableCell className="text-body-sm">{p.wktype ?? '—'}</TableCell>
                        <TableCell className="max-w-xs truncate text-body-sm">{p.planName}</TableCell>
                        <TableCell className="text-body-sm">{p.line}</TableCell>
                        <TableCell className="whitespace-nowrap text-body-sm">{p.planDate ?? '—'}</TableCell>
                        <TableCell className="whitespace-nowrap text-body-sm">{p.movedDate ?? '—'}</TableCell>
                        {planningStatus === 'closed' ? (
                          <TableCell className="whitespace-nowrap text-body-sm">
                            {p.closedDate ?? '—'}
                          </TableCell>
                        ) : null}
                        <TableCell>
                          <Badge variant={st.variant}>{st.label}</Badge>
                        </TableCell>
                        <TableCell className="text-body-sm">{p.owner || '—'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setDetailId(p.id)}
                              title={
                                planningStatus === 'open'
                                  ? 'เปิดแท็บ Confirm เพื่อบันทึกปิดงาน'
                                  : 'เปิดแท็บ Confirm เพื่อดูประวัติปิดงาน'
                              }
                            >
                              {planningStatus === 'open' ? 'บันทึกปิดงาน' : 'ดูปิดงาน'}
                            </Button>
                            {canAssign && planningStatus === 'open' ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => openAssign(p)}
                                title={
                                  p.status === 'CONF'
                                    ? 'มีแผนแล้ว — กดเพื่ออัปเดต (upsert)'
                                    : 'จ่ายงานเข้า tbplangingwork'
                                }
                              >
                                จ่ายงาน
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </AppCard>
        )}
      </AppPageShell>

      <Dialog
        open={!!assignTarget}
        onOpenChange={(open) => {
          if (!open && !submitting) setAssignTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>จ่ายงาน WO {assignTarget?.wkorder}</DialogTitle>
            <DialogDescription>
              เลือกศูนย์งานและทีม (P/G) — บันทึกลง tbplangingwork (ต้องมีสิทธิ์ planning.assign)
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="assign-code">ศูนย์งานปลายทาง (wkctr)</Label>
              <select
                id="assign-code"
                value={assignCode}
                onChange={(e) => setAssignCode(e.target.value)}
                className="flex h-9 w-full rounded-button border border-app bg-[var(--app-surface)] px-3 py-1 text-body-sm shadow-sm focus:outline-none focus-app-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={submitting}
              >
                {!wcItems.some((it) => it.wkctr === assignCode) && assignCode ? (
                  <option value={assignCode}>{assignCode} (ของคุณ)</option>
                ) : null}
                {workcentersQ.isLoading ? <option value="">กำลังโหลด…</option> : null}
                {workcentersQ.isError ? (
                  <option value="">โหลดรายชื่อช่างไม่สำเร็จ</option>
                ) : null}
                {wcItems.map((it) => (
                  <option key={it.wkctr} value={it.wkctr}>
                    {it.displayName || it.wkctr}
                  </option>
                ))}
              </select>
              {myCode ? (
                <button
                  type="button"
                  className="self-start text-xs text-[var(--brand-pepsi-blue)] hover:underline disabled:opacity-50"
                  onClick={() => setAssignCode(myCode)}
                  disabled={submitting || assignCode === myCode}
                >
                  จ่ายให้ฉัน ({myCode})
                </button>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label>ทีม (pwteam)</Label>
              <div className="flex flex-wrap gap-4 text-body-sm">
                {(['P', 'G'] as const).map((t) => (
                  <label key={t} className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="assign-team"
                      value={t}
                      checked={assignTeam === t}
                      onChange={() => setAssignTeam(t)}
                      disabled={submitting}
                    />
                    <span>{t === 'P' ? 'P — รายบุคคล' : 'G — กลุ่มช่าง'}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="assign-comment">หมายเหตุ</Label>
              <Textarea
                id="assign-comment"
                value={assignComment}
                onChange={(e) => setAssignComment(e.target.value)}
                placeholder="เช่น เปลี่ยนทีม / เร่งด่วน"
                rows={3}
                disabled={submitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAssignTarget(null)}
              disabled={submitting}
            >
              ยกเลิก
            </Button>
            <Button type="button" onClick={onSubmitAssign} disabled={submitting || !assignCode}>
              {submitting ? 'กำลังบันทึก…' : 'บันทึกจ่ายงาน'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <WorkOrderDetailDialog
        orderId={detailId}
        initialTab="confirm"
        onOpenChange={(open) => {
          if (!open) setDetailId(null)
        }}
      />
    </>
  )
}
