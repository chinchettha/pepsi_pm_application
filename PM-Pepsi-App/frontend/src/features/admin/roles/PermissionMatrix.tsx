import type { AdminRole, AdminRoleMatrixResponse } from '@/api/schemas'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye, EyeOff, Trash2 } from 'lucide-react'

export type PermissionMatrixProps = {
  data: AdminRoleMatrixResponse
  canWrite: boolean
  pending: string | null
  previewRoleCode: string | null
  onToggle: (roleCode: string, permCode: string, granted: boolean) => void
  onToggleGroup: (roleCode: string, group: string, grant: boolean) => void
  onSimulate: (role: AdminRole) => void
  onStopSimulate: () => void
  onDeleteRole: (role: AdminRole) => void
}

function RoleHeaderCell({
  role,
  canWrite,
  previewRoleCode,
  onSimulate,
  onStopSimulate,
  onDelete,
}: {
  role: AdminRole
  canWrite: boolean
  previewRoleCode: string | null
  onSimulate: () => void
  onStopSimulate: () => void
  onDelete: () => void
}) {
  const simulating = previewRoleCode === role.roleCode
  return (
    <div className="min-w-[7rem] space-y-1 text-center">
      <div
        className="mx-auto size-3 rounded-full border border-app"
        style={{ backgroundColor: role.roleColor }}
        title={role.roleColor}
      />
      <div className="font-semibold text-app">{role.roleCode}</div>
      <p className="text-badge leading-tight text-app-muted">{role.roleName}</p>
      <div className="flex flex-wrap justify-center gap-1">
        {role.isSystem ? (
          <Badge variant="secondary" className="px-1 py-0 text-badge">
            system
          </Badge>
        ) : null}
        <Badge variant="outline" className="px-1 py-0 text-badge">
          {role.userCount} users
        </Badge>
      </div>
      <div className="flex justify-center gap-1 pt-1">
        <Button
          type="button"
          size="icon"
          variant={simulating ? 'default' : 'outline'}
          className="size-7"
          aria-label={simulating ? 'หยุดจำลองเมนู' : 'จำลองเมนูตาม role นี้'}
          onClick={simulating ? onStopSimulate : onSimulate}
        >
          {simulating ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        </Button>
        {canWrite && !role.isSystem && role.userCount === 0 ? (
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-7 text-red-700 hover:text-red-800"
            aria-label="ลบ role"
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" />
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export function PermissionMatrix({
  data,
  canWrite,
  pending,
  previewRoleCode,
  onToggle,
  onToggleGroup,
  onSimulate,
  onStopSimulate,
  onDeleteRole,
}: {
  data: AdminRoleMatrixResponse
  canWrite: boolean
  pending: string | null
  previewRoleCode: string | null
  onToggle: (roleCode: string, permCode: string, granted: boolean) => void
  onToggleGroup: (roleCode: string, group: string, grant: boolean) => void
  onSimulate: (role: AdminRole) => void
  onStopSimulate: () => void
  onDeleteRole: (role: AdminRole) => void
}) {
  return (
    <div className="overflow-x-auto rounded-card border border-app">
      <Table>
        <TableHeader>
          <TableRow className="bg-app-subtle">
            <TableHead className="sticky left-0 z-20 min-w-[220px] bg-app-subtle">
              สิทธิ์ (Permission)
            </TableHead>
            {data.roles.map((role) => (
              <TableHead key={role.roleCode} className="align-top">
                <RoleHeaderCell
                  role={role}
                  canWrite={canWrite}
                  previewRoleCode={previewRoleCode}
                  onSimulate={() => onSimulate(role)}
                  onStopSimulate={onStopSimulate}
                  onDelete={() => onDeleteRole(role)}
                />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.groups.flatMap((g) => [
            <TableRow key={`group-${g.group}`} className="bg-app-muted/80">
              <TableCell
                colSpan={1 + data.roles.length}
                className="sticky left-0 z-10 bg-app-muted/80 py-2 font-semibold text-app"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>{g.group}</span>
                  {canWrite ? (
                    <div className="flex flex-wrap gap-1">
                      {data.roles.map((role) => (
                        <Button
                          key={`${g.group}-${role.roleCode}-all`}
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          disabled={pending !== null}
                          onClick={() => onToggleGroup(role.roleCode, g.group, true)}
                        >
                          {role.roleCode} ทั้งกลุ่ม
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>,
            ...g.permissions.map((perm) => (
              <TableRow key={perm.permCode}>
                <TableCell className="sticky left-0 z-10 bg-white">
                  <div className="font-mono text-xs text-app">{perm.permCode}</div>
                  <p className="text-body-sm text-app">{perm.permName}</p>
                  {perm.description ? (
                    <p className="text-xs text-app-muted">{perm.description}</p>
                  ) : null}
                </TableCell>
                {data.roles.map((role) => {
                  const granted = perm.grants[role.roleCode] ?? false
                  const cellKey = `${role.roleCode}:${perm.permCode}`
                  const busy =
                    pending === cellKey || pending === `${role.roleCode}:group:${g.group}`
                  return (
                    <TableCell key={cellKey} className="text-center">
                      <input
                        type="checkbox"
                        className="size-4 cursor-pointer accent-[var(--admin-primary)] disabled:cursor-not-allowed"
                        checked={granted}
                        disabled={!canWrite || busy}
                        aria-label={`${role.roleCode} — ${perm.permCode}`}
                        onChange={() => onToggle(role.roleCode, perm.permCode, !granted)}
                      />
                    </TableCell>
                  )
                })}
              </TableRow>
            )),
          ])}
        </TableBody>
      </Table>
    </div>
  )
}