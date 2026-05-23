import { AppCard } from '@/components/layout/AppCard'
import { ChangePasswordForm } from '@/features/settings/ChangePasswordForm'
import { getStoredAuthUser } from '@/features/auth/login-api'
import { useProfileQuery } from '@/features/profile/profile-api'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'

export function ProfilePanel() {
  const authUser = getStoredAuthUser()
  const q = useProfileQuery(Boolean(authUser))

  if (!authUser) {
    return (
      <EmptyState title="กรุณาเข้าสู่ระบบ" description="เข้าสู่ระบบเพื่อดูโปรไฟล์" />
    )
  }

  if (q.isLoading && !q.data) return <Skeleton className="h-40 w-full rounded-card" />
  if (q.isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="โหลดโปรไฟล์ไม่สำเร็จ"
        description={(q.error as Error).message}
        action={{ label: 'ลองใหม่', onClick: () => void q.refetch() }}
      />
    )
  }

  const p = q.data!
  const isMember = p.accountType === 'member'

  return (
    <div className="space-y-4">
      <AppCard pad="compact" className="space-y-4">
        <div>
          <h3 className="text-body-sm font-semibold text-app">โปรไฟล์ผู้ใช้</h3>
          <p className="mt-1 text-xs text-app-muted">
            ข้อมูลจาก session (
            {isMember ? 'สมาชิก / tbl_member' : 'work center / tbworkcenter'})
          </p>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-app-muted">ชื่อแสดง</dt>
            <dd className="text-body-sm font-medium text-app">{p.displayName}</dd>
          </div>
          <div>
            <dt className="text-xs text-app-muted">สถานะ</dt>
            <dd className="text-body-sm text-app">{p.sysstatus}</dd>
          </div>
          <div>
            <dt className="text-xs text-app-muted">{isMember ? 'ชื่อผู้ใช้' : 'รหัส WC'}</dt>
            <dd className="font-mono text-body-sm text-app">{p.username}</dd>
          </div>
          {!isMember && p.plnt ? (
            <div>
              <dt className="text-xs text-app-muted">Plant</dt>
              <dd className="text-body-sm text-app">{p.plnt}</dd>
            </div>
          ) : null}
          {!isMember && p.birthdayLabel ? (
            <div>
              <dt className="text-xs text-app-muted">อายุ</dt>
              <dd className="text-body-sm text-app">{p.birthdayLabel}</dd>
            </div>
          ) : null}
          {!isMember && p.workAgeLabel ? (
            <div>
              <dt className="text-xs text-app-muted">อายุการทำงาน</dt>
              <dd className="text-body-sm text-app">{p.workAgeLabel}</dd>
            </div>
          ) : null}
          {!isMember && p.worktimeTotalHours != null ? (
            <div>
              <dt className="text-xs text-app-muted">ชั่วโมงรวม (worktime)</dt>
              <dd className="text-body-sm text-app">{p.worktimeTotalHours} ชม.</dd>
            </div>
          ) : null}
          {isMember && p.idcard ? (
            <div>
              <dt className="text-xs text-app-muted">เลขบัตร</dt>
              <dd className="text-body-sm text-app">{p.idcard}</dd>
            </div>
          ) : null}
          {isMember && p.bank ? (
            <div className="sm:col-span-2">
              <dt className="text-xs text-app-muted">ธนาคาร</dt>
              <dd className="text-body-sm text-app">
                {p.bank} {p.bankNo ? `· ${p.bankNo}` : ''} {p.branch ? `· ${p.branch}` : ''}
              </dd>
            </div>
          ) : null}
          {p.lastLogin ? (
            <div>
              <dt className="text-xs text-app-muted">เข้าใช้ล่าสุด</dt>
              <dd className="text-body-sm tabular-nums text-app">
                {new Date(p.lastLogin).toLocaleString('th-TH')}
              </dd>
            </div>
          ) : null}
        </dl>
      </AppCard>
      <ChangePasswordForm />
    </div>
  )
}
