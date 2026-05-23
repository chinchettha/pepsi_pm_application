import { AdminPageContent } from '@/components/admin/AdminPageContent'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPageRoot } from '@/components/admin/AdminPageRoot'
import type { ReactNode } from 'react'

/** รูปแบบมาตรฐาน: Root → Header → Content */
export function AdminPageShell({
  tourTarget,
  title,
  description,
  headerActions,
  contentClassName,
  children,
}: {
  tourTarget: string
  title: string
  description?: string
  headerActions?: ReactNode
  contentClassName?: string
  children: ReactNode
}) {
  return (
    <AdminPageRoot tourTarget={tourTarget}>
      <AdminPageHeader title={title} description={description}>
        {headerActions}
      </AdminPageHeader>
      <AdminPageContent className={contentClassName}>{children}</AdminPageContent>
    </AdminPageRoot>
  )
}
