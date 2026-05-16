import type { LucideIcon } from 'lucide-react'
import {
  AlertCircle,
  AlertTriangle,
  Ban,
  Clock,
  CloudOff,
  FileQuestion,
  FileWarning,
  FolderLock,
  Gauge,
  KeyRound,
  Link2Off,
  Lock,
  ServerCrash,
  ShieldAlert,
  ShieldOff,
  Unplug,
  WifiOff,
  Wrench,
} from 'lucide-react'

export type HttpErrorMeta = {
  code: number
  titleTh: string
  titleEn: string
  descriptionTh: string
  icon: LucideIcon
}

const genericClient: Omit<HttpErrorMeta, 'code'> = {
  titleTh: 'คำขอไม่ถูกต้อง',
  titleEn: 'Client error',
  descriptionTh: 'เซิร์ฟเวอร์ไม่สามารถประมวลผลคำขอนี้ได้ กรุณาตรวจสอบข้อมูลหรือลองอีกครั้ง',
  icon: AlertCircle,
}

const genericServer: Omit<HttpErrorMeta, 'code'> = {
  titleTh: 'เซิร์ฟเวอร์มีปัญหา',
  titleEn: 'Server error',
  descriptionTh: 'เกิดข้อผิดพลาดฝั่งเซิร์ฟเวอร์ กรุณาลองใหม่ภายหลังหรือแจ้งผู้ดูแลระบบ',
  icon: ServerCrash,
}

