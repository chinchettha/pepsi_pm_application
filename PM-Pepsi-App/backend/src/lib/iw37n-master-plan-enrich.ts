import type { Pool } from 'pg'
import { applyFillDownDisplay } from './master-plan-display.js'
import { extractIntervalDays } from './master-plan-pm-dates.js'
import { extractMasterPlanLinkKeys } from './master-plan-row-links.js'

export type TasklistEnrichmentRow = {
  mntplan: string
  tasklist: string
  legacy: string
  zone: string
  craft: string
  machine: string
  pmlist: string
  pmday: number | null
}

export type MasterPlanEnrichmentRow = {
  discipline: MasterPlanDiscipline
  sapCode: string
  tasklist: string
  legacy: string
  zone: string
  machineList: string
  machine: string
  pmlist: string
  days: number | null
}

type MasterPlanDiscipline = 'EE' | 'ME' | 'PK'

export type LoadIw37nEnrichmentOptions = {
  /** List/grid — tasklist only; skip loading all Master Plan rows. */
  skipMasterPlan?: boolean
}

export function craftToMasterPlanDiscipline(craft: string): MasterPlanDiscipline | '' {
  const t = craft.trim().toUpperCase()
  if (t === 'EE' || t === 'ME' || t === 'PK') return t
  if (t.startsWith('EE')) return 'EE'
  if (t.startsWith('ME')) return 'ME'
  if (t.startsWith('PK')) return 'PK'
  return ''
}

export type Iw37nEnrichmentInput = {
  mntplan: string
  operationshorttext: string
  ostdescription: string
  equipment: string
  equdescrip: string
  functionalloc: string
}

export type Iw37nMasterPlanEnrichment = {
  sapCode: string
  tasklist: string
  legacy: string
  zone: string
  machineList: string
  machineMc: string
  pmlist: string
  pmday: number | null
  linked: boolean
  source: 'tasklist' | 'master_plan' | 'none'
  masterPlanMntplan: string
  masterPlanDiscipline: MasterPlanDiscipline | ''
}

export type Iw37nEnrichmentContext = {
  tasklistByMntplan: Map<string, TasklistEnrichmentRow[]>
  tasklistByLegacy: Map<string, TasklistEnrichmentRow[]>
  masterByMntplan: Map<string, MasterPlanEnrichmentRow[]>
  masterByLegacy: Map<string, MasterPlanEnrichmentRow[]>
}

const EMPTY: Iw37nMasterPlanEnrichment = {
  sapCode: '',
  tasklist: '',
  legacy: '',
  zone: '',
  machineList: '',
  machineMc: '',
  pmlist: '',
  pmday: null,
  linked: false,
  source: 'none',
  masterPlanMntplan: '',
  masterPlanDiscipline: '',
}

export function parseIw37nOstDescription(ost: string): { planCode: string; legacy: string } {
  const t = ost.trim()
  const idx = t.indexOf('&')
  if (idx < 0) return { planCode: '', legacy: '' }
  const left = t.slice(0, idx).trim()
  const legacy = t.slice(idx + 1).trim()
  const planCode = /^\d+$/.test(left) ? left : ''
  return { planCode, legacy }
}

function normText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function extractZoneFromOpText(opText: string): string {
  const m = /\(([A-Z0-9]{2,4})\)\s*$/.exec(opText.trim())
  return m?.[1]?.trim() ?? ''
}

function textOverlapScore(a: string, b: string): number {
  const na = normText(a)
  const nb = normText(b)
  if (!na || !nb) return 0
  if (na.includes(nb) || nb.includes(na)) return 40
  const snippet = na.slice(0, Math.min(24, na.length))
  if (snippet.length >= 8 && nb.includes(snippet)) return 25
  return 0
}

