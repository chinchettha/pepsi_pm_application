import { AppPageContent } from '@/components/layout/AppPageContent'
import { PageHeader } from '@/components/layout/PageHeader'
import type { ReactNode } from 'react'

/** รูปแบบมาตรฐานหน้าแอป: `PageHeader` + `app-page-content` */
export function AppPageShell({
  title,
  description,
  headerActions,
  contentClassName,
  children,
}: {
  title: string
  description?: string
  headerActions?: ReactNode
  contentClassName?: string
  children: ReactNode
}) {
  return (
    <>
      <PageHeader title={title} description={description}>
        {headerActions}
      </PageHeader>
      <AppPageContent className={contentClassName}>{children}</AppPageContent>
    </>
  )
}
