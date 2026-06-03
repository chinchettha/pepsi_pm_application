import * as XLSX from 'xlsx'

export type PmReadingImportRow = {
  rowNo: number
  wkorder: string
  machine: string
  pmlist: string
  kind: 'current_3phase' | 'vibration_3axis'
  measuredAt: string
  v1: number
  v2: number
  v3: number
  warningLimit: number | null
  alarmLimit: number | null
}

export type PmReadingImportParseIssue = {
  rowNo: number
  wkorder: string
  message: string
}

const HEADER_ALIASES: Record<string, keyof Omit<PmReadingImportRow, 'rowNo' | 'measuredAt'>> = {
  'เลข wo': 'wkorder',
  wo: 'wkorder',
  wkorder: 'wkorder',
  order: 'wkorder',
  'เครื่องจักร': 'machine',
  machine: 'machine',
  'รายการ pm': 'pmlist',
  pmlist: 'pmlist',
  'ประเภทการวัด': 'kind',
  ประเภท: 'kind',
  kind: 'kind',
  'แกน x': 'v1',
  'axis x': 'v1',
  x: 'v1',
  'ค่า 1': 'v1',
  v1: 'v1',
  'r (a)': 'v1',
  'เฟส r': 'v1',
  'phase r': 'v1',
  'แกน y': 'v2',
  'axis y': 'v2',
  y: 'v2',
  'ค่า 2': 'v2',
  v2: 'v2',
  's (a)': 'v2',
  'เฟส s': 'v2',
  'phase s': 'v2',
  'แกน z': 'v3',
  'axis z': 'v3',
  z: 'v3',
  'ค่า 3': 'v3',
  v3: 'v3',
  't (a)': 'v3',
  'เฟส t': 'v3',
  'phase t': 'v3',
  warning: 'warningLimit',
  alarm: 'alarmLimit',
}

/** หัวคอลัมน์ template นำเข้า — โครงเดียวกัน 10 คอลัมน์ (ตาม Excel ลูกค้า) */
export const PM_READINGS_IMPORT_HEADERS = {
  meta: ['เลข WO', 'เครื่องจักร', 'รายการ PM', 'ประเภทการวัด', 'วันเวลาวัด'] as const,
  currentValues: ['Phase R (A)', 'Phase S (A)', 'Phase T (A)'] as const,
  vibrationValues: ['แกน X', 'แกน Y', 'แกน Z'] as const,
  limits: ['Warning', 'Alarm'] as const,
  chartReference: ['Time', 'Phase R (A)', 'Phase S (A)', 'Phase T (A)'] as const,
}

export function pmReadingsImportHeaderRow(
  kind: 'current_3phase' | 'vibration_3axis',
): string[] {
  const values =
    kind === 'current_3phase'
      ? [...PM_READINGS_IMPORT_HEADERS.currentValues]
      : [...PM_READINGS_IMPORT_HEADERS.vibrationValues]
  return [...PM_READINGS_IMPORT_HEADERS.meta, ...values, ...PM_READINGS_IMPORT_HEADERS.limits]
}

function cellStr(v: unknown): string {
  if (v == null) return ''
  return String(v).trim()
}

function normalizeHeader(v: unknown): string {
  return cellStr(v)
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseKind(raw: string): 'current_3phase' | 'vibration_3axis' | null {
  const s = raw.trim().toLowerCase()
  if (!s) return null
  if (s.includes('vibrat') || s.includes('สั่น') || s.includes('mm/s')) return 'vibration_3axis'
  if (s.includes('กระแส') || s.includes('เฟส') || s.includes('amp') || s.includes('current')) {
    return 'current_3phase'
  }
  if (s === 'vibration_3axis' || s === 'vibration') return 'vibration_3axis'
  if (s === 'current_3phase' || s === 'current') return 'current_3phase'
  return null
}

function excelSerialToDate(serial: number): Date | null {
  if (!Number.isFinite(serial)) return null
  const parsed = XLSX.SSF.parse_date_code(serial)
  if (!parsed) return null
  return new Date(parsed.y, parsed.m - 1, parsed.d, parsed.H, parsed.M, Math.floor(parsed.S))
}

export function parseMeasuredAt(raw: unknown): Date | null {
  if (raw == null || raw === '') return new Date()
  if (typeof raw === 'number') {
    const fromSerial = excelSerialToDate(raw)
    if (fromSerial && !Number.isNaN(fromSerial.getTime())) return fromSerial
  }
  const s = cellStr(raw)
  if (!s) return new Date()

  const iso = Date.parse(s)
  if (!Number.isNaN(iso)) return new Date(iso)

  const m = /^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?$/.exec(s)
  if (m) {
    const dd = Number(m[1])
    const mm = Number(m[2])
    let yyyy = Number(m[3])
    if (yyyy < 100) yyyy += 2000
    if (yyyy > 2400) yyyy -= 543
    const hh = m[4] != null ? Number(m[4]) : 0
    const min = m[5] != null ? Number(m[5]) : 0
    const d = new Date(yyyy, mm - 1, dd, hh, min)
    if (!Number.isNaN(d.getTime())) return d
  }

  const timeOnly = /^(\d{1,2}):(\d{2})$/.exec(s)
  if (timeOnly) {
    const now = new Date()
    const d = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      Number(timeOnly[1]),
      Number(timeOnly[2]),
    )
    if (!Number.isNaN(d.getTime())) return d
  }
  return null
}

