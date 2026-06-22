import { expect, test, type APIRequestContext, type Page } from '@playwright/test'
import { API_BASE, apiLogin, e2eCredentials, seedAdminSession } from './helpers/auth.js'

const hasCreds = e2eCredentials() != null

const DELETE_SUCCESS = /Lookup option deleted|ลบรายการใน dropdown แล้ว/i
const IN_USE_ERROR = /Cannot delete — used by|ลบไม่ได้ — มีช่างใช้งานอยู่/i

async function openAddPersonnelWorkInfo(page: Page) {
  await page.goto('/admin/users', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: /Add personnel|เพิ่มบุคลากร/i }).click()
  await expect(page.getByRole('dialog', { name: /Add personnel|เพิ่มบุคลากร/i })).toBeVisible({
    timeout: 15_000,
  })
  await page.getByRole('tab', { name: /Work info|ข้อมูลงาน/i }).click()
}

function lookupRow(page: Page, entity: string) {
  return page.locator(`div:has(> a[href="/master-data?entity=${entity}"])`).first()
}

function lookupSelect(page: Page, entity: string) {
  return lookupRow(page, entity).locator('select')
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
  expect(res.ok(), await res.text()).toBeTruthy()
}

async function deleteDepartmentApi(request: APIRequestContext, token: string, id: string) {
  await request.delete(`${API_BASE}/api/v1/master-data/department/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

async function setWc001Department(request: APIRequestContext, token: string, iddepartment: string) {
  const putRes = await request.put(`${API_BASE}/api/v1/personnel/admin/WC001`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    data: {
      idwkctr: 'WC001',
      wkctr: 'WC001',
      iddepartment: iddepartment || null,
      userrole: 'technician',
    },
  })
  expect(putRes.ok(), await putRes.text()).toBeTruthy()
}

async function clearWc001Department(request: APIRequestContext, token: string) {
  await setWc001Department(request, token, '')
}

test.describe('Personnel Lookup L2 — edit / delete', () => {
  test.describe.configure({ mode: 'serial' })
  test.skip(!hasCreds, 'Set E2E_USE_DEV_SEED=1 or E2E_ADMIN_USER + E2E_ADMIN_PASSWORD')

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('pm-app.locale', 'en')
      localStorage.setItem('pm_seen_admin_tour', '1')
    })
  })

  test('delete unused department → removed from dropdown', async ({ page, request }) => {
    const stamp = Date.now().toString(36).toUpperCase()
    const deptId = `E2L2D${stamp}`
    const { token } = await apiLogin(request)

    try {
      await createDepartment(request, token, deptId, `E2E L2 delete ${stamp}`)
      await seedAdminSession(request, page)
      await openAddPersonnelWorkInfo(page)

      await lookupSelect(page, 'department').selectOption(deptId)
      await lookupRow(page, 'department').getByRole('button', { name: /^Delete$/i }).click()

      const confirm = page.getByRole('alertdialog')
      await expect(confirm).toBeVisible()
      await confirm.getByRole('button', { name: /^Delete$/i }).click()

      await expect(page.getByText(DELETE_SUCCESS).first()).toBeVisible({ timeout: 15_000 })
      await expect(lookupSelect(page, 'department')).toHaveValue('')
      await expect(lookupSelect(page, 'department').locator(`option[value="${deptId}"]`)).toHaveCount(
        0,
      )
    } finally {
      await deleteDepartmentApi(request, token, deptId)
    }
  })

  test('delete department used by WC001 → IN_USE error', async ({ page, request }) => {
    const { token } = await apiLogin(request)
    try {
      await setWc001Department(request, token, 'DEP01')
      await seedAdminSession(request, page)
      await openAddPersonnelWorkInfo(page)

      await lookupSelect(page, 'department').selectOption('DEP01')
      await lookupRow(page, 'department').getByRole('button', { name: /^Delete$/i }).click()
      const confirm = page.getByRole('alertdialog')
      await confirm.getByRole('button', { name: /^Delete$/i }).click()

      await expect(page.getByText(IN_USE_ERROR).first()).toBeVisible({ timeout: 15_000 })
      await expect(lookupSelect(page, 'department')).toHaveValue('DEP01')
    } finally {
      await clearWc001Department(request, token)
    }
  })

  test('edit department label → dropdown shows updated text', async ({ page, request }) => {
    const stamp = Date.now().toString(36).toUpperCase()
    const deptId = `E2L2E${stamp}`
    const newName = `Renamed ${stamp}`
    const { token } = await apiLogin(request)

    try {
      await createDepartment(request, token, deptId, `Before ${stamp}`)
      await seedAdminSession(request, page)
      await openAddPersonnelWorkInfo(page)

      await lookupSelect(page, 'department').selectOption(deptId)
      await lookupRow(page, 'department').getByRole('button', { name: /^Edit$/i }).click()

      const dlg = page.getByRole('dialog', { name: /Edit department/i })
      await dlg.getByLabel('Department', { exact: true }).fill(newName)
      await dlg.getByRole('button', { name: /^Update$/i }).click()
      await expect(dlg).toHaveCount(0, { timeout: 15_000 })

      await expect(lookupSelect(page, 'department').locator('option:checked')).toContainText(
        newName,
      )
    } finally {
      await deleteDepartmentApi(request, token, deptId)
    }
  })
})
