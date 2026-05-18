import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import {
  fetchIw37nBatchCsv,
  fetchIw37nBatchRows,
  fetchIw37nBatches,
  fetchIw37nItem,
  fetchIw37nItems,
  postIw37nImport,
  putIw37nItem,
} from '@/lib/api-public'
import { formatEpochSecondsToDdMmYyyy } from '@/lib/master-data-api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

export function Iw37nPage() {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [lastImport, setLastImport] = useState<{
    batchId: string
    fileName: string
    sha256: string
    status: string
    isDuplicate: boolean
    duplicateOfBatchId: string | null
    rows: Array<{
      rowNo: number
      action: 'inserted' | 'updated' | 'skipped' | 'error'
      wkorder: string
      opac: string
      mntplan: string
      wktype: string
      mat: string
      syst: string
      message: string
    }>
  } | null>(null)
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

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

  const downloadCsv = async (batchId: string) => {
    try {
      setExporting(true)
      const blob = await fetchIw37nBatchCsv(batchId)
      downloadBlob(blob, `iw37n-import-batch-${batchId}.csv`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Download failed')
    } finally {
      setExporting(false)
    }
  }

  const downloadXlsx = async (batchId: string, fileNameHint?: string) => {
    try {
      setExporting(true)
      const batchRows = lastImport?.batchId === batchId
        ? lastImport.rows
        : (await fetchIw37nBatchRows(batchId, { limit: 5000, offset: 0 })).items
      if (batchRows.length >= 5000) {
        toast.message('ดาวน์โหลด XLSX จำกัด 5000 แถว (เพิ่ม paging ได้ภายหลัง)')
      }
      const XLSX = await import('xlsx')
      const data = batchRows.map((r) => ({
        rowNo: r.rowNo,
        action: r.action,
        wkorder: r.wkorder,
        opac: r.opac,
        mntplan: r.mntplan,
        wktype: r.wktype,
        mat: r.mat,
        syst: r.syst,
        message: r.message,
        createdAt: 'createdAt' in r ? (r.createdAt as string) : '',
      }))
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'import_rows')
      const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([buf], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const safeName = (fileNameHint || `iw37n-import-batch-${batchId}`).replaceAll(/[\\/:*?"<>|]+/g, '_')
      downloadBlob(blob, `${safeName}.xlsx`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Download failed')
    } finally {
      setExporting(false)
    }
  }

  const batches = useQuery({
    queryKey: ['iw37n-batches'],
    queryFn: fetchIw37nBatches,
  })

  const importMut = useMutation({
    mutationFn: postIw37nImport,
    onSuccess: (data) => {
      const batch = data.batch
      const rows = data.rows
      if (batch.isDuplicate && batch.duplicateOfBatchId) {
        toast.message(
          `ไฟล์ซ้ำ (SHA256 เดิม) — จะไม่ upsert ลง IW37N; อ้างอิง batch #${batch.duplicateOfBatchId}`,
        )
      } else {
        toast.success(
          `นำเข้า ${batch.fileName}: ${batch.rows} แถว (${batch.status}) — SHA ${batch.sha256.slice(0, 8)}…`,
        )
      }
      setLastImport({
        batchId: batch.id,
        fileName: batch.fileName,
        sha256: batch.sha256,
        status: batch.status,
        isDuplicate: batch.isDuplicate,
        duplicateOfBatchId: batch.duplicateOfBatchId,
        rows: rows.map((r) => ({
          rowNo: r.rowNo,
          action: r.action,
          wkorder: r.wkorder,
          opac: r.opac,
          mntplan: r.mntplan,
          wktype: r.wktype,
          mat: r.mat,
          syst: r.syst,
          message: r.message,
        })),
      })
      setSelectedBatchId(batch.id)
      void qc.invalidateQueries({ queryKey: ['iw37n-batches'] })
      void qc.invalidateQueries({ queryKey: ['dashboard'] })
      void qc.invalidateQueries({ queryKey: ['work-orders'] })
      void qc.invalidateQueries({ queryKey: ['calendar'] })
      void qc.invalidateQueries({ queryKey: ['backlog'] })
      if (fileRef.current) fileRef.current.value = ''
    },
    onError: (e: Error) => {
      toast.error(e.message)
    },
  })

  const batchRowsQ = useQuery({
    queryKey: ['iw37n-batch-rows', selectedBatchId],
    queryFn: () => fetchIw37nBatchRows(selectedBatchId!, { limit: 2000, offset: 0 }),
    enabled: Boolean(selectedBatchId),
  })

  const [itemQ, setItemQ] = useState('')
  const [itemOffset, setItemOffset] = useState(0)
  const itemLimit = 100

  const itemsQ = useQuery({
    queryKey: ['iw37n-items', itemQ, itemLimit, itemOffset],
    queryFn: () => fetchIw37nItems({ q: itemQ.trim(), limit: itemLimit, offset: itemOffset }),
  })

  const parseDdMmYyyyToEpochSeconds = (v: string): number | null => {
    const s = v.trim()
    if (!s) return null
    const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(s)
    if (!m) return null
    const dd = Number(m[1])
    const mm = Number(m[2])
    const yyyy = Number(m[3])
    if (!Number.isFinite(dd) || !Number.isFinite(mm) || !Number.isFinite(yyyy)) return null
    const dt = new Date(yyyy, mm - 1, dd, 0, 0, 0, 0)
    const ms = dt.getTime()
    return Number.isFinite(ms) ? Math.floor(ms / 1000) : null
  }

  const parseOptionalNumber = (v: string): number | null => {
    const s = v.trim()
    if (!s) return null
    const n = Number(s)
    return Number.isFinite(n) ? n : null
  }

  const [editOpen, setEditOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [form, setForm] = useState({
    mntplan: '',
    wkorder: '',
    wktype: '',
    mat: '',
    bscstart: '',
    actfinish: '',
    systemstatus: '',
    opac: '',
    operationshorttext: '',
    ostdescription: '',
    cknow: '',
    wkctr: '',
    work: '',
    actwork: '',
    untime: '',
    equipment: '',
    equdescrip: '',
    functionalloc: '',
    funcdescrip: '',
    team: '',
  })

  const openEdit = async (id: number) => {
    try {
      setEditError(null)
      setEditingId(id)
      setEditOpen(true)
      const item = await fetchIw37nItem(id)
      setForm({
        mntplan: item.mntplan ?? '',
        wkorder: item.wkorder ?? '',
        wktype: item.wktype ?? '',
        mat: item.mat ?? '',
        bscstart: item.bscstart ? formatEpochSecondsToDdMmYyyy(item.bscstart) : '',
        actfinish: item.actfinish ? formatEpochSecondsToDdMmYyyy(item.actfinish) : '',
        systemstatus: item.systemstatus ?? '',
        opac: item.opac ?? '',
        operationshorttext: item.operationshorttext ?? '',
        ostdescription: item.ostdescription ?? '',
        cknow: item.cknow ?? '',
        wkctr: item.wkctr ?? '',
        work: item.work != null ? String(item.work) : '',
        actwork: item.actwork != null ? String(item.actwork) : '',
        untime: item.untime != null ? String(item.untime) : '',
        equipment: item.equipment ?? '',
        equdescrip: item.equdescrip ?? '',
        functionalloc: item.functionalloc ?? '',
        funcdescrip: item.funcdescrip ?? '',
        team: item.team ?? '',
      })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Load failed')
      setEditOpen(false)
      setEditingId(null)
    }
  }

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!editingId) throw new Error('Invalid id')
      setEditError(null)
      const wkorder = form.wkorder.trim()
      const opac = form.opac.trim()
      if (!wkorder) throw new Error('wkorder is required')
      if (!opac) throw new Error('opac is required')
      const bscstart = parseDdMmYyyyToEpochSeconds(form.bscstart)
      if (form.bscstart.trim() && bscstart == null) throw new Error('Invalid bscstart. Expected DD.MM.YYYY')
      const actfinish = parseDdMmYyyyToEpochSeconds(form.actfinish)
      if (form.actfinish.trim() && actfinish == null) throw new Error('Invalid actfinish. Expected DD.MM.YYYY')
      const payload = {
        mntplan: form.mntplan,
        wkorder,
        wktype: form.wktype,
        mat: form.mat,
        bscstart,
        actfinish,
        systemstatus: form.systemstatus,
        opac,
        operationshorttext: form.operationshorttext,
        ostdescription: form.ostdescription,
        cknow: form.cknow,
        wkctr: form.wkctr,
        work: parseOptionalNumber(form.work),
        actwork: parseOptionalNumber(form.actwork),
        untime: parseOptionalNumber(form.untime),
        equipment: form.equipment,
        equdescrip: form.equdescrip,
        functionalloc: form.functionalloc,
        funcdescrip: form.funcdescrip,
        team: form.team.trim() ? form.team.trim() : null,
      }
      return putIw37nItem(editingId, payload)
    },
    onSuccess: async () => {
      toast.success('Saved')
      setEditOpen(false)
      setEditingId(null)
      await qc.invalidateQueries({ queryKey: ['iw37n-items'] })
      await qc.invalidateQueries({ queryKey: ['work-orders'] })
      await qc.invalidateQueries({ queryKey: ['calendar'] })
      await qc.invalidateQueries({ queryKey: ['backlog'] })
    },
    onError: (e: Error) => setEditError(e.message),
  })

  const runImport = () => {
    const f = fileRef.current?.files?.[0]
    if (!f) {
      toast.message('เลือกไฟล์ .xls / .xlsx / .csv ก่อน')
      return
    }
    importMut.mutate(f)
  }

  return (
    <div>
      <PageHeader
        title="IW37N / นำเข้า SAP"
        description="อัปโหลด Excel ตาม M_iw37n.php — แมปคอลัมน์ SAP, upsert ลง app.tbiw37n, บันทึก SHA256"
      >
        <Badge variant="secondary">Import</Badge>
        <Badge className="bg-amber-700">API + DB</Badge>
      </PageHeader>

      <div className="space-y-6 px-4 py-6 sm:px-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900">นำเข้าไฟล์</h3>
          <p className="mt-1 text-xs text-zinc-500">
            รูปแบบเดียวกับ PHP: ข้าม 2 แถวแรก, คีย์ซ้ำ wkorder + opac → UPDATE
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-zinc-600">เลือกไฟล์</label>
              <Input
                ref={fileRef}
                type="file"
                accept=".xls,.xlsx,.csv"
              />
            </div>
            <Button
              type="button"
              onClick={runImport}
              disabled={importMut.isPending}
              className="gap-2"
            >
              <Upload className="size-4" />
              {importMut.isPending ? 'กำลังนำเข้า…' : 'เริ่มนำเข้า'}
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">ผลการนำเข้า (รายแถว)</h3>
              <p className="mt-1 text-xs text-zinc-500">เทียบตารางผลใน `M_iw37n.php`</p>
            </div>
            {selectedBatchId ? (
              <p className="text-xs text-zinc-500">
                batch #{selectedBatchId}
              </p>
            ) : null}
          </div>

          {lastImport ? (
            <div className="mt-3 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-zinc-600">
                  {lastImport.fileName} ({lastImport.status}) — SHA {lastImport.sha256.slice(0, 8)}…
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={exporting}
                    onClick={() => downloadCsv(lastImport.batchId)}
                  >
                    Download CSV
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={exporting}
                    onClick={() => downloadXlsx(lastImport.batchId, lastImport.fileName)}
                  >
                    Download XLSX
                  </Button>
                  {lastImport.isDuplicate ? (
                    <>
                      <Badge className="bg-purple-700 text-xs">DUPLICATE</Badge>
                      {lastImport.duplicateOfBatchId ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedBatchId(lastImport.duplicateOfBatchId)}
                        >
                          เปิด batch เดิม
                        </Button>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </div>
              <div className="overflow-x-auto rounded-lg border border-zinc-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16 text-center">No.</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Work order/opac</TableHead>
                      <TableHead>Maintenance plan</TableHead>
                      <TableHead>Mat</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lastImport.rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-sm text-zinc-500">
                          ไม่มีข้อมูล
                        </TableCell>
                      </TableRow>
                    ) : (
                      lastImport.rows.map((r) => (
                        <TableRow key={r.rowNo}>
                          <TableCell className="text-center tabular-nums">{r.rowNo}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge
                              variant={r.action === 'skipped' ? 'secondary' : 'default'}
                              className={[
                                'text-xs',
                                r.action === 'error' ? 'border-transparent bg-red-600 text-white hover:bg-red-700' : '',
                                r.action === 'updated' ? 'border-transparent bg-sky-700 text-white hover:bg-sky-800' : '',
                              ]
                                .join(' ')
                                .trim()}
                            >
                              {r.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {r.wkorder} / {r.opac}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{r.mntplan}</TableCell>
                          <TableCell className="font-mono text-xs">{r.mat}</TableCell>
                          <TableCell className="font-mono text-xs">{r.syst}</TableCell>
                          <TableCell className="max-w-[360px] truncate text-xs text-zinc-600" title={r.message}>
                            {r.message}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-zinc-600">อัปโหลดไฟล์เพื่อดูผลรายแถว</p>
          )}

          {selectedBatchId ? (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-zinc-900">ดูย้อนหลัง (จาก batch)</h4>
              {batchRowsQ.isLoading ? (
                <div className="mt-3 space-y-2">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ) : batchRowsQ.isError ? (
                <p className="mt-3 text-sm text-red-600">{(batchRowsQ.error as Error).message}</p>
              ) : batchRowsQ.data ? (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-zinc-500">โหลด {batchRowsQ.data.items.length} แถว</p>
                  <div className="overflow-x-auto rounded-lg border border-zinc-200">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16 text-center">No.</TableHead>
                          <TableHead>Result</TableHead>
                          <TableHead>Work order/opac</TableHead>
                          <TableHead>Maintenance plan</TableHead>
                          <TableHead>Mat</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Message</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {batchRowsQ.data.items.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-sm text-zinc-500">
                              ไม่มีข้อมูล
                            </TableCell>
                          </TableRow>
                        ) : (
                          batchRowsQ.data.items.map((r) => (
                            <TableRow key={`${r.rowNo}-${r.createdAt}`}>
                              <TableCell className="text-center tabular-nums">{r.rowNo}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                <Badge
                                  variant={r.action === 'skipped' ? 'secondary' : 'default'}
                                  className={[
                                    'text-xs',
                                    r.action === 'error' ? 'border-transparent bg-red-600 text-white hover:bg-red-700' : '',
                                    r.action === 'updated' ? 'border-transparent bg-sky-700 text-white hover:bg-sky-800' : '',
                                  ]
                                    .join(' ')
                                    .trim()}
                                >
                                  {r.action}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {r.wkorder} / {r.opac}
                              </TableCell>
                              <TableCell className="font-mono text-xs">{r.mntplan}</TableCell>
                              <TableCell className="font-mono text-xs">{r.mat}</TableCell>
                              <TableCell className="font-mono text-xs">{r.syst}</TableCell>
                              <TableCell className="max-w-[360px] truncate text-xs text-zinc-600" title={r.message}>
                                {r.message}
                              </TableCell>
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
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">รายการ IW37N</h3>
              <p className="mt-1 text-xs text-zinc-500">เทียบ `M_iw37n.php` / `M_iw37n_form.php` (แก้รายแถว)</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={itemQ}
                onChange={(e) => {
                  setItemQ(e.target.value)
                  setItemOffset(0)
                }}
                placeholder="ค้นหา wkorder / mntplan / opac"
                className="h-9 w-[260px]"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setItemOffset((x) => Math.max(0, x - itemLimit))}
                disabled={itemOffset === 0}
              >
                Prev
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setItemOffset((x) => x + itemLimit)}
                disabled={(itemsQ.data?.length ?? 0) < itemLimit}
              >
                Next
              </Button>
            </div>
          </div>

          {itemsQ.isLoading ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ) : itemsQ.isError ? (
            <p className="mt-4 text-sm text-red-600">{(itemsQ.error as Error).message}</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20 text-right">ID</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>OpAc</TableHead>
                    <TableHead>MntPlan</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Bsc start</TableHead>
                    <TableHead className="text-right" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(itemsQ.data?.length ?? 0) === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-sm text-zinc-500">
                        ไม่มีข้อมูล
                      </TableCell>
                    </TableRow>
                  ) : (
                    itemsQ.data?.map((it) => (
                      <TableRow key={it.idiw37}>
                        <TableCell className="text-right tabular-nums">{it.idiw37}</TableCell>
                        <TableCell className="font-mono text-xs">{it.wkorder}</TableCell>
                        <TableCell className="font-mono text-xs">{it.opac}</TableCell>
                        <TableCell className="font-mono text-xs">{it.mntplan}</TableCell>
                        <TableCell className="font-mono text-xs">{it.wktype}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {it.bscstart ? formatEpochSecondsToDdMmYyyy(it.bscstart) : ''}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button type="button" size="sm" variant="outline" onClick={() => openEdit(it.idiw37)}>
                            <Pencil className="mr-2 size-4" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <Dialog
          open={editOpen}
          onOpenChange={(next) => {
            if (!next) {
              setEditOpen(false)
              setEditingId(null)
              setEditError(null)
            }
          }}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Edit IW37N #{editingId ?? ''}</DialogTitle>
            </DialogHeader>

            {editError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {editError}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Order (wkorder)</Label>
                <Input value={form.wkorder} onChange={(e) => setForm((p) => ({ ...p, wkorder: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>OpAc (opac)</Label>
                <Input value={form.opac} onChange={(e) => setForm((p) => ({ ...p, opac: e.target.value }))} />
              </div>

              <div className="space-y-1.5">
                <Label>MntPlan</Label>
                <Input value={form.mntplan} onChange={(e) => setForm((p) => ({ ...p, mntplan: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Type (wktype)</Label>
                <Input value={form.wktype} onChange={(e) => setForm((p) => ({ ...p, wktype: e.target.value }))} />
              </div>

              <div className="space-y-1.5">
                <Label>MAT</Label>
                <Input value={form.mat} onChange={(e) => setForm((p) => ({ ...p, mat: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Team</Label>
                <Input value={form.team} onChange={(e) => setForm((p) => ({ ...p, team: e.target.value }))} />
              </div>

              <div className="space-y-1.5">
                <Label>Plan Date (DD.MM.YYYY)</Label>
                <Input value={form.bscstart} onChange={(e) => setForm((p) => ({ ...p, bscstart: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Acf.finish (DD.MM.YYYY)</Label>
                <Input value={form.actfinish} onChange={(e) => setForm((p) => ({ ...p, actfinish: e.target.value }))} />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label>System status</Label>
                <Input value={form.systemstatus} onChange={(e) => setForm((p) => ({ ...p, systemstatus: e.target.value }))} />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label>Operation short text</Label>
                <Input value={form.operationshorttext} onChange={(e) => setForm((p) => ({ ...p, operationshorttext: e.target.value }))} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Description</Label>
                <Input value={form.ostdescription} onChange={(e) => setForm((p) => ({ ...p, ostdescription: e.target.value }))} />
              </div>

              <div className="space-y-1.5">
                <Label>C</Label>
                <Input value={form.cknow} onChange={(e) => setForm((p) => ({ ...p, cknow: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Op.WorkCtr</Label>
                <Input value={form.wkctr} onChange={(e) => setForm((p) => ({ ...p, wkctr: e.target.value }))} />
              </div>

              <div className="space-y-1.5">
                <Label>Work</Label>
                <Input value={form.work} onChange={(e) => setForm((p) => ({ ...p, work: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Act. work</Label>
                <Input value={form.actwork} onChange={(e) => setForm((p) => ({ ...p, actwork: e.target.value }))} />
              </div>

              <div className="space-y-1.5">
                <Label>Un.</Label>
                <Input value={form.untime} onChange={(e) => setForm((p) => ({ ...p, untime: e.target.value }))} />
              </div>
              <div />

              <div className="space-y-1.5">
                <Label>Equipment</Label>
                <Input value={form.equipment} onChange={(e) => setForm((p) => ({ ...p, equipment: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Equipment descriptn</Label>
                <Input value={form.equdescrip} onChange={(e) => setForm((p) => ({ ...p, equdescrip: e.target.value }))} />
              </div>

              <div className="space-y-1.5">
                <Label>Functional Loc.</Label>
                <Input value={form.functionalloc} onChange={(e) => setForm((p) => ({ ...p, functionalloc: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>FunctLocDescrip.</Label>
                <Input value={form.funcdescrip} onChange={(e) => setForm((p) => ({ ...p, funcdescrip: e.target.value }))} />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditOpen(false)
                  setEditingId(null)
                  setEditError(null)
                }}
                disabled={saveMut.isPending}
              >
                Cancel
              </Button>
              <Button type="button" onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
                {saveMut.isPending ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-zinc-900">ประวัติการนำเข้า</h3>
          {batches.isLoading ? (
            <Skeleton className="h-40 w-full rounded-xl" />
          ) : batches.isError ? (
            <p className="text-sm text-red-600">{(batches.error as Error).message}</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ไฟล์</TableHead>
                    <TableHead>วันที่</TableHead>
                    <TableHead className="text-right">แถว</TableHead>
                    <TableHead>SHA256</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(batches.data?.length ?? 0) === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-sm text-zinc-500">
                        ยังไม่มีประวัติ — รัน migration 006 แล้วนำเข้าไฟล์แรก
                      </TableCell>
                    </TableRow>
                  ) : (
                    batches.data?.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="max-w-[220px] truncate text-sm font-medium">
                          {b.fileName}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs">
                          {b.importedAt.slice(0, 19).replace('T', ' ')}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{b.rows}</TableCell>
                        <TableCell className="max-w-[120px] truncate font-mono text-xs text-zinc-500">
                          {b.sha256}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant={b.status === 'OK' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {b.status}
                            </Badge>
                            {b.isDuplicate ? (
                              <Badge className="bg-purple-700 text-xs">DUPLICATE</Badge>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={exporting}
                              onClick={() => downloadCsv(b.id)}
                            >
                              CSV
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={exporting}
                              onClick={() => downloadXlsx(b.id, b.fileName)}
                            >
                              XLSX
                            </Button>
                            {b.isDuplicate && b.duplicateOfBatchId ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedBatchId(b.duplicateOfBatchId)}
                              >
                                batch เดิม
                              </Button>
                            ) : null}
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedBatchId(b.id)}
                            >
                              ดูผล
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
