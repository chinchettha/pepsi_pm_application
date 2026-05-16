import type { Pool } from 'pg'
import type { z } from 'zod'
import type { dashboardSummarySchema } from '../schemas/dashboard.js'

type Summary = z.infer<typeof dashboardSummarySchema>

export async function getDashboardSummary(pool: Pool): Promise<Summary> {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const startSec = Math.floor(monthStart.getTime() / 1000)
  const endSec = Math.floor(monthEnd.getTime() / 1000)

  const [openR, closedR, pendingR, importR] = await Promise.all([
    pool.query<{ n: string }>(
      `SELECT COUNT(*)::text AS n FROM app.tbiw37n WHERE syst IN ('CRTD', 'REL')`,
    ),
    pool.query<{ n: string }>(
      `SELECT COUNT(*)::text AS n FROM app.tbiw37n
       WHERE actfinish IS NOT NULL AND actfinish >= $1 AND actfinish < $2`,
      [startSec, endSec],
    ),
    pool.query<{ n: string }>(
      `SELECT COUNT(*)::text AS n
       FROM app.tbiw37n i
       WHERE i.syst IN ('CRTD', 'REL')
         AND NOT EXISTS (SELECT 1 FROM app.tbplangingwork p WHERE p.idiw37 = i.idiw37)`,
    ),
    pool.query<{ t: Date | null }>(
      `SELECT MAX(imported_at) AS t FROM app.tbiw37n_import_batch`,
    ),
  ])

  const last = importR.rows[0]?.t

  return {
    openOrders: Number(openR.rows[0]?.n ?? 0),
    closedThisMonth: Number(closedR.rows[0]?.n ?? 0),
    pendingPersonnel: Number(pendingR.rows[0]?.n ?? 0),
    iw37nLastImport: last ? last.toISOString() : null,
  }
}