/** รหัสที่มีข้อความเฉพาะ (ครอบคลุมกรณี API / proxy / auth ทั่วไป) */
const catalog = {
  400: {
    titleTh: 'คำขอไม่สมบูรณ์',
    titleEn: 'Bad Request',
    descriptionTh: 'ข้อมูลที่ส่งไม่ถูกต้องหรือไม่ครบ กรุณาตรวจสอบฟอร์มแล้วลองอีกครั้ง',
    icon: AlertTriangle,
  },
  401: {
    titleTh: 'ยังไม่ได้เข้าสู่ระบบ',
    titleEn: 'Unauthorized',
    descriptionTh: 'เซสชันหมดอายุหรือยังไม่ยืนยันตัวตน กรุณาเข้าสู่ระบบใหม่',
    icon: KeyRound,
  },
  402: {
    titleTh: 'ต้องชำระเงินหรือสิทธิ์เพิ่มเติม',
    titleEn: 'Payment Required',
    descriptionTh: 'การเข้าถึงทรัพยากรนี้อาจต้องได้รับอนุมัติหรือสิทธิ์เพิ่มเติมจากผู้ดูแล',
    icon: Lock,
  },
  403: {
    titleTh: 'ไม่มีสิทธิ์เข้าถึง',
    titleEn: 'Forbidden',
    descriptionTh: 'บัญชีของคุณไม่มีสิทธิ์ดำเนินการนี้ หากต้องการสิทธิ์เพิ่ม กรุณาติดต่อผู้ดูแลระบบ',
    icon: ShieldOff,
  },
  404: {
    titleTh: 'ไม่พบหน้าที่ต้องการ',
    titleEn: 'Not Found',
    descriptionTh: 'ลิงก์อาจหมดอายุหรือที่อยู่ไม่ถูกต้อง กรุณาตรวจสอบ URL หรือกลับไปหน้าหลัก',
    icon: FileQuestion,
  },
  405: {
    titleTh: 'วิธีการไม่รองรับ',
    titleEn: 'Method Not Allowed',
    descriptionTh: 'การเรียก API หรือคำขอใช้วิธีที่เซิร์ฟเวอร์ไม่รองรับ',
    icon: Ban,
  },
  408: {
    titleTh: 'หมดเวลารอ',
    titleEn: 'Request Timeout',
    descriptionTh: 'เซิร์ฟเวอร์รอคำขอนานเกินไป กรุณาลองใหม่ หรือตรวจสอบการเชื่อมต่อเครือข่ายภายในโรงงาน',
    icon: Clock,
  },
  409: {
    titleTh: 'ข้อมูลขัดแย้ง',
    titleEn: 'Conflict',
    descriptionTh: 'สถานะข้อมูลไม่ตรงกับที่เซิร์ฟเวอร์คาดไว้ (เช่น มีการแก้ไขซ้ำ) กรุณารีเฟรชแล้วลองอีกครั้ง',
    icon: ShieldAlert,
  },
  410: {
    titleTh: 'ทรัพยากรถูกลบแล้ว',
    titleEn: 'Gone',
    descriptionTh: 'ข้อมูลหรือหน้านี้ไม่มีในระบบอีกต่อไป',
    icon: Link2Off,
  },
  413: {
    titleTh: 'ไฟล์ใหญ่เกินกำหนด',
    titleEn: 'Payload Too Large',
    descriptionTh: 'ขนาดไฟล์หรือข้อมูลที่อัปโหลดเกินขีดจำกัดของเซิร์ฟเวอร์ กรุณาย่อขนาดหรือแบ่งส่ง',
    icon: FileWarning,
  },
  414: {
    titleTh: 'URL ยาวเกินไป',
    titleEn: 'URI Too Long',
    descriptionTh: 'ที่อยู่คำขอยาวเกินที่ระบบรองรับ กรุณาลดพารามิเตอร์หรือใช้การค้นหาแทน',
    icon: Link2Off,
  },
  415: {
    titleTh: 'ชนิดไฟล์ไม่รองรับ',
    titleEn: 'Unsupported Media Type',
    descriptionTh: 'ชนิดเนื้อหาหรือนามสกุลไฟล์ไม่ตรงตามที่ API กำหนด',
    icon: FileWarning,
  },
  422: {
    titleTh: 'ข้อมูลไม่ผ่านการตรวจสอบ',
    titleEn: 'Unprocessable Entity',
    descriptionTh: 'รูปแบบข้อมูลถูกต้องแต่ไม่ผ่านกฎธุรกิจหรือ validation ฝั่งเซิร์ฟเวอร์',
    icon: AlertTriangle,
  },
  423: {
    titleTh: 'ทรัพยากรถูกล็อก',
    titleEn: 'Locked',
    descriptionTh: 'รายการนี้ถูกล็อกชั่วคราวจากผู้ใช้หรือกระบวนการอื่น',
    icon: FolderLock,
  },
  429: {
    titleTh: 'ส่งคำขอถี่เกินไป',
    titleEn: 'Too Many Requests',
    descriptionTh: 'ระบบจำกัดอัตราการเรียก API กรุณารอสักครู่แล้วลองใหม่',
    icon: Gauge,
  },
  500: {
    titleTh: 'ข้อผิดพลาดภายในเซิร์ฟเวอร์',
    titleEn: 'Internal Server Error',
    descriptionTh: 'เกิดข้อผิดพลาดที่ไม่คาดคิดบนเซิร์ฟเวอร์ กรุณาลองใหม่หรือแจ้งผู้ดูแลพร้อมเวลาที่เกิดปัญหา',
    icon: ServerCrash,
  },
  501: {
    titleTh: 'ยังไม่ได้ใช้งาน',
    titleEn: 'Not Implemented',
    descriptionTh: 'ฟีเจอร์หรือเส้นทาง API นี้ยังไม่เปิดใช้งานบนเซิร์ฟเวอร์',
    icon: Wrench,
  },
  502: {
    titleTh: 'เกตเวย์ไม่ตอบสนอง',
    titleEn: 'Bad Gateway',
    descriptionTh: 'พร็อกซีหรือเกตเวย์ได้รับการตอบกลับที่ไม่ถูกต้องจากเซิร์ฟเวอร์ต้นทาง',
    icon: Unplug,
  },
  503: {
    titleTh: 'บริการไม่พร้อม',
    titleEn: 'Service Unavailable',
    descriptionTh: 'เซิร์ฟเวอร์ปิดปรับปรุงหรือโหลดสูงชั่วคราว กรุณาลองใหม่ภายหลัง',
    icon: CloudOff,
  },
  504: {
    titleTh: 'เกตเวย์หมดเวลา',
    titleEn: 'Gateway Timeout',
    descriptionTh: 'เซิร์ฟเวอร์ต้นทางไม่ตอบกลับภายในเวลาที่กำหนด (มักเกิดที่ reverse proxy)',
    icon: WifiOff,
  },
} as const satisfies Record<number, Omit<HttpErrorMeta, 'code'>>

export type CatalogCode = keyof typeof catalog

export const KNOWN_HTTP_ERROR_CODES = Object.keys(catalog).map(Number) as CatalogCode[]

export function getHttpErrorMeta(code: number): HttpErrorMeta {
  const entry = catalog[code as CatalogCode]
  if (entry) {
    return { code, ...entry }
  }
  if (code >= 500 && code <= 599) {
    return { code, ...genericServer }
  }
  if (code >= 400 && code <= 499) {
    return { code, ...genericClient }
  }
  return { code: 404, ...catalog[404] }
}

export function parseHttpErrorCode(raw: string | undefined): number | null {
  if (raw == null || raw === '') return null
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n) || n < 100 || n > 599) return null
  return n
}
