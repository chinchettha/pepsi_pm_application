import type { Pool } from 'pg'

export type WorktimeBreakdown = {
  wh: number
  ot1: number
  ot15: number
  ot1hol: number
  ot2: number
  ot3: number
  total: number
}

export type ManhoursWeekRow = {
  week: string
  planned: number
  actual: number
  backlog: number
}

/** เทียบ worktime_count.php — รวม wh + OT ทุกแถวของ idwkctr */
export async function getWorktimeTotal(
  pool: Pool,
  idwkctr: string,
): Promise<WorktimeBreakdown | null> {
  const r = await pool.query<{
    wh: string
    ot1: string
    ot15: string
    ot1hol: string
    ot2: string
    ot3: string
  }>(
    `SELECT
       COALESCE(SUM(wh), 0)::text AS wh,
       COALESCE(SUM(ot1), 0)::text AS ot1,
       COALESCE(SUM(ot15), 0)::text AS ot15,
       COALESCE(SUM(ot1hol), 0)::text AS ot1hol,
       COALESCE(SUM(ot2), 0)::text AS ot2,
       COALESCE(SUM(ot3), 0)::text AS ot3
     FROM app.tbmanhours
     WHERE idwkctr = $1`,
    [idwkctr],
  )
  const row = r.rows[0]
  if (!row) return null

  const wh = Number(row.wh)
  const ot1 = Number(row.ot1)
  const ot15 = Number(row.ot15)
  const ot1hol = Number(row.ot1hol)
  const ot2 = Number(row.ot2)
  const ot3 = Number(row.ot3)
  const total = wh + ot1 + ot15 + ot1hol + ot2 + ot3

  if (total === 0 && wh === 0) return null

  return { wh, ot1, ot15, ot1hol, ot2, ot3, total }
}

/** สรุปรายสัปดาห์สำหรับหน้า Manhours — จาก tbmanhours ช่วงล่าสุด */
export async function getManhoursWeeklySummary(
  pool: Pool,
  idwkctr: string,
  daysBack = 56,
): Promise<ManhoursWeekRow[]> {
  const since = Math.floor(Date.now() / 1000) - daysBack * 86400

  const r = await pool.query<{
    week_label: string
    wh: string
    actual: string
    ot_sum: string
  }>(
    `SELECT
       to_char(to_timestamp(workday) AT TIME ZONE 'Asia/Bangkok', 'IYYY-"W"IW') AS week_label,
       COALESCE(SUM(wh), 0)::text AS wh,
       COALESCE(SUM(wh + ot1 + ot15 + ot1hol + ot2 + ot3), 0)::text AS actual,
       COALESCE(SUM(ot1 + ot15 + ot1hol + ot2 + ot3), 0)::text AS ot_sum
     FROM app.tbmanhours
     WHERE idwkctr = $1 AND workday >= $2
     GROUP BY 1
     ORDER BY MIN(workday)`,
    [idwkctr, since],
  )

  return r.rows.map((row) => {
    const planned = Number(row.wh)
    const actual = Number(row.actual)
    const backlog = Number(row.ot_sum)
    return {
      week: row.week_label,
      planned,
      actual,
      backlog,
    }
  })
}
