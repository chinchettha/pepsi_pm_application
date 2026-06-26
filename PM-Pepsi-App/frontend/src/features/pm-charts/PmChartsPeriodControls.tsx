import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePmChartPeriod } from '@/features/pm-charts/PmChartPeriodContext'
import type { PmChartPeriod } from '@/features/pm-charts/pm-chart-period'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

const PERIODS: PmChartPeriod[] = ['daily', 'weekly', 'monthly', 'yearly']

export function PmChartsPeriodControls() {
  const { t } = useTranslation('pmCharts')
  const { period, setPeriod, from, to, setFrom, setTo } = usePmChartPeriod()

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-card border border-app/50 bg-[var(--app-surface)] p-3 shadow-[var(--app-shadow-card)]">
      <div>
        <Label className="text-xs text-app-muted">{t('period.label')}</Label>
        <div className="mt-1 flex flex-wrap gap-1" role="group" aria-label={t('period.label')}>
          {PERIODS.map((p) => (
            <Button
              key={p}
              type="button"
              size="sm"
              variant={period === p ? 'default' : 'outline'}
              className={cn('h-8 text-xs', period === p && 'shadow-sm')}
              onClick={() => setPeriod(p)}
            >
              {t(`period.${p}`)}
            </Button>
          ))}
        </div>
      </div>
      <div className="min-w-[9rem]">
        <Label htmlFor="pm-chart-from" className="text-xs text-app-muted">
          {t('period.from')}
        </Label>
        <Input
          id="pm-chart-from"
          type="date"
          className="mt-1 h-9 text-sm"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
      </div>
      <div className="min-w-[9rem]">
        <Label htmlFor="pm-chart-to" className="text-xs text-app-muted">
          {t('period.to')}
        </Label>
        <Input
          id="pm-chart-to"
          type="date"
          className="mt-1 h-9 text-sm"
          value={to}
          min={from}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>
      <p className="pb-1 text-[10px] text-app-muted">{t('period.hint')}</p>
    </div>
  )
}
