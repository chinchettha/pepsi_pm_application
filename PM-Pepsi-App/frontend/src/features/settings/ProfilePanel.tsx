import { getStoredAuthUser } from '@/features/auth/login-api'
import { useProfileQuery } from '@/features/profile/profile-api'
import { Skeleton } from '@/components/ui/skeleton'

export function ProfilePanel() {
  const authUser = getStoredAuthUser()
  const q = useProfileQuery(Boolean(authUser))

  if (!authUser) {
    return <p className="text-sm text-zinc-600">กรุณาเข้าสู่ระบบ</p>
  }

  if (q.isLoading) return <Skeleton className="h-40 w-full rounded-xl" />
  if (q.isError) {
    return <p className="text-sm text-red-600">{(q.error as Error).message}</p>
  }

  const p = q.data!
  const isMember = p.accountType === 'member'

  return (
    <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900">โปรไฟล์ผู้ใช้</h3>
        <p className="mt-1 text-xs text-zinc-500">
          เทียบ session จาก {isMember ? 'login-bk.php / tbl_member' : 'login.php / tbworkcenter'} + calc_birthday / calc_worktime
        </p>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-zinc-500">ชื่อแสดง</dt>
          <dd className="text-sm font-medium text-zinc-900">{p.displayName}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500">สถานะ</dt>
          <dd className="text-sm text-zinc-900">{p.sysstatus}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500">{isMember ? 'Username' : 'รหัส WC'}</dt>
          <dd className="font-mono text-sm text-zinc-900">{p.username}</dd>
        </div>
        {!isMember && p.plnt ? (
          <div>
            <dt className="text-xs text-zinc-500">Plant</dt>
            <dd className="text-sm text-zinc-900">{p.plnt}</dd>
          </div>
        ) : null}
        {!isMember && p.birthdayLabel ? (
          <div>
            <dt className="text-xs text-zinc-500">อายุ (เทียบ calc_birthday)</dt>
            <dd className="text-sm text-zinc-900">{p.birthdayLabel}</dd>
          </div>
        ) : null}
        {!isMember && p.workAgeLabel ? (
          <div>
            <dt className="text-xs text-zinc-500">อายุการทำงาน (calc_worktime)</dt>
            <dd className="text-sm text-zinc-900">{p.workAgeLabel}</dd>
          </div>
        ) : null}
        {!isMember && p.worktimeTotalHours != null ? (
          <div>
            <dt className="text-xs text-zinc-500">ชั่วโมงรวม (worktime_count)</dt>
            <dd className="text-sm text-zinc-900">{p.worktimeTotalHours} ชม.</dd>
          </div>
        ) : null}
        {isMember && p.idcard ? (
          <div>
            <dt className="text-xs text-zinc-500">เลขบัตร</dt>
            <dd className="text-sm text-zinc-900">{p.idcard}</dd>
          </div>
        ) : null}
        {isMember && p.bank ? (
          <div className="sm:col-span-2">
            <dt className="text-xs text-zinc-500">ธนาคาร</dt>
            <dd className="text-sm text-zinc-900">
              {p.bank} {p.bankNo ? `· ${p.bankNo}` : ''} {p.branch ? `· ${p.branch}` : ''}
            </dd>
          </div>
        ) : null}
        {p.lastLogin ? (
          <div>
            <dt className="text-xs text-zinc-500">เข้าใช้ล่าสุด</dt>
            <dd className="text-sm text-zinc-900">{p.lastLogin.slice(0, 19).replace('T', ' ')}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  )
}