function toEnrichmentFromTasklist(row: TasklistEnrichmentRow): Iw37nMasterPlanEnrichment {
  const discipline = craftToMasterPlanDiscipline(row.craft)
  return {
    sapCode: row.mntplan,
    tasklist: row.tasklist,
    legacy: row.legacy,
    zone: row.zone,
    machineList: '',
    machineMc: row.machine,
    pmlist: row.pmlist,
    pmday: row.pmday,
    linked: true,
    source: 'tasklist',
    masterPlanMntplan: row.mntplan,
    masterPlanDiscipline: discipline,
  }
}

function toEnrichmentFromMasterPlan(row: MasterPlanEnrichmentRow): Iw37nMasterPlanEnrichment {
  return {
    sapCode: row.sapCode,
    tasklist: row.tasklist,
    legacy: row.legacy,
    zone: row.zone,
    machineList: row.machineList,
    machineMc: row.machine,
    pmlist: row.pmlist,
    pmday: row.days,
    linked: true,
    source: 'master_plan',
    masterPlanMntplan: row.sapCode,
    masterPlanDiscipline: row.discipline,
  }
}

function attachMasterPlanMeta(
  out: Iw37nMasterPlanEnrichment,
  iw: Iw37nEnrichmentInput,
  ctx: Iw37nEnrichmentContext,
  ost: ReturnType<typeof parseIw37nOstDescription>,
): Iw37nMasterPlanEnrichment {
  if (out.masterPlanMntplan && out.masterPlanDiscipline) return out

  const mpCandidates: MasterPlanEnrichmentRow[] = []
  for (const key of [out.sapCode, iw.mntplan.trim(), ost.planCode, out.legacy, ost.legacy]) {
    const k = key.trim()
    if (!k) continue
    mpCandidates.push(...(ctx.masterByMntplan.get(k) ?? []))
    mpCandidates.push(...(ctx.masterByLegacy.get(k) ?? []))
  }

  const mpBest = pickBest(dedupeMasterPlan(mpCandidates), (mp) =>
    scoreMasterPlanCandidate(iw, mp, ost),
  )
  if (mpBest && mpBest.score >= 50) {
    return {
      ...out,
      sapCode: mpBest.row.sapCode || out.sapCode,
      tasklist: out.tasklist || mpBest.row.tasklist,
      legacy: out.legacy || mpBest.row.legacy,
      zone: out.zone || mpBest.row.zone,
      machineList: out.machineList || mpBest.row.machineList,
      masterPlanMntplan: mpBest.row.sapCode,
      masterPlanDiscipline: mpBest.row.discipline,
    }
  }

  return {
    ...out,
    masterPlanMntplan: out.masterPlanMntplan || out.sapCode || iw.mntplan.trim() || ost.planCode,
    masterPlanDiscipline: out.masterPlanDiscipline,
  }
}

function scoreTasklistCandidate(
  iw: Iw37nEnrichmentInput,
  tl: TasklistEnrichmentRow,
  ost: ReturnType<typeof parseIw37nOstDescription>,
): number {
  let score = 0
  const mnt = iw.mntplan.trim()
  if (mnt && tl.mntplan === mnt) score += 100
  if (ost.planCode && tl.mntplan === ost.planCode) score += 60
  if (ost.legacy && tl.legacy === ost.legacy) score += 90
  const zoneFromOp = extractZoneFromOpText(iw.operationshorttext)
  if (zoneFromOp && tl.zone === zoneFromOp) score += 45
  if (tl.zone && iw.operationshorttext.includes(`(${tl.zone})`)) score += 45
  if (tl.machine && normText(iw.operationshorttext).includes(normText(tl.machine))) score += 35
  if (tl.machine && normText(iw.equdescrip).includes(normText(tl.machine))) score += 25
  if (tl.machine && tl.machine === iw.equdescrip.trim()) score += 30
  score += textOverlapScore(iw.operationshorttext, tl.pmlist)
  score += textOverlapScore(iw.ostdescription, tl.pmlist)
  return score
}

