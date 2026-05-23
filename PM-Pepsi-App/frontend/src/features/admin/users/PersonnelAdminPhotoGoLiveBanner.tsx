import { ConfirmPhraseDialog } from '@/components/admin/ConfirmPhraseDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  deactivateAdminWithoutPhoto,
  fetchAdminPhotoGoLiveGaps,
} from '@/lib/admin-users-api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

type Props = {
  canWrite: boolean
  onShowMissingPhotos: () => void
}

/** Go-live: ช่างที่มี manhours แต่ไม่มีรูป — ปิดที่ Users (TERMINATED) ก่อนเปิด Eng Utilization */
export function PersonnelAdminPhotoGoLiveBanner({ canWrite, onShowMissingPhotos }: Props) {
  const qc = useQueryClient()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const gapsQ = useQuery({
    queryKey: ['admin', 'users', 'photo-go-live'],
    queryFn: () => fetchAdminPhotoGoLiveGaps({ weeksBack: 8 }),
    staleTime: 60_000,
  })

  const deactivateM = useMutation({
    mutationFn: (idwkctrs: string[]) => deactivateAdminWithoutPhoto(idwkctrs),
    onSuccess: (res) => {
      toast.success(
        `ปิดการใช้งาน ${res.updated} คน (workstatus=${res.workstatus})${
          res.skipped.length ? ` · ข้าม ${res.skipped.length}` : ''
        }`,
      )
      void qc.invalidateQueries({ queryKey: ['admin', 'users', 'photo-go-live'] })
      void qc.invalidateQueries({ queryKey: ['personnel', 'admin', 'list'] })
      void qc.invalidateQueries({ queryKey: ['reports', 'summary-weekly'] })
      setConfirmOpen(false)
    },
    onError: (e: Error) => toast.error(e.message || 'ปิดการใช้งานไม่สำเร็จ'),
  })

  if (gapsQ.isLoading) {
    return <Skeleton className="h-20 w-full rounded-card" />
  }
  if (gapsQ.isError || !gapsQ.data) return null

  const { items, range } = gapsQ.data
  if (items.length === 0) return null

  const ids = items.map((i) => i.idwkctr)

  return (
    <>
      <div className="rounded-card border border-amber-300 bg-amber-50/90 p-4">
        <p className="text-body-sm font-medium text-amber-950">
          Go-live Eng Utilization: ช่างที่มีชั่วโมงในรายงานแต่ยังไม่มีรูป {items.length} คน
        </p>
        <p className="mt-1 text-xs text-amber-900/85">
          ช่วง manhours {range.from} – {range.to} (เทียบ `/summary-weekly` ค่าเริ่มต้น 8 สัปดาห์).
          อัปโหลดรูปที่แถวแก้ไข หรือปิดการใช้งานที่นี่ — ตั้ง workstatus เป็น{' '}
          <strong>TERMINATED</strong> (พ้นสภาพ) เพื่อไม่ให้โผล่ใน Eng Utilization จนมีรูป
        </p>
        <ul className="mt-2 flex flex-wrap gap-2 text-xs">
          {items.slice(0, 8).map((p) => (
            <li key={p.idwkctr} className="rounded-button border border-amber-200 bg-white px-2 py-1">
              {p.wkctr}
              {p.displayName ? ` (${p.displayName})` : ''} · {p.manhourHours} ชม.
            </li>
          ))}
          {items.length > 8 ? (
            <li className="self-center text-amber-800">+{items.length - 8} คน</li>
          ) : null}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={onShowMissingPhotos}>
            กรองตาราง: ไม่มีรูป
          </Button>
          <Button type="button" size="sm" variant="outline" asChild>
            <Link to="/summary-weekly">ดู Eng Utilization</Link>
          </Button>
          {canWrite ? (
            <Button
              type="button"
              size="sm"
              className="bg-amber-700 hover:bg-amber-800"
              onClick={() => setConfirmOpen(true)}
            >
              ปิดการใช้งานทั้งหมดที่ไม่มีรูป ({items.length})
            </Button>
          ) : (
            <span className="self-center text-xs text-amber-800">ต้องมีสิทธิ์ admin.users.write</span>
          )}
        </div>
      </div>

      {confirmOpen ? (
        <ConfirmPhraseDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          phrase="ปิดช่างไม่มีรูป"
          title="ปิดการใช้งานช่างที่ไม่มีรูป?"
          description={`ตั้ง workstatus=TERMINATED สำหรับ ${items.length} คนที่ยังใช้งานและไม่มี imgmember_data — จะหายจาก Eng Utilization จนอัปโหลดรูปและเปิดสถานะใหม่`}
          confirmLabel="ปิดการใช้งาน"
          loading={deactivateM.isPending}
          onConfirm={() => deactivateM.mutate(ids)}
        />
      ) : null}
    </>
  )
}
