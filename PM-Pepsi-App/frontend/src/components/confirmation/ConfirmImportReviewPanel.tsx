import type { ConfirmationImportPreviewResponse } from '@/api/schemas'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

type RowFilter = 'all' | 'error' | 'skipped' | 'ok'

type ConfirmImportReviewPanelProps = {
  preview: ConfirmationImportPreviewResponse
  onCommit: () => void
  onCancel: () => void
  committing?: boolean
}

function actionBadgeClass(action: ConfirmationImportPreviewResponse['rows'][number]['action']): string {
  if (action === 'error') return 'border-transparent bg-red-600 text-white hover:bg-red-700'
  if (action === 'updated') return 'border-transparent bg-sky-700 text-white hover:bg-sky-800'
  if (action === 'inserted') return 'border-transparent bg-emerald-700 text-white hover:bg-emerald-800'
  return ''
}

export function ConfirmImportReviewPanel({
  preview,
  onCommit,
  onCancel,
  committing = false,
}: ConfirmImportReviewPanelProps) {
  const { t } = useTranslation('confirmation')
  const { t: tc } = useTranslation('common')
  const [filter, setFilter] = useState<RowFilter>('all')

  const filteredRows = useMemo(() => {
    if (filter === 'all') return preview.rows
    if (filter === 'error') return preview.rows.filter((r) => r.action === 'error')
    if (filter === 'skipped') return preview.rows.filter((r) => r.action === 'skipped')
    return preview.rows.filter((r) => r.action === 'inserted' || r.action === 'updated')
  }, [preview.rows, filter])

  const canCommit = preview.inserted + preview.updated > 0

  const filterLabels: Record<RowFilter, string> = {
    all: t('importReview.filterAll'),
    ok: t('importReview.filterOk'),
    skipped: t('importReview.filterSkipped'),
    error: t('importReview.filterError'),
  }

  return (
    <div className="mt-4 space-y-4 rounded-card border border-amber-300/80 bg-amber-50/50 p-4">
      <div>
        <h4 className="text-body-sm font-semibold text-amber-950">{t('importReview.title')}</h4>
        <p className="mt-1 text-xs text-amber-900/80">
          {t('importReview.summaryMeta', {
            fileName: preview.fileName,
            layout: preview.layout,
            parseOk: preview.parseOk,
            matchWoInDb: preview.matchWoInDb,
          })}
        </p>
        <p className="mt-1 text-xs text-amber-900/80">
          {t('importReview.summaryCounts', {
            inserted: preview.inserted,
            updated: preview.updated,
            skipped: preview.skipped,
            errors: preview.errors,
          })}
        </p>
      </div>

      {preview.matchWoInDb === 0 && preview.parseOk > 0 ? (
        <div
          role="alert"
          className="rounded-button border border-red-400 bg-red-50 px-3 py-2 text-body-sm text-red-950"
        >
          <p className="font-medium">{t('importReview.noOrderMatchTitle')}</p>
          <p className="mt-1 text-xs text-red-800/90">{t('importReview.noOrderMatchDesc')}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {(['all', 'ok', 'skipped', 'error'] as const).map((key) => (
          <Button
            key={key}
            type="button"
            size="sm"
            variant={filter === key ? 'default' : 'outline'}
            onClick={() => setFilter(key)}
          >
            {filterLabels[key]}
          </Button>
        ))}
      </div>

      <div className="app-table-shell max-h-72 overflow-auto">
        <Table embedded stickyHeader zebra>
          <TableHeader>
            <TableRow>
              <TableHead>{t('importReview.colNo')}</TableHead>
              <TableHead>{t('import.colOrder')}</TableHead>
              <TableHead>{t('import.colConfirm')}</TableHead>
              <TableHead>{t('import.colWkctr')}</TableHead>
              <TableHead>{t('importReview.colResult')}</TableHead>
              <TableHead>{t('importReview.colMessage')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.slice(0, 200).map((r) => (
              <TableRow key={`${r.rowNo}-${r.wkorder}-${r.confirmation}`}>
                <TableCell className="tabular-nums">{r.rowNo}</TableCell>
                <TableCell className="font-mono text-xs">{r.wkorder}</TableCell>
                <TableCell className="font-mono text-xs">{r.confirmation}</TableCell>
                <TableCell className="font-mono text-xs">{r.wkctr}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={actionBadgeClass(r.action)}>
                    {r.action}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[240px] truncate text-xs">{r.message}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={!canCommit || committing} onClick={onCommit}>
          {committing ? t('importReview.committing') : t('importReview.confirmImport')}
        </Button>
        <Button type="button" variant="outline" disabled={committing} onClick={onCancel}>
          {tc('actions.cancel')}
        </Button>
      </div>
    </div>
  )
}