function scoreMasterPlanCandidate(
  iw: Iw37nEnrichmentInput,
  mp: MasterPlanEnrichmentRow,
  ost: ReturnType<typeof parseIw37nOstDescription>,
): number {
  let score = 0
  const mnt = iw.mntplan.trim()
  if (mnt && mp.sapCode === mnt) score += 100
  if (ost.planCode && mp.sapCode === ost.planCode) score += 60
  if (ost.legacy && mp.legacy === ost.legacy) score += 90
  const zoneFromOp = extractZoneFromOpText(iw.operationshorttext)
  if (zoneFromOp && mp.zone === zoneFromOp) score += 45
  if (mp.zone && iw.operationshorttext.includes(`(${mp.zone})`)) score += 45
  if (mp.machine && normText(iw.operationshorttext).includes(normText(mp.machine))) score += 35
  if (mp.machineList && normText(iw.operationshorttext).includes(normText(mp.machineList))) score += 35
  score += textOverlapScore(iw.operationshorttext, mp.pmlist)
  return score
}

function pickBest<T>(
  candidates: T[],
  scoreFn: (row: T) => number,
): { row: T; score: number } | null {
  let best: { row: T; score: number } | null = null
  for (const row of candidates) {
    const score = scoreFn(row)
    if (score <= 0) continue
    if (!best || score > best.score) best = { row, score }
  }
  return best
}

export function resolveIw37nMasterPlanEnrichment(
  iw: Iw37nEnrichmentInput,
  ctx: Iw37nEnrichmentContext,
): Iw37nMasterPlanEnrichment {
  const ost = parseIw37nOstDescription(iw.ostdescription)
  const mnt = iw.mntplan.trim()

  const tasklistCandidates: TasklistEnrichmentRow[] = []
  if (mnt) tasklistCandidates.push(...(ctx.tasklistByMntplan.get(mnt) ?? []))
  if (ost.planCode && ost.planCode !== mnt) {
    tasklistCandidates.push(...(ctx.tasklistByMntplan.get(ost.planCode) ?? []))
  }
  if (ost.legacy) tasklistCandidates.push(...(ctx.tasklistByLegacy.get(ost.legacy) ?? []))

  const tlBest = pickBest(dedupeTasklist(tasklistCandidates), (tl) =>
    scoreTasklistCandidate(iw, tl, ost),
  )
  if (tlBest && tlBest.score >= 50) {
    let out = toEnrichmentFromTasklist(tlBest.row)
    if (!out.legacy && ost.legacy) out.legacy = ost.legacy
    if (!out.zone) out.zone = extractZoneFromOpText(iw.operationshorttext)
    out = attachMasterPlanMeta(out, iw, ctx, ost)
    return out
  }

  const mpCandidates: MasterPlanEnrichmentRow[] = []
  if (mnt) mpCandidates.push(...(ctx.masterByMntplan.get(mnt) ?? []))
  if (ost.planCode && ost.planCode !== mnt) {
    mpCandidates.push(...(ctx.masterByMntplan.get(ost.planCode) ?? []))
  }
  if (ost.legacy) mpCandidates.push(...(ctx.masterByLegacy.get(ost.legacy) ?? []))

  const mpBest = pickBest(dedupeMasterPlan(mpCandidates), (mp) =>
    scoreMasterPlanCandidate(iw, mp, ost),
  )
  if (mpBest && mpBest.score >= 50) {
    let out = toEnrichmentFromMasterPlan(mpBest.row)
    if (!out.legacy && ost.legacy) out.legacy = ost.legacy
    if (!out.zone) out.zone = extractZoneFromOpText(iw.operationshorttext)
    return out
  }

  if (ost.legacy || mnt) {
    return attachMasterPlanMeta(
      {
        ...EMPTY,
        sapCode: mnt || ost.planCode,
        legacy: ost.legacy,
        zone: extractZoneFromOpText(iw.operationshorttext),
        machineMc: iw.equdescrip.trim() || iw.equipment.trim(),
        pmlist: iw.operationshorttext.trim() || iw.ostdescription.trim(),
        linked: false,
        source: 'none',
      },
      iw,
      ctx,
      ost,
    )
  }

  return {
    ...EMPTY,
    sapCode: mnt,
    masterPlanMntplan: mnt,
    machineMc: iw.equdescrip.trim() || iw.equipment.trim(),
    pmlist: iw.operationshorttext.trim() || iw.ostdescription.trim(),
  }
}

