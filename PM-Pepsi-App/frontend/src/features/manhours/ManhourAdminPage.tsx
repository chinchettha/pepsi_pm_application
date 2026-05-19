/**
 * Admin CRUD + import — เทียบ `M_manhour.php`, `M_manhour_form.php`, `M_manhour_imports.php`
 */
import type { ManhourImportResponse, ManhourItem } from '@/api/schemas'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { getStoredAuthUser } from '@/features/auth/login-api'
import { formatManhourDate } from '@/features/manhours/format-manhour-date'
import {
  deleteManhour,
  fetchManhourList,
  postManhourImport,
  upsertManhour,
} from '@/lib/api-public'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, Pencil, Plus, Trash2, Upload } from 'lucide-react'
import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

type FormMode = 'create' | 'edit' | 'delete'

type FormState = {
  mode: FormMode
  idmanhour: number | null
  idwkctr: string
  stworkday: string
  workday: string
  wh: string
  ot1: string
  ot15: string
  ot1hol: string
  ot2: string
  ot3: string
}

const emptyForm: FormState = {
  mode: 'create',
  idmanhour: null,
  idwkctr: '',
  stworkday: '',
  workday: '',
  wh: '0',
  ot1: '0',
  ot15: '0',
  ot1hol: '0',
  ot2: '0',
  ot3: '0',
}

function fromItem(row: ManhourItem): FormState {
  return {
    mode: 'edit',
    idmanhour: row.idmanhour,
    idwkctr: row.idwkctr,
    stworkday: row.startDate ?? '',
    workday: row.endDate ?? '',
    wh: String(row.wh),
    ot1: String(row.ot1),
    ot15: String(row.ot15),
    ot1hol: String(row.ot1hol),
    ot2: String(row.ot2),
    ot3: String(row.ot3),
  }
}

function parseHour(s: string): number {
  const n = Number(s.trim())
  return Number.isFinite(n) && n >= 0 ? n : 0
}

