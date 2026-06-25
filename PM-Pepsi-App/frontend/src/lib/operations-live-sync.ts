import type { QueryClient } from '@tanstack/react-query'

/** Auto-refresh operational views while the browser tab is visible (assign / close / calendar). */
export const OPERATIONS_LIVE_REFRESH_MS = 15_000

export const operationsLiveQueryOptions = {
  refetchInterval: OPERATIONS_LIVE_REFRESH_MS,
  refetchIntervalInBackground: false,
  refetchOnWindowFocus: true,
  staleTime: 5_000,
} as const

/** Invalidate shared views after assign, close, or move — same session + other tabs on next poll. */
export async function invalidateOperationsViews(qc: QueryClient): Promise<void> {
  await Promise.all([
    qc.invalidateQueries({ queryKey: ['plan-calendar'] }),
    qc.invalidateQueries({ queryKey: ['planning'] }),
    qc.invalidateQueries({ queryKey: ['calendar'] }),
    qc.invalidateQueries({ queryKey: ['personnel', 'me', 'dashboard'] }),
    qc.invalidateQueries({ queryKey: ['dashboard'] }),
    qc.invalidateQueries({ queryKey: ['work-orders'] }),
    qc.invalidateQueries({ queryKey: ['confirmation'] }),
    qc.invalidateQueries({ queryKey: ['reports-kpi'] }),
    qc.invalidateQueries({ queryKey: ['worktime'] }),
    qc.invalidateQueries({ queryKey: ['manhours'] }),
  ])
}
