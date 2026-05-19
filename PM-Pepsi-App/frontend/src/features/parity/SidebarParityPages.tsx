import { PageHeader } from '@/components/layout/PageHeader'
import { PlaceholderBlock } from '@/components/layout/PlaceholderBlock'
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
  deleteConfirmationImage,
  deleteWorkOrderPlanning,
  deleteWorkOrderPlanningAssignee,
  deleteConfirmationClose,
  fetchConfirmationByWorkOrder,
  fetchConfirmationExport,
  fetchConfirmationExportXlsx,
  fetchConfirmationImageData,
  fetchConfirmationImages,
  fetchWorkOrderDetail,
  fetchWorkOrderModalDetail,
  fetchWorkcenters,
  postConfirmationClose,
  postConfirmationImage,
  postConfirmationImport,
  postWorkOrderPlanningBatch,
  putWorkOrderPlanning,
} from '@/lib/api-public'
import { getStoredAuthUser } from '@/features/auth/login-api'
import type { ConfirmationImportResponse } from '@/api/schemas'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ChangeEvent, ReactNode } from 'react'
import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
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
  const qc = useQueryClient()
  const authUser = getStoredAuthUser()
  const isAdmin = (authUser?.userst ?? '').trim() === 'A'
  const [wkorder, setWkorder] = useState('')
  const [importResult, setImportResult] = useState<ConfirmationImportResponse | null>(null)
  const importFileRef = useRef<HTMLInputElement>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [viewImageId, setViewImageId] = useState<number | null>(null)
  const [planComment, setPlanComment] = useState('')
  const [exporting, setExporting] = useState(false)

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
    queryKey: ['work-order-detail', wkorder],
    queryFn: () => fetchWorkOrderDetail(wkorder),
    enabled: false,
    retry: 0,
  })

  const confirmationQ = useQuery({
    queryKey: ['confirmation-by-wkorder', wkorder],
    queryFn: () => fetchConfirmationByWorkOrder(wkorder),
    enabled: false,
    retry: 0,
  })

  const modalDetailQ = useQuery({
    queryKey: ['work-order-modal-detail', wkorder],
    queryFn: () => fetchWorkOrderModalDetail(wkorder),
    enabled: false,
    retry: 0,
  })

  const idiw37 = useMemo(() => {
    const fromConfirmation = confirmationQ.data?.idiw37
    if (typeof fromConfirmation === 'number' && Number.isFinite(fromConfirmation)) return fromConfirmation
    const fromDetail = Number(detailQ.data?.id)
    return Number.isFinite(fromDetail) ? fromDetail : null
  }, [confirmationQ.data?.idiw37, detailQ.data?.id])

  const imagesQ = useQuery({
    queryKey: ['confirmation-images', idiw37],
    queryFn: () => fetchConfirmationImages(idiw37!),
    enabled: typeof idiw37 === 'number',
    retry: 0,
  })

  const imageDataQ = useQuery({
    queryKey: ['confirmation-image-data', viewImageId],
    queryFn: () => fetchConfirmationImageData(viewImageId!),
    enabled: typeof viewImageId === 'number',
    retry: 0,
  })

  const addClose = useMutation({
    mutationFn: postConfirmationClose,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['confirmation-by-wkorder', wkorder] })
      toast.success('Saved')
    },
    onError: (err) => toast.error((err as Error).message),
  })

  const delClose = useMutation({
    mutationFn: deleteConfirmationClose,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['confirmation-by-wkorder', wkorder] })
      toast.success('Deleted')
    },
    onError: (err) => toast.error((err as Error).message),
  })

  const importMut = useMutation({
    mutationFn: (file: File) => postConfirmationImport(file),
    onSuccess: async (res) => {
      setImportResult(res)
      const ok = res.inserted + res.updated
      const failTotal = res.skipped + res.errors
      if (failTotal === 0) toast.success(`Import success: ${ok}/${res.totalRows} rows`)
      else toast.warning(`Import done: ok=${ok} fail=${failTotal} (total ${res.totalRows})`)
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

  const onExportConfirm = async () => {
    try {
      setExporting(true)
      const blob = await fetchConfirmationExportXlsx()
      downloadBlob(blob, 'Export_Confirm.xlsx')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setExporting(false)
    }
  }

  const uploadImage = useMutation({
    mutationFn: () => postConfirmationImage(idiw37!, imageFile!),
    onSuccess: async () => {
      setImageFile(null)
      await qc.invalidateQueries({ queryKey: ['confirmation-images', idiw37] })
      toast.success('Uploaded')
    },
    onError: (err) => toast.error((err as Error).message),
  })

  const delImage = useMutation({
    mutationFn: (idcimg: number) => deleteConfirmationImage(idcimg),
    onSuccess: async () => {
      if (viewImageId != null) setViewImageId(null)
      await qc.invalidateQueries({ queryKey: ['confirmation-images', idiw37] })
      toast.success('Deleted')
    },
    onError: (err) => toast.error((err as Error).message),
  })

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

  const onGo = async () => {
    const w = wkorder.trim()
    if (!w) {
      toast.error('Work order is required')
      return
    }
    setViewImageId(null)
    await Promise.all([detailQ.refetch(), confirmationQ.refetch(), modalDetailQ.refetch()])
  }

  return (
    <div>
      <PageHeader
        title="รับรอง / Confirmation"
        description="เทียบ M_confirmation.php / M_Confirm* / M_Export_confirm* / confirmTab*"
      >
        <Badge variant="secondary">API + DB</Badge>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to="/confirmation/export">Preview Export</Link>
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={exporting} onClick={onExportConfirm}>
          {exporting ? 'Exporting…' : 'Export Confirm Excel'}
        </Button>
      </PageHeader>

      <div className="space-y-6 px-4 py-6 sm:px-6">
        {isAdmin ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-zinc-800">
                  Import Confirm (M_Confirm.php)
                </div>
                <p className="text-xs text-zinc-500">
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
                  {importMut.isPending ? 'Importing…' : 'Upload Excel'}
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
                <div className="overflow-hidden rounded-lg border border-zinc-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16 text-center">Row</TableHead>
                        <TableHead className="w-28">Status</TableHead>
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
                          <TableCell colSpan={8} className="py-6 text-center text-sm text-zinc-500">
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
                            <TableCell className="text-xs text-zinc-600">{r.message}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div>
              <Label htmlFor="wkorder">Number Work Order</Label>
              <WorkOrderAutocomplete
                value={wkorder}
                placeholder="Enter Work Order"
                minLength={1}
                onInputChange={setWkorder}
                onSelect={(item) => setWkorder(item.wkorder)}
              />
            </div>
            <div className="flex items-end">
              <Button type="button" onClick={onGo} disabled={detailQ.isFetching || confirmationQ.isFetching}>
                Go
              </Button>
            </div>
          </div>

          <div className="mt-4">
            {(detailQ.isFetching || confirmationQ.isFetching) && !detailQ.data ? (
              <Skeleton className="h-24 w-full rounded-lg" />
            ) : null}
            {detailQ.isError ? <p className="mt-2 text-sm text-red-600">{(detailQ.error as Error).message}</p> : null}
            {confirmationQ.isError ? (
              <p className="mt-2 text-sm text-red-600">{(confirmationQ.error as Error).message}</p>
            ) : null}
          </div>
        </div>

        <Tabs defaultValue="workorder" className="w-full">
          <TabsList>
            <TabsTrigger value="workorder">Work Order + Tasklist</TabsTrigger>
            <TabsTrigger value="confirmation">Confirmation</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
          </TabsList>

          <TabsContent value="workorder" className="mt-4">
            {!detailQ.data ? (
              <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600 shadow-sm">
                Search work order first.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium text-zinc-800">รายละเอียด Work Order</div>
                      <div className="text-xs text-zinc-500">เทียบ `confirmTab1.php` — header + operation detail</div>
                    </div>
                    <Badge variant="outline">{detailQ.data.status}</Badge>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="text-sm">
                      <div className="text-xs text-zinc-500">Work Order</div>
                      <div className="font-medium tabular-nums">{detailQ.data.wkorder}</div>
                    </div>
                    <div className="text-sm">
                      <div className="text-xs text-zinc-500">Work Center</div>
                      <div className="font-medium">{detailQ.data.workCenter}</div>
                    </div>
                    <div className="text-sm">
                      <div className="text-xs text-zinc-500">Functional Location</div>
                      <div className="font-medium">{detailQ.data.functLoc}</div>
                      <div className="text-xs text-zinc-500">{detailQ.data.description}</div>
                    </div>
                    <div className="text-sm">
                      <div className="text-xs text-zinc-500">Equipment</div>
                      <div className="font-medium">{detailQ.data.equipment}</div>
                    </div>
                    <div className="text-sm">
                      <div className="text-xs text-zinc-500">Start / End</div>
                      <div className="font-medium tabular-nums">
                        {detailQ.data.plannedDate || '—'} → {detailQ.data.finishDate || '—'}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-xs text-zinc-500">Activity Type / Mat</div>
                      <div className="font-medium tabular-nums">{detailQ.data.mat || '—'}</div>
                    </div>
                    <div className="text-sm sm:col-span-2">
                      <div className="text-xs text-zinc-500">Header Short Text</div>
                      <div className="font-medium">{detailQ.data.title}</div>
                    </div>
                    {(detailQ.data.operations ?? []).map((op) => (
                      <div key={`${op.no}-${op.desc}`} className="text-sm sm:col-span-2">
                        <div className="text-xs text-zinc-500">Operation {op.no}</div>
                        <div className="font-medium">
                          {op.desc} {op.wc ? `(${op.wc})` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 text-sm font-medium text-zinc-800">
                    PM Task List จาก `view_tarklist`
                  </div>
                  {modalDetailQ.isFetching && !modalDetailQ.data ? (
                    <Skeleton className="h-24 w-full rounded-lg" />
                  ) : modalDetailQ.isError ? (
                    <p className="text-sm text-red-600">{(modalDetailQ.error as Error).message}</p>
                  ) : modalDetailQ.data?.taskList.items.length ? (
                    <div className="space-y-2">
                      {modalDetailQ.data.taskList.summary ? (
                        <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm">
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
                          className="rounded-md border border-zinc-200 bg-white px-3 py-2"
                        >
                          <div className="text-sm text-zinc-900">
                            {idx + 1}. {t.machine} - {t.pmlist}
                            {t.mat ? ` / ${t.mat} = ${t.matdescrip}` : ''}
                          </div>
                          <div className="text-xs text-zinc-500">
                            สถานะเครื่อง: {t.machinestatus === 1 ? 'หยุด' : 'เดิน'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-600">ไม่พบ PM Task List</p>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="confirmation" className="mt-4 space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
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

            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="mb-3 text-sm font-medium text-zinc-800">Technicians</div>
              {workcentersQ.isLoading ? (
                <Skeleton className="h-24 w-full rounded-lg" />
              ) : workcentersQ.isError ? (
                <p className="text-sm text-red-600">{(workcentersQ.error as Error).message}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(workcentersQ.data ?? []).map((wc) => (
                    <Button
                      key={wc.wkctr}
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!confirmationQ.data || addClose.isPending}
                      onClick={() => {
                        const idiw37 = confirmationQ.data?.idiw37
                        if (!idiw37) {
                          toast.error('Search work order first')
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

            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>WkCtr</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead className="text-right">Minutes</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!confirmationQ.data ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-sm text-zinc-500">
                        Search work order first.
                      </TableCell>
                    </TableRow>
                  ) : (confirmationQ.data.items ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-sm text-zinc-500">
                        No confirmations
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
                            disabled={delClose.isPending}
                            onClick={() => delClose.mutate(row.idclose)}
                          >
                            Del
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
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="mb-3">
                  <div className="text-sm font-medium text-zinc-800">Upload images</div>
                  <p className="text-xs text-zinc-500">
                    เทียบ `confirmTab3.php` + `submit_upload_file.php` — รองรับ JPEG และผูกกับ `idiw37`
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <Input
                    type="file"
                    accept=".jpg,.jpeg,image/jpeg"
                    disabled={typeof idiw37 !== 'number'}
                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  />
                  <Button
                    type="button"
                    disabled={typeof idiw37 !== 'number' || !imageFile || uploadImage.isPending}
                    onClick={() => uploadImage.mutate()}
                  >
                    Upload
                  </Button>
                </div>
                {typeof idiw37 !== 'number' ? (
                  <p className="mt-2 text-xs text-zinc-500">Search work order first.</p>
                ) : null}
              </div>

              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File</TableHead>
                      <TableHead>WkCtr</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Bytes</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {typeof idiw37 !== 'number' ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-10 text-center text-sm text-zinc-500">
                          Search work order first.
                        </TableCell>
                      </TableRow>
                    ) : imagesQ.isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-10">
                          <Skeleton className="h-12 w-full rounded-lg" />
                        </TableCell>
                      </TableRow>
                    ) : imagesQ.isError ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-10 text-center text-sm text-red-600">
                          {(imagesQ.error as Error).message}
                        </TableCell>
                      </TableRow>
                    ) : (imagesQ.data ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-10 text-center text-sm text-zinc-500">
                          No images
                        </TableCell>
                      </TableRow>
                    ) : (
                      (imagesQ.data ?? []).map((img) => (
                        <TableRow key={img.idcimg}>
                          <TableCell className="font-medium">{img.originalName || img.fileName}</TableCell>
                          <TableCell className="tabular-nums">{img.wkctr}</TableCell>
                          <TableCell className="tabular-nums">
                            {new Date(img.createdAt).toLocaleString('th-TH')}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{img.bytes}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button type="button" size="sm" variant="outline" onClick={() => setViewImageId(img.idcimg)}>
                                View
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                disabled={delImage.isPending}
                                onClick={() => delImage.mutate(img.idcimg)}
                              >
                                Del
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {viewImageId != null ? (
                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="text-sm font-medium text-zinc-800">Image preview</div>
                    <Button type="button" size="sm" variant="outline" onClick={() => setViewImageId(null)}>
                      Close
                    </Button>
                  </div>
                  {imageDataQ.isLoading ? (
                    <Skeleton className="h-48 w-full rounded-lg" />
                  ) : imageDataQ.isError ? (
                    <p className="text-sm text-red-600">{(imageDataQ.error as Error).message}</p>
                  ) : imageDataQ.data ? (
                    <img
                      src={`data:${imageDataQ.data.mime};base64,${imageDataQ.data.base64}`}
                      alt="Confirmation upload"
                      className="max-h-[520px] w-auto rounded-lg border border-zinc-200"
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="planning" className="mt-4">
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="mb-3">
                  <div className="text-sm font-medium text-zinc-800">Planning</div>
                  <p className="text-xs text-zinc-500">
                    เทียบ `confirmTab4.php` — แสดงผู้รับผิดชอบจาก `view_planwork`; Admin สามารถจ่าย/ยกเลิกงานได้
                  </p>
                </div>

                {!detailQ.data ? (
                  <p className="text-sm text-zinc-600">Search work order first.</p>
                ) : modalDetailQ.isFetching && !modalDetailQ.data ? (
                  <Skeleton className="h-24 w-full rounded-lg" />
                ) : modalDetailQ.isError ? (
                  <p className="text-sm text-red-600">{(modalDetailQ.error as Error).message}</p>
                ) : modalDetailQ.data ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-medium text-emerald-900">
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
                        <div className="mt-2 text-sm text-emerald-900/80">ยังไม่ได้จ่ายงาน</div>
                      ) : (
                        <ul className="mt-2 space-y-1.5">
                          {modalDetailQ.data.planning.assignees.map((a) => (
                            <li
                              key={`${a.code}-${a.idplanw ?? ''}`}
                              className="flex items-center justify-between gap-2 rounded border border-emerald-200/70 bg-white/60 px-2 py-1.5"
                            >
                              <div className="min-w-0">
                                <div className="text-sm text-emerald-900">
                                  <span className="font-mono">{a.code}</span>
                                  {a.displayName && a.displayName !== a.code ? (
                                    <span className="ml-1.5 text-emerald-900/80">— {a.displayName}</span>
                                  ) : null}
                                  {a.pwteam === 'G' ? (
                                    <span className="ml-1.5 rounded bg-amber-100 px-1 py-0.5 text-[10px] font-medium text-amber-800">
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

                        <details className="rounded-lg border border-zinc-200 bg-white p-3">
                          <summary className="cursor-pointer text-sm font-medium text-zinc-800">
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

                        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
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

        <PlaceholderBlock title="Parity กับระบบ PHP (sap/pages)">
          <ul className="list-inside list-disc space-y-1">
            <li>
              <code className="rounded bg-zinc-200 px-1">M_confirmation.php</code>
            </li>
            <li>
              <code className="rounded bg-zinc-200 px-1">M_confirmation_form.php</code>
            </li>
            <li>
              <code className="rounded bg-zinc-200 px-1">modalPages/confirmTab2.php</code>
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/planning">แผนงาน (ใกล้เคียง W_planwork_view)</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/work-orders">ใบงาน / WO</Link>
            </Button>
          </div>
        </PlaceholderBlock>
      </div>
    </div>
  )
}

/** `M_Export_confirm.php` + `M_Export_confirm_excel.php` — preview table + download Excel
 *  ใช้ view `app.view_exportconfirm` กรองตามสิทธิ์ผู้ใช้ (PAC007/PRO005 = ALL, อื่นๆ = OWN wkctr)
 */
export function ConfirmationExportParityPage() {
  const [exporting, setExporting] = useState(false)
  const exportQ = useQuery({
    queryKey: ['confirmation', 'export', 'preview'],
    queryFn: fetchConfirmationExport,
    staleTime: 30_000,
  })

  const onDownload = async () => {
    setExporting(true)
    try {
      const blob = await fetchConfirmationExportXlsx()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Export_Confirm.xlsx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      toast.error(`Export failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setExporting(false)
    }
  }

  const items = exportQ.data?.items ?? []
  const scope = exportQ.data?.scope
  const actorWkctr = exportQ.data?.actorWkctr ?? ''

  return (
    <div>
      <PageHeader
        title="Export Confirm (Preview)"
        description="เทียบ M_Export_confirm.php / M_Export_confirm_excel.php — preview ตารางก่อนดาวน์โหลด"
      >
        <Badge variant="secondary">View: view_exportconfirm</Badge>
        {scope ? (
          <Badge variant={scope === 'ALL' ? 'default' : 'outline'}>
            {scope === 'ALL' ? `ALL (PAC007/PRO005)` : `OWN: ${actorWkctr || '-'}`}
          </Badge>
        ) : null}
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to="/confirmation">กลับหน้า Confirmation</Link>
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={exporting || exportQ.isFetching || items.length === 0}
          onClick={onDownload}
        >
          {exporting ? 'Exporting…' : 'Download Excel'}
        </Button>
      </PageHeader>

      <div className="space-y-4 px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-zinc-700">
            {exportQ.isLoading
              ? 'กำลังโหลด…'
              : exportQ.isError
                ? `Error: ${exportQ.error instanceof Error ? exportQ.error.message : String(exportQ.error)}`
                : `พบ ${items.length} แถว (สิทธิ์: ${scope ?? '-'}${
                    scope === 'OWN' && actorWkctr ? `, wkctr=${actorWkctr}` : ''
                  })`}
          </div>
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

        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-right">#</TableHead>
                <TableHead>Confirmation</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Operation</TableHead>
                <TableHead>SubO</TableHead>
                <TableHead>Ca..</TableHead>
                <TableHead>Split</TableHead>
                <TableHead>Wrk Ctr</TableHead>
                <TableHead className="text-right">Act.Work</TableHead>
                <TableHead>unit</TableHead>
                <TableHead>Start Date Exe.</TableHead>
                <TableHead>End Date Exe.</TableHead>
                <TableHead>Start Execute</TableHead>
                <TableHead>End Execute</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exportQ.isLoading ? (
                <TableRow>
                  <TableCell colSpan={14} className="py-10 text-center text-sm text-zinc-500">
                    กำลังโหลด…
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14} className="py-10 text-center text-sm text-zinc-500">
                    ไม่มีข้อมูล confirmation ภายใต้สิทธิ์ของคุณ
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
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
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <PlaceholderBlock title="Parity กับระบบ PHP (sap/pages)">
          <ul className="list-inside list-disc space-y-1">
            <li>
              <code className="rounded bg-zinc-200 px-1">M_Export_confirm.php</code> — หน้า preview ตาราง
            </li>
            <li>
              <code className="rounded bg-zinc-200 px-1">M_Export_confirm_excel.php</code> — ดาวน์โหลด .xlsx
            </li>
          </ul>
          <p className="mt-2 text-xs text-zinc-500">
            สิทธิ์ผู้ใช้: PAC007 / PRO005 เห็นทั้งหมด, อื่นๆ จะกรองด้วย <code>cwkctr</code> หรือ{' '}
            <code>wkctr</code> ของตนเอง (ตาม `M_Export_confirm.php`)
          </p>
        </PlaceholderBlock>
      </div>
    </div>
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
