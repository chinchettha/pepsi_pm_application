import type { AuthUser } from '@/api/schemas'
import { PepsiBrandMark } from '@/components/brand/PepsiBrandMark'
import { PepsiStripe } from '@/components/brand/PepsiStripe'
import { AppFooter } from '@/components/layout/AppFooter'
import { MacosDock } from '@/components/macos/MacosDock'
import { AppNavbarUser } from '@/components/layout/AppNavbarUser'
import type { NavEntry } from '@/components/layout/nav-config'
import { NavMenuList } from '@/components/layout/NavMenuList'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { publicLogoUrl } from '@/lib/settings-api'
import { useSidebarState } from '@/lib/use-sidebar-state'
import { cn } from '@/lib/utils'
import { CommandPaletteShortcutBadge } from '@/components/command-palette/CommandPaletteShortcutBadge'
import { LogIn, LogOut, Menu, Pin, PinOff, Search, X } from 'lucide-react'
import type { NavShellMode } from '@/api/schemas'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'

const SIDEBAR_WIDE = 'w-60'
const SIDEBAR_NARROW = 'w-14'

export type AppNavShellProps = {
  appTitle: string
  hasLogo: boolean
  visibleNav: NavEntry[]
  navSource: 'api' | 'fallback'
  navShellMode?: NavShellMode
  authUser: AuthUser | null
  loggedIn: boolean
  onOpenCommand: () => void
  onLogout: () => void
  /** แถบระบบ (impersonation, RBAC preview, เปลี่ยนรหัส) — คอลัมน์เนื้อหาเท่านั้น */
  bannerSlot?: ReactNode
  /** ประกาศจาก Admin — คอลัมน์เนื้อหาเท่านั้น ไม่ทับ sidebar */
  announcementSlot?: ReactNode
  children: ReactNode
}

function TopBarActions({
  loggedIn,
  onOpenCommand,
}: {
  loggedIn: boolean
  onOpenCommand: () => void
}) {
  return (
    <>
      {loggedIn ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="command-palette-trigger inline-flex gap-1.5 px-2 sm:px-3"
          data-tour="admin-command-hint"
          onClick={onOpenCommand}
          aria-label="เปิด command palette (Ctrl+K)"
        >
          <Search className="size-4 shrink-0 text-app-muted" aria-hidden />
          <span className="hidden text-body-sm sm:inline">ค้นหา</span>
          <CommandPaletteShortcutBadge className="hidden text-app-muted md:inline-flex" />
        </Button>
      ) : null}
      <ThemeToggle />
      {loggedIn ? (
        <AppNavbarUser />
      ) : (
        <Button size="sm" variant="outline" asChild>
          <NavLink to="/login">เข้าสู่ระบบ</NavLink>
        </Button>
      )}
    </>
  )
}

