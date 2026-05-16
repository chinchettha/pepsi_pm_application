import type { Pool } from 'pg'
import {
  FACTORY_CODE,
  getMoveOverColor,
  mapOrderRowToEvent,
  monthRangeSec,
  type CalendarEvent,
  type OrderRow,
} from './scheduling-shared.js'

export async function listCalendarEvents(
  pool: Pool,
  year: number,
  month: number,
): Promise<CalendarEvent[]> {
  const { startSec, endSec, prefix } = monthRangeSec(year, month)
  const moveColor = await getMoveOverColor(pool)

  const r = await pool.query<OrderRow>(
    `SELECT idiw37, wkorder, wktype, bscstart, actfinish, cday, syst, operationshorttext, wkstcolor
     FROM app.view_order
     WHERE functionalloc LIKE $3
       AND bscstart IS NOT NULL
       AND bscstart > 0
       AND (
         (bscstart >= $1 AND bscstart < $2)
         OR (actfinish >= $1 AND actfinish < $2)
         OR (cday >= $1 AND cday < $2)
       )
     ORDER BY bscstart DESC
     LIMIT 2500`,
    [startSec, endSec, `%${FACTORY_CODE}%`],
  )

  const items: CalendarEvent[] = []
  for (const row of r.rows) {
    const ev = mapOrderRowToEvent(row, moveColor)
    if (ev && ev.date.startsWith(prefix)) items.push(ev)
  }
  return items
}
