import { AnnouncementBanner } from '@/components/layout/AnnouncementBanner'
import { AppNavShell } from '@/components/layout/AppNavShell'
import { useAppNav } from '@/lib/use-app-nav'
import { usePublicSettings } from '@/providers/SettingsProvider'
import { ImpersonationBanner } from '@/components/layout/ImpersonationBanner'
import {
  AUTH_CHANGED_EVENT,
  getStoredAuthUser,
  isLoggedIn,
} from '@/features/auth/login-api'
import {
  AppCommandPalette,
  useCommandPaletteShortcut,
} from '@/components/command-palette/AppCommandPalette'
import { Button } from '@/components/ui/button'
import {
  clearRbacPreview,
  getRbacPreviewSnapshot,
  subscribeRbacPreview,
} from '@/lib/rbac-preview'
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

function RbacPreviewBanner({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const preview = useSyncExternalStore(subscribeRbacPreview, getRbacPreviewSnapshot, () => null)
  if (!preview) return null
  return (
    <div className="app-tone-info flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2 text-body-sm">
      <span>
        จำลองสิทธิ์ role <strong>{preview.roleCode}</strong> ({preview.roleName}) —{' '}
        {preview.permissions.length} permissions
      </span>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="border-[color-mix(in_srgb,var(--app-accent)_55%,var(--app-border))]"
        onClick={() => {
          clearRbacPreview()
          navigate('/admin/roles')
        }}
      >
        หยุดจำลอง
      </Button>
    </div>
  )
}

export function AppShell() {
  const navigate = useNavigate()
  const [loggedIn, setLoggedIn] = useState(() => isLoggedIn())
  const authUser = loggedIn ? getStoredAuthUser() : null
  const { entries: visibleNav, source: navSource } = useAppNav()
  const { settings } = usePublicSettings()
  const appTitle = settings?.appName?.trim() || 'PM Pepsi'
  const [commandOpen, setCommandOpen] = useState(false)
  useCommandPaletteShortcut(useCallback(() => setCommandOpen(true), []))

  useEffect(() => {
    const sync = () => setLoggedIn(isLoggedIn())
    window.addEventListener(AUTH_CHANGED_EVENT, sync)
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, sync)
  }, [])

  const goLogout = useCallback(() => {
    navigate('/logout')
  }, [navigate])

  const bannerSlot = (
    <>
      <ImpersonationBanner />
      <RbacPreviewBanner navigate={navigate} />
      {authUser?.passMustChange ? (
        <div className="border-b border-blue-200 bg-blue-50 px-4 py-2 text-body-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-100">
          บัญชีนี้ต้องเปลี่ยนรหัสผ่าน —{' '}
          <a href="/settings" className="font-medium underline">
            ไปที่ตั้งค่า → โปรไฟล์
          </a>
        </div>
      ) : null}
    </>
  )

  return (
    <>
      <AppNavShell
        appTitle={appTitle}
        hasLogo={Boolean(settings?.hasLogo)}
        visibleNav={visibleNav}
        navSource={navSource}
        navShellMode={settings?.navShellMode ?? 'sidebar'}
        authUser={authUser}
        loggedIn={loggedIn}
        onOpenCommand={() => setCommandOpen(true)}
        onLogout={goLogout}
        bannerSlot={bannerSlot}
        announcementSlot={<AnnouncementBanner />}
      >
        <Outlet />
      </AppNavShell>
      {loggedIn ? (
        <AppCommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      ) : null}
    </>
  )
}
