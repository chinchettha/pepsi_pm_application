import { describe, expect, it } from 'vitest'
import { adminBreadcrumbTrail } from '@/lib/admin-breadcrumb'

describe('adminBreadcrumbTrail', () => {
  it('console index ends with Admin Console', () => {
    const trail = adminBreadcrumbTrail('/admin')
    expect(trail.at(-1)).toMatchObject({ label: 'Admin Console', current: true })
  })

  it('section page includes group then section', () => {
    const trail = adminBreadcrumbTrail('/admin/users')
    expect(trail.map((c) => c.label)).toEqual([
      'หน้าแรก',
      'ผู้ดูแลระบบ',
      'ผู้ใช้ & การเข้าถึง',
      'ผู้ใช้งาน',
    ])
    expect(trail.at(-1)?.current).toBe(true)
  })
})
