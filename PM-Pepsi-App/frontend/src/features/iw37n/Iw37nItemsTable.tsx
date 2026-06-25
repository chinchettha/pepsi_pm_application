import type { Iw37nItem } from '@/api/schemas'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  tableStickyClass,
} from '@/components/ui/table'
import { TableSkeletonRows } from '@/components/ui/table-skeleton'
import {
  IW37N_ITEM_COLUMNS,
  iw37nCellClass,
  iw37nHeaderClass,
  type Iw37nColumnLayout,
} from '@/features/iw37n/iw37n-items-layout'
import { formatIw37nWorkUnit } from '@/features/iw37n/iw37n-export-display'
import { Iw37nMntPlanLink } from '@/features/iw37n/Iw37nMntPlanLink'
import { formatEpochSecondsToDdMmYyyy } from '@/lib/master-data-api'
import { cn } from '@/lib/utils'
import { Pencil } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

type Iw37nItemsTableProps = {
  items: Iw37nItem[] | undefined
  loading: boolean
  canWrite: boolean
  emptyTitle: string
  emptyDescription: string
  onEdit: (id: number) => void
}

function CellEmpty() {
  return <span className="text-app-muted/60">—</span>
}

function CellText({
  value,
  mono,
  className,
  title,
}: {
  value: string
  mono?: boolean
  className?: string
  title?: string
}) {
  const trimmed = value.trim()
  if (!trimmed) return <CellEmpty />
  return (
    <span
      className={cn(mono && 'font-mono tabular-nums tracking-tight', className)}
      title={title ?? (trimmed.length > 48 ? trimmed : undefined)}
    >
      {trimmed}
    </span>
  )
}

function renderColumnCell(col: Iw37nColumnLayout, it: Iw37nItem): ReactNode {
  switch (col.id) {
    case 'mntPlan':
      return <Iw37nMntPlanLink item={it} />
    case 'order':
      return <CellText value={it.wkorder} mono className="font-medium text-[#1f3864]" />
    case 'type':
      return <CellText value={it.wktype} mono className="mx-auto block" />
    case 'mat':
      return <CellText value={it.mat} mono className="mx-auto block" />
    case 'bscStart':
    case 'actFinish': {
      const epoch = col.id === 'bscStart' ? it.bscstart : it.actfinish
      return (
        <span className="mx-auto block font-mono text-[11px] tabular-nums">
          {epoch ? formatEpochSecondsToDdMmYyyy(epoch) : <CellEmpty />}
        </span>
      )
    }
    case 'systemStatus':
      return (
        <CellText
          value={it.systemstatus || it.syst}
          className="text-[11px] leading-snug"
          title={it.systemstatus}
        />
      )
    case 'opAc':
      return <CellText value={it.opac} mono className="mx-auto block font-semibold" />
    case 'operationShort':
      return <CellText value={it.operationshorttext} title={it.operationshorttext} />
    case 'description':
      return <CellText value={it.ostdescription} title={it.ostdescription} />
    case 'cknow':
      return <CellText value={it.cknow} mono className="mx-auto block" />
    case 'wkctr':
      return <CellText value={it.wkctr} mono />
    case 'work':
    case 'actWork': {
      const n = col.id === 'work' ? it.work : it.actwork
      return (
        <span className="mx-auto block tabular-nums">
          {n != null ? n : <CellEmpty />}
        </span>
      )
    }
    case 'unit':
      return <CellText value={formatIw37nWorkUnit(it)} mono className="mx-auto block" />
    case 'equipment':
      return <CellText value={it.equipment} mono />
    case 'equDescrip':
      return <CellText value={it.equdescrip} title={it.equdescrip} />
    case 'functionalLoc':
      return <CellText value={it.functionalloc} mono className="text-[11px]" />
    case 'funcLocDesc':
      return <CellText value={it.funcdescrip} title={it.funcdescrip} />
    default:
      return <CellEmpty />
  }
}

export function Iw37nItemsTable({
  items,
  loading,
  canWrite,
  emptyTitle,
  emptyDescription,
  onEdit,
}: Iw37nItemsTableProps) {
  const { t } = useTranslation('integration')
  const columns = IW37N_ITEM_COLUMNS
  const colCount = columns.length + (canWrite ? 1 : 0)

  const headerCellBase =
    'border border-[#2f5597]/50 px-2 py-2 text-[11px] font-semibold leading-snug text-white bg-[#2f5597]'

  const bodyCellBase = 'iw37n-cell border border-[#b4c6e7]/70 px-2.5 py-1.5 text-xs text-[#333]'

  if (loading && !items) {
    return (
      <div
        className="app-table-shell max-h-[min(72vh,900px)] overflow-auto rounded-lg border border-[#2f5597]/25"
        aria-busy="true"
      >
        <Table embedded stickyHeader className="iw37n-items-table min-w-max border-collapse">
          <TableHeader>
            <TableRow className="hover:bg-[#2f5597]">
              {columns.map((col) => (
                <TableHead key={col.id} className={cn(headerCellBase, iw37nHeaderClass(col))}>
                  {t(`iw37nPage.table.${col.labelKey}`)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableSkeletonRows rows={8} columns={colCount} narrowFirstColumn />
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs leading-relaxed text-app-muted">{t('iw37nPage.itemsTableHint')}</p>
      <div className="app-table-shell max-h-[min(72vh,900px)] overflow-auto rounded-lg border border-[#2f5597]/25 shadow-sm">
        <Table
          embedded
          stickyHeader
          className="iw37n-items-table app-data-table-sticky min-w-max border-collapse text-xs"
        >
          <TableHeader>
            <TableRow className="border-0 hover:bg-[#2f5597]">
              {columns.map((col) => (
                <TableHead
                  key={col.id}
                  className={cn(
                    headerCellBase,
                    'min-h-9',
                    iw37nHeaderClass(col),
                    col.sticky != null && tableStickyClass(col.sticky),
                  )}
                >
                  {t(`iw37nPage.table.${col.labelKey}`)}
                </TableHead>
              ))}
              {canWrite ? (
                <TableHead
                  className={cn(
                    headerCellBase,
                    'sticky right-0 z-30 min-w-[4.5rem] text-center',
                  )}
                >
                  {t('iw37nPage.table.actions')}
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(items?.length ?? 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={colCount} className="border-0 p-0">
                  <EmptyState
                    className="border-0 bg-transparent py-10"
                    title={emptyTitle}
                    description={emptyDescription}
                  />
                </TableCell>
              </TableRow>
            ) : (
              items?.map((it, rowIdx) => (
                <TableRow
                  key={it.idiw37}
                  className={cn(
                    'border-0 hover:bg-[#e9eff7]',
                    rowIdx % 2 === 1 ? 'bg-[#f5f8fc]' : 'bg-white',
                  )}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.id}
                      className={cn(
                        bodyCellBase,
                        iw37nCellClass(col),
                        col.sticky != null && `${tableStickyClass(col.sticky)} bg-inherit`,
                      )}
                    >
                      {renderColumnCell(col, it)}
                    </TableCell>
                  ))}
                  {canWrite ? (
                    <TableCell
                      className={cn(
                        bodyCellBase,
                        'sticky right-0 z-10 bg-inherit text-center align-middle shadow-[-4px_0_8px_-4px_rgba(47,85,151,0.15)]',
                      )}
                    >
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-[11px]"
                        onClick={() => onEdit(it.idiw37)}
                      >
                        <Pencil className="mr-1 size-3" aria-hidden />
                        {t('iw37nPage.edit')}
                      </Button>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
