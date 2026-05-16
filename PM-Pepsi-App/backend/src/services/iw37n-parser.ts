import * as XLSX from 'xlsx'

/** แมปคอลัมน์ Excel ตาม M_iw37n.php ($Row[0]..$Row[18]) */
export type Iw37nImportRow = {
  mntplan: string
  wkorder: string
  wktype: string
  mat: string
  bscstart: number | null
  actfinish: number | null
  systemstatus: string
  syst: string
  opac: string
  operationshorttext: string
  ostdescription: string
  cknow: string
  wkctr: string
  work: number | null
  actwork: number | null
  untime: number | null
  equipment: string
  equdescrip: string
  functionalloc: string
  funcdescrip: string
}

function cellStr(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'number') return String(v)
  return String(v).trim()
}

/** dd.mm.yyyy → unix วินาที (เทียบ mktime ใน PHP) */
export function parseDdMmYyyy(value: string): number | null {
  const t = value.trim()
  if (!t) return null
  const parts = t.split(/[./-]/)
  if (parts.length < 3) return null
  const day = Number(parts[0])
  const month = Number(parts[1])
  const year = Number(parts[2])
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) {
    return null
  }
  const d = new Date(year, month - 1, day, 0, 0, 0, 0)
  const sec = Math.floor(d.getTime() / 1000)
  return sec > 0 ? sec : null
}

export function parseSystemStatus(raw: string): string {
  const parts = raw.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts[0] === 'REL' || parts[0] === 'CRTD') return parts[0]
  return parts.length >= 2 ? `${parts[0]} ${parts[1]}` : parts[0]
}

function rowArrayToRecord(cells: unknown[]): Iw37nImportRow | null {
  const get = (i: number) => cellStr(cells[i])

  const wkorder = get(1)
  const opac = get(7)
  const operationshorttext = get(8)
  const equipment = get(15)
  const functionalloc = get(17)

  if (!wkorder || !opac || !operationshorttext || !equipment || !functionalloc) {
    return null
  }

  const workRaw = get(12)
  const actworkRaw = get(13)
  const untimeRaw = get(14)

  return {
    mntplan: get(0),
    wkorder,
    wktype: get(2),
    mat: get(3),
    bscstart: parseDdMmYyyy(get(4)),
    actfinish: parseDdMmYyyy(get(5)),
    systemstatus: get(6),
    syst: parseSystemStatus(get(6)),
    opac,
    operationshorttext,
    ostdescription: get(9),
    cknow: get(10),
    wkctr: get(11),
    work: workRaw ? Number(workRaw) : null,
    actwork: actworkRaw ? Number(actworkRaw) : null,
    untime: untimeRaw ? Number(untimeRaw) : null,
    equipment: get(15),
    equdescrip: get(16),
    functionalloc,
    funcdescrip: get(18),
  }
}

function sheetToMatrix(buffer: Buffer, fileName: string): unknown[][] {
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.csv')) {
    const text = buffer.toString('utf8')
    const lines = text.split(/\r?\n/).filter((l) => l.trim())
    return lines.map((line) => {
      const sep = line.includes('\t') ? '\t' : ','
      return line.split(sep).map((c) => c.trim().replace(/^"|"$/g, ''))
    })
  }
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: false })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  if (!sheet) return []
  return XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' })
}

/** ข้าม 2 แถวแรกของข้อมูล (เทียบ if ($n > 2) ใน PHP) */
export function parseIw37nFile(buffer: Buffer, fileName: string): Iw37nImportRow[] {
  const matrix = sheetToMatrix(buffer, fileName)
  const out: Iw37nImportRow[] = []
  for (let i = 2; i < matrix.length; i++) {
    const row = matrix[i]
    if (!row || !Array.isArray(row)) continue
    const rec = rowArrayToRecord(row)
    if (rec) out.push(rec)
  }
  return out
}
