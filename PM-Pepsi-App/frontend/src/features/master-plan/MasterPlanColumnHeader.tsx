import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { resolveMasterPlanColumnHintKey } from '@/features/master-plan/master-plan-column-hints'
import { masterPlanVirtualColumnLabelKey } from '@/features/master-plan/master-plan-virtual-columns'
import { HelpCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const TOOLTIP_CLASS =
  'z-[250] max-w-[min(22rem,92vw)] border-slate-200 bg-white px-3 py-2.5 text-left text-xs leading-relaxed text-slate-800 shadow-lg [color-scheme:light]'

type MasterPlanColumnHeaderProps = {
  column: string
  className?: string
  virtual?: boolean
}

export function MasterPlanColumnHeader({ column, className, virtual }: MasterPlanColumnHeaderProps) {
  const { t } = useTranslation('masterData')
  const virtualKey = virtual ? masterPlanVirtualColumnLabelKey(column) : null
  if (virtualKey) {
    const hintKey = virtualKey === 'lastClosed' ? 'lastClosed' : 'nextDue'
    const hint = t(`masterPlan.columnHint.${hintKey}`)
    const label = t(`masterPlan.virtualColumns.${virtualKey}`)
    const title = t('masterPlan.columnHintTitle', { column: label })
    return (
      <TooltipProvider delayDuration={200}>
        <span className={`inline-flex max-w-full items-center gap-1 whitespace-nowrap ${className ?? ''}`}>
          <span>{label}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="inline-flex shrink-0 rounded-full p-0.5 text-white/90 ring-1 ring-white/30 hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                aria-label={t('masterPlan.columnHintAria', { column: label })}
              >
                <HelpCircle className="size-3.5" aria-hidden />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="center" className={TOOLTIP_CLASS}>
              <p className="text-[11px] font-bold text-[#1f3864]">{title}</p>
              <p className="mt-1.5 whitespace-pre-line text-slate-700">{hint}</p>
            </TooltipContent>
          </Tooltip>
        </span>
      </TooltipProvider>
    )
  }

  const hintKey = resolveMasterPlanColumnHintKey(column)

  if (!hintKey) {
    return <span className={`whitespace-nowrap ${className ?? ''}`}>{column}</span>
  }

  const hint = t(`masterPlan.columnHint.${hintKey}`)
  const title = t('masterPlan.columnHintTitle', { column })

  return (
    <TooltipProvider delayDuration={200}>
      <span className={`inline-flex max-w-full items-center gap-1 whitespace-nowrap ${className ?? ''}`}>
        <span>{column}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex shrink-0 rounded-full p-0.5 text-white/90 ring-1 ring-white/30 hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              aria-label={t('masterPlan.columnHintAria', { column })}
            >
              <HelpCircle className="size-3.5" aria-hidden />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="center" className={TOOLTIP_CLASS}>
            <p className="text-[11px] font-bold text-[#1f3864]">{title}</p>
            <p className="mt-1.5 whitespace-pre-line text-slate-700">{hint}</p>
          </TooltipContent>
        </Tooltip>
      </span>
    </TooltipProvider>
  )
}
