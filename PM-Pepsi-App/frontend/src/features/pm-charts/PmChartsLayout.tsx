import { AppPageSection, AppPageShell } from '@/components/layout/AppPageShell'
import { PmChartsScopeProvider, PmChartsToolbar } from '@/features/pm-charts/PmChartsScopeContext'
import { PmChartPeriodProvider } from '@/features/pm-charts/PmChartPeriodContext'
import { PmChartsPeriodControls } from '@/features/pm-charts/PmChartsPeriodControls'
import { cn } from '@/lib/utils'
import { Activity, Flame, Waves } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { to: '/pm-charts/vibration', icon: Waves, key: 'vibration' as const },
  { to: '/pm-charts/current', icon: Activity, key: 'current' as const },
  { to: '/pm-charts/combustion', icon: Flame, key: 'combustion' as const },
]

export function PmChartsLayout() {
  const { t } = useTranslation('pmCharts')

  return (
    <PmChartsScopeProvider>
      <PmChartPeriodProvider>
      <AppPageShell
        title={t('layout.title')}
        description={t('layout.description')}
        hints={[t('layout.hintManual'), t('layout.hintCharts'), t('layout.hintSave'), t('layout.hintImport')]}
      >
        <AppPageSection>
          <PmChartsToolbar />
        </AppPageSection>
        <AppPageSection>
          <PmChartsPeriodControls />
        </AppPageSection>
        <AppPageSection>
          <PmChartsTabNav />
        </AppPageSection>
        <Outlet />
      </AppPageShell>
      </PmChartPeriodProvider>
    </PmChartsScopeProvider>
  )
}

function PmChartsTabNav() {
  const { t } = useTranslation('pmCharts')

  return (
        <nav
          className="flex flex-wrap gap-2 rounded-card border border-app/50 bg-[var(--app-surface)] p-2 shadow-[var(--app-shadow-card)]"
          aria-label={t('layout.navLabel')}
        >
          {tabs.map(({ to, icon: Icon, key }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-2 rounded-button px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-[var(--app-accent)] text-white shadow-sm'
                    : 'text-app-muted hover:bg-[color-mix(in_srgb,var(--app-accent)_8%,transparent)] hover:text-app',
                )
              }
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {t(`tabs.${key}`)}
            </NavLink>
          ))}
        </nav>
  )
}
