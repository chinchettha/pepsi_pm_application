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
      className="rounded-card border border-slate-300 bg-white p-4 font-sans text-sm text-slate-900"
      role="status"
      aria-live="polite"
    >
      <h2 className="font-bold">{t('statusTitle')}</h2>
      <p className="mt-1 text-xs text-slate-600">{t('statusIntro')}</p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.text} className="flex items-start gap-2">
            <span
              className={
                item.ok
                  ? 'mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white'
                  : 'mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-white'
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
