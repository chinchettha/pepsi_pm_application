import { ConfirmPhraseDialog } from '@/components/admin/ConfirmPhraseDialog'
import { AdminAccessDenied } from '@/components/admin/AdminAccessDenied'
import { AdminPageRoot } from '@/components/admin/AdminPageRoot'
import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import type { AdminSettings, PatchAdminSettingsBody, SettingsResetSection } from '@/api/schemas'
import {
  fetchAdminSecretSettings,
  fetchAdminSettings,
  patchAdminSettings,
  resetAdminSettings,
  resetAdminSettingsSection,
} from '@/lib/admin-settings-api'
import { idbClear } from '@/lib/idb-cache'
import { usePermission } from '@/lib/use-permission'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BoardKioskCard } from '@/features/admin/settings/BoardKioskCard'
import { AlertCircle, Calendar, Flag, RefreshCcw, RotateCcw, Save, Settings2, ShieldAlert, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const selectClass =
  'h-10 min-w-[12rem] flex-1 rounded-button border border-app bg-[var(--app-surface)] px-3 text-body-sm leading-normal text-app focus-app-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'

/** แถว label + control — จัดกึ่งกลางแนวตั้งกับ dropdown */
const settingsFieldRowClass = 'flex flex-wrap items-center gap-x-4 gap-y-2'

const settingsFieldLabelClass =
  'w-full min-w-[10.5rem] max-w-[13rem] shrink-0 leading-normal sm:w-auto sm:text-right'

const TIMEZONES = [
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Jakarta',
  'Asia/Ho_Chi_Minh',
  'Asia/Tokyo',
  'UTC',
  'Europe/London',
  'America/New_York',
] as const

function invalidateSettingsCaches(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: ['admin', 'settings'] })
  void qc.invalidateQueries({ queryKey: ['settings', 'public'] })
}

function SectionResetButton({
  section,
  label,
  disabled,
  onReset,
}: {
  section: SettingsResetSection
  label: string
  disabled?: boolean
  onReset: (section: SettingsResetSection) => void
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className="text-app-muted"
      disabled={disabled}
      onClick={() => {
        if (!window.confirm(`คืนค่า${label}เป็นค่าเริ่มต้น?`)) return
        onReset(section)
      }}
    >
      <RotateCcw className="mr-1 size-3.5" aria-hidden />
      คืนค่ากลุ่มนี้
    </Button>
  )
}

function FlagToggle({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  disabled?: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-card border border-app p-3">
      <div>
        <p className="text-body-sm font-medium text-app">{label}</p>
        {description ? <p className="mt-1 text-xs text-app-muted">{description}</p> : null}
      </div>
      <Button
        type="button"
        size="sm"
        variant={checked ? 'default' : 'outline'}
        disabled={disabled}
        onClick={() => onChange(!checked)}
      >
        {checked ? 'เปิด' : 'ปิด'}
      </Button>
    </div>
  )
}

