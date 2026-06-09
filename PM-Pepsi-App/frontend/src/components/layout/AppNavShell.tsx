import type { AuthUser } from '@/api/schemas'
import { PepsiBrandMark } from '@/components/brand/PepsiBrandMark'
import { PepsiStripe } from '@/components/brand/PepsiStripe'
import { AppFooter } from '@/components/layout/AppFooter'
import { AppTopbarBrand } from '@/components/layout/AppTopbarBrand'
import { AppNavbarUser } from '@/components/layout/AppNavbarUser'
import type { NavEntry } from '@/components/layout/nav-config'
import { NavMenuList } from '@/components/layout/NavMenuList'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { Button } from '@/components/ui/button'
import { publicLogoUrl } from '@/lib/settings-api'
import { useSidebarState } from '@/lib/use-sidebar-state'
import { cn } from '@/lib/utils'
import { CommandPaletteShortcutBadge } from '@/components/command-palette/CommandPaletteShortcutBadge'
import { LogIn, LogOut, LayoutGrid, Menu, Pin, PinOff, Search, X } from 'lucide-react'
import type { NavShellMode } from '@/api/schemas'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { resolveRoleDisplayLabel } from '@/lib/role-display'
import { useAppLocale } from '@/providers/I18nProvider'
import { useTranslation } from 'react-i18next'
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
  /** แสดงปุ่มกลับ Portal เมื่อ user มี >1 module */
  showPortalLink?: boolean
  children: ReactNode
}

