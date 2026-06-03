import type { ActivityDisplayMode } from '@/components/scheduling/CalendarColorLegend'
import type { PmExecutionStatus } from '@/lib/wo-pm-execution'
import { PM_EXECUTION_META } from '@/lib/wo-pm-execution'
import type { TFunction } from 'i18next'

export function activityDisplayOptions(t: TFunction<'scheduling'>): ReadonlyArray<{
  value: ActivityDisplayMode
  label: string
}> {
  return [
    { value: 'all', label: t('activity.all') },
    { value: 'Z1', label: t('activity.Z1') },
    { value: 'Z2', label: t('activity.Z2') },
    { value: 'Z5', label: t('activity.Z5') },
  ]
}

export function calendarColorLegendItems(t: TFunction<'scheduling'>) {
  return [
    {
      color: '#9333ea',
      label: t('colors.inProgress'),
      title: t('colors.inProgressTitle'),
    },
    {
      color: '#f97316',
      label: t('colors.moved'),
      title: t('colors.movedTitle'),
    },
    {
      color: '#16a34a',
      label: t('colors.done'),
      title: t('colors.doneTitle'),
    },
  ] as const
}

export function weekendLegendItems(t: TFunction<'scheduling'>) {
  return [
    { color: '#fecdd3', label: t('colors.sunday'), title: t('colors.sundayTitle') },
    { color: '#bfdbfe', label: t('colors.saturday'), title: t('colors.saturdayTitle') },
  ] as const
}

/** Extended calendar legend (backlog / WO pages) — includes overdue + TECO */
export function woCalendarColorLegendItems(t: TFunction<'scheduling'>) {
  return [
    {
      color: '#9333ea',
      label: t('colors.inProgress'),
      title: t('calendarLegend.inProgressTitleExt'),
    },
    {
      color: '#dc2626',
      label: t('calendarLegend.overdue'),
      title: t('calendarLegend.overdueTitle'),
    },
    {
      color: '#f97316',
      label: t('colors.moved'),
      title: t('calendarLegend.movedTitleExt'),
    },
    {
      color: '#16a34a',
      label: t('colors.done'),
      title: t('calendarLegend.doneTitleExt'),
    },
  ] as const
}

export function pmExecutionMeta(t: TFunction<'scheduling'>, status: PmExecutionStatus) {
  const base = PM_EXECUTION_META[status]
  return {
    ...base,
    label: t(`pmExecution.${status}.label`),
    title: t(`pmExecution.${status}.title`),
  }
}
