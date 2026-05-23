import { PepsiBrandMark } from '@/components/brand/PepsiBrandMark'
import { adminSectionGroupLabel } from '@/lib/admin-breadcrumb'
import { adminSectionForPath } from '@/lib/admin-sections'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

/** Page title bar — คู่ `AdminPageRoot` + breadcrumb ใน `AdminLayout` */
export function AdminPageHeader({
  title,
  description,
  eyebrow,
  children,
  className,
}: {
  title: string
  description?: string
  /** override กลุ่มเมนู (ค่าเริ่มต้นจาก path ปัจจุบัน) */
  eyebrow?: string
  children?: ReactNode
  className?: string
}) {
  const { pathname } = useLocation()
  const section = adminSectionForPath(pathname)
  const groupLabel = adminSectionGroupLabel(section)
  const eyebrowText = eyebrow ?? groupLabel ?? 'Pepsi PM · ผู้ดูแลระบบ'

  return (
    <header className={cn('admin-page-header', className)}>
      <div className="admin-page-header-inner flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <PepsiBrandMark size="lg" className="mt-1 shadow-md" />
          <div className="min-w-0">
            <p className="text-eyebrow text-[var(--admin-text-muted)]">{eyebrowText}</p>
            <h1 className="admin-page-title text-heading-page">{title}</h1>
            {description ? (
              <p className="text-caption mt-1 max-w-2xl text-[var(--admin-text-muted)]">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {children ? <div className="flex shrink-0 flex-wrap gap-2">{children}</div> : null}
      </div>
    </header>
  )
}
