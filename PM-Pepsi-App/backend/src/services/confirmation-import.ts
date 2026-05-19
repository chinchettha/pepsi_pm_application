import * as XLSX from 'xlsx'

/**
 * แมปคอลัมน์ Excel ตาม M_Confirm.php (sap/pages/M_Confirm.php)
 *
 * - skip 2 rows แรก (PHP: `if ($n > 2)`)
 * - คอลัมน์ที่ต้องไม่ว่าง (PHP บรรทัด 76):
 *     Row[0], Row[3], Row[6], Row[7], Row[8], Row[10], Row[11], Row[14], Row[15], Row[16], Row[17]
 * - การแปลงค่า (PHP บรรทัด 94-114, 139):
 *     confirmation = Row[0]
 *     wkorder      = Row[3]                                            (→ lookup tbiw37n.idiw37)
 *     wkctr        = Row[6]
 *     timewk       = Row[7]            (* 60 ถ้า Row[8] == 'H' → เก็บเป็น Min)
 *     unitc        = 'Min'             (ตายตัว ตาม PHP)
 *     timeclose    = parse(Row[11])    (dd.mm.yyyy เวลา 00:00:00)
 *     stdate       = combine(Row[16] dd.mm.yyyy, Row[14] HH:MM[:SS])
 *     endate       = combine(Row[17] dd.mm.yyyy, Row[15] HH:MM[:SS])
 *     cwkctr       = Row[19]           (optional)
 */

export type ConfirmParseError =
  | 'EMPTY_REQUIRED'
  | 'BAD_TIMEWK'
  | 'BAD_UNIT'
  | 'BAD_TIMECLOSE'
  | 'BAD_START_DATE'
  | 'BAD_START_TIME'
  | 'BAD_END_DATE'
  | 'BAD_END_TIME'
  | 'END_BEFORE_START'

export type ConfirmImportRow = {
  rowNo: number
  confirmation: string
  wkorder: string
  wkctr: string
  timewk: number
  unitc: 'Min'
  timeclose: number
  stdate: number
  endate: number
  cwkctr: string | null
}

export type ConfirmParseResult =
  | { kind: 'ok'; row: ConfirmImportRow }
  | {
      kind: 'error'
      rowNo: number
      code: ConfirmParseError
      message: string
      raw: {
        confirmation: string
        wkorder: string
        wkctr: string
      }
    }

function cellStr(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'number') return String(v)
  return String(v).trim()
}

/** dd.mm.yyyy → epoch วินาที (00:00:00) — เทียบ mktime ใน PHP */
export function parseDdMmYyyy(value: string): number | null {
  const t = value.trim()
  if (!t) return null
  const parts = t.split(/[./-]/)
  if (parts.length < 3) return null
  const day = Number(parts[0])
  const month = Number(parts[1])
  const year = Number(parts[2])
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return null
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1970 || year > 2100) return null
  const d = new Date(year, month - 1, day, 0, 0, 0, 0)
  const sec = Math.floor(d.getTime() / 1000)
  return sec > 0 ? sec : null
}

/** HH:MM หรือ HH:MM:SS → {hh, mm, ss} (เทียบ explode(":", $Row[14]) ใน PHP) */
function parseHhMm(value: string): { hh: number; mm: number; ss: number } | null {
  const t = value.trim()
  if (!t) return null
  const parts = t.split(':')
  if (parts.length < 2) return null
  const hh = Number(parts[0])
  const mm = Number(parts[1])
  const ss = parts.length >= 3 ? Number(parts[2]) : 0
  if (!Number.isFinite(hh) || !Number.isFinite(mm) || !Number.isFinite(ss)) return null
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59 || ss < 0 || ss > 59) return null
  return { hh, mm, ss }
}

/** combine dd.mm.yyyy + HH:MM[:SS] → epoch วินาที */
function combineDateTime(dateStr: string, timeStr: string): number | null {
  const t = parseHhMm(timeStr)
  if (!t) return null
  const dParts = dateStr.trim().split(/[./-]/)
  if (dParts.length < 3) return null
  const day = Number(dParts[0])
  const month = Number(dParts[1])
  const year = Number(dParts[2])
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return null
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1970 || year > 2100) return null
  const d = new Date(year, month - 1, day, t.hh, t.mm, t.ss, 0)
  const sec = Math.floor(d.getTime() / 1000)
  return sec > 0 ? sec : null
}

