import { useTranslation } from 'react-i18next'

type Props = {
  orderId: string | null
  wkorderLabel: string
  canWrite: boolean
  loading: boolean
}

export function PmVibrationStatusBanner({ orderId, wkorderLabel, canWrite, loading }: Props) {
  const { t } = useTranslation('pmVibration')

  const items: { ok: boolean; text: string }[] = [
    {
      ok: Boolean(orderId),
      text: orderId
        ? t('statusWoSelected', { wkorder: wkorderLabel || orderId })
        : t('statusWoMissing'),
    },
    {
      ok: canWrite,
      text: canWrite ? t('statusCanWrite') : t('noWritePermission'),
    },
    {
      ok: !loading || !orderId,
      text: loading ? t('statusLoading') : t('statusReady'),
    },
  ]

  return (
    <div
      className="app-tone-info-callout rounded-card border p-4 text-sm text-app"
      role="status"
      aria-live="polite"
    >
      <h2 className="font-bold">{t('statusTitle')}</h2>
      <p className="mt-1 text-xs text-app-muted">{t('statusIntro')}</p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.text} className="flex items-start gap-2">
            <span
              className={
                item.ok
                  ? 'app-tone-success-fill mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold'
                  : 'app-tone-warning-fill mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold'
              }
              aria-hidden
            >
              {item.ok ? '✓' : '!'}
            </span>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
