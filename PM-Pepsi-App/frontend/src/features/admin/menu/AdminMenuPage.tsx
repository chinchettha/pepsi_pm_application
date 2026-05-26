import type { AdminMenuRow } from '@/api/schemas'
import { ConfirmPhraseDialog } from '@/components/admin/ConfirmPhraseDialog'
import { AdminAccessDenied } from '@/components/admin/AdminAccessDenied'
import { AdminPageRoot } from '@/components/admin/AdminPageRoot'
import { AdminPageShell } from '@/components/admin/AdminPageShell'
import type { NavLinkEntry } from '@/components/layout/nav-config'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import {
  assignMenuonOrder,
  deleteAdminMenuItem,
  fetchAdminMenuList,
  reorderAdminMenu,
  syncAdminMenuFromPhp,
} from '@/lib/admin-menu-api'
import {
  permissionsForRoleFromMatrix,
  previewNavForRole,
} from '@/lib/admin-menu-preview'
import { fetchAdminRolesMatrix } from '@/lib/admin-roles-api'
import { useAuthUser, usePermission } from '@/lib/use-permission'
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Download, GripVertical, Menu, Plus, RefreshCcw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { MenuEditDialog } from './MenuEditDialog'
import { MenuNavLayoutCard } from './MenuNavLayoutCard'
import { MenuTreeNode } from './MenuTreeNode'
import { MENU_ROLE_BITS } from './menu-form-utils'

const MENU_KEY = ['admin', 'menu'] as const

function MenuPreviewPanel({
  rows,
  previewRole,
  previewPermissions,
}: {
  rows: AdminMenuRow[]
  previewRole: string
  previewPermissions?: string[]
}) {
  const entries = useMemo(
    () => previewNavForRole(rows, previewRole, previewPermissions),
    [rows, previewRole, previewPermissions],
  )

  return (
    <div className="rounded-card bg-[var(--admin-text)] p-3 text-body-sm text-[var(--admin-surface)]">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-app-muted">
        Preview · role {previewRole}
        {previewPermissions ? (
          <span className="ml-1 font-normal normal-case text-app-muted">
            ({previewPermissions.length} สิทธิ์จาก matrix)
          </span>
        ) : (
          <span className="ml-1 font-normal normal-case text-app-muted">(menuright เทียบ userst)</span>
        )}
      </p>
      <nav className="space-y-1">
        {entries.map((entry, i) => {
          if (entry.kind === 'heading') {
            return (
              <p key={`h-${i}`} className="px-2 pt-3 pb-1 text-eyebrow text-app-muted">
                {entry.label}
              </p>
            )
          }
          const item = entry as NavLinkEntry
          const Icon = item.icon
          return (
            <div
              key={`${item.to}-${i}`}
              className="flex items-center gap-2 rounded-button px-2 py-2 text-[color-mix(in_srgb,var(--admin-surface)_88%,transparent)]"
            >
              <Icon className="size-4 shrink-0 opacity-80" />
              <span className="truncate">{item.label}</span>
            </div>
          )
        })}
        {entries.length === 0 ? (
          <p className="px-2 py-4 text-app-muted">ไม่มีเมนูสำหรับ role นี้</p>
        ) : null}
      </nav>
    </div>
  )
}

