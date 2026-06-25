import 'dotenv/config'
import { createPool } from '../src/db/pool.js'

const pool = createPool(process.env.DATABASE_URL!)

const stats = await pool.query(`
  SELECT
    COUNT(*)::int AS total,
    COUNT(CASE WHEN mp.tasklist IS NOT NULL AND mp.tasklist <> '' THEN 1 END)::int AS tasklist_matched,
    COUNT(CASE WHEN mp.pmlist IS NOT NULL AND mp.pmlist <> '' THEN 1 END)::int AS pmlist_matched
  FROM app.tbiw37n i
  LEFT JOIN LATERAL (
    SELECT tl.tasklist, tl.pmlist, tl.legacy, tl.idzone, tl.machine, tl.pmday
    FROM app.tbtasklist tl
    WHERE TRIM(tl.mntplan) = TRIM(i.mntplan)
      AND NULLIF(TRIM(i.mntplan), '') IS NOT NULL
    ORDER BY tl.tasklist ASC, tl.machine ASC, tl.pmlist ASC
    LIMIT 1
  ) mp ON true
`)
console.log('current join stats', stats.rows[0])

const sample = await pool.query(`
  SELECT i.mntplan, i.wkorder, i.ostdescription, mp.tasklist, mp.legacy, mp.idzone, mp.pmday
  FROM app.tbiw37n i
  LEFT JOIN LATERAL (
    SELECT tl.tasklist, tl.legacy, tl.idzone, tl.pmday
    FROM app.tbtasklist tl
    WHERE TRIM(tl.mntplan) = TRIM(i.mntplan)
    LIMIT 1
  ) mp ON true
  WHERE i.mntplan LIKE '61000000%'
  LIMIT 5
`)
console.log('long mnt samples', sample.rows)

const unmatched = await pool.query(`
  SELECT i.mntplan, i.wkorder, i.ostdescription, i.operationshorttext
  FROM app.tbiw37n i
  LEFT JOIN LATERAL (
    SELECT 1 FROM app.tbtasklist tl WHERE TRIM(tl.mntplan) = TRIM(i.mntplan) LIMIT 1
  ) mp ON true
  WHERE mp IS NULL AND NULLIF(TRIM(i.mntplan), '') IS NOT NULL
  LIMIT 10
`)
console.log('unmatched sample', unmatched.rows)

const multi = await pool.query(
  `SELECT mntplan, COUNT(*)::int AS n FROM app.tbtasklist GROUP BY mntplan HAVING COUNT(*) > 1 ORDER BY n DESC LIMIT 5`,
)
console.log('multi mntplan', multi.rows)

const rows496 = await pool.query(
  `SELECT machine, LEFT(pmlist, 60) AS pmlist, tasklist, legacy FROM app.tbtasklist WHERE mntplan = $1`,
  ['610000004496'],
)
console.log('496 count', rows496.rows.length, rows496.rows.slice(0, 3))

await pool.end()
