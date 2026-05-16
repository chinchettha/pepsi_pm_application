import type { Pool } from 'pg'
import type { z } from 'zod'
import type { lineCalendarEventSchema } from '../schemas/line-calendar.js'

type LineCalendarEvent = z.infer<typeof lineCalendarEventSchema>

type Row = {
  idline: number
  idproductline: string | null
  productline: string
  lineday: string | number | null
  uptime: string | number | null
}

function linedayToDateString(lineday: number): string {
  const d = new Date(lineday * 1000)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatTooltip(lineday: number, uptime: number | null): string {
  const base = new Date(lineday * 1000)
  const startH = 7
  const start = new Date(base)
  start.setHours(startH, 0, 0, 0)
  const fmt = (dt: Date) =>
    dt.toLocaleString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  if (uptime != null && uptime > 0) {
    const end = new Date(start)
    end.setHours(startH + Math.floor(uptime), 0, 0, 0)
    return `${fmt(start)} น. TO ${fmt(end)} น.`
  }
  return 'Close'
}

function mapRow(row: Row): LineCalendarEvent | null {
  if (row.lineday == null || row.lineday === '') return null
  const lineday = Number(row.lineday)
  if (!Number.isFinite(lineday) || lineday <= 0) return null

  const uptime =
    row.uptime != null && row.uptime !== '' ? Number(row.uptime) : null
  const hasWork = uptime != null && uptime > 0
  const date = linedayToDateString(lineday)

  return {
    id: String(row.idline),
    date,
    title: `${row.productline} / Work : ${hasWork ? uptime : ''}`.trim(),
    orderId: row.idproductline ?? String(row.idline),
    color: hasWork ? '#408a63' : '#bfbfbf',
    description: formatTooltip(lineday, hasWork ? uptime : null),
  }
}

export async function listLineCalendarEvents(
  pool: Pool,
  year: number,
  month: number,
): Promise<LineCalendarEvent[]> {
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 1)
  const startSec = Math.floor(start.getTime() / 1000)
  const endSec = Math.floor(end.getTime() / 1000)

  const r = await pool.query<Row>(
    `SELECT idline, idproductline, productline, lineday, uptime
     FROM app.tblineschdul
     WHERE lineday IS NOT NULL
       AND lineday >= $1
       AND lineday < $2
     ORDER BY lineday, productline`,
    [startSec, endSec],
  )

  const items: LineCalendarEvent[] = []
  for (const row of r.rows) {
    const ev = mapRow(row)
    if (ev) items.push(ev)
  }
  return items
}
