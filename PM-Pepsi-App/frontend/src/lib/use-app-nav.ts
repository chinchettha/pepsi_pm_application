import {
  apiNavItemsToEntries,
  collectNavPaths,
  fetchNavMenu,
  getFallbackNav,
  supplementNavFromFallback,
} from '@/lib/nav-menu-api'
import { effectivePermissions } from '@/lib/permissions'
import { filterNavForUser } from '@/lib/nav-rbac'
import { getRbacPreviewSnapshot, subscribeRbacPreview } from '@/lib/rbac-preview'
import { useAuthUser } from '@/lib/use-permission'
import type { NavEntry } from '@/components/layout/nav-config'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useSyncExternalStore } from 'react'

function useRbacPreview() {
  return useSyncExternalStore(subscribeRbacPreview, getRbacPreviewSnapshot, () => null)
}

export function useAppNav() {
  const authUser = useAuthUser()
  const preview = useRbacPreview()
  const navPerms = effectivePermissions(authUser)
  const permissionKey = `${preview?.roleCode ?? ''}|${navPerms?.join('|') ?? ''}`

  const q = useQuery({
    queryKey: ['nav-menu', authUser?.userst, permissionKey],
    queryFn: fetchNavMenu,
    enabled: Boolean(authUser),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const entries: NavEntry[] = useMemo(() => {
    if (!authUser) return []
    const base =
      q.data && q.data.items.length > 0
        ? supplementNavFromFallback(apiNavItemsToEntries(q.data.items), getFallbackNav())
        : getFallbackNav()
    const navUserst = preview?.roleCode ?? authUser.userst
    return filterNavForUser(navUserst, base, navPerms, {
      rbacStrict: (navPerms?.length ?? 0) > 0,
    })
  }, [authUser, permissionKey, q.data])

  const allowedPaths = useMemo(() => collectNavPaths(entries), [entries])

  return {
    entries,
    allowedPaths,
    isLoading: q.isLoading,
    isError: q.isError,
    source: q.data && q.data.items.length > 0 ? ('api' as const) : ('fallback' as const),
  }
}
