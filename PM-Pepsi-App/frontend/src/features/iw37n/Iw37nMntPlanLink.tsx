import type { Iw37nItem } from '@/api/schemas'
import { Badge } from '@/components/ui/badge'
import { buildMasterPlanHref } from '@/features/master-plan/master-plan-href'
import { usePermission } from '@/lib/use-permission'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

type Iw37nMntPlanLinkProps = {
  item: Iw37nItem
  className?: string
}

/** MntPlan cell — links to Master Plan Maintenance plan row when permitted. */
export function Iw37nMntPlanLink({ item, className }: Iw37nMntPlanLinkProps) {
  const { t } = useTranslation('integration')
  const canOpenMasterPlan = usePermission('master-data.read')
  const label = item.mntplan.trim()
  const href = buildMasterPlanHref({
    masterPlanMntplan: item.masterPlanMntplan,
    masterPlanDiscipline: item.masterPlanDiscipline,
    mntplan: item.mntplan,
    sapCode: item.sapCode,
  })

  if (!label) {
    return <span className="text-app-muted/60">—</span>
  }

  const targetPlan = (item.masterPlanMntplan || item.mntplan).trim()
  const title =
    item.masterPlanLinked && targetPlan && targetPlan !== label
      ? t('iw37nPage.masterPlanLinkTitle', { mntplan: label, maintenancePlan: targetPlan })
      : item.masterPlanLinked
        ? t('iw37nPage.masterPlanLinkTitleExact', { mntplan: label })
        : t('iw37nPage.masterPlanUnlinkedTitle', { mntplan: label })

  if (!canOpenMasterPlan || !href) {
    return (
      <span className={cn('font-mono text-[11px] font-semibold tabular-nums text-[#1f3864]', className)}>
        {label}
      </span>
    )
  }

  return (
    <div className="flex flex-col items-start gap-0.5">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'font-mono text-[11px] font-semibold tabular-nums tracking-tight text-[#2f5597]',
          'underline decoration-[#2f5597]/40 underline-offset-2 hover:text-[#1f3864]',
          className,
        )}
        title={title}
      >
        {label}
      </a>
      {!item.masterPlanLinked ? (
        <Badge
          variant="outline"
          className="px-1 py-0 text-[9px] font-medium text-amber-800 ring-1 ring-amber-200 bg-amber-50"
          title={t('iw37nPage.table.masterPlanUnlinkedHint')}
        >
          {t('iw37nPage.table.masterPlanUnlinked')}
        </Badge>
      ) : null}
    </div>
  )
}