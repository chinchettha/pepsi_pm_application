import { AdminPageRoot } from '@/components/admin/AdminPageRoot'
import { PersonnelAdminPage } from '@/features/personnel/PersonnelAdminPage'

/** Admin console — ขยายจาก PersonnelAdminPage + reset/lock/impersonate */
export function AdminUsersPage() {
  return (
    <AdminPageRoot tourTarget="admin-users">
      <PersonnelAdminPage variant="admin" />
    </AdminPageRoot>
  )
}