function dedupeTasklist(rows: TasklistEnrichmentRow[]): TasklistEnrichmentRow[] {
  const seen = new Set<string>()
  const out: TasklistEnrichmentRow[] = []
  for (const row of rows) {
    const key = `${row.mntplan}|${row.tasklist}|${row.legacy}|${row.machine}|${row.pmlist}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(row)
  }
  return out
}

function dedupeMasterPlan(rows: MasterPlanEnrichmentRow[]): MasterPlanEnrichmentRow[] {
  const seen = new Set<string>()
  const out: MasterPlanEnrichmentRow[] = []
  for (const row of rows) {
    const key = `${row.sapCode}|${row.tasklist}|${row.legacy}|${row.machine}|${row.pmlist}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(row)
  }
  return out
}

export async function loadIw37nEnrichmentContext(
  pool: Pool,
  inputs: Iw37nEnrichmentInput[],
  opts?: LoadIw37nEnrichmentOptions,
): Promise<Iw37nEnrichmentContext> {
  const mntplans = new Set<string>()
  const legacies = new Set<string>()
  for (const iw of inputs) {
    const mnt = iw.mntplan.trim()
    if (mnt) mntplans.add(mnt)
    const ost = parseIw37nOstDescription(iw.ostdescription)
    if (ost.planCode) mntplans.add(ost.planCode)
    if (ost.legacy) legacies.add(ost.legacy)
  }

  const tasklistByMntplan = new Map<string, TasklistEnrichmentRow[]>()
  const tasklistByLegacy = new Map<string, TasklistEnrichmentRow[]>()

  if (mntplans.size > 0 || legacies.size > 0) {
    const tlRes = await pool.query<{
      mntplan: string
      tasklist: string
      legacy: string
      idzone: string
      craft: string
      machine: string
      pmlist: string
      pmday: string | number | null
    }>(
      `SELECT TRIM(mntplan) AS mntplan, TRIM(tasklist) AS tasklist, TRIM(legacy) AS legacy,
              TRIM(idzone) AS idzone, TRIM(idwkctrtype) AS craft, TRIM(machine) AS machine,
              TRIM(pmlist) AS pmlist, pmday
       FROM app.tbtasklist
       WHERE TRIM(mntplan) = ANY($1::text[])
          OR TRIM(legacy) = ANY($2::text[])`,
      [[...mntplans], [...legacies]],
    )
    for (const row of tlRes.rows) {
      const mapped: TasklistEnrichmentRow = {
        mntplan: row.mntplan,
        tasklist: row.tasklist,
        legacy: row.legacy,
        zone: row.idzone,
        craft: row.craft,
        machine: row.machine,
        pmlist: row.pmlist,
        pmday: row.pmday == null || row.pmday === '' ? null : Number(row.pmday),
      }
      if (mapped.mntplan) {
        const list = tasklistByMntplan.get(mapped.mntplan) ?? []
        list.push(mapped)
        tasklistByMntplan.set(mapped.mntplan, list)
      }
      if (mapped.legacy) {
        const list = tasklistByLegacy.get(mapped.legacy) ?? []
        list.push(mapped)
        tasklistByLegacy.set(mapped.legacy, list)
      }
    }
  }

  const { masterByMntplan, masterByLegacy } = opts?.skipMasterPlan
    ? { masterByMntplan: new Map<string, MasterPlanEnrichmentRow[]>(), masterByLegacy: new Map<string, MasterPlanEnrichmentRow[]>() }
    : await loadPublishedMasterPlanEnrichmentMaps(pool)

  return { tasklistByMntplan, tasklistByLegacy, masterByMntplan, masterByLegacy }
}

type MasterPlanMaps = {
  masterByMntplan: Map<string, MasterPlanEnrichmentRow[]>
  masterByLegacy: Map<string, MasterPlanEnrichmentRow[]>
}

