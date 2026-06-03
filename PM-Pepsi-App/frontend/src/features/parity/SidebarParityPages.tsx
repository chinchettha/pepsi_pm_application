import { PageHeader } from '@/components/layout/PageHeader'
import { PlaceholderBlock } from '@/components/layout/PlaceholderBlock'
import { Button } from '@/components/ui/button'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function Shell({
  title,
  description,
  phpModules,
  hint,
}: {
  title: string
  description: string
  phpModules: string[]
  hint?: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <div>
      <PageHeader title={title} description={description} />
      <PlaceholderBlock title={t('parity.shellTitle')}>
        <ul className="list-inside list-disc space-y-1">
          {phpModules.map((m) => (
            <li key={m}>
              <code className="rounded bg-app-muted px-1">{m}</code>
            </li>
          ))}
        </ul>
        {hint ? <div className="mt-4">{hint}</div> : null}
      </PlaceholderBlock>
    </div>
  )
}

/** `W_summary_weekly*.php` */
export function SummaryWeeklyParityPage() {
  const { t } = useTranslation()
  return (
    <Shell
      title={t('parity.summaryWeeklyTitle')}
      description={t('parity.summaryWeeklyDesc')}
      phpModules={['W_summary_weekly.php', 'W_summary_weekly_chart.php', 'W_summary_weekly_chart_full.php']}
      hint={
        <Button variant="outline" size="sm" asChild>
          <Link to="/summary-weekly">{t('parity.summaryWeeklyLink')}</Link>
        </Button>
      }
    />
  )
}
