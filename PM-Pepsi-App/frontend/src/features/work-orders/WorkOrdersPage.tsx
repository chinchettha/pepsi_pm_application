import { CanPermission } from '@/components/auth/CanPermission'
import { AppPageContent } from '@/components/layout/AppPageContent'
import { SchedulingFilterShell } from '@/components/scheduling/SchedulingFilterLayout'
import {
  SchedulingCalendarPanel,
  SchedulingFilterActions,
  SchedulingPageHeader,
  SchedulingPageSection,
  SchedulingPageStack,
  schedulingHeroLinkBtnClass,
  schedulingHeroLinkIconClass,
} from '@/components/scheduling/SchedulingPageLayout'
import { WoConfirmationLegendSection } from '@/components/scheduling/SchedulingLegends'
import { WorkOrderAutocomplete } from '@/components/scheduling/WorkOrderAutocomplete'
import { WorkOrderDetailDialog } from '@/components/scheduling/WorkOrderDetailDialog'
import { MassConfirmSearchCard } from '@/features/confirmation/MassConfirmSearchCard'
import { WoConfirmationTable } from '@/components/work-orders/WoConfirmationTable'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { postWorkOrdersSearch } from '@/lib/api-public'
import { usePermission } from '@/lib/use-permission'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  BadgeCheck,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  LayoutList,
  Upload,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

