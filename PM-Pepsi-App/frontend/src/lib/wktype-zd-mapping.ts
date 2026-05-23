/** สอดคล้อง backend/src/lib/wktype-zd-mapping.ts — อิงประชุมลูกค้า ครั้งที่ 2 */
export const WKTYPE_MAPPING_SOURCE =
  'ประชุมลูกค้า ครั้งที่ 2 (7 พ.ค. 2569)'

export type WktypeZdZbRow = {
  zb: string
  zd: string
  zdLabelTh: string
  iw37nLabel: string
}

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

function lookup(code: string): WktypeZdZbRow | null {
  const c = code.trim().toUpperCase()
  return c ? (BY_ZB.get(c) ?? null) : null
}

export function formatWktypeDisplay(code: string): {
  code: string
  primary: string
  tooltip: string
  zdCode: string | null
} {
  const c = code.trim()
  const row = lookup(c)
  if (row) {
    return {
      code: c,
      primary: `${c} · ${row.zd}`,
      tooltip: `${row.zd} ${row.zdLabelTh} — ${WKTYPE_MAPPING_SOURCE}`,
      zdCode: row.zd,
    }
  }
  return { code: c, primary: c, tooltip: c, zdCode: null }
}
