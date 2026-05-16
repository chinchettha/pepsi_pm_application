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

export function collectNavPaths(entries: NavEntry[]): string[] {
  return entries
    .filter((e): e is NavLinkEntry => e.kind === 'item')
    .map((e) => e.to)
}
