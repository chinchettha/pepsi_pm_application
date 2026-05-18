import { PageHeader } from '@/components/layout/PageHeader'
import { MonthFullCalendar } from '@/components/scheduling/MonthFullCalendar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { fetchLineCalendarEvents, fetchMasterData } from '@/lib/api-public'
import { createLineSchdul, updateLineSchdul } from '@/lib/master-data-api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

  const q = useQuery({
    queryKey: ['line-calendar', year, month],
    queryFn: () => fetchLineCalendarEvents(year, month),
  })

  const moveMut = useMutation({
    mutationFn: async (opts: { idline: number; newDate: string }) => {
      const lineday = dateStringToEpochSeconds(opts.newDate)
      if (!lineday) throw new Error('Invalid date')
      await updateLineSchdul(opts.idline, { lineday })
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['line-calendar', year, month] })
      toast.success('Saved')
    },
    onError: (err) => toast.error((err as Error).message),
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
    mutationFn: async (opts: { date: string; idproductline: string; uptime: number; linereason: string }) => {
      const lineday = dateStringToEpochSeconds(opts.date)
      if (!lineday) throw new Error('Invalid date')
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
      toast.success('Created')
      setDialogOpen(false)
    },
    onError: (err) => toast.error((err as Error).message),
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
      toast.success('Saved')
      setDialogOpen(false)
    },
    onError: (err) => toast.error((err as Error).message),
  })

  const openCreateDialog = (date: string) => {
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

  return (
    <div>
      <PageHeader
        title="ปฏิทินเส้น / Line scheduling"
        description="Product Line Scheduling — เทียบ line_calendar.php + FullCalendar"
      >
        <Badge variant="secondary">Line calendar</Badge>
        <Badge className="bg-emerald-700">API + DB</Badge>
      </PageHeader>

      <div className="space-y-4 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <Link to="/calendar">ปฏิทินรายเดือน (work order)</Link>
          </Button>
        </div>

        {q.isLoading ? (
          <Skeleton className="h-96 w-full rounded-xl" />
        ) : q.isError ? (
          <p className="text-sm text-red-600">{(q.error as Error).message}</p>
        ) : (
          <MonthFullCalendar
            year={year}
            month={month}
            events={q.data?.items ?? []}
            onMonthChange={(y, m) => {
              setYear(y)
              setMonth(m)
            }}
            onDateClick={(date) => openCreateDialog(date)}
            onEventClick={(event) => {
              const idline = Number(event.id)
              if (!Number.isFinite(idline) || idline <= 0) {
                toast.error('Invalid event id')
                return
              }
              openEditDialog(idline, event.date)
            }}
            onEventDrop={(event, newDate) => {
              const idline = Number(event.id)
              if (!Number.isFinite(idline) || idline <= 0) {
                toast.error('Invalid event id')
                return
              }
              moveMut.mutate({ idline, newDate })
            }}
          />
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialogMode === 'create' ? 'Create schedule' : 'Edit schedule'}</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4">
              <div>
                <Label>Date</Label>
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
                      placeholder="Product line"
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
                <Label>Uptime</Label>
                <Input
                  inputMode="numeric"
                  value={formUptime}
                  onChange={(e) => setFormUptime(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div>
                <Label>Reason</Label>
                <Textarea value={formLinereason} onChange={(e) => setFormLinereason(e.target.value)} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={createMut.isPending || editMut.isPending}
                onClick={() => {
                  const uptime = Number(formUptime)
                  if (!Number.isFinite(uptime) || uptime < 0) {
                    toast.error('Uptime must be a number')
                    return
                  }
                  if (dialogMode === 'create') {
                    if (!formIdproductline.trim()) {
                      toast.error('Product line is required')
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
                    toast.error('Invalid schedule id')
                    return
                  }
                  editMut.mutate({
                    idline: selectedIdline,
                    uptime,
                    linereason: formLinereason,
                  })
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
