import { describe, expect, it, vi } from 'vitest'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { toast } from 'sonner'
import { toastSaved, toastSuccess } from '@/lib/app-toast'

describe('app-toast', () => {
  it('toastSuccess calls sonner success', () => {
    toastSuccess('สำเร็จ')
    expect(toast.success).toHaveBeenCalledWith('สำเร็จ')
  })

  it('toastSaved uses Thai default', () => {
    toastSaved()
    expect(toast.success).toHaveBeenCalledWith('บันทึกแล้ว')
  })
})
