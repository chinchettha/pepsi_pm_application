import { toast } from 'sonner'

/** Toast สั้น ภาษาไทย — สไตล์จาก `[data-sonner-toast]` ใน index.css */
export function toastSuccess(message: string) {
  toast.success(message)
}

export function toastError(message: string, description?: string) {
  toast.error(message, description ? { description } : undefined)
}

export function toastSaved() {
  toast.success('บันทึกแล้ว')
}

export function toastDeleted() {
  toast.success('ลบแล้ว')
}
