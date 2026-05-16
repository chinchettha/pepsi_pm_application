import type { Pool } from 'pg'
import type { activityTypeItemSchema } from '../schemas/master-data.js'
import type { z } from 'zod'

export type ActivityTypeItem = z.infer<typeof activityTypeItemSchema>

export async function listActivityTypes(pool: Pool): Promise<ActivityTypeItem[]> {
  const r = await pool.query<{ mat: string; matdescrip: string | null; matcheck: string | null }>(
    `SELECT mat, matdescrip, matcheck
     FROM app.tbactivitytype
     ORDER BY mat`,
  )
  return r.rows.map((row) => ({
    id: row.mat,
    mat: row.mat,
    matdescrip: row.matdescrip ?? '',
    matcheck: row.matcheck ?? '',
  }))
}

export type ActivityTypeInput = {
  mat: string
  matdescrip?: string
  matcheck?: string
}

export async function createActivityType(
  pool: Pool,
  input: ActivityTypeInput,
): Promise<ActivityTypeItem> {
  const mat = input.mat.trim()
  const matdescrip = (input.matdescrip ?? '').trim()
  const matcheck = (input.matcheck ?? '').trim()
  await pool.query(
    `INSERT INTO app.tbactivitytype (mat, matdescrip, matcheck)
     VALUES ($1, $2, $3)`,
    [mat, matdescrip, matcheck],
  )
  return { id: mat, mat, matdescrip, matcheck }
}

export async function updateActivityType(
  pool: Pool,
  mat: string,
  input: Omit<ActivityTypeInput, 'mat'>,
): Promise<ActivityTypeItem | null> {
  const matdescrip = (input.matdescrip ?? '').trim()
  const matcheck = (input.matcheck ?? '').trim()
  const r = await pool.query(
    `UPDATE app.tbactivitytype
     SET matdescrip = $2, matcheck = $3
     WHERE mat = $1
     RETURNING mat, matdescrip, matcheck`,
    [mat, matdescrip, matcheck],
  )
  const row = r.rows[0] as { mat: string; matdescrip: string | null; matcheck: string | null } | undefined
  if (!row) return null
  return {
    id: row.mat,
    mat: row.mat,
    matdescrip: row.matdescrip ?? '',
    matcheck: row.matcheck ?? '',
  }
}

export async function deleteActivityType(pool: Pool, mat: string): Promise<boolean> {
  const r = await pool.query(`DELETE FROM app.tbactivitytype WHERE mat = $1`, [mat])
  return (r.rowCount ?? 0) > 0
}

export async function importActivityTypes(
  pool: Pool,
  rows: ActivityTypeInput[],
): Promise<{ inserted: number; updated: number; skipped: number }> {
  let inserted = 0
  let updated = 0
  let skipped = 0
  for (const row of rows) {
    const mat = row.mat?.trim()
    if (!mat) {
      skipped++
      continue
    }
    const matdescrip = (row.matdescrip ?? '').trim()
    const matcheck = (row.matcheck ?? '').trim()
    const exists = await pool.query(`SELECT 1 FROM app.tbactivitytype WHERE mat = $1`, [mat])
    if (exists.rowCount === 0) {
      await pool.query(
        `INSERT INTO app.tbactivitytype (mat, matdescrip, matcheck) VALUES ($1, $2, $3)`,
        [mat, matdescrip, matcheck],
      )
      inserted++
    } else {
      await pool.query(
        `UPDATE app.tbactivitytype SET matdescrip = $2, matcheck = $3 WHERE mat = $1`,
        [mat, matdescrip, matcheck],
      )
      updated++
    }
  }
  return { inserted, updated, skipped }
}
