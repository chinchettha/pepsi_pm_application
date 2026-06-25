import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { createPool } from '../src/db/pool.js'

const pool = createPool(process.env.DATABASE_URL!)
const sql = readFileSync(new URL('../../../database/migrations/115_iw37n_search_indexes.sql', import.meta.url), 'utf8')
await pool.query(sql)
console.log('115_iw37n_search_indexes applied')
await pool.end()