function SidebarPanel({
  appTitle,
  hasLogo,
  visibleNav,
  navSource,
  authUser,
  loggedIn,
  expanded,
  pinned,
  onTogglePin,
  onLogout,
  onLogin,
  onNavigate,
  showPin,
}: {
  appTitle: string
  hasLogo: boolean
  visibleNav: NavEntry[]
  navSource: 'api' | 'fallback'
  authUser: AuthUser | null
  loggedIn: boolean
  expanded: boolean
  pinned: boolean
  onTogglePin: () => void
  onLogout: () => void
  onLogin: () => void
  onNavigate?: () => void
  showPin?: boolean
}) {
  const collapsed = !expanded

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col">
      <PepsiStripe />
      <div
        className={cn(
          'app-sidebar-brand border-[var(--app-sidebar-border)]',
          expanded ? 'app-sidebar-brand--expanded' : 'app-sidebar-brand--collapsed',
        )}
      >
        {hasLogo ? (
          <img
            src={publicLogoUrl()}
            alt=""
            className="app-brand-logo-nav shrink-0 rounded-button object-contain"
          />
        ) : (
          <PepsiBrandMark size={expanded ? 'xl' : 'lg'} />
        )}
        <span
          className={cn(
            'app-sidebar-brand__title truncate text-[var(--app-sidebar-fg)] transition-opacity duration-150',
            collapsed && 'sr-only',
          )}
        >
          {appTitle}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-2">
        <NavMenuList
          entries={visibleNav}
          variant="sidebar"
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
        {navSource === 'fallback' && expanded ? (
          <p className="px-3 py-2 text-sidebar-muted">
            เมนู fallback (ไม่มี tbmenu)
          </p>
        ) : null}
      </div>

      <div className="shrink-0 space-y-2 border-t border-[var(--app-sidebar-border)] p-2">
        {showPin ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              'w-full text-[var(--app-sidebar-fg-muted)] hover:bg-[var(--app-sidebar-hover)] hover:text-[var(--app-sidebar-fg)]',
              collapsed ? 'justify-center px-0' : 'justify-start gap-2',
            )}
            onClick={onTogglePin}
            title={pinned ? 'ยกเลิกปักหมุดเมนู' : 'ปักหมุดเมนูค้างขยาย'}
            aria-pressed={pinned}
          >
            {pinned ? (
              <PinOff className="size-4 shrink-0" aria-hidden />
            ) : (
              <Pin className="size-4 shrink-0" aria-hidden />
            )}
            <span className={cn(collapsed && 'sr-only')}>
              {pinned ? 'ยกเลิกปักหมุด' : 'ปักหมุดเมนู'}
            </span>
          </Button>
        ) : null}

        {authUser && expanded ? (
          <p className="truncate px-1 text-xs text-[var(--app-sidebar-fg)]">
            {authUser.fullnameTh?.trim() || authUser.username}
            <span className="block text-sidebar-muted">
              {authUser.sysstatus}
            </span>
          </p>
        ) : null}

        {loggedIn ? (
          <Button
            type="button"
            variant="outline"
            title="ออกจากระบบ"
            className={cn(
              'border-[var(--app-sidebar-border)] bg-[var(--app-sidebar-hover)] text-[var(--app-sidebar-fg)] hover:bg-[var(--app-sidebar-active)]',
              collapsed ? 'w-full justify-center px-0' : 'w-full justify-start gap-2',
            )}
            onClick={onLogout}
          >
            <LogOut className="size-4 shrink-0" aria-hidden />
            <span className={cn(collapsed && 'sr-only')}>ออกจากระบบ</span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            title="เข้าสู่ระบบ"
            className={cn(
              'border-[var(--app-sidebar-border)] bg-[var(--app-sidebar-hover)] text-[var(--app-sidebar-fg)] hover:bg-[var(--app-sidebar-active)]',
              collapsed ? 'w-full justify-center px-0' : 'w-full justify-start gap-2',
            )}
            onClick={onLogin}
          >
            <LogIn className="size-4 shrink-0" aria-hidden />
            <span className={cn(collapsed && 'sr-only')}>เข้าสู่ระบบ</span>
          </Button>
        )}
      </div>
    </div>
  )
}

