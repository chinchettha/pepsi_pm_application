import { AppCard } from '@/components/layout/AppCard'
import { clearStoredAuth, logoutWithApi } from '@/features/auth/login-api'
import { Loader2, LogOut } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

/** เทียบ `index.php?module=logout` / `logout.php` */
export function LogoutPage() {
  const navigate = useNavigate()

  useEffect(() => {
    void (async () => {
      try {
        await logoutWithApi()
        toast.success('ออกจากระบบแล้ว')
      } catch {
        clearStoredAuth()
      } finally {
        navigate('/login', { replace: true })
      }
    })()
  }, [navigate])

  return (
    <div className="flex min-h-svh items-center justify-center bg-app-subtle p-6">
      <AppCard pad="compact" className="w-full max-w-sm text-center shadow-md">
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="flex size-12 items-center justify-center rounded-full bg-app-muted/80 text-app-muted">
            <LogOut className="size-6" aria-hidden />
          </div>
          <p className="text-body-sm font-medium text-app">กำลังออกจากระบบ</p>
          <p className="text-caption text-app-muted">กรุณารอสักครู่…</p>
          <Loader2 className="size-8 animate-spin text-[var(--app-accent,#007AFF)]" aria-hidden />
        </div>
      </AppCard>
    </div>
  )
}
