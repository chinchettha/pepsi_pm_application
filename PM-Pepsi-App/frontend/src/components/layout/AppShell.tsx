import { PepsiBrandMark } from '@/components/brand/PepsiBrandMark'
import { AppFooter } from '@/components/layout/AppFooter'
import { AppNavbarUser } from '@/components/layout/AppNavbarUser'
import { useAppNav } from '@/lib/use-app-nav'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { LucideIcon } from 'lucide-react'
import {
  AUTH_CHANGED_EVENT,
  getStoredAuthUser,
  isLoggedIn,
} from '@/features/auth/login-api'
import { LogIn, LogOut, Menu, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

function NavItem({
  to,
  label,
  icon: Icon,
  end,
  onNavigate,
}: {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  onNavigate?: () => void
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-zinc-800 text-white'
            : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-white',
        ].join(' ')
      }
    >
      <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
      <span className="min-w-0 leading-snug">{label}</span>
    </NavLink>
  )
}

export function AppShell() {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(() => isLoggedIn())
  const authUser = loggedIn ? getStoredAuthUser() : null
  const { entries: visibleNav, source: navSource } = useAppNav()
  const closeMobile = () => setMobileOpen(false)

  useEffect(() => {
    const sync = () => setLoggedIn(isLoggedIn())
    window.addEventListener(AUTH_CHANGED_EVENT, sync)
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, sync)
  }, [])

  const goLogout = useCallback(() => {
    closeMobile()
    navigate('/logout')
  }, [navigate])

  const sidebarInner = (
    <>
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-zinc-800 px-4">
        <PepsiBrandMark size="sm" className="ring-1 ring-white/10" />
        <div className="min-w-0 leading-tight">
          <div className="truncate text-sm font-semibold text-white">Planning PM/CM</div>
          <div className="truncate text-xs text-zinc-500">Pepsi — maintenance</div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="ml-auto text-zinc-400 hover:bg-zinc-800 hover:text-white lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="ปิดเมนู"
        >
          <X className="size-5" />
        </Button>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3" aria-label="เมนูหลัก">
        <p className="mb-1 px-1 text-[10px] leading-tight text-zinc-500">
          เมนูจาก <code className="text-zinc-400">tbmenu</code>
          {navSource === 'api' ? ' (API+DB)' : ' (fallback)'} —{' '}
          <code className="text-zinc-400">UserST</code>
          {authUser ? ` ${authUser.userst}` : ''}
        </p>
        {visibleNav.map((entry, idx) =>
          entry.kind === 'heading' ? (
            <div
              key={`h-${idx}-${entry.label}`}
              className={[
                'px-2 pb-0.5 pt-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-500',
                idx === 0 ? 'pt-1' : '',
              ].join(' ')}
            >
              {entry.label}
            </div>
          ) : (
            <NavItem
              key={entry.to}
              to={entry.to}
              label={entry.label}
              icon={entry.icon}
              end={entry.end}
              onNavigate={closeMobile}
            />
          ),
        )}
      </nav>
      <div className="border-t border-zinc-800 p-3">
        {loggedIn && authUser ? (
          <p className="mb-2 truncate px-1 text-xs text-zinc-400" title={authUser.fullnameTh}>
            {authUser.fullnameTh?.trim() || authUser.username}
            <span className="block text-[10px] text-zinc-500">{authUser.sysstatus}</span>
          </p>
        ) : null}
        {loggedIn ? (
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-2 border-zinc-600 bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
            onClick={goLogout}
          >
            <LogOut className="size-4" aria-hidden />
            ออกจากระบบ
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-2 border-zinc-600 bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
            onClick={() => {
              closeMobile()
              navigate('/login')
            }}
          >
            <LogIn className="size-4" aria-hidden />
            เข้าสู่ระบบ
          </Button>
        )}
      </div>
    </>
  )

  return (
    <div className="flex min-h-svh bg-zinc-100">
      <aside className="hidden w-60 shrink-0 flex-col bg-zinc-950 lg:flex">{sidebarInner}</aside>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="ปิด overlay"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-zinc-950 shadow-xl transition-transform duration-200 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {sidebarInner}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-4 shadow-sm">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="เปิดเมนู"
          >
            <Menu className="size-5" />
          </Button>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="hidden text-sm font-semibold text-zinc-900 sm:inline">
              ระบบวางแผนและปิดใบงาน — PM/CM
            </span>
            <span className="truncate text-xs text-zinc-500 sm:hidden">PM/CM</span>
          </div>
          {loggedIn ? <AppNavbarUser /> : (
            <Button size="sm" variant="outline" asChild>
              <NavLink to="/login">เข้าสู่ระบบ</NavLink>
            </Button>
          )}
        </header>
        <Separator />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
        <AppFooter />
      </div>
    </div>
  )
}
