import { i18n } from '@/i18n'
import { toast } from 'sonner'

/** Toast สั้น — ข้อความตาม locale ปัจจุบัน */
export function toastSuccess(message: string) {
  toast.success(message)
}

export function toastError(message: string, description?: string) {
  toast.error(message, description ? { description } : undefined)
}

export function toastSaved() {
  toast.success(i18n.t('toast.saved', { ns: 'common' }))
}

export function toastDeleted() {
  toast.success(i18n.t('toast.deleted', { ns: 'common' }))
}
