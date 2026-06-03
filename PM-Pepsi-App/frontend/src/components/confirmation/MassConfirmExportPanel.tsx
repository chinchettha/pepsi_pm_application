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
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('confirmation')
  const { t: tc } = useTranslation('common')
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
      toast.success(t('massExport.toastQcApproved', { count: res.approved.length }))
      await summaryQ.refetch()
      await qc.invalidateQueries({ queryKey: ['confirmation', 'qc', 'pending'] })
      await qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const downloadExport = async (format: 'csv' | 'xlsx') => {
    if (!summary?.exportable) {
      toast.error(t('massExport.noExportableRows'))
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
      toast.success(t('massExport.downloadSuccess', { count: summary.exportable }))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('export.exportFailed'))
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
            {t('massExport.title')}
            {batchComplete ? (
              <Badge className="ml-2" variant="default">
                {t('massExport.batchComplete', { count: batch.succeeded.length })}
              </Badge>
            ) : (
              <Badge className="ml-2" variant="secondary">
                {t('massExport.batchPartial', {
                  ok: batch.succeeded.length,
                  failed: batch.failed.length,
                })}
              </Badge>
            )}
          </h3>
          <p className="mt-1 text-xs text-app-muted">{t('massExport.stepsHint')}</p>
        </div>
        {onDismiss ? (
          <Button type="button" variant="ghost" size="sm" onClick={onDismiss}>
            {tc('actions.close')}
          </Button>
        ) : null}
      </div>

      {summaryQ.isLoading ? (
        <p className="text-caption">{t('massExport.checkingBatch')}</p>
      ) : summary ? (
        <>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded app-surface-panel px-2 py-1 ring-1 ring-app">
              {t('massExport.readyExport')}: <strong>{summary.exportable}</strong>
            </span>
            <span className="rounded app-surface-panel px-2 py-1 ring-1 ring-app">
              {t('massExport.qcPending')}: <strong>{summary.qcPending}</strong>
            </span>
            <span className="rounded app-surface-panel px-2 py-1 ring-1 ring-app">
              {t('massExport.qcApproved')}: <strong>{summary.qcApproved}</strong>
            </span>
          </div>

          <div className="app-table-shell max-h-48 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('massExport.colWo')}</TableHead>
                  <TableHead>{t('massExport.colQc')}</TableHead>
                  <TableHead>{t('massExport.colExport')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.items.map((row) => (
                  <TableRow key={row.idiw37}>
                    <TableCell className="text-xs font-medium">{row.wkorder}</TableCell>
                    <TableCell className="text-xs">
                      {row.qcStatus === 'pending'
                        ? t('qc.statusPending')
                        : row.qcStatus === 'approved'
                          ? t('qc.statusApproved')
                          : row.qcStatus === 'rejected'
                            ? t('qc.statusRejected')
                            : '—'}
                    </TableCell>
                    <TableCell className="text-xs">
                      {row.exportable ? t('massExport.exportReady') : '—'}
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
                  ? t('massExport.approvingQc')
                  : t('massExport.approveQcBatch', { count: summary.qcPending })}
              </Button>
            ) : null}
            <ReportExportButton
              format="csv"
              label={t('massExport.confirmOutCsv')}
              loading={exporting === 'csv'}
              disabled={!summary.exportable || exporting != null}
              onClick={() => void downloadExport('csv')}
            />
            <ReportExportButton
              format="xlsx"
              label={t('massExport.excelBatch')}
              loading={exporting === 'xlsx'}
              disabled={!summary.exportable || exporting != null}
              onClick={() => void downloadExport('xlsx')}
            />
            <Button type="button" size="sm" variant="outline" asChild>
              <Link to="/integration">{t('massExport.integrationCenter')}</Link>
            </Button>
          </div>
        </>
      ) : null}

      {batch.failed.length > 0 ? (
        <p className="text-xs text-amber-800">
          {t('massExport.partialCloseFailed', { count: batch.failed.length })}
        </p>
      ) : null}
    </div>
  )
}
