import { Badge } from '@/components/ui/badge'
import { navPathsForRolePreview } from '@/lib/rbac-role-nav-preview'
import { getRbacPreviewSnapshot, subscribeRbacPreview } from '@/lib/rbac-preview'
import { useMemo, useSyncExternalStore } from 'react'

export function RoleNavPreview() {
  const preview = useSyncExternalStore(subscribeRbacPreview, getRbacPreviewSnapshot, () => null)

  const paths = useMemo(() => {
    if (!preview) return []
    return navPathsForRolePreview(preview.roleCode, preview.permissions)
  }, [preview?.roleCode, preview?.permissions])

  if (!preview) return null

  const adminPaths = paths.filter((p) => p.startsWith('/admin'))

  return (
    <div className="app-tone-info rounded-card border px-4 py-3 text-body-sm">
      <p className="font-medium">
        ตัวอย่างเมนูที่มองเห็น — role {preview.roleCode} ({preview.roleName})
      </p>
      <p className="app-tone-info-muted mt-1 text-xs">
        {paths.length} เส้นทาง · {preview.permissions.length} สิทธิ์จาก matrix (ยังไม่บันทึกจนกว่าจะติ๊ก
        checkbox)
      </p>
      <div className="mt-2 flex max-h-32 flex-wrap gap-1 overflow-y-auto">
        {paths.map((p) => (
          <Badge
            key={p}
            variant="outline"
            className={
              p.startsWith('/admin')
                ? 'border-[color-mix(in_srgb,var(--admin-primary)_50%,var(--admin-border))] bg-white font-mono text-badge'
                : 'bg-white font-mono text-badge'
            }
          >
            {p}
          </Badge>
        ))}
      </div>
      {adminPaths.length === 0 ? (
        <p className="mt-2 text-xs text-emerald-800">ไม่มีเมนู /admin — สอดคล้องกับ role ปฏิบัติการ</p>
      ) : null}
    </div>
  )
}
