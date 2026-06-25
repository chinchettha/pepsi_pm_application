import type { Iw37nItem } from '@/api/schemas'

/** Unit column — template uses "MIN"; legacy imports may omit text in DB. */
export function formatIw37nWorkUnit(it: Iw37nItem): string {
  if (it.untime != null && Number.isFinite(it.untime)) return String(it.untime)
  if (it.work != null || it.actwork != null) return 'MIN'
  return ''
}
