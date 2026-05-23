import type { Iw37nImportPreviewResponse } from '@/api/schemas'
import { CanPermission } from '@/components/auth/CanPermission'
import { Iw37nImportReviewPanel } from '@/components/iw37n/Iw37nImportReviewPanel'
import { ReportExportButton } from '@/components/reports/ReportExportButton'
import { AppCard } from '@/components/layout/AppCard'
import { AppPageShell } from '@/components/layout/AppPageShell'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
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
  fetchIntegrationStatus,
  fetchIw37nBatches,
  fetchIw37nItem,
  fetchIw37nItems,
  postIntegrationJobsRun,
  postIw37nImport,
  postIw37nImportPreview,
  putIw37nItem,
} from '@/lib/api-public'
import { formatEpochSecondsToDdMmYyyy } from '@/lib/master-data-api'
import { useAnyPermission, usePermission } from '@/lib/use-permission'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, ClipboardCheck, FolderSync, Pencil } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatIw37nDuplicateMessage } from '@/lib/iw37n-import-messages'
import { toast } from 'sonner'

export function Iw37nPage() {
  const canRead = usePermission('iw37n.read')
  const canWrite = usePermission('iw37n.write')
  const canImport = useAnyPermission(['iw37n.import', 'iw37n.write'])
  const canIntegration = usePermission('integration.admin')
  const canRunFolderScan = canImport || canIntegration
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
  const [batchViewOpen, setBatchViewOpen] = useState(false)
  const [batchViewId, setBatchViewId] = useState<string | null>(null)
  const [batchViewFileName, setBatchViewFileName] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const openBatchView = (batchId: string, fileName?: string) => {
    setBatchViewId(batchId)
    setBatchViewFileName(fileName ?? null)
    setBatchViewOpen(true)
  }
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [importPreview, setImportPreview] = useState<Iw37nImportPreviewResponse | null>(null)

  const integrationQ = useQuery({
    queryKey: ['integration', 'status'],
    queryFn: fetchIntegrationStatus,
    enabled: canRunFolderScan,
    staleTime: 15_000,
    retry: false,
    placeholderData: keepPreviousData,
  })

  const folderScanMut = useMutation({
    mutationFn: postIntegrationJobsRun,
    onSuccess: async (data) => {
      await qc.invalidateQueries({ queryKey: ['integration', 'status'] })
      await qc.invalidateQueries({ queryKey: ['iw37n', 'batches'] })
      const s = data.job.summary as {
        filesProcessed?: number
        filesFailed?: number
        filesFound?: number
      }
      toast.success(
        `สแกนโฟลเดอร์เสร็จ (${data.job.status}) — ${s.filesProcessed ?? 0}/${s.filesFound ?? 0} ไฟล์`,
      )
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'สแกนไม่สำเร็จ'),
  })

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
      toast.error(e instanceof Error ? e.message : 'ดาวน์โหลดไม่สำเร็จ')
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
      toast.error(e instanceof Error ? e.message : 'ดาวน์โหลดไม่สำเร็จ')
    } finally {
      setExporting(false)
    }
  }

  const batches = useQuery({
    queryKey: ['iw37n-batches'],
    queryFn: fetchIw37nBatches,
    placeholderData: keepPreviousData,
  })

  const previewMut = useMutation({
    mutationFn: postIw37nImportPreview,
    onSuccess: (data) => {
      setImportPreview(data)
      if (data.summary.isDuplicate) {
        toast.warning(formatIw37nDuplicateMessage(data.summary.duplicateOfBatchId), { duration: 8000 })
      } else if (data.summary.totalRows === 0) {
        toast.error(
          'ไม่พบแถวข้อมูล — รูปแบบไฟล์ไม่ตรง SAP IW37N (ดูคอลัมน์ Order, Bsc start, FunctLocDescrip)',
          { duration: 10_000 },
        )
      } else {
        toast.message('ตรวจสอบไฟล์แล้ว — ดูสรุป error ก่อนกด commit')
      }
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const importMut = useMutation({
    mutationFn: postIw37nImport,
    onSuccess: (data) => {
      const batch = data.batch
      const rows = data.rows
      if (batch.isDuplicate && batch.duplicateOfBatchId) {
        toast.warning(formatIw37nDuplicateMessage(batch.duplicateOfBatchId), { duration: 8000 })
      } else if (batch.rows === 0) {
        toast.error(
          'ไม่พบแถวข้อมูลในไฟล์ — ตรวจว่าเป็น export IW37N จาก SAP (Dynamic List Display) และคอลัมน์ Order / Bsc start / FunctLoc ไม่ว่าง',
          { duration: 10_000 },
        )
      } else {
        toast.success(
          `นำเข้า ${batch.fileName}: ${batch.rows} แถว (${batch.status}) — ดูปฏิทินที่ ม.ค.–มี.ค. 2020 (วันที่ในไฟล์ SAP)`,
          { duration: 12_000 },
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
      openBatchView(batch.id, batch.fileName)
      setImportPreview(null)
      setPendingFile(null)
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

  const batchViewRowsQ = useQuery({
    queryKey: ['iw37n-batch-rows', batchViewId],
    queryFn: () => fetchIw37nBatchRows(batchViewId!, { limit: 2000, offset: 0 }),
    enabled: batchViewOpen && Boolean(batchViewId),
    placeholderData: keepPreviousData,
  })

  const [itemQ, setItemQ] = useState('')
  const [itemOffset, setItemOffset] = useState(0)
  const itemLimit = 100

  const itemsQ = useQuery({
    queryKey: ['iw37n-items', itemQ, itemLimit, itemOffset],
    queryFn: () => fetchIw37nItems({ q: itemQ.trim(), limit: itemLimit, offset: itemOffset }),
    placeholderData: keepPreviousData,
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
      toast.error(e instanceof Error ? e.message : 'โหลดข้อมูลไม่สำเร็จ')
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
      toast.success('บันทึกแล้ว')
      setEditOpen(false)
      setEditingId(null)
      await qc.invalidateQueries({ queryKey: ['iw37n-items'] })
      await qc.invalidateQueries({ queryKey: ['work-orders'] })
      await qc.invalidateQueries({ queryKey: ['calendar'] })
      await qc.invalidateQueries({ queryKey: ['backlog'] })
    },
    onError: (e: Error) => setEditError(e.message),
  })

  const pickFile = (): File | null => {
    const f = fileRef.current?.files?.[0] ?? pendingFile
    if (!f) {
      toast.message('เลือกไฟล์ .xls / .xlsx / .csv ก่อน')
      return null
    }
    setPendingFile(f)
    return f
  }

  const runPreview = () => {
    const f = pickFile()
    if (!f) return
    setImportPreview(null)
    previewMut.mutate(f)
  }

  const runCommit = () => {
    if (importPreview?.summary.isDuplicate) {
      toast.warning(formatIw37nDuplicateMessage(importPreview.summary.duplicateOfBatchId), {
        duration: 8000,
      })
    }
    const f = pendingFile ?? fileRef.current?.files?.[0]
    if (!f) {
      toast.message('เลือกไฟล์ใหม่')
      return
    }
    importMut.mutate(f)
  }

  /** นำเข้าทันที — เทียบ M_iw37n_imports.php (ไม่มีขั้น preview) */
  const runDirectImport = () => {
    const f = pickFile()
    if (!f) return
    setImportPreview(null)
    importMut.mutate(f)
  }

  const cancelPreview = () => {
    setImportPreview(null)
    setPendingFile(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  if (!canRead) {
    return (
      <AppPageShell title="IW37N" description="นำเข้าและจัดการข้อมูล IW37N จาก SAP">
        <EmptyState
          icon={AlertCircle}
          title="ไม่มีสิทธิ์เข้าถึง"
          description={
            <>
              ต้องมีสิทธิ์ <code className="text-xs">iw37n.read</code>
            </>
          }
        />
      </AppPageShell>
    )
  }

  return (
    <AppPageShell
      title="IW37N"
      description="นำเข้า Excel/CSV จาก SAP · แก้รายแถว · ประวัติ batch · สแกนโฟลเดอร์ inbound"
      contentClassName="space-y-6"
      headerActions={
        <>
          <Badge variant="secondary" className="text-xs">
            นำเข้า SAP
          </Badge>
          <Button type="button" variant="outline" size="sm" asChild>
            <Link to="/integration">SAP Integration</Link>
          </Button>
          <CanPermission permission="planning.read">
            <Button type="button" variant="outline" size="sm" asChild>
              <Link to="/planning">แผน PM/CM</Link>
            </Button>
          </CanPermission>
          <CanPermission permission="work-orders.read">
            <Button type="button" variant="outline" size="sm" asChild>
              <Link to="/work-orders">ใบงาน</Link>
            </Button>
          </CanPermission>
        </>
      }
    >
        {canImport ? (
          <AppCard pad="default">
            <h3 className="text-body-sm font-semibold text-app">นำเข้าไฟล์</h3>
            <p className="mt-1 text-xs text-app-muted">
              รูปแบบเดียวกับ PHP (M_iw37n.php): ข้าม 2 แถวแรก · รองรับ .xls / .xlsx / .csv — กด{' '}
              <strong>นำเข้าเลย</strong> เหมือนระบบเดิม หรือตรวจสอบก่อน commit
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-app-muted">เลือกไฟล์</label>
                <Input
                  ref={fileRef}
                  type="file"
                  accept=".xls,.xlsx,.xlsm,.csv"
                  onChange={() => {
                    setImportPreview(null)
                    setPendingFile(fileRef.current?.files?.[0] ?? null)
                  }}
                />
              </div>
              <Button
                type="button"
                onClick={runDirectImport}
                disabled={previewMut.isPending || importMut.isPending}
              >
                {importMut.isPending ? 'กำลังนำเข้า…' : 'นำเข้าเลย'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={runPreview}
                disabled={previewMut.isPending || importMut.isPending}
                className="gap-2"
              >
                <ClipboardCheck className="size-4" />
                {previewMut.isPending ? 'กำลังตรวจสอบ…' : 'ตรวจสอบก่อนนำเข้า'}
              </Button>
            </div>
            {importPreview ? (
              <Iw37nImportReviewPanel
                summary={importPreview.summary}
                rows={importPreview.rows}
                committing={importMut.isPending}
                onCommit={runCommit}
                onCancel={cancelPreview}
              />
            ) : null}
          </AppCard>
        ) : (
          <AppCard pad="compact">
            <p className="text-caption">
              นำเข้าไฟล์ต้องมีสิทธิ์ <code className="text-xs">iw37n.import</code> หรือ{' '}
              <code className="text-xs">iw37n.write</code>
            </p>
          </AppCard>
        )}

        {canRunFolderScan ? (
          <AppCard pad="default">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-body-sm font-semibold text-app">โฟลเดอร์ inbound (watch)</h3>
                <p className="mt-1 text-xs text-app-muted">
                  วางไฟล์ <code className="text-code">.csv / .xlsx / .xls</code> ใน{' '}
                  <code className="text-code">inbound/iw37n</code> — job สแกนทุก{' '}
                  {integrationQ.data?.watchIntervalMinutes ?? 10} นาที
                  {integrationQ.data?.watchEnabled === false ? ' (ปิดอยู่ใน settings)' : ''}
                </p>
                {integrationQ.isError ? (
                  <p className="mt-2 text-xs text-amber-700">
                    ยังไม่พร้อม — รัน migration{' '}
                    <code className="text-code">075_integration_job.sql</code>
                  </p>
                ) : integrationQ.data ? (
                  <p className="mt-2 break-all text-xs text-app-muted">
                    {integrationQ.data.inboundIw37nDir}
                    <span className="ml-2 text-app-muted">
                      · รอประมวลผล {integrationQ.data.pendingIw37nFiles.length} ไฟล์
                    </span>
                  </p>
                ) : integrationQ.isLoading ? (
                  <Skeleton className="mt-2 h-4 w-full max-w-md" />
                ) : null}
                {integrationQ.data?.lastJob ? (
                  <p className="mt-1 text-xs text-app-muted">
                    job ล่าสุด #{integrationQ.data.lastJob.id} —{' '}
                    {integrationQ.data.lastJob.status} (
                    {new Date(integrationQ.data.lastJob.startedAt).toLocaleString('th-TH')})
                  </p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                disabled={folderScanMut.isPending || integrationQ.isError}
                onClick={() => folderScanMut.mutate()}
              >
                <FolderSync className="size-4" />
                {folderScanMut.isPending ? 'กำลังสแกน…' : 'สแกนโฟลเดอร์เลย'}
              </Button>
            </div>
            {integrationQ.data && integrationQ.data.pendingIw37nFiles.length > 0 ? (
              <ul className="mt-3 list-inside list-disc text-xs text-app-muted">
                {integrationQ.data.pendingIw37nFiles.map((f) => (
                  <li key={f.name}>
                    {f.name} ({Math.round(f.sizeBytes / 1024)} KB)
                  </li>
                ))}
              </ul>
            ) : null}
          </AppCard>
        ) : null}

        <AppCard pad="default">
          <div>
            <h3 className="text-body-sm font-semibold text-app">ผลการนำเข้า (รายแถว)</h3>
            <p className="mt-1 text-xs text-app-muted">
              แสดงผลหลังนำเข้าล่าสุด — ดูประวัติเก่าได้ที่ปุ่ม <strong>ดูผล</strong> ด้านล่าง
            </p>
          </div>

          {lastImport ? (
            <div className="mt-3 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-app-muted">
                  {lastImport.fileName} ({lastImport.status}) — SHA {lastImport.sha256.slice(0, 8)}…
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <ReportExportButton
                    format="csv"
                    loading={exporting}
                    disabled={exporting}
                    onClick={() => downloadCsv(lastImport.batchId)}
                  />
                  <ReportExportButton
                    format="xlsx"
                    loading={exporting}
                    disabled={exporting}
                    onClick={() => downloadXlsx(lastImport.batchId, lastImport.fileName)}
                  />
                  {lastImport.isDuplicate ? (
                    <>
                      <Badge variant="outline" className="text-xs">
                        ซ้ำ
                      </Badge>
                      {lastImport.duplicateOfBatchId ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            openBatchView(
                              lastImport.duplicateOfBatchId!,
                              `batch-${lastImport.duplicateOfBatchId}`,
                            )
                          }
                        >
                          เปิด batch เดิม
                        </Button>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </div>
              <div className="app-table-shell overflow-x-auto">
                <Table embedded stickyHeader zebra>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16 text-center">ลำดับ</TableHead>
                      <TableHead>ผลลัพธ์</TableHead>
                      <TableHead>ใบงาน/Op</TableHead>
                      <TableHead>แผนบำรุง</TableHead>
                      <TableHead>Mat</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead>ข้อความ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lastImport.rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="p-0">
                          <EmptyState className="border-0 bg-transparent py-8" title="ไม่มีแถวในผลนำเข้า" />
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
                          <TableCell className="max-w-[360px] truncate text-xs text-app-muted" title={r.message}>
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
            <EmptyState
              className="mt-4 border-0 bg-transparent"
              title="ยังไม่มีผลนำเข้า"
              description="อัปโหลดไฟล์เพื่อดูผลรายแถวหลัง commit"
            />
          )}
        </AppCard>

        <AppCard pad="default">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-body-sm font-semibold text-app">รายการ IW37N</h3>
              <p className="mt-1 text-xs text-app-muted">เทียบ `M_iw37n.php` / `M_iw37n_form.php` (แก้รายแถว)</p>
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
                ก่อนหน้า
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setItemOffset((x) => x + itemLimit)}
                disabled={(itemsQ.data?.length ?? 0) < itemLimit}
              >
                ถัดไป
              </Button>
            </div>
          </div>

          {itemsQ.isLoading && !itemsQ.data ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-10 w-full rounded-card" />
              <Skeleton className="h-10 w-full rounded-card" />
              <Skeleton className="h-10 w-full rounded-card" />
            </div>
          ) : itemsQ.isError ? (
            <EmptyState
              className="mt-4"
              icon={AlertCircle}
              title="โหลดรายการไม่สำเร็จ"
              description={(itemsQ.error as Error).message}
              action={{ label: 'ลองใหม่', onClick: () => void itemsQ.refetch() }}
            />
          ) : (
            <div className="mt-4 app-table-shell overflow-x-auto">
              <Table embedded stickyHeader zebra>
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
                      <TableCell colSpan={7} className="p-0">
                        <EmptyState
                          className="border-0 bg-transparent py-10"
                          title="ไม่พบรายการ"
                          description={itemQ.trim() ? 'ลองคำค้นอื่น' : 'นำเข้าไฟล์ IW37N ก่อน'}
                        />
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
                          {canWrite ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => openEdit(it.idiw37)}
                            >
                              <Pencil className="mr-2 size-4" aria-hidden />
                              แก้ไข
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </AppCard>

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
              <DialogTitle>แก้ไข IW37N #{editingId ?? ''}</DialogTitle>
            </DialogHeader>

            {editError ? (
              <div className="rounded-card border border-red-200 bg-red-50 px-3 py-2 text-body-sm text-red-700">
                {editError}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Order (wkorder)</Label>
                <Input value={form.wkorder} onChange={(e) => setForm((p) => ({ ...p, wkorder: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>OpAc (opac)</Label>
                <Input value={form.opac} onChange={(e) => setForm((p) => ({ ...p, opac: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label>MntPlan</Label>
                <Input value={form.mntplan} onChange={(e) => setForm((p) => ({ ...p, mntplan: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Type (wktype)</Label>
                <Input value={form.wktype} onChange={(e) => setForm((p) => ({ ...p, wktype: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label>MAT</Label>
                <Input value={form.mat} onChange={(e) => setForm((p) => ({ ...p, mat: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Team</Label>
                <Input value={form.team} onChange={(e) => setForm((p) => ({ ...p, team: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label>Plan Date (DD.MM.YYYY)</Label>
                <Input value={form.bscstart} onChange={(e) => setForm((p) => ({ ...p, bscstart: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Acf.finish (DD.MM.YYYY)</Label>
                <Input value={form.actfinish} onChange={(e) => setForm((p) => ({ ...p, actfinish: e.target.value }))} />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>System status</Label>
                <Input value={form.systemstatus} onChange={(e) => setForm((p) => ({ ...p, systemstatus: e.target.value }))} />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Operation short text</Label>
                <Input value={form.operationshorttext} onChange={(e) => setForm((p) => ({ ...p, operationshorttext: e.target.value }))} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <Input value={form.ostdescription} onChange={(e) => setForm((p) => ({ ...p, ostdescription: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label>C</Label>
                <Input value={form.cknow} onChange={(e) => setForm((p) => ({ ...p, cknow: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Op.WorkCtr</Label>
                <Input value={form.wkctr} onChange={(e) => setForm((p) => ({ ...p, wkctr: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label>Work</Label>
                <Input value={form.work} onChange={(e) => setForm((p) => ({ ...p, work: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Act. work</Label>
                <Input value={form.actwork} onChange={(e) => setForm((p) => ({ ...p, actwork: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label>Un.</Label>
                <Input value={form.untime} onChange={(e) => setForm((p) => ({ ...p, untime: e.target.value }))} />
              </div>
              <div />

              <div className="space-y-2">
                <Label>Equipment</Label>
                <Input value={form.equipment} onChange={(e) => setForm((p) => ({ ...p, equipment: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Equipment descriptn</Label>
                <Input value={form.equdescrip} onChange={(e) => setForm((p) => ({ ...p, equdescrip: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label>Functional Loc.</Label>
                <Input value={form.functionalloc} onChange={(e) => setForm((p) => ({ ...p, functionalloc: e.target.value }))} />
              </div>
              <div className="space-y-2">
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
                ยกเลิก
              </Button>
              <Button type="button" onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
                {saveMut.isPending ? 'กำลังบันทึก…' : 'บันทึก'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <AppCard pad="default">
          <h3 className="text-body-sm font-semibold text-app">ประวัติการนำเข้า</h3>
          {batches.isLoading && !batches.data ? (
            <Skeleton className="mt-4 h-40 w-full rounded-card" />
          ) : batches.isError ? (
            <EmptyState
              className="mt-4"
              icon={AlertCircle}
              title="โหลดประวัติไม่สำเร็จ"
              description={(batches.error as Error).message}
              action={{ label: 'ลองใหม่', onClick: () => void batches.refetch() }}
            />
          ) : (
            <div className="mt-4 app-table-shell overflow-x-auto">
              <Table embedded stickyHeader zebra>
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
                      <TableCell colSpan={6} className="p-0">
                        <EmptyState
                          className="border-0 bg-transparent py-10"
                          title="ยังไม่มีประวัติ"
                          description="นำเข้าไฟล์ IW37N แรก หรือวางในโฟลเดอร์ inbound"
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    batches.data?.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="max-w-[220px] truncate text-body-sm font-medium">
                          {b.fileName}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs">
                          {b.importedAt.slice(0, 19).replace('T', ' ')}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{b.rows}</TableCell>
                        <TableCell className="max-w-[120px] truncate font-mono text-xs text-app-muted">
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
                              <Badge variant="outline" className="text-xs">
                                ซ้ำ
                              </Badge>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <ReportExportButton
                              format="csv"
                              loading={exporting}
                              disabled={exporting}
                              onClick={() => downloadCsv(b.id)}
                            />
                            <ReportExportButton
                              format="xlsx"
                              loading={exporting}
                              disabled={exporting}
                              onClick={() => downloadXlsx(b.id, b.fileName)}
                            />
                            {b.isDuplicate && b.duplicateOfBatchId ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => openBatchView(b.duplicateOfBatchId!, `batch-${b.duplicateOfBatchId}`)}
                              >
                                batch เดิม
                              </Button>
                            ) : null}
                            <Button
                              type="button"
                              size="sm"
                              variant={batchViewId === b.id && batchViewOpen ? 'default' : 'outline'}
                              onClick={() => openBatchView(b.id, b.fileName)}
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
        </AppCard>

        <Dialog
          open={batchViewOpen}
          onOpenChange={(open) => {
            setBatchViewOpen(open)
            if (!open) {
              setBatchViewId(null)
              setBatchViewFileName(null)
            }
          }}
        >
          <DialogContent className="flex max-h-[85vh] max-w-4xl flex-col gap-4 overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-left">
                ผลการนำเข้า (batch #{batchViewId ?? '—'})
                {batchViewFileName ? (
                  <span className="mt-1 block text-xs font-normal text-app-muted">{batchViewFileName}</span>
                ) : null}
              </DialogTitle>
            </DialogHeader>
            {batchViewId ? (
              <div className="flex flex-wrap gap-2">
                <ReportExportButton
                  format="csv"
                  loading={exporting}
                  disabled={exporting}
                  onClick={() => downloadCsv(batchViewId)}
                />
                <ReportExportButton
                  format="xlsx"
                  loading={exporting}
                  disabled={exporting}
                  onClick={() => downloadXlsx(batchViewId, batchViewFileName ?? undefined)}
                />
              </div>
            ) : null}
            <div className="min-h-0 flex-1 overflow-y-auto">
              {batchViewRowsQ.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full rounded-card" />
                  <Skeleton className="h-10 w-full rounded-card" />
                  <Skeleton className="h-10 w-full rounded-card" />
                </div>
              ) : batchViewRowsQ.isError ? (
                <p className="text-body-sm text-red-600">{(batchViewRowsQ.error as Error).message}</p>
              ) : batchViewRowsQ.data ? (
                <div className="space-y-2">
                  <p className="text-xs text-app-muted">
                    {batchViewRowsQ.data.items.length} แถว
                    {batchViewRowsQ.data.items.length >= 2000 ? ' (แสดงสูงสุด 2,000 แถว)' : ''}
                  </p>
                  <div className="app-table-shell overflow-x-auto">
                    <Table embedded stickyHeader zebra>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16 text-center">ลำดับ</TableHead>
                          <TableHead>ผลลัพธ์</TableHead>
                          <TableHead>ใบงาน/Op</TableHead>
                          <TableHead>แผนบำรุง</TableHead>
                          <TableHead>Mat</TableHead>
                          <TableHead>สถานะ</TableHead>
                          <TableHead>ข้อความ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {batchViewRowsQ.data.items.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="p-0">
                              <EmptyState
                                className="border-0 bg-transparent py-8"
                                title="ไม่มีรายละเอียดแถว"
                                description="อาจเป็น batch ก่อน migration 030 (ตาราง import_row)"
                              />
                            </TableCell>
                          </TableRow>
                        ) : (
                          batchViewRowsQ.data.items.map((r) => (
                            <TableRow key={`${r.rowNo}-${r.createdAt}`}>
                              <TableCell className="text-center tabular-nums">{r.rowNo}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                <Badge
                                  variant={r.action === 'skipped' ? 'secondary' : 'default'}
                                  className={[
                                    'text-xs',
                                    r.action === 'error'
                                      ? 'border-transparent bg-red-600 text-white hover:bg-red-700'
                                      : '',
                                    r.action === 'updated'
                                      ? 'border-transparent bg-sky-700 text-white hover:bg-sky-800'
                                      : '',
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
                              <TableCell
                                className="max-w-[280px] truncate text-xs text-app-muted"
                                title={r.message}
                              >
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
          </DialogContent>
        </Dialog>
    </AppPageShell>
  )
}