function parseNum(raw: unknown): number | null {
  if (raw == null || raw === '') return null
  const n = Number(String(raw).replace(/,/g, '').trim())
  return Number.isFinite(n) ? n : null
}

function buildHeaderMap(headerRow: unknown[]): Map<number, keyof PmReadingImportRow | 'measuredAt'> {
  const map = new Map<number, keyof PmReadingImportRow | 'measuredAt'>()
  headerRow.forEach((cell, idx) => {
    const key = normalizeHeader(cell)
    if (key.includes('วันเวล') || key.includes('measured') || key === 'datetime' || key === 'time') {
      map.set(idx, 'measuredAt')
      return
    }
    const alias = HEADER_ALIASES[key]
    if (alias) map.set(idx, alias)
  })
  return map
}

export function parsePmReadingsWorkbook(buf: Buffer): {
  rows: PmReadingImportRow[]
  issues: PmReadingImportParseIssue[]
} {
  const wb = XLSX.read(buf, { type: 'buffer', cellDates: false })
  const allRows: PmReadingImportRow[] = []
  const allIssues: PmReadingImportParseIssue[] = []

  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName]
    if (!sheet) continue
    const parsed = parsePmReadingsSheet(sheet, sheetName)
    allRows.push(...parsed.rows)
    allIssues.push(...parsed.issues)
  }

  if (wb.SheetNames.length === 0) {
    return { rows: [], issues: [{ rowNo: 0, wkorder: '', message: 'ไม่พบ sheet ในไฟล์' }] }
  }

  return { rows: allRows, issues: allIssues }
}

function parsePmReadingsSheet(
  sheet: XLSX.WorkSheet,
  sheetName: string,
): { rows: PmReadingImportRow[]; issues: PmReadingImportParseIssue[] } {
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' })
  if (aoa.length < 2) {
    return { rows: [], issues: [] }
  }

  const headerMap = buildHeaderMap(aoa[0] ?? [])
  const hasWkorder = [...headerMap.values()].includes('wkorder')
  const hasValues =
    [...headerMap.values()].includes('v1') &&
    [...headerMap.values()].includes('v2') &&
    [...headerMap.values()].includes('v3')
  if (!hasWkorder || !hasValues) {
    // sheet อ้างอิงกราฟ (Time | Phase R/S/T) — ไม่มีเลข WO
    return { rows: [], issues: [] }
  }

  const rows: PmReadingImportRow[] = []
  const issues: PmReadingImportParseIssue[] = []

  for (let i = 1; i < aoa.length; i++) {
    const line = aoa[i] ?? []
    const rowNo = i + 1
    const draft: Partial<PmReadingImportRow> & { measuredAtRaw?: unknown } = {
      rowNo,
      kind: 'current_3phase',
      warningLimit: null,
      alarmLimit: null,
    }

    for (const [colIdx, field] of headerMap.entries()) {
      const val = line[colIdx]
      if (field === 'measuredAt') {
        draft.measuredAtRaw = val
      } else if (field === 'kind') {
        const k = parseKind(cellStr(val))
        if (k) draft.kind = k
      } else if (field === 'warningLimit' || field === 'alarmLimit') {
        draft[field] = parseNum(val)
      } else if (field === 'v1' || field === 'v2' || field === 'v3') {
        draft[field] = parseNum(val) ?? undefined
      } else if (field === 'wkorder' || field === 'machine' || field === 'pmlist') {
        draft[field] = cellStr(val)
      }
    }

    const wkorder = (draft.wkorder ?? '').trim()
    if (!wkorder) continue

    const v1 = draft.v1
    const v2 = draft.v2
    const v3 = draft.v3
    if (v1 == null || v2 == null || v3 == null) {
      issues.push({ rowNo, wkorder, message: 'ค่าวัด 3 ช่อง (R/S/T หรือ X/Y/Z) ไม่ครบหรือไม่ใช่ตัวเลข' })
      continue
    }

    const measured = parseMeasuredAt(draft.measuredAtRaw)
    if (!measured) {
      issues.push({ rowNo, wkorder, message: 'วันเวลาวัดไม่ถูกต้อง' })
      continue
    }

    rows.push({
      rowNo,
      wkorder,
      machine: (draft.machine ?? '').trim(),
      pmlist: (draft.pmlist ?? '').trim(),
      kind: draft.kind ?? 'current_3phase',
      measuredAt: measured.toISOString(),
      v1,
      v2,
      v3,
      warningLimit: draft.warningLimit ?? null,
      alarmLimit: draft.alarmLimit ?? null,
    })
  }

  return { rows, issues }
}

