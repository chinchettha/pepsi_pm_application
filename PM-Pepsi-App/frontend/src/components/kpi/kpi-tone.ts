import { cn } from '@/lib/utils'

/** โทนกล่อง KPI ใน FilterDetail / calendar / WO — ตรง Team A/B/P + WorkOrder สรุป */
export type KpiStatTone = 'default' | 'amber' | 'emerald' | 'rose' | 'info'

const KPI_TONE_CLASS: Record<KpiStatTone, string> = {
  default: 'border-app bg-app-subtle',
  amber: 'border-amber-200 bg-amber-50',
  emerald: 'border-emerald-200 bg-emerald-50',
  rose: 'border-rose-200 bg-rose-50',
  info: 'app-tone-info border',
}

export function kpiStatToneClass(tone: KpiStatTone = 'default', className?: string) {
  return cn('rounded-card border p-3 text-body-sm text-app', KPI_TONE_CLASS[tone], className)
}
