import { usePmChartsActions } from '@/features/pm-charts/PmChartsScopeContext'
import { useEffect } from 'react'

/** Register a page-level Excel report builder (data + chart images). */
export function usePmChartReportExport(builder: (() => Promise<void>) | null) {
  const { registerReportExporter } = usePmChartsActions()

  useEffect(() => {
    registerReportExporter(builder)
    return () => registerReportExporter(null)
  }, [registerReportExporter, builder])
}
