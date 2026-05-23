import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getStoredAuthUser } from '@/features/auth/login-api'
import { MASS_CONFIRM_MAX_ITEMS } from '@/api/schemas'
import { fetchWorkcenters, postConfirmationMassClose } from '@/lib/api-public'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import type { MassConfirmBatchResult } from '@/components/confirmation/MassConfirmExportPanel'
import { toast } from 'sonner'

/** Re-export for UI copy — ต้องตรงกับ `SAP_MASS_CONFIRM_MAX` บน backend */
export const MASS_CONFIRM_MAX = MASS_CONFIRM_MAX_ITEMS

function todayDdMmYyyy() {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = String(d.getFullYear())
  return `${dd}.${mm}.${yyyy}`
}

export type MassConfirmBarProps = {
  selectedIds: number[]
  onClearSelection?: () => void
  onComplete?: () => void
  onBatchDone?: (result: MassConfirmBatchResult) => void
}

export function MassConfirmBar({
  selectedIds,
  onClearSelection,
  onComplete,
  onBatchDone,
}: MassConfirmBarProps) {
  const authUser = getStoredAuthUser()
  const [wkctr, setWkctr] = useState(() => (authUser?.wkctr ?? '').trim())
  const [startD, setStartD] = useState(todayDdMmYyyy)
  const [endD, setEndD] = useState(todayDdMmYyyy)
  const [startT, setStartT] = useState('08:00')
  const [endT, setEndT] = useState('17:00')

  const wcQ = useQuery({
    queryKey: ['workcenters'],
    queryFn: fetchWorkcenters,
    staleTime: 300_000,
  })

  const wkctrOptions = useMemo(() => wcQ.data ?? [], [wcQ.data])

  const massMut = useMutation({
    mutationFn: () =>
      postConfirmationMassClose({
        idiw37n: selectedIds,
        wkctr: wkctr.trim(),
        startD,
        startT,
        endD,
        endT,
      }),
    onSuccess: (res) => {
      const batch: MassConfirmBatchResult = {
        succeeded: res.succeeded,
        failed: res.failed,
      }
      if (res.failed.length > 0) {
        toast.warning(
          `ปิดงานสำเร็จ ${res.succeeded.length} รายการ · ล้มเหลว ${res.failed.length} รายการ`,
        )
      } else {
        toast.success(`ปิดงานครบชุด ${res.succeeded.length} รายการ — ดำเนินการ Export ด้านล่าง`)
      }
      onBatchDone?.(batch)
      onClearSelection?.()
      onComplete?.()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const onSave = () => {
    if (selectedIds.length === 0) {
      toast.error('เลือก WO ก่อน')
      return
    }
    if (selectedIds.length > MASS_CONFIRM_MAX) {
      toast.error(`เลือกได้สูงสุด ${MASS_CONFIRM_MAX} รายการต่อ batch`)
      return
    }
    if (!wkctr.trim()) {
      toast.error('เลือก Work Center (wkctr)')
      return
    }
    massMut.mutate()
  }

  if (selectedIds.length === 0) return null

  return (
    <div className="space-y-3 rounded-card border border-emerald-200 bg-emerald-50/70 px-3 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-body-sm font-medium text-app">
          Mass Confirm — เลือก {selectedIds.length} / {MASS_CONFIRM_MAX} รายการ (SAP)
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={onClearSelection}>
          ล้างการเลือก
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-1">
          <Label htmlFor="mass-wkctr">Work Center (wkctr)</Label>
          <select
            id="mass-wkctr"
            className="h-9 w-full rounded-button border border-app bg-white px-2 text-body-sm"
            value={wkctr}
            onChange={(e) => setWkctr(e.target.value)}
          >
            <option value="">— เลือก —</option>
            {wkctrOptions.map((w) => (
              <option key={w.wkctr} value={w.wkctr}>
                {w.wkctr} — {w.displayName}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="mass-start-d">เริ่ม (วันที่)</Label>
          <Input id="mass-start-d" value={startD} onChange={(e) => setStartD(e.target.value)} placeholder="dd.mm.yyyy" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="mass-start-t">เริ่ม (เวลา)</Label>
          <Input id="mass-start-t" value={startT} onChange={(e) => setStartT(e.target.value)} placeholder="HH:mm" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="mass-end-d">สิ้นสุด (วันที่)</Label>
          <Input id="mass-end-d" value={endD} onChange={(e) => setEndD(e.target.value)} placeholder="dd.mm.yyyy" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="mass-end-t">สิ้นสุด (เวลา)</Label>
          <Input id="mass-end-t" value={endT} onChange={(e) => setEndT(e.target.value)} placeholder="HH:mm" />
        </div>
      </div>

      <Button type="button" disabled={massMut.isPending} onClick={onSave}>
        {massMut.isPending ? 'กำลังปิดงาน…' : `ปิดงานครั้งเดียว (${selectedIds.length})`}
      </Button>
    </div>
  )
}
