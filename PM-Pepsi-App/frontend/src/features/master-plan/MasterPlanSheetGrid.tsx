import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  tableStickyClass,
} from '@/components/ui/table'
import { MasterPlanColumnHeader } from '@/features/master-plan/MasterPlanColumnHeader'
import { MasterPlanRowLinksMenu } from '@/features/master-plan/MasterPlanRowLinksMenu'
import { MasterPlanEditableCell } from '@/features/master-plan/MasterPlanEditableCell'
import { MasterPlanPmStatusCell } from '@/features/master-plan/MasterPlanPmStatusCell'
import { MasterPlanSummaryGrid } from '@/features/master-plan/MasterPlanSummaryGrid'
import {
  computeColumnRowspans,
  extractSheetBannerTitle,
  extractSheetMetaLines,
  isGenericSheetLayout,
  isMasterPlanCellEditable,
  masterPlanColumnCellClass,
  masterPlanColumnHeaderAlignClass,
  masterPlanColumnWidthClass,
  masterPlanStickyColumn,
  shouldRowspanColumn,
  splitGenericSheetSections,
} from '@/features/master-plan/master-plan-grid-layout'
import {
  masterPlanCellValue,
  masterPlanColumnStorageKeys,
} from '@/features/master-plan/master-plan-column-keys'
import {
  isMasterPlanVirtualColumn,
  masterPlanVirtualColumnLabelKey,
  masterPlanVirtualColumnWidthClass,
  withMasterPlanVirtualColumns,
} from '@/features/master-plan/master-plan-virtual-columns'
import type { MasterPlanSheetRows } from '@/lib/master-plan-api'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

type MasterPlanSheetGridProps = {
  data: MasterPlanSheetRows
  canWrite?: boolean
  onPatchCell?: (rowId: number, column: string, value: string) => Promise<void>
  focusRowId?: number | null
  onFocusRowHandled?: () => void
  onOpenWorkOrder?: (wkorder: string) => void
  onLoadMore?: () => void
  loadingMore?: boolean
  searchQuery?: string
  loadedRowCount?: number
}

