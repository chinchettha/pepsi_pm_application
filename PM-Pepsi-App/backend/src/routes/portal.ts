import type { Express, Request, Response } from 'express'
import type { Pool } from 'pg'
import { createRequireApiAuth } from '../middleware/require-api-auth.js'
import { portalModulesResponseSchema } from '../schemas/portal.js'
import { listPortalModulesForUser } from '../services/portal-modules.js'

export function registerPortalRoutes(app: Express, pool: Pool, sessionSecret: string) {
  const requireAuth = createRequireApiAuth(sessionSecret)

  app.get('/api/v1/portal/modules', requireAuth, async (req: Request, res: Response) => {
    const user = req.authUser
    if (!user) {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'ต้องเข้าสู่ระบบ' })
      return
    }
    const payload = await listPortalModulesForUser(pool, user)
    res.json(portalModulesResponseSchema.parse(payload))
  })
}
