import { ProfileAvatar } from '@/components/profile/ProfileAvatar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useProfileQuery } from '@/features/profile/profile-api'
import { BarChart3, CalendarDays, ChevronDown, Clock, LogOut, Settings } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export function AppNavbarUser() {
  const navigate = useNavigate()
  const q = useProfileQuery()

  if (q.isLoading) {
    return <Skeleton className="h-9 w-28 rounded-card" />
  }

  if (q.isError || !q.data) {
    return null
  }

  const p = q.data
  const isWc = p.accountType === 'workcenter'
  const avatarProps = {
    displayName: p.displayName,
    idwkctr: isWc ? p.userId : undefined,
    hasImage: p.hasImage,
    imgMember: p.imgMember,
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-auto max-w-[min(100%,14rem)] gap-2 px-2 py-2 text-app hover:bg-app-muted"
          aria-label="เมนูโปรไฟล์"
        >
          <ProfileAvatar {...avatarProps} />
          <span className="hidden min-w-0 flex-col items-start text-left sm:flex">
            <span className="truncate text-body-sm font-medium leading-tight">{p.displayName}</span>
            <span className="truncate text-caption">
              {p.userst ? `${p.userst} · ` : ''}
              {p.sysstatus}
            </span>
          </span>
          <ChevronDown className="hidden size-4 shrink-0 text-app-muted sm:block" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <ProfileAvatar {...avatarProps} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-sm font-semibold text-app">{p.displayName}</p>
              <p className="mt-1 text-xs text-app-muted">
                สถานะ {p.userst ?? '—'} : {p.sysstatus}
              </p>
              {!isWc && p.username ? (
                <p className="mt-1 font-mono text-caption">{p.username}</p>
              ) : null}
            </div>
          </div>

          {isWc && (p.birthdayLabel || p.workAgeLabel || p.worktimeTotalHours != null) ? (
            <dl className="mt-3 space-y-2 rounded-card bg-app-subtle px-3 py-2 text-xs">
              {p.birthdayLabel ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-app-muted">ปัจจุบันอายุ</dt>
                  <dd className="text-right font-medium text-app">{p.birthdayLabel}</dd>
                </div>
              ) : null}
              {p.workAgeLabel ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-app-muted">อายุการทำงาน</dt>
                  <dd className="text-right font-medium text-app">{p.workAgeLabel}</dd>
                </div>
              ) : null}
              {p.worktimeTotalHours != null ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-app-muted">ชั่วโมงรวม</dt>
                  <dd className="text-right font-medium text-app">
                    <Link to="/worktime" className="hover:underline">
                      {p.worktimeTotalHours} ชม.
                    </Link>
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </div>

        <Separator />

        <nav className="flex flex-col p-1" aria-label="ลิงก์โปรไฟล์">
          {isWc ? (
            <>
              <Link
                to="/manhours"
                className="flex items-center gap-2 rounded-button px-3 py-2 text-body-sm text-app hover:bg-app-muted"
              >
                <BarChart3 className="size-4 shrink-0 opacity-70" aria-hidden />
                View Performance
                {p.worktimeTotalHours != null ? (
                  <span className="ml-auto text-xs text-app-muted">{p.worktimeTotalHours} ชม.</span>
                ) : null}
              </Link>
              <Link
                to="/worktime"
                className="flex items-center gap-2 rounded-button px-3 py-2 text-body-sm text-app hover:bg-app-muted"
              >
                <Clock className="size-4 shrink-0 opacity-70" aria-hidden />
                ชั่วโมงทำงาน
              </Link>
              <Link
                to="/planning"
                className="flex items-center gap-2 rounded-button px-3 py-2 text-body-sm text-app hover:bg-app-muted"
              >
                <CalendarDays className="size-4 shrink-0 opacity-70" aria-hidden />
                Plan Work View
              </Link>
              <Separator className="my-1" />
            </>
          ) : null}
          <Link
            to="/settings"
            className="flex items-center gap-2 rounded-button px-3 py-2 text-body-sm text-app hover:bg-app-muted"
          >
            <Settings className="size-4 shrink-0 opacity-70" aria-hidden />
            โปรไฟล์
          </Link>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-button px-3 py-2 text-left text-body-sm text-app hover:bg-app-muted"
            onClick={() => navigate('/logout')}
          >
            <LogOut className="size-4 shrink-0 opacity-70" aria-hidden />
            ออกจากระบบ
          </button>
        </nav>
      </PopoverContent>
    </Popover>
  )
}
