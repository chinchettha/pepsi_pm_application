import { Button } from '@/components/ui/button'
import {
  downloadBlob,
  fetchPmChartDesignExportXlsx,
  postPmChartDesignImport,
} from '@/lib/pm-charts-api'
import { usePermission } from '@/lib/use-permission'
import { useQueryClient } from '@tanstack/react-query'
import { Download, Loader2, Upload } from 'lucide-react'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

type PmChartsActionsContextValue = {
  registerReportExporter: (handler: (() => Promise<void>) | null) => void
  triggerReportExport: () => Promise<void>
  isSaving: boolean
  setSaving: (v: boolean) => void
  updatedAt: string | null
  setUpdatedAt: (v: string | null) => void
}

const PmChartsActionsContext = createContext<PmChartsActionsContextValue | null>(null)

export function PmChartsScopeProvider({ children }: { children: ReactNode }) {
  const reportExporterRef = useRef<(() => Promise<void>) | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)

  const setSaving = useCallback((v: boolean) => {
    setIsSaving(v)
  }, [])

  const registerReportExporter = useCallback((handler: (() => Promise<void>) | null) => {
    reportExporterRef.current = handler
  }, [])

  const triggerReportExport = useCallback(async () => {
    const fn = reportExporterRef.current
    if (!fn) {
      toast.message('Open a PM chart tab first')
      return
    }
    await fn()
  }, [])

  const actionsValue = useMemo(
    () => ({
      registerReportExporter,
      triggerReportExport,
      isSaving,
      setSaving,
      updatedAt,
      setUpdatedAt,
    }),
    [registerReportExporter, triggerReportExport, isSaving, setSaving, updatedAt],
  )

  return (
    <PmChartsActionsContext.Provider value={actionsValue}>{children}</PmChartsActionsContext.Provider>
  )
}

export function usePmChartsActions() {
  const ctx = useContext(PmChartsActionsContext)
  if (!ctx) throw new Error('usePmChartsActions outside provider')
  return ctx
}

export function PmChartsToolbar() {
  const { t } = useTranslation('pmCharts')
  const { triggerReportExport, isSaving, updatedAt, setUpdatedAt } = usePmChartsActions()
  const canWrite = usePermission('confirmation.write')
  const qc = useQueryClient()
  const [exporting, setExporting] = useState(false)
  const [exportingReport, setExportingReport] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onExport = async () => {
    setExporting(true)
    try {
      const blob = await fetchPmChartDesignExportXlsx()
      downloadBlob(blob, 'PMChartDesign.xlsx')
      toast.success(t('actions.exportOk'))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('actions.exportFailed'))
    } finally {
      setExporting(false)
    }
  }

  const onImportFile = async (file: File) => {
    setImporting(true)
    try {
      const result = await postPmChartDesignImport(file)
      await qc.invalidateQueries({ queryKey: ['pm-chart'] })
      if (result.savedAt) {
        setUpdatedAt(result.savedAt)
      }
      const dupTotal = Object.values(result.mergeStats ?? {}).reduce(
        (sum, s) => sum + (s?.duplicatesSkipped ?? 0),
        0,
      )
      toast.success(t('actions.importSaved', { count: result.imported.length }))
      if (dupTotal > 0) {
        toast.message(t('actions.importDuplicates', { count: dupTotal }))
      }
      const parseIssues = result.issues.filter((issue) => !issue.includes(':'))
      if (parseIssues.length > 0) {
        toast.message(t('actions.importPartial'), { description: parseIssues.join(' · ') })
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('actions.importFailed'))
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const onExportReport = async () => {
    setExportingReport(true)
    try {
      await triggerReportExport()
      toast.success(t('actions.exportReportOk'))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('actions.exportReportFailed'))
    } finally {
      setExportingReport(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-app/50 bg-[var(--app-surface)] p-3 shadow-[var(--app-shadow-card)]">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void onImportFile(file)
        }}
      />
      <div className="flex min-h-8 min-w-[10rem] flex-col justify-center">
        <p className="text-[10px] text-app-muted">
          {isSaving ? (
            <span className="inline-flex items-center gap-1">
              <Loader2 className="size-3 animate-spin" aria-hidden />
              {t('toolbar.saving')}
            </span>
          ) : updatedAt ? (
            t('toolbar.lastSaved', { time: new Date(updatedAt).toLocaleString() })
          ) : (
            <span aria-hidden="true">&nbsp;</span>
          )}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" disabled={exporting} onClick={() => void onExport()}>
          {exporting ? (
            <Loader2 className="mr-1 size-4 animate-spin" aria-hidden />
          ) : (
            <Download className="mr-1 size-4" aria-hidden />
          )}
          {t('actions.exportXlsx')}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={exportingReport}
          onClick={() => void onExportReport()}
        >
          {exportingReport ? (
            <Loader2 className="mr-1 size-4 animate-spin" aria-hidden />
          ) : (
            <Download className="mr-1 size-4" aria-hidden />
          )}
          {t('actions.exportReport')}
        </Button>
        {canWrite ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={importing}
            onClick={() => fileInputRef.current?.click()}
          >
            {importing ? (
              <Loader2 className="mr-1 size-4 animate-spin" aria-hidden />
            ) : (
              <Upload className="mr-1 size-4" aria-hidden />
            )}
            {t('actions.importXlsx')}
          </Button>
        ) : null}
      </div>
    </div>
  )
}