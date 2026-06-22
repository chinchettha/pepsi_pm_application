import type { Pool } from 'pg'

export type PersonnelLookupKind = 'department' | 'worktype' | 'position' | 'group' | 'level'

export class LookupInUseError extends Error {
  readonly usageCount: number

  constructor(usageCount: number) {
    super(`LOOKUP_IN_USE:${usageCount}`)
    this.name = 'LookupInUseError'
    this.usageCount = usageCount
  }
}

async function countWorkcenterColumn(
  pool: Pool,
  column: 'iddepartment' | 'idposition' | 'idwkctrtype' | 'idwklevel',
  value: string,
): Promise<number> {
  const trimmed = value.trim()
  if (!trimmed) return 0
  const r = await pool.query<{ n: string }>(
    `SELECT COUNT(*)::text AS n
     FROM app.tbworkcenter
     WHERE TRIM(COALESCE(${column}, '')) = $1`,
    [trimmed],
  )
  return Number.parseInt(r.rows[0]?.n ?? '0', 10)
}

export async function countLookupUsage(
  pool: Pool,
  kind: PersonnelLookupKind,
  key: string | number,
): Promise<number> {
  switch (kind) {
    case 'department':
      return countWorkcenterColumn(pool, 'iddepartment', String(key))
    case 'worktype':
      return countWorkcenterColumn(pool, 'idwkctrtype', String(key))
    case 'position':
      return countWorkcenterColumn(pool, 'idposition', String(key))
    case 'level':
      return countWorkcenterColumn(pool, 'idwklevel', String(key))
    case 'group': {
      const id = Number(key)
      if (!Number.isFinite(id)) return 0
      const r = await pool.query<{ n: string }>(
        `SELECT COUNT(*)::text AS n
         FROM app.tbworkcenter wc
         WHERE wc.idwkctrgroup::text = $1
            OR EXISTS (
              SELECT 1
              FROM app.tbwkctrgroup g
              WHERE g.idwkctrgroup = $1::int
                AND (
                  wc.idwkctrgroup::text = g.idwkctrgroup::text
                  OR TRIM(COALESCE(wc.idwkctrgroup, '')) = TRIM(g.wkctrgroup)
                )
            )`,
        [String(id)],
      )
      return Number.parseInt(r.rows[0]?.n ?? '0', 10)
    }
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}

export async function assertLookupNotInUse(
  pool: Pool,
  kind: PersonnelLookupKind,
  key: string | number,
): Promise<void> {
  const usageCount = await countLookupUsage(pool, kind, key)
  if (usageCount > 0) throw new LookupInUseError(usageCount)
}
