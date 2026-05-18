import type { Pool } from 'pg'

type WorkcenterRow = {
  wkctr: string
  titlewkctr: string | null
  namewkctr: string | null
  surnamewkctr: string | null
}

export type WorkcenterItem = { wkctr: string; displayName: string }

export async function listWorkcenters(pool: Pool): Promise<WorkcenterItem[]> {
  const r = await pool.query<WorkcenterRow>(
    `SELECT wkctr, titlewkctr, namewkctr, surnamewkctr
     FROM app.tbworkcenter
     ORDER BY wkctr ASC`,
  )
  return r.rows.map((row) => ({
    wkctr: row.wkctr,
    displayName: `${row.titlewkctr ?? ''}${row.namewkctr ?? ''} ${row.surnamewkctr ?? ''}`.trim(),
  }))
}

type ConfirmationRow = {
  idclose: number
  idiw37: number
  wkorder: string | null
  wkctr: string
  titlewkctr: string | null
  namewkctr: string | null
  surnamewkctr: string | null
  stdate: string | number
  endate: string | number
  timewk: string | number
  unitc: string
}

export type ConfirmationCloseItem = {
  idclose: number
  idiw37: number
  wkctr: string
  displayName: string
  stdate: number
  endate: number
  timewk: number
  unitc: string
}

export async function getConfirmationByWorkOrder(
  pool: Pool,
  wkorder: string,
): Promise<{ idiw37: number; wkorder: string; items: ConfirmationCloseItem[] } | null> {
  const r = await pool.query<ConfirmationRow>(
    `SELECT idclose, idiw37, wkorder, wkctr, titlewkctr, namewkctr, surnamewkctr,
            stdate, endate, timewk, unitc
     FROM app.view_confirmation
     WHERE wkorder = $1
     ORDER BY wkctr ASC, idclose ASC`,
    [wkorder],
  )
  if (r.rows.length === 0) return null
  const idiw37 = Number(r.rows[0].idiw37)
  const items = r.rows.map((row) => ({
    idclose: row.idclose,
    idiw37: Number(row.idiw37),
    wkctr: row.wkctr,
    displayName: `${row.titlewkctr ?? ''}${row.namewkctr ?? ''} ${row.surnamewkctr ?? ''}`.trim(),
    stdate: Number(row.stdate),
    endate: Number(row.endate),
    timewk: Number(row.timewk),
    unitc: row.unitc,
  }))
  return { idiw37, wkorder, items }
}

type Iw37Row = { idiw37: number; wkorder: string }

export async function findWorkOrderByWkorder(
  pool: Pool,
  wkorder: string,
): Promise<Iw37Row | null> {
  const r = await pool.query<Iw37Row>(
    `SELECT idiw37, wkorder
     FROM app.tbiw37n
     WHERE wkorder = $1
     LIMIT 1`,
    [wkorder],
  )
  return r.rows[0] ?? null
}

function parseDdMmYyyy(v: string): { dd: number; mm: number; yyyy: number } | null {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(v.trim())
  if (!m) return null
  const dd = Number(m[1])
  const mm = Number(m[2])
  const yyyy = Number(m[3])
  if (!Number.isFinite(dd) || !Number.isFinite(mm) || !Number.isFinite(yyyy)) return null
  if (dd < 1 || dd > 31 || mm < 1 || mm > 12 || yyyy < 1970 || yyyy > 2100) return null
  return { dd, mm, yyyy }
}

function parseHhMm(v: string): { hh: number; min: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(v.trim())
  if (!m) return null
  const hh = Number(m[1])
  const min = Number(m[2])
  if (!Number.isFinite(hh) || !Number.isFinite(min)) return null
  if (hh < 0 || hh > 23 || min < 0 || min > 59) return null
  return { hh, min }
}

function computeEpochSeconds(d: { dd: number; mm: number; yyyy: number }, t: { hh: number; min: number }): number {
  const dt = new Date(d.yyyy, d.mm - 1, d.dd, t.hh, t.min, 0, 0)
  return Math.floor(dt.getTime() / 1000)
}

