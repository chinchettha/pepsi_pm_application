/**
 * Admin CRUD ของ `tbworkcenter` — เทียบ PHP `M_personel.php` + `_form` + `_imports`
 * - ตารางผู้ใช้ทั้งหมด (search) + ปุ่ม Import Excel + ปุ่มเพิ่มข้อมูล
 * - Modal create/edit แบบ 2 แท็บ (ข้อมูลส่วนตัว / ข้อมูลงาน) — แท็บ 3 (รหัสผ่าน) รวมในฟอร์มเดียว
 * - Upload `imgmember`: รับภาพอะไรก็ได้ → backend แปลงเป็น **WebP** (resize 600px) เก็บลง `imgmember_data` BYTEA
 *   ใช้ `<img src=/api/v1/personnel/:idwkctr/image>` (ส่ง cookie auth อัตโนมัติ)
 * - Excel import: skip 2 rows แรก (เทียบ PHP `$n > 2`) + แสดงผลทีละแถว
 */
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { PersonnelAdminPhotoGoLiveBanner } from '@/features/admin/users/PersonnelAdminPhotoGoLiveBanner'
import { ConfirmPhraseDialog } from '@/components/admin/ConfirmPhraseDialog'
import { PersonnelAvatar } from '@/components/personnel/PersonnelAvatar'
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
import { EmptyState } from '@/components/ui/empty-state'
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
import {
  applyImpersonationSession,
  getStoredAuthUser,
  refreshAuthSession,
} from '@/features/auth/login-api'
import {
  bulkAdminUserrole,
  fetchAdminMembersList,
  fetchAdminUsersList,
  impersonateAdminUser,
  lockAdminUser,
  resetAdminUserPassword,
  unlockAdminUser,
} from '@/lib/admin-users-api'
import { useAnyPermission, usePermission } from '@/lib/use-permission'
import type {
  AdminMemberItem,
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
  postPersonnelAdminImage,
  postPersonnelAdminImport,
  upsertPersonnelAdmin,
  type PersonnelLookupOption,
} from '@/lib/api-public'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  ImageIcon,
  KeyRound,
  Lock,
  LogIn,
  Pencil,
  RefreshCcw,
  Trash2,
  Unlock,
  Upload,
  UserPlus,
} from 'lucide-react'
import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
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
  hasMemberImage: boolean
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
  hasMemberImage: false,
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
    hasMemberImage: Boolean(it.hasImage),
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

export type PersonnelAdminPageProps = {
  /** `admin` = /admin/users (RBAC admin.users.*); `personnel` = legacy /personnel/admin */
  variant?: 'personnel' | 'admin'
}

type AdminDestructiveConfirm = {
  phrase: string
  title: string
  description: string
  run: () => void | Promise<void>
}

