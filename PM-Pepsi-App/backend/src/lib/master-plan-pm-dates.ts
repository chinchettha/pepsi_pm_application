import type { Pool } from 'pg'
import { extractMasterPlanLinkKeys } from './master-plan-row-links.js'

export type MasterPlanPmStatus = {
  lastClosedAt: number | null
  nextDueAt: number | null
  intervalDays: number | null
}

export type Iw37nCloseSnapshot = {
  mntplan: string
  equipment: string
  opText: string
  osDesc: string
  lastClosedAt: number
}

function normHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, ' ')
}

function pickCell(
  columnHeaders: string[],
  display: Record<string, string>,
  matchers: Array<(h: string) => boolean>,
): string {
  for (const header of columnHeaders) {
    const h = normHeader(header)
    if (!matchers.some((m) => m(h))) continue
    const value = (display[header] ?? '').trim()
    if (value) return value
  }
  return ''
}

export function extractIntervalDays(
  columnHeaders: string[],
  display: Record<string, string>,
): number | null {
  const raw = pickCell(columnHeaders, display, [
    (h) => h === 'days',
    (h) => h.includes('freq (day)'),
    (h) => h === 'freq' || h === 'frequency',
  ])
  if (!raw) return null
  const n = Number(raw.replace(/,/g, ''))
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null
}

export function normalizeMatchText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Calendar days after last close (midnight local from epoch). */
export function computeNextDueAt(lastClosedAt: number, intervalDays: number): number {
  if (!Number.isFinite(lastClosedAt) || lastClosedAt <= 0) return 0
  if (!Number.isFinite(intervalDays) || intervalDays <= 0) return 0
  const d = new Date(lastClosedAt * 1000)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + intervalDays)
  return Math.floor(d.getTime() / 1000)
}

export function pmlistMatchesWo(
  pmlist: string,
  machine: string,
  wo: Iw37nCloseSnapshot,
  mntplanWoCount: number,
): boolean {
  if (wo.lastClosedAt <= 0) return false

  const machineNorm = normalizeMatchText(machine)
  const equipNorm = normalizeMatchText(wo.equipment)
  if (machineNorm && equipNorm && (equipNorm.includes(machineNorm) || machineNorm.includes(equipNorm))) {
    return true
  }

  if (mntplanWoCount <= 1) return true

  const pmNorm = normalizeMatchText(pmlist)
  if (!pmNorm) return true

  const hay = normalizeMatchText(`${wo.opText} ${wo.osDesc}`)
  if (!hay) return false

  const snippet = pmNorm.slice(0, Math.min(40, pmNorm.length))
  if (snippet.length < 8) return hay.includes(pmNorm) || pmNorm.includes(hay.slice(0, 40))

  return hay.includes(snippet) || snippet.includes(hay.slice(0, 40))
}

export function resolveRowPmStatus(
  keys: ReturnType<typeof extractMasterPlanLinkKeys>,
  intervalDays: number | null,
  closeRows: Iw37nCloseSnapshot[],
  mntplanWoCount: number,
): MasterPlanPmStatus {
  const mntplan = keys.mntplan.trim()
  if (!mntplan) {
    return { lastClosedAt: null, nextDueAt: null, intervalDays }
  }

  const candidates = closeRows.filter((wo) => wo.mntplan === mntplan)
  let lastClosedAt = 0
  for (const wo of candidates) {
    if (!pmlistMatchesWo(keys.pmlist.trim(), keys.machine.trim(), wo, mntplanWoCount)) continue
    if (wo.lastClosedAt > lastClosedAt) lastClosedAt = wo.lastClosedAt
  }

  if (lastClosedAt <= 0) {
    return { lastClosedAt: null, nextDueAt: null, intervalDays }
  }

  const nextDueAt =
    intervalDays != null ? computeNextDueAt(lastClosedAt, intervalDays) || null : null

  return {
    lastClosedAt,
    nextDueAt,
    intervalDays,
  }
}

export function attachPmStatusToRows(
  columnHeaders: string[],
  rows: Array<{
    id: number
    rowIndex: number
    cells: Record<string, string>
    display: Record<string, string>
  }>,
  closeRows: Iw37nCloseSnapshot[],
): Array<{
  id: number
  rowIndex: number
  cells: Record<string, string>
  display: Record<string, string>
  pmStatus: MasterPlanPmStatus
}> {
  const countByMntplan = new Map<string, number>()
  for (const wo of closeRows) {
    countByMntplan.set(wo.mntplan, (countByMntplan.get(wo.mntplan) ?? 0) + 1)
  }

  return rows.map((row) => {
    const keys = extractMasterPlanLinkKeys(columnHeaders, row.cells, row.display)
    const intervalDays = extractIntervalDays(columnHeaders, row.display)
    const mntplan = keys.mntplan.trim()
    const mntplanWoCount = mntplan ? (countByMntplan.get(mntplan) ?? 0) : 0
    const pmStatus = resolveRowPmStatus(keys, intervalDays, closeRows, mntplanWoCount)
    return { ...row, pmStatus }
  })
}

export async function fetchIw37nCloseSnapshots(
  pool: Pool,
  mntplans: string[],
): Promise<Iw37nCloseSnapshot[]> {
  if (mntplans.length === 0) return []

  const r = await pool.query<{
    mntplan: string
    equipment: string | null
    op_text: string | null
    os_desc: string | null
    last_closed_at: string | number | null
  }>(
    `SELECT
       TRIM(i.mntplan) AS mntplan,
       TRIM(COALESCE(i.equipment, '')) AS equipment,
       TRIM(COALESCE(i.operationshorttext, '')) AS op_text,
       TRIM(COALESCE(i.ostdescription, '')) AS os_desc,
       GREATEST(
         COALESCE((
           SELECT MAX(w.cendate) FROM app.tbwrkclose w WHERE w.idiw37 = i.idiw37
         ), 0),
         COALESCE((
           SELECT MAX(c.endate) FROM app.tbcofirm c WHERE c.idiw37 = i.idiw37
         ), 0)
       ) AS last_closed_at
     FROM app.tbiw37n i
     WHERE NULLIF(TRIM(i.mntplan), '') IS NOT NULL
       AND TRIM(i.mntplan) = ANY($1::text[])`,
    [mntplans],
  )

  return r.rows
    .map((row) => ({
      mntplan: (row.mntplan ?? '').trim(),
      equipment: (row.equipment ?? '').trim(),
      opText: (row.op_text ?? '').trim(),
      osDesc: (row.os_desc ?? '').trim(),
      lastClosedAt: Number(row.last_closed_at ?? 0),
    }))
    .filter((row) => row.mntplan && row.lastClosedAt > 0)
}
