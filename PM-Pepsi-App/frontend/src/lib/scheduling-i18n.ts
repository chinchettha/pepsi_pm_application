import type { ActivityDisplayMode } from '@/components/scheduling/CalendarColorLegend'
import { BRAND_CALENDAR, BRAND_LEGEND_TINT } from '@/lib/brand-palette'
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
      color: BRAND_CALENDAR.inProgress,
      label: t('colors.inProgress'),
      title: t('colors.inProgressTitle'),
    },
    {
      color: BRAND_CALENDAR.moved,
      label: t('colors.moved'),
      title: t('colors.movedTitle'),
    },
    {
      color: BRAND_CALENDAR.completed,
      label: t('colors.done'),
      title: t('colors.doneTitle'),
    },
  ] as const
}

export function weekendLegendItems(t: TFunction<'scheduling'>) {
  return [
    { color: BRAND_LEGEND_TINT.sunday, label: t('colors.sunday'), title: t('colors.sundayTitle') },
    { color: BRAND_LEGEND_TINT.saturday, label: t('colors.saturday'), title: t('colors.saturdayTitle') },
  ] as const
}

/** Extended calendar legend (backlog / WO pages) — includes overdue + TECO */
export function woCalendarColorLegendItems(t: TFunction<'scheduling'>) {
  return [
    {
      color: BRAND_CALENDAR.inProgress,
      label: t('colors.inProgress'),
      title: t('calendarLegend.inProgressTitleExt'),
    },
    {
      color: BRAND_CALENDAR.overdue,
      label: t('calendarLegend.overdue'),
      title: t('calendarLegend.overdueTitle'),
    },
    {
      color: BRAND_CALENDAR.moved,
      label: t('colors.moved'),
      title: t('calendarLegend.movedTitleExt'),
    },
    {
      color: BRAND_CALENDAR.completed,
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
