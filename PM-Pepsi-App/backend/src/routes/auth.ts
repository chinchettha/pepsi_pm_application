import type { Express, Response } from 'express'

import type { Pool } from 'pg'

import { clearCookieHeader, serializeCookie } from '../lib/cookies.js'

import { getClientIp, getServerHostname } from '../lib/request-ip.js'

import { SESSION_COOKIE_NAME, signSessionToken, verifySessionToken } from '../lib/session-token.js'

import { createRequireApiAuth, getTokenFromRequest } from '../middleware/require-api-auth.js'

import { validateBody } from '../middleware/validate-body.js'

import {

  authSessionResponseSchema,

  loginRequestSchema,

  loginResponseSchema,

  logoutRequestSchema,

  logoutResponseSchema,

  type AuthUser,

} from '../schemas/auth.js'

import {

  findMemberByCredentials,

  findWorkcenterByCredentials,

  insertUserLog,

} from '../services/auth.js'



const SESSION_MAX_AGE_SEC = 8 * 60 * 60



function setSessionCookie(res: Response, token: string) {

  res.setHeader(

    'Set-Cookie',

    serializeCookie(SESSION_COOKIE_NAME, token, {

      httpOnly: true,

      sameSite: 'Lax',

      maxAgeSec: SESSION_MAX_AGE_SEC,

      path: '/',

    }),

  )

}



function clearSessionCookie(res: Response) {

  res.setHeader('Set-Cookie', clearCookieHeader(SESSION_COOKIE_NAME))

}



function accountTypeOf(user: AuthUser): 'workcenter' | 'member' {

  return user.accountType === 'member' ? 'member' : 'workcenter'

}



export function registerAuthRoutes(app: Express, pool: Pool, sessionSecret: string) {
  const requireAuth = createRequireApiAuth(sessionSecret)

  app.get('/api/v1/auth/me', (req, res: Response) => {

    const token = getTokenFromRequest(req)

    if (!token) {

      res.status(401).json({ error: 'UNAUTHORIZED', message: 'ต้องเข้าสู่ระบบ' })

      return

    }

    const user = verifySessionToken(token, sessionSecret)

    if (!user) {

      res.status(401).json({ error: 'UNAUTHORIZED', message: 'เซสชันหมดอายุหรือไม่ถูกต้อง' })

      return

    }

    res.json(authSessionResponseSchema.parse({ user }))

  })



  app.post(

    '/api/v1/auth/login',

    validateBody(loginRequestSchema),

    async (req, res: Response) => {

      const { username, password, mode } = req.body as {

        username: string

        password: string

        mode: 'workcenter' | 'member'

      }



      const user =

        mode === 'member'

          ? await findMemberByCredentials(pool, username, password)

          : await findWorkcenterByCredentials(pool, username, password)



      if (!user) {

        res.status(401).json({

          error: 'INVALID_CREDENTIALS',

          message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง',

        })

        return

      }



      const acct = accountTypeOf(user)

      await insertUserLog(pool, {

        userId: user.memId ?? user.idwkctr,

        username: user.username,

        userIp: getClientIp(req),

        myIp: getServerHostname(),

        action: 'in',

        accountType: acct,

      })



      const token = signSessionToken(user, sessionSecret)

      setSessionCookie(res, token)



      const payload = loginResponseSchema.parse({ token, user })

      res.json(payload)

    },

  )



  app.post(

    '/api/v1/auth/logout',

    validateBody(logoutRequestSchema),

    async (req, res: Response) => {

      const body = req.body as { userId: string; username: string; accountType?: string }

      const token = getTokenFromRequest(req)

      const fromToken = token ? verifySessionToken(token, sessionSecret) : null

      const accountType =

        body.accountType === 'member' || fromToken?.accountType === 'member'

          ? 'member'

          : 'workcenter'



      await insertUserLog(pool, {

        userId: body.userId,

        username: body.username,

        userIp: getClientIp(req),

        myIp: getServerHostname(),

        action: 'out',

        accountType,

      })



      clearSessionCookie(res)

      res.json(logoutResponseSchema.parse({ ok: true }))

    },

  )



  /** เทียบ `?module=logout` — ใช้ cookie + redirect จาก frontend `/logout` */

  app.get('/api/v1/auth/logout', requireAuth, async (req, res: Response) => {

    const user = req.authUser!

    const acct = accountTypeOf(user)

    await insertUserLog(pool, {

      userId: user.memId ?? user.idwkctr,

      username: user.username,

      userIp: getClientIp(req),

      myIp: getServerHostname(),

      action: 'out',

      accountType: acct,

    })

    clearSessionCookie(res)

    res.json(logoutResponseSchema.parse({ ok: true }))

  })

}


