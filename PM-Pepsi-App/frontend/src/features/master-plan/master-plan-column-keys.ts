/** Invisible suffix for duplicate Excel headers (e.g. two "Craft" columns on PK). */
const DEDUP_SEP = '\u0001'

/** Stable storage / React key for a column at `index` in the sheet header row. */
export function masterPlanColumnStorageKey(columns: readonly string[], index: number): string {
  const label = (columns[index] ?? '').trim()
  if (!label) return `__col${index}`
  let prior = 0
  for (let i = 0; i < index; i++) {
    if ((columns[i] ?? '').trim() === label) prior++
  }
  return prior === 0 ? label : `${label}${DEDUP_SEP}${prior + 1}`
}

export function masterPlanColumnDisplayLabel(storageKey: string): string {
  const i = storageKey.indexOf(DEDUP_SEP)
  return i >= 0 ? storageKey.slice(0, i) : storageKey
}

export function masterPlanColumnStorageKeys(columns: readonly string[]): string[] {
  return columns.map((_, index) => masterPlanColumnStorageKey(columns, index))
}

export function masterPlanCellValue(
  row: { cells: Record<string, string>; display: Record<string, string> },
  storageKey: string,
  displayLabel: string,
  isFirstLabelOccurrence: boolean,
): string {
  const fromDisplay = row.display[storageKey]
  if (fromDisplay !== undefined) return fromDisplay
  const fromCells = row.cells[storageKey]
  if (fromCells !== undefined) return fromCells
  if (isFirstLabelOccurrence) {
    return row.display[displayLabel] ?? row.cells[displayLabel] ?? ''
  }
  return ''
}
