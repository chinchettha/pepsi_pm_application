import type { Pool } from 'pg'
import type { AuthUser } from '../schemas/auth.js'
import type { z } from 'zod'
import type { userProfileSchema } from '../schemas/profile.js'
import { timespanThai } from '../lib/timespan.js'
import { getWorktimeTotal } from './manhours.js'

type Profile = z.infer<typeof userProfileSchema>

export async function getProfileForUser(pool: Pool, user: AuthUser): Promise<Profile> {
  if (user.accountType === 'member' && user.memId) {
    const r = await pool.query<{
      id: number
      username: string
      fullname: string | null
      idcard: string | null
      bank: string | null
      bank_no: string | null
      branch: string | null
      last_login: Date | null
    }>(
      `SELECT id, username, fullname, idcard, bank, bank_no, branch, last_login
       FROM app.tbl_member WHERE id = $1`,
      [Number(user.memId)],
    )
    const row = r.rows[0]
    const displayName = row?.fullname?.trim() || user.username
    return {
      accountType: 'member',
      userId: user.memId,
      username: user.username,
      displayName,
      sysstatus: user.sysstatus,
      userst: user.userst,
      fullnameTh: displayName,
      idcard: row?.idcard ?? undefined,
      bank: row?.bank ?? undefined,
      bankNo: row?.bank_no ?? undefined,
      branch: row?.branch ?? undefined,
      lastLogin: row?.last_login?.toISOString() ?? null,
    }
  }

  const r = await pool.query<{
    idwkctr: string
    wkctr: string
    plnt: string | null
    wkctrdate: string | null
    startwork: string | null
    titlewkctr: string | null
    namewkctr: string | null
    surnamewkctr: string | null
    titlewkctreng: string | null
    namewkctreng: string | null
    surnamewkctreng: string | null
    userst: string
    imgmember: string | null
    last_login: Date | null
  }>(
    `SELECT idwkctr, wkctr, plnt, wkctrdate, startwork,
            titlewkctr, namewkctr, surnamewkctr,
            titlewkctreng, namewkctreng, surnamewkctreng,
            userst, imgmember, last_login
     FROM app.tbworkcenter WHERE idwkctr = $1`,
    [user.idwkctr],
  )
  const row = r.rows[0]
  const titleTh = row?.titlewkctr ?? ''
  const nameTh = row?.namewkctr ?? ''
  const surnameTh = row?.surnamewkctr ?? ''
  const titleEng = row?.titlewkctreng ?? ''
  const nameEng = row?.namewkctreng ?? ''
  const surnameEng = row?.surnamewkctreng ?? ''
  const bday = row?.wkctrdate != null ? Number(row.wkctrdate) : 0
  const start = row?.startwork != null ? Number(row.startwork) : 0

  let worktimeBreakdown: Awaited<ReturnType<typeof getWorktimeTotal>> = null
  try {
    worktimeBreakdown = await getWorktimeTotal(pool, user.idwkctr)
  } catch {
    /* tbmanhours ยังไม่ migrate */
  }

  return {
    accountType: 'workcenter',
    userId: user.idwkctr,
    username: user.username,
    wkctr: row?.wkctr ?? user.wkctr,
    displayName: user.fullnameTh?.trim() || `${titleTh}${nameTh} ${surnameTh}`.trim(),
    sysstatus: user.sysstatus,
    userst: row?.userst ?? user.userst,
    plnt: row?.plnt,
    fullnameTh: user.fullnameTh,
    fullnameEng: user.fullnameEng,
    imgMember: row?.imgmember,
    birthdayLabel: bday > 0 ? timespanThai(bday) : undefined,
    workAgeLabel: start > 0 ? timespanThai(start) : undefined,
    worktimeTotalHours: worktimeBreakdown?.total,
    worktimeBreakdown: worktimeBreakdown ?? undefined,
    lastLogin: row?.last_login?.toISOString() ?? null,
  }
}
