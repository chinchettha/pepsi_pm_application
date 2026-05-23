import {
  ADMIN_SECTION_GROUPS,
  adminSectionForPath,
  type AdminSection,
} from '@/lib/admin-sections'

export type AdminBreadcrumbCrumb = {
  label: string
  to?: string
  current?: boolean
}

/** Breadcrumb trail สำหรับ `/admin/*` — ใช้ร่วมกับ `AdminBreadcrumb` และ `AdminPageHeader` */
export function adminBreadcrumbTrail(pathname: string): AdminBreadcrumbCrumb[] {
  const section = adminSectionForPath(pathname)
  const crumbs: AdminBreadcrumbCrumb[] = [
    { label: 'หน้าแรก', to: '/' },
    { label: 'ผู้ดูแลระบบ', to: '/admin' },
  ]

  if (!section) return crumbs

  if (!section.segment) {
    crumbs.push({ label: section.label, current: true })
    return crumbs
  }

  const group = ADMIN_SECTION_GROUPS.find((g) => g.id === section.group)
  if (group) crumbs.push({ label: group.label })
  crumbs.push({ label: section.label, current: true })
  return crumbs
}

export function adminSectionGroupLabel(section: AdminSection | undefined): string | undefined {
  if (!section?.segment) return undefined
  return ADMIN_SECTION_GROUPS.find((g) => g.id === section.group)?.label
}
