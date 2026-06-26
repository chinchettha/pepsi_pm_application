import { SchedulingSection } from '@/components/scheduling/SchedulingPageLayout'
import { Button } from '@/components/ui/button'
import { Activity, Flame, LineChart, Waves } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const CHART_LINKS = [
  { to: '/pm-charts/vibration', icon: Waves, key: 'vibration' as const },
  { to: '/pm-charts/current', icon: Activity, key: 'current' as const },
  { to: '/pm-charts/combustion', icon: Flame, key: 'combustion' as const },
] as const

export function WorkOrderPmChartLinks() {
  const { t } = useTranslation(['scheduling', 'pmCharts'])

  return (
    <SchedulingSection
      icon={LineChart}
      title={t('woDialog.pmChartLinks.title')}
      description={t('woDialog.pmChartLinks.description')}
      bodyClassName="flex flex-wrap gap-2"
    >
      {CHART_LINKS.map(({ to, icon: Icon, key }) => (
        <Button key={key} type="button" size="sm" variant="outline" className="gap-1.5" asChild>
          <Link to={to}>
            <Icon className="size-3.5" aria-hidden />
            {t(`pmCharts:tabs.${key}`)}
          </Link>
        </Button>
      ))}
    </SchedulingSection>
  )
}
