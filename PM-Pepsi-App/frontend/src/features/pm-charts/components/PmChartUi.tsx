import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export function PmChartSection({
  title,
  subtitle,
  children,
  className,
}: {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-card border border-app/60 bg-[var(--app-surface)] shadow-[var(--app-shadow-card)]',
        className,
      )}
    >
      {title ? (
        <header className="border-b border-app/50 bg-[color-mix(in_srgb,var(--app-surface)_92%,var(--app-accent)_8%)] px-4 py-3">
          <h2 className="text-sm font-semibold tracking-tight text-app">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs text-app-muted">{subtitle}</p> : null}
        </header>
      ) : null}
      <div className="p-4">{children}</div>
    </section>
  )
}

export function PmChartNumericInput({
  value,
  onChange,
  className,
  placeholder = '—',
}: {
  value: number | null
  onChange: (value: number | null) => void
  className?: string
  placeholder?: string
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      step="any"
      className={cn(
        'h-8 w-full min-w-[3.5rem] rounded-md border border-app/50 bg-white px-2 text-center text-xs tabular-nums text-app outline-none transition focus:border-[var(--app-accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--app-accent)_25%,transparent)] dark:bg-[var(--app-surface-elevated)]',
        value != null && 'bg-[color-mix(in_srgb,#7AC943_12%,white)] dark:bg-[color-mix(in_srgb,#7AC943_10%,var(--app-surface-elevated))]',
        className,
      )}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => {
        const raw = e.target.value.trim()
        if (raw === '') {
          onChange(null)
          return
        }
        const n = Number(raw)
        onChange(Number.isFinite(n) ? n : null)
      }}
    />
  )
}

export function PmChartTableShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto rounded-md border border-app/40', className)}>
      <table className="w-full min-w-[720px] border-collapse text-xs">{children}</table>
    </div>
  )
}

export function PmChartChartGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">{children}</div>
  )
}

export function PmChartPlot({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div
      data-pm-chart-plot
      data-pm-chart-title={title}
      className={cn('rounded-md border border-app/40 bg-white p-3 dark:bg-[var(--app-surface-elevated)]', className)}
    >
      <p data-pm-chart-title className="mb-2 text-center text-xs font-semibold text-app">
        {title}
      </p>
      <div className="h-[260px]">{children}</div>
    </div>
  )
}