let publishedMasterPlanCache: { key: string; maps: MasterPlanMaps } | null = null

export function invalidateIw37nMasterPlanEnrichmentCache(): void {
  publishedMasterPlanCache = null
}

async function publishedMasterPlanCacheKey(pool: Pool): Promise<string> {
  const r = await pool.query<{ n: number; ts: string | null }>(
    `SELECT COUNT(*)::int AS n, COALESCE(MAX(imported_at)::text, '') AS ts
     FROM app.tb_master_plan_workbook
     WHERE status = 'published'`,
  )
  const row = r.rows[0]
  return `${row?.n ?? 0}:${row?.ts ?? ''}`
}

function buildMasterPlanMapsFromQueryRows(
  rows: Array<{
    discipline: MasterPlanDiscipline
    column_headers_json: string[]
    cells_json: Record<string, string>
  }>,
): MasterPlanMaps {
  const masterByMntplan = new Map<string, MasterPlanEnrichmentRow[]>()
  const masterByLegacy = new Map<string, MasterPlanEnrichmentRow[]>()

  const sheetGroups = new Map<
    string,
    { discipline: MasterPlanDiscipline; headers: string[]; rows: Record<string, string>[] }
  >()
  for (const row of rows) {
    const headers = Array.isArray(row.column_headers_json) ? row.column_headers_json : []
    const key = `${row.discipline}\0${headers.join('\0')}`
    const group = sheetGroups.get(key) ?? { discipline: row.discipline, headers, rows: [] }
    group.rows.push(row.cells_json ?? {})
    sheetGroups.set(key, group)
  }

  for (const group of sheetGroups.values()) {
    const withDisplay = applyFillDownDisplay(
      group.rows.map((cells, i) => ({ rowIndex: i, cells })),
      group.headers,
    )
    for (let i = 0; i < withDisplay.length; i++) {
      const cells = group.rows[i] ?? {}
      const display = withDisplay[i]?.display ?? cells
      const keys = extractMasterPlanLinkKeys(group.headers, cells, display)
      const sapCode = keys.mntplan.trim()
      const legacy = keys.legacy.trim()
      if (!sapCode && !legacy) continue
      const mapped: MasterPlanEnrichmentRow = {
        discipline: group.discipline,
        sapCode,
        tasklist: keys.tasklist.trim(),
        legacy,
        zone: keys.zone.trim(),
        machineList: keys.machineList.trim(),
        machine: keys.machine.trim(),
        pmlist: keys.pmlist.trim(),
        days: extractIntervalDays(group.headers, display),
      }
      if (sapCode) {
        const list = masterByMntplan.get(sapCode) ?? []
        list.push(mapped)
        masterByMntplan.set(sapCode, list)
      }
      if (legacy) {
        const list = masterByLegacy.get(legacy) ?? []
        list.push(mapped)
        masterByLegacy.set(legacy, list)
      }
    }
  }

  return { masterByMntplan, masterByLegacy }
}

async function loadPublishedMasterPlanEnrichmentMaps(pool: Pool): Promise<MasterPlanMaps> {
  const key = await publishedMasterPlanCacheKey(pool)
  if (publishedMasterPlanCache?.key === key) {
    return publishedMasterPlanCache.maps
  }

  const mpRes = await pool.query<{
    discipline: MasterPlanDiscipline
    column_headers_json: string[]
    cells_json: Record<string, string>
  }>(
    `SELECT w.discipline, s.column_headers_json, r.cells_json
     FROM app.tb_master_plan_row r
     INNER JOIN app.tb_master_plan_sheet s ON s.id = r.sheet_id
     INNER JOIN app.tb_master_plan_workbook w ON w.id = s.workbook_id
     WHERE w.status = 'published' AND s.sheet_kind = 'detail'`,
  )

  const maps = buildMasterPlanMapsFromQueryRows(mpRes.rows)
  publishedMasterPlanCache = { key, maps }
  return maps
}
