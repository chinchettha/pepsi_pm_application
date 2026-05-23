import { AdminPageContent } from '@/components/admin/AdminPageContent'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function AdminAccessDenied({
  message = 'ไม่มีสิทธิ์เข้าหน้านี้',
}: {
  message?: ReactNode
}) {
  return (
    <AdminPageContent>
      <p className="text-caption text-[var(--admin-text-muted)]">{message}</p>
      <Link
        to="/admin"
        className="mt-2 inline-block text-body-sm text-[var(--admin-primary)] underline"
      >
        กลับ Admin Console
      </Link>
    </AdminPageContent>
  )
}
