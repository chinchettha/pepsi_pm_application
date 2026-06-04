import { z } from 'zod'

export const woPmFormHeaderSchema = z.object({
  wkorder: z.string(),
  printMetaLine: z.string(),
  functionalLocation: z.string(),
  equipment: z.string(),
  descriptionLine1: z.string(),
  descriptionLine2: z.string(),
  workCentre: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  activityType: z.string(),
  revision: z.string(),
  priority: z.string(),
  techId: z.string(),
  sysCond: z.string(),
  description: z.string(),
  permitStatus: z.string(),
  headerShortText: z.string(),
  objectList: z.string(),
  operationNumber: z.string(),
  operationWorkCentre: z.string(),
  operationText: z.string(),
  unloadingPoint: z.string(),
})

export type WoPmFormHeader = z.infer<typeof woPmFormHeaderSchema>

type RowLike = {
  wkorder: string
  functionalloc: string | null
  mat: string | null
  equipment: string | null
  equdescrip: string | null
  ostdescription: string | null
  operationshorttext: string | null
  wkctr: string | null
  bscstart: string | number | null
  actfinish: string | number | null
  untime: string | number | null
  systemstatus: string | null
  syst: string | null
  opac: string | null
  wktype: string | null
  team: string | null
}

type TaskLike = {
  mat: string | null
  matdescrip: string | null
  idwkctrtype: string | null
}

/** SAP print style dd.MM.yyyy */
export function formatSapPrintDate(isoYmd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoYmd.trim())
  if (!m) return isoYmd
  return `${m[3]}.${m[2]}.${m[1]}`
}

function unixToIsoDate(sec: string | number | null | undefined): string {
  if (sec == null || sec === '') return ''
  const n = Number(sec)
  if (!Number.isFinite(n) || n <= 0) return ''
  const d = new Date(n * 1000)
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${mo}-${day}`
}

function splitDescription(
  equdescrip: string | null | undefined,
  ostdescription: string | null | undefined,
): { line1: string; line2: string } {
  const eq = equdescrip?.trim() ?? ''
  const ost = ostdescription?.trim() ?? ''
  if (eq.includes(' / ')) {
    const idx = eq.indexOf(' / ')
    return {
      line1: eq.slice(0, idx).trim(),
      line2: eq.slice(idx + 3).trim() || ost,
    }
  }
  if (eq && ost && eq !== ost) return { line1: eq, line2: ost }
  return { line1: eq, line2: ost }
}

function activityTypeLabel(row: RowLike, firstTask?: TaskLike | null): string {
  const mat = firstTask?.mat?.trim() || ''
  const desc = firstTask?.matdescrip?.trim() || ''
  if (mat && desc) return `${mat} ${desc}`
  if (desc) return desc
  if (mat) return mat
  return row.wktype?.trim() ?? ''
}

/** SAP print Operation Text — e.g. `2M - EE Oil Heating Zone (P14)` */
export function buildOperationText(row: RowLike, techId: string): string {
  const ost = row.ostdescription?.trim() ?? ''
  const tech = techId.trim()
  const header = row.operationshorttext?.trim() ?? ''

  if (!ost) return header

  if (/^\d+[A-Z]?\s*-\s/.test(ost)) {
    return tech && !ost.includes(`(${tech})`) ? `${ost} (${tech})` : ost
  }

  const tail = header.split('&').pop()?.trim() ?? header
  const discMatch = /-([A-Z]{2})\s*$/.exec(tail)
  const discipline = discMatch?.[1] ?? ''
  const interval = row.wktype?.trim() === 'ZB02' ? '2M' : ''
  const prefix = [interval, discipline].filter(Boolean).join(' - ')
  const base = prefix ? `${prefix} ${ost}` : ost
  return tech ? `${base} (${tech})` : base
}

function buildPrintMetaLine(startDatePrint: string, wkorder: string): string {
  const datePart = startDatePrint || ''
  const docNo = wkorder.trim()
  return [datePart, 'คณะกรรมการควบคุม', docNo, 'Original 0 Page 1'].filter(Boolean).join(' ')
}

export function buildWoPmFormHeader(
  row: RowLike,
  opts?: {
    firstTask?: TaskLike | null
    materialCount?: number
  },
): WoPmFormHeader {
  const { line1, line2 } = splitDescription(row.equdescrip, row.ostdescription)
  const startIso = unixToIsoDate(row.bscstart)
  const endIso = unixToIsoDate(row.actfinish) || startIso
  const startDate = startIso ? formatSapPrintDate(startIso) : ''
  const endDate = endIso ? formatSapPrintDate(endIso) : ''
  const zoneDesc = line2 || row.ostdescription?.trim() || row.operationshorttext?.trim() || ''
  const materialCount = opts?.materialCount ?? 0
  const techId = opts?.firstTask?.idwkctrtype?.trim() || row.team?.trim() || ''

  return {
    wkorder: row.wkorder?.trim() ?? '',
    printMetaLine: buildPrintMetaLine(startDate, row.wkorder?.trim() ?? ''),
    functionalLocation: row.functionalloc?.trim() ?? '',
    equipment: row.equipment?.trim() || row.mat?.trim() || '',
    descriptionLine1: line1,
    descriptionLine2: line2,
    workCentre: row.wkctr?.trim() ?? '',
    startDate,
    endDate,
    activityType: activityTypeLabel(row, opts?.firstTask),
    revision: '',
    priority: '',
    techId,
    sysCond: '-',
    description: zoneDesc,
    permitStatus: 'No Permits Found',
    headerShortText: row.operationshorttext?.trim() ?? '',
    objectList: materialCount > 0 ? String(materialCount) : '',
    operationNumber: row.opac?.trim() || '0010',
    operationWorkCentre: row.wkctr?.trim() ?? '',
    operationText: buildOperationText(row, techId),
    unloadingPoint: '',
  }
}
