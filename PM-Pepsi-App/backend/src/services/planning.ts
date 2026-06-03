import type { Pool } from 'pg'
import type { z } from 'zod'
import { resolveCalendarWorkHours } from '../lib/calendar-event-display.js'
import type { planningItemSchema } from '../schemas/planning.js'

type PlanningItem = z.infer<typeof planningItemSchema>

type PlanningAssignBody = {
  idiw37: number
  mode: 'P' | 'G'
  code: string
  comment?: string
}

type PlanRow = {
  idiw37: number
  wkorder: string
  wktype: string | null
  operationshorttext: string | null
  functionalloc: string | null
  equdescrip: string | null
  bscstart: string | number | null
  actfinish: string | number | null
  syst: string | null
  idplanw: number | null
  wkctrpw: string | null
  pwteam: string | null
  idwkctr: string | null
  cday: string | number | null
  work: string | number | null
  untime: string | null
  import_wkctr: string | null
}

function unixToMonth(sec: number | null): string {
  if (sec == null || sec <= 0) return '—'
  const d = new Date(sec * 1000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function unixToIsoDate(sec: string | number | null): string {
  if (sec == null || sec === '') return ''
  const n = Number(sec)
  if (!Number.isFinite(n) || n <= 0) return ''
  const d = new Date(n * 1000)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function mapRow(row: PlanRow): PlanningItem {
  const bsc = row.bscstart != null ? Number(row.bscstart) : null
  const cday = row.cday != null && row.cday !== '' ? Number(row.cday) : null
  const hasPlan = row.idplanw != null
  const syst = (row.syst ?? '').trim()
  let status: PlanningItem['status'] = 'OPEN'
  if (hasPlan) status = 'CONF'
  if (syst && !['CRTD', 'REL'].includes(syst)) status = 'CLOS'

  const title = row.operationshorttext?.trim() || row.wkorder
  const owner =
    row.wkctrpw?.trim() ||
    row.pwteam?.trim() ||
    ''

  return {
    id: String(row.idiw37),
    planName: `${row.wkorder} — ${title}`,
    line: row.functionalloc?.trim() || row.equdescrip?.trim() || '—',
    month: unixToMonth(bsc),
    status,
    owner,
    wkorder: row.wkorder,
    wktype: row.wktype?.trim() ?? '',
    planDate: unixToIsoDate(row.bscstart),
    movedDate: cday ? unixToIsoDate(cday) : undefined,
    closedDate: unixToIsoDate(row.actfinish) || undefined,
    workHours: resolveCalendarWorkHours(row.work, row.untime) || undefined,
    importWkctr: row.import_wkctr?.trim() || undefined,
  }
}

export async function listPlanningForUser(
  pool: Pool,
  idwkctr: string,
  status: 'open' | 'closed' = 'open',
): Promise<PlanningItem[]> {
  const statusSql =
    status === 'closed'
      ? `vp.syst NOT IN ('CRTD', 'REL')`
      : `vp.syst IN ('CRTD', 'REL')`
  const r = await pool.query<PlanRow>(
    `SELECT vp.idiw37, vp.wkorder, vp.wktype, vp.operationshorttext, vp.functionalloc, vp.equdescrip,
            vp.bscstart, vp.actfinish, vp.syst, vp.idplanw, vp.wkctrpw, vp.pwteam, vp.idwkctr, vp.cday,
            i.work, i.untime, i.wkctr AS import_wkctr
     FROM app.view_planwork vp
     JOIN app.tbiw37n i ON i.idiw37 = vp.idiw37
     WHERE vp.idwkctr = $1 AND ${statusSql}
     ORDER BY vp.bscstart DESC NULLS LAST
     LIMIT 500`,
    [idwkctr],
  )
  return r.rows.map(mapRow)
}

/**
 * เพิ่ม assignment (มอบหมายช่าง) สำหรับ WO — รองรับ multi-assign (1 WO หลายคน)
 * เทียบ `AddPlan.php`:
 *   - mode='P' → INSERT (idiw37, wkctr) 1 แถว
 *   - mode='G' → expand `wkctr` (= idwkctrgroup) เป็น INSERT หลายแถวจาก `tbworkcenter.idwkctrgroup`
 *   - ON CONFLICT (idiw37, wkctr) DO NOTHING (ไม่ทับ comment เดิม)
 */
export async function assignPlanningWork(
  pool: Pool,
  body: PlanningAssignBody,
  actorWkctr: string,
): Promise<boolean> {
  const code = body.code.trim()
  if (!code) return false

  const exists = await pool.query<{ idiw37: number }>(
    `SELECT idiw37
     FROM app.tbiw37n
     WHERE idiw37 = $1 AND syst IN ('CRTD', 'REL')
     LIMIT 1`,
    [body.idiw37],
  )
  if (!exists.rows[0]) return false

  const dayNow = Math.floor(Date.now() / 1000) // เทียบ legacy `mktime(...)`

  if (body.mode === 'G') {
    // ขยายเป็นช่างทั้งกลุ่ม — เทียบ AddPlan.php $sqlG
    const members = await pool.query<{ wkctr: string }>(
      `SELECT wkctr
       FROM app.tbworkcenter
       WHERE idwkctrgroup::text = $1
         AND COALESCE(wkctr, '') <> ''`,
      [code],
    )
    if (members.rowCount === 0) return false

    for (const m of members.rows) {
      await pool.query(
        `INSERT INTO app.tbplangingwork (idiw37, wkctr, wkctrpw, pwcomment, pwteam)
         VALUES ($1, $2, $3, $4, 'G')
         ON CONFLICT (idiw37, wkctr) DO NOTHING`,
        [body.idiw37, m.wkctr, actorWkctr, String(dayNow)],
      )
    }
    return true
  }

  await pool.query(
    `INSERT INTO app.tbplangingwork (idiw37, wkctr, wkctrpw, pwcomment, pwteam)
     VALUES ($1, $2, $3, $4, 'P')
     ON CONFLICT (idiw37, wkctr) DO NOTHING`,
    [body.idiw37, code, actorWkctr, body.comment?.trim() || String(dayNow)],
  )
  return true
}

/**
 * ลบ assignment เฉพาะคู่ (idiw37, wkctr) — เทียบ `AddPlan.php` `st=Del`
 * (PHP รับ idplanw แต่ React API ใช้ key (idiw37, wkctr) เพื่อสอดคล้อง URL)
 */
export async function removePlanningAssignment(
  pool: Pool,
  idiw37: number,
  wkctr: string,
): Promise<boolean> {
  const r = await pool.query(
    `DELETE FROM app.tbplangingwork WHERE idiw37 = $1 AND wkctr = $2`,
    [idiw37, wkctr],
  )
  return (r.rowCount ?? 0) > 0
}

/** ลบ idplanw ตรง ๆ (ใช้ภายในกรณีรู้ idplanw — เทียบ AddPlan.php `SQLdel` ที่ใช้ idplanw) */
export async function removePlanningAssignmentByIdplanw(
  pool: Pool,
  idplanw: number,
): Promise<boolean> {
  const r = await pool.query(
    `DELETE FROM app.tbplangingwork WHERE idplanw = $1`,
    [idplanw],
  )
  return (r.rowCount ?? 0) > 0
}
