import { expect, test, type APIRequestContext } from '@playwright/test'
import { API_BASE, apiLogin, e2eCredentials, seedAdminSession, seedWorkcenterSession } from './helpers/auth.js'

const hasCreds = e2eCredentials() != null

const MANAGE_LINK = /Manage options/i
const HINT =
  /Dropdown options are managed in Master Data|รายการใน dropdown จัดการที่ Master Data/i
const CONTACT_ADMIN =
  /Contact an administrator to add dropdown options|ติดต่อผู้ดูแลระบบเพื่อเพิ่มรายการใน dropdown/i

const LOOKUP_ENTITY_HREFS = [
  '/master-data?entity=department',
  '/master-data?entity=position',
  '/master-data?entity=group',
  '/master-data?entity=worktype',
  '/master-data?entity=level',
] as const

async function openAddPersonnelWorkInfo(page: import('@playwright/test').Page) {
  await page.goto('/admin/users', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: /Add personnel|เพิ่มบุคลากร/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15_000 })
  await page.getByRole('tab', { name: /Work info|ข้อมูลงาน/i }).click()
}

function departmentSelect(page: import('@playwright/test').Page) {
  return page.locator('div:has(> a[href="/master-data?entity=department"]) > select')
}

async function createDepartment(
  request: APIRequestContext,
  token: string,
  iddepartment: string,
  department: string,
) {
  const res = await request.post(`${API_BASE}/api/v1/master-data/department`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    data: { iddepartment, department },
  })
  expect(res.ok(), `createDepartment ${iddepartment}: ${await res.text()}`).toBeTruthy()
}

async function deleteDepartment(request: APIRequestContext, token: string, iddepartment: string) {
  await request.delete(`${API_BASE}/api/v1/master-data/department/${encodeURIComponent(iddepartment)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

/** RequireAuth calls /auth/me and overwrites session — mock response for RBAC UI tests. */
async function mockMasterDataReadonlyAuthMe(page: import('@playwright/test').Page) {
  await page.route('**/api/v1/auth/me', async (route) => {
    const res = await route.fetch()
    const body = (await res.json()) as { user: Record<string, unknown> }
    const base = Array.isArray(body.user.permissions)
      ? [...(body.user.permissions as string[])]
      : []
    const perms = base.filter((p) => p !== 'master-data.write')
    for (const p of [
      'master-data.read',
      'admin.users.read',
      'admin.users.write',
      'personnel.read',
    ]) {
      if (!perms.includes(p)) perms.push(p)
    }
    await route.fulfill({
      status: res.status(),
      contentType: 'application/json',
      body: JSON.stringify({
        user: { ...body.user, userst: 'U', permissions: perms },
      }),
    })
  })
}

test.describe('Personnel Lookup L0 — Work info manage links', () => {
  test.describe.configure({ mode: 'serial' })
  test.skip(!hasCreds, 'Set E2E_USE_DEV_SEED=1 or E2E_ADMIN_USER + E2E_ADMIN_PASSWORD')

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('pm-app.locale', 'en')
      localStorage.setItem('pm_seen_admin_tour', '1')
    })
  })

  test('admin with master-data.write — hint + 5 manage links (new tab)', async ({ page, request }) => {
    await seedAdminSession(request, page)
    await openAddPersonnelWorkInfo(page)

    await expect(page.getByText(HINT)).toBeVisible()
    const links = page.getByRole('link', { name: MANAGE_LINK })
    await expect(links).toHaveCount(5)

    const hrefs = await links.evaluateAll((els) => els.map((el) => el.getAttribute('href')))
    for (const expected of LOOKUP_ENTITY_HREFS) {
      expect(hrefs).toContain(expected)
    }

    for (const href of LOOKUP_ENTITY_HREFS) {
      await expect(page.locator(`a[href="${href}"]`)).toHaveAttribute('target', '_blank')
    }

    await expect(page.getByText(CONTACT_ADMIN)).toHaveCount(0)
  })

  test('admin — add department via API → focus refresh → dropdown updated', async ({
    page,
    request,
  }) => {
    const deptId = `E2EL0${Date.now().toString(36).toUpperCase()}`
    const deptName = `E2E L0 dept ${deptId}`

    const { token } = await apiLogin(request)
    await seedAdminSession(request, page)
    await openAddPersonnelWorkInfo(page)

    const select = departmentSelect(page)
    await expect(select).toBeVisible()
    await expect(select.locator(`option[value="${deptId}"]`)).toHaveCount(0)

    try {
      await createDepartment(request, token, deptId, deptName)
      await page.evaluate(() => window.dispatchEvent(new Event('focus')))
      await expect(select.locator(`option[value="${deptId}"]`)).toHaveCount(1, { timeout: 15_000 })
    } finally {
      await deleteDepartment(request, token, deptId)
    }
  })

  test('user without master-data.write — hint + contact admin, links stay read-only', async ({
    page,
    request,
  }) => {
    const creds = e2eCredentials()!
    await mockMasterDataReadonlyAuthMe(page)
    await seedWorkcenterSession(request, page, creds, { override: 'master-data-readonly' })
    await openAddPersonnelWorkInfo(page)

    await expect(page.getByText(HINT)).toBeVisible()
    await expect(page.getByText(CONTACT_ADMIN).first()).toBeVisible()
    await expect(page.getByRole('link', { name: MANAGE_LINK })).toHaveCount(5)
  })
})