function TopBarActions({
  loggedIn,
  onOpenCommand,
  showPortalLink = false,
}: {
  loggedIn: boolean
  onOpenCommand: () => void
  showPortalLink?: boolean
}) {
  const { t } = useTranslation(['common', 'portal'])
  return (
    <div className="app-topbar-actions flex items-center gap-1.5 sm:gap-2">
      {loggedIn && showPortalLink ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-11 gap-2 rounded-xl border-[color-mix(in_srgb,var(--app-border)_80%,transparent)] bg-[color-mix(in_srgb,var(--app-surface)_88%,white)] px-3 shadow-sm"
          asChild
        >
          <NavLink to="/portal">
            <LayoutGrid className="size-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">{t('portal:backToPortal')}</span>
          </NavLink>
        </Button>
      ) : null}
      {loggedIn ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="command-palette-trigger h-11 gap-2 rounded-xl border-[color-mix(in_srgb,var(--app-border)_80%,transparent)] bg-[color-mix(in_srgb,var(--app-surface)_88%,white)] px-3 shadow-sm transition-all hover:border-[color-mix(in_srgb,var(--app-accent)_22%,var(--app-border))] hover:bg-[var(--app-surface)] hover:shadow-md sm:min-w-[11rem] md:min-w-[13rem]"
          data-tour="admin-command-hint"
          onClick={onOpenCommand}
          aria-label={t('commandPalette.aria')}
        >
          <Search className="size-4 shrink-0 text-[var(--app-accent)]" aria-hidden />
          <span className="hidden flex-1 text-left text-body-sm text-app-muted sm:inline">
            {t('actions.search')}
          </span>
          <CommandPaletteShortcutBadge className="hidden text-app-muted md:inline-flex" />
        </Button>
      ) : null}
      <LanguageSwitcher />
      <ThemeToggle className="app-topbar-icon-btn size-11 shrink-0 rounded-xl border border-[color-mix(in_srgb,var(--app-border)_80%,transparent)] bg-[color-mix(in_srgb,var(--app-surface)_88%,white)] shadow-sm hover:bg-[var(--app-surface)] hover:shadow-md" />
      {loggedIn ? (
        <AppNavbarUser />
      ) : (
        <Button size="sm" variant="outline" className="rounded-xl shadow-sm" asChild>
          <NavLink to="/login">{t('actions.login')}</NavLink>
        </Button>
      )}
    </div>
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
  const { t } = useTranslation()
  const { locale } = useAppLocale()
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
            'app-sidebar-brand__title min-w-0 overflow-hidden truncate text-[var(--app-sidebar-fg)] whitespace-nowrap transition-[opacity,max-width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
            collapsed ? 'max-w-0 opacity-0' : 'max-w-[12rem] opacity-100',
          )}
          aria-hidden={collapsed}
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
            title={pinned ? t('nav.unpinMenuTitle') : t('nav.pinMenuTitle')}
            aria-pressed={pinned}
          >
            {pinned ? (
              <PinOff className="size-4 shrink-0" aria-hidden />
            ) : (
              <Pin className="size-4 shrink-0" aria-hidden />
            )}
            <span
              className={cn(
                'overflow-hidden whitespace-nowrap transition-[opacity,max-width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                collapsed ? 'max-w-0 opacity-0' : 'max-w-[10rem] opacity-100',
              )}
              aria-hidden={collapsed}
            >
              {pinned ? t('nav.unpinMenu') : t('nav.pinMenu')}
            </span>
          </Button>
        ) : null}

        {authUser && expanded ? (
          <p className="truncate px-1 text-xs text-[var(--app-sidebar-fg)]">
            {authUser.fullnameTh?.trim() || authUser.username}
            <span className="block text-sidebar-muted">
              {resolveRoleDisplayLabel(authUser, locale)}
            </span>
          </p>
        ) : null}

        {loggedIn ? (
          <Button
            type="button"
            variant="outline"
            title={t('actions.logout')}
            className={cn(
              'border-[var(--app-sidebar-border)] bg-[var(--app-sidebar-hover)] text-[var(--app-sidebar-fg)] hover:bg-[var(--app-sidebar-active)]',
              collapsed ? 'w-full justify-center px-0' : 'w-full justify-start gap-2',
            )}
            onClick={onLogout}
          >
            <LogOut className="size-4 shrink-0" aria-hidden />
            <span
              className={cn(
                'overflow-hidden whitespace-nowrap transition-[opacity,max-width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                collapsed ? 'max-w-0 opacity-0' : 'max-w-[8rem] opacity-100',
              )}
              aria-hidden={collapsed}
            >
              {t('actions.logout')}
            </span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            title={t('actions.login')}
            className={cn(
              'border-[var(--app-sidebar-border)] bg-[var(--app-sidebar-hover)] text-[var(--app-sidebar-fg)] hover:bg-[var(--app-sidebar-active)]',
              collapsed ? 'w-full justify-center px-0' : 'w-full justify-start gap-2',
            )}
            onClick={onLogin}
          >
            <LogIn className="size-4 shrink-0" aria-hidden />
            <span
              className={cn(
                'overflow-hidden whitespace-nowrap transition-[opacity,max-width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                collapsed ? 'max-w-0 opacity-0' : 'max-w-[8rem] opacity-100',
              )}
              aria-hidden={collapsed}
            >
              {t('actions.login')}
            </span>
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
    showPortalLink = false,
    children,
  } = props

  const { t } = useTranslation()
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
        'fixed inset-0 z-40 bg-black/50 animate-in fade-in duration-200',
        mobileDrawerOnly ? 'lg:hidden' : 'block',
      )}
      aria-label={t('actions.closeMenu')}
      onClick={closeMobile}
    />
  ) : null

  const drawerAside = (
    <aside
      className={cn(
        'app-sidebar macos-sidebar app-sidebar--drawer fixed inset-y-0 left-0 z-50 flex w-[min(100vw-2rem,18rem)] flex-col overscroll-contain shadow-xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        showDesktopSidebar && 'lg:hidden',
        mobileOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none',
      )}
      aria-label={t('nav.mainMenu')}
    >
      <div className="flex h-12 shrink-0 items-center justify-end border-b border-[var(--app-sidebar-border)] px-2">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="text-[var(--app-sidebar-fg)] hover:bg-[var(--app-sidebar-hover)]"
          onClick={closeMobile}
          aria-label={t('actions.closeMenu')}
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
            'app-sidebar macos-sidebar relative z-30 hidden h-full min-h-0 shrink-0 flex-col overflow-hidden border-r border-[var(--app-sidebar-border)] transition-[width,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex',
            desktopExpanded ? SIDEBAR_WIDE : SIDEBAR_NARROW,
            !desktopExpanded && 'app-sidebar--collapsed',
            !pinned && !desktopExpanded && 'shadow-lg',
          )}
          aria-label={t('nav.mainMenu')}
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

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className={cn(
            'app-surface macos-topbar sticky top-0 z-40 flex shrink-0 items-center gap-3 px-4 py-2.5 sm:px-5',
          )}
        >
          {(mobileDrawerOnly || showHeaderNav) ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                'size-10 rounded-xl',
                mobileDrawerOnly && 'lg:hidden',
                showHeaderNav && 'md:hidden',
              )}
              onClick={() => setMobileOpen(true)}
              aria-label={t('actions.openMenu')}
              aria-expanded={mobileOpen}
            >
              <Menu className="size-5" />
            </Button>
          ) : null}
        <div className={cn(
          showHeaderNav ? 'shrink-0' : 'min-w-0 flex-1',
        )}>
          <AppTopbarBrand
            appTitle={appTitle}
            hasLogo={hasLogo}
            showHeaderNav={showHeaderNav}
          />
        </div>
          {showHeaderNav ? (
            <div className="hidden min-w-0 flex-1 md:flex">
              <NavMenuList entries={visibleNav} variant="navbar" onNavigate={closeMobile} />
            </div>
          ) : null}
          <div className={cn('flex shrink-0 items-center', showHeaderNav && 'ml-auto')}>
            <TopBarActions
              loggedIn={loggedIn}
              onOpenCommand={onOpenCommand}
              showPortalLink={showPortalLink}
            />
          </div>
        </header>
        {bannerSlot ? (
          <div className="app-shell-banners shrink-0" role="presentation">
            {bannerSlot}
          </div>
        ) : null}
        {announcementSlot}
        <main className="app-shell-main flex-1 overflow-auto">
          {children}
        </main>
        <AppFooter />
      </div>
    </div>
  )
}
