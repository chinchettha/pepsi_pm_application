import {
  fetchPmChartSheet,
  PM_CHART_SCOPE_KEY,
  savePmChartSheet,
  type PmChartSheetKey,
} from '@/lib/pm-charts-api'
import { usePermission } from '@/lib/use-permission'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { usePmChartsActions } from './PmChartsScopeContext'

const AUTO_SAVE_MS = 1500

function cloneEmpty<T>(empty: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(empty)
  }
  return JSON.parse(JSON.stringify(empty)) as T
}

export function usePmChartPersistence<T>(opts: {
  sheetKey: PmChartSheetKey
  emptyDefault: T
  serialize: (data: T) => Record<string, unknown>
  deserialize: (payload: Record<string, unknown>) => T
  data: T
  onLoad: (data: T) => void
  /** Extra React deps that affect serialized payload (e.g. year, machine). */
  saveExtraDeps?: unknown[]
}) {
  const { setUpdatedAt, setSaving } = usePmChartsActions()
  const canWrite = usePermission('confirmation.write')
  const { t } = useTranslation('pmCharts')
  const dataRef = useRef(opts.data)
  dataRef.current = opts.data

  const emptyRef = useRef(opts.emptyDefault)
  emptyRef.current = opts.emptyDefault
  const onLoadRef = useRef(opts.onLoad)
  onLoadRef.current = opts.onLoad
  const deserializeRef = useRef(opts.deserialize)
  deserializeRef.current = opts.deserialize
  const serializeRef = useRef(opts.serialize)
  serializeRef.current = opts.serialize

  const loadDoneRef = useRef(false)
  const savedSignatureRef = useRef<string | null>(null)

  const q = useQuery({
    queryKey: ['pm-chart', opts.sheetKey, PM_CHART_SCOPE_KEY],
    queryFn: () => fetchPmChartSheet(opts.sheetKey),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  })

  useEffect(() => {
    loadDoneRef.current = false
    savedSignatureRef.current = null
  }, [opts.sheetKey])

  useEffect(() => {
    if (!q.data?.payload) return

    const incomingSig = JSON.stringify(q.data.payload)
    if (loadDoneRef.current && incomingSig === savedSignatureRef.current) {
      if (q.data.updatedAt) setUpdatedAt(q.data.updatedAt)
      return
    }

    onLoadRef.current(deserializeRef.current(q.data.payload))
    setUpdatedAt(q.data.updatedAt)
    savedSignatureRef.current = incomingSig
    loadDoneRef.current = true
  }, [q.data, setUpdatedAt])

  useEffect(() => {
    if (!q.isError) return
    onLoadRef.current(cloneEmpty(emptyRef.current))
    setUpdatedAt(null)
    savedSignatureRef.current = JSON.stringify(serializeRef.current(cloneEmpty(emptyRef.current)))
    loadDoneRef.current = true
  }, [q.isError, setUpdatedAt])

  const saveMut = useMutation({
    mutationFn: () =>
      savePmChartSheet(opts.sheetKey, {
        payload: serializeRef.current(dataRef.current),
      }),
    onSuccess: (res) => {
      setUpdatedAt(res.updatedAt)
      savedSignatureRef.current = JSON.stringify(serializeRef.current(dataRef.current))
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t('actions.saveFailed'))
    },
  })

  useEffect(() => {
    setSaving(saveMut.isPending)
    return () => setSaving(false)
  }, [saveMut.isPending, setSaving])

  const extraDeps = opts.saveExtraDeps ?? []
  const extraKey = JSON.stringify(extraDeps)

  useEffect(() => {
    if (!loadDoneRef.current || !canWrite || q.isLoading) return

    const signature = JSON.stringify(serializeRef.current(dataRef.current))
    if (signature === savedSignatureRef.current) return

    const timer = window.setTimeout(() => {
      const latest = JSON.stringify(serializeRef.current(dataRef.current))
      if (latest === savedSignatureRef.current || saveMut.isPending) return
      saveMut.mutate()
    }, AUTO_SAVE_MS)

    return () => window.clearTimeout(timer)
  }, [opts.data, canWrite, q.isLoading, saveMut.isPending, saveMut.mutate, extraKey])

  return {
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    isSaving: saveMut.isPending,
  }
}
