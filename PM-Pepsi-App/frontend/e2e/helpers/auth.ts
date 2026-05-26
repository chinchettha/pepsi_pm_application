import type { APIRequestContext, Page } from '@playwright/test'

export const API_BASE = process.env.PLAYWRIGHT_API_URL ?? 'http://127.0.0.1:4000'

/** Dev seed `009_dev_auth_seed.sql`: ADMIN01 / admin — only when E2E_USE_DEV_SEED=1 */
function devSeedCredentials(): { username: string; password: string } | null {
  if (process.env.E2E_USE_DEV_SEED !== '1') return null
  return { username: 'ADMIN01', password: 'admin' }
}

export function e2eCredentials(): { username: string; password: string } | null {
  const username = process.env.E2E_ADMIN_USER?.trim()
  const password = process.env.E2E_ADMIN_PASSWORD
  if (username && password) return { username, password }
  return devSeedCredentials()
}

export async function apiLogin(request: APIRequestContext): Promise<{
  token: string
  user: unknown
  apiBase: string
}> {
  const creds = e2eCredentials()
  if (!creds) {
    throw new Error('Set E2E_ADMIN_USER/E2E_ADMIN_PASSWORD or E2E_USE_DEV_SEED=1')
  }
  const loginRes = await request.post(`${API_BASE}/api/v1/auth/login`, {
    data: { username: creds.username, password: creds.password, mode: 'workcenter' },
  })
  if (!loginRes.ok()) {
    throw new Error(`Login failed: ${loginRes.status()} ${await loginRes.text()}`)
  }
  const body = (await loginRes.json()) as { token: string; user: unknown }
  return { token: body.token, user: body.user, apiBase: API_BASE }
}

export async function seedAdminSession(
  request: APIRequestContext,
  page: Page,
  opts?: { clearTourSeen?: boolean },
): Promise<void> {
  const { token, user } = await apiLogin(request)
  const clearTourSeen = opts?.clearTourSeen ?? false

  await page.addInitScript(
    ([tok, usr, clearSeen]) => {
      sessionStorage.setItem('pm_auth_token', tok)
      sessionStorage.setItem('pm_auth_user', JSON.stringify(usr))
      if (clearSeen) {
        localStorage.removeItem('pm_seen_admin_tour')
      } else {
        localStorage.setItem('pm_seen_admin_tour', '1')
      }
    },
    [token, user, clearTourSeen],
  )
}
