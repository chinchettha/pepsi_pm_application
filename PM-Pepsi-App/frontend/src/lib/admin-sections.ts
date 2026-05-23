import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Boxes,
  DatabaseBackup,
  History,
  Info,
  LayoutDashboard,
  ListTree,
  Lock,
  Megaphone,
  Palette,
  Settings2,
  ShieldCheck,
  UserCog,
} from 'lucide-react'

export type AdminSectionGroupId = 'overview' | 'access' | 'appearance' | 'data' | 'ops' | 'comms'

export type AdminSectionGroup = {
  id: AdminSectionGroupId
  label: string
  order: number
}

export const ADMIN_SECTION_GROUPS: AdminSectionGroup[] = [
  { id: 'overview', label: 'ภาพรวม', order: 0 },
  { id: 'access', label: 'ผู้ใช้ & การเข้าถึง', order: 1 },
  { id: 'appearance', label: 'ธีม & การแสดงผล', order: 2 },
  { id: 'data', label: 'ข้อมูล & บันทึก', order: 3 },
  { id: 'ops', label: 'ระบบ & สำรอง', order: 4 },
  { id: 'comms', label: 'ประกาศ & ความปลอดภัย', order: 5 },
]

export type AdminSection = {
  /** Path segment after `/admin` (empty = console index) */
  segment: string
  to: string
  label: string
  description: string
  icon: LucideIcon
  permission: string
  group: AdminSectionGroupId
  /** Shown in nav but links to placeholder until Phase E */
  implemented: boolean
  tourTarget: string
}

/** Admin sections per 14-administrator.md — Phase F navigation */
export const ADMIN_SECTIONS: AdminSection[] = [
  {
    segment: '',
    to: '/admin',
    label: 'Admin Console',
    description: 'KPI และทางลัด',
    icon: LayoutDashboard,
    permission: 'admin.settings.read',
    group: 'overview',
    implemented: true,
    tourTarget: 'admin-console',
  },
  {
    segment: 'users',
    to: '/admin/users',
    label: 'ผู้ใช้งาน',
    description: 'Work center + member',
    icon: UserCog,
    permission: 'admin.users.read',
    group: 'access',
    implemented: true,
    tourTarget: 'admin-users',
  },
  {
    segment: 'roles',
    to: '/admin/roles',
    label: 'บทบาท & สิทธิ์',
    description: 'Permission matrix',
    icon: ShieldCheck,
    permission: 'admin.roles.read',
    group: 'access',
    implemented: true,
    tourTarget: 'admin-roles',
  },
  {
    segment: 'menu',
    to: '/admin/menu',
    label: 'Menu Builder',
    description: 'จัดการ tbmenu + รูปแบบเมนูหลัก',
    icon: ListTree,
    permission: 'admin.menu.read',
    group: 'access',
    implemented: true,
    tourTarget: 'admin-menu',
  },
  {
    segment: 'branding',
    to: '/admin/branding',
    label: 'ธีม & โลโก้',
    description: 'Logo, colors, typography',
    icon: Palette,
    permission: 'admin.branding.read',
    group: 'appearance',
    implemented: true,
    tourTarget: 'admin-branding',
  },
  {
    segment: 'settings',
    to: '/admin/settings',
    label: 'ตั้งค่าระบบ',
    description: 'Locale, flags, limits',
    icon: Settings2,
    permission: 'admin.settings.read',
    group: 'appearance',
    implemented: true,
    tourTarget: 'admin-settings',
  },
  {
    segment: 'master',
    to: '/admin/master',
    label: 'Master Data Hub',
    description: 'สรุป 17 ตาราง master',
    icon: Boxes,
    permission: 'master-data.read',
    group: 'data',
    implemented: true,
    tourTarget: 'admin-master',
  },
  {
    segment: 'audit',
    to: '/admin/audit',
    label: 'Audit log',
    description: 'กิจกรรม + export',
    icon: History,
    permission: 'admin.audit.read',
    group: 'data',
    implemented: true,
    tourTarget: 'admin-audit',
  },
  {
    segment: 'health',
    to: '/admin/health',
    label: 'สุขภาพระบบ',
    description: 'DB, disk, migration',
    icon: Activity,
    permission: 'admin.health.read',
    group: 'ops',
    implemented: true,
    tourTarget: 'admin-health',
  },
  {
    segment: 'backup',
    to: '/admin/backup',
    label: 'สำรอง & กู้คืน',
    description: 'pg_dump + schedule',
    icon: DatabaseBackup,
    permission: 'admin.backup.read',
    group: 'ops',
    implemented: true,
    tourTarget: 'admin-backup',
  },
  {
    segment: 'announcements',
    to: '/admin/announcements',
    label: 'ประกาศ',
    description: 'Banner / maintenance',
    icon: Megaphone,
    permission: 'admin.announcement.read',
    group: 'comms',
    implemented: true,
    tourTarget: 'admin-announcements',
  },
  {
    segment: 'security',
    to: '/admin/security',
    label: 'ความปลอดภัย',
    description: 'Failed login, RBAC deny',
    icon: Lock,
    permission: 'admin.security.read',
    group: 'comms',
    implemented: true,
    tourTarget: 'admin-security',
  },
  {
    segment: 'about',
    to: '/admin/about',
    label: 'เกี่ยวกับระบบ',
    description: 'Version, vendor',
    icon: Info,
    permission: 'admin.about.read',
    group: 'comms',
    implemented: true,
    tourTarget: 'admin-about',
  },
]

export type GroupedAdminSections = {
  group: AdminSectionGroup
  sections: AdminSection[]
}

/** Sections grouped for Admin Console quick links & command palette */
export function getGroupedAdminSections(opts?: {
  /** Exclude console index (segment '') */
  skipOverview?: boolean
}): GroupedAdminSections[] {
  const skipOverview = opts?.skipOverview ?? true
  const pool = ADMIN_SECTIONS.filter((s) => {
    if (!s.implemented) return false
    if (skipOverview && !s.segment) return false
    return true
  })

  return ADMIN_SECTION_GROUPS.map((group) => ({
    group,
    sections: pool.filter((s) => s.group === group.id),
  })).filter((g) => g.sections.length > 0)
}

export const ADMIN_READ_PERMISSIONS = [
  ...new Set([
    ...ADMIN_SECTIONS.map((s) => s.permission),
    'admin.menu.write',
    'admin.console.read',
  ]),
] as string[]

/** จำนวนหน้า admin ที่ implement แล้ว (รวม Console) */
export function countAccessibleAdminSections(
  permissions: string[] | undefined,
): { total: number; accessible: number } {
  const implemented = ADMIN_SECTIONS.filter((s) => s.implemented)
  const total = implemented.length
  if (!permissions?.length) {
    return { total, accessible: total }
  }
  const accessible = implemented.filter((s) => permissions.includes(s.permission)).length
  return { total, accessible }
}

export function adminSectionForPath(pathname: string): AdminSection | undefined {
  if (pathname === '/admin' || pathname === '/admin/') {
    return ADMIN_SECTIONS.find((s) => s.segment === '')
  }
  const match = ADMIN_SECTIONS.find(
    (s) => s.segment && pathname === `/admin/${s.segment}`,
  )
  return match
}