function rowArrayToParseResult(cells: unknown[], rowNo: number): ConfirmParseResult {
  const get = (i: number) => cellStr(cells[i])

  const confirmation = get(0)
  const wkorder = get(3)
  const wkctr = get(6)
  const timewkRaw = get(7)
  const unitRaw = get(8)
  const col10 = get(10) // PHP validates not empty แต่ไม่ใช้ในการ INSERT
  const closeDateRaw = get(11)
  const startTimeRaw = get(14)
  const endTimeRaw = get(15)
  const startDateRaw = get(16)
  const endDateRaw = get(17)
  const cwkctrRaw = get(19)

  const rawSummary = { confirmation, wkorder, wkctr }

  if (
    !confirmation ||
    !wkorder ||
    !wkctr ||
    !timewkRaw ||
    !unitRaw ||
    !col10 ||
    !closeDateRaw ||
    !startTimeRaw ||
    !endTimeRaw ||
    !startDateRaw ||
    !endDateRaw
  ) {
    return {
      kind: 'error',
      rowNo,
      code: 'EMPTY_REQUIRED',
      message: 'มีคอลัมน์ที่จำเป็นว่าง (Row 0/3/6/7/8/10/11/14/15/16/17)',
      raw: rawSummary,
    }
  }

  const timewkNum = Number(timewkRaw)
  if (!Number.isFinite(timewkNum) || timewkNum < 0) {
    return {
      kind: 'error',
      rowNo,
      code: 'BAD_TIMEWK',
      message: `ค่าเวลาทำงาน (Row[7]) ไม่ใช่ตัวเลข: "${timewkRaw}"`,
      raw: rawSummary,
    }
  }

  const unit = unitRaw.toUpperCase()
  if (unit !== 'H' && unit !== 'MIN' && unit !== 'M') {
    return {
      kind: 'error',
      rowNo,
      code: 'BAD_UNIT',
      message: `หน่วยเวลา (Row[8]) ต้องเป็น H หรือ Min: "${unitRaw}"`,
      raw: rawSummary,
    }
  }
  // PHP: ถ้า Row[8] == 'H' ให้ * 60 แล้วเก็บเป็น Min
  const timewkMin = unit === 'H' ? Math.round(timewkNum * 60) : Math.round(timewkNum)

  const timeclose = parseDdMmYyyy(closeDateRaw)
  if (timeclose == null) {
    return {
      kind: 'error',
      rowNo,
      code: 'BAD_TIMECLOSE',
      message: `วันที่ปิดงาน (Row[11]) ต้องอยู่รูปแบบ dd.mm.yyyy: "${closeDateRaw}"`,
      raw: rawSummary,
    }
  }

  const stdate = combineDateTime(startDateRaw, startTimeRaw)
  if (stdate == null) {
    const t = parseHhMm(startTimeRaw)
    return {
      kind: 'error',
      rowNo,
      code: t == null ? 'BAD_START_TIME' : 'BAD_START_DATE',
      message:
        t == null
          ? `เวลาเริ่ม (Row[14]) ต้องเป็น HH:MM[:SS]: "${startTimeRaw}"`
          : `วันที่เริ่ม (Row[16]) ต้องเป็น dd.mm.yyyy: "${startDateRaw}"`,
      raw: rawSummary,
    }
  }

  const endate = combineDateTime(endDateRaw, endTimeRaw)
  if (endate == null) {
    const t = parseHhMm(endTimeRaw)
    return {
      kind: 'error',
      rowNo,
      code: t == null ? 'BAD_END_TIME' : 'BAD_END_DATE',
      message:
        t == null
          ? `เวลาสิ้นสุด (Row[15]) ต้องเป็น HH:MM[:SS]: "${endTimeRaw}"`
          : `วันที่สิ้นสุด (Row[17]) ต้องเป็น dd.mm.yyyy: "${endDateRaw}"`,
      raw: rawSummary,
    }
  }

  if (endate < stdate) {
    return {
      kind: 'error',
      rowNo,
      code: 'END_BEFORE_START',
      message: 'เวลาสิ้นสุดอยู่ก่อนเวลาเริ่ม',
      raw: rawSummary,
    }
  }

  return {
    kind: 'ok',
    row: {
      rowNo,
      confirmation,
      wkorder,
      wkctr,
      timewk: timewkMin,
      unitc: 'Min',
      timeclose,
      stdate,
      endate,
      cwkctr: cwkctrRaw || null,
    },
  }
}

function sheetToMatrix(buffer: Buffer, fileName: string): unknown[][] {
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.csv')) {
    const text = buffer.toString('utf8')
    const lines = text.split(/\r?\n/).filter((l) => l.length > 0)
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

/**
 * Parse Confirm Excel/CSV
 * - skip 2 rows แรก (header + sub-header) — เทียบ PHP `if ($n > 2)`
 * - คืนทุกแถวพร้อม ok/error เพื่อให้ caller (service) เลือก insert/update และ
 *   route ใช้แสดงผลทีละแถว (เทียบตารางผลลัพธ์ของ M_Confirm.php)
 */
export function parseConfirmFile(buffer: Buffer, fileName: string): ConfirmParseResult[] {
  const matrix = sheetToMatrix(buffer, fileName)
  const out: ConfirmParseResult[] = []
  // PHP เริ่มนับ $n = 1 และเก็บเมื่อ $n > 2 → ข้าม index 0 และ 1 ของ matrix
  for (let i = 2; i < matrix.length; i++) {
    const row = matrix[i]
    if (!row || !Array.isArray(row)) continue
    // ข้ามแถวว่างทั้งแถว
    const isEmpty = row.every((c) => cellStr(c) === '')
    if (isEmpty) continue
    out.push(rowArrayToParseResult(row, i + 1))
  }
  return out
}
