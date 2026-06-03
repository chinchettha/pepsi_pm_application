import { Button } from '@/components/ui/button'
import { useAppLocale } from '@/providers/I18nProvider'
import type { AppLocale } from '@/lib/app-locale'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

const OPTIONS: AppLocale[] = ['en', 'th']

type Props = {
  className?: string
}

export function LanguageSwitcher({ className }: Props) {
  const { locale, setLocale } = useAppLocale()
  const { t } = useTranslation()

  return (
    <div
      role="group"
      aria-label={t('language.switchAria')}
      className={cn(
        'inline-flex overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--app-border)_80%,transparent)] bg-[color-mix(in_srgb,var(--app-surface)_88%,white)] p-0.5 shadow-sm',
        className,
      )}
    >
      {OPTIONS.map((code) => (
        <Button
          key={code}
          type="button"
          size="sm"
          variant={locale === code ? 'default' : 'ghost'}
          className={cn(
            'h-9 min-w-[2.75rem] rounded-[10px] px-2.5 text-xs font-semibold tabular-nums',
            locale !== code && 'text-app-muted hover:text-app',
          )}
          aria-pressed={locale === code}
          onClick={() => setLocale(code)}
        >
          {code === 'en' ? t('language.en') : t('language.th')}
        </Button>
      ))}
    </div>
  )
}
