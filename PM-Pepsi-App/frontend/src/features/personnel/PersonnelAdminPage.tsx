/**
 * Admin CRUD ของ `tbworkcenter` — เทียบ PHP `M_personel.php` + `_form` + `_imports`
 * - ตารางผู้ใช้ทั้งหมด (search) + ปุ่ม Import Excel + ปุ่มเพิ่มข้อมูล
 * - Modal create/edit แบบ 2 แท็บ (ข้อมูลส่วนตัว / ข้อมูลงาน) — แท็บ 3 (รหัสผ่าน) รวมในฟอร์มเดียว
 * - Upload `imgmember`: รับภาพอะไรก็ได้ → backend แปลงเป็น **WebP** (resize 600px) เก็บลง `imgmember_data` BYTEA
 *   ใช้ `<img src=/api/v1/personnel/:idwkctr/image>` (ส่ง cookie auth อัตโนมัติ)
 * - Excel import: skip 2 rows แรก (เทียบ PHP `$n > 2`) + แสดงผลทีละแถว
 */
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getStoredAuthUser } from '@/features/auth/login-api'
import type {
  PersonnelAdminItem,
  PersonnelImportResponse,
  PersonnelRole,
} from '@/api/schemas'
import {
  deletePersonnelAdmin as apiDeletePersonnel,
  deletePersonnelAdminImage,
  fetchPersonnelAdminList,
  fetchPersonnelLookups,
  fetchPersonnelWorkstatusOptions,
  personnelImageUrl,
  postPersonnelAdminImage,
  postPersonnelAdminImport,
  upsertPersonnelAdmin,
  type PersonnelLookupOption,
} from '@/lib/api-public'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ImageIcon, Pencil, Trash2, Upload, UserPlus } from 'lucide-react'
import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

