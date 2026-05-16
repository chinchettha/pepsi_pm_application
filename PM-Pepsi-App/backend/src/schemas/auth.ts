/**
 * สอดคล้อง frontend/src/api/schemas.ts — แก้ทั้งสองที่เมื่อเปลี่ยนสัญญา
 */
import { z } from 'zod'

export const loginModeSchema = z.enum(['workcenter', 'member'])

export const loginRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  /** workcenter = login.php (tbworkcenter); member = login-bk.php (tbl_member) */
  mode: loginModeSchema.optional().default('workcenter'),
})

export const logoutRequestSchema = z.object({
  userId: z.string().min(1),
  username: z.string().min(1),
})

export const authUserSchema = z.object({
  idwkctr: z.string(),
  username: z.string(),
  wkctr: z.string(),
  plnt: z.string().nullable().optional(),
  userst: z.string(),
  sysstatus: z.string(),
  userLevel: z.number().optional(),
  fullnameTh: z.string().optional(),
  fullnameEng: z.string().optional(),
  titlewkctr: z.string().optional(),
  namewkctr: z.string().optional(),
  surnamewkctr: z.string().optional(),
  imgMember: z.string().nullable().optional(),
  accountType: z.enum(['workcenter', 'member']).default('workcenter'),
  memId: z.string().optional(),
})

export const loginResponseSchema = z.object({
  token: z.string(),
  user: authUserSchema,
})

export const authSessionResponseSchema = z.object({
  user: authUserSchema,
})

export const logoutResponseSchema = z.object({
  ok: z.literal(true),
})

export type LoginRequest = z.infer<typeof loginRequestSchema>
export type LogoutRequest = z.infer<typeof logoutRequestSchema>
export type AuthUser = z.infer<typeof authUserSchema>
