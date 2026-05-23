/** ดึงฟิลด์ Line / WO จาก audit JSON — ใช้กับ activity log รายงาน */
const LINE_KEYS = ['productline', 'productLine', 'line', 'product_line', 'lineday'] as const
const WO_KEYS = ['wkorder', 'workOrder', 'order'] as const

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function pickString(obj: Record<string, unknown>, keys: readonly string[]): string | null {
  for (const key of keys) {
    const v = obj[key]
    if (typeof v === 'string' && v.trim()) return v.trim()
    if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  }
  return null
}

export function extractLineFromPayload(before: unknown, after: unknown): string | null {
  for (const raw of [after, before]) {
    const obj = asRecord(raw)
    if (!obj) continue
    const line = pickString(obj, LINE_KEYS)
    if (line) return line
  }
  return null
}

export function extractWorkOrderFromPayload(before: unknown, after: unknown): string | null {
  for (const raw of [after, before]) {
    const obj = asRecord(raw)
    if (!obj) continue
    const wo = pickString(obj, WO_KEYS)
    if (wo) return wo
  }
  return null
}

/** ป้าย action สั้นภาษาไทยสำหรับตาราง activity */
export function activityActionLabel(action: string): string {
  const map: Record<string, string> = {
    'auth.login': 'เข้าสู่ระบบ',
    'auth.logout': 'ออกจากระบบ',
    'iw37n.import': 'นำเข้า IW37N',
    'confirmation.import': 'นำเข้า Confirm',
    'confirmation.close': 'ปิดงาน Confirm',
    'confirmation.mass_close': 'ปิดงานหลายใบ',
    'work-orders.team.batch': 'ตั้งทีมหลาย WO',
    'planning.assign': 'จ่ายงานช่าง',
    'integration.iw37n.in': 'Integration IW37N',
    'integration.confirm.in': 'Integration Confirm IN',
  }
  if (map[action]) return map[action]
  if (action.startsWith('confirmation.qc')) return 'QC รับรองงาน'
  if (action.startsWith('planning.')) return 'แผนงาน'
  if (action.startsWith('work-orders.')) return 'ใบงาน'
  return action
}
