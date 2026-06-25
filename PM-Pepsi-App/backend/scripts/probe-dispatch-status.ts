import 'dotenv/config'
import { createPool } from '../src/db/pool.js'

const pool = createPool(process.env.DATABASE_URL!)
const wkorders = process.argv.slice(2).length > 0 ? process.argv.slice(2) : ['4001568407', '4001535376']

try {
  for (const wk of wkorders) {
    const r = await pool.query(
      `SELECT i.idiw37, i.wkorder, i.syst,
              p.idplanw, p.wkctr, p.wkctrpw, p.pwteam, p.ack_status
       FROM app.tbiw37n i
       LEFT JOIN app.tbplangingwork p ON p.idiw37 = i.idiw37
       WHERE i.wkorder = $1
       ORDER BY p.idplanw`,
      [wk],
    )
    console.log('\n=== WO', wk, '===')
    console.log(JSON.stringify(r.rows, null, 2))
  }

  const sample = await pool.query<{ pwteam: string | null; n: number }>(
    `SELECT pwteam, COUNT(*)::int AS n
     FROM app.tbplangingwork
     GROUP BY pwteam
     ORDER BY n DESC`,
  )
  console.log('\npwteam distribution:', sample.rows)

  const jun2 = await pool.query(
    `SELECT o.wkorder,
            COUNT(p.*) FILTER (WHERE COALESCE(TRIM(p.pwteam), '') IN ('P','G')) AS pg_count,
            COUNT(p.*) AS all_count
     FROM app.view_order o
     LEFT JOIN app.tbplangingwork p ON p.idiw37 = o.idiw37
     WHERE o.bscstart = EXTRACT(EPOCH FROM DATE '2026-06-02')::bigint
     GROUP BY o.wkorder
     HAVING COUNT(p.*) > 0
     LIMIT 5`,
  )
  console.log('\nJun 2 sample with planning rows:', jun2.rows)

  const { getBacklogManhourSummary } = await import('../src/services/backlog.js')
  const summary = await getBacklogManhourSummary(pool, {
    fromDate: '2026-06-02',
    toDate: '2026-06-02',
  })
  console.log('\nManhour summary total:', summary.totalOrders)
  const samples = summary.rows.filter((r) =>
    ['4001568407', '4001535376'].includes(r.wkorder),
  )
  console.log('Manhour rows for sample WOs:', samples)
  const assigned = summary.rows.filter((r) => r.dispatchStatus === 'assigned')
  console.log('Assigned count:', assigned.length, 'Unassigned:', summary.rows.length - assigned.length)
} finally {
  await pool.end().catch(() => {})
}
