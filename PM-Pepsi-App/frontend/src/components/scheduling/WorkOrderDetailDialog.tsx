import { ConfirmQcPanel } from '@/components/confirmation/ConfirmQcPanel'
import { ConfirmationImagesPanel } from '@/components/confirmation/ConfirmationImagesPanel'
import { MovePlanDialog } from '@/components/scheduling/MovePlanDialog'
import { WoPmPhaseBadge } from '@/components/scheduling/WoPmPhaseBadge'
import { PlanningMultiAssign } from '@/components/scheduling/PlanningMultiAssign'
import { WorkOrderWorkflowSteps } from '@/components/scheduling/WorkOrderWorkflowSteps'
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
  deletePersonnelClose,
  fetchConfirmationByWorkOrder,
  fetchPersonnelCloses,
  fetchConfirmationComments,
  fetchConfirmationImages,
  fetchWorkOrderModalDetail,
  fetchWorkOrderDetail,
  deleteWorkOrderPlanning,
  deleteWorkOrderPlanningAssignee,
  postConfirmationClose,
  postConfirmationComment,
  postPersonnelClose,
  postWorkOrderPlanningBatch,
  putWorkOrderPlanning,
  putWorkOrderTeam,
  putConfirmationComment,
} from '@/lib/api-public'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { getStoredAuthUser } from '@/features/auth/login-api'
import { usePermission } from '@/lib/use-permission'

type WorkOrderDetailDialogProps = {
  orderId: string | null
  onOpenChange: (open: boolean) => void
  contextDate?: string
  initialTab?: 'work-order' | 'task-list' | 'machine' | 'planning' | 'material' | 'confirm'
}

type MainTab = NonNullable<WorkOrderDetailDialogProps['initialTab']>
type ConfirmSubTab = 'images' | 'comments' | 'close' | 'personnel-close'

const OPEN_WO_SYST = new Set(['CRTD', 'REL'])

function isClosedWorkOrderStatus(systemStatus: string | undefined): boolean {
  const s = (systemStatus ?? '').trim().toUpperCase()
  return s.length > 0 && !OPEN_WO_SYST.has(s)
}

function isoToDdMmYyyy(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!m) return iso
  return `${m[3]}.${m[2]}.${m[1]}`
}

