import { getStoredAuthUser } from '@/features/auth/login-api'
import {
  apiNavItemsToEntries,
  collectNavPaths,
  fetchNavMenu,
  getFallbackNav,
} from '@/lib/nav-menu-api'
import { filterNavForUser } from '@/lib/nav-rbac'
import type { NavEntry } from '@/components/layout/nav-config'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

export function useAppNav() {
  const authUser = getStoredAuthUser()
  const q = useQuery({
    queryKey: ['nav-menu', authUser?.userst],
    queryFn: fetchNavMenu,
    enabled: Boolean(authUser),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const entries: NavEntry[] = useMemo(() => {
    if (!authUser) return []
    if (q.data && q.data.items.length > 0) {
      // เซิร์ฟเวอร์กรอง menuright แล้วใน listNavMenuForUser — ไม่กรองซ้ำฝั่ง client
      return apiNavItemsToEntries(q.data.items)
    }
    return filterNavForUser(authUser.userst, getFallbackNav())
  }, [authUser, q.data])

  const allowedPaths = useMemo(() => collectNavPaths(entries), [entries])

  return {
    entries,
    allowedPaths,
    isLoading: q.isLoading,
    isError: q.isError,
    source: q.data && q.data.items.length > 0 ? ('api' as const) : ('fallback' as const),
  }
}
