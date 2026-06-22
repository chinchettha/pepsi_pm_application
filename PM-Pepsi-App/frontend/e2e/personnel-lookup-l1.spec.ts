import { expect, test, type APIRequestContext, type Page } from '@playwright/test'
import { API_BASE, apiLogin, e2eCredentials, seedAdminSession } from './helpers/auth.js'

const hasCreds = e2eCredentials() != null

const QUICK_ADD_SUCCESS = /Lookup option added|เพิ่มรายการใน dropdown แล้ว/i
const DUPLICATE_ERROR = /This code already exists|รหัสนี้มีอยู่แล้ว/i

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

async function deleteDepartment(request: APIRequestContext, token: string, id: string) {
  await request.delete(`${API_BASE}/api/v1/master-data/department/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

async function deleteWorktype(request: APIRequestContext, token: string, id: string) {
  await request.delete(`${API_BASE}/api/v1/master-data/worktype/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

async function deletePosition(request: APIRequestContext, token: string, id: string) {
  await request.delete(`${API_BASE}/api/v1/master-data/position/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

async function deleteLevel(request: APIRequestContext, token: string, id: string) {
  await request.delete(`${API_BASE}/api/v1/master-data/level/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

async function deleteGroup(request: APIRequestContext, token: string, id: number) {
  await request.delete(`${API_BASE}/api/v1/master-data/group/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

async function deletePersonnel(request: APIRequestContext, token: string, idwkctr: string) {
  await request.delete(`${API_BASE}/api/v1/personnel/admin/${encodeURIComponent(idwkctr)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

test.describe('Personnel Lookup L1 — Quick add', () => {
  test.describe.configure({ mode: 'serial' })
  test.skip(!hasCreds, 'Set E2E_USE_DEV_SEED=1 or E2E_ADMIN_USER + E2E_ADMIN_PASSWORD')

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('pm-app.locale', 'en')
      localStorage.setItem('pm_seen_admin_tour', '1')
    })
  })

  test('quick add Department → dropdown selected → save new personnel', async ({ page, request }) => {
    const stamp = Date.now().toString(36).toUpperCase()
    const deptId = `E2L1D${stamp}`
    const deptName = `E2E L1 department ${stamp}`
    const hrId = `E2EL1${stamp}`
    const wkctr = `PAC${String(Date.now() % 900 + 100)}`

    const { token } = await apiLogin(request)
    await seedAdminSession(request, page)
    await openAddPersonnelWorkInfo(page)

    await lookupRow(page, 'department').getByRole('button', { name: /^Add$/ }).click()
    const quickDlg = page.getByRole('dialog', { name: /Create department/i })
    await quickDlg.getByLabel('Department code').fill(deptId)
    await quickDlg.getByLabel('Department', { exact: true }).fill(deptName)
    await quickDlg.getByRole('button', { name: /^Create$/ }).click()

    await expect(page.getByText(QUICK_ADD_SUCCESS)).toBeVisible({ timeout: 15_000 })
    await expect(quickDlg).toHaveCount(0)
    await expect(lookupSelect(page, 'department')).toHaveValue(deptId)

    await page.getByRole('tab', { name: /Personal info/i }).click()
    await page.getByRole('textbox').first().fill(hrId)
    await page.getByRole('tab', { name: /Work info/i }).click()
    await page.getByPlaceholder(/PAC007|PRO011|UTI004/i).fill(wkctr)

    const saveRes = page.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/personnel/admin') &&
        res.request().method() === 'POST' &&
        res.ok(),
      { timeout: 20_000 },
    )
    await page.getByRole('button', { name: /Add record/i }).click()
    await saveRes

    await expect(page.getByText(new RegExp(`Added ${hrId}|เพิ่มแล้ว ${hrId}`, 'i'))).toBeVisible({
      timeout: 15_000,
    })
    await expect(page.getByRole('dialog', { name: /Add personnel/i })).toHaveCount(0)

    try {
      await deletePersonnel(request, token, hrId)
    } finally {
      await deleteDepartment(request, token, deptId)
    }
  })

  test('duplicate department code → toast error, modals stay open', async ({ page, request }) => {
    await seedAdminSession(request, page)
    await openAddPersonnelWorkInfo(page)

    await lookupRow(page, 'department').getByRole('button', { name: /^Add$/ }).click()
    const quickDlg = page.getByRole('dialog', { name: /Create department/i })
    await quickDlg.getByLabel('Department code').fill('DEP01')
    await quickDlg.getByLabel('Department', { exact: true }).fill('Duplicate E2E')
    await quickDlg.getByRole('button', { name: /^Create$/ }).click()

    await expect(quickDlg.getByText(DUPLICATE_ERROR)).toBeVisible({ timeout: 15_000 })
    await expect(quickDlg).toBeVisible()
    await quickDlg.getByRole('button', { name: /^Cancel$/ }).click()
    await expect(quickDlg).toHaveCount(0)
    await expect(page.getByRole('button', { name: /Add record/i })).toBeVisible()
    await expect(lookupSelect(page, 'department')).toHaveValue('')
  })

  test('quick add all 5 lookup types → each dropdown gets new value', async ({ page, request }) => {
    const stamp = Date.now().toString(36).toUpperCase()
    const { token } = await apiLogin(request)
    const created: {
      department?: string
      worktype?: string
      position?: string
      groupId?: number
      level?: string
    } = {}

    await seedAdminSession(request, page)
    await openAddPersonnelWorkInfo(page)

  // Department
    const deptId = `E2L1A${stamp}`
    await lookupRow(page, 'department').getByRole('button', { name: /^Add$/ }).click()
    let dlg = page.getByRole('dialog', { name: /Create department/i })
    await dlg.getByLabel('Department code').fill(deptId)
    await dlg.getByLabel('Department', { exact: true }).fill(`Dept ${stamp}`)
    await dlg.getByRole('button', { name: /^Create$/ }).click()
    await expect(dlg).toHaveCount(0, { timeout: 15_000 })
    await expect(lookupSelect(page, 'department')).toHaveValue(deptId)
    created.department = deptId

    // Position
    const posId = `E2L1P${stamp}`
    await lookupRow(page, 'position').getByRole('button', { name: /^Add$/ }).click()
    dlg = page.getByRole('dialog', { name: /Create position/i })
    await dlg.getByLabel('Position code').fill(posId)
    await dlg.getByLabel('Description', { exact: true }).fill(`Pos ${stamp}`)
    await dlg.getByRole('button', { name: /^Create$/ }).click()
    await expect(dlg).toHaveCount(0, { timeout: 15_000 })
    await expect(lookupSelect(page, 'position')).toHaveValue(posId)
    created.position = posId

    // Group
    const grpCode = `E2G${stamp}`
    await lookupRow(page, 'group').getByRole('button', { name: /^Add$/ }).click()
    dlg = page.getByRole('dialog', { name: /Create group/i })
    await dlg.getByLabel('Group', { exact: true }).fill(grpCode)
    await dlg.getByLabel('Group description').fill(`Group ${stamp}`)
    await dlg.getByRole('button', { name: /^Create$/ }).click()
    await expect(dlg).toHaveCount(0, { timeout: 15_000 })
    const groupValue = await lookupSelect(page, 'group').inputValue()
    expect(groupValue).not.toBe('')
    created.groupId = Number(groupValue)

    // Work type
    const typeId = `E2T${stamp}`
    await lookupRow(page, 'worktype').getByRole('button', { name: /^Add$/ }).click()
    dlg = page.getByRole('dialog', { name: /Create work type/i })
    await dlg.getByLabel('Code', { exact: true }).fill(typeId)
    await dlg.getByLabel('Description', { exact: true }).fill(`Type ${stamp}`)
    await dlg.getByRole('button', { name: /^Create$/ }).click()
    await expect(dlg).toHaveCount(0, { timeout: 15_000 })
    await expect(lookupSelect(page, 'worktype')).toHaveValue(typeId)
    created.worktype = typeId

    // Level
    const lvlId = `E2L1L${stamp}`
    await lookupRow(page, 'level').getByRole('button', { name: /^Add$/ }).click()
    dlg = page.getByRole('dialog', { name: /Create level/i })
    await dlg.getByLabel('Level code').fill(lvlId)
    await dlg.getByLabel('Description', { exact: true }).fill(`Level ${stamp}`)
    await dlg.getByRole('button', { name: /^Create$/ }).click()
    await expect(dlg).toHaveCount(0, { timeout: 15_000 })
    await expect(lookupSelect(page, 'level')).toHaveValue(lvlId)
    created.level = lvlId

    try {
      // values asserted above
    } finally {
      if (created.department) await deleteDepartment(request, token, created.department)
      if (created.position) await deletePosition(request, token, created.position)
      if (created.worktype) await deleteWorktype(request, token, created.worktype)
      if (created.level) await deleteLevel(request, token, created.level)
      if (created.groupId && Number.isFinite(created.groupId)) {
        await deleteGroup(request, token, created.groupId)
      }
    }
  })
})
