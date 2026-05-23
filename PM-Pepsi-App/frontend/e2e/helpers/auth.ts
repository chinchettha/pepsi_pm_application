import type { APIRequestContext, Page } from '@playwright/test'

const API_BASE = process.env.PLAYWRIGHT_API_URL ?? 'http://127.0.0.1:4000'

export function e2eCredentials(): { username: string; password: string } | null {
  const username = process.env.E2E_ADMIN_USER?.trim()
  const password = process.env.E2E_ADMIN_PASSWORD
  if (!username || !password) return null
  return { username, password }
}

export async function seedAdminSession(
  request: APIRequestContext,
  page: Page,
): Promise<void> {
  const creds = e2eCredentials()
  if (!creds) {
    throw new Error('Set E2E_ADMIN_USER and E2E_ADMIN_PASSWORD for Playwright admin E2E')
  }

  const loginRes = await request.post(`${API_BASE}/api/v1/auth/login`, {
    data: { username: creds.username, password: creds.password, mode: 'workcenter' },
  })
  if (!loginRes.ok()) {
    throw new Error(`Login failed: ${loginRes.status()} ${await loginRes.text()}`)
  }
  const body = (await loginRes.json()) as { token: string; user: unknown }

  await page.addInitScript(
    ([token, user]) => {
      sessionStorage.setItem('pm_auth_token', token)
      sessionStorage.setItem('pm_auth_user', JSON.stringify(user))
      localStorage.removeItem('pm_seen_admin_tour')
    },
    [body.token, body.user],
  )
}
