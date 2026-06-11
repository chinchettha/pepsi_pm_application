import { CanPermission } from '@/components/auth/CanPermission'
import { ConfirmQcPendingQueue } from '@/components/confirmation/ConfirmQcPendingQueue'
import { ConfirmationExportTablePanel } from '@/components/confirmation/ConfirmationExportTablePanel'
import { AppPageContent } from '@/components/layout/AppPageContent'
import {
  SchedulingPageHeader,
  SchedulingPageSection,
  SchedulingPageStack,
  SchedulingSection,
  schedulingHeroLinkBtnClass,
  schedulingHeroLinkIconClass,
} from '@/components/scheduling/SchedulingPageLayout'
import { MassConfirmSearchCard } from '@/features/confirmation/MassConfirmSearchCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ConfirmationImportResponse } from '@/api/schemas'
import { getStoredAuthUser } from '@/features/auth/login-api'
import { postConfirmationImport } from '@/lib/api-public'
import {
  listKpiStaggerItemMotion,
  listKpiStaggerRootMotion,
} from '@/lib/list-kpi-stagger'
import { usePermission } from '@/lib/use-permission'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'framer-motion'
import { AlertCircle, BadgeCheck, ClipboardCheck, Upload } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export function ConfirmationPage() {
  const { t } = useTranslation('confirmation')
  const reduceMotion = useReducedMotion()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const authUser = getStoredAuthUser()
  const isAdmin = (authUser?.userst ?? '').trim() === 'A'
  const canRead = usePermission('confirmation.read')
  const canImportConfirm = usePermission('confirmation.import') || isAdmin
  const canExport =
    usePermission('confirmation.export') ||
    usePermission('confirmation.import') ||
    isAdmin
  const canMassConfirm = usePermission('confirmation.write') || isAdmin

  const [importResult, setImportResult] = useState<ConfirmationImportResponse | null>(null)
  const importFileRef = useRef<HTMLInputElement>(null)

  const pageHints = [
    t('page.hintExportSap'),
    t('page.hintMassConfirm'),
    t('page.hintImportConfirm'),
    t('page.hintQcQueue'),
    t('page.hintCsv'),
  ]

  const importMut = useMutation({
    mutationFn: (file: File) => postConfirmationImport(file),
    onSuccess: async (res) => {
      setImportResult(res)
      const ok = res.inserted + res.updated
      const failTotal = res.skipped + res.errors
      if (failTotal === 0) {
        toast.success(t('import.toastSuccess', { ok, total: res.totalRows }))
      } else {
        toast.warning(t('import.toastPartial', { ok, fail: failTotal }))
      }
      await qc.invalidateQueries({ queryKey: ['confirmation', 'export', 'preview'] })
    },
    onError: (err) => toast.error((err as Error).message),
  })

  const onPickImportFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    importMut.mutate(f)
    e.target.value = ''
  }

  if (!canRead) {
    return (
      <>
        <SchedulingPageHeader
          title={t('page.title')}
          icon={BadgeCheck}
          hints={pageHints}
        />
        <AppPageContent>
          <EmptyState
            icon={AlertCircle}
            title={t('page.noAccessTitle')}
            description={
              <>
                {t('page.noAccessDesc')}{' '}
                <code className="text-xs">confirmation.read</code>
              </>
            }
          />
        </AppPageContent>
      </>
    )
  }

  let sectionIndex = 0

  return (
    <>
      <SchedulingPageHeader
        title={t('page.title')}
        icon={BadgeCheck}
        hints={pageHints}
      >
        <CanPermission permission="work-orders.read">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={schedulingHeroLinkBtnClass}
            asChild
          >
            <Link to="/work-orders">
              <ClipboardCheck className={schedulingHeroLinkIconClass} aria-hidden />
              {t('page.woConfirmationLink')}
            </Link>
          </Button>
        </CanPermission>
      </SchedulingPageHeader>

      <AppPageContent className="scheduling-page pb-8">
        <SchedulingPageStack>
          <ConfirmationExportTablePanel
            enabled={canRead}
            canExport={canExport}
            sectionIndex={sectionIndex++}
          />

          {canMassConfirm ? (
            <SchedulingPageSection index={sectionIndex++}>
              <MassConfirmSearchCard collapsible defaultOpen />
            </SchedulingPageSection>
          ) : null}

          {canImportConfirm ? (
            <SchedulingPageSection index={sectionIndex++}>
              <ConfirmQcPendingQueue
                enabled
                collapsible
                defaultOpen={false}
                onOpenWo={(wkorder) => {
                  navigate(`/work-orders/${encodeURIComponent(wkorder)}`)
                }}
              />
            </SchedulingPageSection>
          ) : null}

          {canImportConfirm ? (
            <SchedulingPageSection index={sectionIndex++}>
              <SchedulingSection
                icon={Upload}
                title={t('import.title')}
                collapsible
                defaultOpen={false}
                actions={
                  <>
                    <input
                      ref={importFileRef}
                      type="file"
                      accept=".xls,.xlsx,.csv"
                      className="hidden"
                      onChange={onPickImportFile}
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="gap-2 shadow-md"
                      disabled={importMut.isPending}
                      onClick={() => importFileRef.current?.click()}
                    >
                      <Upload className="size-4" aria-hidden />
                      {importMut.isPending ? t('import.uploading') : t('import.uploadExcel')}
                    </Button>
                  </>
                }
              >
                {importResult ? (
                  <div className="space-y-3">
                    <motion.div
                      className="flex flex-wrap gap-2"
                      {...listKpiStaggerRootMotion(reduceMotion)}
                    >
                      <motion.div {...listKpiStaggerItemMotion(reduceMotion)}>
                        <Badge variant="outline">{importResult.fileName}</Badge>
                      </motion.div>
                      <motion.div {...listKpiStaggerItemMotion(reduceMotion)}>
                        <Badge variant="outline">
                          {importResult.totalRows} {t('import.rows')}
                        </Badge>
                      </motion.div>
                      <motion.div {...listKpiStaggerItemMotion(reduceMotion)}>
                        <Badge variant="secondary">+{importResult.inserted}</Badge>
                      </motion.div>
                      <motion.div {...listKpiStaggerItemMotion(reduceMotion)}>
                        <Badge variant="secondary">~{importResult.updated}</Badge>
                      </motion.div>
                      {importResult.skipped > 0 ? (
                        <motion.div {...listKpiStaggerItemMotion(reduceMotion)}>
                          <Badge variant="destructive">
                            {t('import.skip')} {importResult.skipped}
                          </Badge>
                        </motion.div>
                      ) : null}
                      {importResult.errors > 0 ? (
                        <motion.div {...listKpiStaggerItemMotion(reduceMotion)}>
                          <Badge variant="destructive">
                            {t('import.err')} {importResult.errors}
                          </Badge>
                        </motion.div>
                      ) : null}
                    </motion.div>
                    <div className="app-table-shell overflow-hidden rounded-xl border border-app/60">
                      <Table embedded stickyHeader zebra>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16 text-center">{t('import.colRow')}</TableHead>
                            <TableHead className="w-28">{t('import.colStatus')}</TableHead>
                            <TableHead>{t('import.colConfirm')}</TableHead>
                            <TableHead>{t('import.colOrder')}</TableHead>
                            <TableHead>{t('import.colWkctr')}</TableHead>
                            <TableHead>{t('import.colStart')}</TableHead>
                            <TableHead>{t('import.colFinish')}</TableHead>
                            <TableHead>{t('import.colMessage')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {importResult.rows.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="py-8 text-center text-caption">
                                {t('import.noRows')}
                              </TableCell>
                            </TableRow>
                          ) : (
                            importResult.rows.map((r) => (
                              <TableRow key={`${r.rowNo}-${r.confirmation}-${r.wkctr}`}>
                                <TableCell className="text-center tabular-nums">{r.rowNo}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      r.action === 'inserted' || r.action === 'updated'
                                        ? 'secondary'
                                        : 'destructive'
                                    }
                                  >
                                    {t(`import.action.${r.action}`, { defaultValue: r.action })}
                                  </Badge>
                                </TableCell>
                                <TableCell className="tabular-nums">{r.confirmation}</TableCell>
                                <TableCell className="tabular-nums">{r.wkorder}</TableCell>
                                <TableCell className="tabular-nums">{r.wkctr}</TableCell>
                                <TableCell className="tabular-nums">
                                  {r.stdate ? new Date(r.stdate * 1000).toLocaleString() : ''}
                                </TableCell>
                                <TableCell className="tabular-nums">
                                  {r.endate ? new Date(r.endate * 1000).toLocaleString() : ''}
                                </TableCell>
                                <TableCell className="text-xs text-app-muted">{r.message}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : null}
              </SchedulingSection>
            </SchedulingPageSection>
          ) : null}
        </SchedulingPageStack>
      </AppPageContent>
    </>
  )
}