function durationMinutes(stSec: number, enSec: number): number {
  const diff = enSec - stSec
  if (!Number.isFinite(diff) || diff <= 0) return 0
  return Math.floor(diff / 60)
}

export async function addConfirmationClose(
  pool: Pool,
  opts: {
    idiw37: number
    wkctr: string
    startD: string
    startT: string
    endD: string
    endT: string
    cwkctr: string | null
  },
): Promise<void> {
  const d1 = parseDdMmYyyy(opts.startD)
  const d2 = parseDdMmYyyy(opts.endD)
  const t1 = parseHhMm(opts.startT)
  const t2 = parseHhMm(opts.endT)
  if (!d1 || !d2 || !t1 || !t2) throw new Error('Invalid date/time format')

  const stdate = computeEpochSeconds(d1, t1)
  const endate = computeEpochSeconds(d2, t2)
  const timewk = durationMinutes(stdate, endate)
  if (timewk <= 0) throw new Error('End time must be after start time')

  const timeclose = Math.floor(Date.now() / 1000)

  await pool.query(
    `INSERT INTO app.tbcofirm (idiw37, wkctr, stdate, endate, cwkctr, timeclose, timewk, unitc)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'Min')
     ON CONFLICT (idiw37, wkctr)
     DO UPDATE SET stdate = EXCLUDED.stdate, endate = EXCLUDED.endate,
                   cwkctr = EXCLUDED.cwkctr, timeclose = EXCLUDED.timeclose,
                   timewk = EXCLUDED.timewk, unitc = 'Min'`,
    [opts.idiw37, opts.wkctr, stdate, endate, opts.cwkctr, timeclose, timewk],
  )
}

export async function deleteConfirmationClose(pool: Pool, idclose: number): Promise<void> {
  await pool.query(`DELETE FROM app.tbcofirm WHERE idclose = $1`, [idclose])
}

export type ConfirmationCommentItem = {
  idcom: number
  idiw37: number
  comdetail: string
  wkctr: string
  createdAt: string
}

export async function listConfirmationComments(
  pool: Pool,
  idiw37: number,
): Promise<ConfirmationCommentItem[]> {
  const r = await pool.query<{
    idcom: string | number
    idiw37: string | number
    comdetail: string
    wkctr: string | null
    created_at: Date
  }>(
    `SELECT idcom, idiw37, comdetail, wkctr, created_at
     FROM app.tbconfirmcom
     WHERE idiw37 = $1
     ORDER BY created_at DESC, idcom DESC
     LIMIT 500`,
    [idiw37],
  )
  return r.rows.map((row) => ({
    idcom: Number(row.idcom),
    idiw37: Number(row.idiw37),
    comdetail: row.comdetail ?? '',
    wkctr: row.wkctr ?? '',
    createdAt: row.created_at.toISOString(),
  }))
}

export async function createConfirmationComment(
  pool: Pool,
  opts: { idiw37: number; comdetail: string; wkctr: string },
): Promise<ConfirmationCommentItem> {
  const r = await pool.query<{
    idcom: number
    idiw37: number
    comdetail: string
    wkctr: string
    created_at: Date
  }>(
    `INSERT INTO app.tbconfirmcom (idiw37, comdetail, wkctr)
     VALUES ($1, $2, $3)
     RETURNING idcom, idiw37, comdetail, wkctr, created_at`,
    [opts.idiw37, opts.comdetail, opts.wkctr],
  )
  const row = r.rows[0]
  return {
    idcom: row.idcom,
    idiw37: row.idiw37,
    comdetail: row.comdetail ?? '',
    wkctr: row.wkctr ?? '',
    createdAt: row.created_at.toISOString(),
  }
}

export async function updateConfirmationComment(
  pool: Pool,
  idcom: number,
  comdetail: string,
): Promise<ConfirmationCommentItem | null> {
  const r = await pool.query<{
    idcom: number
    idiw37: number
    comdetail: string
    wkctr: string
    created_at: Date
  }>(
    `UPDATE app.tbconfirmcom
     SET comdetail = $2
     WHERE idcom = $1
     RETURNING idcom, idiw37, comdetail, wkctr, created_at`,
    [idcom, comdetail],
  )
  const row = r.rows[0]
  if (!row) return null
  return {
    idcom: row.idcom,
    idiw37: row.idiw37,
    comdetail: row.comdetail ?? '',
    wkctr: row.wkctr ?? '',
    createdAt: row.created_at.toISOString(),
  }
}

