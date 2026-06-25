import XLSX from 'xlsx'
import type { MasterPlanDiscipline } from './master-plan-parse.js'

type DisciplineScores = Record<MasterPlanDiscipline, number>

const PK_SHEET_MARKERS = [/^pk\d/i, /\(production\)/i, /^distribution$/i]

function scoreSheetNames(sheetNames: string[], scores: DisciplineScores): void {
  if (sheetNames.some((n) => /total master plan \(pr\)/i.test(n))) scores.ME += 60
  if (sheetNames.some((n) => /total master plan \(am\)/i.test(n))) scores.EE += 60
  if (sheetNames.some((n) => /^legend$/i.test(n))) scores.ME += 25

  for (const name of sheetNames) {
    if (PK_SHEET_MARKERS.some((re) => re.test(name))) scores.PK += 12
  }

  const count = sheetNames.length
  if (count >= 28) scores.PK += 40
  else if (count === 16) scores.ME += 22
  else if (count === 15) scores.EE += 22
}

function cellStr(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'number' && Number.isFinite(v)) return String(Math.trunc(v))
  return String(v).trim()
}

function normHeader(v: unknown): string {
  return cellStr(v).toLowerCase().replace(/\s+/g, ' ')
}

function findHeaderRow(values: unknown[][]): { rowIndex: number; headers: string[] } | null {
  for (let i = 0; i < Math.min(values.length, 25); i++) {
    const row = values[i] ?? []
    const headers = row.map((c) => cellStr(c))
    const normalized = headers.map(normHeader)
    const hasZone = normalized.some((h) => h === 'zone')
    const hasPmList = normalized.some((h) => h.includes('pm list'))
    if (hasZone && hasPmList) return { rowIndex: i, headers }
  }
  return null
}

function scoreFilename(filename: string, scores: DisciplineScores): void {
  const fn = filename.trim().toLowerCase()
  if (!fn) return
  if (/packing|master\s*pm\s*packing/.test(fn)) scores.PK += 90
  if (/process\s*ee|master\s*pm\s*process\s*ee/.test(fn)) scores.EE += 90
  if (/process\s*me|master\s*pm\s*process\s*me/.test(fn)) scores.ME += 90
  if (/\bee\b/.test(fn) && !/packing|process\s*me/.test(fn)) scores.EE += 35
  if (/\bme\b/.test(fn) && !/packing|process\s*ee/.test(fn)) scores.ME += 35
  if (/\bpk\b/.test(fn) && !/packing/.test(fn)) scores.PK += 25
}

function scoreSheetContent(values: unknown[][], scores: DisciplineScores): void {
  const flat = values
    .slice(0, 12)
    .flat()
    .map(cellStr)
    .join(' ')
    .toLowerCase()
  if (/electrical|process\s*ee/.test(flat)) scores.EE += 30
  if (/mechanical|process\s*me/.test(flat)) scores.ME += 30
  if (/packing/.test(flat)) scores.PK += 30

  const header = findHeaderRow(values)
  if (!header) return
  const normalized = header.headers.map(normHeader)
  const hasZone = normalized.some((h) => h === 'zone')
  const hasPmList = normalized.some((h) => h.includes('pm list'))
  const hasCraft = normalized.some((h) => h === 'craft')
  const hasFrequency = normalized.some((h) => h === 'frequency' || h.includes('freq'))
  const hasType = normalized.some((h) => h === 'type')

  if (hasCraft && hasFrequency && hasType) scores.PK += 45
  else if (hasCraft && hasFrequency) scores.PK += 35
  if (hasZone && hasPmList) {
    scores.EE += 12
    scores.ME += 12
  }
}

function pickDiscipline(scores: DisciplineScores): MasterPlanDiscipline | null {
  const ranked = (['EE', 'ME', 'PK'] as const)
    .map((d) => ({ d, score: scores[d] }))
    .sort((a, b) => b.score - a.score)
  const best = ranked[0]
  const second = ranked[1]
  if (!best || best.score < 35) return null
  if (second && best.score - second.score < 8 && best.score < 60) return null
  return best.d
}

/** Detect EE / ME / PK from workbook content (filename is a hint only). */
export function detectMasterPlanDiscipline(
  buffer: Buffer,
  sourceFilename = '',
): MasterPlanDiscipline | null {
  const scores: DisciplineScores = { EE: 0, ME: 0, PK: 0 }
  scoreFilename(sourceFilename, scores)

  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: false, sheetRows: 35 })
  const sheetNames = wb.SheetNames
  scoreSheetNames(sheetNames, scores)

  for (const name of sheetNames.slice(0, 45)) {
    const ws = wb.Sheets[name]
    if (!ws) continue
    const values = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      blankrows: false,
      defval: '',
    }) as unknown[][]
    scoreSheetContent(values, scores)
  }

  return pickDiscipline(scores)
}
