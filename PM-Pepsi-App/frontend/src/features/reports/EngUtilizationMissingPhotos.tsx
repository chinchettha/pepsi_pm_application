import { Button } from '@/components/ui/button'
import type { EngUtilizationChartRow } from '@/lib/eng-utilization-chart'
import { Link } from 'react-router-dom'

type Props = {
  people: EngUtilizationChartRow[]
  canManagePhotos: boolean
}

/** แจ้งช่างที่ยังไม่มีรูปใน DB — ลิงก์ไป Admin Users */
export function EngUtilizationMissingPhotos({ people, canManagePhotos }: Props) {
  const missing = people.filter((p) => !p.hasImage)
  if (missing.length === 0) return null

  return (
    <div className="rounded-card border border-amber-200 bg-amber-50/80 p-4">
      <p className="text-body-sm font-medium text-amber-950">
        ยังไม่มีรูปประจำตัว {missing.length} คน — ต้องจัดการก่อน go-live
      </p>
      {canManagePhotos ? (
        <>
          <p className="mt-1 text-xs text-amber-900/80">
            อัปโหลดรูปที่ Admin → Users (แท็บ Work center) หรือปิดการใช้งาน (workstatus TERMINATED)
            ที่แบนเนอร์ Go-live — มิฉะนั้นจะยังโผล่ในกราฟ/ตารางนี้
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {missing.slice(0, 12).map((p) => (
              <li key={p.idwkctr}>
                <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                  <Link to={`/admin/users?q=${encodeURIComponent(p.wkctr)}`}>{p.wkctr}</Link>
                </Button>
              </li>
            ))}
            {missing.length > 12 ? (
              <li className="self-center text-xs text-amber-800">+{missing.length - 12} คน</li>
            ) : null}
            <li>
              <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                <Link to="/admin/users?photo=missing">เปิด Admin Users (ไม่มีรูป)</Link>
              </Button>
            </li>
          </ul>
        </>
      ) : (
        <p className="mt-1 text-xs text-amber-900/80">ติดต่อ Admin เพื่ออัปโหลดรูปในเมนู Users</p>
      )}
    </div>
  )
}
