import { expect, test } from '@playwright/test'
import { apiLoginAs, personaCredentials, PLANNER_PERSONA, seedPersonaSession } from './helpers/auth'

const creds = personaCredentials('planner')
const canRun = Boolean(creds.username && creds.password)

test.describe('ISO 29110 — Planner persona (userst U)', () => {
  test.skip(!canRun, 'Set E2E_PLANNER_* or E2E_ADMIN_* or E2E_USE_DEV_SEED=1')

  test.beforeEach(async ({ page, request }) => {
    await seedPersonaSession(request, page, 'planner')
  })

  test('login session has planner userst and work center', async ({ request }) => {
    const { user } = await apiLoginAs(request, personaCredentials('planner'))
    const u = user as { userst?: string; wkctr?: string }
    expect(u.userst).toBe('U')
    expect(u.wkctr).toBe(PLANNER_PERSONA.expectedWkctr)
  })

  test('sidebar includes planner report modules', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.app-sidebar').first()).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('a[href="/activity-log"]').first()).toBeVisible()
    await expect(page.locator('a[href="/summary-weekly"]').first()).toBeVisible()
    await expect(page.locator('a[href="/calendar"]').first()).toBeVisible()
  })

  for (const path of ['/activity-log', '/manhours-hr', '/summary-weekly', '/planning']) {
    test(`page loads: ${path}`, async ({ page }) => {
      await page.goto(path)
      await expect(page.locator('main, [role="main"]').first()).toBeVisible({ timeout: 20_000 })
      await expect(page.getByText(/Access denied|ไม่มีสิทธิ์|no access/i)).toHaveCount(0)
    })
  }
})
