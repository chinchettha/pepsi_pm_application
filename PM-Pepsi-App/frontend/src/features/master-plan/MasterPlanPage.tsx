import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { hintsFromT } from '@/lib/i18n-hints'
import { EmptyState } from '@/components/ui/empty-state'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AppPageShell } from '@/components/layout/AppPageShell'
import { MasterPlanDisciplineView } from '@/features/master-plan/MasterPlanDisciplineView'
import { MasterPlanActionsBar } from '@/features/master-plan/MasterPlanActionsBar'
import { MasterPlanImportButton } from '@/features/master-plan/MasterPlanImportButton'
import {
  fetchMasterPlanSearch,
  fetchMasterPlanSearchGlobal,
  fetchMasterPlanWorkbook,
  type MasterPlanDiscipline,
  type MasterPlanSearchItem,
} from '@/lib/master-plan-api'
import { useMasterDataPermissions } from '@/lib/master-data-permissions'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { buildIw37nHref } from '@/features/iw37n/iw37n-href'
import { Link, useSearchParams } from 'react-router-dom'

const DISCIPLINES: MasterPlanDiscipline[] = ['EE', 'ME', 'PK']

const TAB_ID: Record<MasterPlanDiscipline, string> = {
  EE: 'pm-master-ee',
  ME: 'pm-master-me',
  PK: 'pm-master-pk',
}

function parseDiscipline(raw: string | null): MasterPlanDiscipline {
  const value = (raw ?? 'EE').trim().toUpperCase()
  if (value === 'ME' || value === 'PK') return value
  return 'EE'
}

export function MasterPlanPage() {
  const { t } = useTranslation('masterData')
  const { canRead } = useMasterDataPermissions()
  const [searchParams, setSearchParams] = useSearchParams()
  const discipline = parseDiscipline(searchParams.get('discipline'))
  const disciplineParam = searchParams.get('discipline')
  const qFromUrl = searchParams.get('q')?.trim() ?? ''
  const [deepLink, setDeepLink] = useState<{
    query: string
    jump?: MasterPlanSearchItem
  } | null>(null)

  useEffect(() => {
    if (!canRead || !qFromUrl) {
      setDeepLink(null)
      return
    }
    let cancelled = false
    void (async () => {
      try {
        const explicitDiscipline = disciplineParam
        if (explicitDiscipline) {
          const d = parseDiscipline(explicitDiscipline)
          const res = await fetchMasterPlanSearch(d, qFromUrl, 10)
          if (cancelled) return
          if (res.items[0]) {
            setDeepLink({ query: qFromUrl, jump: res.items[0] })
            return
          }
        }
        const res = await fetchMasterPlanSearchGlobal(qFromUrl, 10)
        if (cancelled) return
        const best = res.items[0]
        if (best?.discipline) {
          setSearchParams(
            (prev) => {
              const params = new URLSearchParams(prev)
              params.set('discipline', best.discipline!)
              return params
            },
            { replace: true },
          )
        }
        setDeepLink({ query: qFromUrl, jump: best })
      } catch {
        if (!cancelled) setDeepLink({ query: qFromUrl })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [canRead, qFromUrl, disciplineParam, setSearchParams])

  const workbookQ = useQuery({
    queryKey: ['master-plan', 'workbook', discipline],
    queryFn: () => fetchMasterPlanWorkbook(discipline),
    enabled: canRead,
  })

  const setDiscipline = useCallback(
    (next: MasterPlanDiscipline) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev)
          params.set('discipline', next)
          return params
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const pageHints = hintsFromT(t, 'masterPlanPage.hints')

  const clearMasterPlanDeepLink = () => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev)
        params.delete('q')
        return params
      },
      { replace: true },
    )
    setDeepLink(null)
  }

  const deepLinkJump = deepLink?.query === qFromUrl ? deepLink.jump : undefined

  if (!canRead) {
    return (
      <AppPageShell
        title={t('masterPlanPage.title')}
        description={t('masterPlanPage.description')}
        hints={pageHints}
      >
        <EmptyState
          icon={AlertCircle}
          title={t('page.noAccess')}
          description={
            <>
              {t('page.noAccessDesc')}{' '}
              <code className="text-xs">master-data.read</code>
            </>
          }
        />
      </AppPageShell>
    )
  }

  return (
    <AppPageShell
      title={t('masterPlanPage.title')}
      hints={pageHints}
      headerActions={
        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <MasterPlanImportButton onImported={setDiscipline} />
            <MasterPlanActionsBar discipline={discipline} />
          </div>
          {workbookQ.data ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Badge variant="secondary" className="text-xs tabular-nums">
                {t('masterPlanPage.planYear', { year: workbookQ.data.planYear })}
              </Badge>
              <Badge variant="outline" className="text-xs tabular-nums">
                {t('masterPlanPage.version', { no: workbookQ.data.versionNo })}
              </Badge>
              <span
                className="max-w-[min(100%,14rem)] truncate text-xs text-app-muted sm:max-w-xs"
                title={workbookQ.data.sourceFilename}
              >
                {workbookQ.data.sourceFilename}
              </span>
            </div>
          ) : null}
        </div>
      }
      stack={false}
    >
      {qFromUrl ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#2f5597]/25 bg-[#dae3f3]/40 px-3 py-2 text-xs text-[#1f3864]">
          <div className="space-y-0.5">
            <p>{t('masterPlanPage.deepLinkFromIw37n', { q: qFromUrl })}</p>
            {deepLinkJump ? (
              <p className="text-app-muted">
                {t('masterPlanPage.deepLinkJumpFound', {
                  rowNo: deepLinkJump.rowIndex,
                  discipline: deepLinkJump.discipline ?? discipline,
                })}
              </p>
            ) : deepLink?.query === qFromUrl ? (
              <p className="text-app-muted">{t('masterPlanPage.deepLinkJumpMissing')}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs" asChild>
              <Link to={buildIw37nHref(qFromUrl)}>{t('masterPlanPage.deepLinkOpenIw37n')}</Link>
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={clearMasterPlanDeepLink}>
              {t('masterPlanPage.deepLinkClear')}
            </Button>
          </div>
        </div>
      ) : null}
      <Tabs value={discipline} onValueChange={(v) => setDiscipline(v as MasterPlanDiscipline)}>
        <TabsList className="mb-3 flex h-auto max-w-full flex-wrap justify-start gap-1 rounded-lg border border-[#2f5597]/30 bg-[#dae3f3]/30 p-1">
          {DISCIPLINES.map((d) => (
            <TabsTrigger
              key={d}
              value={d}
              className="text-xs data-[state=active]:bg-[#2f5597] data-[state=active]:text-white sm:text-body-sm"
            >
              {t(`tabs.${TAB_ID[d]}` as 'tabs.pm-master-ee')}
            </TabsTrigger>
          ))}
        </TabsList>
        {DISCIPLINES.map((d) => (
          <TabsContent key={d} value={d} className="mt-0 space-y-0">
            <MasterPlanDisciplineView
              discipline={d}
              hideWorkbookSummary
              deepLink={deepLink?.query === qFromUrl ? deepLink : null}
              onImported={setDiscipline}
            />
          </TabsContent>
        ))}
      </Tabs>
    </AppPageShell>
  )
}
