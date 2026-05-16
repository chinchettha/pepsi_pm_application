import cors from 'cors'
import express, { type Express } from 'express'
import helmet from 'helmet'
import type { Pool } from 'pg'
import { registerAuthRoutes } from './routes/auth.js'
import { registerNavRoutes } from './routes/nav.js'
import { registerProfileRoutes } from './routes/profile.js'
import { registerDashboardRoutes } from './routes/dashboard.js'
import { registerPlanningRoutes } from './routes/planning.js'
import { registerHealthRoutes } from './routes/health.js'
import { registerBacklogRoutes } from './routes/backlog.js'
import { registerCalendarRoutes } from './routes/calendar.js'
import { registerIw37nRoutes } from './routes/iw37n.js'
import { registerLineCalendarRoutes } from './routes/line-calendar.js'
import { registerMasterDataRoutes } from './routes/master-data.js'
import { registerSchedulingRoutes } from './routes/scheduling.js'
import { registerWorkOrderRoutes } from './routes/work-orders.js'
import { registerManhoursRoutes } from './routes/manhours.js'

export function createApp(opts: { pool: Pool; corsOrigin?: string; sessionSecret: string }): Express {
  const app = express()

  app.set('trust proxy', 1)
  app.use(helmet())
  app.use(express.json({ limit: '1mb' }))

  if (opts.corsOrigin) {
    app.use(
      cors({
        origin: opts.corsOrigin,
        credentials: true,
      }),
    )
  }

  registerHealthRoutes(app, opts.pool)
  registerAuthRoutes(app, opts.pool, opts.sessionSecret)
  registerNavRoutes(app, opts.pool, opts.sessionSecret)
  registerProfileRoutes(app, opts.pool, opts.sessionSecret)
  registerMasterDataRoutes(app, opts.pool, opts.sessionSecret)
  registerWorkOrderRoutes(app, opts.pool, opts.sessionSecret)
  registerSchedulingRoutes(app, opts.pool, opts.sessionSecret)
  registerDashboardRoutes(app, opts.pool, opts.sessionSecret)
  registerPlanningRoutes(app, opts.pool, opts.sessionSecret)
  registerCalendarRoutes(app, opts.pool, opts.sessionSecret)
  registerBacklogRoutes(app, opts.pool, opts.sessionSecret)
  registerIw37nRoutes(app, opts.pool, opts.sessionSecret)
  registerLineCalendarRoutes(app, opts.pool, opts.sessionSecret)
  registerManhoursRoutes(app, opts.pool, opts.sessionSecret)

  return app
}
