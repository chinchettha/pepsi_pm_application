import { expect, test } from '@playwright/test'
import {
  attachConsoleCollector,
  formatConsoleIssues,
} from './helpers/console-errors.js'
import { e2eCredentials, seedAdminSession } from './helpers/auth.js'

const hasCreds = e2eCredentials() != null

const PM_CHART_TABS = [
  { path: '/pm-charts/vibration', tabKey: 'vibration' },
  { path: '/pm-charts/current', tabKey: 'current' },
  { path: '/pm-charts/combustion', tabKey: 'combustion' },
] as const

test.describe('PM Chart Design smoke', () => {
  test.skip(!hasCreds, 'Set E2E_USE_DEV_SEED=1 or E2E_ADMIN_USER + E2E_ADMIN_PASSWORD')

  test.beforeEach(async ({ page, request }) => {
    await page.addInitScript(() => {
      localStorage.setItem('pm-app.locale', 'en')
      localStorage.setItem('pm_seen_admin_tour', '1')
    })
    await seedAdminSession(request, page)
  })

  test('index redirects to vibration', async ({ page }) => {
    await page.goto('/pm-charts', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/pm-charts\/vibration/, { timeout: 20_000 })
  })

  test('toolbar export/import controls render', async ({ page }) => {
    const issues = attachConsoleCollector(page)
    await page.goto('/pm-charts/vibration', { waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('button', { name: /Export PMChartDesign\.xlsx/i })).toBeVisible({
      timeout: 20_000,
    })
    await expect(page.getByRole('button', { name: /Export report/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Import PMChartDesign\.xlsx/i })).toBeVisible()

    await expect(page.getByText(/View period/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /^Daily$/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Yearly$/i })).toBeVisible()

    expect(issues, formatConsoleIssues('/pm-charts/vibration', issues)).toEqual([])
  })

  for (const { path, tabKey } of PM_CHART_TABS) {
    test(`${tabKey} tab loads table and chart section`, async ({ page }) => {
      const issues = attachConsoleCollector(page)
      await page.goto(path, { waitUntil: 'domcontentloaded' })

      await expect(page.locator('main, [role="main"]').first()).toBeVisible({ timeout: 25_000 })
      await expect(page.getByRole('link', { name: new RegExp(tabKey, 'i') }).first()).toBeVisible()

      await expect(page.locator('table').first()).toBeVisible({ timeout: 20_000 })
      await expect(page.locator('[data-pm-chart-plot], canvas').first()).toBeVisible({
        timeout: 20_000,
      })

      expect(issues, formatConsoleIssues(path, issues)).toEqual([])
    })
  }

  test('vibration add row updates grid without crash', async ({ page }) => {
    const issues = attachConsoleCollector(page)
    const sheetLoad = page.waitForResponse(
      (r) => r.url().includes('/api/v1/pm-charts/vibration') && r.request().method() === 'GET',
    )
    await page.goto('/pm-charts/vibration', { waitUntil: 'domcontentloaded' })
    await sheetLoad

    const addBtn = page.getByRole('button', { name: /Add reading/i })
    await expect(addBtn).toBeVisible({ timeout: 20_000 })

    const dataRows = page
      .locator('section')
      .filter({ hasText: /Vibration Main Oil Pump/i })
      .locator('tbody tr')
    const rowsBefore = await dataRows.count()
    await addBtn.click()
    await expect(dataRows).toHaveCount(rowsBefore + 1, { timeout: 10_000 })

    expect(issues, formatConsoleIssues('/pm-charts/vibration add-row', issues)).toEqual([])
  })
})
