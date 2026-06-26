/**
 * Routes hidden from sidebar and deep links until technician manual-entry pages ship.
 * Re-enable by removing paths here and restoring nav-config + App route.
 */
export const HIDDEN_NAV_ROUTES = ['/pm-vibration'] as const

const HIDDEN_NAV_ROUTE_SET = new Set<string>(HIDDEN_NAV_ROUTES)

export function isHiddenNavRoute(path: string): boolean {
  const base = path.split('?')[0] ?? path
  return HIDDEN_NAV_ROUTE_SET.has(base)
}
