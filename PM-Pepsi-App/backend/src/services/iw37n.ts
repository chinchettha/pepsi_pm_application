import { createHash } from 'node:crypto'
import type { Pool } from 'pg'
import type { z } from 'zod'
import type { iw37nBatchItemSchema } from '../schemas/iw37n.js'
import { parseIw37nFile, type Iw37nImportRow } from './iw37n-parser.js'

type BatchItem = z.infer<typeof iw37nBatchItemSchema>

type BatchRow = {
  id: string
  file_name: string
  imported_at: Date
  row_count: number
  sha256: string
  status: string
}

function mapBatch(row: BatchRow): BatchItem {
  return {
    id: String(row.id),
    fileName: row.file_name,
    importedAt: row.imported_at.toISOString(),
    rows: row.row_count,
    sha256: row.sha256,
    status: row.status as BatchItem['status'],
  }
}

export async function listIw37nBatches(pool: Pool, limit = 50): Promise<BatchItem[]> {
  const r = await pool.query<BatchRow>(
    `SELECT id::text, file_name, imported_at, row_count, sha256, status
     FROM app.tbiw37n_import_batch
     ORDER BY imported_at DESC
     LIMIT $1`,
    [limit],
  )
  return r.rows.map(mapBatch)
}

async function upsertIw37Row(pool: Pool, row: Iw37nImportRow): Promise<'inserted' | 'updated'> {
  const existing = await pool.query<{ idiw37: number }>(
    `SELECT idiw37 FROM app.tbiw37n WHERE wkorder = $1 AND opac = $2 LIMIT 1`,
    [row.wkorder, row.opac],
  )

  const params = [
    row.mntplan,
    row.wkorder,
    row.wktype,
    row.mat,
    row.bscstart,
    row.actfinish,
    row.systemstatus,
    row.syst,
    row.opac,
    row.operationshorttext,
    row.ostdescription,
    row.cknow,
    row.wkctr,
    row.work,
    row.actwork,
    row.untime,
    row.equipment,
    row.equdescrip,
    row.functionalloc,
    row.funcdescrip,
  ]

  if (existing.rows[0]) {
    await pool.query(
      `UPDATE app.tbiw37n SET
         mntplan = $1, wktype = $3, mat = $4, bscstart = $5, actfinish = $6,
         systemstatus = $7, syst = $8, operationshorttext = $10, ostdescription = $11,
         cknow = $12, wkctr = $13, work = $14, actwork = $15, untime = $16,
         equipment = $17, equdescrip = $18, functionalloc = $19, funcdescrip = $20
       WHERE wkorder = $2 AND opac = $9`,
      params,
    )
    return 'updated'
  }

  await pool.query(
    `INSERT INTO app.tbiw37n (
       mntplan, wkorder, wktype, mat, bscstart, actfinish, systemstatus, syst, opac,
       operationshorttext, ostdescription, cknow, wkctr, work, actwork, untime,
       equipment, equdescrip, functionalloc, funcdescrip
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20
     )`,
    params,
  )
  return 'inserted'
}

export async function importIw37nFile(
  pool: Pool,
  fileName: string,
  buffer: Buffer,
): Promise<BatchItem> {
  const sha256 = createHash('sha256').update(buffer).digest('hex')
  const rows = parseIw37nFile(buffer, fileName)

  let inserted = 0
  let updated = 0
  let skipped = 0

  for (const row of rows) {
    if (!row.bscstart) {
      skipped++
      continue
    }
    try {
      const kind = await upsertIw37Row(pool, row)
      if (kind === 'inserted') inserted++
      else updated++
    } catch {
      skipped++
    }
  }

  const processed = inserted + updated
  let status: BatchItem['status'] = 'OK'
  if (processed === 0) status = 'ERR'
  else if (skipped > 0) status = 'PARTIAL'

  const ins = await pool.query<BatchRow>(
    `INSERT INTO app.tbiw37n_import_batch (
       file_name, sha256, row_count, inserted_count, updated_count, skipped_count, status
     ) VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id::text, file_name, imported_at, row_count, sha256, status`,
    [fileName, sha256, rows.length, inserted, updated, skipped, status],
  )

  return mapBatch(ins.rows[0]!)
}
