export type WorkOrderCloseReadyInput = {
  commentCount: number
  imageAfter: number
  closeKind?: 'complete' | 'partial'
}

import { i18n } from '@/i18n'

export function workOrderCloseReadyMessage(input: WorkOrderCloseReadyInput): string | null {
  if (input.commentCount < 1) {
    return i18n.t('closeReady.needComment', { ns: 'scheduling' })
  }
  if (input.imageAfter < 1) {
    return i18n.t('closeReady.needImages', { ns: 'scheduling' })
  }
  return null
}

/** ช่างปิดงานในแท็บ Close WO — partial ไม่บังคับ comment/รูป; complete ต้องมีรูปหลัง PM */
export function personnelCloseReadyMessage(input: {
  imageAfter: number
  closeKind?: 'complete' | 'partial'
}): string | null {
  if (input.closeKind === 'partial') return null
  if (input.imageAfter < 1) {
    return i18n.t('closeReady.needImages', { ns: 'scheduling' })
  }
  return null
}

export function isWorkOrderCloseReady(input: WorkOrderCloseReadyInput): boolean {
  return workOrderCloseReadyMessage(input) === null
}
