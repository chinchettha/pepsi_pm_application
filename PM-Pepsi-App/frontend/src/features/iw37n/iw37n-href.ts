/** Deep link to IW37N list filtered by maintenance plan / search query. */
export function buildIw37nHref(query: string): string {
  const q = query.trim()
  if (!q) return '/iw37n'
  return `/iw37n?${new URLSearchParams({ q }).toString()}`
}

/** Deep link from move-request notification — open import + edit row. */
export function buildIw37nMoveRequestHref(idiw37: number): string {
  const params = new URLSearchParams({
    idiw37: String(idiw37),
    focus: 'import',
  })
  return `/iw37n?${params.toString()}`
}

/** In-app notification entry — planning hub before IW37N import. */
export function buildPlanningMoveRequestHref(idiw37: number): string {
  return `/planning?${new URLSearchParams({ idiw37: String(idiw37) }).toString()}`
}
