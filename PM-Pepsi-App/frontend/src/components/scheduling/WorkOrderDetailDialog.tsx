import { MovePlanDialog } from '@/components/scheduling/MovePlanDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  deleteConfirmationClose,
  deleteConfirmationComment,
  deleteConfirmationImage,
  fetchConfirmationByWorkOrder,
  fetchConfirmationComments,
  fetchConfirmationImageData,
  fetchConfirmationImages,
  fetchWorkOrderModalDetail,
  fetchWorkOrderDetail,
  deleteWorkOrderPlanning,
  postConfirmationClose,
  postConfirmationComment,
  postConfirmationImage,
  putWorkOrderPlanning,
  putConfirmationComment,
} from '@/lib/api-public'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { getStoredAuthUser } from '@/features/auth/login-api'

type WorkOrderDetailDialogProps = {
  orderId: string | null
  onOpenChange: (open: boolean) => void
  contextDate?: string
}

function isoToDdMmYyyy(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!m) return iso
  return `${m[3]}.${m[2]}.${m[1]}`
}

function fmtDateTime(sec: number): string {
  const d = new Date(sec * 1000)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`
}

export function WorkOrderDetailDialog({ orderId, onOpenChange, contextDate }: WorkOrderDetailDialogProps) {
  const open = Boolean(orderId)
  const authUser = getStoredAuthUser()
  const canPlan = (authUser?.userst ?? '').trim() === 'A'
  const [moveOpen, setMoveOpen] = useState(false)
  const [confirmTab, setConfirmTab] = useState<'images' | 'comments' | 'close'>('close')
  const [closeWkctr, setCloseWkctr] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('17:00')
  const [newComment, setNewComment] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingText, setEditingText] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [viewImageId, setViewImageId] = useState<number | null>(null)
  const [planComment, setPlanComment] = useState('')

  const qc = useQueryClient()

  const detailQ = useQuery({
    queryKey: ['work-order', orderId],
    queryFn: () => fetchWorkOrderDetail(orderId!),
    enabled: open,
  })

  const d = detailQ.data
  const idiw37 = useMemo(() => (d?.id ? Number(d.id) : null), [d?.id])
  const modalDate = useMemo(() => contextDate || d?.plannedDate || '', [contextDate, d?.plannedDate])

  const modalQ = useQuery({
    queryKey: ['work-order', 'modal-detail', orderId, modalDate],
    queryFn: () => fetchWorkOrderModalDetail(orderId!, modalDate || undefined),
    enabled: open,
  })

  const closesQ = useQuery({
    queryKey: ['confirmation', 'by-wkorder', d?.wkorder],
    queryFn: () => fetchConfirmationByWorkOrder(d!.wkorder),
    enabled: open && Boolean(d?.wkorder),
  })

  const commentsQ = useQuery({
    queryKey: ['confirmation', 'comments', idiw37],
    queryFn: () => fetchConfirmationComments(idiw37!),
    enabled: open && typeof idiw37 === 'number' && Number.isFinite(idiw37),
  })

  const imagesQ = useQuery({
    queryKey: ['confirmation', 'images', idiw37],
    queryFn: () => fetchConfirmationImages(idiw37!),
    enabled: open && typeof idiw37 === 'number' && Number.isFinite(idiw37),
  })

  const imageDataQ = useQuery({
    queryKey: ['confirmation', 'image-data', viewImageId],
    queryFn: () => fetchConfirmationImageData(viewImageId!),
    enabled: open && typeof viewImageId === 'number' && Number.isFinite(viewImageId),
  })

  const addCloseMut = useMutation({
    mutationFn: async () =>
      postConfirmationClose({
        idiw37: Number(d!.id),
        wkctr: closeWkctr || d!.workCenter,
        startD: isoToDdMmYyyy(startDate),
        startT: startTime,
        endD: isoToDdMmYyyy(endDate),
        endT: endTime,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['confirmation', 'by-wkorder', d?.wkorder] })
    },
  })

  const delCloseMut = useMutation({
    mutationFn: (idclose: number) => deleteConfirmationClose(idclose),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['confirmation', 'by-wkorder', d?.wkorder] })
    },
  })

  const addCommentMut = useMutation({
    mutationFn: () => postConfirmationComment(idiw37!, newComment),
    onSuccess: async () => {
      setNewComment('')
      await qc.invalidateQueries({ queryKey: ['confirmation', 'comments', idiw37] })
    },
  })

  const saveCommentMut = useMutation({
    mutationFn: () => putConfirmationComment(editingId!, editingText),
    onSuccess: async () => {
      setEditingId(null)
      setEditingText('')
      await qc.invalidateQueries({ queryKey: ['confirmation', 'comments', idiw37] })
    },
  })

  const delCommentMut = useMutation({
    mutationFn: (idcom: number) => deleteConfirmationComment(idcom),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['confirmation', 'comments', idiw37] })
    },
  })

  const uploadImageMut = useMutation({
    mutationFn: () => postConfirmationImage(idiw37!, imageFile!),
    onSuccess: async () => {
      setImageFile(null)
      await qc.invalidateQueries({ queryKey: ['confirmation', 'images', idiw37] })
    },
  })

  const delImageMut = useMutation({
    mutationFn: (idcimg: number) => deleteConfirmationImage(idcimg),
    onSuccess: async () => {
      if (viewImageId != null) setViewImageId(null)
      await qc.invalidateQueries({ queryKey: ['confirmation', 'images', idiw37] })
    },
  })

  const assignPlanMut = useMutation({
    mutationFn: (args: { mode: 'P' | 'G'; code: string }) =>
      putWorkOrderPlanning(orderId!, { mode: args.mode, code: args.code, comment: planComment.trim() || undefined }),
    onSuccess: async () => {
      setPlanComment('')
      await qc.invalidateQueries({ queryKey: ['work-order', 'modal-detail', orderId] })
      await qc.invalidateQueries({ queryKey: ['work-order', orderId] })
    },
  })

  const deletePlanMut = useMutation({
    mutationFn: () => deleteWorkOrderPlanning(orderId!),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['work-order', 'modal-detail', orderId] })
      await qc.invalidateQueries({ queryKey: ['work-order', orderId] })
    },
  })

  useEffect(() => {
    if (!d) return
    if (!closeWkctr) setCloseWkctr(d.workCenter)
  }, [d, closeWkctr])

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="pr-8">
              {d ? (
                <span className="flex flex-wrap items-center gap-2">
                  <span>{d.title}</span>
                  {d.team ? <Badge variant="secondary">TEAM {d.team}</Badge> : null}
                </span>
              ) : (
                'รายละเอียดใบงาน'
              )}
            </DialogTitle>
            <DialogDescription>
              เทียบ `ModalOrderDetail.php` — แท็บ Work Order / Planning / Task / Machine / Material
            </DialogDescription>
          </DialogHeader>

          {detailQ.isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : detailQ.isError ? (
            <p className="text-sm text-red-600">{(detailQ.error as Error).message}</p>
          ) : d ? (
            <Tabs defaultValue="work-order" className="w-full">
              <TabsList className="flex h-auto w-full flex-wrap gap-1">
                <TabsTrigger value="work-order">Work Order</TabsTrigger>
                <TabsTrigger value="task-list">Task List</TabsTrigger>
                <TabsTrigger value="machine">Machine</TabsTrigger>
                {canPlan ? <TabsTrigger value="planning">Planning</TabsTrigger> : null}
                <TabsTrigger value="material">Material</TabsTrigger>
                <TabsTrigger value="confirm">Confirm</TabsTrigger>
              </TabsList>

              <TabsContent value="work-order" className="space-y-2 text-sm">
                <p>
                  <span className="font-medium text-zinc-700">เลขที่ WO:</span> {d.wkorder}
                </p>
                <p>
                  <span className="font-medium text-zinc-700">Id:</span> {d.id}
                </p>
                <p>
                  <span className="font-medium text-zinc-700">สถานะ:</span>{' '}
                  <Badge style={{ backgroundColor: d.statusColor }} className="text-white">
                    {d.status}
                  </Badge>
                </p>
                <p>
                  <span className="font-medium text-zinc-700">ประเภท:</span> {d.orderType}{' '}
                  {d.mat ? `· mat ${d.mat}` : ''}
                </p>
                <p>
                  <span className="font-medium text-zinc-700">อุปกรณ์:</span> {d.equipment}
                </p>
                <p>
                  <span className="font-medium text-zinc-700">Functional loc.:</span> {d.functLoc}
                </p>
                <p>
                  <span className="font-medium text-zinc-700">WC:</span> {d.workCenter}
                </p>
                <p>
                  <span className="font-medium text-zinc-700">วางแผน:</span> {d.plannedDate || '—'}
                </p>
                <p>
                  <span className="font-medium text-zinc-700">ปิดงาน:</span> {d.finishDate || '—'}
                </p>
                <p className="text-zinc-600">{d.description}</p>
              </TabsContent>

              <TabsContent value="task-list" className="space-y-3 text-sm">
                {modalQ.isLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : modalQ.isError ? (
                  <p className="text-sm text-red-600">{(modalQ.error as Error).message}</p>
                ) : modalQ.data ? (
                  <>
                    {modalQ.data.taskList.summary ? (
                      <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm">
                        <p className="font-medium text-sky-900">Task List {modalQ.data.taskList.summary.tasklist}</p>
                        <p className="text-xs text-sky-900/80">
                          {modalQ.data.taskList.summary.productline} / {modalQ.data.taskList.summary.zone} /{' '}
                          {modalQ.data.taskList.summary.wkctrtype}
                        </p>
                      </div>
                    ) : (
                      <p className="text-zinc-600">ไม่ปรากฏ PM Task List</p>
                    )}

                    {modalQ.data.taskList.items.length ? (
                      <div className="space-y-1">
                        {modalQ.data.taskList.items.map((t, idx) => (
                          <div key={`${t.tasklist}-${t.machine}-${t.pmlist}-${idx}`} className="rounded-md border border-zinc-200 bg-white px-3 py-2">
                            <p className="text-sm text-zinc-900">
                              {idx + 1}. {t.machine} - {t.pmlist} / {t.mat ? `${t.mat} = ${t.matdescrip}` : ''}
                            </p>
                            <p className="text-xs text-zinc-500">
                              สถานะเครื่อง: {t.machinestatus === 1 ? 'หยุด' : 'เดิน'}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : null}
              </TabsContent>

              <TabsContent value="machine" className="space-y-3 text-sm">
                {modalQ.isLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : modalQ.isError ? (
                  <p className="text-sm text-red-600">{(modalQ.error as Error).message}</p>
                ) : modalQ.data ? (
                  <>
                    {modalQ.data.machine.productline ? (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <p className="font-medium text-amber-900">
                          Product Line {modalQ.data.machine.productline}
                        </p>
                        <p className="text-sm text-amber-900/80">
                          Work : {modalQ.data.machine.uptime != null ? modalQ.data.machine.uptime : '—'}
                        </p>
                        <p className="mt-1 text-xs text-amber-900/70">วันที่อ้างอิง: {modalQ.data.date}</p>
                      </div>
                    ) : null}

                    {modalQ.data.machine.zone || modalQ.data.machine.wkctrtype ? (
                      <div className="rounded-lg border border-sky-200 bg-sky-50 p-3">
                        <p className="text-sm text-sky-900">
                          Zone {modalQ.data.machine.zone} / {modalQ.data.machine.wkctrtype}
                        </p>
                      </div>
                    ) : null}

                    {modalQ.data.machine.machines.length ? (
                      <div className="space-y-1">
                        {modalQ.data.machine.machines.map((m) => (
                          <div key={m} className="rounded-md border border-zinc-200 bg-white px-3 py-2">
                            {m}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-zinc-600">ไม่พบข้อมูล</p>
                    )}
                  </>
                ) : null}
              </TabsContent>

              <TabsContent value="planning" className="space-y-3 text-sm">
                {!canPlan ? (
                  <p className="text-zinc-600">ไม่มีสิทธิ์ (Admin เท่านั้น)</p>
                ) : (
                  <>
                    <div className="rounded-lg border border-zinc-200 bg-white p-3">
                      <p className="font-medium text-zinc-900">Planning Work</p>
                      <p className="text-xs text-zinc-500">เทียบ `TabPlanning.php`</p>
                      <div className="mt-3 space-y-2">
                        <Label htmlFor="plan-comment">หมายเหตุ</Label>
                        <Input id="plan-comment" value={planComment} onChange={(e) => setPlanComment(e.target.value)} />
                      </div>
                    </div>

                    {d.movePlan ? (
                      <div className="rounded-lg border border-orange-200 bg-orange-50/80 p-3">
                        <p className="font-medium text-orange-900">ย้ายแผนแล้ว</p>
                        <p>วันที่ย้าย: {d.movePlan.movedDate}</p>
                        <p>จำนวนครั้ง: {d.movePlan.moveCount}</p>
                        <p>
                          เหตุผล: {d.movePlan.reasonCode} — {d.movePlan.reasonName}
                        </p>
                        <p>โดย WC: {d.movePlan.movedByWkctr}</p>
                      </div>
                    ) : (
                      <p className="text-zinc-600">ยังไม่มีการย้ายแผน</p>
                    )}

                    {d.canMovePlan ? (
                      <Button type="button" variant="outline" onClick={() => setMoveOpen(true)}>
                        ย้ายแผน (MovePlant)
                      </Button>
                    ) : (
                      <p className="text-xs text-zinc-500">สถานะนี้ย้ายแผนไม่ได้ (ต้อง CRTD/REL และสิทธิ์)</p>
                    )}

                    {modalQ.isLoading ? (
                      <Skeleton className="h-48 w-full" />
                    ) : modalQ.isError ? (
                      <p className="text-sm text-red-600">{(modalQ.error as Error).message}</p>
                    ) : modalQ.data ? (
                      <>
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-medium text-emerald-900">ผู้รับผิดชอบ</p>
                              {modalQ.data.planning.assigned ? (
                                <>
                                  <p className="text-sm text-emerald-900/90">
                                    {modalQ.data.planning.assigned.code} — {modalQ.data.planning.assigned.displayName}
                                  </p>
                                  {modalQ.data.planning.assigned.pwcomment ? (
                                    <p className="mt-1 text-xs text-emerald-900/70">
                                      {modalQ.data.planning.assigned.pwcomment}
                                    </p>
                                  ) : null}
                                </>
                              ) : (
                                <p className="text-sm text-emerald-900/80">ยังไม่ได้จ่ายงาน</p>
                              )}
                            </div>
                            {modalQ.data.planning.assigned ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => deletePlanMut.mutate()}
                                disabled={deletePlanMut.isPending}
                              >
                                ยกเลิก
                              </Button>
                            ) : null}
                          </div>
                        </div>

                        <div className="rounded-lg border border-zinc-200 bg-white p-3">
                          <p className="font-medium text-zinc-900">จ่ายงานรายบุคคล</p>
                          <div className="mt-3 flex max-h-60 flex-wrap gap-2 overflow-auto">
                            {modalQ.data.planning.workcenters.map((w) => (
                              <Button
                                key={w.wkctr}
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => assignPlanMut.mutate({ mode: 'P', code: w.wkctr })}
                                disabled={assignPlanMut.isPending}
                                title={w.displayName}
                              >
                                {w.wkctr}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-lg border border-zinc-200 bg-white p-3">
                          <p className="font-medium text-zinc-900">Planning GROUP</p>
                          <div className="mt-3 overflow-auto rounded-md border border-zinc-200">
                            <table className="min-w-full text-sm">
                              <thead className="bg-zinc-50 text-zinc-700">
                                <tr>
                                  <th className="px-3 py-2 text-left">รหัสกลุ่ม</th>
                                  <th className="px-3 py-2 text-left">ชื่อกลุ่ม</th>
                                  <th className="px-3 py-2 text-center">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {modalQ.data.planning.groups.map((g) => (
                                  <tr key={g.wkctrgroup} className="border-t">
                                    <td className="px-3 py-2">{g.wkctrgroup}</td>
                                    <td className="px-3 py-2">{g.wkctrdescription}</td>
                                    <td className="px-3 py-2 text-center">
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => assignPlanMut.mutate({ mode: 'G', code: g.wkctrgroup })}
                                        disabled={assignPlanMut.isPending}
                                      >
                                        Add
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </>
                )}
              </TabsContent>

              <TabsContent value="material" className="space-y-2 text-sm">
                {modalQ.isLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : modalQ.isError ? (
                  <p className="text-sm text-red-600">{(modalQ.error as Error).message}</p>
                ) : modalQ.data ? (
                  modalQ.data.materials.items.length ? (
                    <div className="overflow-auto rounded-lg border border-zinc-200">
                      <table className="min-w-full text-sm">
                        <thead className="bg-zinc-50 text-zinc-700">
                          <tr>
                            <th className="px-3 py-2 text-left">PO</th>
                            <th className="px-3 py-2 text-left">Pstng Date</th>
                            <th className="px-3 py-2 text-left">Material Description</th>
                            <th className="px-3 py-2 text-right">Amount LC</th>
                            <th className="px-3 py-2 text-left">MvT</th>
                            <th className="px-3 py-2 text-left">Material</th>
                          </tr>
                        </thead>
                        <tbody>
                          {modalQ.data.materials.items.map((r, i) => (
                            <tr key={`${r.material}-${r.pstngdate}-${i}`} className="border-t">
                              <td className="px-3 py-2">{r.matpo}</td>
                              <td className="px-3 py-2">{r.pstngdate}</td>
                              <td className="px-3 py-2">{r.materialdesc}</td>
                              <td className="px-3 py-2 text-right">{r.amountinlc.toLocaleString('en-US')}</td>
                              <td className="px-3 py-2">{r.mvt}</td>
                              <td className="px-3 py-2">{r.material}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-zinc-600">ไม่พบข้อมูล</p>
                  )
                ) : null}
              </TabsContent>

              <TabsContent value="confirm" className="space-y-4 text-sm">
                <p className="text-zinc-600">
                  เทียบ `W_confirm_form.php` — Close Images / Close Detail / Close Work Confirm
                </p>

                <Tabs value={confirmTab} onValueChange={(v) => setConfirmTab(v as typeof confirmTab)}>
                  <TabsList className="flex h-auto w-full flex-wrap gap-1">
                    <TabsTrigger value="close">Close Work</TabsTrigger>
                    <TabsTrigger value="comments">Close Detail</TabsTrigger>
                    <TabsTrigger value="images">Close Images</TabsTrigger>
                  </TabsList>

                  <TabsContent value="close" className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor="c-wkctr">Work center</Label>
                        <Input id="c-wkctr" value={closeWkctr} onChange={(e) => setCloseWkctr(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="c-start-date">Start date</Label>
                        <DatePicker id="c-start-date" value={startDate} onChange={setStartDate} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="c-start-time">Start time</Label>
                        <Input id="c-start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="c-end-date">End date</Label>
                        <DatePicker id="c-end-date" value={endDate} onChange={setEndDate} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="c-end-time">End time</Label>
                        <Input id="c-end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => addCloseMut.mutate()}
                      disabled={!startDate || !endDate || !startTime || !endTime || addCloseMut.isPending}
                    >
                      บันทึกการปิดงาน
                    </Button>

                    {closesQ.isLoading ? (
                      <Skeleton className="h-24 w-full" />
                    ) : closesQ.isError ? (
                      <p className="text-sm text-red-600">{(closesQ.error as Error).message}</p>
                    ) : closesQ.data?.items?.length ? (
                      <div className="space-y-2">
                        {closesQ.data.items.map((c) => (
                          <div key={c.idclose} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white p-3">
                            <div className="min-w-0">
                              <p className="font-medium">
                                {c.wkctr} {c.displayName ? `— ${c.displayName}` : ''}
                              </p>
                              <p className="text-xs text-zinc-600">
                                {fmtDateTime(c.stdate)} → {fmtDateTime(c.endate)} ({c.timewk} {c.unitc})
                              </p>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => delCloseMut.mutate(c.idclose)}
                              disabled={delCloseMut.isPending}
                            >
                              ลบ
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-600">ยังไม่มีประวัติการปิดงาน</p>
                    )}
                  </TabsContent>

                  <TabsContent value="comments" className="space-y-3">
                    <div className="space-y-2 rounded-lg border border-zinc-200 bg-white p-3">
                      <Label htmlFor="new-comment">Comment</Label>
                      <Textarea id="new-comment" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                      <Button type="button" onClick={() => addCommentMut.mutate()} disabled={!newComment.trim() || addCommentMut.isPending}>
                        เพิ่ม
                      </Button>
                    </div>

                    {commentsQ.isLoading ? (
                      <Skeleton className="h-24 w-full" />
                    ) : commentsQ.isError ? (
                      <p className="text-sm text-red-600">{(commentsQ.error as Error).message}</p>
                    ) : commentsQ.data?.length ? (
                      <div className="space-y-2">
                        {commentsQ.data.map((c) => (
                          <div key={c.idcom} className="rounded-lg border border-zinc-200 bg-white p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-xs text-zinc-500">
                                {c.wkctr} · {new Date(c.createdAt).toLocaleString('th-TH')}
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingId(c.idcom)
                                    setEditingText(c.comdetail)
                                  }}
                                >
                                  แก้ไข
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => delCommentMut.mutate(c.idcom)}
                                  disabled={delCommentMut.isPending}
                                >
                                  ลบ
                                </Button>
                              </div>
                            </div>

                            {editingId === c.idcom ? (
                              <div className="mt-2 space-y-2">
                                <Textarea value={editingText} onChange={(e) => setEditingText(e.target.value)} />
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    onClick={() => saveCommentMut.mutate()}
                                    disabled={!editingText.trim() || saveCommentMut.isPending}
                                  >
                                    บันทึก
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingId(null)
                                      setEditingText('')
                                    }}
                                  >
                                    ยกเลิก
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-800">{c.comdetail}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-600">ยังไม่มี comment</p>
                    )}
                  </TabsContent>

                  <TabsContent value="images" className="space-y-3">
                    <div className="space-y-2 rounded-lg border border-zinc-200 bg-white p-3">
                      <Label htmlFor="img-file">Upload (JPEG)</Label>
                      <Input
                        id="img-file"
                        type="file"
                        accept=".jpg,.jpeg,image/jpeg"
                        onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                      />
                      <Button
                        type="button"
                        onClick={() => uploadImageMut.mutate()}
                        disabled={!imageFile || uploadImageMut.isPending}
                      >
                        อัปโหลด
                      </Button>
                    </div>

                    {imagesQ.isLoading ? (
                      <Skeleton className="h-24 w-full" />
                    ) : imagesQ.isError ? (
                      <p className="text-sm text-red-600">{(imagesQ.error as Error).message}</p>
                    ) : imagesQ.data?.length ? (
                      <div className="space-y-2">
                        {imagesQ.data.map((img) => (
                          <div key={img.idcimg} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white p-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {img.originalName || img.fileName}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {img.wkctr} · {new Date(img.createdAt).toLocaleString('th-TH')} · {img.bytes} bytes
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setViewImageId(img.idcimg)}
                              >
                                ดู
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => delImageMut.mutate(img.idcimg)}
                                disabled={delImageMut.isPending}
                              >
                                ลบ
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-600">ยังไม่มีรูป</p>
                    )}

                    {viewImageId != null ? (
                      <div className="space-y-2 rounded-lg border border-zinc-200 bg-white p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium">Preview #{viewImageId}</p>
                          <Button type="button" size="sm" variant="outline" onClick={() => setViewImageId(null)}>
                            ปิด
                          </Button>
                        </div>
                        {imageDataQ.isLoading ? (
                          <Skeleton className="h-40 w-full" />
                        ) : imageDataQ.isError ? (
                          <p className="text-sm text-red-600">{(imageDataQ.error as Error).message}</p>
                        ) : imageDataQ.data ? (
                          <img
                            src={`data:${imageDataQ.data.mime};base64,${imageDataQ.data.base64}`}
                            alt="confirmation"
                            className="max-h-[60vh] w-full rounded-md object-contain"
                          />
                        ) : null}
                      </div>
                    ) : null}
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          ) : null}
        </DialogContent>
      </Dialog>

      {d && orderId ? (
        <MovePlanDialog
          open={moveOpen}
          onOpenChange={setMoveOpen}
          idiw37={d.id}
          wkorder={d.wkorder}
          defaultDate={d.movePlan?.movedDate || d.plannedDate}
          onSuccess={() => {
            void detailQ.refetch()
          }}
        />
      ) : null}
    </>
  )
}
