import { CanPermission } from '@/components/auth/CanPermission'
import { ReportExportButton } from '@/components/reports/ReportExportButton'
import { ConfirmQcPendingQueue } from '@/components/confirmation/ConfirmQcPendingQueue'
import { ConfirmationImagesPanel } from '@/components/confirmation/ConfirmationImagesPanel'
import { AppCard } from '@/components/layout/AppCard'
import { AppPageShell } from '@/components/layout/AppPageShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { PlaceholderBlock } from '@/components/layout/PlaceholderBlock'
import { EmptyState } from '@/components/ui/empty-state'
import { PlanningMultiAssign } from '@/components/scheduling/PlanningMultiAssign'
import { WorkOrderAutocomplete } from '@/components/scheduling/WorkOrderAutocomplete'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  deleteWorkOrderPlanning,
  deleteWorkOrderPlanningAssignee,
  deleteConfirmationClose,
  fetchConfirmationByWorkOrder,
  confirmationSapCsvFilename,
  fetchConfirmationExport,
  fetchConfirmationExportCsv,
  fetchConfirmationExportXlsx,
  fetchWorkOrderDetail,
  fetchWorkOrderModalDetail,
  fetchWorkcenters,
  postConfirmationClose,
  postConfirmationImport,
  postWorkOrderPlanningBatch,
  putWorkOrderPlanning,
} from '@/lib/api-public'
import { getStoredAuthUser } from '@/features/auth/login-api'
import type { ConfirmationImportResponse } from '@/api/schemas'
import { usePermission } from '@/lib/use-permission'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ChangeEvent, ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MassConfirmSearchCard } from '@/features/confirmation/MassConfirmSearchCard'
import { AlertCircle, ClipboardList, Search } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

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
              <code className="rounded bg-app-muted px-1">{m}</code>
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
          <Link to="/calendar">ไปปฏิทินรายเดือน</Link>
        </Button>
      }
    />
  )
}