export function buildPmReadingsImportTemplateBuffer(): Buffer {
  const currentHeader = pmReadingsImportHeaderRow('current_3phase')
  const vibrationHeader = pmReadingsImportHeaderRow('vibration_3axis')

  const wo = '4001565681'
  const pmTask = 'ตรวจเช็คกระแสไฟฟ้าทั้ง 3 เฟส'
  const kindCurrent = 'กระแส 3 เฟส'

  const currentSheet = [
    currentHeader,
    // ค่าจากกระดาษ WO — 1 จุดวัดต่อเครื่อง
    [wo, 'Main Oil Pump', pmTask, kindCurrent, '26/05/2026 19:10', 97.5, 97.6, 96.2, '', ''],
    [wo, 'Combustion Fan', pmTask, kindCurrent, '26/05/2026 19:15', 39.9, 40.5, 40.6, '', ''],
    [
      wo,
      'Thermal Oil Circulating Pump',
      pmTask,
      kindCurrent,
      '26/05/2026 19:20',
      143.2,
      151.1,
      150.2,
      '',
      '',
    ],
    // ตัวอย่างตารางกราฟ — หลายจุดเวลา (คอลัมน์ วันเวลาวัด = Time)
    [wo, 'Main Oil Pump', pmTask, kindCurrent, '08:00', 120, 118, 121, '', ''],
    [wo, 'Main Oil Pump', pmTask, kindCurrent, '09:00', 125, 123, 126, '', ''],
    [wo, 'Main Oil Pump', pmTask, kindCurrent, '10:00', 130, 127, 129, '', ''],
    [wo, 'Main Oil Pump', pmTask, kindCurrent, '11:00', 128, 126, 131, '', ''],
    [wo, 'Main Oil Pump', pmTask, kindCurrent, '12:00', 135, 132, 134, '', ''],
  ]

  const vibrationSheet = [
    vibrationHeader,
    [
      wo,
      'Oil Pump',
      'Vibration bearing',
      'Vibration 3 แกน',
      '26/05/2026 10:30',
      2.1,
      3.6,
      1.9,
      3,
      4,
    ],
  ]

  const chartReferenceSheet = [
    [...PM_READINGS_IMPORT_HEADERS.chartReference],
    ['08:00', 120, 118, 121],
    ['09:00', 125, 123, 126],
    ['10:00', 130, 127, 129],
    ['11:00', 128, 126, 131],
    ['12:00', 135, 132, 134],
  ]

  const wb = XLSX.utils.book_new()

  const wsCurrent = XLSX.utils.aoa_to_sheet(currentSheet)
  wsCurrent['!cols'] = currentHeader.map((h) => ({ wch: Math.max(16, h.length + 2) }))
  XLSX.utils.book_append_sheet(wb, wsCurrent, 'กระแส 3 เฟส')

  const wsVib = XLSX.utils.aoa_to_sheet(vibrationSheet)
  wsVib['!cols'] = vibrationHeader.map((h) => ({ wch: Math.max(16, h.length + 2) }))
  XLSX.utils.book_append_sheet(wb, wsVib, 'Vibration 3 แกน')

  const wsChart = XLSX.utils.aoa_to_sheet(chartReferenceSheet)
  wsChart['!cols'] = PM_READINGS_IMPORT_HEADERS.chartReference.map((h) => ({
    wch: Math.max(14, h.length + 2),
  }))
  XLSX.utils.book_append_sheet(wb, wsChart, 'ตารางกราฟ (อ้างอิง)')

  return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }) as Buffer
}
