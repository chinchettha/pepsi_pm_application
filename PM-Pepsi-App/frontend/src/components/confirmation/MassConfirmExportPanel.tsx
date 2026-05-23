import { Badge } from '@/components/ui/badge'
import { ReportExportButton } from '@/components/reports/ReportExportButton'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { MassConfirmExportSummary } from '@/api/schemas'
import {
  confirmationSapCsvFilename,
  fetchConfirmationExportCsv,
  fetchConfirmationExportXlsx,
  fetchMassConfirmExportSummary,
  postConfirmQcApproveBatch,
} from '@/lib/api-public'
import { usePermission } from '@/lib/use-permission'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export type MassConfirmBatchResult = {
  succeeded: number[]
  failed: { idiw37: number; message: string }[]
}

export type MassConfirmExportPanelProps = {
  batch: MassConfirmBatchResult
  onDismiss?: () => void
}

export function MassConfirmExportPanel({ batch, onDismiss }: MassConfirmExportPanelProps) {
  const qc = useQueryClient()
  const canQc = usePermission('confirmation.import')
  const [exporting, setExporting] = useState<'csv' | 'xlsx' | null>(null)

  const batchComplete = batch.failed.length === 0 && batch.succeeded.length > 0

  const summaryQ = useQuery({
    queryKey: ['confirmation', 'mass-export-summary', batch.succeeded],
    queryFn: () => fetchMassConfirmExportSummary(batch.succeeded),
    enabled: batch.succeeded.length > 0,
  })

  const summary: MassConfirmExportSummary | undefined = summaryQ.data

  const approveMut = useMutation({
    mutationFn: () => postConfirmQcApproveBatch(batch.succeeded),
    onSuccess: async (res) => {
      toast.success(`อนุมัติ QC ${res.approved.length} รายการ`)
      await summaryQ.refetch()
      await qc.invalidateQueries({ queryKey: ['confirmation', 'qc', 'pending'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const downloadExport = async (format: 'csv' | 'xlsx') => {
    if (!summary?.exportable) {
      toast.error('ยังไม่มีแถวที่พร้อม export (ต้อง Admin QC อนุมัติก่อน)')
      return
    }
    try {
      setExporting(format)
      const blob =
        format === 'csv'
          ? await fetchConfirmationExportCsv(batch.succeeded)
          : await fetchConfirmationExportXlsx(batch.succeeded)
      downloadBlob(
        blob,
        format === 'csv' ? confirmationSapCsvFilename() : 'Export_Confirm.xlsx',
      )
      toast.success(`ดาวน์โหลด CONFIRM_OUT (${summary.exportable} แถว)`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setExporting(null)
    }
  }

  if (batch.succeeded.length === 0) return null

  return (
    <div className="space-y-3 rounded-card border border-blue-200 bg-blue-50/80 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-body-sm font-semibold text-app">
            Export Confirm หลัง Mass Confirm
            {batchComplete ? (
              <Badge className="ml-2" variant="default">
                ครบชุด {batch.succeeded.length} รายการ
              </Badge>
            ) : (
              <Badge className="ml-2" variant="secondary">
                สำเร็จ {batch.succeeded.length} · ล้มเหลว {batch.failed.length}
              </Badge>
            )}
          </h3>
          <p className="mt-1 text-xs text-app-muted">
            ขั้นตอน: Admin อนุมัติ QC → ดาวน์โหลด CSV/XLSX เฉพาะชุดนี้ → ส่ง SAP (CONFIRM_OUT)
          </p>
        </div>
        {onDismiss ? (
          <Button type="button" variant="ghost" size="sm" onClick={onDismiss}>
            ปิด
          </Button>
        ) : null}
      </div>

      {summaryQ.isLoading ? (
        <p className="text-caption">กำลังตรวจสอบชุด…</p>
      ) : summary ? (
        <>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded bg-white px-2 py-1 ring-1 ring-app">
              พร้อม export: <strong>{summary.exportable}</strong>
            </span>
            <span className="rounded bg-white px-2 py-1 ring-1 ring-app">
              รอ QC: <strong>{summary.qcPending}</strong>
            </span>
            <span className="rounded bg-white px-2 py-1 ring-1 ring-app">
              QC ผ่าน: <strong>{summary.qcApproved}</strong>
            </span>
          </div>

          <div className="app-table-shell max-h-48 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>WO</TableHead>
                  <TableHead>QC</TableHead>
                  <TableHead>Export</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.items.map((row) => (
                  <TableRow key={row.idiw37}>
                    <TableCell className="text-xs font-medium">{row.wkorder}</TableCell>
                    <TableCell className="text-xs">
                      {row.qcStatus === 'pending'
                        ? 'รอตรวจ'
                        : row.qcStatus === 'approved'
                          ? 'ผ่าน'
                          : row.qcStatus === 'rejected'
                            ? 'ส่งกลับ'
                            : '—'}
                    </TableCell>
                    <TableCell className="text-xs">
                      {row.exportable ? 'พร้อม' : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap gap-2">
            {canQc && summary.qcPending > 0 ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={approveMut.isPending}
                onClick={() => approveMut.mutate()}
              >
                <ShieldCheck className="mr-1 h-4 w-4" />
                {approveMut.isPending
                  ? 'กำลังอนุมัติ QC…'
                  : `อนุมัติ QC ทั้งชุด (${summary.qcPending})`}
              </Button>
            ) : null}
            <ReportExportButton
              format="csv"
              label="CONFIRM_OUT CSV (ชุดนี้)"
              loading={exporting === 'csv'}
              disabled={!summary.exportable || exporting != null}
              onClick={() => void downloadExport('csv')}
            />
            <ReportExportButton
              format="xlsx"
              label="Excel (ชุดนี้)"
              loading={exporting === 'xlsx'}
              disabled={!summary.exportable || exporting != null}
              onClick={() => void downloadExport('xlsx')}
            />
            <Button type="button" size="sm" variant="outline" asChild>
              <Link to="/integration">ศูนย์ Integration</Link>
            </Button>
          </div>
        </>
      ) : null}

      {batch.failed.length > 0 ? (
        <p className="text-xs text-amber-800">
          มี {batch.failed.length} รายการปิดงานไม่สำเร็จ — export ด้านบนเฉพาะรายการที่สำเร็จ
        </p>
      ) : null}
    </div>
  )
}
