import type { Express, Response } from 'express'
import type { Pool } from 'pg'
import { createRequireApiAuth } from '../middleware/require-api-auth.js'
import { userProfileSchema } from '../schemas/profile.js'
import { getProfileForUser } from '../services/profile.js'

export function registerProfileRoutes(app: Express, pool: Pool, sessionSecret: string) {
  const requireAuth = createRequireApiAuth(sessionSecret)

  app.get('/api/v1/auth/profile', requireAuth, async (req, res: Response) => {
    const profile = await getProfileForUser(pool, req.authUser!)
    res.json(userProfileSchema.parse(profile))
  })
}
