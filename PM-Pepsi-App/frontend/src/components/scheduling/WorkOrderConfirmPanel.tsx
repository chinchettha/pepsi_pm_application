import type { workOrderConfirmQcSchema } from '@/api/schemas'
import {
  SchedulingPageSection,
} from '@/components/scheduling/SchedulingPageLayout'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { motion, useReducedMotion } from 'framer-motion'
import {
  BadgeCheck,
  Camera,
  Clock,
  MessageSquareText,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { z } from 'zod'

export type ConfirmSubTab = 'personnel-close' | 'close' | 'images' | 'comments'

type ConfirmQc = z.infer<typeof workOrderConfirmQcSchema>

type Props = {
  confirmQc?: ConfirmQc | null
  personnelCount: number
  supervisorCloseCount: number
  imageCount: number
  confirmTab: ConfirmSubTab
  onConfirmTabChange: (tab: ConfirmSubTab) => void
  qcPanel: ReactNode
  personnelClosePanel: ReactNode
  supervisorClosePanel: ReactNode
  imagesPanel: ReactNode
  commentsPanel: ReactNode
}

function statusTone(status: ConfirmQc['status']): string {
  if (status === 'approved') return 'bg-emerald-600/10 text-emerald-800'
  if (status === 'pending') return 'bg-amber-600/10 text-amber-900'
  if (status === 'rejected') return 'bg-red-600/10 text-red-800'
  return 'bg-app-subtle text-app-muted'
}

function SummaryStat({
  icon: Icon,
  label,
  value,
  active,
  onClick,
}: {
  icon: typeof Clock
  label: string
  value: number | string
  active?: boolean
  onClick?: () => void
}) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex min-w-[7rem] flex-1 items-center gap-2 rounded-button border px-3 py-2 text-left transition-all duration-200',
        active
          ? 'border-emerald-300/90 app-surface-panel shadow-sm ring-1 ring-emerald-200/80'
          : 'border-emerald-200/70 app-surface-panel--soft hover:border-emerald-300/80 hover:bg-[color-mix(in_srgb,var(--app-surface)_96%,var(--app-bg))]',
        onClick && 'cursor-pointer',
      )}
    >
      <Icon className="size-4 shrink-0 text-emerald-700" aria-hidden />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-800/65">{label}</p>
        <p className="text-sm font-bold tabular-nums text-emerald-950">{value}</p>
      </div>
    </Comp>
  )
}

export function WorkOrderConfirmPanel({
  confirmQc,
  personnelCount,
  supervisorCloseCount,
  imageCount,
  confirmTab,
  onConfirmTabChange,
  qcPanel,
  personnelClosePanel,
  supervisorClosePanel,
  imagesPanel,
  commentsPanel,
}: Props) {
  const { t } = useTranslation('scheduling')
  const reduceMotion = useReducedMotion()
  const qcLabel = confirmQc?.statusLabel ?? '—'

  return (
    <div className="space-y-4">
      <SchedulingPageSection index={0}>
        <motion.div
          layout={!reduceMotion}
          className="overflow-hidden rounded-card border border-emerald-200/90 bg-gradient-to-br from-emerald-50 via-[var(--app-surface)] to-[color-mix(in_srgb,var(--app-accent)_4%,var(--app-surface))] p-4 shadow-[var(--app-shadow-card)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800/70">
                <ShieldCheck className="size-3.5" aria-hidden />
                {t('woConfirm.title')}
              </p>
              <p className="mt-0.5 text-body-sm text-app-muted">{t('woConfirm.subtitle')}</p>
            </div>
            <Badge className={cn('shrink-0 border-0', statusTone(confirmQc?.status ?? null))}>
              {qcLabel}
            </Badge>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <SummaryStat
              icon={UserCheck}
              label={t('woConfirm.personnelTime')}
              value={personnelCount}
              active={confirmTab === 'personnel-close'}
              onClick={() => onConfirmTabChange('personnel-close')}
            />
            <SummaryStat
              icon={Clock}
              label={t('woConfirm.close')}
              value={supervisorCloseCount}
              active={confirmTab === 'close'}
              onClick={() => onConfirmTabChange('close')}
            />
            <SummaryStat
              icon={Camera}
              label={t('woConfirm.images')}
              value={imageCount}
              active={confirmTab === 'images'}
              onClick={() => onConfirmTabChange('images')}
            />
            <SummaryStat
              icon={BadgeCheck}
              label="QC"
              value={confirmQc?.readyForReview ? t('woConfirm.readyForReview') : qcLabel}
              active={confirmTab === 'personnel-close' && confirmQc?.status === 'pending'}
            />
          </div>
        </motion.div>
      </SchedulingPageSection>

      {qcPanel}

      <Tabs value={confirmTab} onValueChange={(v) => onConfirmTabChange(v as ConfirmSubTab)}>
        <TabsList className="app-tabs-scroll scheduling-wo-tabs flex h-auto w-full max-w-full flex-nowrap justify-start gap-1 overflow-x-auto rounded-xl border border-app/60 bg-app-subtle/50 p-1">
          <TabsTrigger value="personnel-close" className="shrink-0 gap-1.5 rounded-lg">
            <UserCheck className="size-3.5" aria-hidden />
            {t('woConfirm.personnelTime')}{personnelCount > 0 ? ` (${personnelCount})` : ''}
          </TabsTrigger>
          <TabsTrigger value="close" className="shrink-0 gap-1.5 rounded-lg">
            <Clock className="size-3.5" aria-hidden />
            {t('woConfirm.close')}{supervisorCloseCount > 0 ? ` (${supervisorCloseCount})` : ''}
          </TabsTrigger>
          <TabsTrigger value="images" className="shrink-0 gap-1.5 rounded-lg">
            <Camera className="size-3.5" aria-hidden />
            {t('woConfirm.images')}{imageCount > 0 ? ` (${imageCount})` : ''}
          </TabsTrigger>
          <TabsTrigger value="comments" className="shrink-0 gap-1.5 rounded-lg">
            <MessageSquareText className="size-3.5" aria-hidden />
            {t('woConfirm.notesTab')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personnel-close" className="mt-4 space-y-3">
          {personnelClosePanel}
        </TabsContent>
        <TabsContent value="close" className="mt-4 space-y-3">
          {supervisorClosePanel}
        </TabsContent>
        <TabsContent value="images" className="mt-4 space-y-3">
          {imagesPanel}
        </TabsContent>
        <TabsContent value="comments" className="mt-4 space-y-3">
          {commentsPanel}
        </TabsContent>
      </Tabs>
    </div>
  )
}
