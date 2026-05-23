import type { Iw37nImportPreviewResponse } from '@/api/schemas'
import { CanPermission } from '@/components/auth/CanPermission'
import { Iw37nImportReviewPanel } from '@/components/iw37n/Iw37nImportReviewPanel'
import { ReportExportButton } from '@/components/reports/ReportExportButton'
import { AppCard } from '@/components/layout/AppCard'
import { AppPageShell } from '@/components/layout/AppPageShell'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  confirmationSapCsvFilename,
  fetchConfirmationExport,
  fetchConfirmationExportCsv,
  fetchConfirmationExportXlsx,
  fetchIntegrationJobs,
  fetchIntegrationStatus,
  fetchIw37nBatchCsv,
  fetchIw37nBatches,
  postConfirmationImport,
  postIntegrationJobsRun,
  postIw37nImport,
  postIw37nImportPreview,
} from '@/lib/api-public'
import { useAnyPermission, usePermission } from '@/lib/use-permission'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, ArrowLeftRight, BookOpen, ClipboardCheck, FolderSync, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatIw37nDuplicateMessage } from '@/lib/iw37n-import-messages'
import { toast } from 'sonner'

function downloadBlob(blob: Blob, fileName: string) {
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

export function IntegrationPage() {
  const canIw37n = useAnyPermission(['iw37n.read', 'integration.admin'])
  const canImport = usePermission('iw37n.import')
  const canConfirm = usePermission('confirmation.read')
  const canConfirmImport = usePermission('confirmation.import')
  const canRunScan =
    usePermission('iw37n.import') ||
    usePermission('confirmation.import') ||
    usePermission('integration.admin')

  if (!canIw37n) {
    return (
      <AppPageShell
        title="SAP Integration"
        description="นำเข้า/ส่งออก CSV ระหว่าง SAP กับ PM"
      >
        <EmptyState
          icon={AlertCircle}
          title="ไม่มีสิทธิ์เข้าถึง"
          description={
            <>
              ต้องมีสิทธิ์ <code className="text-xs">iw37n.read</code> หรือ{' '}
              <code className="text-xs">integration.admin</code>
            </>
          }
        />
      </AppPageShell>
    )
  }

  return (
    <AppPageShell
      title="SAP Integration"
      description="นำเข้า IW37N · Confirm IN/OUT · สแกนโฟลเดอร์ · สัญญาไฟล์ CSV"
      contentClassName="space-y-4"
      headerActions={
        <>
          <Badge variant="secondary" className="gap-1 text-xs">
            <ArrowLeftRight className="size-3.5" aria-hidden />
            CSV เข้า/ออก
          </Badge>
          <CanPermission permission="iw37n.read">
            <Button type="button" variant="outline" size="sm" asChild>
              <Link to="/iw37n">หน้า IW37N</Link>
            </Button>
          </CanPermission>
          <CanPermission permission="confirmation.read">
            <Button type="button" variant="outline" size="sm" asChild>
              <Link to="/confirmation">รับรองงาน</Link>
            </Button>
          </CanPermission>
          <CanPermission permission="planning.read">
            <Button type="button" variant="outline" size="sm" asChild>
              <Link to="/planning">แผน PM/CM</Link>
            </Button>
          </CanPermission>
        </>
      }
    >
        <Tabs defaultValue="iw37n" className="space-y-4">
          <TabsList className="flex h-auto flex-wrap gap-1 bg-[var(--app-surface)] p-1">
            <TabsTrigger value="iw37n">นำเข้า IW37N</TabsTrigger>
            {canConfirmImport ? (
              <TabsTrigger value="confirm-in">นำเข้า Confirm (IN)</TabsTrigger>
            ) : null}
            {canConfirm ? <TabsTrigger value="confirm">ส่งออก Confirm → SAP</TabsTrigger> : null}
            <TabsTrigger value="jobs">Job & โฟลเดอร์</TabsTrigger>
            <TabsTrigger value="guide">คู่มือสัญญาไฟล์</TabsTrigger>
          </TabsList>

          <TabsContent value="iw37n">
            <IntegrationIw37nTab canImport={canImport} />
          </TabsContent>

          {canConfirmImport ? (
            <TabsContent value="confirm-in">
              <IntegrationConfirmInTab />
            </TabsContent>
          ) : null}

          {canConfirm ? (
            <TabsContent value="confirm">
              <IntegrationConfirmTab />
            </TabsContent>
          ) : null}

          <TabsContent value="jobs">
            <IntegrationJobsTab canRunScan={canRunScan} />
          </TabsContent>

          <TabsContent value="guide">
            <IntegrationGuideTab />
          </TabsContent>
        </Tabs>
    </AppPageShell>
  )
}

function IntegrationIw37nTab({ canImport }: { canImport: boolean }) {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [importPreview, setImportPreview] = useState<Iw37nImportPreviewResponse | null>(null)
  const batchesQ = useQuery({
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
      } else {
        toast.message('ตรวจสอบแล้ว — กด commit เมื่อพร้อม')
      }
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const importMut = useMutation({
    mutationFn: postIw37nImport,
    onSuccess: (data) => {
      const batch = data.batch
      const inserted = data.rows.filter((r) => r.action === 'inserted').length
      const updated = data.rows.filter((r) => r.action === 'updated').length
      const skipped = data.rows.filter((r) => r.action === 'skipped').length
      if (batch.isDuplicate && batch.duplicateOfBatchId) {
        toast.warning(formatIw37nDuplicateMessage(batch.duplicateOfBatchId), { duration: 8000 })
      } else if (inserted + updated === 0) {
        toast.warning(
          `นำเข้า ${batch.fileName} — ไม่มีแถวใหม่ (เพิ่ม 0 · อัปเดต 0 · ข้าม ${skipped})`,
          { duration: 10_000 },
        )
      } else {
        toast.success(
          `นำเข้าสำเร็จ — เพิ่ม ${inserted} · อัปเดต ${updated}${skipped > 0 ? ` · ข้าม ${skipped}` : ''} (batch #${batch.id})`,
        )
      }
      setImportPreview(null)
      setPendingFile(null)
      void qc.invalidateQueries({ queryKey: ['iw37n-batches'] })
      void qc.invalidateQueries({ queryKey: ['integration', 'status'] })
      if (fileRef.current) fileRef.current.value = ''
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const onPreview = () => {
    const file = fileRef.current?.files?.[0]
    if (!file) {
      toast.error('เลือกไฟล์ก่อน')
      return
    }
    setPendingFile(file)
    setImportPreview(null)
    previewMut.mutate(file)
  }

  const onCommit = () => {
    if (importPreview?.summary.isDuplicate) {
      toast.error(formatIw37nDuplicateMessage(importPreview.summary.duplicateOfBatchId))
      return
    }
    const file = pendingFile ?? fileRef.current?.files?.[0]
    if (!file) {
      toast.error('เลือกไฟล์ใหม่')
      return
    }
    importMut.mutate(file)
  }

  const onBatchCsv = async (batchId: string) => {
    try {
      const blob = await fetchIw37nBatchCsv(batchId)
      downloadBlob(blob, `iw37n-import-batch-${batchId}.csv`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'ดาวน์โหลดไม่สำเร็จ')
    }
  }

  const items = (batchesQ.data ?? []).slice(0, 15)

  return (
    <div className="space-y-4">
      <AppCard pad="compact">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-body-sm font-semibold text-app">อัปโหลด IW37N (มือ)</h3>
            <p className="mt-1 text-xs text-app-muted">
              ตรวจสอบ + สรุป error ก่อน commit · กันซ้ำด้วย SHA256 · หรือวางไฟล์ในโฟลเดอร์ (แท็บ Job)
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" asChild>
            <Link to="/iw37n">หน้า IW37N เต็ม →</Link>
          </Button>
        </div>
        {canImport ? (
          <>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <Input
                ref={fileRef}
                type="file"
                accept=".xls,.xlsx,.csv"
                className="max-w-md"
                onChange={() => {
                  setImportPreview(null)
                  setPendingFile(fileRef.current?.files?.[0] ?? null)
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                disabled={previewMut.isPending || importMut.isPending}
                onClick={onPreview}
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
                onCommit={onCommit}
                onCancel={() => {
                  setImportPreview(null)
                  setPendingFile(null)
                  if (fileRef.current) fileRef.current.value = ''
                }}
              />
            ) : null}
          </>
        ) : (
          <p className="mt-3 text-xs text-app-muted">ต้องมีสิทธิ์ iw37n.import</p>
        )}
      </AppCard>

      <AppCard pad="compact">
        <h3 className="text-body-sm font-semibold text-app">ประวัติ batch ล่าสุด</h3>
        {batchesQ.isError ? (
          <EmptyState
            className="mt-4"
            icon={AlertCircle}
            title="โหลดประวัติไม่สำเร็จ"
            description={
              batchesQ.error instanceof Error ? batchesQ.error.message : 'ลองใหม่อีกครั้ง'
            }
            action={{ label: 'ลองใหม่', onClick: () => void batchesQ.refetch() }}
          />
        ) : (
        <div className="app-table-shell mt-3 overflow-x-auto">
          <Table embedded stickyHeader zebra>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>ไฟล์</TableHead>
                <TableHead>เมื่อ</TableHead>
                <TableHead>แถว</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">รายงาน</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batchesQ.isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={`sk-${i}`}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <EmptyState
                      className="py-10"
                      title="ยังไม่มี batch"
                      description="นำเข้าไฟล์ IW37N หรือวางในโฟลเดอร์ inbound แล้วสแกนจากแท็บ Job"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                items.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="tabular-nums">#{b.id}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{b.fileName}</TableCell>
                    <TableCell className="text-xs text-app-muted">
                      {new Date(b.importedAt).toLocaleString('th-TH')}
                    </TableCell>
                    <TableCell className="tabular-nums">{b.rows}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={b.status === 'OK' ? 'secondary' : 'outline'}>
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
                        {b.isDuplicate && b.duplicateOfBatchId ? (
                          <Button type="button" size="sm" variant="outline" asChild>
                            <Link to="/iw37n">batch #{b.duplicateOfBatchId}</Link>
                          </Button>
                        ) : null}
                        <ReportExportButton
                          label="ดาวน์โหลด log"
                          onClick={() => void onBatchCsv(b.id)}
                        />
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
    </div>
  )
}

function IntegrationConfirmInTab() {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const statusQ = useQuery({
    queryKey: ['integration', 'status'],
    queryFn: fetchIntegrationStatus,
    staleTime: 15_000,
    retry: false,
    placeholderData: keepPreviousData,
  })

  const importMut = useMutation({
    mutationFn: postConfirmationImport,
    onSuccess: (data) => {
      toast.success(
        `นำเข้า ${data.fileName}: +${data.inserted} / ~${data.updated} (ข้าม ${data.skipped}, error ${data.errors})`,
      )
      void qc.invalidateQueries({ queryKey: ['integration', 'status'] })
      if (fileRef.current) fileRef.current.value = ''
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const onImport = () => {
    const file = fileRef.current?.files?.[0]
    if (!file) {
      toast.error('เลือกไฟล์ก่อน')
      return
    }
    importMut.mutate(file)
  }

  const pending = statusQ.data?.pendingConfirmFiles ?? []
  const inboundDir = statusQ.data?.inboundConfirmDir

  return (
    <div className="space-y-4">
      <AppCard pad="compact">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-body-sm font-semibold text-app">CONFIRM_IN (SAP → PM)</h3>
            <p className="mt-1 text-xs text-app-muted">
              แมปเดียว M_Confirm.php · .csv/.xlsx · ข้าม 2 แถว — หรือวางใน{' '}
              <code className="text-code">inbound/confirm</code> แล้วสแกน (แท็บ Job)
            </p>
            {inboundDir ? (
              <p className="mt-2 break-all text-xs text-app-muted">{inboundDir}</p>
            ) : null}
            {pending.length > 0 ? (
              <p className="mt-1 text-xs text-amber-700">
                รอสแกน {pending.length} ไฟล์ในโฟลเดอร์
              </p>
            ) : null}
          </div>
          <Button type="button" variant="outline" size="sm" asChild>
            <Link to="/confirmation">หน้า Confirmation →</Link>
          </Button>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input ref={fileRef} type="file" accept=".xls,.xlsx,.csv" className="max-w-md" />
          <Button
            type="button"
            className="gap-2"
            disabled={importMut.isPending}
            onClick={onImport}
          >
            <Upload className="size-4" />
            {importMut.isPending ? 'กำลังนำเข้า…' : 'อัปโหลด Confirm'}
          </Button>
        </div>
        {statusQ.isError ? (
          <p className="mt-3 text-xs text-amber-700">
            ไม่สามารถอ่านสถานะโฟลเดอร์ — ตรวจ migration 075/076
          </p>
        ) : null}
      </AppCard>
    </div>
  )
}

function IntegrationConfirmTab() {
  const [exporting, setExporting] = useState<'xlsx' | 'csv' | null>(null)
  const exportQ = useQuery({
    queryKey: ['confirmation', 'export', 'preview'],
    queryFn: fetchConfirmationExport,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })

  const onDownload = async (format: 'xlsx' | 'csv') => {
    setExporting(format)
    try {
      const blob =
        format === 'xlsx'
          ? await fetchConfirmationExportXlsx()
          : await fetchConfirmationExportCsv()
      downloadBlob(
        blob,
        format === 'xlsx' ? 'Export_Confirm.xlsx' : confirmationSapCsvFilename(),
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'ส่งออกไม่สำเร็จ')
    } finally {
      setExporting(null)
    }
  }

  const items = exportQ.data?.items ?? []
  const preview = items.slice(0, 20)
  const scope = exportQ.data?.scope
  const actorWkctr = exportQ.data?.actorWkctr ?? ''

  return (
    <div className="space-y-4">
      <AppCard pad="compact">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-body-sm font-semibold text-app">CONFIRM_OUT → SAP</h3>
            <p className="mt-1 text-xs text-app-muted">
              คอลัมน์ตาม M_Export_confirm_excel.php · syst CRTD/REL
              {scope === 'ALL'
                ? ' · สิทธิ์ ALL (PAC007/PRO005)'
                : scope === 'OWN'
                  ? ` · OWN wkctr=${actorWkctr || '-'}`
                  : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" asChild>
              <Link to="/confirmation/export">ดูตัวอย่างเต็ม</Link>
            </Button>
            <ReportExportButton
              format="xlsx"
              label="ส่งออก Excel"
              loading={exporting === 'xlsx'}
              loadingLabel="กำลังส่งออก…"
              disabled={exporting != null || items.length === 0}
              onClick={() => void onDownload('xlsx')}
            />
            <ReportExportButton
              format="csv"
              label="CSV สำหรับ SAP"
              variant="default"
              loading={exporting === 'csv'}
              loadingLabel="กำลังส่งออก…"
              disabled={exporting != null || items.length === 0}
              onClick={() => void onDownload('csv')}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-app-muted">
          {exportQ.isLoading && !exportQ.data
            ? 'กำลังโหลด…'
            : exportQ.isError
              ? `โหลดไม่สำเร็จ: ${exportQ.error instanceof Error ? exportQ.error.message : String(exportQ.error)}`
              : `ทั้งหมด ${items.length} แถว — แสดงตัวอย่าง ${preview.length} แถวแรก`}
        </p>
        {exportQ.isError ? (
          <div className="mt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => void exportQ.refetch()}>
              ลองใหม่
            </Button>
          </div>
        ) : null}
      </AppCard>

      <div className="app-table-shell overflow-x-auto">
        <Table embedded stickyHeader zebra>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 text-right">#</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Op</TableHead>
              <TableHead>Wrk Ctr</TableHead>
              <TableHead className="text-right">Act.Work</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exportQ.isLoading && !exportQ.data ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`ex-sk-${i}`}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : preview.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="p-0">
                    <div className="flex flex-col items-center gap-3 py-6">
                      <EmptyState
                        className="border-0 bg-transparent py-4"
                        title="ไม่มีแถวสำหรับส่งออก"
                        description="ตรวจสอบสถานะ CRTD/REL และสิทธิ์ OWN/ALL ที่หน้ารับรองงาน"
                      />
                      <Button type="button" variant="outline" size="sm" asChild>
                        <Link to="/confirmation">ไปหน้ารับรองงาน</Link>
                      </Button>
                    </div>
                </TableCell>
              </TableRow>
            ) : (
              preview.map((row) => (
                <TableRow key={`${row.wkorder}-${row.opac}-${row.no}`}>
                  <TableCell className="text-right tabular-nums">{row.no}</TableCell>
                  <TableCell className="tabular-nums">{row.wkorder}</TableCell>
                  <TableCell className="tabular-nums">{row.opac}</TableCell>
                  <TableCell>{row.wkctr}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.timewk}</TableCell>
                  <TableCell className="tabular-nums text-xs">
                    {row.startDateExe} {row.startExecute}
                  </TableCell>
                  <TableCell className="tabular-nums text-xs">
                    {row.endDateExe} {row.endExecute}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function IntegrationJobsTab({ canRunScan }: { canRunScan: boolean }) {
  const qc = useQueryClient()
  const statusQ = useQuery({
    queryKey: ['integration', 'status'],
    queryFn: fetchIntegrationStatus,
    staleTime: 10_000,
    retry: false,
    placeholderData: keepPreviousData,
  })
  const jobsQ = useQuery({
    queryKey: ['integration', 'jobs'],
    queryFn: () => fetchIntegrationJobs(30),
    staleTime: 10_000,
    retry: false,
    placeholderData: keepPreviousData,
  })

  const scanMut = useMutation({
    mutationFn: postIntegrationJobsRun,
    onSuccess: async (data) => {
      await qc.invalidateQueries({ queryKey: ['integration'] })
      await qc.invalidateQueries({ queryKey: ['iw37n-batches'] })
      const s = data.job.summary as {
        filesProcessed?: number
        filesFound?: number
        iw37n?: { filesProcessed?: number; filesFound?: number }
        confirm?: { filesProcessed?: number; filesFound?: number }
      }
      const iw = s.iw37n
      const cf = s.confirm
      toast.success(
        `สแกนเสร็จ (${data.job.status}) — IW37N ${iw?.filesProcessed ?? 0}/${iw?.filesFound ?? 0}, Confirm ${cf?.filesProcessed ?? 0}/${cf?.filesFound ?? 0}`,
      )
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'สแกนไม่สำเร็จ'),
  })

  const st = statusQ.data

  return (
    <div className="space-y-4">
      <AppCard pad="compact">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-body-sm font-semibold text-app">โฟลเดอร์ inbound (watch)</h3>
            {statusQ.isError ? (
              <p className="mt-2 text-xs text-amber-700">
                รัน migration{' '}
                <code className="text-code">075</code> + <code className="text-code">076</code>
              </p>
            ) : statusQ.isLoading ? (
              <Skeleton className="mt-2 h-4 w-full max-w-lg" />
            ) : st ? (
              <div className="mt-2 space-y-2 text-xs text-app-muted">
                <p className="break-all">
                  <span className="font-medium text-app">IW37N:</span> {st.inboundIw37nDir}
                  <span className="ml-2">({st.pendingIw37nFiles.length} ไฟล์รอ)</span>
                </p>
                <p className="break-all">
                  <span className="font-medium text-app">Confirm IN:</span>{' '}
                  {st.inboundConfirmDir}
                  <span className="ml-2">({st.pendingConfirmFiles.length} ไฟล์รอ)</span>
                </p>
                <p>
                  สแกนอัตโนมัติ:{' '}
                  {st.watchEnabled
                    ? `ทุก ${st.watchIntervalMinutes} นาที`
                    : 'ปิด (integration.watch_enabled)'}
                </p>
                {st.lastJob ? (
                  <p>
                    Job ล่าสุด #{st.lastJob.id} ({st.lastJob.jobType}) — {st.lastJob.status} (
                    {new Date(st.lastJob.startedAt).toLocaleString('th-TH')})
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
          {canRunScan ? (
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={scanMut.isPending || statusQ.isError}
              onClick={() => scanMut.mutate()}
            >
              <FolderSync className="size-4" />
              {scanMut.isPending ? 'กำลังสแกน…' : 'สแกนโฟลเดอร์เลย'}
            </Button>
          ) : null}
        </div>
        {st && (st.pendingIw37nFiles.length > 0 || st.pendingConfirmFiles.length > 0) ? (
          <ul className="mt-3 list-inside list-disc text-xs text-app-muted">
            {st.pendingIw37nFiles.map((f) => (
              <li key={`iw37n-${f.name}`}>
                [IW37N] {f.name} ({Math.round(f.sizeBytes / 1024)} KB)
              </li>
            ))}
            {st.pendingConfirmFiles.map((f) => (
              <li key={`confirm-${f.name}`}>
                [Confirm] {f.name} ({Math.round(f.sizeBytes / 1024)} KB)
              </li>
            ))}
          </ul>
        ) : null}
        <p className="mt-3 text-xs text-app-muted">
          CLI: <code className="rounded bg-app-muted px-1">npm run integration:watch</code> (ใน
          backend)
        </p>
      </AppCard>

      <AppCard pad="compact">
        <h3 className="text-body-sm font-semibold text-app">ประวัติ integration job</h3>
        {jobsQ.isError ? (
          <EmptyState
            className="mt-4"
            icon={AlertCircle}
            title="ยังไม่มีตาราง integration_job"
            description="รัน migration 075 และ 076 บนฐานข้อมูล"
          />
        ) : (
        <div className="app-table-shell mt-3 overflow-x-auto">
          <Table embedded stickyHeader zebra>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>เริ่ม</TableHead>
                <TableHead>ไฟล์ / batch</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobsQ.isLoading && !jobsQ.data ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={`job-sk-${i}`}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (jobsQ.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <EmptyState
                      className="py-10"
                      title="ยังไม่มี job"
                      description="กดสแกนโฟลเดอร์หรือรอ cron integration:watch"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                (jobsQ.data ?? []).map((j) => {
                  const sum = j.summary as {
                    filesFound?: number
                    filesProcessed?: number
                    iw37n?: { filesFound?: number; filesProcessed?: number }
                    confirm?: { filesFound?: number; filesProcessed?: number }
                  }
                  const detail =
                    sum.iw37n || sum.confirm
                      ? `IW37N ${sum.iw37n?.filesProcessed ?? 0}/${sum.iw37n?.filesFound ?? 0}, Confirm ${sum.confirm?.filesProcessed ?? 0}/${sum.confirm?.filesFound ?? 0}`
                      : sum.filesFound != null
                        ? `${sum.filesProcessed ?? 0}/${sum.filesFound}`
                        : ''
                  return (
                    <TableRow key={j.id}>
                      <TableCell className="tabular-nums">#{j.id}</TableCell>
                      <TableCell className="text-xs">{j.jobType}</TableCell>
                      <TableCell className="text-xs">{j.trigger}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            j.status === 'success'
                              ? 'secondary'
                              : j.status === 'failed'
                                ? 'destructive'
                                : 'outline'
                          }
                        >
                          {j.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-app-muted">
                        {new Date(j.startedAt).toLocaleString('th-TH')}
                      </TableCell>
                      <TableCell className="text-xs text-app-muted">
                        {j.fileName ?? '—'}
                        {detail ? ` · ${detail}` : ''}
                        {j.batchId ? ` · batch #${j.batchId}` : ''}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
        )}
      </AppCard>
    </div>
  )
}

function IntegrationGuideTab() {
  return (
    <AppCard pad="default" className="space-y-4 text-body-sm text-app">
      <div className="flex items-center gap-2 text-app">
        <BookOpen className="size-4" />
        <h3 className="font-semibold">สัญญาไฟล์ CSV (SAP ↔ PM)</h3>
      </div>

      <section>
        <h4 className="font-medium text-app">IW37N_IN (SAP → PM)</h4>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
          <li>โฟลเดอร์: <code>data/integration/inbound/iw37n/</code></li>
          <li>ชื่อแนะนำ: <code>IW37N_YYYYMMDD_HHmmss.csv</code></li>
          <li>UTF-8, comma/tab, ข้าม 2 แถว header</li>
          <li>Upsert คีย์: wkorder + opac</li>
        </ul>
      </section>

      <section>
        <h4 className="font-medium text-app">CONFIRM_IN (SAP → PM)</h4>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
          <li>โฟลเดอร์: <code>data/integration/inbound/confirm/</code></li>
          <li>ชื่อแนะนำ: <code>CONFIRM_IN_YYYYMMDD.csv</code></li>
          <li>Parser: <code>confirmation-import.ts</code> (เทียบ M_Confirm.php)</li>
        </ul>
      </section>

      <section>
        <h4 className="font-medium text-app">CONFIRM_OUT (PM → SAP)</h4>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
          <li>ดาวน์โหลดจากแท็บ Confirm หรือ <Link to="/confirmation">/confirmation</Link></li>
          <li>ชื่อไฟล์: <code>CONFIRM_OUT_YYYYMMDD_HHmmss.csv</code></li>
          <li>กรอง syst CRTD/REL · PAC007/PRO005 = ทุกแถว</li>
        </ul>
      </section>

      <section>
        <h4 className="font-medium text-app">โครงสร้างโฟลเดอร์</h4>
        <pre className="mt-2 overflow-x-auto rounded-button bg-app-muted p-3 text-xs">
          {`data/integration/
  inbound/iw37n/     ← SAP วางไฟล์
  inbound/confirm/   ← CONFIRM_IN (อนาคต)
  outbound/confirm/  ← export สำหรับ SAP เก็บ
  processing/
  archive/inbound/YYYY-MM/
  error/`}
        </pre>
      </section>

      <p className="text-xs text-app-muted">
        รายละเอียดเต็ม: <code>docs/parity-pending/15-sap-csv-integration.md</code>
      </p>
    </AppCard>
  )
}