export function PersonnelAdminPage({ variant = 'personnel' }: PersonnelAdminPageProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const qc = useQueryClient()
  const authUser = getStoredAuthUser()
  const isLegacyAdmin = authUser?.userst === 'A'
  const canReadUsers = useAnyPermission([
    'admin.users.read',
    'admin.users.write',
    'personnel.write',
  ])
  const canWriteUsers = useAnyPermission(['admin.users.write', 'personnel.write'])
  const canImpersonate = usePermission('admin.users.impersonate')
  const isAdmin = variant === 'admin' ? canReadUsers : isLegacyAdmin
  const showAdminActions = variant === 'admin' && canWriteUsers
  const [accountTab, setAccountTab] = useState<'workcenter' | 'member'>('workcenter')
  const [adminConfirm, setAdminConfirm] = useState<AdminDestructiveConfirm | null>(null)
  const [adminConfirmLoading, setAdminConfirmLoading] = useState(false)

  useEffect(() => {
    if (!isAdmin) {
      toast.error(variant === 'admin' ? 'ไม่มีสิทธิ์ admin.users' : 'Admin only')
      navigate(variant === 'admin' ? '/' : '/personnel', { replace: true })
    }
  }, [isAdmin, navigate, variant])

  useEffect(() => {
    const initialQ = searchParams.get('q')?.trim()
    if (initialQ) {
      setQ(initialQ)
      setQInput(initialQ)
    }
    if (searchParams.get('photo') === 'missing') {
      setPhotoFilter('missing')
    }
  }, [searchParams])

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
  const [roleFilter, setRoleFilter] = useState<PersonnelRole | ''>('')
  const [photoFilter, setPhotoFilter] = useState<'all' | 'missing'>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [bulkRole, setBulkRole] = useState<PersonnelRole>('planner')
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false)

  const listQ = useQuery({
    queryKey: ['personnel', 'admin', 'list', variant, q, statusFilter, roleFilter],
    queryFn: () => {
      const params = {
        q: q || undefined,
        status: statusFilter,
        limit: 500,
        ...(variant === 'admin' && roleFilter ? { userrole: roleFilter } : {}),
      }
      return variant === 'admin'
        ? fetchAdminUsersList(params)
        : fetchPersonnelAdminList(params)
    },
    enabled: isAdmin && accountTab === 'workcenter',
    staleTime: 15_000,
    placeholderData: keepPreviousData,
  })

  const membersQ = useQuery({
    queryKey: ['admin', 'users', 'members'],
    queryFn: fetchAdminMembersList,
    enabled: isAdmin && variant === 'admin' && accountTab === 'member',
    staleTime: 30_000,
    placeholderData: keepPreviousData,
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

  const items = useMemo(() => {
    const raw = listQ.data?.items ?? []
    if (photoFilter === 'missing') return raw.filter((it) => !it.hasImage)
    return raw
  }, [listQ.data?.items, photoFilter])
  const totalRows = listQ.data?.totalRows ?? 0
  const selectedCount = selectedIds.size
  const allOnPageSelected =
    items.length > 0 && items.every((it) => selectedIds.has(it.idwkctr))

  const toggleSelectAll = () => {
    if (allOnPageSelected) {
      setSelectedIds(new Set())
      return
    }
    setSelectedIds(new Set(items.map((it) => it.idwkctr)))
  }

  const toggleSelectRow = (idwkctr: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(idwkctr)) next.delete(idwkctr)
      else next.add(idwkctr)
      return next
    })
  }

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
      setForm((s) =>
        s.idwkctr === vars.idwkctr ? { ...s, hasMemberImage: true } : s,
      )
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
      setForm((s) =>
        s.idwkctr === idwkctr ? { ...s, hasMemberImage: false } : s,
      )
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
      <div className="px-6 py-8 text-caption">
        Admin only — กำลังย้อนกลับ…
      </div>
    )
  }

  const headerActions = (
    <>
      <Badge variant="secondary">รวม {totalRows} คน</Badge>
      {variant === 'admin' ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="admin-toolbar-btn"
          onClick={() => {
            if (accountTab === 'member') void membersQ.refetch()
            else void listQ.refetch()
          }}
          disabled={accountTab === 'member' ? membersQ.isFetching : listQ.isFetching}
        >
          <RefreshCcw
            className={`mr-1 size-3.5 ${(accountTab === 'member' ? membersQ.isFetching : listQ.isFetching) ? 'animate-spin' : ''}`}
            aria-hidden
          />
          รีเฟรช
        </Button>
      ) : null}
      {variant === 'admin' ? (
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/settings">ตั้งค่าระบบ</Link>
        </Button>
      ) : (
        <Button asChild variant="outline" size="sm">
          <Link to="/personnel">กลับ Dashboard</Link>
        </Button>
      )}
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
    </>
  )

  return (
    <div>
      {variant === 'admin' ? (
        <AdminPageHeader
          title="จัดการผู้ใช้"
          description="รูปช่าง thumbnail · เลือกหลายแถวเปลี่ยนบทบาท (bulk) · reset / lock / impersonate"
        >
          {headerActions}
        </AdminPageHeader>
      ) : (
        <PageHeader
          title="จัดการบุคลากร (Admin)"
          description="เทียบ M_personel.php / M_personel_form.php / M_personel_imports.php — ตาราง tbworkcenter ทั้งหมด"
        >
          {headerActions}
        </PageHeader>
      )}

      <div
        className={
          variant === 'admin' ? 'admin-page-content space-y-4' : 'app-page-content space-y-4'
        }
      >
        {variant === 'admin' ? (
          <Tabs
            value={accountTab}
            onValueChange={(v) => setAccountTab(v as 'workcenter' | 'member')}
          >
            <TabsList>
              <TabsTrigger value="workcenter">Work center (HR)</TabsTrigger>
              <TabsTrigger value="member">สมาชิก (Member)</TabsTrigger>
            </TabsList>
          </Tabs>
        ) : null}

        {(variant !== 'admin' || accountTab === 'workcenter') && (
        <>
        {variant === 'admin' && accountTab === 'workcenter' ? (
          <PersonnelAdminPhotoGoLiveBanner
            canWrite={showAdminActions}
            onShowMissingPhotos={() => {
              setStatusFilter('active')
              setPhotoFilter('missing')
            }}
          />
        ) : null}
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
            <Label className="text-xs text-app-muted">สถานะใช้งาน</Label>
            {/* Quick filter chips — เทียบ PersonnelConfirmPage pattern */}
            <div className="flex flex-wrap gap-1">
              {(
                [
                  { value: 'active', label: 'ใช้งาน', tone: 'emerald' },
                  { value: 'inactive', label: 'ไม่ใช้งาน', tone: 'neutral' },
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
              <Button
                type="button"
                size="sm"
                variant={photoFilter === 'missing' ? 'default' : 'outline'}
                className={photoFilter === 'missing' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                onClick={() => setPhotoFilter((p) => (p === 'missing' ? 'all' : 'missing'))}
              >
                ไม่มีรูป
              </Button>
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
              className="h-9 rounded-button border border-app bg-[var(--app-surface)] px-2 text-body-sm focus-app-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              title="เลือกสถานะรายตัวสำหรับ filter"
            >
              <option value="">— เจาะจง code —</option>
              {workstatusOptions.map((o) => (
                <option key={o.workstatus} value={o.workstatus}>
                  {o.workstatus} — {o.wkstatusdes}
                </option>
              ))}
            </select>
            {variant === 'admin' ? (
              <>
                <Label className="text-xs text-app-muted">บทบาท (userrole)</Label>
                <select
                  value={roleFilter}
                  onChange={(e) =>
                    setRoleFilter((e.target.value || '') as PersonnelRole | '')
                  }
                  className="h-9 rounded-button border border-app bg-[var(--app-surface)] px-2 text-body-sm"
                  title="กรองตาม userrole"
                >
                  <option value="">ทุกบทบาท</option>
                  {USERROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </>
            ) : null}
          </div>
        </div>

        {variant === 'admin' && showAdminActions && selectedCount > 0 ? (
          <div className="flex flex-wrap items-center gap-2 rounded-card border border-[var(--admin-primary)]/25 bg-[var(--admin-surface)] px-3 py-2">
            <span className="text-body-sm font-medium text-[var(--admin-text)]">
              เลือก {selectedCount} แถว
            </span>
            <select
              value={bulkRole}
              onChange={(e) => setBulkRole(e.target.value as PersonnelRole)}
              className="h-9 rounded-button border border-app bg-[var(--app-surface)] px-2 text-body-sm"
            >
              {USERROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Button type="button" size="sm" onClick={() => setBulkConfirmOpen(true)}>
              เปลี่ยนบทบาทหลายแถว
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setSelectedIds(new Set())}
            >
              ยกเลิกการเลือก
            </Button>
          </div>
        ) : null}

        {importResult ? (
          <ImportResultBlock data={importResult} />
        ) : null}

        <div className="overflow-hidden app-table-shell">
          {listQ.isLoading && !listQ.data ? (
            <div className="p-4">
              <Skeleton className="h-48 w-full rounded" />
            </div>
          ) : listQ.isError ? (
            <EmptyState
              icon={AlertCircle}
              className="m-4"
              title="โหลดรายชื่อไม่สำเร็จ"
              description={
                listQ.error instanceof Error ? listQ.error.message : String(listQ.error)
              }
              action={{ label: 'ลองใหม่', onClick: () => void listQ.refetch() }}
            />
          ) : (
            <Table embedded={variant === 'admin'} stickyHeader={variant === 'admin'} zebra={variant === 'admin'}>
              <TableHeader>
                <TableRow>
                  {variant === 'admin' && showAdminActions ? (
                    <TableHead className="w-10">
                      <input
                        type="checkbox"
                        aria-label="เลือกทั้งหมดในหน้านี้"
                        checked={allOnPageSelected}
                        onChange={toggleSelectAll}
                        className="size-4 rounded border-app"
                      />
                    </TableHead>
                  ) : null}
                  <TableHead className="w-[4.5rem]">รูป</TableHead>
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
                      colSpan={variant === 'admin' && showAdminActions ? 10 : 9}
                      className="py-8 text-center text-caption"
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
                      showBulkSelect={variant === 'admin' && showAdminActions}
                      photoSize={variant === 'admin' ? 'md' : 'sm'}
                      selected={selectedIds.has(it.idwkctr)}
                      onToggleSelect={() => toggleSelectRow(it.idwkctr)}
                      showAdminActions={showAdminActions}
                      canImpersonate={canImpersonate}
                      onEdit={() => openEdit(it)}
                      onDelete={() => {
                        if (showAdminActions) {
                          setAdminConfirm({
                            phrase: it.idwkctr,
                            title: `ลบ ${it.idwkctr}`,
                            description: `ลบบันทึก ${it.wkctr} — ไม่สามารถย้อนกลับได้`,
                            run: () => deleteMut.mutate(it.idwkctr),
                          })
                          return
                        }
                        if (window.confirm(`Confirm delete ${it.idwkctr}?`)) {
                          deleteMut.mutate(it.idwkctr)
                        }
                      }}
                      onResetPassword={() => {
                        const run = async () => {
                          const res = await resetAdminUserPassword(it.idwkctr, 'workcenter')
                          toast.success(`รหัสชั่วคราว: ${res.temporaryPassword}`, {
                            duration: 20_000,
                          })
                        }
                        if (showAdminActions) {
                          setAdminConfirm({
                            phrase: it.idwkctr,
                            title: 'รีเซ็ตรหัสผ่าน',
                            description: `${it.idwkctr} (${it.wkctr})`,
                            run,
                          })
                          return
                        }
                        void (async () => {
                          if (!window.confirm(`รีเซ็ตรหัสผ่านของ ${it.idwkctr}?`)) return
                          try {
                            await run()
                          } catch (e) {
                            toast.error(e instanceof Error ? e.message : 'รีเซ็ตไม่สำเร็จ')
                          }
                        })()
                      }}
                      onLock={() => {
                        const run = async () => {
                          await lockAdminUser(it.idwkctr, 'workcenter')
                          toast.success(`ล็อก ${it.idwkctr} แล้ว`)
                          void listQ.refetch()
                        }
                        if (showAdminActions) {
                          setAdminConfirm({
                            phrase: it.idwkctr,
                            title: `ล็อก ${it.idwkctr}`,
                            description: 'ผู้ใช้จะไม่สามารถเข้าสู่ระบบได้จนกว่าจะปลดล็อก',
                            run,
                          })
                          return
                        }
                        void run().catch((e: unknown) =>
                          toast.error(e instanceof Error ? e.message : 'ล็อกไม่สำเร็จ'),
                        )
                      }}
                      onUnlock={async () => {
                        try {
                          await unlockAdminUser(it.idwkctr, 'workcenter')
                          toast.success(`ปลดล็อก ${it.idwkctr} แล้ว`)
                          void listQ.refetch()
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : 'ปลดล็อกไม่สำเร็จ')
                        }
                      }}
                      onImpersonate={() => {
                        const run = async () => {
                          const res = await impersonateAdminUser(it.idwkctr, 'workcenter')
                          applyImpersonationSession(res)
                          await refreshAuthSession()
                          toast.success(`เข้าสู่ระบบเป็น ${res.user.username}`)
                          navigate('/')
                        }
                        if (showAdminActions) {
                          setAdminConfirm({
                            phrase: it.idwkctr,
                            title: 'สวมสิทธิ์ผู้ใช้',
                            description: `สวมสิทธิ์เป็น ${it.idwkctr} (${it.wkctr}) — ออกจากบัญชี admin ชั่วคราว`,
                            run,
                          })
                          return
                        }
                        void (async () => {
                          if (
                            !window.confirm(
                              `สวมสิทธิ์เป็น ${it.idwkctr} (${it.wkctr})? จะออกจากบัญชี admin ชั่วคราว`,
                            )
                          ) {
                            return
                          }
                          try {
                            await run()
                          } catch (e) {
                            toast.error(e instanceof Error ? e.message : 'สวมสิทธิ์ไม่สำเร็จ')
                          }
                        })()
                      }}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
        </>
        )}

        {variant === 'admin' && accountTab === 'member' ? (
          <div className="overflow-hidden app-table-shell">
            {membersQ.isLoading && !membersQ.data ? (
              <div className="p-4">
                <Skeleton className="h-48 w-full rounded" />
              </div>
            ) : membersQ.isError ? (
              <EmptyState
                icon={AlertCircle}
                className="m-4"
                title="โหลดสมาชิกไม่สำเร็จ"
                description={(membersQ.error as Error).message}
                action={{ label: 'ลองใหม่', onClick: () => void membersQ.refetch() }}
              />
            ) : (
              <Table embedded stickyHeader zebra>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>ชื่อ</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(membersQ.data ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-caption">
                        ไม่มีสมาชิก
                      </TableCell>
                    </TableRow>
                  ) : (
                    (membersQ.data ?? []).map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-mono text-xs">{m.id}</TableCell>
                        <TableCell>{m.username}</TableCell>
                        <TableCell>{m.fullname ?? '—'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-1">
                            <span>{m.status ?? '—'}</span>
                            {m.passMustChange ? (
                              <Badge variant="outline" className="border-amber-400 text-amber-800">
                                ต้องเปลี่ยนรหัส
                              </Badge>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {showAdminActions ? (
                            <MemberAdminActions
                              member={m}
                              canImpersonate={canImpersonate}
                              onDone={() => void membersQ.refetch()}
                              onImpersonate={() => navigate('/')}
                              onRequestConfirm={setAdminConfirm}
                            />
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        ) : null}
      </div>

      {adminConfirm ? (
        <ConfirmPhraseDialog
          open
          onOpenChange={(open) => !open && setAdminConfirm(null)}
          title={adminConfirm.title}
          description={adminConfirm.description}
          phrase={adminConfirm.phrase}
          loading={adminConfirmLoading}
          onConfirm={async () => {
            setAdminConfirmLoading(true)
            try {
              await adminConfirm.run()
              setAdminConfirm(null)
            } catch (e) {
              toast.error(e instanceof Error ? e.message : 'ดำเนินการไม่สำเร็จ')
            } finally {
              setAdminConfirmLoading(false)
            }
          }}
        />
      ) : null}

      {bulkConfirmOpen ? (
        <ConfirmPhraseDialog
          open
          onOpenChange={(open) => !open && setBulkConfirmOpen(false)}
          title="เปลี่ยนบทบาทหลายแถว"
          description={`ตั้ง userrole เป็น "${bulkRole}" สำหรับ ${selectedCount} รายการ`}
          phrase={String(selectedCount)}
          phraseLabel="พิมพ์จำนวนแถวที่เลือกเพื่อยืนยัน"
          confirmLabel="เปลี่ยนบทบาท"
          loading={adminConfirmLoading}
          onConfirm={async () => {
            setAdminConfirmLoading(true)
            try {
              const res = await bulkAdminUserrole([...selectedIds], bulkRole)
              toast.success(`อัปเดตบทบาท ${res.updated} แถว`)
              setSelectedIds(new Set())
              setBulkConfirmOpen(false)
              void listQ.refetch()
            } catch (e) {
              toast.error(e instanceof Error ? e.message : 'เปลี่ยนบทบาทไม่สำเร็จ')
            } finally {
              setAdminConfirmLoading(false)
            }
          }}
        />
      ) : null}

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
                      className="flex h-9 w-full rounded-button border border-app bg-[var(--app-surface)] px-3 py-1 text-body-sm shadow-sm"
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
                    <p className="mt-1 text-xs text-app-muted">
                      ใช้กับเมนู legacy `menuright` เช่น A:U:W
                    </p>
                  </Field>
                  <Field label="บทบาท Dashboard/RBAC (userrole)">
                    <select
                      className="flex h-9 w-full rounded-button border border-app bg-[var(--app-surface)] px-3 py-1 text-body-sm shadow-sm"
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
                    <p className="mt-1 text-xs text-app-muted">
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
                  hasImage={form.hasMemberImage || Boolean(imageVersion[form.idwkctr])}
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
    <span className={`inline-flex w-fit rounded-full px-2 py-1 text-xs font-medium ring-1 ${tone}`}>
      {opt?.label.split(' — ')[0] ?? role}
    </span>
  )
}

function MemberAdminActions({
  member,
  canImpersonate,
  onDone,
  onImpersonate,
  onRequestConfirm,
}: {
  member: AdminMemberItem
  canImpersonate: boolean
  onDone: () => void
  onImpersonate: () => void
  onRequestConfirm?: (req: AdminDestructiveConfirm) => void
}) {
  const id = String(member.id)
  const phrase = member.username
  return (
    <div className="flex flex-wrap justify-end gap-1">
      <Button
        type="button"
        size="sm"
        variant="outline"
        title="Reset password"
        onClick={() => {
          const run = async () => {
            const res = await resetAdminUserPassword(id, 'member')
            toast.success(`รหัสชั่วคราว: ${res.temporaryPassword}`, { duration: 20_000 })
          }
          if (onRequestConfirm) {
            onRequestConfirm({
              phrase,
              title: 'รีเซ็ตรหัสผ่าน',
              description: member.username,
              run,
            })
            return
          }
          void (async () => {
            if (!window.confirm(`รีเซ็ตรหัสผ่าน ${member.username}?`)) return
            try {
              await run()
            } catch (e) {
              toast.error(e instanceof Error ? e.message : 'รีเซ็ตไม่สำเร็จ')
            }
          })()
        }}
      >
        <KeyRound className="size-3.5" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => {
          const run = async () => {
            await lockAdminUser(id, 'member')
            toast.success('ล็อกแล้ว')
            onDone()
          }
          if (onRequestConfirm) {
            onRequestConfirm({
              phrase,
              title: `ล็อก ${member.username}`,
              description: 'สมาชิกจะไม่สามารถเข้าสู่ระบบได้',
              run,
            })
            return
          }
          void run().catch((e: unknown) =>
            toast.error(e instanceof Error ? e.message : 'ล็อกไม่สำเร็จ'),
          )
        }}
      >
        <Lock className="size-3.5" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={async () => {
          try {
            await unlockAdminUser(id, 'member')
            toast.success('ปลดล็อกแล้ว')
            onDone()
          } catch (e) {
            toast.error(e instanceof Error ? e.message : 'ปลดล็อกไม่สำเร็จ')
          }
        }}
      >
        <Unlock className="size-3.5" />
      </Button>
      {canImpersonate ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            const run = async () => {
              const res = await impersonateAdminUser(id, 'member')
              applyImpersonationSession(res)
              await refreshAuthSession()
              toast.success(`เข้าสู่ระบบเป็น ${res.user.username}`)
              onImpersonate()
            }
            if (onRequestConfirm) {
              onRequestConfirm({
                phrase,
                title: 'สวมสิทธิ์สมาชิก',
                description: `สวมสิทธิ์เป็น ${member.username}`,
                run,
              })
              return
            }
            void (async () => {
              if (!window.confirm(`สวมสิทธิ์เป็น ${member.username}?`)) return
              try {
                await run()
              } catch (e) {
                toast.error(e instanceof Error ? e.message : 'สวมสิทธิ์ไม่สำเร็จ')
              }
            })()
          }}
        >
          <LogIn className="size-3.5" />
        </Button>
      ) : null}
    </div>
  )
}

function PersonnelRow({
  it,
  ver,
  workstatusInfo,
  showBulkSelect,
  photoSize = 'sm',
  selected,
  onToggleSelect,
  showAdminActions,
  canImpersonate,
  onEdit,
  onDelete,
  onResetPassword,
  onLock,
  onUnlock,
  onImpersonate,
}: {
  it: PersonnelAdminItem
  ver?: number
  workstatusInfo?: {
    workstatus: string
    wkstatusdes: string
    wkstcolor: string | null
    isActive: boolean
  }
  showBulkSelect?: boolean
  photoSize?: 'sm' | 'md'
  selected?: boolean
  onToggleSelect?: () => void
  showAdminActions?: boolean
  canImpersonate?: boolean
  onEdit: () => void
  onDelete: () => void
  onResetPassword?: () => void
  onLock?: () => void
  onUnlock?: () => void
  onImpersonate?: () => void
}) {
  const fullName = useMemo(() => {
    const parts = [it.titlewkctr ?? '', it.namewkctr ?? '', it.surnamewkctr ?? '']
      .map((p) => p.trim())
      .filter(Boolean)
    return parts.join(' ').trim() || '—'
  }, [it])
  return (
    <TableRow>
      {showBulkSelect ? (
        <TableCell>
          <input
            type="checkbox"
            aria-label={`เลือก ${it.idwkctr}`}
            checked={selected}
            onChange={onToggleSelect}
            className="size-4 rounded border-app"
          />
        </TableCell>
      ) : null}
      <TableCell>
        <PersonnelAvatar
          idwkctr={it.idwkctr}
          displayName={fullName !== '—' ? fullName : it.idwkctr}
          hasImage={it.hasImage}
          ver={ver}
          size={photoSize === 'md' ? 'md' : 'sm'}
        />
      </TableCell>
      <TableCell className="font-mono text-xs">{it.idwkctr}</TableCell>
      <TableCell>{fullName}</TableCell>
      <TableCell className="tabular-nums">{it.wkctr}</TableCell>
      <TableCell className="text-body-sm">{it.position ?? '—'}</TableCell>
      <TableCell className="text-body-sm">{it.department ?? '—'}</TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <UserroleBadge role={it.userrole} />
          <span className="text-caption">UserST: {it.userst}</span>
          {it.passMustChange ? (
            <Badge variant="outline" className="w-fit border-amber-400 text-amber-800">
              ต้องเปลี่ยนรหัส
            </Badge>
          ) : null}
        </div>
      </TableCell>
      <TableCell>
        <WorkstatusBadge code={it.workstatus} info={workstatusInfo} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex flex-wrap justify-end gap-1">
          {showAdminActions ? (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                title="Reset password"
                onClick={onResetPassword}
              >
                <KeyRound className="size-3.5" />
              </Button>
              <Button type="button" size="sm" variant="outline" title="Lock" onClick={onLock}>
                <Lock className="size-3.5" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                title="Unlock"
                onClick={onUnlock}
              >
                <Unlock className="size-3.5" />
              </Button>
              {canImpersonate ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  title="Impersonate"
                  onClick={onImpersonate}
                >
                  <LogIn className="size-3.5" />
                </Button>
              ) : null}
            </>
          ) : null}
          <Button type="button" size="sm" variant="outline" onClick={onEdit}>
            <Pencil className="mr-1 size-3.5" /> แก้ไข
          </Button>
          <Button type="button" size="sm" variant="destructive" onClick={onDelete}>
            <Trash2 className="mr-1 size-3.5" /> ลบ
          </Button>
        </div>
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
      <span className="text-xs text-app-muted" title="ยังไม่กำหนดสถานะ">
        —
      </span>
    )
  }
  if (!info) {
    return (
      <Badge variant="outline" className="font-mono text-badge" title="ไม่อยู่ใน tbwkctrstatus">
        {code}
      </Badge>
    )
  }
  const color = info.wkstcolor ?? '#71717a'
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium"
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
  hasImage,
  ver,
  pickRef,
  onPick,
  uploading,
  onClear,
  clearing,
}: {
  idwkctr: string
  isEdit: boolean
  hasImage: boolean
  ver?: number
  pickRef: React.RefObject<HTMLInputElement | null>
  onPick: (e: ChangeEvent<HTMLInputElement>) => void
  uploading: boolean
  onClear: () => void
  clearing: boolean
}) {
  return (
    <div className="rounded-card border border-app bg-app-subtle p-4">
      <div className="text-body-sm font-medium text-app">รูปประจำตัว</div>
      <p className="mt-1 text-xs text-app-muted">
        ระบบจะรับภาพประเภทใดก็ได้ แล้ว <b>แปลงเป็น WebP</b> + ย่อกว้างสูงสุด 600px
        ก่อนเก็บลง DB (`imgmember_data` BYTEA) เพื่อประหยัด storage
      </p>
      <div className="mt-3 flex items-start gap-4">
        {idwkctr ? (
          <PersonnelAvatar
            idwkctr={idwkctr}
            displayName={idwkctr}
            hasImage={hasImage}
            ver={ver}
            size="lg"
            className="rounded-button"
          />
        ) : (
          <div className="flex size-24 items-center justify-center rounded-button bg-app-muted text-app-muted">
            <ImageIcon className="size-8" aria-hidden />
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
    <div className="app-card app-card-pad-compact">
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-body-sm font-medium text-app">
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
        <div className="mt-3 app-table-shell overflow-hidden">
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
                  <TableCell className="text-xs text-app-muted">
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
      <Label className="text-xs text-app-muted">
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
      className="flex h-10 w-full rounded-button border border-app bg-[var(--app-surface)] px-3 py-2 text-body-sm text-app focus-app-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
