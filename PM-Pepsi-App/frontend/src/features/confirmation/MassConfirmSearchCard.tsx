import { MassConfirmBar, MASS_CONFIRM_MAX } from '@/components/confirmation/MassConfirmBar'
import {
  MassConfirmExportPanel,
  type MassConfirmBatchResult,
} from '@/components/confirmation/MassConfirmExportPanel'
import { AppCard } from '@/components/layout/AppCard'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
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
import { postWorkOrdersSearch } from '@/lib/api-public'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AlertCircle, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

export function MassConfirmSearchCard() {
  const [q, setQ] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [selected, setSelected] = useState<Set<number>>(() => new Set())
  const [lastBatch, setLastBatch] = useState<MassConfirmBatchResult | null>(null)

  const searchQ = useQuery({
    queryKey: ['work-orders', 'mass-confirm-search', q],
    queryFn: () =>
      postWorkOrdersSearch({
        q: q.trim() || undefined,
        activity: [],
        wktype: [],
        status: ['CRTD', 'REL'],
        wkctr: [],
        team: [],
        functionalloc: [],
        equipment: [],
      }),
    enabled: submitted,
    placeholderData: keepPreviousData,
  })

  const rows = searchQ.data ?? []
  const rowIds = useMemo(() => rows.map((r) => Number(r.id)).filter((n) => Number.isFinite(n)), [rows])
  const allSelected = rowIds.length > 0 && rowIds.every((id) => selected.has(id))

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set())
      return
    }
    const next = new Set(rowIds.slice(0, MASS_CONFIRM_MAX))
    if (rowIds.length > MASS_CONFIRM_MAX) {
      toast.message(`เลือกได้สูงสุด ${MASS_CONFIRM_MAX} รายการ (SAP)`)
    }
    setSelected(next)
  }

  const toggleOne = (idiw37: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(idiw37)) {
        next.delete(idiw37)
        return next
      }
      if (next.size >= MASS_CONFIRM_MAX) {
        toast.error(`เลือกได้สูงสุด ${MASS_CONFIRM_MAX} รายการ`)
        return prev
      }
      next.add(idiw37)
      return next
    })
  }

  return (
    <AppCard pad="compact" className="space-y-4">
      <div>
        <h3 className="text-body-sm font-semibold text-app">
          Mass Confirm (สูงสุด {MASS_CONFIRM_MAX} รายการ)
        </h3>
        <p className="mt-1 text-caption text-app-muted">
          เลือกหลาย WO · ปิดงานครั้งเดียว · หลังครบชุด → Admin QC → Export CONFIRM_OUT (เฉพาะชุดนี้)
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[12rem] flex-1 space-y-1">
          <Label htmlFor="mass-q">ค้นหา WO</Label>
          <Input
            id="mass-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="เลข WO / คำอธิบาย"
          />
        </div>
        <Button
          type="button"
          className="gap-2"
          onClick={() => {
            setSubmitted(true)
            setSelected(new Set())
          }}
        >
          <Search className="size-4" aria-hidden />
          ค้นหา
        </Button>
      </div>

      <MassConfirmBar
        selectedIds={[...selected]}
        onClearSelection={() => setSelected(new Set())}
        onBatchDone={(batch) => setLastBatch(batch)}
        onComplete={() => {
          void searchQ.refetch()
          setSelected(new Set())
        }}
      />

      {lastBatch ? (
        <MassConfirmExportPanel batch={lastBatch} onDismiss={() => setLastBatch(null)} />
      ) : null}

      {submitted ? (
        searchQ.isLoading && !searchQ.data ? (
          <Skeleton className="h-40 w-full rounded-card" aria-label="กำลังค้นหา WO" />
        ) : searchQ.isError ? (
          <EmptyState
            icon={AlertCircle}
            title="ค้นหาไม่สำเร็จ"
            description={searchQ.error instanceof Error ? searchQ.error.message : 'เกิดข้อผิดพลาด'}
            action={{ label: 'ลองใหม่', onClick: () => void searchQ.refetch() }}
          />
        ) : (
          <div className="app-table-shell overflow-x-auto">
            <Table embedded stickyHeader zebra>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      aria-label="เลือกทั้งหมด"
                      checked={allSelected}
                      onChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>เลข WO</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead>ทีม</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-caption">
                      ไม่พบ WO สถานะ CRTD/REL
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.slice(0, 200).map((row) => {
                    const id = Number(row.id)
                    return (
                      <TableRow key={row.id} className={selected.has(id) ? 'bg-emerald-50/50' : undefined}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selected.has(id)}
                            onChange={() => toggleOne(id)}
                          />
                        </TableCell>
                        <TableCell className="text-xs font-medium">{row.wkorder}</TableCell>
                        <TableCell className="text-xs">{row.wktype}</TableCell>
                        <TableCell className="text-xs">{row.displayDate}</TableCell>
                        <TableCell className="text-xs">{row.team || '—'}</TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )
      ) : null}
    </AppCard>
  )
}
