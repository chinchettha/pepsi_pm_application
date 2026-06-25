import { extractMasterPlanLinkKeys } from './master-plan-row-links.js'

/** Rank deep-link / search hits — exact Maintenance plan match wins. */
export function scoreMaintenancePlanQueryMatch(
  columnHeaders: string[],
  cells: Record<string, string>,
  display: Record<string, string>,
  query: string,
): number {
  const keys = extractMasterPlanLinkKeys(columnHeaders, cells, display)
  const q = query.trim()
  const mnt = keys.mntplan.trim()
  if (!q || !mnt) return 0
  if (mnt === q) return 100
  if (q.length >= 5 && mnt.endsWith(q)) return 85
  if (mnt.length >= 5 && q.endsWith(mnt)) return 85
  if (mnt.includes(q) || q.includes(mnt)) return 50
  return 0
}

export function buildMasterPlanSearchLabel(
  columnHeaders: string[],
  cells: Record<string, string>,
  display: Record<string, string>,
): string {
  const keys = extractMasterPlanLinkKeys(columnHeaders, cells, display)
  const parts = [
    keys.mntplan.trim(),
    keys.tasklist.trim(),
    keys.machine.trim(),
    keys.pmlist.trim(),
  ].filter(Boolean)
  if (parts.length > 0) return parts.slice(0, 2).join(' · ')
  for (const v of Object.values(display)) {
    const t = v?.trim()
    if (t) return t.length > 80 ? `${t.slice(0, 77)}…` : t
  }
  for (const v of Object.values(cells)) {
    const t = v?.trim()
    if (t) return t.length > 80 ? `${t.slice(0, 77)}…` : t
  }
  return ''
}

export function escapeIlikePattern(query: string): string {
  return query.replace(/[%_\\]/g, '\\$&')
}
