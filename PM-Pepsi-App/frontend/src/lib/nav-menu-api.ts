import { navMenuResponseSchema, type NavMenuItem } from '@/api/schemas'
import { appNav, type NavEntry, type NavLinkEntry } from '@/components/layout/nav-config'
import { fetchApi } from '@/lib/fetch-api'
import { resolveNavIcon } from '@/lib/nav-icon-map'

export async function fetchNavMenu() {
  const json = await fetchApi<unknown>('/api/v1/nav/menu')
  return navMenuResponseSchema.parse(json)
}

export function apiNavItemsToEntries(items: NavMenuItem[]): NavEntry[] {
  return items.map((item) => {
    if (item.kind === 'heading') {
      return { kind: 'heading' as const, label: item.label }
    }
    const link: NavLinkEntry = {
      kind: 'item',
      to: item.to,
      label: item.label,
      menuright: item.menuright,
      icon: resolveNavIcon(item.to, item.icon),
      end: item.end,
    }
    return link
  })
}

/** fallback เมื่อ API ว่างหรือ error */
export function getFallbackNav(): NavEntry[] {
  return appNav
}

/**
 * เติมเมนูจาก nav-config ที่ยังไม่มีใน tbmenu (เช่น /admin/branding ก่อนรัน migration 048)
 * แทรกก่อนหัวข้อ "ระบบ" ถ้ามี
 */
export function supplementNavFromFallback(
  apiEntries: NavEntry[],
  fallback: NavEntry[] = appNav,
): NavEntry[] {
  const apiPaths = new Set(
    apiEntries
      .filter((e): e is NavLinkEntry => e.kind === 'item')
      .map((e) => e.to),
  )

  const missingBlocks: NavEntry[] = []
  let i = 0
  while (i < fallback.length) {
    const entry = fallback[i]
    if (entry.kind === 'heading') {
      const blockItems: NavLinkEntry[] = []
      let j = i + 1
      while (j < fallback.length && fallback[j].kind !== 'heading') {
        const item = fallback[j] as NavLinkEntry
        if (!apiPaths.has(item.to)) blockItems.push(item)
        j++
      }
      if (blockItems.length > 0) {
        missingBlocks.push(entry)
        missingBlocks.push(...blockItems)
      }
      i = j
      continue
    }
    i++
  }

  if (missingBlocks.length === 0) return apiEntries

  const systemIdx = apiEntries.findIndex(
    (e) => e.kind === 'heading' && e.label.includes('ระบบ'),
  )
  if (systemIdx >= 0) {
    return [...apiEntries.slice(0, systemIdx), ...missingBlocks, ...apiEntries.slice(systemIdx)]
  }
  return [...apiEntries, ...missingBlocks]
}

export function collectNavPaths(entries: NavEntry[]): string[] {
  return entries
    .filter((e): e is NavLinkEntry => e.kind === 'item')
    .map((e) => e.to)
}
