import type { APIRequestContext, Page } from '@playwright/test'
import type { TestPersona, TestPersonaId } from '../../src/lib/test-personas'
import { personaById, PLANNER_PERSONA, TECHNICIAN_PERSONA } from '../../src/lib/test-personas'

export const API_BASE = process.env.PLAYWRIGHT_API_URL ?? 'http://127.0.0.1:4000'

/** Dev seed — Planner: ADMIN01/admin · Technician: WC001/wc001 (wkctr PAC002) */
function devSeedCredentials(): { username: string; password: string } | null {
  if (process.env.E2E_USE_DEV_SEED !== '1') return null
  return { username: PLANNER_PERSONA.username, password: PLANNER_PERSONA.password }
}

export function e2eCredentials(): { username: string; password: string } | null {
  const username = process.env.E2E_ADMIN_USER?.trim()
  const password = process.env.E2E_ADMIN_PASSWORD
  if (username && password) return { username, password }
  return devSeedCredentials()
}

export function personaCredentials(id: TestPersonaId): { username: string; password: string } {
  const p = personaById(id)
  if (id === 'planner') {
    const user = process.env.E2E_PLANNER_USER?.trim()
    const pass = process.env.E2E_PLANNER_PASSWORD
    if (user && pass) return { username: user, password: pass }
    if (process.env.E2E_ADMIN_USER && process.env.E2E_ADMIN_PASSWORD) {
      return { username: process.env.E2E_ADMIN_USER, password: process.env.E2E_ADMIN_PASSWORD }
    }
    return { username: p.username, password: p.password }
  }
  const user = process.env.E2E_TECH_USER?.trim()
  const pass = process.env.E2E_TECH_PASSWORD
  if (user && pass) return { username: user, password: pass }
  return { username: p.username, password: p.password }
}

export async function apiLoginAs(
  request: APIRequestContext,
  creds: { username: string; password: string },
): Promise<{
  token: string
  user: unknown
  apiBase: string
}> {
  const loginRes = await request.post(`${API_BASE}/api/v1/auth/login`, {
    data: { username: creds.username, password: creds.password, mode: 'workcenter' },
  })
  if (!loginRes.ok()) {
    throw new Error(`Login failed (${creds.username}): ${loginRes.status()} ${await loginRes.text()}`)
  }
  const body = (await loginRes.json()) as { token: string; user: unknown }
  return { token: body.token, user: body.user, apiBase: API_BASE }
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
  return apiLoginAs(request, creds)
}

export async function seedPersonaSession(
  request: APIRequestContext,
  page: Page,
  personaId: TestPersonaId,
  opts?: { clearTourSeen?: boolean },
): Promise<TestPersona> {
  const persona = personaById(personaId)
  const creds = personaCredentials(personaId)
  const { token, user } = await apiLoginAs(request, creds)
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
      localStorage.setItem('pm_sidebar_pinned', '1')
    },
    [token, user, clearTourSeen],
  )
  return persona
}

export async function seedAdminSession(
  request: APIRequestContext,
  page: Page,
  opts?: { clearTourSeen?: boolean },
): Promise<void> {
  await seedPersonaSession(request, page, 'planner', opts)
}

export { PLANNER_PERSONA, TECHNICIAN_PERSONA }