function ImportResultBlock({ data }: { data: ManhourImportResponse }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium text-zinc-800">ผลการนำเข้า: {data.fileName}</p>
        <Badge variant="outline">total: {data.totalRows}</Badge>
        <Badge variant="secondary">+{data.inserted}</Badge>
        <Badge variant="secondary">↻{data.updated}</Badge>
        {data.errors > 0 ? (
          <Badge variant="destructive">errors: {data.errors}</Badge>
        ) : null}
      </div>
      {data.rows.length > 0 ? (
        <div className="mt-3 overflow-auto rounded-lg border border-zinc-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Row</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead>idwkctr</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((r) => (
                <TableRow key={`${r.rowNo}-${r.idwkctr}-${r.action}`}>
                  <TableCell className="text-center tabular-nums">{r.rowNo}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        r.action === 'inserted' || r.action === 'updated'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {r.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{r.idwkctr}</TableCell>
                  <TableCell className="text-xs text-zinc-600">{r.message ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </div>
  )
}

export function ManhourAdminPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const authUser = getStoredAuthUser()
  const isAdmin = authUser?.userst === 'A'

  const [search, setSearch] = useState('')
  const [submittedQ, setSubmittedQ] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<ManhourImportResponse | null>(null)
  const importInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Admin only')
      navigate('/manhours', { replace: true })
    }
  }, [isAdmin, navigate])

  const listQ = useQuery({
    queryKey: ['manhours', 'admin', 'list', submittedQ],
    queryFn: () => fetchManhourList({ q: submittedQ || undefined, limit: 500 }),
    enabled: isAdmin,
  })

  const saveMut = useMutation({
    mutationFn: async (state: FormState) => {
      const body = {
        idwkctr: state.idwkctr.trim(),
        stworkday: state.stworkday,
        workday: state.workday,
        wh: parseHour(state.wh),
        ot1: parseHour(state.ot1),
        ot15: parseHour(state.ot15),
        ot1hol: parseHour(state.ot1hol),
        ot2: parseHour(state.ot2),
        ot3: parseHour(state.ot3),
      }
      if (state.mode === 'edit' && state.idmanhour != null) {
        return upsertManhour(body, state.idmanhour)
      }
      return upsertManhour(body)
    },
    onSuccess: (_d, state) => {
      toast.success(
        state.mode === 'edit'
          ? `อัปเดต manhour #${state.idmanhour}`
          : `เพิ่ม manhour สำหรับ ${state.idwkctr}`,
      )
      setFormOpen(false)
      qc.invalidateQueries({ queryKey: ['manhours'] })
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : String(err))
    },
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteManhour(id),
    onSuccess: () => {
      toast.success('ลบข้อมูลแล้ว')
      setFormOpen(false)
      qc.invalidateQueries({ queryKey: ['manhours'] })
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : String(err))
    },
  })

  function openCreate() {
    setForm({ ...emptyForm, mode: 'create' })
    setFormOpen(true)
  }

  function openEdit(row: ManhourItem) {
    setForm(fromItem(row))
    setFormOpen(true)
  }

  function openDelete(row: ManhourItem) {
    setForm({ ...fromItem(row), mode: 'delete' })
    setFormOpen(true)
  }

  function onSearch(e: FormEvent) {
    e.preventDefault()
    setSubmittedQ(search.trim())
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (form.mode === 'delete') {
      if (form.idmanhour != null) deleteMut.mutate(form.idmanhour)
      return
    }
    if (!form.idwkctr.trim()) {
      toast.error('กรุณาระบุรหัส HR (idwkctr)')
      return
    }
    if (!form.stworkday || !form.workday) {
      toast.error('กรุณาเลือก Start Date และ End Date')
      return
    }
    saveMut.mutate(form)
  }

  function onPickImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setImporting(true)
    setImportResult(null)
    postManhourImport(file)
      .then((res) => {
        setImportResult(res)
        toast.success(
          `Import: +${res.inserted} ใหม่, ↻${res.updated} อัปเดต, ⚠${res.errors} error`,
        )
        qc.invalidateQueries({ queryKey: ['manhours'] })
      })
      .catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : String(err))
      })
      .finally(() => setImporting(false))
  }

  if (!isAdmin) return null

  const items = listQ.data?.items ?? []
  const totalRows = listQ.data?.totalRows ?? 0

  return (
    <div>
      <PageHeader
        title="ข้อมูลนำเข้า Man Hour"
        description="เทียบ M_manhour.php — ตาราง tbmanhours + ฟอร์ม + นำเข้า Excel (ManHours.xlsx)"
      >
        <Badge variant="secondary">{totalRows} แถว</Badge>
        <Button asChild variant="outline" size="sm">
          <Link to="/manhours">สรุปรายสัปดาห์</Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            toast.message(
              'คอลัมน์ ManHours.xlsx: idwkctr, StartDate, EndDate, WH, OT1, OT1.5, OT1HOL, OT2, OT3 (skip 2 แถวแรก)',
            )
          }
        >
          <Download className="mr-1 size-4" />
          รูปแบบไฟล์นำเข้า
        </Button>
        <input
          ref={importInputRef}
          type="file"
          accept=".xls,.xlsx,.csv"
          className="hidden"
          onChange={onPickImport}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={importing}
          onClick={() => importInputRef.current?.click()}
        >
          <Upload className="mr-1 size-4" />
          {importing ? 'กำลังนำเข้า…' : 'นำเข้าไฟล์'}
        </Button>
        <Button type="button" size="sm" onClick={openCreate}>
          <Plus className="mr-1 size-4" />
          สร้างใหม่
        </Button>
      </PageHeader>

      <div className="space-y-4 px-4 py-6 sm:px-6">
        <form
          onSubmit={onSearch}
          className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
        >
          <div className="min-w-[12rem] flex-1 space-y-1">
            <Label htmlFor="mh-search">ค้นหา (รหัส HR / ชื่อ)</Label>
            <Input
              id="mh-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="idwkctr, ชื่อ…"
            />
          </div>
          <Button type="submit">ค้นหา</Button>
        </form>

        {importResult ? <ImportResultBlock data={importResult} /> : null}

        {listQ.isLoading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : listQ.isError ? (
          <p className="text-sm text-red-600">{(listQ.error as Error).message}</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-800 hover:bg-zinc-800">
                  <TableHead className="text-zinc-50">ช่วงวันที่</TableHead>
                  <TableHead className="text-zinc-50">รหัส HR</TableHead>
                  <TableHead className="text-zinc-50">ชื่อ</TableHead>
                  <TableHead className="text-right text-zinc-50">WH</TableHead>
                  <TableHead className="text-right text-zinc-50">OT1</TableHead>
                  <TableHead className="text-right text-zinc-50">รวม</TableHead>
                  <TableHead className="text-zinc-50">action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length ? (
                  items.map((row) => (
                    <TableRow key={row.idmanhour}>
                      <TableCell>
                        {formatManhourDate(row.startDate, row.stworkday)} –{' '}
                        {formatManhourDate(row.endDate, row.workday)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{row.idwkctr}</TableCell>
                      <TableCell>{row.displayName?.trim() || '—'}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.wh}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.ot1}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.total}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(row)}
                          >
                            <Pencil className="mr-1 size-3.5" />
                            แก้ไข
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openDelete(row)}
                          >
                            <Trash2 className="mr-1 size-3.5" />
                            ลบ
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-sm text-zinc-500">
                      ยังไม่มีข้อมูล
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <form onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle>
                {form.mode === 'create'
                  ? 'เพิ่ม Man Hour'
                  : form.mode === 'edit'
                    ? 'แก้ไข Man Hour'
                    : 'ลบ Man Hour'}
              </DialogTitle>
              <DialogDescription>
                {form.mode === 'delete'
                  ? `ยืนยันลบรายการ #${form.idmanhour} (${form.idwkctr})`
                  : 'เทียบ M_manhour_form.php'}
              </DialogDescription>
            </DialogHeader>

            {form.mode === 'delete' ? (
              <p className="py-4 text-sm text-zinc-700">
                ช่วง {formatManhourDate(form.stworkday)} – {formatManhourDate(form.workday)}
              </p>
            ) : (
              <div className="grid gap-4 py-2 sm:grid-cols-2">
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="mh-idwkctr">รหัส HR (idwkctr)</Label>
                  <Input
                    id="mh-idwkctr"
                    value={form.idwkctr}
                    onChange={(e) => setForm((f) => ({ ...f, idwkctr: e.target.value }))}
                    disabled={form.mode === 'edit'}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>Start Date</Label>
                  <DatePicker
                    value={form.stworkday}
                    onChange={(v) => setForm((f) => ({ ...f, stworkday: v }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>End Date</Label>
                  <DatePicker
                    value={form.workday}
                    onChange={(v) => setForm((f) => ({ ...f, workday: v }))}
                  />
                </div>
                {(
                  [
                    ['wh', 'WH'],
                    ['ot1', 'OT1'],
                    ['ot15', 'OT1.5'],
                    ['ot1hol', 'OT1HOL'],
                    ['ot2', 'OT2'],
                    ['ot3', 'OT3'],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="space-y-1">
                    <Label htmlFor={`mh-${key}`}>{label}</Label>
                    <Input
                      id={`mh-${key}`}
                      type="number"
                      min={0}
                      step="0.5"
                      value={form[key]}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                ยกเลิก
              </Button>
              <Button
                type="submit"
                variant={form.mode === 'delete' ? 'destructive' : 'default'}
                disabled={saveMut.isPending || deleteMut.isPending}
              >
                {form.mode === 'delete'
                  ? 'ลบข้อมูล'
                  : form.mode === 'edit'
                    ? 'แก้ไขข้อมูล'
                    : 'เพิ่มข้อมูล'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
