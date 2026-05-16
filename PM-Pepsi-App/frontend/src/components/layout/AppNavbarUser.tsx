import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useProfileQuery } from '@/features/profile/profile-api'
import { BarChart3, CalendarDays, ChevronDown, Clock, LogOut, Settings } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

function ProfileAvatar({ displayName }: { displayName: string }) {
  const initial = displayName.trim().charAt(0).toUpperCase() || '?'
  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold text-white ring-2 ring-zinc-200"
      aria-hidden
    >
      {initial}
    </span>
  )
}

export function AppNavbarUser() {
  const navigate = useNavigate()
  const q = useProfileQuery()

  if (q.isLoading) {
    return <Skeleton className="h-9 w-28 rounded-lg" />
  }

  if (q.isError || !q.data) {
    return null
  }

  const p = q.data
  const isWc = p.accountType === 'workcenter'

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-auto max-w-[min(100%,14rem)] gap-2 px-2 py-1.5 text-zinc-900 hover:bg-zinc-100"
          aria-label="เมนูโปรไฟล์"
        >
          <ProfileAvatar displayName={p.displayName} />
          <span className="hidden min-w-0 flex-col items-start text-left sm:flex">
            <span className="truncate text-sm font-medium leading-tight">{p.displayName}</span>
            <span className="truncate text-[11px] text-zinc-500">
              {p.userst ? `${p.userst} · ` : ''}
              {p.sysstatus}
            </span>
          </span>
          <ChevronDown className="hidden size-4 shrink-0 text-zinc-400 sm:block" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <ProfileAvatar displayName={p.displayName} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-900">{p.displayName}</p>
              <p className="mt-0.5 text-xs text-zinc-600">
                สถานะ {p.userst ?? '—'} : {p.sysstatus}
              </p>
              {!isWc && p.username ? (
                <p className="mt-1 font-mono text-[11px] text-zinc-500">{p.username}</p>
              ) : null}
            </div>
          </div>

          {isWc && (p.birthdayLabel || p.workAgeLabel || p.worktimeTotalHours != null) ? (
            <dl className="mt-3 space-y-1.5 rounded-lg bg-zinc-50 px-3 py-2 text-xs">
              {p.birthdayLabel ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-zinc-500">ปัจจุบันอายุ</dt>
                  <dd className="text-right font-medium text-zinc-900">{p.birthdayLabel}</dd>
                </div>
              ) : null}
              {p.workAgeLabel ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-zinc-500">อายุการทำงาน</dt>
                  <dd className="text-right font-medium text-zinc-900">{p.workAgeLabel}</dd>
                </div>
              ) : null}
              {p.worktimeTotalHours != null ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-zinc-500">ชั่วโมงรวม</dt>
                  <dd className="text-right font-medium text-zinc-900">
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
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
              >
                <BarChart3 className="size-4 shrink-0 opacity-70" aria-hidden />
                View Performance
                {p.worktimeTotalHours != null ? (
                  <span className="ml-auto text-xs text-zinc-500">{p.worktimeTotalHours} ชม.</span>
                ) : null}
              </Link>
              <Link
                to="/worktime"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
              >
                <Clock className="size-4 shrink-0 opacity-70" aria-hidden />
                ชั่วโมงทำงาน
              </Link>
              <Link
                to="/planning"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
              >
                <CalendarDays className="size-4 shrink-0 opacity-70" aria-hidden />
                Plan Work View
              </Link>
              <Separator className="my-1" />
            </>
          ) : null}
          <Link
            to="/settings"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            <Settings className="size-4 shrink-0 opacity-70" aria-hidden />
            โปรไฟล์
          </Link>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100"
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
