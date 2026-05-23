import { CanPermission } from '@/components/auth/CanPermission'
import { AppCard } from '@/components/layout/AppCard'
import { AppPageShell } from '@/components/layout/AppPageShell'
import { MonthFullCalendar } from '@/components/scheduling/MonthFullCalendar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { fetchLineCalendarEvents, fetchMasterData } from '@/lib/api-public'
import { toastError, toastSaved } from '@/lib/app-toast'
import { createLineSchdul, updateLineSchdul } from '@/lib/master-data-api'
import { usePermission } from '@/lib/use-permission'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

function dateStringToEpochSeconds(date: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim())
  if (!m) return 0
  const yyyy = Number(m[1])
  const mm = Number(m[2])
  const dd = Number(m[3])
  if (!Number.isFinite(yyyy) || !Number.isFinite(mm) || !Number.isFinite(dd)) return 0
  const dt = new Date(yyyy, mm - 1, dd, 0, 0, 0, 0)
  const ms = dt.getTime()
  if (!Number.isFinite(ms)) return 0
  return Math.floor(ms / 1000)
}

function formatYyyyMmDdToDdMmYyyy(v: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v.trim())
  if (!m) return v
  return `${m[3]}.${m[2]}.${m[1]}`
}

export function LineCalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const qc = useQueryClient()
  const canWrite = usePermission('master-data.write')

  const q = useQuery({
    queryKey: ['line-calendar', year, month],
    queryFn: () => fetchLineCalendarEvents(year, month),
    placeholderData: keepPreviousData,
  })

  const moveMut = useMutation({
    mutationFn: async (opts: { idline: number; newDate: string }) => {
      const lineday = dateStringToEpochSeconds(opts.newDate)
      if (!lineday) throw new Error('วันที่ไม่ถูกต้อง')
      await updateLineSchdul(opts.idline, { lineday })
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['line-calendar', year, month] })
      toastSaved()
    },
    onError: (err) => toastError('ย้ายวันไม่สำเร็จ', (err as Error).message),
  })

  const lineschdulQ = useQuery({
    queryKey: ['master-data', 'lineschdul'],
    queryFn: () => fetchMasterData('lineschdul'),
    retry: 0,
  })

  const lineproductQ = useQuery({
    queryKey: ['master-data', 'lineproduct'],
    queryFn: () => fetchMasterData('lineproduct'),
    retry: 0,
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedIdline, setSelectedIdline] = useState<number | null>(null)
  const [formIdproductline, setFormIdproductline] = useState<string>('')
  const [formUptime, setFormUptime] = useState<string>('0')
  const [formLinereason, setFormLinereason] = useState<string>('')

  const productlines = (lineproductQ.data ?? []).filter(
    (x): x is { id: string; productline: string; prolinedescrip: string } =>
      x != null &&
      typeof x === 'object' &&
      'id' in x &&
      'productline' in x &&
      'prolinedescrip' in x,
  )

  const lineschduls = (lineschdulQ.data ?? []).filter(
    (x): x is {
      id: string
      idline: number
      idproductline: string
      productline: string
      lineday: number
      uptime: number
      linereason: string
    } =>
      x != null &&
      typeof x === 'object' &&
      'id' in x &&
      'idline' in x &&
      'idproductline' in x &&
      'lineday' in x,
  )

  const createMut = useMutation({
    mutationFn: async (opts: {
      date: string
      idproductline: string
      uptime: number
      linereason: string
    }) => {
      const lineday = dateStringToEpochSeconds(opts.date)
      if (!lineday) throw new Error('วันที่ไม่ถูกต้อง')
      await createLineSchdul({
        idproductline: opts.idproductline,
        lineday,
        uptime: opts.uptime,
        linereason: opts.linereason,
      })
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['line-calendar', year, month] }),
        qc.invalidateQueries({ queryKey: ['master-data', 'lineschdul'] }),
      ])
      toast.success('สร้างตารางเส้นแล้ว')
      setDialogOpen(false)
    },
    onError: (err) => toastError('สร้างไม่สำเร็จ', (err as Error).message),
  })

  const editMut = useMutation({
    mutationFn: async (opts: { idline: number; uptime: number; linereason: string }) => {
      await updateLineSchdul(opts.idline, { uptime: opts.uptime, linereason: opts.linereason })
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['line-calendar', year, month] }),
        qc.invalidateQueries({ queryKey: ['master-data', 'lineschdul'] }),
      ])
      toastSaved()
      setDialogOpen(false)
    },
    onError: (err) => toastError('บันทึกไม่สำเร็จ', (err as Error).message),
  })

  const openCreateDialog = (date: string) => {
    if (!canWrite) {
      toast.message('โหมดอ่านอย่างเดียว — ต้องมีสิทธิ์ master-data.write')
      return
    }
    setDialogMode('create')
    setSelectedDate(date)
    setSelectedIdline(null)
    setFormUptime('0')
    setFormLinereason('')
    setFormIdproductline(productlines[0]?.productline ?? '')
    setDialogOpen(true)
  }

  const openEditDialog = (idline: number, date: string) => {
    const row = lineschduls.find((x) => x.idline === idline)
    setDialogMode('edit')
    setSelectedDate(date)
    setSelectedIdline(idline)
    setFormIdproductline(row?.idproductline ?? row?.productline ?? '')
    setFormUptime(String(row?.uptime ?? 0))
    setFormLinereason(row?.linereason ?? '')
    setDialogOpen(true)
  }

  const eventCount = q.data?.items?.length ?? 0

  return (
    <>
      <AppPageShell
        title="ปฏิทินเส้น (Product line)"
        description="ตาราง Product line รายวัน — คลิกวันว่างเพื่อเพิ่ม · คลิกรายการเพื่อแก้ไข · ลากเพื่อย้ายวัน"
        contentClassName="space-y-4"
        headerActions={
          <CanPermission permission="calendar.read">
            <Button type="button" variant="outline" size="sm" asChild>
              <Link to="/calendar">ปฏิทิน Work scheduling</Link>
            </Button>
          </CanPermission>
        }
      >
        {!canWrite ? (
          <p className="text-caption rounded-button border border-dashed border-app bg-app-subtle/50 px-3 py-2">
            โหมดอ่านอย่างเดียว — ต้องมีสิทธิ์ <code className="text-xs">master-data.write</code>{' '}
            เพื่อเพิ่ม/แก้/ลากย้าย
          </p>
        ) : null}

        {q.isLoading ? (
          <Skeleton className="h-[28rem] w-full rounded-card" aria-label="กำลังโหลดปฏิทินเส้น" />
        ) : q.isError ? (
          <EmptyState
            icon={AlertCircle}
            title="โหลดปฏิทินเส้นไม่สำเร็จ"
            description={
              <>
                ตรวจการเชื่อมต่อ API หรือสิทธิ์{' '}
                <code className="text-xs">calendar.read</code>
                {q.error instanceof Error ? ` — ${q.error.message}` : null}
              </>
            }
            action={{ label: 'ลองใหม่', onClick: () => void q.refetch() }}
          />
        ) : (
          <AppCard pad="compact" className="space-y-3">
            {eventCount === 0 ? (
              <p className="text-caption rounded-button border border-dashed border-app bg-app-subtle/50 px-3 py-2">
                ไม่มีตารางเส้นในเดือนนี้
                {canWrite ? ' — คลิกวันบนปฏิทินเพื่อเพิ่ม' : ''}
              </p>
            ) : (
              <p className="text-caption">
                แสดง {eventCount.toLocaleString('th-TH')} รายการในเดือนที่เลือก
              </p>
            )}
            <MonthFullCalendar
              year={year}
              month={month}
              events={q.data?.items ?? []}
              onMonthChange={(y, m) => {
                setYear(y)
                setMonth(m)
              }}
              onDateClick={canWrite ? (date) => openCreateDialog(date) : undefined}
              onEventClick={(event) => {
                const idline = Number(event.id)
                if (!Number.isFinite(idline) || idline <= 0) {
                  toastError('รหัสรายการไม่ถูกต้อง')
                  return
                }
                openEditDialog(idline, event.date)
              }}
              onEventDrop={
                canWrite
                  ? (event, newDate) => {
                      const idline = Number(event.id)
                      if (!Number.isFinite(idline) || idline <= 0) {
                        toastError('รหัสรายการไม่ถูกต้อง')
                        return
                      }
                      moveMut.mutate({ idline, newDate })
                    }
                  : undefined
              }
            />
          </AppCard>
        )}
      </AppPageShell>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' ? 'เพิ่มตารางเส้น' : 'แก้ไขตารางเส้น'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div>
              <Label>วันที่</Label>
              <Input value={formatYyyyMmDdToDdMmYyyy(selectedDate)} disabled />
            </div>

            <div>
              <Label>Product line</Label>
              {dialogMode === 'edit' ? (
                <Input value={formIdproductline} disabled />
              ) : (
                <>
                  <Input
                    value={formIdproductline}
                    onChange={(e) => setFormIdproductline(e.target.value)}
                    list="lineproduct-options"
                    placeholder="รหัส product line"
                    disabled={!canWrite}
                  />
                  <datalist id="lineproduct-options">
                    {productlines.map((p) => (
                      <option key={p.productline} value={p.productline}>
                        {p.prolinedescrip}
                      </option>
                    ))}
                  </datalist>
                </>
              )}
            </div>

            <div>
              <Label>Uptime (ชม.)</Label>
              <Input
                inputMode="numeric"
                value={formUptime}
                onChange={(e) => setFormUptime(e.target.value)}
                placeholder="0"
                disabled={!canWrite}
              />
            </div>

            <div>
              <Label>เหตุผล / หมายเหตุ</Label>
              <Textarea
                value={formLinereason}
                onChange={(e) => setFormLinereason(e.target.value)}
                disabled={!canWrite}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              type="button"
              disabled={!canWrite || createMut.isPending || editMut.isPending}
              onClick={() => {
                const uptime = Number(formUptime)
                if (!Number.isFinite(uptime) || uptime < 0) {
                  toastError('Uptime ต้องเป็นตัวเลขที่ไม่ติดลบ')
                  return
                }
                if (dialogMode === 'create') {
                  if (!formIdproductline.trim()) {
                    toastError('กรุณาระบุ Product line')
                    return
                  }
                  createMut.mutate({
                    date: selectedDate,
                    idproductline: formIdproductline.trim(),
                    uptime,
                    linereason: formLinereason,
                  })
                  return
                }
                if (!selectedIdline) {
                  toastError('รหัสตารางไม่ถูกต้อง')
                  return
                }
                editMut.mutate({
                  idline: selectedIdline,
                  uptime,
                  linereason: formLinereason,
                })
              }}
            >
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
