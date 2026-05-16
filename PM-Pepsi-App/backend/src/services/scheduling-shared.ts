import type { Pool } from 'pg'
import type { calendarEventSchema } from '../schemas/calendar.js'
import type { z } from 'zod'

export type CalendarEvent = z.infer<typeof calendarEventSchema>

/** เทียบ $Factory_code ใน sap/include/define.php */
export const FACTORY_CODE = '7151'

export type OrderRow = {
  idiw37: number
  wkorder: string
  wktype: string | null
  bscstart: string | number | null
  actfinish: string | number | null
  cday: string | number | null
  syst: string | null
  operationshorttext: string | null
  wkstcolor: string | null
}

export function unixToDateString(sec: number): string {
  const d = new Date(sec * 1000)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function pickDisplayUnix(row: OrderRow): number | null {
  const cday = row.cday != null && row.cday !== '' ? Number(row.cday) : null
  if (cday != null && cday > 0) return cday
  const actfinish =
    row.actfinish != null && row.actfinish !== '' ? Number(row.actfinish) : null
  if (actfinish != null && actfinish > 0) return actfinish
  const bscstart =
    row.bscstart != null && row.bscstart !== '' ? Number(row.bscstart) : null
  if (bscstart != null && bscstart > 0) return bscstart
  return null
}

export function mapOrderRowToEvent(row: OrderRow, moveColor: string): CalendarEvent | null {
  const bscstart =
    row.bscstart != null && row.bscstart !== '' ? Number(row.bscstart) : null
  if (bscstart == null || !Number.isFinite(bscstart) || bscstart <= 0) {
    return null
  }

  const displayUnix = pickDisplayUnix(row)
  if (displayUnix == null) return null

  const syst = (row.syst ?? '').trim()
  const hasMove =
    row.cday != null &&
    row.cday !== '' &&
    Number(row.cday) > 0 &&
    (syst === 'REL' || syst === 'CRTD')
  const color = hasMove ? moveColor : (row.wkstcolor ?? '#6b7280')

  const wktype = row.wktype?.trim() ?? ''
  const title = wktype ? `${row.wkorder} / ${wktype}` : row.wkorder

  return {
    id: String(row.idiw37),
    date: unixToDateString(displayUnix),
    title,
    orderId: row.wkorder,
    color,
    description: row.operationshorttext?.trim() || undefined,
  }
}

export async function getMoveOverColor(pool: Pool): Promise<string> {
  const r = await pool.query<{ wkstcolor: string }>(
    `SELECT wkstcolor FROM app.tbwkstatus WHERE syst = 'MOVE OVER' LIMIT 1`,
  )
  return r.rows[0]?.wkstcolor ?? '#f97316'
}

export function monthRangeSec(year: number, month: number) {
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 1)
  return {
    startSec: Math.floor(start.getTime() / 1000),
    endSec: Math.floor(end.getTime() / 1000),
    prefix: `${year}-${String(month).padStart(2, '0')}`,
  }
}

export function appendInFilter(
  column: string,
  values: string[],
  params: unknown[],
): string {
  if (values.length === 0) return ''
  const start = params.length + 1
  const placeholders = values.map((_, i) => `$${start + i}`).join(', ')
  params.push(...values)
  return ` AND ${column} IN (${placeholders})`
}
