import 'dotenv/config'
import { createServer } from 'node:http'
import { loadEnv } from './config/env.js'
import { createApp } from './app.js'
import { createPool } from './db/pool.js'

const env = loadEnv()
const pool = createPool(env.DATABASE_URL)
const app = createApp({
  pool,
  corsOrigin: env.CORS_ORIGIN,
  sessionSecret: env.SESSION_SECRET,
})

const server = createServer(app)

server.listen(env.PORT, () => {
  console.log(`pm-api listening on http://127.0.0.1:${env.PORT}`)
  console.log(`  GET http://127.0.0.1:${env.PORT}/api/v1/health`)
})

async function shutdown(signal: string) {
  console.log(`\n${signal} received, closing…`)
  await pool.end().catch(() => {})
  server.close(() => process.exit(0))
}

process.on('SIGINT', () => void shutdown('SIGINT'))
process.on('SIGTERM', () => void shutdown('SIGTERM'))
