import type { AdminRole } from '@/api/schemas'
import { ConfirmPhraseDialog } from '@/components/admin/ConfirmPhraseDialog'
import { AdminAccessDenied } from '@/components/admin/AdminAccessDenied'
import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import {
  deleteAdminRole,
  fetchAdminRolesMatrix,
  setAdminRolePermissions,
  simulateAdminRole,
} from '@/lib/admin-roles-api'
import { clearRbacPreview, getRbacPreviewSnapshot, setRbacPreview } from '@/lib/rbac-preview'
import { usePermission } from '@/lib/use-permission'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, EyeOff, Plus, RefreshCcw } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { CreateRoleDialog } from './CreateRoleDialog'
import { PermissionMatrix } from './PermissionMatrix'
import { RoleNavPreview } from './RoleNavPreview'

const MATRIX_KEY = ['admin', 'roles', 'matrix'] as const

function invalidateMatrix(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: MATRIX_KEY })
}

export function AdminRolesPage() {
  const qc = useQueryClient()
  const canRead = usePermission('admin.roles.read')
  const canWrite = usePermission('admin.roles.write')
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteRole, setDeleteRole] = useState<AdminRole | null>(null)
  const [pending, setPending] = useState<string | null>(null)
  const [previewRoleCode, setPreviewRoleCode] = useState<string | null>(
    () => getRbacPreviewSnapshot()?.roleCode ?? null,
  )

  const q = useQuery({
    queryKey: MATRIX_KEY,
    queryFn: fetchAdminRolesMatrix,
    enabled: canRead || canWrite,
    placeholderData: keepPreviousData,
  })

  const permMut = useMutation({
    mutationFn: ({
      roleCode,
      grants,
    }: {
      roleCode: string
      grants: Record<string, boolean>
    }) => setAdminRolePermissions(roleCode, grants),
    onSuccess: () => invalidateMatrix(qc),
    onError: () => toast.error('บันทึกสิทธิ์ไม่สำเร็จ'),
    onSettled: () => setPending(null),
  })

  const deleteMut = useMutation({
    mutationFn: (code: string) => deleteAdminRole(code),
    onSuccess: () => {
      toast.success('ลบ role แล้ว')
      invalidateMatrix(qc)
    },
    onError: (e: Error) => toast.error(e.message || 'ลบไม่สำเร็จ'),
  })

  const matrix = q.data

  const permByGroup = useMemo(() => {
    if (!matrix) return new Map<string, string[]>()
    const m = new Map<string, string[]>()
    for (const g of matrix.groups) {
      m.set(
        g.group,
        g.permissions.map((p) => p.permCode),
      )
    }
    return m
  }, [matrix])

  const handleToggle = useCallback(
    (roleCode: string, permCode: string, granted: boolean) => {
      if (!canWrite) return
      setPending(`${roleCode}:${permCode}`)
      permMut.mutate({ roleCode, grants: { [permCode]: granted } })
    },
    [canWrite, permMut],
  )

  const handleToggleGroup = useCallback(
    (roleCode: string, group: string, grant: boolean) => {
      if (!canWrite) return
      const codes = permByGroup.get(group)
      if (!codes?.length) return
      const grants = Object.fromEntries(codes.map((c) => [c, grant]))
      setPending(`${roleCode}:group:${group}`)
      permMut.mutate({ roleCode, grants })
    },
    [canWrite, permByGroup, permMut],
  )

  const handleSimulate = useCallback(async (role: AdminRole) => {
    try {
      const sim = await simulateAdminRole(role.roleCode)
      setRbacPreview({
        roleCode: sim.roleCode,
        roleName: role.roleName,
        permissions: sim.permissions,
      })
      setPreviewRoleCode(sim.roleCode)
      toast.info(`จำลองเมนูเป็น ${sim.roleCode} (${sim.permissions.length} สิทธิ์)`)
    } catch {
      toast.error('จำลอง role ไม่สำเร็จ')
    }
  }, [])

  const handleStopSimulate = useCallback(() => {
    clearRbacPreview()
    setPreviewRoleCode(null)
    toast.success('หยุดจำลอง role')
  }, [])

  const handleDeleteRole = useCallback((role: AdminRole) => {
    setDeleteRole(role)
  }, [])

  if (!canRead && !canWrite) {
    return (
      <AdminPageRoot tourTarget="admin-roles">
        <AdminAccessDenied
          message={
            <>
              ไม่มีสิทธิ์ <code className="text-xs">admin.roles.read</code>
            </>
          }
        />
      </AdminPageRoot>
    )
  }

  return (
    <AdminPageShell
      tourTarget="admin-roles"
      title="บทบาท & สิทธิ์"
      description="Matrix role × permission — สร้าง custom role และจำลองเมนูก่อนบันทึก"
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
            <Button type="button" className="admin-toolbar-btn" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1 size-4" />
              สร้าง role
            </Button>
          ) : null}
          {previewRoleCode ? (
            <Button type="button" variant="outline" className="admin-toolbar-btn" onClick={handleStopSimulate}>
              <EyeOff className="mr-1 size-4" />
              หยุดจำลอง ({previewRoleCode})
            </Button>
          ) : null}
        </>
      }
    >
        <RoleNavPreview />
      <Card className="admin-card">
        <CardHeader>
          <CardTitle className="text-base">ตารางสิทธิ์ (Permission matrix)</CardTitle>
          <CardDescription>
            แถว = สิทธิ์แยกตามกลุ่ม · คอลัมน์ = role · ติ๊กเพื่อ grant/revoke (บันทึกทันที)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {q.isLoading && !matrix ? (
            <Skeleton className="h-64 w-full" />
          ) : q.isError ? (
            <EmptyState
              icon={AlertCircle}
              title="โหลด matrix ไม่สำเร็จ"
              description={(q.error as Error).message || 'ตรวจสอบ migration 044–046'}
              action={{ label: 'ลองใหม่', onClick: () => void q.refetch() }}
            />
          ) : matrix ? (
            <PermissionMatrix
              data={matrix}
              canWrite={canWrite}
              pending={pending}
              previewRoleCode={previewRoleCode}
              onToggle={handleToggle}
              onToggleGroup={handleToggleGroup}
              onSimulate={handleSimulate}
              onStopSimulate={handleStopSimulate}
              onDeleteRole={handleDeleteRole}
            />
          ) : null}
        </CardContent>
      </Card>

      <CreateRoleDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => invalidateMatrix(qc)}
      />

      {deleteRole ? (
        <ConfirmPhraseDialog
          open
          onOpenChange={(open) => !open && setDeleteRole(null)}
          tone="danger"
          title={`ลบ role ${deleteRole.roleCode}`}
          description="ลบ role ที่ไม่มีผู้ใช้ผูกอยู่ — ไม่สามารถย้อนกลับได้"
          phrase={deleteRole.roleCode}
          phraseLabel={`พิมพ์รหัส role ${deleteRole.roleCode} เพื่อยืนยัน`}
          confirmLabel="ลบ role"
          loading={deleteMut.isPending}
          onConfirm={() => {
            deleteMut.mutate(deleteRole.roleCode, {
              onSuccess: () => setDeleteRole(null),
            })
          }}
        />
      ) : null}
    </AdminPageShell>
  )
}
