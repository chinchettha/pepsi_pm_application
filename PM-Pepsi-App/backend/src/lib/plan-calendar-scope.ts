import { userstToUserrole } from './primary-roles.js'
import type { PlanCalendarScope } from '../services/plan-calendar.js'

export type PlanCalendarScopeInput = {
  userst?: string | null
  /** tbworkcenter.userrole — ใช้เมื่อ userst ไม่ตรง (legacy data) */
  userrole?: string | null
}

/** ช่าง (W / userrole technician) เห็นเฉพาะงานที่จ่ายให้ตัวเอง · Planner/Admin เห็นทั้งโรงงานในเดือน */
export function resolvePlanCalendarScope(
  input: PlanCalendarScopeInput | string | null | undefined,
): PlanCalendarScope {
  const normalized =
    typeof input === 'string' || input == null
      ? { userst: input, userrole: null }
      : input

  const role = (normalized.userrole ?? '').trim().toLowerCase()
  if (role === 'technician') return 'assignee'
  if (role === 'planner') return 'planner'

  return userstToUserrole(normalized.userst) === 'technician' ? 'assignee' : 'planner'
}
