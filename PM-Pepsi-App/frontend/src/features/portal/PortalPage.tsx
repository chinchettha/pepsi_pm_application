import { ModulePortalCard } from '@/components/portal/ModulePortalCard'
import { PortalShell } from '@/components/portal/PortalShell'
import { portalGridMotion } from '@/features/portal/portal-motion'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, useReducedMotion } from 'framer-motion'
import { getStoredAuthUser } from '@/features/auth/login-api'
import { toastError } from '@/lib/app-toast'
import { resolvePostLoginPathForUserst } from '@/lib/primary-roles'
import { fetchPortalModules, type PortalModule } from '@/lib/portal-api'
import {
  isPortalAutoSkipEnabled,
  isPortalEnabled,
  PORTAL_DEFERRED_PATH_KEY,
  PORTAL_PATH,
} from '@/lib/portal-enabled'
import { useQuery } from '@tanstack/react-query'
import { LayoutGrid } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

function PortalSkeleton() {
  return (
    <div className="portal-page__grid">
      {[1, 2, 3].map((n) => (
        <Skeleton key={n} className="min-h-[11.5rem] rounded-card" />
      ))}
    </div>
  )
}

function PortalModuleGrid({
  modules,
  onOpen,
}: {
  modules: PortalModule[]
  onOpen: (mod: PortalModule) => void
}) {
  const reduceMotion = useReducedMotion()
  const Wrapper = reduceMotion ? 'div' : motion.div
  const wrapperProps = reduceMotion
    ? { className: 'portal-page__grid' }
    : { className: 'portal-page__grid', ...portalGridMotion }

  return (
    <Wrapper {...wrapperProps}>
      {modules.map((mod, index) => (
        <ModulePortalCard
          key={mod.code}
          module={mod}
          motionIndex={index}
          onOpen={() => onOpen(mod)}
        />
      ))}
    </Wrapper>
  )
}

export function PortalPage() {
  const { t, i18n } = useTranslation(['portal', 'common'])
  const navigate = useNavigate()

  const q = useQuery({
    queryKey: ['portal-modules'],
    queryFn: fetchPortalModules,
    staleTime: 60_000,
    retry: 1,
  })

  useEffect(() => {
    if (!isPortalAutoSkipEnabled() || !q.data?.autoRedirect) return
    const target = q.data.autoRedirect
    if (target.startsWith('http://') || target.startsWith('https://')) {
      window.location.assign(target)
      return
    }
    navigate(target, { replace: true })
  }, [q.data?.autoRedirect, navigate])

  const openModule = useCallback(
    (mod: PortalModule) => {
      const localeIsTh = i18n.language.startsWith('th')
      const name = localeIsTh ? mod.nameTh : mod.nameEn

      if (!mod.ready) {
        toast.info(t('toast.comingSoon', { name }))
        return
      }

      if (mod.code === 'pm') {
        const deferred = sessionStorage.getItem(PORTAL_DEFERRED_PATH_KEY)
        sessionStorage.removeItem(PORTAL_DEFERRED_PATH_KEY)
        const user = getStoredAuthUser()
        const target =
          deferred && deferred !== PORTAL_PATH
            ? deferred
            : mod.entryUrl || resolvePostLoginPathForUserst(user?.userst, '/plan-calendar')
        navigate(target)
        return
      }

      if (mod.external && mod.entryUrl) {
        window.location.assign(mod.entryUrl)
        return
      }

      toast.info(t('toast.comingSoon', { name }))
    },
    [i18n.language, navigate, t],
  )

  if (!isPortalEnabled()) {
    const user = getStoredAuthUser()
    return <Navigate to={resolvePostLoginPathForUserst(user?.userst, '/plan-calendar')} replace />
  }

  if (
    q.isLoading ||
    (isPortalAutoSkipEnabled() && q.data?.autoRedirect && q.data.modules.length === 1)
  ) {
    return (
      <PortalShell>
        <PortalSkeleton />
      </PortalShell>
    )
  }

  if (q.isError) {
    return (
      <PortalShell>
        <EmptyState
          icon={LayoutGrid}
          title={t('noModules.title')}
          description={q.error instanceof Error ? q.error.message : t('noModules.description')}
          action={{
            label: t('common:actions.retry'),
            onClick: () => {
              void q.refetch().catch((err) => {
                toastError(err instanceof Error ? err.message : String(err))
              })
            },
          }}
        />
      </PortalShell>
    )
  }

  const modules = q.data?.modules ?? []

  if (modules.length === 0) {
    return (
      <PortalShell>
        <EmptyState
          icon={LayoutGrid}
          title={t('noModules.title')}
          description={t('noModules.description')}
          action={{
            label: t('noModules.openSettings'),
            onClick: () => navigate('/settings'),
          }}
        />
      </PortalShell>
    )
  }

  return (
    <PortalShell>
      <PortalModuleGrid modules={modules} onOpen={openModule} />
    </PortalShell>
  )
}