export async function deleteConfirmationComment(pool: Pool, idcom: number): Promise<boolean> {
  const r = await pool.query(`DELETE FROM app.tbconfirmcom WHERE idcom = $1`, [idcom])
  return (r.rowCount ?? 0) > 0
}

export type ConfirmationImageItem = {
  idcimg: number
  idiw37: number
  fileName: string
  originalName: string
  mime: string
  bytes: number
  wkctr: string
  createdAt: string
}

export async function listConfirmationImages(
  pool: Pool,
  idiw37: number,
): Promise<ConfirmationImageItem[]> {
  const r = await pool.query<{
    idcimg: string | number
    idiw37: string | number
    cfilename: string
    original: string | null
    mime: string | null
    bytes: string | number | null
    wkctr: string | null
    created_at: Date
  }>(
    `SELECT idcimg, idiw37, cfilename, original, mime, bytes, wkctr, created_at
     FROM app.tbconfirmimg
     WHERE idiw37 = $1
     ORDER BY created_at DESC, idcimg DESC
     LIMIT 200`,
    [idiw37],
  )
  return r.rows.map((row) => ({
    idcimg: Number(row.idcimg),
    idiw37: Number(row.idiw37),
    fileName: row.cfilename ?? '',
    originalName: row.original ?? '',
    mime: row.mime ?? 'image/jpeg',
    bytes: row.bytes != null && row.bytes !== '' ? Number(row.bytes) || 0 : 0,
    wkctr: row.wkctr ?? '',
    createdAt: row.created_at.toISOString(),
  }))
}

export async function createConfirmationImageRecord(
  pool: Pool,
  opts: {
    idiw37: number
    fileName: string
    originalName: string
    mime: string
    bytes: number
    wkctr: string
  },
): Promise<ConfirmationImageItem> {
  const r = await pool.query<{
    idcimg: number
    idiw37: number
    cfilename: string
    original: string | null
    mime: string | null
    bytes: number | null
    wkctr: string | null
    created_at: Date
  }>(
    `INSERT INTO app.tbconfirmimg (idiw37, cfilename, original, mime, bytes, wkctr)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING idcimg, idiw37, cfilename, original, mime, bytes, wkctr, created_at`,
    [opts.idiw37, opts.fileName, opts.originalName, opts.mime, opts.bytes, opts.wkctr],
  )
  const row = r.rows[0]
  return {
    idcimg: row.idcimg,
    idiw37: row.idiw37,
    fileName: row.cfilename,
    originalName: row.original ?? '',
    mime: row.mime ?? 'image/jpeg',
    bytes: row.bytes ?? 0,
    wkctr: row.wkctr ?? '',
    createdAt: row.created_at.toISOString(),
  }
}

export async function deleteConfirmationImageRecord(
  pool: Pool,
  idcimg: number,
): Promise<{ ok: boolean; fileName: string | null }> {
  const r = await pool.query<{ cfilename: string }>(
    `DELETE FROM app.tbconfirmimg
     WHERE idcimg = $1
     RETURNING cfilename`,
    [idcimg],
  )
  return { ok: (r.rowCount ?? 0) > 0, fileName: r.rows[0]?.cfilename ?? null }
}

export async function getConfirmationImageMeta(
  pool: Pool,
  idcimg: number,
): Promise<{ idcimg: number; idiw37: number; fileName: string; mime: string } | null> {
  const r = await pool.query<{
    idcimg: number
    idiw37: number
    cfilename: string
    mime: string | null
  }>(
    `SELECT idcimg, idiw37, cfilename, mime
     FROM app.tbconfirmimg
     WHERE idcimg = $1
     LIMIT 1`,
    [idcimg],
  )
  const row = r.rows[0]
  if (!row) return null
  return {
    idcimg: row.idcimg,
    idiw37: row.idiw37,
    fileName: row.cfilename,
    mime: row.mime ?? 'image/jpeg',
  }
}
