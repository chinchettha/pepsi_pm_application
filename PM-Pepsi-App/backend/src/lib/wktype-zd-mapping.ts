/**
 * ประเภทงาน SAP ตามประชุมลูกค้า ครั้งที่ 2 (7 พ.ค. 2569) — ZD01 / ZD02 / ZD05
 * ไฟล์ IW37N ในโรงงานยังส่งคอลัมน์ Type เป็น ZB* → แมป ZB → ZD สำหรับ filter/แสดงผล
 * ดู docs/customer-requirements/WKTYPE-ZD-ZB-MAPPING.md
 */
export const WKTYPE_MAPPING_SOURCE =
  'ประชุมลูกค้า ครั้งที่ 2 (7 พ.ค. 2569) — รายงานการประชุม ครั้งที่ 2.docx'

export type WktypeZdZbRow = {
  zb: string
  zd: string
  zdLabelTh: string
  /** คำอธิบายในไฟล์ IW37N / master เดิม */
  iw37nLabel: string
}

/** แมป ZB (ค่าใน DB หลัง import) → ZD (นิยามลูกค้าในประชุม) */
export const WKTYPE_ZD_ZB_ROWS: readonly WktypeZdZbRow[] = [
  {
    zb: 'ZB05',
    zd: 'ZD01',
    zdLabelTh: 'Breakdown / เครื่องหยุด',
    iw37nLabel: 'Breakdown (IW37N)',
  },
  {
    zb: 'ZB02',
    zd: 'ZD02',
    zdLabelTh: 'Preventive Maintenance (PM)',
    iw37nLabel: 'PM (ไฟล์ AcZB02)',
  },
  {
    zb: 'ZB01',
    zd: 'ZD05',
    zdLabelTh: 'General Repair',
    iw37nLabel: 'Corrective (IW37N)',
  },
] as const

const BY_ZB = new Map(WKTYPE_ZD_ZB_ROWS.map((r) => [r.zb.toUpperCase(), r]))
const BY_ZD = new Map(WKTYPE_ZD_ZB_ROWS.map((r) => [r.zd.toUpperCase(), r]))

export function lookupWktypeZdMapping(code: string): WktypeZdZbRow | null {
  const c = code.trim().toUpperCase()
  if (!c) return null
  return BY_ZB.get(c) ?? BY_ZD.get(c) ?? null
}

/** ป้ายใน filter — กรองด้วยรหัส ZB ตาม DB */
export function formatWktypeFilterLabel(code: string, legacyDesc?: string | null): string {
  const c = code.trim()
  if (!c) return c
  const row = lookupWktypeZdMapping(c)
  if (row) {
    return `${c} → ${row.zd} ${row.zdLabelTh}`
  }
  const desc = legacyDesc?.trim()
  return desc ? `${c} — ${desc}` : c
}

export type WktypeDisplayParts = {
  code: string
  primary: string
  tooltip: string
  zdCode: string | null
}

export function formatWktypeDisplay(code: string, legacyDesc?: string | null): WktypeDisplayParts {
  const c = code.trim()
  const row = lookupWktypeZdMapping(c)
  if (row) {
    return {
      code: c,
      primary: `${c} · ${row.zd}`,
      tooltip: `${row.zd} ${row.zdLabelTh} — ${WKTYPE_MAPPING_SOURCE}`,
      zdCode: row.zd,
    }
  }
  const desc = legacyDesc?.trim()
  return {
    code: c,
    primary: c,
    tooltip: desc ? `${c} — ${desc}` : c,
    zdCode: null,
  }
}

export type WktypeFilterOption = { code: string; label: string }

export function buildWktypeFilterOptions(
  master: { wkzb: string; zbdescrip: string | null }[],
  distinct: { wktype: string }[],
): WktypeFilterOption[] {
  const seen = new Set<string>()
  const out: WktypeFilterOption[] = []

  const add = (code: string, legacyDesc?: string | null) => {
    const c = code.trim()
    if (!c || seen.has(c)) return
    seen.add(c)
    out.push({ code: c, label: formatWktypeFilterLabel(c, legacyDesc) })
  }

  if (master.length > 0) {
    for (const r of master) add(r.wkzb, r.zbdescrip)
  }
  for (const r of distinct) add(r.wktype)

  return out.sort((a, b) => a.code.localeCompare(b.code))
}
