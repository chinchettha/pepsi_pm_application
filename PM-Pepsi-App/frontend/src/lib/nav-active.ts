/** NavLink-style active match for sidebar QA (U4g.10 nested routes) */
export function isNavPathActive(pathname: string, to: string, end?: boolean): boolean {
  const base = normalizePath(to)
  const path = normalizePath(pathname)
  if (end) return path === base
  if (path === base) return true
  return path.startsWith(`${base}/`)
}

function normalizePath(path: string): string {
  const trimmed = path.replace(/\/+$/, '') || '/'
  return trimmed || '/'
}
