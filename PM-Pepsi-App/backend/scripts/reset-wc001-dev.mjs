import 'dotenv/config'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
await pool.query(
  `UPDATE app.tbworkcenter SET pass = 'wc001', userst = 'W' WHERE idwkctr = 'WC001'`,
)
console.log('WC001 password reset to wc001')
await pool.end()
