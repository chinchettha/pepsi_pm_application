import type { Pool } from 'pg'
import { FACTORY_CODE, sqlFactoryScope } from '../services/scheduling-shared.js'

export type FunctionalFilterOption = { code: string; label: string }

/** Short codes from Master Data (e.g. 7151-PL01) vs SAP IW37N (PI-TH-7151-…). */
export function isMasterStyleFunctionalCode(code: string): boolean {
  const c = code.trim()
  if (!c) return false
  if (c.startsWith('PI-TH-')) return false
  return /^7151-/i.test(c)
}

/**
 * Functional Location filter options — union of IW37N (authoritative for WO rows) + Master Data.
 * Previously only tbfunctional was shown when any master row existed (often 5 demo rows),
 * hiding ~46 distinct codes from SAP import.
 */
export async function listFunctionalFilterOptions(pool: Pool): Promise<FunctionalFilterOption[]> {
  const factory = `%${FACTORY_CODE}%`

  const [fromIw37n, fromMaster] = await Promise.all([
    pool.query<{ functionalloc: string; funcdescrip: string | null }>(
      `SELECT DISTINCT TRIM(functionalloc) AS functionalloc, TRIM(funcdescrip) AS funcdescrip
       FROM app.tbiw37n
       WHERE functionalloc IS NOT NULL AND TRIM(functionalloc) <> ''
         AND ${sqlFactoryScope('', '$1')}
       ORDER BY functionalloc`,
      [factory],
    ),
    pool.query<{ functionalloc: string; funldescrip: string | null }>(
      `SELECT TRIM(functionalloc) AS functionalloc, TRIM(funldescrip) AS funldescrip
       FROM app.tbfunctional
       WHERE TRIM(functionalloc) <> ''
       ORDER BY functionalloc`,
    ),
  ])

  const byCode = new Map<string, string>()

  for (const row of fromIw37n.rows) {
    const code = row.functionalloc.trim()
    if (!code) continue
    const desc = row.funcdescrip?.trim()
    byCode.set(code, desc ? `${code} = ${desc}` : code)
  }

  for (const row of fromMaster.rows) {
    const code = row.functionalloc.trim()
    if (!code || byCode.has(code)) continue
    const desc = row.funldescrip?.trim()
    byCode.set(code, desc ? `${code} = ${desc}` : code)
  }

  return [...byCode.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, label]) => ({ code, label }))
}

/**
 * Filter WO by functional location.
 * - SAP codes (PI-TH-7151-…): exact match on functionalloc
 * - Master short codes (7151-PL01): also search functionalloc + ostdescription (legacy in OST text)
 */
export function appendFunctionalLocFilter(
  values: string[] | undefined,
  orderAlias: string,
  ostdescriptionAlias: string | undefined,
  params: unknown[],
): string {
  const codes = (values ?? []).map((v) => v.trim()).filter(Boolean)
  if (codes.length === 0) return ''

  const flCol = `${orderAlias}.functionalloc`
  const ostCol = ostdescriptionAlias ? `${ostdescriptionAlias}.ostdescription` : null
  const parts: string[] = []

  for (const code of codes) {
    if (isMasterStyleFunctionalCode(code)) {
      params.push(code)
      const exact = params.length
      params.push(`%${code}%`)
      const like = params.length
      if (ostCol) {
        parts.push(
          `(TRIM(${flCol}) = $${exact} OR TRIM(${flCol}) ILIKE $${like} OR TRIM(COALESCE(${ostCol}, '')) ILIKE $${like})`,
        )
      } else {
        parts.push(`(TRIM(${flCol}) = $${exact} OR TRIM(${flCol}) ILIKE $${like})`)
      }
    } else {
      params.push(code)
      parts.push(`TRIM(${flCol}) = $${params.length}`)
    }
  }

  return ` AND (${parts.join(' OR ')})`
}
