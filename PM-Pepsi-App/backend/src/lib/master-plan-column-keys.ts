/** Invisible suffix for duplicate Excel headers (e.g. two "Craft" columns on PK). */
const DEDUP_SEP = '\u0001'

export function masterPlanColumnStorageKey(columns: readonly string[], index: number): string {
  const label = String(columns[index] ?? '').trim()
  if (!label) return `__col${index}`
  let prior = 0
  for (let i = 0; i < index; i++) {
    if (String(columns[i] ?? '').trim() === label) prior++
  }
  return prior === 0 ? label : `${label}${DEDUP_SEP}${prior + 1}`
}

export function masterPlanColumnStorageKeys(columns: readonly string[]): string[] {
  return columns.map((_, index) => masterPlanColumnStorageKey(columns, index))
}