function unixToInputDate(sec: number | null | undefined): string {
  if (!sec || sec <= 0) return ''
  const d = new Date(sec * 1000)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

type FormState = {
  isEdit: boolean
  idwkctr: string
  titlewkctr: string
  namewkctr: string
  surnamewkctr: string
  titlewkctreng: string
  namewkctreng: string
  surnamewkctreng: string
  startwork: string
  wkctrdate: string
  iddepartment: string
  idposition: string
  wkctr: string
  plnt: string
  cat: string
  resp: string
  idwkctrgroup: string
  idwkctrtype: string
  idwklevel: string
  wkctrtel: string
  wkctrmail: string
  labourcost: string
  userst: 'A' | 'H' | 'U' | 'W'
  userrole: PersonnelRole
  workstatus: string
  pass: string
}

const emptyForm: FormState = {
  isEdit: false,
  idwkctr: '',
  titlewkctr: '',
  namewkctr: '',
  surnamewkctr: '',
  titlewkctreng: '',
  namewkctreng: '',
  surnamewkctreng: '',
  startwork: '',
  wkctrdate: '',
  iddepartment: '',
  idposition: '',
  wkctr: '',
  plnt: '',
  cat: '',
  resp: '',
  idwkctrgroup: '',
  idwkctrtype: '',
  idwklevel: '',
  wkctrtel: '',
  wkctrmail: '',
  labourcost: '0',
  userst: 'U',
  userrole: 'planner',
  workstatus: '',
  pass: '',
}

const USERST_OPTIONS: Array<{ value: FormState['userst']; label: string }> = [
  { value: 'A', label: 'A — Admin (legacy)' },
  { value: 'H', label: 'H — Head / Manager (legacy)' },
  { value: 'U', label: 'U — User / Planner (legacy)' },
  { value: 'W', label: 'W — Work center / Technician (legacy)' },
]

const USERROLE_OPTIONS: Array<{ value: PersonnelRole; label: string }> = [
  { value: 'admin', label: 'Admin — ผู้ดูแลระบบ' },
  { value: 'manager', label: 'Manager — หัวหน้างาน/ผู้จัดการ' },
  { value: 'planner', label: 'Planner / Engineering' },
  { value: 'technician', label: 'Technician — ช่าง' },
]

function fromItem(it: PersonnelAdminItem): FormState {
  return {
    isEdit: true,
    idwkctr: it.idwkctr,
    titlewkctr: it.titlewkctr ?? '',
    namewkctr: it.namewkctr ?? '',
    surnamewkctr: it.surnamewkctr ?? '',
    titlewkctreng: it.titlewkctreng ?? '',
    namewkctreng: it.namewkctreng ?? '',
    surnamewkctreng: it.surnamewkctreng ?? '',
    startwork: unixToInputDate(it.startwork),
    wkctrdate: unixToInputDate(it.wkctrdate),
    iddepartment: it.iddepartment ?? '',
    idposition: it.idposition ?? '',
    wkctr: it.wkctr,
    plnt: it.plnt ?? '',
    cat: it.cat ?? '',
    resp: it.resp ?? '',
    idwkctrgroup: it.idwkctrgroup ?? '',
    idwkctrtype: it.idwkctrtype ?? '',
    idwklevel: it.idwklevel ?? '',
    wkctrtel: it.wkctrtel ?? '',
    wkctrmail: it.wkctrmail ?? '',
    labourcost: String(it.labourcost ?? 0),
    userst: (it.userst === 'A' || it.userst === 'H' || it.userst === 'U' || it.userst === 'W'
      ? it.userst
      : 'U') as FormState['userst'],
    userrole: it.userrole,
    workstatus: it.workstatus ?? '',
    pass: '',
  }
}

export function PersonnelAdminPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const authUser = getStoredAuthUser()
  const isAdmin = authUser?.userst === 'A'

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Admin only')
      navigate('/personnel', { replace: true })
    }
  }, [isAdmin, navigate])

  const [q, setQ] = useState('')
  const [qInput, setQInput] = useState('')
  /**
   * Filter "สถานะใช้งาน"
   * - `active` (default) = ทำงานปกติ + แถวเก่าที่ยังไม่กำหนด workstatus (กันคนหาย) — เทียบ legacy `M_personel.php` ที่ซ่อนคนลาออก
   * - `inactive` = ลาออก / เกษียณ / พ้นสภาพ
   * - `all` = ทุกคน
   * - `<code>` = match แม่นยำ เช่น `RESIGNED`
   */
  const [statusFilter, setStatusFilter] = useState<string>('active')

  const listQ = useQuery({
    queryKey: ['personnel', 'admin', 'list', q, statusFilter],
    queryFn: () =>
      fetchPersonnelAdminList({
        q: q || undefined,
        status: statusFilter,
        limit: 500,
      }),
    enabled: isAdmin,
    staleTime: 15_000,
  })

  // Lookup สำหรับ select ในฟอร์ม — เทียบ legacy `personel_form_tab2.php` ที่ join 5 ตาราง
  const lookupsQ = useQuery({
    queryKey: ['personnel', 'admin', 'lookups'],
    queryFn: fetchPersonnelLookups,
    enabled: isAdmin,
    staleTime: 5 * 60_000,
  })
  const lookups = lookupsQ.data

  // Lookup workstatus — เทียบ legacy `tbwkctrstatus` (M_personel.php ฟิลด์ filed24)
  const workstatusOptionsQ = useQuery({
    queryKey: ['personnel', 'admin', 'workstatus-options'],
    queryFn: fetchPersonnelWorkstatusOptions,
    enabled: isAdmin,
    staleTime: 10 * 60_000,
  })
  const workstatusOptions = useMemo(
    () => workstatusOptionsQ.data ?? [],
    [workstatusOptionsQ.data],
  )
  /** options พร้อมแสดงในฟอร์ม (label = `code — desc`) */
  const workstatusFormOptions = useMemo<PersonnelLookupOption[]>(
    () =>
      workstatusOptions.map((o) => ({
        value: o.workstatus,
        label: `${o.workstatus} — ${o.wkstatusdes}`,
      })),
    [workstatusOptions],
  )
  /** map code → option (สำหรับ badge สีในตาราง) */
  const workstatusMap = useMemo(() => {
    const m = new Map<string, (typeof workstatusOptions)[number]>()
    for (const o of workstatusOptions) m.set(o.workstatus, o)
    return m
  }, [workstatusOptions])

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [imageVersion, setImageVersion] = useState<Record<string, number>>({})
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<PersonnelImportResponse | null>(
    null,
  )
  const importInputRef = useRef<HTMLInputElement | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)

  const items = listQ.data?.items ?? []
  const totalRows = listQ.data?.totalRows ?? 0

  const bumpImageVer = (idwkctr: string) =>
    setImageVersion((m) => ({ ...m, [idwkctr]: (m[idwkctr] ?? 0) + 1 }))

  const upsertMut = useMutation({
    mutationFn: (state: FormState) =>
      upsertPersonnelAdmin({
        idwkctr: state.idwkctr.trim(),
        titlewkctr: state.titlewkctr || null,
        namewkctr: state.namewkctr || null,
        surnamewkctr: state.surnamewkctr || null,
        titlewkctreng: state.titlewkctreng || null,
        namewkctreng: state.namewkctreng || null,
        surnamewkctreng: state.surnamewkctreng || null,
        startwork: state.startwork || null,
        wkctrdate: state.wkctrdate || null,
        iddepartment: state.iddepartment || null,
        idposition: state.idposition || null,
        wkctr: state.wkctr.trim(),
        plnt: state.plnt || null,
        cat: state.cat || null,
        resp: state.resp || null,
        idwkctrgroup: state.idwkctrgroup || null,
        idwkctrtype: state.idwkctrtype || null,
        idwklevel: state.idwklevel || null,
        wkctrtel: state.wkctrtel || null,
        wkctrmail: state.wkctrmail || null,
        labourcost: state.labourcost === '' ? 0 : Number(state.labourcost),
        userst: state.userst,
        userrole: state.userrole,
        workstatus: state.workstatus || null,
        pass: state.pass || undefined,
      }),
    onSuccess: (_d, vars) => {
      toast.success(
        vars.isEdit ? `Updated ${vars.idwkctr}` : `Added ${vars.idwkctr}`,
      )
      setOpen(false)
      qc.invalidateQueries({ queryKey: ['personnel', 'admin', 'list'] })
    },
    onError: (err: unknown) => {
      toast.error(
        `Save failed: ${err instanceof Error ? err.message : String(err)}`,
      )
    },
  })

  const deleteMut = useMutation({
    mutationFn: (idwkctr: string) => apiDeletePersonnel(idwkctr),
    onSuccess: (_d, idwkctr) => {
      toast.success(`Deleted ${idwkctr}`)
      qc.invalidateQueries({ queryKey: ['personnel', 'admin', 'list'] })
    },
    onError: (err: unknown) => {
      toast.error(`Delete failed: ${err instanceof Error ? err.message : String(err)}`)
    },
  })

  const imageMut = useMutation({
    mutationFn: ({ idwkctr, file }: { idwkctr: string; file: File }) =>
      postPersonnelAdminImage(idwkctr, file),
    onSuccess: (res, vars) => {
      toast.success(
        `อัปโหลด WebP สำเร็จ ${res.width}×${res.height} (${Math.round(res.bytes / 1024)} KB)`,
      )
      bumpImageVer(vars.idwkctr)
      qc.invalidateQueries({ queryKey: ['personnel', 'admin', 'list'] })
    },
    onError: (err: unknown) => {
      toast.error(`Upload failed: ${err instanceof Error ? err.message : String(err)}`)
    },
  })

  const deleteImageMut = useMutation({
    mutationFn: (idwkctr: string) => deletePersonnelAdminImage(idwkctr),
    onSuccess: (_d, idwkctr) => {
      toast.message(`ลบรูปของ ${idwkctr}`)
      bumpImageVer(idwkctr)
      qc.invalidateQueries({ queryKey: ['personnel', 'admin', 'list'] })
    },
  })

  function openCreate() {
    setForm({ ...emptyForm, isEdit: false })
    setOpen(true)
  }

  function openEdit(it: PersonnelAdminItem) {
    setForm(fromItem(it))
    setOpen(true)
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!form.idwkctr.trim()) {
      toast.error('idwkctr (รหัส HR) is required')
      return
    }
    if (!form.wkctr.trim()) {
      toast.error('wkctr (รหัส SAP) is required')
      return
    }
    upsertMut.mutate(form)
  }

  function onPickImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!form.idwkctr) {
      toast.error('บันทึกข้อมูลก่อนอัปโหลดรูป')
      return
    }
    imageMut.mutate({ idwkctr: form.idwkctr, file })
  }

  function onPickImportFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setImporting(true)
    setImportResult(null)
    postPersonnelAdminImport(file)
      .then((res) => {
        setImportResult(res)
        toast.success(
          `Import: +${res.inserted} ใหม่, ↻${res.updated} อัปเดต, ⚠${res.errors} error`,
        )
        qc.invalidateQueries({ queryKey: ['personnel', 'admin', 'list'] })
      })
      .catch((err: unknown) => {
        toast.error(`Import failed: ${err instanceof Error ? err.message : String(err)}`)
      })
      .finally(() => setImporting(false))
  }

  if (!isAdmin) {
    return (
      <div className="px-6 py-10 text-sm text-zinc-600">
        Admin only — กำลังย้อนกลับ…
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="จัดการบุคลากร (Admin)"
        description="เทียบ M_personel.php / M_personel_form.php / M_personel_imports.php — ตาราง tbworkcenter ทั้งหมด"
      >
        <Badge variant="secondary">รวม {totalRows} คน</Badge>
        <Button asChild variant="outline" size="sm">
          <Link to="/personnel">กลับ Dashboard</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/personnel/confirm">Personnel Confirmation</Link>
        </Button>
        <input
          ref={importInputRef}
          type="file"
          accept=".xls,.xlsx,.csv"
          className="hidden"
          onChange={onPickImportFile}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={importing}
          onClick={() => importInputRef.current?.click()}
        >
          <Upload className="mr-1 size-4" />
          {importing ? 'Importing…' : 'นำเข้า Excel'}
        </Button>
        <Button type="button" size="sm" onClick={openCreate}>
          <UserPlus className="mr-1 size-4" />
          เพิ่มบุคลากร
        </Button>
      </PageHeader>

      <div className="space-y-4 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="ค้นหา รหัส / ชื่อ / WC…"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setQ(qInput.trim())
            }}
            className="max-w-md"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setQ(qInput.trim())}
          >
            ค้นหา
          </Button>
          {q ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setQ('')
                setQInput('')
              }}
            >
              ล้าง
            </Button>
          ) : null}

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Label className="text-xs text-zinc-600">สถานะใช้งาน</Label>
            {/* Quick filter chips — เทียบ PersonnelConfirmPage pattern */}
            <div className="flex flex-wrap gap-1">
              {(
                [
                  { value: 'active', label: 'ใช้งาน', tone: 'emerald' },
                  { value: 'inactive', label: 'ไม่ใช้งาน', tone: 'zinc' },
                  { value: 'all', label: 'ทั้งหมด', tone: 'blue' },
                ] as const
              ).map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  size="sm"
                  variant={statusFilter === opt.value ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
            {/* Dropdown สถานะรายตัว (ACTIVE/INACTIVE/LEAVE/RESIGNED/RETIRED/TERMINATED) */}
            <select
              value={
                statusFilter === 'active' ||
                statusFilter === 'inactive' ||
                statusFilter === 'all'
                  ? ''
                  : statusFilter
              }
              disabled={workstatusOptionsQ.isLoading}
              onChange={(e) => {
                const v = e.target.value
                setStatusFilter(v || 'all')
              }}
              className="h-9 rounded-md border border-zinc-300 bg-white px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              title="เลือกสถานะรายตัวสำหรับ filter"
            >
              <option value="">— เจาะจง code —</option>
              {workstatusOptions.map((o) => (
                <option key={o.workstatus} value={o.workstatus}>
                  {o.workstatus} — {o.wkstatusdes}
                </option>
              ))}
            </select>
          </div>
        </div>

        {importResult ? (
          <ImportResultBlock data={importResult} />
        ) : null}

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          {listQ.isLoading ? (
            <div className="p-4">
              <Skeleton className="h-48 w-full rounded" />
            </div>
          ) : listQ.isError ? (
            <div className="p-4 text-sm text-red-600">
              {listQ.error instanceof Error
                ? listQ.error.message
                : String(listQ.error)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">รูป</TableHead>
                  <TableHead>รหัส</TableHead>
                  <TableHead>ชื่อ-สกุล</TableHead>
                  <TableHead>WC</TableHead>
                  <TableHead>ตำแหน่ง</TableHead>
                  <TableHead>หน่วยงาน</TableHead>
                  <TableHead>บทบาท</TableHead>
                  <TableHead>สถานะใช้งาน</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-10 text-center text-sm text-zinc-500"
                    >
                      ไม่มีข้อมูล
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((it) => (
                    <PersonnelRow
                      key={it.idwkctr}
                      it={it}
                      ver={imageVersion[it.idwkctr]}
                      workstatusInfo={
                        it.workstatus ? workstatusMap.get(it.workstatus) : undefined
                      }
                      onEdit={() => openEdit(it)}
                      onDelete={() => {
                        if (
                          window.confirm(`Confirm delete ${it.idwkctr}?`)
                        ) {
                          deleteMut.mutate(it.idwkctr)
                        }
                      }}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={(v) => !upsertMut.isPending && setOpen(v)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {form.isEdit ? `แก้ไข ${form.idwkctr}` : 'เพิ่มบุคลากร'}
            </DialogTitle>
            <DialogDescription>
              เทียบ M_personel_form.php (personel_form_tab1/2/3) — ฟิลด์ของ tbworkcenter
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4">
            <Tabs defaultValue="t1">
              <TabsList>
                <TabsTrigger value="t1">ข้อมูลส่วนตัว</TabsTrigger>
                <TabsTrigger value="t2">ข้อมูลงาน</TabsTrigger>
                <TabsTrigger value="t3">ผู้ใช้/รหัสผ่าน</TabsTrigger>
                <TabsTrigger value="img">รูป (WebP)</TabsTrigger>
              </TabsList>

              <TabsContent value="t1" className="space-y-3 pt-2">
                <FormGrid>
                  <Field label="รหัส HR (idwkctr)" required>
                    <Input
                      value={form.idwkctr}
                      disabled={form.isEdit}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, idwkctr: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="คำนำหน้า">
                    <Input
                      value={form.titlewkctr}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, titlewkctr: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="ชื่อ">
                    <Input
                      value={form.namewkctr}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, namewkctr: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="นามสกุล">
                    <Input
                      value={form.surnamewkctr}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, surnamewkctr: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Title (Eng)">
                    <Input
                      value={form.titlewkctreng}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          titlewkctreng: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Name (Eng)">
                    <Input
                      value={form.namewkctreng}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          namewkctreng: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Surname (Eng)">
                    <Input
                      value={form.surnamewkctreng}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          surnamewkctreng: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="วันเกิด">
                    <Input
                      type="date"
                      value={form.wkctrdate}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, wkctrdate: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="เบอร์โทรศัพท์">
                    <Input
                      value={form.wkctrtel}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, wkctrtel: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="อีเมล">
                    <Input
                      type="email"
                      value={form.wkctrmail}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, wkctrmail: e.target.value }))
                      }
                    />
                  </Field>
                </FormGrid>
              </TabsContent>

              <TabsContent value="t2" className="space-y-3 pt-2">
                <FormGrid>
                  <Field label="รหัส SAP (wkctr)" required>
                    <Input
                      value={form.wkctr}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, wkctr: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Plant (plnt)">
                    <Input
                      value={form.plnt}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, plnt: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="วันที่เริ่มงาน">
                    <Input
                      type="date"
                      value={form.startwork}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, startwork: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="หน่วยงาน (iddepartment)">
                    <LookupSelect
                      value={form.iddepartment}
                      options={lookups?.departments}
                      loading={lookupsQ.isLoading}
                      onChange={(next) =>
                        setForm((s) => ({ ...s, iddepartment: next }))
                      }
                    />
                  </Field>
                  <Field label="ตำแหน่ง (idposition)">
                    <LookupSelect
                      value={form.idposition}
                      options={lookups?.positions}
                      loading={lookupsQ.isLoading}
                      onChange={(next) =>
                        setForm((s) => ({ ...s, idposition: next }))
                      }
                    />
                  </Field>
                  <Field label="กลุ่มงาน (idwkctrgroup)">
                    <LookupSelect
                      value={form.idwkctrgroup}
                      options={lookups?.groups}
                      loading={lookupsQ.isLoading}
                      onChange={(next) =>
                        setForm((s) => ({ ...s, idwkctrgroup: next }))
                      }
                    />
                  </Field>
                  <Field label="ประเภทช่าง (idwkctrtype)">
                    <LookupSelect
                      value={form.idwkctrtype}
                      options={lookups?.workTypes}
                      loading={lookupsQ.isLoading}
                      onChange={(next) =>
                        setForm((s) => ({ ...s, idwkctrtype: next }))
                      }
                    />
                  </Field>
                  <Field label="ระดับ (idwklevel)">
                    <LookupSelect
                      value={form.idwklevel}
                      options={lookups?.levels}
                      loading={lookupsQ.isLoading}
                      onChange={(next) =>
                        setForm((s) => ({ ...s, idwklevel: next }))
                      }
                    />
                  </Field>
                  <Field label="Cat">
                    <Input
                      value={form.cat}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, cat: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Resp">
                    <Input
                      value={form.resp}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, resp: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="ต้นทุนต่อคน (labourcost)">
                    <Input
                      type="number"
                      step="0.01"
                      value={form.labourcost}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, labourcost: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="สถานะ (workstatus)">
                    <LookupSelect
                      value={form.workstatus}
                      options={workstatusFormOptions}
                      loading={workstatusOptionsQ.isLoading}
                      onChange={(next) =>
                        setForm((s) => ({ ...s, workstatus: next }))
                      }
                      placeholder="— เลือกสถานะ —"
                    />
                  </Field>
                </FormGrid>
              </TabsContent>

              <TabsContent value="t3" className="space-y-3 pt-2">
                <FormGrid>
                  <Field label="สิทธิ์ระบบ (userst)">
                    <select
                      className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm shadow-sm"
                      value={form.userst}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          userst: e.target.value as FormState['userst'],
                        }))
                      }
                    >
                      {USERST_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-zinc-500">
                      ใช้กับเมนู legacy `menuright` เช่น A:U:W
                    </p>
                  </Field>
                  <Field label="บทบาท Dashboard/RBAC (userrole)">
                    <select
                      className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm shadow-sm"
                      value={form.userrole}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          userrole: e.target.value as PersonnelRole,
                        }))
                      }
                    >
                      {USERROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-zinc-500">
                      เป็น source of truth ใหม่สำหรับ Personal Dashboard และสิทธิ์ในอนาคต
                    </p>
                  </Field>
                  <Field
                    label={
                      form.isEdit ? 'รหัสผ่านใหม่ (เว้นว่าง = ไม่เปลี่ยน)' : 'รหัสผ่าน'
                    }
                  >
                    <Input
                      type="text"
                      value={form.pass}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, pass: e.target.value }))
                      }
                      placeholder={form.isEdit ? 'ไม่เปลี่ยนถ้าเว้นว่าง' : ''}
                    />
                  </Field>
                </FormGrid>
              </TabsContent>

              <TabsContent value="img" className="space-y-3 pt-2">
                <ImagePanel
                  idwkctr={form.idwkctr}
                  isEdit={form.isEdit}
                  ver={imageVersion[form.idwkctr]}
                  pickRef={imageInputRef}
                  onPick={onPickImage}
                  uploading={imageMut.isPending}
                  onClear={() => {
                    if (
                      window.confirm(`ลบรูปของ ${form.idwkctr}?`)
                    ) {
                      deleteImageMut.mutate(form.idwkctr)
                    }
                  }}
                  clearing={deleteImageMut.isPending}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={upsertMut.isPending}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={upsertMut.isPending}>
                {upsertMut.isPending
                  ? 'กำลังบันทึก…'
                  : form.isEdit
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

function UserroleBadge({ role }: { role: PersonnelRole }) {
  const opt = USERROLE_OPTIONS.find((o) => o.value === role)
  const tone =
    role === 'admin'
      ? 'bg-rose-50 text-rose-700 ring-rose-200'
      : role === 'manager'
        ? 'bg-purple-50 text-purple-700 ring-purple-200'
        : role === 'technician'
          ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
          : 'bg-blue-50 text-blue-700 ring-blue-200'
  return (
    <span className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${tone}`}>
      {opt?.label.split(' — ')[0] ?? role}
    </span>
  )
}

function PersonnelRow({
  it,
  ver,
  workstatusInfo,
  onEdit,
  onDelete,
}: {
  it: PersonnelAdminItem
  ver?: number
  workstatusInfo?: {
    workstatus: string
    wkstatusdes: string
    wkstcolor: string | null
    isActive: boolean
  }
  onEdit: () => void
  onDelete: () => void
}) {
  const fullName = useMemo(() => {
    const parts = [it.titlewkctr ?? '', it.namewkctr ?? '', it.surnamewkctr ?? '']
      .map((p) => p.trim())
      .filter(Boolean)
    return parts.join(' ').trim() || '—'
  }, [it])
  return (
    <TableRow>
      <TableCell>
        {it.hasImage ? (
          <img
            src={personnelImageUrl(it.idwkctr, ver)}
            alt={it.idwkctr}
            className="h-10 w-10 rounded-full object-cover ring-1 ring-zinc-200"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
            <ImageIcon className="size-4" />
          </div>
        )}
      </TableCell>
      <TableCell className="font-mono text-xs">{it.idwkctr}</TableCell>
      <TableCell>{fullName}</TableCell>
      <TableCell className="tabular-nums">{it.wkctr}</TableCell>
      <TableCell className="text-sm">{it.position ?? '—'}</TableCell>
      <TableCell className="text-sm">{it.department ?? '—'}</TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <UserroleBadge role={it.userrole} />
          <span className="text-[11px] text-zinc-500">UserST: {it.userst}</span>
        </div>
      </TableCell>
      <TableCell>
        <WorkstatusBadge code={it.workstatus} info={workstatusInfo} />
      </TableCell>
      <TableCell className="text-right">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onEdit}
          className="mr-2"
        >
          <Pencil className="mr-1 size-3.5" /> แก้ไข
        </Button>
        <Button type="button" size="sm" variant="destructive" onClick={onDelete}>
          <Trash2 className="mr-1 size-3.5" /> ลบ
        </Button>
      </TableCell>
    </TableRow>
  )
}

/**
 * Badge สีของ workstatus — ใช้สีจาก tbwkctrstatus.wkstcolor (เทียบ tbwkstatus.wkstcolor)
 * - ถ้า workstatus ของ row ไม่อยู่ใน lookup (data เก่าก่อน 039) แสดงเป็น outline สีเทา
 * - ถ้า workstatus เป็น null/ว่าง แสดง "—" + tooltip
 */
function WorkstatusBadge({
  code,
  info,
}: {
  code: string | null
  info?: {
    workstatus: string
    wkstatusdes: string
    wkstcolor: string | null
    isActive: boolean
  }
}) {
  if (!code) {
    return (
      <span className="text-xs text-zinc-400" title="ยังไม่กำหนดสถานะ">
        —
      </span>
    )
  }
  if (!info) {
    return (
      <Badge variant="outline" className="font-mono text-[10px]" title="ไม่อยู่ใน tbwkctrstatus">
        {code}
      </Badge>
    )
  }
  const color = info.wkstcolor ?? '#71717a'
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: `${color}1a`, /* 10% alpha */
        color,
        boxShadow: `inset 0 0 0 1px ${color}66`,
      }}
      title={`${info.workstatus} — ${info.wkstatusdes}${info.isActive ? '' : ' (ไม่ใช้งาน)'}`}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {info.wkstatusdes}
    </span>
  )
}

function ImagePanel({
  idwkctr,
  isEdit,
  ver,
  pickRef,
  onPick,
  uploading,
  onClear,
  clearing,
}: {
  idwkctr: string
  isEdit: boolean
  ver?: number
  pickRef: React.RefObject<HTMLInputElement | null>
  onPick: (e: ChangeEvent<HTMLInputElement>) => void
  uploading: boolean
  onClear: () => void
  clearing: boolean
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="text-sm font-medium text-zinc-800">รูปประจำตัว</div>
      <p className="mt-1 text-xs text-zinc-500">
        ระบบจะรับภาพประเภทใดก็ได้ แล้ว <b>แปลงเป็น WebP</b> + ย่อกว้างสูงสุด 600px
        ก่อนเก็บลง DB (`imgmember_data` BYTEA) เพื่อประหยัด storage
      </p>
      <div className="mt-3 flex items-start gap-4">
        {idwkctr ? (
          <img
            src={personnelImageUrl(idwkctr, ver ?? 'noimg')}
            alt={idwkctr}
            className="h-32 w-32 rounded-md object-cover ring-1 ring-zinc-200"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="flex h-32 w-32 items-center justify-center rounded-md bg-zinc-200 text-zinc-500">
            <ImageIcon className="size-8" />
          </div>
        )}
        <div className="flex-1 space-y-2">
          {!isEdit ? (
            <div className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              บันทึกข้อมูลครั้งแรกก่อน แล้วจึงอัปโหลดรูปได้
            </div>
          ) : null}
          <input
            ref={pickRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPick}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!isEdit || uploading}
              onClick={() => pickRef.current?.click()}
            >
              <Upload className="mr-1 size-4" />
              {uploading ? 'กำลังอัปโหลด…' : 'เปลี่ยนรูป (→ WebP)'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={!isEdit || clearing}
              onClick={onClear}
            >
              <Trash2 className="mr-1 size-4" /> ลบรูป
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ImportResultBlock({ data }: { data: PersonnelImportResponse }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-sm font-medium text-zinc-800">
          ผลการนำเข้า: {data.fileName}
        </div>
        <Badge variant="outline">total: {data.totalRows}</Badge>
        <Badge variant="secondary">inserted: {data.inserted}</Badge>
        <Badge variant="secondary">updated: {data.updated}</Badge>
        <Badge variant={data.skipped > 0 ? 'destructive' : 'outline'}>
          skipped: {data.skipped}
        </Badge>
        <Badge variant={data.errors > 0 ? 'destructive' : 'outline'}>
          errors: {data.errors}
        </Badge>
      </div>
      {data.rows.length > 0 ? (
        <div className="mt-3 overflow-hidden rounded-lg border border-zinc-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Row</TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead>idwkctr</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((r) => (
                <TableRow key={`${r.rowNo}-${r.idwkctr}`}>
                  <TableCell className="text-center tabular-nums">
                    {r.rowNo}
                  </TableCell>
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
                  <TableCell className="font-mono text-xs">{r.idwkctr}</TableCell>
                  <TableCell className="text-xs text-zinc-600">
                    {r.message ?? ''}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </div>
  )
}

function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>
}

function Field({
  label,
  required,
  children,
}: {
  label: React.ReactNode
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-zinc-600">
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </Label>
      {children}
    </div>
  )
}

/**
 * Native <select> ดึงรายชื่อจาก master data — เทียบ legacy `personel_form_tab2.php`
 * - แสดง placeholder "—" เมื่อยังไม่เลือก
 * - ถ้า value ปัจจุบันไม่ match กับ options (เช่น import เข้ามาด้วย id เก่า) จะ insert option fallback
 *   เพื่อไม่ทำให้ค่าหายตอน edit
 */
function LookupSelect({
  value,
  options,
  loading,
  onChange,
  placeholder = '— เลือก —',
}: {
  value: string
  options: PersonnelLookupOption[] | undefined
  loading: boolean
  onChange: (next: string) => void
  placeholder?: string
}) {
  const list = options ?? []
  const hasCurrent = value === '' || list.some((o) => o.value === value)
  return (
    <select
      value={value}
      disabled={loading}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option value="">{loading ? 'กำลังโหลด…' : placeholder}</option>
      {!hasCurrent ? (
        <option value={value}>{value} (ไม่มีใน master data)</option>
      ) : null}
      {list.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