export function AdminSettingsPage() {
  const qc = useQueryClient()
  const canRead = usePermission('admin.settings.read')
  const canWrite = usePermission('admin.settings.write')

  const q = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: fetchAdminSettings,
    enabled: canRead || canWrite,
    placeholderData: keepPreviousData,
  })

  const secretsQ = useQuery({
    queryKey: ['admin', 'settings', 'secrets'],
    queryFn: fetchAdminSecretSettings,
    enabled: canRead || canWrite,
    placeholderData: keepPreviousData,
  })

  const [form, setForm] = useState<AdminSettings | null>(null)
  const [resetOpen, setResetOpen] = useState(false)
  const [clearCacheOpen, setClearCacheOpen] = useState(false)

  useEffect(() => {
    if (q.data) setForm(q.data)
  }, [q.data])

  const saveMut = useMutation({
    mutationFn: (body: PatchAdminSettingsBody) => patchAdminSettings(body),
    onSuccess: (data) => {
      setForm(data)
      invalidateSettingsCaches(qc)
      toast.success('บันทึกตั้งค่าระบบแล้ว')
    },
    onError: (e: Error) => toast.error(e.message || 'บันทึกไม่สำเร็จ'),
  })

  const resetMut = useMutation({
    mutationFn: resetAdminSettings,
    onSuccess: (data) => {
      setForm(data)
      invalidateSettingsCaches(qc)
      toast.success('คืนค่าตั้งค่าระบบเป็นค่าเริ่มต้นแล้ว')
    },
    onError: (e: Error) => toast.error(e.message || 'คืนค่าไม่สำเร็จ'),
  })

  const sectionResetMut = useMutation({
    mutationFn: resetAdminSettingsSection,
    onSuccess: (data) => {
      setForm(data)
      invalidateSettingsCaches(qc)
      toast.success('คืนค่ากลุ่มนี้แล้ว')
    },
    onError: (e: Error) => toast.error(e.message || 'คืนค่าไม่สำเร็จ'),
  })

  const clearCacheMut = useMutation({
    mutationFn: async () => {
      await idbClear()
    },
    onSuccess: () => {
      toast.success('ล้างแคช IndexedDB แล้ว')
    },
    onError: () => toast.error('ล้างแคชไม่สำเร็จ'),
  })

  const dirty =
    form &&
    q.data &&
    JSON.stringify(form) !== JSON.stringify(q.data)

  const onSave = () => {
    if (!form || !q.data) return
    const body: PatchAdminSettingsBody = {}
    const keys = [
      'locale',
      'timezone',
      'yearFormat',
      'dateFormat',
      'uploadMaxMb',
      'sessionTtlMin',
      'passwordMinLength',
      'maxLoginAttempts',
      'featureIndexeddbOffline',
      'featureDashboardCharts',
      'maintenanceEnabled',
      'maintenanceMessage',
    ] as const
    for (const key of keys) {
      if (form[key] !== q.data[key]) {
        ;(body as Record<string, unknown>)[key] = form[key]
      }
    }
    if (Object.keys(body).length === 0) {
      toast.message('ไม่มีการเปลี่ยนแปลง')
      return
    }
    saveMut.mutate(body)
  }

  if (!canRead && !canWrite) {
    return (
      <AdminPageRoot tourTarget="admin-settings">
        <AdminAccessDenied
          message={
            <>
              ไม่มีสิทธิ์เข้าถึงหน้านี้ (ต้องมี <code>admin.settings.read</code>)
            </>
          }
        />
      </AdminPageRoot>
    )
  }

  return (
    <AdminPageShell
      tourTarget="admin-settings"
      title="ตั้งค่าระบบ"
      description="Timezone, ปี พ.ศ./ค.ศ., ขีดจำกัดอัปโหลด, feature flags และโหมดบำรุงรักษา"
      contentClassName="space-y-6"
      headerActions={
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="admin-toolbar-btn"
            onClick={() => void q.refetch()}
            disabled={q.isFetching}
          >
            <RefreshCcw className={`mr-1 size-3.5 ${q.isFetching ? 'animate-spin' : ''}`} aria-hidden />
            รีเฟรช
          </Button>
          {canWrite ? (
            <>
              <Button
                type="button"
                variant="outline"
                className="admin-toolbar-btn"
                disabled={resetMut.isPending}
                onClick={() => setResetOpen(true)}
              >
                <RotateCcw className="mr-2 size-4" aria-hidden />
                คืนค่ามาตรฐาน
              </Button>
              <Button
                type="button"
                className="admin-toolbar-btn"
                disabled={!dirty || saveMut.isPending}
                onClick={onSave}
              >
                <Save className="mr-2 size-4" aria-hidden />
                บันทึก
              </Button>
            </>
          ) : null}
        </>
      }
    >
        {q.isLoading && !form ? (
          <Skeleton className="h-64 w-full rounded-card" />
        ) : q.isError ? (
          <EmptyState
            icon={AlertCircle}
            title="โหลดตั้งค่าไม่สำเร็จ"
            description={(q.error as Error).message}
            action={{ label: 'ลองใหม่', onClick: () => void q.refetch() }}
          />
        ) : form ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="admin-card lg:col-span-2">
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="size-5" aria-hidden />
                    Locale & วันที่
                  </CardTitle>
                  <CardDescription>Timezone และรูปแบบแสดงวันที่ (พ.ศ./ค.ศ.)</CardDescription>
                </div>
                {canWrite ? (
                  <SectionResetButton
                    section="locale"
                    label=" Locale & วันที่"
                    disabled={sectionResetMut.isPending}
                    onReset={(s) => sectionResetMut.mutate(s)}
                  />
                ) : null}
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className={settingsFieldRowClass}>
                  <Label htmlFor="locale" className={settingsFieldLabelClass}>
                    ภาษา (Locale)
                  </Label>
                  <select
                    id="locale"
                    className={selectClass}
                    disabled={!canWrite}
                    value={form.locale}
                    onChange={(e) =>
                      setForm({ ...form, locale: e.target.value as AdminSettings['locale'] })
                    }
                  >
                    <option value="th-TH">ไทย (th-TH)</option>
                    <option value="en-US">English (en-US)</option>
                  </select>
                </div>
                <div className={settingsFieldRowClass}>
                  <Label htmlFor="timezone" className={settingsFieldLabelClass}>
                    Timezone (IANA)
                  </Label>
                  <select
                    id="timezone"
                    className={selectClass}
                    disabled={!canWrite}
                    value={form.timezone}
                    onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={settingsFieldRowClass}>
                  <Label className={settingsFieldLabelClass}>ปีที่แสดง</Label>
                  <div className="flex min-h-10 flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={form.yearFormat === 'BE' ? 'default' : 'outline'}
                      disabled={!canWrite}
                      onClick={() => setForm({ ...form, yearFormat: 'BE' })}
                    >
                      พ.ศ. (BE)
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={form.yearFormat === 'AD' ? 'default' : 'outline'}
                      disabled={!canWrite}
                      onClick={() => setForm({ ...form, yearFormat: 'AD' })}
                    >
                      ค.ศ. (AD)
                    </Button>
                  </div>
                </div>
                <div className={settingsFieldRowClass}>
                  <Label htmlFor="dateFormat" className={settingsFieldLabelClass}>
                    รูปแบบวันที่
                  </Label>
                  <select
                    id="dateFormat"
                    className={selectClass}
                    disabled={!canWrite}
                    value={form.dateFormat}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        dateFormat: e.target.value as AdminSettings['dateFormat'],
                      })
                    }
                  >
                    <option value="dd/MM/yyyy">dd/MM/yyyy</option>
                    <option value="dd-MM-yyyy">dd-MM-yyyy</option>
                    <option value="yyyy-MM-dd">yyyy-MM-dd</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings2 className="size-5" aria-hidden />
                  ขีดจำกัด
                </CardTitle>
                {canWrite ? (
                  <SectionResetButton
                    section="limits"
                    label="ขีดจำกัด"
                    disabled={sectionResetMut.isPending}
                    onReset={(s) => sectionResetMut.mutate(s)}
                  />
                ) : null}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="uploadMaxMb">ขนาดอัปโหลดสูงสุด (MB)</Label>
                  <Input
                    id="uploadMaxMb"
                    type="number"
                    min={1}
                    max={500}
                    disabled={!canWrite}
                    value={form.uploadMaxMb}
                    onChange={(e) =>
                      setForm({ ...form, uploadMaxMb: Number(e.target.value) || 1 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTtlMin">อายุ session (นาที)</Label>
                  <Input
                    id="sessionTtlMin"
                    type="number"
                    min={15}
                    max={1440}
                    disabled={!canWrite}
                    value={form.sessionTtlMin}
                    onChange={(e) =>
                      setForm({ ...form, sessionTtlMin: Number(e.target.value) || 15 })
                    }
                  />
                  <p className="text-xs text-app-muted">ค่าเริ่มต้น 480 นาที (8 ชั่วโมง) — ใช้กับ session cookie/token</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">ความยาวรหัสผ่านขั้นต่ำ</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    min={8}
                    max={128}
                    disabled={!canWrite}
                    value={form.passwordMinLength}
                    onChange={(e) =>
                      setForm({ ...form, passwordMinLength: Number(e.target.value) || 8 })
                    }
                  />
                  <p className="text-xs text-app-muted">ใช้เมื่อ admin reset password (4 ชนิดอักขระ)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">จำนวนครั้ง login ผิดสูงสุด</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    min={3}
                    max={50}
                    disabled={!canWrite}
                    value={form.maxLoginAttempts}
                    onChange={(e) =>
                      setForm({ ...form, maxLoginAttempts: Number(e.target.value) || 3 })
                    }
                  />
                  <p className="text-xs text-app-muted">ต่อ IP+ผู้ใช้ ภายใน 15 นาที (ก่อน lockout 429)</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Flag className="size-5" aria-hidden />
                    Feature flags
                  </CardTitle>
                  <CardDescription>
                    IndexedDB offline, Dashboard charts — Joyride tour / Optimistic UI / DnD calendar
                    ยังไม่มี toggle ใน UI
                  </CardDescription>
                </div>
                {canWrite ? (
                  <SectionResetButton
                    section="features"
                    label=" Feature flags"
                    disabled={sectionResetMut.isPending}
                    onReset={(s) => sectionResetMut.mutate(s)}
                  />
                ) : null}
              </CardHeader>
              <CardContent className="space-y-3">
                <FlagToggle
                  label="IndexedDB offline"
                  description="เก็บข้อมูลออฟไลน์เมื่อพร้อม deploy"
                  checked={form.featureIndexeddbOffline}
                  disabled={!canWrite}
                  onChange={(v) => setForm({ ...form, featureIndexeddbOffline: v })}
                />
                <FlagToggle
                  label="Dashboard charts ขั้นสูง"
                  description="กราฟรายงานเพิ่มเติมบน Dashboard"
                  checked={form.featureDashboardCharts}
                  disabled={!canWrite}
                  onChange={(v) => setForm({ ...form, featureDashboardCharts: v })}
                />
                <div className="rounded-card border border-app p-3">
                  <p className="text-body-sm font-medium text-app">Offline cache (IndexedDB)</p>
                  <p className="mt-1 text-xs text-app-muted">
                    ล้างแคช readonly ที่ใช้ช่วยเปิดหน้า audit/backup เมื่อ DB ไม่ตอบ (กระทบเฉพาะ browser เครื่องนี้)
                  </p>
                  <div className="mt-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={!canWrite || clearCacheMut.isPending}
                      onClick={() => setClearCacheOpen(true)}
                    >
                      <Trash2 className="mr-1 size-4" aria-hidden />
                      ล้างแคช IndexedDB
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="admin-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">คีย์ลับ (masked)</CardTitle>
                <CardDescription>
                  `GET /admin/settings/secrets` — ค่า `is_secret` ใน tbl_setting (migration 069+)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {secretsQ.isLoading ? (
                  <Skeleton className="h-12 w-full" />
                ) : (secretsQ.data?.items.length ?? 0) > 0 ? (
                  <ul className="space-y-2 text-body-sm">
                    {secretsQ.data?.items.map((s) => (
                      <li
                        key={s.settingKey}
                        className="flex flex-wrap justify-between gap-2 rounded border border-app px-3 py-2"
                      >
                        <span className="font-mono text-xs">{s.settingKey}</span>
                        <span className="text-app-muted">
                          {s.hasValue ? s.maskedValue : '(ว่าง)'}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-caption">
                    ยังไม่มีคีย์ลับ — รัน migration 069 (`app.license_key`) หรือเพิ่มแถว
                    `is_secret=true` ใน tbl_setting
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="admin-card lg:col-span-2">
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ShieldAlert className="size-5" aria-hidden />
                    โหมดบำรุงรักษา
                  </CardTitle>
                  <CardDescription>
                    Banner ทั้งแอป + 503 สำหรับ API แก้ไข (ยกเว้น admin ที่มีสิทธิ์ bypass)
                  </CardDescription>
                </div>
                {canWrite ? (
                  <SectionResetButton
                    section="maintenance"
                    label="โหมดบำรุงรักษา"
                    disabled={sectionResetMut.isPending}
                    onReset={(s) => sectionResetMut.mutate(s)}
                  />
                ) : null}
              </CardHeader>
              <CardContent className="space-y-4">
                <FlagToggle
                  label="เปิดโหมดบำรุงรักษา"
                  checked={form.maintenanceEnabled}
                  disabled={!canWrite}
                  onChange={(v) => setForm({ ...form, maintenanceEnabled: v })}
                />
                <div className="space-y-2">
                  <Label htmlFor="maintenanceMessage">ข้อความ banner</Label>
                  <Input
                    id="maintenanceMessage"
                    disabled={!canWrite || !form.maintenanceEnabled}
                    value={form.maintenanceMessage}
                    placeholder="ระบบอยู่ระหว่างบำรุงรักษา — บางฟังก์ชันอาจใช้งานไม่ได้ชั่วคราว"
                    onChange={(e) => setForm({ ...form, maintenanceMessage: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <BoardKioskCard canWrite={canWrite} />
          </div>
        ) : null}

      <ConfirmPhraseDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        tone="danger"
        title="คืนค่าตั้งค่าระบบ"
        description="คืนค่า timezone, รูปแบบวันที่, feature flags และโหมดบำรุงรักษาเป็นค่าเริ่มต้น"
        phrase="RESET"
        confirmLabel="คืนค่ามาตรฐาน"
        loading={resetMut.isPending}
        onConfirm={() => {
          resetMut.mutate(undefined, {
            onSuccess: () => setResetOpen(false),
          })
        }}
      />

      <ConfirmPhraseDialog
        open={clearCacheOpen}
        onOpenChange={setClearCacheOpen}
        tone="danger"
        title="ล้างแคช IndexedDB"
        description="ล้างแคช readonly (audit/backup) บน browser เครื่องนี้ — ไม่กระทบข้อมูลบนเซิร์ฟเวอร์"
        phrase="CLEAR"
        confirmLabel="ล้างแคช"
        loading={clearCacheMut.isPending}
        onConfirm={() => {
          clearCacheMut.mutate(undefined, {
            onSuccess: () => setClearCacheOpen(false),
          })
        }}
      />
    </AdminPageShell>
  )
}
