import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { fetchMovePlanReasons, postMovePlan } from '@/lib/api-public'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type MovePlanDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  idiw37: string
  wkorder?: string
  defaultDate?: string
  onSuccess?: () => void
}

export function MovePlanDialog({
  open,
  onOpenChange,
  idiw37,
  wkorder,
  defaultDate,
  onSuccess,
}: MovePlanDialogProps) {
  const qc = useQueryClient()
  const [targetDate, setTargetDate] = useState(defaultDate ?? '')
  const [reasonCode, setReasonCode] = useState('')

  useEffect(() => {
    if (open) {
      setTargetDate(defaultDate ?? '')
      setReasonCode('')
    }
  }, [open, defaultDate])

  const reasonsQ = useQuery({
    queryKey: ['scheduling', 'move-reasons'],
    queryFn: fetchMovePlanReasons,
    enabled: open,
    staleTime: 600_000,
  })

  const moveM = useMutation({
    mutationFn: () =>
      postMovePlan({
        idiw37,
        targetDate,
        reasonCode,
      }),
    onSuccess: (data) => {
      toast.success(data.message)
      void qc.invalidateQueries({ queryKey: ['calendar'] })
      void qc.invalidateQueries({ queryKey: ['backlog'] })
      void qc.invalidateQueries({ queryKey: ['work-order', idiw37] })
      onSuccess?.()
      onOpenChange(false)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ย้ายแผน (MovePlant)</DialogTitle>
          <DialogDescription>
            เทียบ `modalPages/MovePlant.php` — สถานะ CRTD/REL เท่านั้น
            {wkorder ? ` · WO ${wkorder}` : ''}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>วันที่ย้ายไป</Label>
            <DatePicker value={targetDate} onChange={setTargetDate} className="w-full" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="move-reason">เหตุผล</Label>
            <select
              id="move-reason"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm"
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
              disabled={reasonsQ.isLoading}
            >
              <option value="">— เลือกเหตุผล —</option>
              {(reasonsQ.data ?? []).map((r) => (
                <option key={r.code} value={r.code}>
                  {r.code} = {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button
            type="button"
            disabled={!targetDate || !reasonCode || moveM.isPending}
            onClick={() => moveM.mutate()}
          >
            ย้ายแผน
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
