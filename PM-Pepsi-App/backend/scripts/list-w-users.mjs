import 'dotenv/config'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const { rows } = await pool.query(
  `SELECT idwkctr, wkctr, userst FROM app.tbworkcenter WHERE userst = 'W' ORDER BY wkctr LIMIT 15`,
)
console.log(rows)
await pool.end()
