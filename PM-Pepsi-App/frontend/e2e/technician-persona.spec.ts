import { expect, test } from '@playwright/test'
import { apiLoginAs, personaCredentials, seedPersonaSession, TECHNICIAN_PERSONA } from './helpers/auth'

const creds = personaCredentials('technician')
const canRun = Boolean(creds.username && creds.password)

test.describe('ISO 29110 — Technician persona (userst W)', () => {
  test.skip(!canRun, 'Set E2E_TECH_* (default WC001/wc001) or run dev auth seed')

  test.beforeEach(async ({ page, request }) => {
    await seedPersonaSession(request, page, 'technician')
  })

  test('login session has technician userst and PAC work center', async ({ request }) => {
    const { user } = await apiLoginAs(request, personaCredentials('technician'))
    const u = user as { userst?: string; wkctr?: string }
    expect(u.userst).toBe('W')
    expect(u.wkctr).toBe(TECHNICIAN_PERSONA.expectedWkctr)
  })

  test('sidebar shows field routes, hides planner reports', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.app-sidebar').first()).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('a[href="/plan-calendar"]').first()).toBeVisible()
    await expect(page.locator('a[href="/confirmation"]').first()).toBeVisible()
    await expect(page.locator('a[href="/manhours-hr"]').first()).toBeVisible()
    await expect(page.locator('a[href="/activity-log"]')).toHaveCount(0)
    await expect(page.locator('a[href="/summary-weekly"]')).toHaveCount(0)
  })

  for (const path of ['/plan-calendar', '/confirmation', '/manhours-hr']) {
    test(`page loads: ${path}`, async ({ page }) => {
      await page.goto(path)
      await expect(page.locator('main, [role="main"]').first()).toBeVisible({ timeout: 20_000 })
      await expect(page.getByText(/Access denied|ไม่มีสิทธิ์|no access/i)).toHaveCount(0)
    })
  }

  for (const path of ['/activity-log', '/summary-weekly']) {
    test(`deep link blocked: ${path}`, async ({ page }) => {
      await page.goto(path)
      await expect(page).not.toHaveURL(new RegExp(`${path.replace('/', '\\/')}(?:/|$)`), {
        timeout: 20_000,
      })
    })
  }
})
