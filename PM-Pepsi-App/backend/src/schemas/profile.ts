import { z } from 'zod'
import { worktimeBreakdownSchema } from './manhours.js'

export const userProfileSchema = z.object({
  accountType: z.enum(['workcenter', 'member']),
  userId: z.string(),
  username: z.string(),
  displayName: z.string(),
  sysstatus: z.string(),
  userst: z.string().optional(),
  plnt: z.string().nullable().optional(),
  wkctr: z.string().optional(),
  fullnameTh: z.string().optional(),
  fullnameEng: z.string().optional(),
  imgMember: z.string().nullable().optional(),
  birthdayLabel: z.string().optional(),
  workAgeLabel: z.string().optional(),
  /** รวมชั่วโมงทั้งหมด — เทียบ worktime_count.php */
  worktimeTotalHours: z.number().optional(),
  worktimeBreakdown: worktimeBreakdownSchema.optional(),
  idcard: z.string().optional(),
  bank: z.string().optional(),
  bankNo: z.string().optional(),
  branch: z.string().optional(),
  lastLogin: z.string().nullable().optional(),
})