export function WorkOrdersPage() {
  const { t } = useTranslation('workOrders')
  const { t: tc } = useTranslation('common')
  const { id: routeId } = useParams()
  const [searchText, setSearchText] = useState('')
  const [submittedQ, setSubmittedQ] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    if (!routeId) return
    setOpenId(routeId)
    setSubmittedQ(routeId)
    setSearchText(routeId)
  }, [routeId])

  const canRead = usePermission('work-orders.read')
  const canMassConfirm = usePermission('confirmation.read')

  const searchPayload = useMemo(
    () => ({
      q: submittedQ.trim() || undefined,
      activity: [] as string[],
      wktype: [] as string[],
      status: [] as string[],
      wkctr: [] as string[],
      team: [] as string[],
      functionalloc: [] as string[],
      equipment: [] as string[],
    }),
    [submittedQ],
  )

  const listQ = useQuery({
    queryKey: ['work-orders', 'search', submittedQ],
    queryFn: () => postWorkOrdersSearch(searchPayload),
    enabled: canRead && submittedQ.trim().length >= 2,
    placeholderData: keepPreviousData,
  })

  const rows = listQ.data ?? []
  const hasSearch = submittedQ.trim().length >= 2
  const searchCollapsedHint = submittedQ.trim()
    ? t('search.collapsedHint', { q: submittedQ.trim() })
    : undefined

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    const next = searchText.trim()
    if (next.length < 2) return
    setSubmittedQ(next)
  }

  const clearSearch = () => {
    setSearchText('')
    setSubmittedQ('')
  }

  if (!canRead) {
    return (
      <>
        <SchedulingPageHeader title={t('page.title')} icon={CheckCircle2} />
        <AppPageContent>
          <EmptyState
            icon={AlertCircle}
            title={t('page.noAccessTitle')}
            description={
              <>
                {t('page.noAccessDesc')}{' '}
                <code className="text-xs">work-orders.read</code>
              </>
            }
          />
        </AppPageContent>
      </>
    )
  }

  return (
    <>
      <SchedulingPageHeader
        title={t('page.title')}
        icon={CheckCircle2}
        hints={[
          t('page.hintSearchWo'),
          t('page.hintMassConfirm'),
          t('page.hintApproveTeco'),
          t('page.hintPhotos'),
        ]}
      >
        <CanPermission permission="confirmation.read">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={schedulingHeroLinkBtnClass}
            asChild
          >
            <Link to="/confirmation">
              <BadgeCheck className={schedulingHeroLinkIconClass} aria-hidden />
              {t('links.exportConfirmation')}
            </Link>
          </Button>
        </CanPermission>
        <CanPermission permission="calendar.read">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={schedulingHeroLinkBtnClass}
            asChild
          >
            <Link to="/calendar">
              <CalendarRange className={schedulingHeroLinkIconClass} aria-hidden />
              {t('links.workSchedulingCalendar')}
            </Link>
          </Button>
        </CanPermission>
        <CanPermission permission="backlog.read">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={schedulingHeroLinkBtnClass}
            asChild
          >
            <Link to="/backlog">
              <LayoutList className={schedulingHeroLinkIconClass} aria-hidden />
              {t('links.backlog')}
            </Link>
          </Button>
        </CanPermission>
        <CanPermission permission="iw37n.read">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={schedulingHeroLinkBtnClass}
            asChild
          >
            <Link to="/iw37n">
              <Upload className={schedulingHeroLinkIconClass} aria-hidden />
              {t('links.importIw37n')}
            </Link>
          </Button>
        </CanPermission>
      </SchedulingPageHeader>

      <AppPageContent className="scheduling-page pb-8">
        <SchedulingPageStack>
          <SchedulingPageSection index={0}>
            <form onSubmit={onSearch}>
              <SchedulingFilterShell
                title={t('search.filterTitle')}
                collapsible
                defaultOpen={false}
                collapsedHint={searchCollapsedHint}
                actions={
                  <SchedulingFilterActions
                    onClear={clearSearch}
                    submitLabel={tc('actions.search')}
                    clearLabel={t('search.clear')}
                  />
                }
              >
                <div className="max-w-xl space-y-1.5">
                  <Label
                    htmlFor="wo-confirm-q"
                    className="text-xs font-semibold tracking-wide text-app-muted"
                  >
                    {t('search.orderNumberLabel')}
                  </Label>
                  <WorkOrderAutocomplete
                    value={searchText}
                    showSearchIcon
                    inputClassName="h-10 border-app/80 bg-[var(--app-surface)] shadow-sm transition-shadow focus-visible:shadow-md"
                    onInputChange={setSearchText}
                    onSelect={(item) => {
                      setSearchText(item.wkorder)
                      setSubmittedQ(item.wkorder)
                    }}
                    placeholder={t('search.placeholder')}
                  />
                </div>
              </SchedulingFilterShell>
            </form>
          </SchedulingPageSection>

          {canMassConfirm ? (
            <SchedulingPageSection index={1}>
              <MassConfirmSearchCard collapsible defaultOpen={false} />
            </SchedulingPageSection>
          ) : null}

          <SchedulingPageSection index={canMassConfirm ? 2 : 1}>
            <WoConfirmationLegendSection collapsible defaultOpen={false} />
          </SchedulingPageSection>

          <SchedulingPageSection index={canMassConfirm ? 3 : 2}>
            {!hasSearch ? (
              <EmptyState
                icon={ClipboardList}
                title={t('search.emptyTitle')}
                description={t('search.emptyDescription')}
              />
            ) : listQ.isLoading && !listQ.data ? (
              <Skeleton
                className="h-[28rem] w-full rounded-card"
                aria-label={t('search.loadingListAria')}
              />
            ) : listQ.isError ? (
              <EmptyState
                icon={AlertCircle}
                title={t('search.loadFailedTitle')}
                description={
                  listQ.error instanceof Error
                    ? listQ.error.message
                    : t('search.loadFailedFallback')
                }
                action={{ label: tc('actions.retry'), onClick: () => void listQ.refetch() }}
              />
            ) : (
              <SchedulingCalendarPanel
                title={t('search.listTitle')}
                subtitle={t('search.listSubtitle', { q: submittedQ })}
                eventCount={rows.length}
                isRefreshing={listQ.isFetching && !listQ.isLoading}
              >
                <WoConfirmationTable
                  rows={rows}
                  isLoading={false}
                  onOpenRow={setOpenId}
                />
              </SchedulingCalendarPanel>
            )}
          </SchedulingPageSection>
        </SchedulingPageStack>
      </AppPageContent>

      <WorkOrderDetailDialog
        orderId={openId}
        initialTab="confirm"
        onOpenChange={(o) => !o && setOpenId(null)}
      />
    </>
  )
}
