import { clearStoredAuth, logoutWithApi } from '@/features/auth/login-api'
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
    <div className="flex min-h-svh items-center justify-center bg-zinc-100 text-sm text-zinc-600">
      กำลังออกจากระบบ…
    </div>
  )
}
