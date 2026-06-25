export type FuncLocRow = {
  functionalloc: string
  funcdescrip: string
}

/** True when IW37N Functional Loc. belongs to a tasklist legacy (e.g. `P17-HR-ME2 · ME · P17`). */
export function legacyMatchesFunctionalloc(legacy: string, functionalloc: string): boolean {
  const l = legacy.trim()
  const fl = functionalloc.trim()
  if (!l || !fl) return false
  if (fl === l) return true
  if (fl.startsWith(`${l} ·`) || fl.startsWith(`${l}·`)) return true
  if (fl.startsWith(`${l} /`) || fl.startsWith(`${l} -`)) return true
  if (fl.startsWith(l) && fl.length > l.length) {
    const next = fl[l.length]
    if (next && !/[A-Za-z0-9]/.test(next)) return true
  }
  return false
}

/** Build legacy → FunctLocDescrip. from distinct IW37N rows (first match per legacy wins). */
export function buildFuncLocDescripByLegacyMap(rows: FuncLocRow[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const row of rows) {
    const fl = row.functionalloc.trim()
    const desc = row.funcdescrip.trim()
    if (!fl || !desc) continue
    for (const legacy of extractLegacyCandidatesFromFunctionalloc(fl)) {
      if (!map.has(legacy)) map.set(legacy, desc)
    }
  }
  return map
}

function extractLegacyCandidatesFromFunctionalloc(functionalloc: string): string[] {
  const fl = functionalloc.trim()
  if (!fl) return []
  const head = fl.split(/\s*[·/]\s*/)[0]?.trim() ?? fl
  return head === fl ? [fl] : [head, fl]
}

export function resolveFuncLocDescripForLegacy(
  legacy: string,
  byLegacy: Map<string, string>,
  woRow?: FuncLocRow | null,
): string {
  const l = legacy.trim()
  if (!l) return ''

  const fromMap = byLegacy.get(l)
  if (fromMap) return fromMap

  if (woRow && legacyMatchesFunctionalloc(l, woRow.functionalloc)) {
    return woRow.funcdescrip.trim()
  }

  for (const [fl, desc] of byLegacy.entries()) {
    if (legacyMatchesFunctionalloc(l, fl)) return desc
  }

  return ''
}
