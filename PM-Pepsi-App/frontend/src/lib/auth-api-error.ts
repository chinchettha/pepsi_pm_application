import { isMaintenanceModeError } from '@/lib/maintenance-error'

export type AuthFeedbackKind =
  | 'success'
  | 'invalid'
  | 'lockout'
  | 'blocked'
  | 'maintenance'
  | 'rate_limit'
  | 'generic'

export type AuthFeedbackState = {
  kind: AuthFeedbackKind
  title: string
  message: string
}

/** Error จาก `fetchApi` พร้อมรหัส security ฝั่ง backend */
export class AuthApiError extends Error {
  readonly code?: string
  readonly httpStatus: number

  constructor(httpStatus: number, code?: string, message?: string) {
    super(message?.trim() || `HTTP ${httpStatus}`)
    this.name = 'AuthApiError'
    this.code = code
    this.httpStatus = httpStatus
  }
}

export function isAuthApiError(err: unknown): err is AuthApiError {
  return err instanceof AuthApiError
}

const TITLES: Record<string, { kind: AuthFeedbackKind; title: string }> = {
  INVALID_CREDENTIALS: { kind: 'invalid', title: 'เข้าสู่ระบบไม่สำเร็จ' },
  LOGIN_LOCKED: { kind: 'lockout', title: 'ถูกระงับชั่วคราว' },
  IP_BLOCKED: { kind: 'blocked', title: 'ไม่สามารถเข้าถึงได้' },
  MAINTENANCE: { kind: 'maintenance', title: 'ระบบปิดปรับปรุง' },
  RATE_LIMIT: { kind: 'rate_limit', title: 'คำขอมากเกินไป' },
}

/** แปลง error จาก login API → ข้อความ popup */
export function resolveAuthFeedback(err: unknown): AuthFeedbackState {
  if (isMaintenanceModeError(err)) {
    return {
      kind: 'maintenance',
      title: TITLES.MAINTENANCE.title,
      message: err.message,
    }
  }

  if (isAuthApiError(err)) {
    const mapped = err.code ? TITLES[err.code] : undefined
    return {
      kind: mapped?.kind ?? (err.httpStatus === 429 ? 'rate_limit' : 'generic'),
      title: mapped?.title ?? 'เกิดข้อผิดพลาด',
      message: err.message,
    }
  }

  if (err instanceof Error && err.message) {
    try {
      const parsed = JSON.parse(err.message) as { error?: string; message?: string }
      if (parsed.message || parsed.error) {
        return resolveAuthFeedback(
          new AuthApiError(0, parsed.error, parsed.message ?? parsed.error),
        )
      }
    } catch {
      /* plain text */
    }
    if (/network|failed to fetch|load failed/i.test(err.message)) {
      return {
        kind: 'generic',
        title: 'เชื่อมต่อไม่สำเร็จ',
        message: 'ตรวจสอบเครือข่ายหรือลองใหม่อีกครั้ง',
      }
    }
    return {
      kind: 'generic',
      title: 'เกิดข้อผิดพลาด',
      message: err.message,
    }
  }

  return {
    kind: 'generic',
    title: 'เกิดข้อผิดพลาด',
    message: 'ไม่สามารถเข้าสู่ระบบได้ — ลองใหม่อีกครั้ง',
  }
}

export function authFeedbackConfirmLabel(kind: AuthFeedbackKind): string {
  return kind === 'success' ? 'ดำเนินการต่อ' : 'ตกลง'
}
