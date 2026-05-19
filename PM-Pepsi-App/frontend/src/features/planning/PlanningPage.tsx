import { PageHeader } from '@/components/layout/PageHeader'
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
import {
  fetchPlanning,
  fetchWorkcenters,
  postPlanningAssign,
} from '@/lib/api-public'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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
  const qc = useQueryClient()
  const authUser = getStoredAuthUser()
  const [planningStatus, setPlanningStatus] = useState<'open' | 'closed'>('open')
  const [detailId, setDetailId] = useState<string | null>(null)
  const q = useQuery({
    queryKey: ['planning', planningStatus],
    queryFn: () => fetchPlanning({ status: planningStatus }),
  })
  const canAssign = authUser?.userst === 'A'
  const myCode = (authUser?.wkctr || authUser?.username || authUser?.idwkctr || '').trim()

  const [assignTarget, setAssignTarget] = useState<AssignTarget | null>(null)
  const [assignCode, setAssignCode] = useState('')
  const [assignTeam, setAssignTeam] = useState<'P' | 'G'>('P')
  const [assignComment, setAssignComment] = useState('')

  const workcentersQ = useQuery({
    queryKey: ['workcenters'],
    queryFn: fetchWorkcenters,
    enabled: canAssign,
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
      toast.error('ต้องเลือก Work Center ปลายทาง')
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

  return (
    <div>
      <PageHeader
        title="แผน PM / CM"
        description="Plan Work View — เทียบ M_planwork_view / M_planwork_close / W_planwork_view (view_planwork ตาม work center ที่ login)"
      >
        <Badge variant="secondary">{planningStatus === 'open' ? 'CRTD + REL' : 'Closed status'}</Badge>
        <Badge className="bg-teal-700">API + DB</Badge>
      </PageHeader>

      <div className="px-4 py-6 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-zinc-500">
            แสดงเฉพาะใบงานที่ `view_planwork.idwkctr` ตรงกับ user login
            {authUser ? ` (idwkctr=${authUser.idwkctr || '—'}, wkctr=${authUser.wkctr || '—'})` : ''}
            {' '}— กดเลข WO เพื่อดูรายละเอียด
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
        {q.isLoading ? (
          <Skeleton className="h-56 w-full rounded-xl" />
        ) : q.isError ? (
          <p className="text-sm text-red-600">{(q.error as Error).message}</p>
        ) : (q.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-zinc-600">
            {planningStatus === 'open'
              ? 'ไม่มีแผนเปิด — นำเข้า IW37N หรือตรวจว่า tbiw37n.wkctr / tbplangingwork.wkctr map ไป tbworkcenter.idwkctr ของ user ที่ login'
              : 'ไม่มีแผนที่ปิดแล้วสำหรับ work center นี้ — ตรวจว่า view_planwork.idwkctr ตรงกับ user ที่ login และ syst ไม่ใช่ CRTD/REL'}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>WO</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>รายละเอียด</TableHead>
                  <TableHead>สาย / FL</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>ย้ายแผน</TableHead>
                  {planningStatus === 'closed' ? <TableHead>Plan Close</TableHead> : null}
                  <TableHead>สถานะ</TableHead>
                  <TableHead>ผู้รับ</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {q.data?.map((p) => {
                  const st = statusMap[p.status] ?? { label: p.status, variant: 'outline' as const }
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Link
                          to={`/work-orders/${p.id}`}
                          className="font-mono text-sm text-blue-700 hover:underline"
                          title="ดูในรายการใบงาน"
                        >
                          {p.wkorder ?? p.id}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">{p.wktype ?? '—'}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm">{p.planName}</TableCell>
                      <TableCell className="text-sm">{p.line}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{p.planDate ?? '—'}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{p.movedDate ?? '—'}</TableCell>
                      {planningStatus === 'closed' ? (
                        <TableCell className="whitespace-nowrap text-sm">{p.closedDate ?? '—'}</TableCell>
                      ) : null}
                      <TableCell>
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{p.owner || '—'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setDetailId(p.id)}
                            title={
                              planningStatus === 'open'
                                ? 'เปิด Confirm tab เพื่อบันทึกปิดงาน'
                                : 'เปิด Confirm tab เพื่อดูประวัติปิดงาน'
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
        )}
      </div>

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
              เทียบ M_planwork_view_form.php — upsert `tbplangingwork` ตาม `idiw37` (admin เท่านั้น)
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="assign-code">Work Center ปลายทาง</Label>
              <select
                id="assign-code"
                value={assignCode}
                onChange={(e) => setAssignCode(e.target.value)}
                className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={submitting}
              >
                {!wcItems.some((it) => it.wkctr === assignCode) && assignCode ? (
                  <option value={assignCode}>{assignCode} (ของคุณ)</option>
                ) : null}
                {workcentersQ.isLoading ? <option value="">กำลังโหลด…</option> : null}
                {wcItems.map((it) => (
                  <option key={it.wkctr} value={it.wkctr}>
                    {it.displayName || it.wkctr}
                  </option>
                ))}
              </select>
              {myCode ? (
                <button
                  type="button"
                  className="self-start text-xs text-blue-700 hover:underline disabled:opacity-50"
                  onClick={() => setAssignCode(myCode)}
                  disabled={submitting || assignCode === myCode}
                >
                  จ่ายให้ฉัน ({myCode})
                </button>
              ) : null}
            </div>

            <div className="grid gap-1.5">
              <Label>ทีม (pwteam)</Label>
              <div className="flex gap-3 text-sm">
                {(['P', 'G'] as const).map((t) => (
                  <label key={t} className="inline-flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="assign-team"
                      value={t}
                      checked={assignTeam === t}
                      onChange={() => setAssignTeam(t)}
                      disabled={submitting}
                    />
                    <span>
                      {t === 'P' ? 'P — เฉพาะบุคคล (Personal)' : 'G — ทีม (Group)'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="assign-comment">หมายเหตุ (pwcomment)</Label>
              <Textarea
                id="assign-comment"
                value={assignComment}
                onChange={(e) => setAssignComment(e.target.value)}
                placeholder="บันทึกการจ่ายงาน เช่น เปลี่ยนทีม / เร่งด่วน"
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
              {submitting ? 'กำลังบันทึก…' : 'บันทึก'}
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
    </div>
  )
}
