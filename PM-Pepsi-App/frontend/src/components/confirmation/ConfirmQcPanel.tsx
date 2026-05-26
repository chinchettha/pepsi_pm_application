import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import type { workOrderConfirmQcSchema } from '@/api/schemas'
import {
  fetchConfirmQc,
  postConfirmQcApprove,
  postConfirmQcReject,
} from '@/lib/api-public'
import { usePermission } from '@/lib/use-permission'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { z } from 'zod'

type ConfirmQc = z.infer<typeof workOrderConfirmQcSchema>

function statusVariant(
  status: ConfirmQc['status'],
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'approved') return 'default'
  if (status === 'pending') return 'secondary'
  if (status === 'rejected') return 'destructive'
  return 'outline'
}

export type ConfirmQcPanelProps = {
  idiw37: number | null
  wkorder?: string
  /** จาก work order detail — ลด round-trip */
  initialQc?: ConfirmQc | null
  enabled?: boolean
  onQcChange?: () => void
}

export function ConfirmQcPanel({
  idiw37,
  wkorder,
  initialQc,
  enabled = true,
  onQcChange,
}: ConfirmQcPanelProps) {
  const qc = useQueryClient()
  const canReview = usePermission('confirmation.import')
  const [rejectNote, setRejectNote] = useState('')

  const qcQ = useQuery({
    queryKey: ['confirmation', 'qc', idiw37],
    queryFn: () => fetchConfirmQc(idiw37!),
    enabled: enabled && typeof idiw37 === 'number' && !initialQc,
    initialData: initialQc ?? undefined,
  })

  const data = initialQc ?? qcQ.data

  const invalidate = async () => {
    if (typeof idiw37 === 'number') {
      await qc.invalidateQueries({ queryKey: ['confirmation', 'qc', idiw37] })
    }
    await qc.invalidateQueries({ queryKey: ['work-order'] })
    await qc.invalidateQueries({ queryKey: ['confirmation', 'qc', 'pending'] })
    await qc.invalidateQueries({ queryKey: ['personnel', 'admin', 'confirm'] })
    onQcChange?.()
  }

  const approveMut = useMutation({
    mutationFn: () => postConfirmQcApprove(idiw37!),
    onSuccess: async () => {
      setRejectNote('')
      await invalidate()
    },
  })

  const rejectMut = useMutation({
    mutationFn: () => postConfirmQcReject(idiw37!, rejectNote),
    onSuccess: async () => {
      setRejectNote('')
      await invalidate()
    },
  })

  if (!enabled || typeof idiw37 !== 'number') return null

  if (qcQ.isLoading && !data) {
    return <Skeleton className="h-24 w-full" />
  }

  if (!data) return null

  return (
    <section className="space-y-3 rounded-card border border-amber-200 bg-amber-50/80 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-body-sm font-semibold text-app">Admin QC — ก่อนนับปิดงานในระบบ</h4>
          <p className="text-xs text-app-muted">
            WO {wkorder ?? '—'} · อนุมัติแล้วจึงนับใน Personnel Confirm / Export / workflow ขั้น 4
          </p>
        </div>
        <Badge variant={statusVariant(data.status)} role="status">
          {data.statusLabel}
        </Badge>
      </div>

      <ul className="grid gap-1 text-xs text-app sm:grid-cols-2">
        <li>รูป: {data.imageCount} (ก่อน {data.imageBefore} · หลัง {data.imageAfter})</li>
        <li>ปิดงาน (supervisor): {data.closeCount}</li>
        <li>เวลาช่าง (tbwrkclose): {data.worktimeCount}</li>
        {data.reviewedAt ? (
          <li className="sm:col-span-2">
            ตรวจโดย {data.reviewedBy ?? '—'} ·{' '}
            {new Date(data.reviewedAt).toLocaleString('th-TH')}
          </li>
        ) : null}
        {data.note ? (
          <li className="sm:col-span-2 text-red-700">หมายเหตุ: {data.note}</li>
        ) : null}
      </ul>

      {!data.approved && !data.readyForReview ? (
        <p className="text-xs text-app-muted">
          ช่างยังไม่ส่งข้อมูล (รูป / เวลา / ปิดงาน) — ระบบจะตั้งสถานะ「รอตรวจ」เมื่อมีการบันทึก
        </p>
      ) : null}

      {canReview && data.status === 'pending' && data.readyForReview ? (
        <div className="flex flex-wrap gap-2 border-t border-amber-200/80 pt-3">
          <Button
            type="button"
            size="sm"
            disabled={approveMut.isPending || rejectMut.isPending}
            onClick={() => approveMut.mutate()}
          >
            {approveMut.isPending ? 'กำลังอนุมัติ…' : 'อนุมัติ (เข้า Dashboard)'}
          </Button>
          <div className="flex min-w-[12rem] flex-1 flex-col gap-1">
            <Label htmlFor="qc-reject-note" className="text-xs">
              เหตุผลส่งกลับ (ถ้ามี)
            </Label>
            <Textarea
              id="qc-reject-note"
              rows={2}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="เช่น รูปหลังงานไม่ชัด"
              maxLength={500}
            />
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={approveMut.isPending || rejectMut.isPending}
            onClick={() => rejectMut.mutate()}
          >
            {rejectMut.isPending ? 'กำลังส่งกลับ…' : 'ส่งกลับแก้ไข'}
          </Button>
        </div>
      ) : null}

      {canReview && data.status === 'rejected' ? (
        <p className="text-xs text-red-700">
          ส่งกลับแล้ว — ช่างแก้ไขรูป/เวลาแล้วระบบจะตั้ง「รอตรวจ」อีกครั้งเมื่อบันทึกใหม่
        </p>
      ) : null}

      {!canReview && data.status === 'pending' ? (
        <p className="text-xs text-amber-800">รอ Admin ตรวจและอนุมัติก่อนนับเป็นงานปิดครบในระบบ</p>
      ) : null}

      {(approveMut.error || rejectMut.error) && (
        <p className="text-body-sm text-red-600">
          {(approveMut.error ?? rejectMut.error)?.message}
        </p>
      )}
    </section>
  )
}