/** Sidebar: ยุบไอคอน · hover ขยาย · ปักหมุด (desktop) · drawer (mobile) */
export function AppNavShell(props: AppNavShellProps) {
  const {
    appTitle,
    hasLogo,
    visibleNav,
    navSource,
    navShellMode = 'sidebar',
    authUser,
    loggedIn,
    onOpenCommand,
    onLogout,
    bannerSlot,
    announcementSlot,
    children,
  } = props

  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  const navigate = useNavigate()
  const onLogin = () => navigate('/login')
  const {
    pinned,
    togglePinned,
    setHovered,
    desktopExpanded,
    mobileOpen,
    setMobileOpen,
  } = useSidebarState()

  /** sidebar + hamburger บน desktop ยังมีแถบซ้าย (ปักหมุดได้) — hamburger บนมือถือใช้ drawer */
  const showDesktopSidebar = navShellMode === 'sidebar' || navShellMode === 'hamburger'
  const showHeaderNav = navShellMode === 'navbar'
  const mobileDrawerOnly = navShellMode === 'hamburger' || navShellMode === 'sidebar'

  const closeMobile = () => setMobileOpen(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname, setMobileOpen])

  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [mobileOpen, setMobileOpen])

  const panelProps = {
    appTitle,
    hasLogo,
    visibleNav,
    navSource,
    authUser,
    loggedIn,
    onLogout,
    onLogin,
    onTogglePin: togglePinned,
  }

  const drawerOverlay = mobileOpen ? (
    <button
      type="button"
      className={cn(
        'fixed inset-0 z-40 bg-black/50',
        mobileDrawerOnly ? 'lg:hidden' : 'block',
      )}
      aria-label="ปิดเมนู"
      onClick={closeMobile}
    />
  ) : null

  const drawerAside = (
    <aside
      className={cn(
        'app-sidebar macos-sidebar app-sidebar--drawer fixed inset-y-0 left-0 z-50 flex w-[min(100vw-2rem,18rem)] flex-col overscroll-contain shadow-xl transition-transform duration-200 ease-out',
        showDesktopSidebar && 'lg:hidden',
        mobileOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none',
      )}
      aria-label="เมนูหลัก"
    >
      <div className="flex h-12 shrink-0 items-center justify-end border-b border-[var(--app-sidebar-border)] px-2">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="text-[var(--app-sidebar-fg)] hover:bg-[var(--app-sidebar-hover)]"
          onClick={closeMobile}
          aria-label="ปิดเมนู"
        >
          <X className="size-5" />
        </Button>
      </div>
      <SidebarPanel {...panelProps} expanded pinned={false} onNavigate={closeMobile} />
    </aside>
  )

  return (
    <div
      className={cn(
        'flex min-h-svh bg-[var(--app-bg)]',
        !isAdmin && 'app-theme-corporate',
        isAdmin && 'macos-admin',
        showHeaderNav && 'flex-col',
      )}
    >
      {/* Desktop sidebar (sidebar mode only) */}
      {showDesktopSidebar ? (
        <aside
          className={cn(
            'app-sidebar macos-sidebar relative z-30 hidden h-full min-h-0 shrink-0 flex-col overflow-hidden border-r border-[var(--app-sidebar-border)] transition-[width] duration-200 ease-out lg:flex',
            desktopExpanded ? SIDEBAR_WIDE : SIDEBAR_NARROW,
            !desktopExpanded && 'app-sidebar--collapsed',
            !pinned && !desktopExpanded && 'shadow-lg',
          )}
          aria-label="เมนูหลัก"
          data-collapsed={desktopExpanded ? 'false' : 'true'}
          onMouseEnter={() => !pinned && setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <SidebarPanel
            {...panelProps}
            expanded={desktopExpanded}
            pinned={pinned}
            showPin
          />
        </aside>
      ) : null}

      {drawerOverlay}
      {drawerAside}

      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col',
          isAdmin && 'app-shell--with-dock',
        )}
      >
        <header
          className={cn(
            'app-surface macos-topbar flex shrink-0 items-center gap-3 border-b px-4 py-2 shadow-sm',
          )}
        >
          {(mobileDrawerOnly || showHeaderNav) ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                mobileDrawerOnly && 'lg:hidden',
                showHeaderNav && 'md:hidden',
              )}
              onClick={() => setMobileOpen(true)}
              aria-label="เปิดเมนู"
              aria-expanded={mobileOpen}
            >
              <Menu className="size-5" />
            </Button>
          ) : null}
          {hasLogo ? (
            <img
              src={publicLogoUrl()}
              alt=""
              className={cn(
                'app-brand-logo-nav shrink-0 rounded-button object-contain',
                showHeaderNav ? 'hidden sm:block' : 'hidden md:block',
              )}
            />
          ) : !showHeaderNav ? (
            <PepsiBrandMark size="md" className="hidden md:inline-flex" />
          ) : null}
          <div
            className={cn(
              'flex min-w-0 items-center gap-2.5',
              showHeaderNav ? 'shrink-0' : 'min-w-0 flex-1',
            )}
          >
            <span
              className={cn(
                'app-topbar-brand-title truncate text-[var(--app-text)]',
                showHeaderNav ? 'hidden sm:inline' : 'inline',
              )}
            >
              {appTitle}
            </span>
            {!showHeaderNav ? (
              <span className="truncate text-body-sm text-[var(--app-text-muted)] md:hidden">
                PM/CM
              </span>
            ) : null}
          </div>
          {showHeaderNav ? (
            <div className="hidden min-w-0 flex-1 md:flex">
              <NavMenuList entries={visibleNav} variant="navbar" onNavigate={closeMobile} />
            </div>
          ) : null}
          <div className={cn('flex shrink-0 items-center gap-2', showHeaderNav && 'ml-auto')}>
            <TopBarActions loggedIn={loggedIn} onOpenCommand={onOpenCommand} />
          </div>
        </header>
        <Separator />
        {bannerSlot ? (
          <div className="app-shell-banners shrink-0" role="presentation">
            {bannerSlot}
          </div>
        ) : null}
        {announcementSlot}
        <main
          className={cn(
            'app-shell-main flex-1 overflow-auto',
            isAdmin && 'app-shell-main--with-dock',
          )}
        >
          {children}
        </main>
        <AppFooter dockSafe={isAdmin} />
        {isAdmin ? <MacosDock /> : null}
      </div>
    </div>
  )
}