function epochToIsoDate(sec: number): string {
  const d = new Date(sec * 1000)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function epochToTime(sec: number): string {
  const d = new Date(sec * 1000)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
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

export function WorkOrderDetailDialog({
  orderId,
  onOpenChange,
  contextDate,
  initialTab = 'work-order',
}: WorkOrderDetailDialogProps) {
  const open = Boolean(orderId)
  const canPlan = usePermission('planning.assign')
  const [moveOpen, setMoveOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<MainTab>(initialTab)
  const [confirmTab, setConfirmTab] = useState<ConfirmSubTab>('close')
  const [closeWkctr, setCloseWkctr] = useState('')
  const [persWkctr, setPersWkctr] = useState('')
  const [persStartDate, setPersStartDate] = useState('')
  const [persEndDate, setPersEndDate] = useState('')
  const [persStartTime, setPersStartTime] = useState('08:00')
  const [persEndTime, setPersEndTime] = useState('17:00')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('17:00')
  const [newComment, setNewComment] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingText, setEditingText] = useState('')
  const [planComment, setPlanComment] = useState('')
  const wasOpenRef = useRef(false)

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

  const personAssignees = useMemo(
    () => modalQ.data?.planning.assignees.filter((a) => a.pwteam !== 'G' && a.kind === 'person') ?? [],
    [modalQ.data?.planning.assignees],
  )
  const groupAssignees = useMemo(
    () => modalQ.data?.planning.assignees.filter((a) => a.pwteam === 'G' || a.kind === 'group') ?? [],
    [modalQ.data?.planning.assignees],
  )

  const closesQ = useQuery({
    queryKey: ['confirmation', 'by-wkorder', d?.wkorder],
    queryFn: () => fetchConfirmationByWorkOrder(d!.wkorder),
    enabled: open && Boolean(d?.wkorder),
  })

  const personnelQ = useQuery({
    queryKey: ['confirmation', 'personnel-closes', idiw37],
    queryFn: () => fetchPersonnelCloses(idiw37!),
    enabled: open && typeof idiw37 === 'number' && Number.isFinite(idiw37),
  })

  const commentsQ = useQuery({
    queryKey: ['confirmation', 'comments', idiw37],
    queryFn: () => fetchConfirmationComments(idiw37!),
    enabled: open && typeof idiw37 === 'number' && Number.isFinite(idiw37),
  })

  const loadConfirmationImages =
    open &&
    activeTab === 'confirm' &&
    confirmTab === 'images' &&
    typeof idiw37 === 'number' &&
    Number.isFinite(idiw37)

  const imagesQ = useQuery({
    queryKey: ['confirmation', 'images', idiw37],
    queryFn: () => fetchConfirmationImages(idiw37!),
    enabled: loadConfirmationImages,
  })

  const personnelCount = personnelQ.data?.length ?? 0
  const supervisorCloseCount = closesQ.data?.items?.length ?? 0
  const imageCount =
    imagesQ.data?.length ?? d?.confirmQc?.imageCount ?? 0
  const confirmWorkflowDone = Boolean(
    d?.workflow?.steps?.some((s) => s.key === 'confirm' && s.done),
  )
  const showPostCloseReview = useMemo(
    () =>
      confirmWorkflowDone ||
      isClosedWorkOrderStatus(d?.systemStatus) ||
      personnelCount > 0 ||
      supervisorCloseCount > 0 ||
      imageCount > 0,
    [
      confirmWorkflowDone,
      d?.systemStatus,
      personnelCount,
      supervisorCloseCount,
      imageCount,
    ],
  )

  const openConfirmSubview = (sub: ConfirmSubTab) => {
    setActiveTab('confirm')
    setConfirmTab(sub)
  }

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

  const addPersCloseMut = useMutation({
    mutationFn: async () =>
      postPersonnelClose({
        idiw37: idiw37!,
        wkctr: persWkctr,
        startD: isoToDdMmYyyy(persStartDate),
        startT: persStartTime,
        endD: isoToDdMmYyyy(persEndDate),
        endT: persEndTime,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['confirmation', 'personnel-closes', idiw37] })
      await qc.invalidateQueries({ queryKey: ['work-order', orderId] })
    },
  })

  const delPersCloseMut = useMutation({
    mutationFn: (idwrkclose: number) => deletePersonnelClose(idwrkclose),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['confirmation', 'personnel-closes', idiw37] })
      await qc.invalidateQueries({ queryKey: ['work-order', orderId] })
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

  const assignPlanMut = useMutation({
    mutationFn: (args: { mode: 'P' | 'G'; code: string }) =>
      putWorkOrderPlanning(orderId!, { mode: args.mode, code: args.code, comment: planComment.trim() || undefined }),
    onSuccess: async (_data, args) => {
      setPlanComment('')
      toast.success(args.mode === 'G' ? 'จ่ายงานแบบกลุ่มสำเร็จ' : 'จ่ายงานช่างสำเร็จ')
      await qc.invalidateQueries({ queryKey: ['work-order', 'modal-detail', orderId] })
      await qc.invalidateQueries({ queryKey: ['work-order', orderId] })
    },
    onError: (e: Error) => toast.error(e.message || 'จ่ายงานไม่สำเร็จ'),
  })

  const teamMut = useMutation({
    mutationFn: (team: 'A' | 'B' | 'P') => putWorkOrderTeam(orderId!, team),
    onSuccess: async (_data, team) => {
      toast.success(`เพิ่มงานให้ Team ${team} สำเร็จ`)
      await qc.invalidateQueries({ queryKey: ['work-order', orderId] })
      await qc.invalidateQueries({ queryKey: ['work-orders', 'search'] })
      await qc.invalidateQueries({ queryKey: ['work-orders', 'filter-detail'] })
      await qc.invalidateQueries({ queryKey: ['plan-calendar'] })
      await qc.invalidateQueries({ queryKey: ['backlog'] })
      await qc.invalidateQueries({ queryKey: ['calendar'] })
    },
    onError: (e: Error) => toast.error(e.message || 'บันทึกทีมไม่สำเร็จ'),
  })

  const deletePlanMut = useMutation({
    mutationFn: () => deleteWorkOrderPlanning(orderId!),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['work-order', 'modal-detail', orderId] })
      await qc.invalidateQueries({ queryKey: ['work-order', orderId] })
    },
  })

  const removeAssigneeMut = useMutation({
    mutationFn: (wkctr: string) => deleteWorkOrderPlanningAssignee(orderId!, wkctr),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['work-order', 'modal-detail', orderId] })
      await qc.invalidateQueries({ queryKey: ['work-order', orderId] })
    },
  })

  const batchAssignMut = useMutation({
    mutationFn: (codes: string[]) =>
      postWorkOrderPlanningBatch(orderId!, {
        wkctrs: codes,
        comment: planComment.trim() || undefined,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['work-order', 'modal-detail', orderId] })
      await qc.invalidateQueries({ queryKey: ['work-order', orderId] })
    },
  })

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setActiveTab(initialTab)
      setConfirmTab('close')
    }
    wasOpenRef.current = open
  }, [open, orderId, initialTab])

  useEffect(() => {
    if (!d) return
    if (!closeWkctr) setCloseWkctr(d.workCenter)
  }, [d, closeWkctr])

  useEffect(() => {
    if (persWkctr) return
    const auth = getStoredAuthUser()
    if (auth?.wkctr) setPersWkctr(auth.wkctr)
    else if (d?.workCenter) setPersWkctr(d.workCenter)
  }, [d, persWkctr])

  function applyPersonnelToSupervisorClose(row: {
    wkctr: string
    cstdate: number
    cendate: number
  }) {
    setCloseWkctr(row.wkctr)
    setStartDate(epochToIsoDate(row.cstdate))
    setStartTime(epochToTime(row.cstdate))
    setEndDate(epochToIsoDate(row.cendate))
    setEndTime(epochToTime(row.cendate))
    setConfirmTab('close')
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[min(92dvh,900px)] w-[min(100vw-1rem,42rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <div className="shrink-0 space-y-3 border-b border-app px-4 pb-3 pt-6 sm:px-6">
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle className="pr-8 text-left">
                {d ? (
                  <span className="flex flex-wrap items-center gap-2">
                    <span>{d.title}</span>
                    <WoPmPhaseBadge phase={d.pmPhase} syst={d.status} showSyst />
                    {d.team ? <Badge variant="secondary">ทีม {d.team}</Badge> : null}
                  </span>
                ) : (
                  'รายละเอียดใบงาน'
                )}
              </DialogTitle>
              <DialogDescription className="text-left">
                {d
                  ? `ใบงาน ${d.wkorder} — แท็บข้อมูล · จ่ายงาน · รับรองปิดงาน`
                  : 'กำลังโหลดรายละเอียดใบงาน'}
              </DialogDescription>
            </DialogHeader>

            {d?.workflow ? (
              <WorkOrderWorkflowSteps
                steps={d.workflow.steps}
                suffix={d.workflow.suffix}
                compact
              />
            ) : null}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6">
          {showPostCloseReview && d ? (
            <div className="rounded-card border border-emerald-300 bg-emerald-50 p-3 text-body-sm text-emerald-950">
              <p className="font-medium">ปิดงานแล้ว — ดูรูปและเวลาในใบงานนี้</p>
              <p className="mt-1 text-xs text-emerald-800">
                เวลาช่าง {personnelCount} รายการ · ปิดงานหัวหน้า {supervisorCloseCount} รายการ · รูป{' '}
                {imageCount} ใบ
                {isClosedWorkOrderStatus(d.systemStatus) ? ` · สถานะ ${d.systemStatus}` : ''}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => openConfirmSubview('personnel-close')}
                >
                  เวลาช่าง ({personnelCount})
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => openConfirmSubview('close')}
                >
                  เวลาปิดงาน ({supervisorCloseCount})
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => openConfirmSubview('images')}
                >
                  รูปปิดงาน ({imageCount})
                </Button>
                <Button type="button" size="sm" variant="outline" asChild>
                  <Link
                    to="/confirmation"
                    state={{ wkorder: d.wkorder }}
                    onClick={() => onOpenChange(false)}
                  >
                    หน้ารับรองงาน
                  </Link>
                </Button>
              </div>
            </div>
          ) : null}

          {detailQ.isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : detailQ.isError ? (
            <p className="text-body-sm text-red-600">{(detailQ.error as Error).message}</p>
          ) : d ? (
            <Tabs
              key={orderId}
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as MainTab)}
              className="w-full"
            >
              <TabsList className="app-tabs-scroll flex h-auto w-full max-w-full flex-nowrap justify-start gap-1 overflow-x-auto">
                <TabsTrigger value="work-order" className="shrink-0">
                  ใบงาน
                </TabsTrigger>
                <TabsTrigger value="task-list" className="shrink-0">
                  Task list
                </TabsTrigger>
                <TabsTrigger value="machine" className="shrink-0">
                  เครื่องจักร
                </TabsTrigger>
                {canPlan ? (
                  <TabsTrigger value="planning" className="shrink-0">
                    จ่ายงาน
                  </TabsTrigger>
                ) : null}
                <TabsTrigger value="material" className="shrink-0">
                  วัสดุ
                </TabsTrigger>
                <TabsTrigger value="confirm" className="shrink-0 gap-2">
                  รับรอง
                  {showPostCloseReview ? (
                    <Badge variant="secondary" className="h-5 px-2 text-badge">
                      {imageCount > 0 ? `${imageCount} รูป` : 'ปิดแล้ว'}
                    </Badge>
                  ) : null}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="work-order" className="space-y-2 text-body-sm">
                <p>
                  <span className="font-medium text-app">Work Order / opac:</span> {d.wkorder}
                  {d.opac ? ` / ${d.opac}` : ''}
                </p>
                <p>
                  <span className="font-medium text-app">Maintenance plan:</span> {d.mntplan || '—'}
                </p>
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-app">Type / Status:</span>
                  <span>
                    {d.orderType} / {d.status}
                    {d.systemStatus && d.systemStatus !== d.status ? ` (${d.systemStatus})` : ''}
                  </span>
                  <WoPmPhaseBadge phase={d.pmPhase} syst={d.status} showSyst />
                </p>
                <p>
                  <span className="font-medium text-app">Resources:</span> {d.workCenter}
                  {d.resourcesLabel ? ` / ${d.resourcesLabel}` : ''}
                </p>
                <p>
                  <span className="font-medium text-app">Work / Action:</span> {d.work}
                  {d.actwork ? ` / ${d.actwork}` : ''}
                  {d.untime ? ` ${d.untime}` : ''}
                </p>
                <div className="space-y-2">
                  <span className="font-medium text-app">Team A/B/P</span>
                  <div className="flex flex-wrap gap-3">
                    {(['A', 'B', 'P'] as const).map((t) => (
                      <label key={t} className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name={`dialog-team-${d.id}`}
                          value={t}
                          checked={d.team === t}
                          onChange={() => teamMut.mutate(t)}
                          disabled={teamMut.isPending}
                        />
                        Team {t}
                      </label>
                    ))}
                  </div>
                </div>
                <p>
                  <span className="font-medium text-app">Equipment Desc.:</span> {d.equipment}
                </p>
                <p>
                  <span className="font-medium text-app">Functional Desc.:</span> {d.functLoc}
                </p>
                <p>
                  <span className="font-medium text-app">Plan / finish date:</span>{' '}
                  {d.plannedDate || '—'} / {d.finishDate || '—'}
                </p>
                {d.mat ? (
                  <p>
                    <span className="font-medium text-app">Mat:</span> {d.mat}
                  </p>
                ) : null}
                {d.movePlan ? (
                  <div className="rounded-card border border-orange-200 bg-orange-50/80 p-2 text-xs">
                    <p className="font-medium text-orange-900">ย้ายแผนแล้ว</p>
                    <p>
                      {d.movePlan.movedDate} · {d.movePlan.moveCount} ครั้ง · {d.movePlan.reasonName}
                    </p>
                  </div>
                ) : null}
                {d.canMovePlan ? (
                  <Button type="button" size="sm" variant="outline" onClick={() => setMoveOpen(true)}>
                    ย้ายแผน (New Plan)
                  </Button>
                ) : null}
                <p className="text-app-muted">{d.description}</p>
              </TabsContent>

              <TabsContent value="task-list" className="space-y-3 text-body-sm">
                <p className="text-xs text-app-muted">เทียบ `TabTarkList.php`</p>
                {modalQ.isLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : modalQ.isError ? (
                  <p className="text-body-sm text-red-600">{(modalQ.error as Error).message}</p>
                ) : modalQ.data ? (
                  <>
                    {modalQ.data.taskList.summary ? (
                      <div className="rounded-card border border-sky-200 bg-sky-50 p-3 text-body-sm">
                        <p className="font-medium text-sky-900">Task List {modalQ.data.taskList.summary.tasklist}</p>
                        <p className="text-xs text-sky-900/80">
                          {modalQ.data.taskList.summary.productline} / {modalQ.data.taskList.summary.zone} /{' '}
                          {modalQ.data.taskList.summary.wkctrtype}
                        </p>
                      </div>
                    ) : (
                      <p className="text-app-muted">ไม่ปรากฏ PM Task List</p>
                    )}

                    {modalQ.data.taskList.items.length ? (
                      <div className="space-y-1">
                        {modalQ.data.taskList.items.map((t, idx) => (
                          <div key={`${t.tasklist}-${t.machine}-${t.pmlist}-${idx}`} className="rounded-button border border-app bg-[var(--app-surface)] px-3 py-2">
                            <p className="text-body-sm text-app">
                              {idx + 1}. {t.machine} - {t.pmlist} / {t.mat ? `${t.mat} = ${t.matdescrip}` : ''}
                            </p>
                            <p className="text-xs text-app-muted">
                              สถานะเครื่อง: {t.machinestatus === 1 ? 'หยุด' : 'เดิน'}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : null}
              </TabsContent>

              <TabsContent value="machine" className="space-y-3 text-body-sm">
                <p className="text-xs text-app-muted">เทียบ `TabMachine.php`</p>
                {modalQ.isLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : modalQ.isError ? (
                  <p className="text-body-sm text-red-600">{(modalQ.error as Error).message}</p>
                ) : modalQ.data ? (
                  <>
                    {modalQ.data.machine.productline ? (
                      <div className="rounded-card border border-amber-200 bg-amber-50 p-3">
                        <p className="font-medium text-amber-900">
                          Product Line {modalQ.data.machine.productline}
                        </p>
                        <p className="text-body-sm text-amber-900/80">
                          Work : {modalQ.data.machine.uptime != null ? modalQ.data.machine.uptime : '—'}
                        </p>
                        <p className="mt-1 text-xs text-amber-900/70">วันที่อ้างอิง: {modalQ.data.date}</p>
                      </div>
                    ) : null}

                    {modalQ.data.machine.zone || modalQ.data.machine.wkctrtype ? (
                      <div className="rounded-card border border-sky-200 bg-sky-50 p-3">
                        <p className="text-body-sm text-sky-900">
                          Zone {modalQ.data.machine.zone} / {modalQ.data.machine.wkctrtype}
                        </p>
                      </div>
                    ) : null}

                    {modalQ.data.machine.machines.length ? (
                      <div className="space-y-1">
                        {modalQ.data.machine.machines.map((m) => (
                          <div key={m} className="rounded-button border border-app bg-[var(--app-surface)] px-3 py-2">
                            {m}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-app-muted">ไม่พบข้อมูล</p>
                    )}
                  </>
                ) : null}
              </TabsContent>

              <TabsContent value="planning" className="space-y-3 text-body-sm">
                {!canPlan ? (
                  <p className="text-app-muted">ไม่มีสิทธิ์ (Admin เท่านั้น)</p>
                ) : (
                  <>
                    <div className="rounded-card border border-app bg-[var(--app-surface)] p-3">
                      <p className="font-medium text-app">Planning Work</p>
                      <p className="text-xs text-app-muted">เทียบ `TabPlanning.php`</p>
                      <div className="mt-3 space-y-2">
                        <Label htmlFor="plan-comment">หมายเหตุ</Label>
                        <Input id="plan-comment" value={planComment} onChange={(e) => setPlanComment(e.target.value)} />
                      </div>
                    </div>

                    {d.movePlan ? (
                      <div className="rounded-card border border-orange-200 bg-orange-50/80 p-3">
                        <p className="font-medium text-orange-900">ย้ายแผนแล้ว</p>
                        <p>วันที่ย้าย: {d.movePlan.movedDate}</p>
                        <p>จำนวนครั้ง: {d.movePlan.moveCount}</p>
                        <p>
                          เหตุผล: {d.movePlan.reasonCode} — {d.movePlan.reasonName}
                        </p>
                        <p>โดย WC: {d.movePlan.movedByWkctr}</p>
                      </div>
                    ) : (
                      <p className="text-app-muted">ยังไม่มีการย้ายแผน</p>
                    )}

                    {d.canMovePlan ? (
                      <Button type="button" variant="outline" onClick={() => setMoveOpen(true)}>
                        ย้ายแผน (MovePlant)
                      </Button>
                    ) : (
                      <p className="text-xs text-app-muted">สถานะนี้ย้ายแผนไม่ได้ (ต้อง CRTD/REL และสิทธิ์)</p>
                    )}

                    {modalQ.isLoading ? (
                      <Skeleton className="h-48 w-full" />
                    ) : modalQ.isError ? (
                      <p className="text-body-sm text-red-600">{(modalQ.error as Error).message}</p>
                    ) : modalQ.data ? (
                      <>
                        <div className="space-y-4">
                          <div className="rounded-card border border-emerald-200 bg-emerald-50 p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="font-medium text-emerald-900">
                                ผู้รับผิดชอบรายบุคคล
                                <span className="ml-1 text-xs font-normal text-emerald-800/80">
                                  (เทียบ `ShowPlan.php`)
                                </span>
                              </p>
                              {modalQ.data.planning.assignees.length > 0 ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deletePlanMut.mutate()}
                                  disabled={deletePlanMut.isPending}
                                >
                                  ยกเลิกทั้งหมด
                                </Button>
                              ) : null}
                            </div>
                            {personAssignees.length === 0 ? (
                              <p className="mt-2 text-body-sm text-emerald-900/80">ยังไม่ได้จ่ายงานรายบุคคล</p>
                            ) : (
                              <div className="mt-3 overflow-auto rounded-button border border-emerald-200/80 bg-white">
                                <table className="min-w-full text-body-sm">
                                  <thead className="bg-emerald-100/80 text-emerald-950">
                                    <tr>
                                      <th className="px-3 py-2 text-left">รหัสช่าง</th>
                                      <th className="px-3 py-2 text-left">ชื่อ-สกุล</th>
                                      <th className="px-3 py-2 text-left">กลุ่มงาน</th>
                                      <th className="px-3 py-2 text-left">ตำแหน่ง</th>
                                      <th className="px-3 py-2 text-center">Action</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {personAssignees.map((a) => (
                                      <tr key={`${a.code}-${a.idplanw ?? ''}`} className="border-t">
                                        <td className="px-3 py-2 font-mono">{a.code}</td>
                                        <td className="px-3 py-2">{a.displayName}</td>
                                        <td className="px-3 py-2">{a.wkctrtype || '—'}</td>
                                        <td className="px-3 py-2">{a.position || '—'}</td>
                                        <td className="px-3 py-2 text-center">
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => removeAssigneeMut.mutate(a.code)}
                                            disabled={removeAssigneeMut.isPending}
                                          >
                                            ลบ
                                          </Button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>

                          <div className="rounded-card border border-app bg-[var(--app-surface)] p-3">
                            <p className="font-medium text-app">
                              ผู้รับผิดชอบรายกลุ่ม
                              <span className="ml-1 text-xs font-normal text-app-muted">
                                (เทียบ `ShowPlanGroup.php` — จ่ายแบบกลุ่ม)
                              </span>
                            </p>
                            {groupAssignees.length === 0 ? (
                              <p className="mt-2 text-caption">ยังไม่มีการจ่ายงานแบบกลุ่ม</p>
                            ) : (
                              <div className="mt-3 overflow-auto rounded-button border border-app">
                                <table className="min-w-full text-body-sm">
                                  <thead className="bg-app-subtle text-app">
                                    <tr>
                                      <th className="px-3 py-2 text-left">รหัสช่าง</th>
                                      <th className="px-3 py-2 text-left">ชื่อ-สกุล</th>
                                      <th className="px-3 py-2 text-center">Action</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {groupAssignees.map((a) => (
                                      <tr key={`g-${a.code}-${a.idplanw ?? ''}`} className="border-t">
                                        <td className="px-3 py-2 font-mono">{a.code}</td>
                                        <td className="px-3 py-2">{a.displayName}</td>
                                        <td className="px-3 py-2 text-center">
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => removeAssigneeMut.mutate(a.code)}
                                            disabled={removeAssigneeMut.isPending}
                                          >
                                            ลบ
                                          </Button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>

                        <PlanningMultiAssign
                          workcenters={modalQ.data.planning.workcenters}
                          assignedCodes={modalQ.data.planning.assignees.map((a) => a.code)}
                          comment={planComment}
                          onCommentChange={setPlanComment}
                          submitting={batchAssignMut.isPending}
                          onAssign={async (codes) => {
                            const res = await batchAssignMut.mutateAsync(codes)
                            return {
                              assigned: res.assigned,
                              skipped: res.skipped,
                              notFound: res.notFound,
                            }
                          }}
                        />

                        <details className="rounded-card border border-app bg-[var(--app-surface)] p-3">
                          <summary className="cursor-pointer text-body-sm font-medium text-app">
                            จ่ายงานรายบุคคล (Quick assign — คลิก 1 ครั้ง/คน)
                          </summary>
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
                        </details>

                        <div className="rounded-card border border-app bg-[var(--app-surface)] p-3">
                          <p className="font-medium text-app">Planning GROUP</p>
                          <div className="mt-3 overflow-auto rounded-button border border-app">
                            <table className="min-w-full text-body-sm">
                              <thead className="bg-app-subtle text-app">
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

              <TabsContent value="material" className="space-y-2 text-body-sm">
                {modalQ.isLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : modalQ.isError ? (
                  <p className="text-body-sm text-red-600">{(modalQ.error as Error).message}</p>
                ) : modalQ.data ? (
                  modalQ.data.materials.items.length ? (
                    <div className="overflow-auto rounded-card border border-app">
                      <table className="min-w-full text-body-sm">
                        <thead className="bg-app-subtle text-app">
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
                    <p className="text-app-muted">ไม่พบข้อมูล</p>
                  )
                ) : null}
              </TabsContent>

              <TabsContent value="confirm" className="space-y-4 text-body-sm">
                <ConfirmQcPanel
                  idiw37={idiw37}
                  wkorder={d.wkorder}
                  initialQc={d.confirmQc}
                  enabled={open && typeof idiw37 === 'number'}
                  onQcChange={() => {
                    void detailQ.refetch()
                  }}
                />

                <Tabs value={confirmTab} onValueChange={(v) => setConfirmTab(v as ConfirmSubTab)}>
                  <TabsList className="app-tabs-scroll flex h-auto w-full max-w-full flex-nowrap justify-start gap-1 overflow-x-auto">
                    <TabsTrigger value="personnel-close" className="shrink-0">
                      เวลาช่าง{personnelCount > 0 ? ` (${personnelCount})` : ''}
                    </TabsTrigger>
                    <TabsTrigger value="close" className="shrink-0">
                      ปิดงาน{supervisorCloseCount > 0 ? ` (${supervisorCloseCount})` : ''}
                    </TabsTrigger>
                    <TabsTrigger value="images" className="shrink-0">
                      รูปปิดงาน{imageCount > 0 ? ` (${imageCount})` : ''}
                    </TabsTrigger>
                    <TabsTrigger value="comments" className="shrink-0">
                      หมายเหตุ
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="personnel-close" className="space-y-3">
                    <p className="text-xs text-app-muted">
                      เทียบ `AddClosePersonel.php` / `ShowWorkClose.php` — ช่างบันทึกเวลาก่อนรับรองปิดงาน (tbwrkclose)
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor="p-wkctr">รหัสช่าง (wkctr)</Label>
                        <Input id="p-wkctr" value={persWkctr} onChange={(e) => setPersWkctr(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="p-start-date">วันเริ่ม</Label>
                        <DatePicker id="p-start-date" value={persStartDate} onChange={setPersStartDate} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="p-start-time">เวลาเริ่ม</Label>
                        <Input
                          id="p-start-time"
                          type="time"
                          value={persStartTime}
                          onChange={(e) => setPersStartTime(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="p-end-date">วันสิ้นสุด</Label>
                        <DatePicker id="p-end-date" value={persEndDate} onChange={setPersEndDate} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="p-end-time">เวลาสิ้นสุด</Label>
                        <Input
                          id="p-end-time"
                          type="time"
                          value={persEndTime}
                          onChange={(e) => setPersEndTime(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => addPersCloseMut.mutate()}
                      disabled={
                        !persWkctr ||
                        !persStartDate ||
                        !persEndDate ||
                        !persStartTime ||
                        !persEndTime ||
                        addPersCloseMut.isPending
                      }
                    >
                      บันทึกเวลาช่าง
                    </Button>

                    {personnelQ.isLoading ? (
                      <Skeleton className="h-24 w-full" />
                    ) : personnelQ.isError ? (
                      <p className="text-body-sm text-red-600">{(personnelQ.error as Error).message}</p>
                    ) : personnelQ.data?.length ? (
                      <div className="space-y-2">
                        {personnelQ.data.map((p) => (
                          <div
                            key={p.idwrkclose}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-app bg-[var(--app-surface)] p-3"
                          >
                            <div className="min-w-0">
                              <p className="font-medium">
                                {p.wkctr} {p.displayName ? `— ${p.displayName}` : ''}
                              </p>
                              <p className="text-xs text-app-muted">
                                {fmtDateTime(p.cstdate)} → {fmtDateTime(p.cendate)} ({p.wktimewk} {p.wkunit})
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => applyPersonnelToSupervisorClose(p)}
                              >
                                ยืนยันปิดงาน
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setPersWkctr(p.wkctr)
                                  setPersStartDate(epochToIsoDate(p.cstdate))
                                  setPersStartTime(epochToTime(p.cstdate))
                                  setPersEndDate(epochToIsoDate(p.cendate))
                                  setPersEndTime(epochToTime(p.cendate))
                                }}
                              >
                                แก้ไข
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => delPersCloseMut.mutate(p.idwrkclose)}
                                disabled={delPersCloseMut.isPending}
                              >
                                ลบ
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-caption">ยังไม่มีการบันทึกเวลาช่าง</p>
                    )}
                  </TabsContent>

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
                      <p className="text-body-sm text-red-600">{(closesQ.error as Error).message}</p>
                    ) : closesQ.data?.items?.length ? (
                      <div className="space-y-2">
                        {closesQ.data.items.map((c) => (
                          <div key={c.idclose} className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-app bg-[var(--app-surface)] p-3">
                            <div className="min-w-0">
                              <p className="font-medium">
                                {c.wkctr} {c.displayName ? `— ${c.displayName}` : ''}
                              </p>
                              <p className="text-xs text-app-muted">
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
                      <p className="text-caption">ยังไม่มีประวัติการปิดงาน</p>
                    )}
                  </TabsContent>

                  <TabsContent value="comments" className="space-y-3">
                    <div className="space-y-2 rounded-card border border-app bg-[var(--app-surface)] p-3">
                      <Label htmlFor="new-comment">Comment</Label>
                      <Textarea id="new-comment" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                      <Button type="button" onClick={() => addCommentMut.mutate()} disabled={!newComment.trim() || addCommentMut.isPending}>
                        เพิ่ม
                      </Button>
                    </div>

                    {commentsQ.isLoading ? (
                      <Skeleton className="h-24 w-full" />
                    ) : commentsQ.isError ? (
                      <p className="text-body-sm text-red-600">{(commentsQ.error as Error).message}</p>
                    ) : commentsQ.data?.length ? (
                      <div className="space-y-2">
                        {commentsQ.data.map((c) => (
                          <div key={c.idcom} className="rounded-card border border-app bg-[var(--app-surface)] p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-xs text-app-muted">
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
                              <p className="mt-2 whitespace-pre-wrap text-body-sm text-app">{c.comdetail}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-caption">ยังไม่มี comment</p>
                    )}
                  </TabsContent>

                  <TabsContent value="images" className="space-y-3">
                    <ConfirmationImagesPanel
                      idiw37={idiw37}
                      enabled={loadConfirmationImages}
                    />
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          ) : null}
          </div>
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