export function AdminMenuPage() {
  const qc = useQueryClient()
  const authUser = useAuthUser()
  const canRead = usePermission('admin.menu.read')
  const canWrite = usePermission('admin.menu.write')
  const canRolesRead = usePermission('admin.roles.read')
  const [localRows, setLocalRows] = useState<AdminMenuRow[] | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editRow, setEditRow] = useState<AdminMenuRow | null>(null)
  const [previewRole, setPreviewRole] = useState(() => authUser?.userst?.trim().toUpperCase() || 'A')
  const [syncOpen, setSyncOpen] = useState(false)

  const q = useQuery({
    queryKey: MENU_KEY,
    queryFn: fetchAdminMenuList,
    enabled: canRead || canWrite,
    placeholderData: keepPreviousData,
  })

  const rolesMatrixQ = useQuery({
    queryKey: ['admin', 'roles', 'matrix'],
    queryFn: fetchAdminRolesMatrix,
    enabled: (canRead || canWrite) && canRolesRead,
    staleTime: 60_000,
  })

  const roleOptions = useMemo(() => {
    const fromMatrix = rolesMatrixQ.data?.roles.map((r) => r.roleCode) ?? []
    if (fromMatrix.length > 0) return fromMatrix
    return [...MENU_ROLE_BITS]
  }, [rolesMatrixQ.data])

  useEffect(() => {
    if (roleOptions.length === 0) return
    if (roleOptions.includes(previewRole)) return
    const fallback =
      (authUser?.userst?.trim().toUpperCase() &&
        roleOptions.find((c) => c === authUser.userst.trim().toUpperCase())) ||
      roleOptions[0]
    setPreviewRole(fallback)
  }, [roleOptions, previewRole, authUser?.userst])

  const previewPermissions = useMemo(() => {
    if (!rolesMatrixQ.data || !canRolesRead) return undefined
    return permissionsForRoleFromMatrix(rolesMatrixQ.data, previewRole)
  }, [rolesMatrixQ.data, previewRole, canRolesRead])

  useEffect(() => {
    if (q.data) setLocalRows(q.data)
  }, [q.data])

  const rows = localRows ?? q.data ?? []

  const reorderMut = useMutation({
    mutationFn: reorderAdminMenu,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: MENU_KEY })
      void qc.invalidateQueries({ queryKey: ['nav-menu'] })
      toast.success('จัดลำดับเมนูแล้ว')
    },
    onError: () => {
      toast.error('จัดลำดับไม่สำเร็จ')
      if (q.data) setLocalRows(q.data)
    },
  })

  const syncMut = useMutation({
    mutationFn: syncAdminMenuFromPhp,
    onSuccess: (res) => {
      toast.success(`Sync จาก PHP แล้ว (${res.statements} คำสั่ง)`)
      setSyncOpen(false)
      invalidateAll()
    },
    onError: (e: Error) => {
      toast.error(e.message || 'Sync ไม่สำเร็จ — ตรวจไฟล์ import_tbmenu_pg.sql')
    },
  })

  const deleteMut = useMutation({
    mutationFn: deleteAdminMenuItem,
    onSuccess: () => {
      toast.success('ลบเมนูแล้ว')
      void qc.invalidateQueries({ queryKey: MENU_KEY })
      void qc.invalidateQueries({ queryKey: ['nav-menu'] })
    },
    onError: () => toast.error('ลบไม่สำเร็จ'),
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const sortableIds = useMemo(() => rows.map((r) => r.idmenu), [rows])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (!canWrite) return
      const { active, over } = event
      if (!over || active.id === over.id) return
      const oldIndex = sortableIds.indexOf(Number(active.id))
      const newIndex = sortableIds.indexOf(Number(over.id))
      if (oldIndex < 0 || newIndex < 0) return
      const reordered = arrayMove(rows, oldIndex, newIndex)
      setLocalRows(reordered)
      reorderMut.mutate(assignMenuonOrder(reordered))
    },
    [canWrite, rows, sortableIds, reorderMut],
  )

  const invalidateAll = useCallback(() => {
    void qc.invalidateQueries({ queryKey: MENU_KEY })
    void qc.invalidateQueries({ queryKey: ['nav-menu'] })
  }, [qc])

  if (!canRead && !canWrite) {
    return (
      <AdminPageRoot tourTarget="admin-menu">
        <AdminAccessDenied
          message={
            <>
              ไม่มีสิทธิ์ <code className="text-xs">admin.menu.read</code>
            </>
          }
        />
      </AdminPageRoot>
    )
  }

  return (
    <AdminPageShell
      tourTarget="admin-menu"
      title="เมนู"
      description="จัดรายการเมนูหลักจาก tbmenu — ลากเรียง · ตัวอย่างตาม role · รูปแบบ shell ทั้งระบบ"
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
            <Button type="button" variant="outline" className="admin-toolbar-btn" onClick={() => setSyncOpen(true)}>
              <Download className="mr-1 size-4" />
              ซิงค์จาก PHP
            </Button>
          ) : null}
        </>
      }
    >
      <MenuNavLayoutCard canWrite={canWrite} />

      <div className="flex flex-wrap items-center gap-2">
        {canWrite ? (
          <Button
            type="button"
            onClick={() => {
              setEditRow(null)
              setDialogOpen(true)
            }}
          >
            <Plus className="mr-1 size-4" />
            เพิ่มเมนู
          </Button>
        ) : null}
        <label className="flex flex-col gap-1 text-caption sm:flex-row sm:items-center">
          <span>ตัวอย่าง role</span>
          <select
            className="h-9 max-w-xs rounded-button border border-app px-2 text-body-sm"
            value={previewRole}
            onChange={(e) => setPreviewRole(e.target.value)}
          >
            {roleOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {!canRolesRead ? (
            <span className="text-xs text-app-muted">
              มีสิทธิ์ <code className="text-code">admin.roles.read</code> จะโหลด role จาก matrix
              และกรองเมนูตามสิทธิ์จริง
            </span>
          ) : null}
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Menu className="size-4" />
              รายการเมนู
            </CardTitle>
            <CardDescription>
              ลาก <GripVertical className="inline size-3" /> เพื่อเรียง — บันทึก menuon อัตโนมัติ
              {reorderMut.isPending ? ' (กำลังบันทึก…)' : null}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {q.isLoading && rows.length === 0 ? (
              <Skeleton className="h-48 w-full" />
            ) : q.isError ? (
              <EmptyState
                icon={AlertCircle}
                title="โหลดเมนูไม่สำเร็จ"
                description={(q.error as Error).message}
                action={{ label: 'ลองใหม่', onClick: () => void q.refetch() }}
              />
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {rows.map((item) => (
                      <MenuTreeNode
                        key={item.idmenu}
                        item={item}
                        canWrite={canWrite}
                        onEdit={() => {
                          setEditRow(item)
                          setDialogOpen(true)
                        }}
                        onDelete={() => {
                          if (!window.confirm(`ลบ "${item.menutitle}"?`)) return
                          deleteMut.mutate(item.idmenu)
                        }}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-base">ตัวอย่างเมนู (Sidebar)</CardTitle>
            <CardDescription>
              รายการจาก tbmenu — กรองตาม menuright (legacy) หรือตามสิทธิ์ matrix ถ้ามี{' '}
              <code className="text-code">admin.roles.read</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MenuPreviewPanel
              rows={rows}
              previewRole={previewRole}
              previewPermissions={previewPermissions}
            />
          </CardContent>
        </Card>
      </div>

      <MenuEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editRow}
        onSaved={invalidateAll}
      />

      {syncOpen ? (
        <ConfirmPhraseDialog
          open
          onOpenChange={(open) => !open && setSyncOpen(false)}
          tone="danger"
          title="ซิงค์เมนูจาก PHP"
          description="ลบ tbmenu ทั้งหมดแล้วนำเข้าจาก database/seeds/generated/import_tbmenu_pg.sql — รัน import-auth-from-mysql.ps1 ก่อนถ้ายังไม่มีไฟล์"
          phrase="SYNC_MENU"
          phraseLabel="พิมพ์ SYNC_MENU เพื่อยืนยัน"
          confirmLabel="ซิงค์"
          loading={syncMut.isPending}
          onConfirm={() => syncMut.mutate()}
        />
      ) : null}
    </AdminPageShell>
  )
}