export function MasterPlanSheetGrid({
  data,
  canWrite = false,
  onPatchCell,
  focusRowId = null,
  onFocusRowHandled,
  onOpenWorkOrder,
  onLoadMore,
  loadingMore,
  searchQuery = '',
  loadedRowCount,
}: MasterPlanSheetGridProps) {
  const { t } = useTranslation('masterData')
  const rows = data.rows ?? []
  const displayColumns = data.displayColumns ?? []
  const columnHeaders = data.columnHeaders ?? []
  const columns = useMemo(
    () => withMasterPlanVirtualColumns(
      displayColumns.length > 0 ? displayColumns : columnHeaders,
      data.sheetKind,
    ),
    [columnHeaders, data.sheetKind, displayColumns],
  )
  const columnKeys = useMemo(() => masterPlanColumnStorageKeys(columns), [columns])
  const bannerTitle = extractSheetBannerTitle(data.titleRows)
  const metaLines = extractSheetMetaLines(data.titleRows)
  const useSummaryLayout =
    data.sheetKind === 'summary' && isGenericSheetLayout(columns)

  const [flashKeys, setFlashKeys] = useState<Set<string>>(() => new Set())
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [focusedRowId, setFocusedRowId] = useState<number | null>(null)

  useEffect(() => {
    if (focusRowId == null) return

    let highlightTimer: number | undefined

    const tryFocus = (): boolean => {
      const el = document.querySelector(`[data-master-plan-row-id="${focusRowId}"]`)
      if (!(el instanceof HTMLElement)) return false
      el.scrollIntoView({ block: 'center', behavior: 'smooth' })
      setFocusedRowId(focusRowId)
      highlightTimer = window.setTimeout(() => {
        setFocusedRowId(null)
        onFocusRowHandled?.()
      }, 3000)
      return true
    }

    if (tryFocus()) {
      return () => {
        if (highlightTimer != null) window.clearTimeout(highlightTimer)
      }
    }

    if (!rows.some((r) => r.id === focusRowId)) return

    const raf = requestAnimationFrame(() => {
      tryFocus()
    })
    return () => {
      cancelAnimationFrame(raf)
      if (highlightTimer != null) window.clearTimeout(highlightTimer)
    }
  }, [focusRowId, rows, onFocusRowHandled])

  const summarySections = useMemo(() => {
    if (!useSummaryLayout) return []
    return splitGenericSheetSections(rows, columns)
  }, [columns, rows, useSummaryLayout])

  const rowspansByColumn = useMemo(() => {
    const map = new Map<string, Array<number | 'skip'>>()
    for (let colIdx = 0; colIdx < columns.length; colIdx++) {
      const col = columns[colIdx]!
      const storageKey = columnKeys[colIdx]!
      if (shouldRowspanColumn(col)) {
        map.set(storageKey, computeColumnRowspans(rows, col, storageKey))
      }
    }
    return map
  }, [columnKeys, columns, rows])

  const markFlash = useCallback((rowId: number, column: string) => {
    const key = `${rowId}:${column}`
    setFlashKeys((prev) => new Set(prev).add(key))
    window.setTimeout(() => {
      setFlashKeys((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }, 2500)
  }, [])

  const handleCommit = useCallback(
    async (rowId: number, column: string, nextValue: string) => {
      if (!onPatchCell) return
      const key = `${rowId}:${column}`
      setSavingKey(key)
      try {
        await onPatchCell(rowId, column, nextValue)
        markFlash(rowId, column)
      } finally {
        setSavingKey(null)
      }
    },
    [markFlash, onPatchCell],
  )

  const hasMore = data.total > (loadedRowCount ?? rows.length)
  const searchActive = searchQuery.trim().length > 0
  const editEnabled = canWrite && data.sheetKind === 'detail' && onPatchCell != null
  const linksEnabled = data.sheetKind === 'detail' && onOpenWorkOrder != null

  return (
    <div className="space-y-0">
      {bannerTitle ? (
        <div className="overflow-hidden rounded-t-lg border border-b-0 border-[#2f5597]/40">
          <div className="bg-[#2f5597] px-4 py-3 text-center text-base font-bold tracking-wide text-white">
            {bannerTitle}
          </div>
          {metaLines.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-1 border-b border-[#2f5597]/20 bg-[#dae3f3] px-4 py-2 text-sm font-medium text-[#1f3864]">
              {metaLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 px-1 py-2.5 text-sm text-app-muted">
        <span>
          {data.sheetName} · {t('masterPlan.rowCount', { count: data.total })}
          {hasMore
            ? ` · ${t('masterPlan.showing', { count: loadedRowCount ?? rows.length })}`
            : ''}
          {searchActive
            ? ` · ${t('masterPlan.rowSearchFiltered', { count: rows.length })}`
            : ''}
          {editEnabled ? ` · ${t('masterPlan.editModeHint')}` : ''}
          {!canWrite && data.sheetKind === 'detail' ? ` · ${t('masterPlan.noWritePermission')}` : ''}
          {data.sheetKind !== 'detail' ? ` · ${t('masterPlan.readOnlySheet')}` : ''}
        </span>
        {hasMore && onLoadMore ? (
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="rounded-md border border-[#2f5597]/40 bg-[#dae3f3]/50 px-3 py-1 text-xs font-medium text-[#1f3864] hover:bg-[#dae3f3] disabled:opacity-60"
          >
            {loadingMore ? t('masterPlan.loadingMore') : t('masterPlan.loadMore')}
          </button>
        ) : null}
      </div>

      {searchActive && rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#2f5597]/30 px-4 py-8 text-center text-body-sm text-app-muted">
          {t('masterPlan.rowSearchEmptySheet')}
        </p>
      ) : useSummaryLayout ? (
        <div
          className={`rounded-lg border border-[#2f5597]/30 bg-white p-3 ${
            bannerTitle ? '' : 'mt-0'
          }`}
        >
          <MasterPlanSummaryGrid sections={summarySections} />
        </div>
      ) : (
        <div
          className={`app-table-shell max-h-[min(72vh,900px)] overflow-auto border border-[#2f5597]/30 ${
            bannerTitle ? 'rounded-b-lg' : 'rounded-lg'
          }`}
        >
          <Table embedded stickyHeader className="master-plan-excel-table min-w-max border-collapse text-xs leading-normal">
            <TableHeader>
              <TableRow className="border-[#2f5597] hover:bg-[#2f5597]">
                {columns.map((col, colIdx) => {
                  const storageKey = columnKeys[colIdx]!
                  const sticky = masterPlanStickyColumn(col, columns)
                  return (
                    <TableHead
                      key={storageKey}
                      className={`min-h-10 border border-[#2f5597]/60 bg-[#2f5597] px-2.5 py-2.5 text-xs font-semibold leading-snug text-white ${isMasterPlanVirtualColumn(col) ? masterPlanVirtualColumnWidthClass(col) : masterPlanColumnWidthClass(col)} ${isMasterPlanVirtualColumn(col) ? 'text-center bg-[#1a4a8a]' : masterPlanColumnHeaderAlignClass(col)} ${
                        sticky != null ? tableStickyClass(sticky) : 'whitespace-nowrap'
                      }`}
                    >
                      <MasterPlanColumnHeader column={col} virtual={isMasterPlanVirtualColumn(col)} />
                    </TableHead>
                  )
                })}
                {linksEnabled ? (
                  <TableHead className="sticky right-0 z-20 min-h-10 w-12 border border-[#2f5597]/60 bg-[#2f5597] px-1 py-2 text-xs font-semibold text-white">
                    {t('masterPlan.rowLinks.column')}
                  </TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={Math.max(columns.length + (linksEnabled ? 1 : 0), 1)}
                    className="border border-app/30 px-2 py-6 text-center text-app-muted"
                  >
                    {t('panel.empty')}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, rowIdx) => (
                  <TableRow
                    key={row.rowIndex}
                    data-master-plan-row-id={row.id}
                    className={`border-[#b4c6e7] hover:bg-[#e9eff7] ${
                      rowIdx % 2 === 1 ? 'bg-[#f5f8fc]' : 'bg-white'
                    } ${focusedRowId === row.id ? 'master-plan-row-focus' : ''}`}
                  >
                    {columns.map((col, colIdx) => {
                      const storageKey = columnKeys[colIdx]!
                      const isFirstLabel =
                        columns.findIndex((c) => c.trim() === col.trim()) === colIdx

                      if (isMasterPlanVirtualColumn(col)) {
                        return (
                          <MasterPlanPmStatusCell
                            key={storageKey}
                            column={col}
                            pmStatus={row.pmStatus}
                            cellClassName={masterPlanVirtualColumnWidthClass(col)}
                          />
                        )
                      }

                      const spans = rowspansByColumn.get(storageKey)
                      if (spans?.[rowIdx] === 'skip') return null

                      const value = masterPlanCellValue(row, storageKey, col, isFirstLabel)
                      const rowspan =
                        typeof spans?.[rowIdx] === 'number' && spans[rowIdx] > 1
                          ? spans[rowIdx]
                          : undefined
                      const cellKey = `${row.id}:${storageKey}`
                      const editable =
                        editEnabled && isMasterPlanCellEditable(data.sheetKind, col, true)

                      return (
                        <MasterPlanEditableCell
                          key={storageKey}
                          column={storageKey}
                          value={value}
                          editable={editable}
                          rowSpan={rowspan}
                          cellClassName={masterPlanColumnCellClass(col, columns, rowspan)}
                          flashing={flashKeys.has(cellKey)}
                          saving={savingKey === cellKey}
                          onCommit={(nextValue) => handleCommit(row.id, storageKey, nextValue)}
                        />
                      )
                    })}
                    {linksEnabled ? (
                      <TableCell className="sticky right-0 z-10 border border-[#b4c6e7] bg-inherit px-1 py-1 text-center align-middle">
                        <MasterPlanRowLinksMenu
                          rowId={row.id}
                          onOpenWorkOrder={onOpenWorkOrder!}
                        />
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