/** Admin: `M_confirmation.php` — ช่าง: ใช้ `W_planwork_view` เป็นเมนู Confirmation ในเมนูสำรอง */
export function ConfirmationParityPage() {
  const qc = useQueryClient()
  const location = useLocation()
  const authUser = getStoredAuthUser()
  const isAdmin = (authUser?.userst ?? '').trim() === 'A'
  const canRead = usePermission('confirmation.read')
  const canImportConfirm = usePermission('confirmation.import') || isAdmin
  const canWriteClose = usePermission('confirmation.write') || usePermission('confirmation.close')
  const [wkorder, setWkorder] = useState('')
  const wkorderTrimmed = wkorder.trim()
  const canSearchWo = wkorderTrimmed.length >= 1
  const [importResult, setImportResult] = useState<ConfirmationImportResponse | null>(null)
  const importFileRef = useRef<HTMLInputElement>(null)
  const [planComment, setPlanComment] = useState('')
  const [exporting, setExporting] = useState<'xlsx' | 'csv' | null>(null)

  const today = useMemo(() => {
    const d = new Date()
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = String(d.getFullYear())
    return `${dd}.${mm}.${yyyy}`
  }, [])

  const [startD, setStartD] = useState(today)
  const [endD, setEndD] = useState(today)
  const [startT, setStartT] = useState('')
  const [endT, setEndT] = useState('')

  const workcentersQ = useQuery({
    queryKey: ['workcenters'],
    queryFn: fetchWorkcenters,
    retry: 0,
  })

  const detailQ = useQuery({
    queryKey: ['work-order-detail', wkorderTrimmed],
    queryFn: () => fetchWorkOrderDetail(wkorderTrimmed),
    enabled: canSearchWo,
    retry: 0,
  })

  const confirmationQ = useQuery({
    queryKey: ['confirmation-by-wkorder', wkorderTrimmed],
    queryFn: () => fetchConfirmationByWorkOrder(wkorderTrimmed),
    enabled: canSearchWo,
    retry: 0,
  })

  const modalDetailQ = useQuery({
    queryKey: ['work-order-modal-detail', wkorderTrimmed],
    queryFn: () => fetchWorkOrderModalDetail(wkorderTrimmed),
    enabled: canSearchWo,
    retry: 0,
  })

  const idiw37 = useMemo(() => {
    const fromConfirmation = confirmationQ.data?.idiw37
    if (typeof fromConfirmation === 'number' && Number.isFinite(fromConfirmation)) return fromConfirmation
    const fromDetail = Number(detailQ.data?.id)
    return Number.isFinite(fromDetail) ? fromDetail : null
  }, [confirmationQ.data?.idiw37, detailQ.data?.id])

  const addClose = useMutation({
    mutationFn: postConfirmationClose,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['confirmation-by-wkorder', wkorder] })
      toast.success('บันทึกปิดงานแล้ว')
    },
    onError: (err) => toast.error((err as Error).message),
  })

  const delClose = useMutation({
    mutationFn: deleteConfirmationClose,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['confirmation-by-wkorder', wkorder] })
      toast.success('ลบรายการปิดงานแล้ว')
    },
    onError: (err) => toast.error((err as Error).message),
  })

  const importMut = useMutation({
    mutationFn: (file: File) => postConfirmationImport(file),
    onSuccess: async (res) => {
      setImportResult(res)
      const ok = res.inserted + res.updated
      const failTotal = res.skipped + res.errors
      if (failTotal === 0) toast.success(`นำเข้าสำเร็จ ${ok}/${res.totalRows} แถว`)
      else toast.warning(`นำเข้าเสร็จ: สำเร็จ ${ok} ล้มเหลว ${failTotal} (รวม ${res.totalRows} แถว)`)
      if (wkorder) {
        await qc.invalidateQueries({ queryKey: ['confirmation-by-wkorder', wkorder] })
      }
    },
    onError: (err) => toast.error((err as Error).message),
  })

  const onPickImportFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    importMut.mutate(f)
    e.target.value = ''
  }

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const onExportConfirm = async (format: 'xlsx' | 'csv') => {
    try {
      setExporting(format)
      const blob =
        format === 'xlsx'
          ? await fetchConfirmationExportXlsx()
          : await fetchConfirmationExportCsv()
      const name =
        format === 'xlsx' ? 'Export_Confirm.xlsx' : confirmationSapCsvFilename()
      downloadBlob(blob, name)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'ดาวน์โหลดไม่สำเร็จ')
    } finally {
      setExporting(null)
    }
  }

  const assignPlan = useMutation({
    mutationFn: (args: { mode: 'P' | 'G'; code: string }) =>
      putWorkOrderPlanning(wkorder, {
        mode: args.mode,
        code: args.code,
        comment: planComment.trim() || undefined,
      }),
    onSuccess: async () => {
      setPlanComment('')
      await qc.invalidateQueries({ queryKey: ['work-order-modal-detail', wkorder] })
      await modalDetailQ.refetch()
      toast.success('Assigned')
    },
    onError: (err) => toast.error((err as Error).message),
  })

  const clearPlan = useMutation({
    mutationFn: () => deleteWorkOrderPlanning(wkorder),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['work-order-modal-detail', wkorder] })
      await modalDetailQ.refetch()
      toast.success('Removed')
    },
    onError: (err) => toast.error((err as Error).message),
  })

  const removeAssignee = useMutation({
    mutationFn: (wkctr: string) => deleteWorkOrderPlanningAssignee(wkorder, wkctr),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['work-order-modal-detail', wkorder] })
      await modalDetailQ.refetch()
      toast.success('Removed assignee')
    },
    onError: (err) => toast.error((err as Error).message),
  })

  const batchAssign = useMutation({
    mutationFn: (codes: string[]) =>
      postWorkOrderPlanningBatch(wkorder, {
        wkctrs: codes,
        comment: planComment.trim() || undefined,
      }),
    onSuccess: async (res) => {
      await qc.invalidateQueries({ queryKey: ['work-order-modal-detail', wkorder] })
      await modalDetailQ.refetch()
      if (res.assigned.length > 0) {
        toast.success(`Assigned ${res.assigned.length} คน`)
      } else if (res.skipped.length > 0) {
        toast.info('ทั้งหมดถูกจ่ายไปแล้ว')
      }
      if (res.notFound.length > 0) {
        toast.warning(`ไม่พบ wkctr: ${res.notFound.join(', ')}`)
      }
    },
    onError: (err) => toast.error((err as Error).message),
  })

  const loadWorkOrder = async (wo: string) => {
    const w = wo.trim()
    if (!w) {
      toast.error('กรุณาระบุเลขที่ใบงาน')
      return
    }
    if (w === wkorderTrimmed && canSearchWo) {
      await Promise.all([detailQ.refetch(), confirmationQ.refetch(), modalDetailQ.refetch()])
      return
    }
    setWkorder(w)
  }

  useEffect(() => {
    const w = (location.state as { wkorder?: string } | null)?.wkorder?.trim()
    if (w) void loadWorkOrder(w)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when navigating from WO modal
  }, [location.key])

  const onGo = () => void loadWorkOrder(wkorder)

  if (!canRead) {
    return (
      <AppPageShell
        title="รับรองงาน (Confirmation)"
        description="ปิดงานช่าง · นำเข้า Confirm · รูป before/after · Mass confirm ≤44"
      >
        <EmptyState
          icon={AlertCircle}
          title="ไม่มีสิทธิ์เข้าถึง"
          description={
            <>
              ต้องมีสิทธิ์ <code className="text-xs">confirmation.read</code>
            </>
          }
        />
      </AppPageShell>
    )
  }

  return (
    <>
      <AppPageShell
        title="รับรองงาน (Confirmation)"
        description="ค้นหา WO · บันทึกปิดงาน · รูปประกอบ · Mass confirm (สูงสุด 44 รายการต่อ SAP)"
        contentClassName="space-y-4"
        headerActions={
          <>
            <Badge variant="secondary" className="text-xs">
              Mass ≤44
            </Badge>
            <CanPermission permission="confirmation.read">
              <Button type="button" variant="outline" size="sm" asChild>
                <Link to="/confirmation/export">ดูตัวอย่าง Export</Link>
              </Button>
            </CanPermission>
            <CanPermission permission="confirmation.import">
              <ReportExportButton
                format="xlsx"
                label="ส่งออก Excel"
                loading={exporting === 'xlsx'}
                loadingLabel="กำลังส่งออก…"
                disabled={exporting != null}
                onClick={() => void onExportConfirm('xlsx')}
              />
              <ReportExportButton
                format="csv"
                label="CSV สำหรับ SAP"
                loading={exporting === 'csv'}
                loadingLabel="กำลังส่งออก…"
                disabled={exporting != null}
                onClick={() => void onExportConfirm('csv')}
              />
            </CanPermission>
            <CanPermission permission="work-orders.read">
              <Button type="button" variant="outline" size="sm" asChild>
                <Link to="/work-orders">ใบงาน WO</Link>
              </Button>
            </CanPermission>
            <CanPermission permission="planning.read">
              <Button type="button" variant="outline" size="sm" asChild>
                <Link to="/planning">แผนงาน</Link>
              </Button>
            </CanPermission>
          </>
        }
      >
        <MassConfirmSearchCard />

        {canImportConfirm ? (
          <ConfirmQcPendingQueue
            enabled
            onOpenWo={(wo) => {
              void loadWorkOrder(wo)
            }}
          />
        ) : null}

        {canImportConfirm ? (
          <AppCard pad="compact">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-body-sm font-medium text-app">
                  นำเข้า Confirm (Excel)
                </div>
                <p className="text-xs text-app-muted">
                  อัปโหลด <code>Confirm.xlsx</code> — ระบบจะ skip 2 แถวแรกตาม PHP และ validate
                  คอลัมน์ Row 0/3/6/7/8/10/11/14/15/16/17
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={importFileRef}
                  type="file"
                  accept=".xls,.xlsx,.csv"
                  className="hidden"
                  onChange={onPickImportFile}
                />
                <Button
                  type="button"
                  variant="default"
                  disabled={importMut.isPending}
                  onClick={() => importFileRef.current?.click()}
                >
                  {importMut.isPending ? 'กำลังนำเข้า…' : 'อัปโหลด Excel'}
                </Button>
              </div>
            </div>

            {importResult ? (
              <div className="mt-4 space-y-2">
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">file: {importResult.fileName}</Badge>
                  <Badge variant="outline">total: {importResult.totalRows}</Badge>
                  <Badge variant="secondary">inserted: {importResult.inserted}</Badge>
                  <Badge variant="secondary">updated: {importResult.updated}</Badge>
                  <Badge
                    variant={importResult.skipped > 0 ? 'destructive' : 'outline'}
                  >
                    skipped: {importResult.skipped}
                  </Badge>
                  <Badge variant={importResult.errors > 0 ? 'destructive' : 'outline'}>
                    errors: {importResult.errors}
                  </Badge>
                </div>
                <div className="app-table-shell overflow-hidden">
                  <Table embedded stickyHeader zebra>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16 text-center">แถว</TableHead>
                        <TableHead className="w-28">สถานะ</TableHead>
                        <TableHead>Confirm</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>WkCtr</TableHead>
                        <TableHead>Start</TableHead>
                        <TableHead>Finish</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importResult.rows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="py-6 text-center text-caption">
                            ไม่มีแถวข้อมูล (Excel ว่างหลังจาก skip 2 แถวแรก)
                          </TableCell>
                        </TableRow>
                      ) : (
                        importResult.rows.map((r) => (
                          <TableRow key={`${r.rowNo}-${r.confirmation}-${r.wkctr}`}>
                            <TableCell className="text-center tabular-nums">{r.rowNo}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  r.action === 'inserted' || r.action === 'updated'
                                    ? 'secondary'
                                    : 'destructive'
                                }
                              >
                                {r.action}
                              </Badge>
                            </TableCell>
                            <TableCell className="tabular-nums">{r.confirmation}</TableCell>
                            <TableCell className="tabular-nums">{r.wkorder}</TableCell>
                            <TableCell className="tabular-nums">{r.wkctr}</TableCell>
                            <TableCell className="tabular-nums">
                              {r.stdate ? new Date(r.stdate * 1000).toLocaleString() : ''}
                            </TableCell>
                            <TableCell className="tabular-nums">
                              {r.endate ? new Date(r.endate * 1000).toLocaleString() : ''}
                            </TableCell>
                            <TableCell className="text-xs text-app-muted">{r.message}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : null}
          </AppCard>
        ) : null}

        <AppCard pad="compact">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div>
              <Label htmlFor="wkorder">เลขที่ใบงาน (Work Order)</Label>
              <WorkOrderAutocomplete
                value={wkorder}
                placeholder="พิมพ์เลข WO หรือคำค้น"
                minLength={1}
                onInputChange={setWkorder}
                onSelect={(item) => void loadWorkOrder(item.wkorder)}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                className="gap-2"
                onClick={onGo}
                disabled={detailQ.isFetching || confirmationQ.isFetching}
              >
                <Search className="size-4" aria-hidden />
                เปิดใบงาน
              </Button>
            </div>
          </div>

          <div className="mt-4">
            {!canSearchWo ? (
              <p className="text-caption">
                ใส่เลข WO แล้วกด「เปิดใบงาน」หรือเลือกจากรายการค้นหา
              </p>
            ) : null}
            {(detailQ.isFetching || confirmationQ.isFetching) && !detailQ.data && !confirmationQ.data ? (
              <Skeleton className="h-24 w-full rounded-card" aria-label="กำลังโหลดใบงาน" />
            ) : null}
            {detailQ.isError ? (
              <EmptyState
                icon={AlertCircle}
                title="โหลดใบงานไม่สำเร็จ"
                description={(detailQ.error as Error).message}
                action={{ label: 'ลองใหม่', onClick: () => void detailQ.refetch() }}
                className="mt-2"
              />
            ) : null}
            {confirmationQ.isError ? (
              <EmptyState
                icon={AlertCircle}
                title="โหลดข้อมูลรับรองไม่สำเร็จ"
                description={(confirmationQ.error as Error).message}
                action={{ label: 'ลองใหม่', onClick: () => void confirmationQ.refetch() }}
                className="mt-2"
              />
            ) : null}
            {canSearchWo && confirmationQ.isSuccess && detailQ.isSuccess ? (
              <p className="mt-2 text-xs text-app-muted">
                WO {confirmationQ.data.wkorder} · idiw37 {confirmationQ.data.idiw37} · ปิดงาน{' '}
                {confirmationQ.data.items.length} รายการ
              </p>
            ) : null}
          </div>
        </AppCard>

        <Tabs defaultValue="workorder" className="w-full">
          <TabsList>
            <TabsTrigger value="workorder">ใบงาน + Task List</TabsTrigger>
            <TabsTrigger value="confirmation">ปิดงาน / Confirm</TabsTrigger>
            <TabsTrigger value="images">รูป before/after</TabsTrigger>
            <TabsTrigger value="planning">จ่ายงาน (Planning)</TabsTrigger>
          </TabsList>

          <TabsContent value="workorder" className="mt-4">
            {!detailQ.data ? (
              <EmptyState
                icon={ClipboardList}
                title="ยังไม่ได้เลือกใบงาน"
                description="ค้นหาเลข WO ด้านบนก่อนดูรายละเอียดและ Task List"
              />
            ) : (
              <div className="app-page-content space-y-4">
                <div className="app-card app-card-pad-compact">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-body-sm font-medium text-app">รายละเอียด Work Order</div>
                      <div className="text-xs text-app-muted">เทียบ `confirmTab1.php` — header + operation detail</div>
                    </div>
                    <Badge variant="outline">{detailQ.data.status}</Badge>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="text-body-sm">
                      <div className="text-xs text-app-muted">Work Order</div>
                      <div className="font-medium tabular-nums">{detailQ.data.wkorder}</div>
                    </div>
                    <div className="text-body-sm">
                      <div className="text-xs text-app-muted">Work Center</div>
                      <div className="font-medium">{detailQ.data.workCenter}</div>
                    </div>
                    <div className="text-body-sm">
                      <div className="text-xs text-app-muted">Functional Location</div>
                      <div className="font-medium">{detailQ.data.functLoc}</div>
                      <div className="text-xs text-app-muted">{detailQ.data.description}</div>
                    </div>
                    <div className="text-body-sm">
                      <div className="text-xs text-app-muted">Equipment</div>
                      <div className="font-medium">{detailQ.data.equipment}</div>
                    </div>
                    <div className="text-body-sm">
                      <div className="text-xs text-app-muted">Start / End</div>
                      <div className="font-medium tabular-nums">
                        {detailQ.data.plannedDate || '—'} → {detailQ.data.finishDate || '—'}
                      </div>
                    </div>
                    <div className="text-body-sm">
                      <div className="text-xs text-app-muted">Activity Type / Mat</div>
                      <div className="font-medium tabular-nums">{detailQ.data.mat || '—'}</div>
                    </div>
                    <div className="text-body-sm sm:col-span-2">
                      <div className="text-xs text-app-muted">Header Short Text</div>
                      <div className="font-medium">{detailQ.data.title}</div>
                    </div>
                    {(detailQ.data.operations ?? []).map((op) => (
                      <div key={`${op.no}-${op.desc}`} className="text-body-sm sm:col-span-2">
                        <div className="text-xs text-app-muted">Operation {op.no}</div>
                        <div className="font-medium">
                          {op.desc} {op.wc ? `(${op.wc})` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="app-card app-card-pad-compact">
                  <div className="mb-3 text-body-sm font-medium text-app">
                    PM Task List จาก `view_tarklist`
                  </div>
                  {modalDetailQ.isFetching && !modalDetailQ.data ? (
                    <Skeleton className="h-24 w-full rounded-card" />
                  ) : modalDetailQ.isError ? (
                    <p className="text-body-sm text-red-600">{(modalDetailQ.error as Error).message}</p>
                  ) : modalDetailQ.data?.taskList.items.length ? (
                    <div className="space-y-2">
                      {modalDetailQ.data.taskList.summary ? (
                        <div className="rounded-card border border-sky-200 bg-sky-50 p-3 text-body-sm">
                          <div className="font-medium text-sky-900">
                            Task List {modalDetailQ.data.taskList.summary.tasklist}
                          </div>
                          <div className="text-xs text-sky-900/80">
                            {modalDetailQ.data.taskList.summary.productline} /{' '}
                            {modalDetailQ.data.taskList.summary.zone} /{' '}
                            {modalDetailQ.data.taskList.summary.wkctrtype}
                          </div>
                        </div>
                      ) : null}
                      {modalDetailQ.data.taskList.items.map((t, idx) => (
                        <div
                          key={`${t.tasklist}-${t.machine}-${t.pmlist}-${idx}`}
                          className="rounded-button border border-app bg-[var(--app-surface)] px-3 py-2"
                        >
                          <div className="text-body-sm text-app">
                            {idx + 1}. {t.machine} - {t.pmlist}
                            {t.mat ? ` / ${t.mat} = ${t.matdescrip}` : ''}
                          </div>
                          <div className="text-xs text-app-muted">
                            สถานะเครื่อง: {t.machinestatus === 1 ? 'หยุด' : 'เดิน'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-caption">ไม่พบ PM Task List</p>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="confirmation" className="mt-4 space-y-4">
            <div className="app-card app-card-pad-compact">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Label htmlFor="startD">Start date</Label>
                  <Input id="startD" value={startD} onChange={(e) => setStartD(e.target.value)} placeholder="DD.MM.YYYY" />
                </div>
                <div>
                  <Label htmlFor="startT">Start time</Label>
                  <Input id="startT" value={startT} onChange={(e) => setStartT(e.target.value)} placeholder="HH:MM" />
                </div>
                <div>
                  <Label htmlFor="endD">End date</Label>
                  <Input id="endD" value={endD} onChange={(e) => setEndD(e.target.value)} placeholder="DD.MM.YYYY" />
                </div>
                <div>
                  <Label htmlFor="endT">End time</Label>
                  <Input id="endT" value={endT} onChange={(e) => setEndT(e.target.value)} placeholder="HH:MM" />
                </div>
              </div>
            </div>

            <div className="app-card app-card-pad-compact">
              <div className="mb-3 text-body-sm font-medium text-app">Technicians</div>
              {workcentersQ.isLoading ? (
                <Skeleton className="h-24 w-full rounded-card" />
              ) : workcentersQ.isError ? (
                <p className="text-body-sm text-red-600">{(workcentersQ.error as Error).message}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(workcentersQ.data ?? []).map((wc) => (
                    <Button
                      key={wc.wkctr}
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={typeof idiw37 !== 'number' || addClose.isPending || !canWriteClose}
                      onClick={() => {
                        if (typeof idiw37 !== 'number') {
                          toast.error('กรุณาเปิดใบงานก่อน')
                          return
                        }
                        if (!canWriteClose) {
                          toast.error('ไม่มีสิทธิ์บันทึกปิดงาน')
                          return
                        }
                        addClose.mutate({
                          idiw37,
                          wkctr: wc.wkctr,
                          startD,
                          startT,
                          endD,
                          endT,
                        })
                      }}
                    >
                      <span className="tabular-nums">{wc.wkctr}</span>
                      {wc.displayName ? <span className="ml-2">{wc.displayName}</span> : null}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <div className="overflow-hidden app-table-shell">
              <Table embedded stickyHeader zebra>
                <TableHeader>
                  <TableRow>
                    <TableHead>รหัสช่าง</TableHead>
                    <TableHead>ชื่อ</TableHead>
                    <TableHead>เริ่ม</TableHead>
                    <TableHead>สิ้นสุด</TableHead>
                    <TableHead className="text-right">นาที</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!canSearchWo ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-caption">
                        เปิดใบงานก่อน
                      </TableCell>
                    </TableRow>
                  ) : confirmationQ.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8">
                        <Skeleton className="h-12 w-full rounded-card" />
                      </TableCell>
                    </TableRow>
                  ) : confirmationQ.isError ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-body-sm text-red-600">
                        {(confirmationQ.error as Error).message}
                      </TableCell>
                    </TableRow>
                  ) : !confirmationQ.data ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-caption">
                        No data
                      </TableCell>
                    </TableRow>
                  ) : (confirmationQ.data.items ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-caption">
                        ยังไม่มีรายการปิดงาน
                      </TableCell>
                    </TableRow>
                  ) : (
                    (confirmationQ.data.items ?? []).map((row) => (
                      <TableRow key={row.idclose}>
                        <TableCell className="tabular-nums">{row.wkctr}</TableCell>
                        <TableCell>{row.displayName}</TableCell>
                        <TableCell className="tabular-nums">
                          {row.stdate ? new Date(row.stdate * 1000).toLocaleString() : ''}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {row.endate ? new Date(row.endate * 1000).toLocaleString() : ''}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.timewk} {row.unitc}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            disabled={delClose.isPending || !canWriteClose}
                            onClick={() => delClose.mutate(row.idclose)}
                          >
                            ลบ
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="images" className="mt-4">
            <div className="app-page-content">
              <ConfirmationImagesPanel idiw37={idiw37} enabled={typeof idiw37 === 'number'} />
            </div>
          </TabsContent>

          <TabsContent value="planning" className="mt-4">
            <div className="app-page-content space-y-4">
              <div className="app-card app-card-pad-compact">
                <div className="mb-3">
                  <div className="text-body-sm font-medium text-app">Planning</div>
                  <p className="text-xs text-app-muted">
                    เทียบ `confirmTab4.php` — แสดงผู้รับผิดชอบจาก `view_planwork`; Admin สามารถจ่าย/ยกเลิกงานได้
                  </p>
                </div>

                {!detailQ.data ? (
                  <p className="text-caption">Search work order first.</p>
                ) : modalDetailQ.isFetching && !modalDetailQ.data ? (
                  <Skeleton className="h-24 w-full rounded-card" />
                ) : modalDetailQ.isError ? (
                  <p className="text-body-sm text-red-600">{(modalDetailQ.error as Error).message}</p>
                ) : modalDetailQ.data ? (
                  <div className="app-page-content space-y-4">
                    <div className="rounded-card border border-emerald-200 bg-emerald-50 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-body-sm font-medium text-emerald-900">
                          ผู้รับผิดชอบปัจจุบัน
                          {modalDetailQ.data.planning.assignees.length > 0
                            ? ` (${modalDetailQ.data.planning.assignees.length} คน)`
                            : ''}
                        </div>
                        {isAdmin && modalDetailQ.data.planning.assignees.length > 0 ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={clearPlan.isPending}
                            onClick={() => clearPlan.mutate()}
                          >
                            ยกเลิกทั้งหมด
                          </Button>
                        ) : null}
                      </div>
                      {modalDetailQ.data.planning.assignees.length === 0 ? (
                        <div className="mt-2 text-body-sm text-emerald-900/80">ยังไม่ได้จ่ายงาน</div>
                      ) : (
                        <ul className="mt-2 space-y-2">
                          {modalDetailQ.data.planning.assignees.map((a) => (
                            <li
                              key={`${a.code}-${a.idplanw ?? ''}`}
                              className="flex items-center justify-between gap-2 rounded border border-emerald-200/70 bg-white/60 px-2 py-2"
                            >
                              <div className="min-w-0">
                                <div className="text-body-sm text-emerald-900">
                                  <span className="font-mono">{a.code}</span>
                                  {a.displayName && a.displayName !== a.code ? (
                                    <span className="ml-2 text-emerald-900/80">— {a.displayName}</span>
                                  ) : null}
                                  {a.pwteam === 'G' ? (
                                    <span className="ml-2 rounded bg-amber-100 px-1 py-1 text-badge font-medium text-amber-800">
                                      GROUP
                                    </span>
                                  ) : null}
                                </div>
                                {a.pwcomment ? (
                                  <div className="text-xs text-emerald-900/70">{a.pwcomment}</div>
                                ) : null}
                              </div>
                              {isAdmin ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-700 hover:bg-red-50"
                                  disabled={removeAssignee.isPending}
                                  onClick={() => removeAssignee.mutate(a.code)}
                                >
                                  ลบ
                                </Button>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {isAdmin ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-plan-comment">หมายเหตุการจ่ายงาน</Label>
                          <Input
                            id="confirm-plan-comment"
                            value={planComment}
                            onChange={(e) => setPlanComment(e.target.value)}
                            placeholder="pwcomment"
                          />
                        </div>

                        <PlanningMultiAssign
                          workcenters={modalDetailQ.data.planning.workcenters}
                          assignedCodes={modalDetailQ.data.planning.assignees.map((a) => a.code)}
                          comment={planComment}
                          onCommentChange={setPlanComment}
                          submitting={batchAssign.isPending}
                          onAssign={async (codes) => {
                            const res = await batchAssign.mutateAsync(codes)
                            return {
                              assigned: res.assigned,
                              skipped: res.skipped,
                              notFound: res.notFound,
                            }
                          }}
                        />

                        <details className="app-table-shell p-3">
                          <summary className="cursor-pointer text-body-sm font-medium text-app">
                            จ่ายงานรายบุคคล (Quick assign — คลิก 1 ครั้ง/คน)
                          </summary>
                          <div className="mt-3 flex max-h-56 flex-wrap gap-2 overflow-auto">
                            {modalDetailQ.data.planning.workcenters.map((wc) => (
                              <Button
                                key={wc.wkctr}
                                type="button"
                                size="sm"
                                variant="outline"
                                title={wc.displayName}
                                disabled={assignPlan.isPending}
                                onClick={() => assignPlan.mutate({ mode: 'P', code: wc.wkctr })}
                              >
                                <span className="tabular-nums">{wc.wkctr}</span>
                                {wc.displayName ? <span className="ml-2">{wc.displayName}</span> : null}
                              </Button>
                            ))}
                          </div>
                        </details>

                        <div className="overflow-hidden app-table-shell">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>รหัสกลุ่ม</TableHead>
                                <TableHead>ชื่อกลุ่ม</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {modalDetailQ.data.planning.groups.map((g) => (
                                <TableRow key={g.wkctrgroup}>
                                  <TableCell className="tabular-nums">{g.wkctrgroup}</TableCell>
                                  <TableCell>{g.wkctrdescription}</TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      disabled={assignPlan.isPending}
                                      onClick={() => assignPlan.mutate({ mode: 'G', code: g.wkctrgroup })}
                                    >
                                      Add
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </TabsContent>
        </Tabs>

      </AppPageShell>
    </>
  )
}

/** `M_Export_confirm.php` + `M_Export_confirm_excel.php` — preview table + download Excel
 *  ใช้ view `app.view_exportconfirm` กรองตามสิทธิ์ (confirmation.export.all = ALL, อื่นๆ = OWN wkctr)
 */
export function ConfirmationExportParityPage() {
  const navigate = useNavigate()
  const authUser = getStoredAuthUser()
  const isAdmin = (authUser?.userst ?? '').trim() === 'A'
  const canRead = usePermission('confirmation.read')
  const canExport =
    usePermission('confirmation.export') ||
    usePermission('confirmation.import') ||
    isAdmin
  const [exporting, setExporting] = useState<'xlsx' | 'csv' | null>(null)
  const exportQ = useQuery({
    queryKey: ['confirmation', 'export', 'preview'],
    queryFn: fetchConfirmationExport,
    staleTime: 30_000,
    enabled: canRead,
    placeholderData: keepPreviousData,
  })

  const onDownload = async (format: 'xlsx' | 'csv') => {
    if (!canExport) {
      toast.error('ไม่มีสิทธิ์ส่งออก — ต้องมี confirmation.export หรือ confirmation.import')
      return
    }
    setExporting(format)
    try {
      const blob =
        format === 'xlsx'
          ? await fetchConfirmationExportXlsx()
          : await fetchConfirmationExportCsv()
      const name =
        format === 'xlsx' ? 'Export_Confirm.xlsx' : confirmationSapCsvFilename()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success(format === 'xlsx' ? 'ดาวน์โหลด Excel แล้ว' : 'ดาวน์โหลด CSV สำหรับ SAP แล้ว')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'ส่งออกไม่สำเร็จ')
    } finally {
      setExporting(null)
    }
  }

  const items = exportQ.data?.items ?? []
  const scope = exportQ.data?.scope
  const actorWkctr = exportQ.data?.actorWkctr ?? ''

  if (!canRead) {
    return (
      <AppPageShell
        title="ตัวอย่าง Export Confirm"
        description="ดูข้อมูลก่อนส่งออก SAP"
      >
        <EmptyState
          icon={AlertCircle}
          title="ไม่มีสิทธิ์เข้าถึง"
          description={
            <>
              ต้องมีสิทธิ์ <code className="text-xs">confirmation.read</code>
            </>
          }
        />
      </AppPageShell>
    )
  }

  return (
    <AppPageShell
      title="ส่งออก Confirm (Preview)"
      description="ดูตารางจาก view_exportconfirm ก่อนดาวน์โหลด — เทียบ M_Export_confirm.php"
      contentClassName="space-y-4"
      headerActions={
        <>
          {scope ? (
            <Badge variant={scope === 'ALL' ? 'default' : 'outline'} className="text-xs">
              {scope === 'ALL' ? 'เห็นทั้งหมด (export.all)' : `เฉพาะ wkctr: ${actorWkctr || '—'}`}
            </Badge>
          ) : null}
          <CanPermission permission="confirmation.read">
            <Button type="button" variant="outline" size="sm" asChild>
              <Link to="/confirmation">กลับหน้ารับรอง</Link>
            </Button>
          </CanPermission>
          {canExport ? (
            <>
              <ReportExportButton
                format="xlsx"
                label="ส่งออก Excel"
                loading={exporting === 'xlsx'}
                loadingLabel="กำลังส่งออก…"
                disabled={exporting != null || exportQ.isFetching || items.length === 0}
                onClick={() => void onDownload('xlsx')}
              />
              <ReportExportButton
                format="csv"
                label="CSV สำหรับ SAP"
                variant="default"
                loading={exporting === 'csv'}
                loadingLabel="กำลังส่งออก…"
                disabled={exporting != null || exportQ.isFetching || items.length === 0}
                onClick={() => void onDownload('csv')}
              />
            </>
          ) : null}
        </>
      }
    >
      {exportQ.isLoading && !exportQ.data ? (
        <Skeleton className="h-64 w-full rounded-card" aria-label="กำลังโหลดตาราง export" />
      ) : exportQ.isError ? (
        <EmptyState
          icon={AlertCircle}
          title="โหลดตัวอย่าง Export ไม่สำเร็จ"
          description={
            exportQ.error instanceof Error ? exportQ.error.message : 'เกิดข้อผิดพลาด'
          }
          action={{ label: 'ลองใหม่', onClick: () => void exportQ.refetch() }}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="ไม่มีข้อมูลส่งออก"
          description={
            scope === 'OWN' && actorWkctr
              ? `ไม่พบ confirmation สำหรับ wkctr ${actorWkctr} — ลองปิดงานหรือนำเข้า Confirm ก่อน`
              : 'ไม่พบแถวในขอบเขตสิทธิ์ของคุณ — ตรวจว่ามีการปิดงานในระบบแล้ว'
          }
          action={{
            label: 'กลับหน้ารับรอง',
            onClick: () => navigate('/confirmation'),
          }}
        />
      ) : (
        <AppCard pad="compact" className="space-y-3">
          <p className="text-caption rounded-button border border-dashed border-app bg-app-subtle/50 px-3 py-2">
            สิทธิ์ confirmation.export.all เห็นทุกแถว · ผู้ใช้อื่นเห็นเฉพาะ wkctr ของตน (Admin → Roles)
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-caption">
              พบ {items.length.toLocaleString('th-TH')} แถวพร้อมส่งออก
              {exportQ.isFetching ? ' · กำลังอัปเดต…' : ''}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={exportQ.isFetching}
              onClick={() => exportQ.refetch()}
            >
              {exportQ.isFetching ? 'กำลังรีเฟรช…' : 'รีเฟรช'}
            </Button>
          </div>

          <div className="app-table-shell max-h-[min(70vh,720px)] overflow-auto">
          <Table embedded stickyHeader zebra>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-right">ลำดับ</TableHead>
                <TableHead>Confirmation</TableHead>
                <TableHead>เลข WO</TableHead>
                <TableHead>Operation</TableHead>
                <TableHead>SubO</TableHead>
                <TableHead>Ca</TableHead>
                <TableHead>Split</TableHead>
                <TableHead>ศูนย์งาน</TableHead>
                <TableHead className="text-right">ชม.ทำงาน</TableHead>
                <TableHead>หน่วย</TableHead>
                <TableHead>วันเริ่ม (Exe.)</TableHead>
                <TableHead>วันสิ้นสุด (Exe.)</TableHead>
                <TableHead>เวลาเริ่ม</TableHead>
                <TableHead>เวลาสิ้นสุด</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row) => (
                  <TableRow key={`${row.confirmation}-${row.wkorder}-${row.opac}-${row.no}`}>
                    <TableCell className="text-right tabular-nums">{row.no}</TableCell>
                    <TableCell className="tabular-nums">{row.confirmation}</TableCell>
                    <TableCell className="tabular-nums">{row.wkorder}</TableCell>
                    <TableCell className="tabular-nums">{row.opac}</TableCell>
                    <TableCell className="tabular-nums">{row.subO}</TableCell>
                    <TableCell className="tabular-nums">{row.ca}</TableCell>
                    <TableCell className="tabular-nums">{row.split}</TableCell>
                    <TableCell className="tabular-nums">{row.wkctr}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.timewk}</TableCell>
                    <TableCell>{row.unitc}</TableCell>
                    <TableCell className="tabular-nums">{row.startDateExe}</TableCell>
                    <TableCell className="tabular-nums">{row.endDateExe}</TableCell>
                    <TableCell className="tabular-nums">{row.startExecute}</TableCell>
                    <TableCell className="tabular-nums">{row.endExecute}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
        </AppCard>
      )}
    </AppPageShell>
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
          <Link to="/summary-weekly">สรุปรายสัปดาห์</Link>
        </Button>
      }
    />
  )
}
