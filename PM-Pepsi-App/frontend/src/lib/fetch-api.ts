import { getAuthToken } from '@/features/auth/login-api'
import { getApiBaseUrl } from '@/lib/api-client'

/**
 * เรียก API แบบ same-origin path `/api/...` เมื่อไม่ตั้ง VITE_API_URL
 * (เหมาะกับ reverse proxy ไป backend ใน dev)
 */
export async function fetchApi<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const base = getApiBaseUrl()
  const p = path.startsWith('/') ? path : `/${path}`
  const url = base ? `${base}${p}` : p
  const token = getAuthToken()
  const res = await fetch(url, {
    credentials: 'include',
    ...init,
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    if (text) {
      try {
        const body = JSON.parse(text) as { message?: string }
        if (body.message) throw new Error(body.message)
      } catch (e) {
        if (e instanceof Error && e.message !== text) throw e
      }
    }
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}
