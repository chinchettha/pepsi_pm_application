import { ReportExportButton } from '@/components/reports/ReportExportButton'
import { FilterSearchField } from '@/components/scheduling/SchedulingFilterLayout'
import {
  SchedulingCalendarPanel,
  SchedulingPageSection,
} from '@/components/scheduling/SchedulingPageLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
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
import type { ConfirmationExportRow } from '@/api/schemas'
import {
  confirmationSapCsvFilename,
  fetchConfirmationExport,
  fetchConfirmationExportCsv,
  fetchConfirmationExportXlsx,
} from '@/lib/api-public'
import { cn } from '@/lib/utils'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AlertCircle, ChevronLeft, ChevronRight, ClipboardList, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

const PAGE_SIZES = [25, 50, 100, 200] as const

const EXPORT_COLUMN_KEYS = [
  { key: 'wkorder', labelKey: 'export.columns.order' as const },
  { key: 'opac', labelKey: 'export.columns.operation' as const },
  { key: 'wkctr', labelKey: 'export.columns.wrkCtr' as const },
  { key: 'timewk', labelKey: 'export.columns.actWork' as const, align: 'right' as const },
  { key: 'unitc', labelKey: 'export.columns.unit' as const },
  { key: 'startDateExe', labelKey: 'export.columns.startDateExe' as const },
  { key: 'endDateExe', labelKey: 'export.columns.endDateExe' as const },
  { key: 'startExecute', labelKey: 'export.columns.startExecute' as const },
  { key: 'endExecute', labelKey: 'export.columns.endExecute' as const },
] as const

function formatActWork(value: number): string {
  if (!Number.isFinite(value)) return '0.00'
  return value.toFixed(2)
}

function rowMatchesSearch(row: ConfirmationExportRow, q: string): boolean {
  const needle = q.trim().toLowerCase()
  if (!needle) return true
  return [
    row.wkorder,
    row.opac,
    row.wkctr,
    row.unitc,
    row.startDateExe,
    row.endDateExe,
    row.startExecute,
    row.endExecute,
    formatActWork(row.timewk),
  ].some((part) => part.toLowerCase().includes(needle))
}

function ExportTableHeaderRow() {
  const { t } = useTranslation('confirmation')
  return (
    <TableRow className="border-0 bg-[color-mix(in_srgb,var(--app-accent)_88%,#0f172a)] hover:bg-[color-mix(in_srgb,var(--app-accent)_88%,#0f172a)]">
      {EXPORT_COLUMN_KEYS.map((col) => (
        <TableHead
          key={col.key}
          className={cn(
            'whitespace-nowrap text-[11px] font-semibold tracking-wide text-white/95',
            'align' in col && col.align === 'right' ? 'text-right' : undefined,
          )}
        >
          {t(col.labelKey)}
        </TableHead>
      ))}
    </TableRow>
  )
}

function ExportTableDataRow({ row, index }: { row: ConfirmationExportRow; index: number }) {
  return (
    <TableRow
      className={cn(
        'border-app/40 transition-colors hover:bg-teal-50/50',
        index % 2 === 1 ? 'bg-app-subtle/25' : undefined,
      )}
    >
      <TableCell className="tabular-nums text-xs font-medium text-app">{row.wkorder}</TableCell>
      <TableCell className="tabular-nums text-xs">{row.opac}</TableCell>
      <TableCell className="tabular-nums text-xs">{row.wkctr}</TableCell>
      <TableCell className="text-right tabular-nums text-xs">{formatActWork(row.timewk)}</TableCell>
      <TableCell className="text-xs">{row.unitc}</TableCell>
      <TableCell className="tabular-nums text-xs">{row.startDateExe}</TableCell>
      <TableCell className="tabular-nums text-xs">{row.endDateExe}</TableCell>
      <TableCell className="tabular-nums text-xs">{row.startExecute}</TableCell>
      <TableCell className="tabular-nums text-xs">{row.endExecute}</TableCell>
    </TableRow>
  )
}

export type ConfirmationExportTablePanelProps = {
  enabled?: boolean
  canExport?: boolean
  sectionIndex?: number
  className?: string
}

