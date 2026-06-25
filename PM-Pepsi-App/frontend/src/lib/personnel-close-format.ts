/** แปลง epoch (วินาที) → `DD.MM.YYYY HH:mm` ตาม UI ระบบเก่า / ลูกค้า */
export function formatPersonnelCloseDateTime(sec: number): string {
  const d = new Date(sec * 1000)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`
}

/** ระยะเวลาเป็นนาที — แสดง `40.00 Min` */
export function formatPersonnelCloseDuration(minutes: number, unit = 'Min'): string {
  return `${minutes.toFixed(2)} ${unit}`
}

export function todayDdMmYyyy(): string {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = String(d.getFullYear())
  return `${dd}.${mm}.${yyyy}`
}

/** Current local time as `HH:mm` for close-out defaults */
export function nowHhMm(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** Add minutes to `HH:mm` (wraps within same day) */
export function addMinutesHhMm(hhMm: string, minutes: number): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhMm.trim())
  if (!m) return hhMm
  const d = new Date()
  d.setHours(Number(m[1]), Number(m[2]), 0, 0)
  d.setMinutes(d.getMinutes() + minutes)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function isoDateToDdMmYyyy(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!m) return iso
  return `${m[3]}.${m[2]}.${m[1]}`
}

export function ddMmYyyyToIsoDate(v: string): string {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(v.trim())
  if (!m) return v
  const dd = m[1].padStart(2, '0')
  const mm = m[2].padStart(2, '0')
  return `${m[3]}-${mm}-${dd}`
}

/** `DD.MM.YYYY` → ISO for DatePicker; empty when invalid */
export function ddMmYyyyToIsoDateField(v: string): string {
  const iso = ddMmYyyyToIsoDate(v)
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : ''
}

/** Parse `DD.MM.YYYY` → local `Date` (midnight) for calendar widgets */
export function parseDdMmYyyyToDate(v: string): Date | undefined {
  const iso = ddMmYyyyToIsoDate(v)
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return undefined
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(d.getTime()) ? undefined : d
}

export function dateToDdMmYyyy(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}.${mm}.${yyyy}`
}

export function epochToDdMmYyyy(sec: number): string {
  const d = new Date(sec * 1000)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}.${mm}.${yyyy}`
}

export function epochToHhMm(sec: number): string {
  const d = new Date(sec * 1000)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** คำนวณระยะเวลา (นาที) จาก DD.MM.YYYY + HH:mm — ใช้ preview ใน UI */
export function previewDurationMinutes(
  startD: string,
  startT: string,
  endD: string,
  endT: string,
): number | null {
  const parseD = (v: string) => {
    const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(v.trim())
    if (!m) return null
    return { dd: Number(m[1]), mm: Number(m[2]), yyyy: Number(m[3]) }
  }
  const parseT = (v: string) => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(v.trim())
    if (!m) return null
    return { hh: Number(m[1]), min: Number(m[2]) }
  }
  const d1 = parseD(startD)
  const d2 = parseD(endD)
  const t1 = parseT(startT)
  const t2 = parseT(endT)
  if (!d1 || !d2 || !t1 || !t2) return null
  const st = new Date(d1.yyyy, d1.mm - 1, d1.dd, t1.hh, t1.min, 0, 0).getTime()
  const en = new Date(d2.yyyy, d2.mm - 1, d2.dd, t2.hh, t2.min, 0, 0).getTime()
  const diff = en - st
  if (!Number.isFinite(diff) || diff <= 0) return null
  return Math.floor(diff / 60_000)
}