export function ConfirmationExportTablePanel({
  enabled = true,
  canExport = true,
  sectionIndex = 0,
  className,
}: ConfirmationExportTablePanelProps) {
  const { t } = useTranslation('confirmation')
  const { t: tc } = useTranslation('common')
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState<number>(50)
  const [page, setPage] = useState(1)
  const [exporting, setExporting] = useState<'xlsx' | 'csv' | null>(null)

  const exportQ = useQuery({
    queryKey: ['confirmation', 'export', 'preview'],
    queryFn: fetchConfirmationExport,
    staleTime: 30_000,
    enabled,
    placeholderData: keepPreviousData,
  })

  const items = exportQ.data?.items ?? []
  const scope = exportQ.data?.scope
  const actorWkctr = exportQ.data?.actorWkctr ?? ''

  const filtered = useMemo(
    () => items.filter((row) => rowMatchesSearch(row, search)),
    [items, search],
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageStart = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const pageEnd = Math.min(safePage * pageSize, filtered.length)
  const pageRows = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize],
  )

  const onDownload = async (format: 'xlsx' | 'csv') => {
    if (!canExport) {
      toast.error(t('export.noExportPermission'))
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
      toast.success(format === 'xlsx' ? t('export.downloadExcelDone') : t('export.downloadCsvDone'))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('export.exportFailed'))
    } finally {
      setExporting(null)
    }
  }

  const scopeBadge =
    scope === 'ALL' ? (
      <Badge variant="secondary" className="text-xs font-normal">
        {t('export.scopeAll')}
      </Badge>
    ) : actorWkctr ? (
      <Badge variant="outline" className="text-xs font-normal tabular-nums">
        {actorWkctr}
      </Badge>
    ) : null

  return (
    <SchedulingPageSection index={sectionIndex} className={className}>
      <SchedulingCalendarPanel
        title={t('export.title')}
        eventCount={items.length}
        isRefreshing={exportQ.isFetching && !exportQ.isLoading}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {scopeBadge}
              {canExport ? (
                <>
                  <ReportExportButton
                    format="xlsx"
                    label={t('export.exportToExcel')}
                    loading={exporting === 'xlsx'}
                    loadingLabel={t('export.exporting')}
                    disabled={exporting != null || exportQ.isFetching || items.length === 0}
                    onClick={() => void onDownload('xlsx')}
                  />
                  <ReportExportButton
                    format="csv"
                    label={t('export.csv')}
                    variant="outline"
                    loading={exporting === 'csv'}
                    loadingLabel={t('export.exporting')}
                    disabled={exporting != null || exportQ.isFetching || items.length === 0}
                    onClick={() => void onDownload('csv')}
                  />
                </>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-app/60 bg-app-subtle/30 p-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-xs text-app-muted">
              <Label htmlFor="export-page-size" className="font-medium text-app-muted">
                {t('export.show')}
              </Label>
              <select
                id="export-page-size"
                className="h-9 rounded-lg border border-app/80 bg-[var(--app-surface)] px-2.5 text-xs shadow-sm"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPage(1)
                }}
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span>{t('export.items')}</span>
            </div>
            <div className="w-full sm:max-w-xs">
              <FilterSearchField
                id="export-search"
                label={t('export.search')}
                value={search}
                onChange={(v) => {
                  setSearch(v)
                  setPage(1)
                }}
                placeholder={t('export.searchPlaceholder')}
              />
            </div>
          </div>

          {exportQ.isLoading && !exportQ.data ? (
            <Skeleton className="h-64 w-full rounded-card" aria-label={t('export.loadingTable')} />
          ) : exportQ.isError ? (
            <EmptyState
              icon={AlertCircle}
              title={t('export.loadFailed')}
              description={
                exportQ.error instanceof Error ? exportQ.error.message : undefined
              }
              action={{ label: tc('actions.retry'), onClick: () => void exportQ.refetch() }}
            />
          ) : items.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title={t('export.noData')}
              action={{ label: t('export.refresh'), onClick: () => void exportQ.refetch() }}
            />
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-app/70 shadow-sm">
                <Table embedded stickyHeader className="min-w-[56rem]">
                  <TableHeader>
                    <ExportTableHeaderRow />
                  </TableHeader>
                  <TableBody>
                    {pageRows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={EXPORT_COLUMN_KEYS.length}
                          className="py-12 text-center text-xs text-app-muted"
                        >
                          {t('export.noResults')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      pageRows.map((row, index) => (
                        <ExportTableDataRow
                          key={`${row.wkorder}-${row.opac}-${row.wkctr}-${row.no}`}
                          row={row}
                          index={index}
                        />
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-app/40 pt-3 text-xs text-app-muted">
                <p className="tabular-nums">
                  {pageStart.toLocaleString()}–{pageEnd.toLocaleString()} /{' '}
                  {filtered.length.toLocaleString()}
                </p>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 px-2.5"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="size-3.5" aria-hidden />
                    {t('export.prevPage')}
                  </Button>
                  <span className="min-w-[4rem] text-center tabular-nums">
                    {safePage} / {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 px-2.5"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    {t('export.nextPage')}
                    <ChevronRight className="size-3.5" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    disabled={exportQ.isFetching}
                    aria-label={t('export.refreshAria')}
                    onClick={() => exportQ.refetch()}
                  >
                    <RotateCcw className="size-3.5" aria-hidden />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SchedulingCalendarPanel>
    </SchedulingPageSection>
  )
}
