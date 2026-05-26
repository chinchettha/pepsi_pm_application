import type { AuditFilters, AuditLogItem } from '@/api/schemas'
import { AdminAccessDenied } from '@/components/admin/AdminAccessDenied'
import { ReportExportButton } from '@/components/reports/ReportExportButton'
import { AdminPageRoot } from '@/components/admin/AdminPageRoot'
import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AuditDiffViewer } from './AuditDiffViewer'
import {
  AUDIT_ACTION_GROUPS,
  defaultAuditFilters,
  deleteAuditOlderThan,
  downloadAuditCsv,
  fetchAuditLogs,
  fetchAuditMeta,
  PAGE_SIZE,
} from '@/lib/admin-audit-api'
import { idbGet, idbSet } from '@/lib/idb-cache'
import { usePublicSettings } from '@/providers/SettingsProvider'
import { usePermission } from '@/lib/use-permission'
import { keepPreviousData, useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query'
import { AlertCircle, History, Loader2, RefreshCcw, Search, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

const AUDIT_CACHE_TTL_MS = 10 * 60 * 1000
const AUDIT_CACHE_KEY_PREFIX = 'admin.audit.list.v1:'

const selectClass =
  'flex h-10 w-full rounded-button border border-app bg-[var(--app-surface)] px-3 py-2 text-body-sm text-app focus-app-ring focus-visible:outline-none'

function toLocalInputValue(iso: string | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromLocalInputValue(local: string): string | undefined {
  if (!local) return undefined
  const d = new Date(local)
  if (Number.isNaN(d.getTime())) return undefined
  return d.toISOString()
}

function statusBadge(status: AuditLogItem['status']) {
  if (status === 'ok') return <Badge className="bg-emerald-700">ok</Badge>
  if (status === 'denied') return <Badge variant="destructive">denied</Badge>
  return <Badge variant="secondary">error</Badge>
}

function AuditTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 7 }, (__, j) => (
            <TableCell key={j}>
              <Skeleton className="h-5 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

export function AdminAuditPage() {
  const canRead = usePermission('admin.audit.read')
  const canDelete = usePermission('admin.audit.delete')
  const { settings } = usePublicSettings()
  const idbCacheEnabled = settings?.featureIndexeddbOffline === true

  const [filters, setFilters] = useState<AuditFilters>(() => defaultAuditFilters())
  const [applied, setApplied] = useState<AuditFilters>(() => defaultAuditFilters())
  const [diffRow, setDiffRow] = useState<AuditLogItem | null>(null)
  const [cleanupDate, setCleanupDate] = useState('')
  const [cachedRows, setCachedRows] = useState<AuditLogItem[] | null>(null)
  const [cachedTotal, setCachedTotal] = useState<number | null>(null)
  const [cacheLoadedKey, setCacheLoadedKey] = useState<string | null>(null)

  const metaQ = useQuery({
    queryKey: ['admin', 'audit', 'meta'],
    queryFn: fetchAuditMeta,
    enabled: canRead,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })

  useEffect(() => {
    const cutoff = metaQ.data?.retentionCutoffDate
    if (cutoff && !cleanupDate) setCleanupDate(cutoff)
  }, [metaQ.data?.retentionCutoffDate, cleanupDate])

  const listQ = useInfiniteQuery({
    queryKey: ['admin', 'audit', 'list', applied],
    queryFn: ({ pageParam }) => fetchAuditLogs(applied, pageParam),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((n, p) => n + p.items.length, 0)
      return loaded < last.total ? loaded : undefined
    },
    enabled: canRead,
    placeholderData: keepPreviousData,
  })

  const exportMut = useMutation({
    mutationFn: () => downloadAuditCsv(applied),
    onSuccess: () => toast.success('ดาวน์โหลด CSV แล้ว'),
    onError: (e: Error) => toast.error(e.message || 'ส่งออกไม่สำเร็จ'),
  })

  const cleanupMut = useMutation({
    mutationFn: (olderThan: string) => deleteAuditOlderThan(olderThan),
    onSuccess: (deleted) => {
      toast.success(`ลบ audit เก่าแล้ว ${deleted} แถว`)
      void listQ.refetch()
    },
    onError: (e: Error) => toast.error(e.message || 'ลบไม่สำเร็จ'),
  })

  const rows = useMemo(
    () => listQ.data?.pages.flatMap((p) => p.items) ?? [],
    [listQ.data],
  )
  const total = listQ.data?.pages[0]?.total ?? 0

  const appliedKey = useMemo(
    () => `${AUDIT_CACHE_KEY_PREFIX}${JSON.stringify(applied)}`,
    [applied],
  )

  useEffect(() => {
    if (!canRead || !idbCacheEnabled) return
    if (cacheLoadedKey === appliedKey) return
    setCacheLoadedKey(appliedKey)
    void (async () => {
      const cached = await idbGet<{ items: AuditLogItem[]; total: number }>(appliedKey)
      if (!cached) return
      setCachedRows(cached.items)
      setCachedTotal(cached.total)
    })()
  }, [appliedKey, cacheLoadedKey, canRead, idbCacheEnabled])

  useEffect(() => {
    if (!idbCacheEnabled) {
      setCachedRows(null)
      setCachedTotal(null)
    }
  }, [idbCacheEnabled])

  useEffect(() => {
    if (!canRead || !idbCacheEnabled) return
    if (!listQ.data?.pages?.length) return
    const flat = listQ.data.pages.flatMap((p) => p.items).slice(0, 200)
    const t = listQ.data.pages[0]?.total ?? flat.length
    void idbSet(appliedKey, { items: flat, total: t }, AUDIT_CACHE_TTL_MS)
  }, [appliedKey, listQ.data, canRead, idbCacheEnabled])

  const effectiveRows = rows.length > 0 ? rows : cachedRows ?? []
  const effectiveTotal = rows.length > 0 ? total : cachedTotal ?? 0
  const showingCache = rows.length === 0 && Boolean(cachedRows?.length)

  const togglePrefix = (prefix: string) => {
    setFilters((f) => {
      const cur = f.actionPrefix ?? []
      const next = cur.includes(prefix) ? cur.filter((p) => p !== prefix) : [...cur, prefix]
      return { ...f, actionPrefix: next }
    })
  }

  const applyFilters = () => setApplied({ ...filters })

  useEffect(() => {
    if (canRead) applyFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
  }, [canRead])

  if (!canRead) {
    return (
      <AdminPageRoot tourTarget="admin-audit">
        <AdminAccessDenied
          message={
            <>
              ไม่มีสิทธิ์ <code className="text-xs">admin.audit.read</code>
            </>
          }
        />
      </AdminPageRoot>
    )
  }

  return (
    <AdminPageShell
      tourTarget="admin-audit"
      title="บันทึกกิจกรรม (Audit)"
      description="ประวัติ login, mutation, RBAC denied — กรองและส่งออก CSV"
      contentClassName="space-y-6"
      headerActions={
        <>
          <Badge variant="secondary">
            <History className="mr-1 size-3.5" aria-hidden />
            {effectiveTotal.toLocaleString()} รายการ
          </Badge>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="admin-toolbar-btn"
            onClick={() => void listQ.refetch()}
            disabled={listQ.isFetching}
          >
            <RefreshCcw className={`mr-1 size-3.5 ${listQ.isFetching ? 'animate-spin' : ''}`} aria-hidden />
            รีเฟรช
          </Button>
        </>
      }
    >
        {showingCache ? (
          <div className="rounded-card border border-app bg-app-subtle px-3 py-2 text-xs text-app-muted">
            แสดงข้อมูลจาก IndexedDB (offline flag เปิด) — จะอัปเดตเมื่อโหลดจากเซิร์ฟเวอร์สำเร็จ
          </div>
        ) : null}
        {idbCacheEnabled && !showingCache && listQ.isFetching && !listQ.isLoading ? (
          <p className="text-xs text-app-muted">กำลังอัปเดตรายการ…</p>
        ) : null}
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-base">ตัวกรอง</CardTitle>
            <CardDescription>ค่าเริ่มต้น: 24 ชั่วโมงล่าสุด</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <Label htmlFor="audit-from">จาก</Label>
                <Input
                  id="audit-from"
                  type="datetime-local"
                  value={toLocalInputValue(filters.from)}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, from: fromLocalInputValue(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="audit-to">ถึง</Label>
                <Input
                  id="audit-to"
                  type="datetime-local"
                  value={toLocalInputValue(filters.to)}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, to: fromLocalInputValue(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="audit-actor">ผู้กระทำ (actor)</Label>
                <Input
                  id="audit-actor"
                  list="audit-actor-suggestions"
                  placeholder="รหัส WC / username"
                  value={filters.actorId ?? ''}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, actorId: e.target.value || undefined }))
                  }
                />
                <datalist id="audit-actor-suggestions">
                  {(metaQ.data?.actors ?? []).map((a) => (
                    <option key={a.actorId} value={a.actorId} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-1">
                <Label htmlFor="audit-status">สถานะ</Label>
                <select
                  id="audit-status"
                  className={selectClass}
                  value={filters.status ?? 'all'}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      status: e.target.value as AuditFilters['status'],
                    }))
                  }
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="ok">ok</option>
                  <option value="denied">denied</option>
                  <option value="error">error</option>
                </select>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="audit-resource">ทรัพยากร (resource)</Label>
                <Input
                  id="audit-resource"
                  placeholder="เช่น tbl_setting, tbconfirm_comment"
                  value={filters.resource ?? ''}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, resource: e.target.value || undefined }))
                  }
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="audit-q">ค้นหา</Label>
                <Input
                  id="audit-q"
                  placeholder="action, resource, message"
                  value={filters.q ?? ''}
                  onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value || undefined }))}
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-app-muted">กลุ่ม action</p>
              <div className="flex flex-wrap gap-2">
                {AUDIT_ACTION_GROUPS.map((g) => {
                  const on = (filters.actionPrefix ?? []).includes(g.prefix)
                  return (
                    <Button
                      key={g.id}
                      type="button"
                      size="sm"
                      variant={on ? 'default' : 'outline'}
                      onClick={() => togglePrefix(g.prefix)}
                    >
                      {g.label}
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={applyFilters}>
                <Search className="mr-2 size-4" />
                ค้นหา
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const d = defaultAuditFilters()
                  setFilters(d)
                  setApplied(d)
                }}
              >
                รีเซ็ต 24 ชม.
              </Button>
              <ReportExportButton
                format="csv"
                label="ส่งออก CSV"
                loading={exportMut.isPending}
                onClick={() => exportMut.mutate()}
              />
            </div>
          </CardContent>
        </Card>

        {canDelete ? (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="text-base text-amber-900">ลบ log เก่า</CardTitle>
              <CardDescription>
                ลบรายการที่มีเวลา <strong>ก่อน</strong> วันที่ระบุ — เก็บ log{' '}
                <strong>{metaQ.data?.retentionDays ?? 365} วัน</strong>
                {metaQ.data?.retentionCutoffDate ? (
                  <>
                    {' '}
                    (ไม่ลบหลัง {metaQ.data.retentionCutoffDate})
                  </>
                ) : null}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <Label htmlFor="cleanup-date">ลบก่อนวันที่</Label>
                <Input
                  id="cleanup-date"
                  type="date"
                  value={cleanupDate}
                  onChange={(e) => setCleanupDate(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                disabled={!cleanupDate || cleanupMut.isPending}
                onClick={() => {
                  if (!cleanupDate) return
                  if (
                    !window.confirm(
                      `ยืนยันลบ audit log ทั้งหมดก่อน ${cleanupDate}? การกระทำนี้ไม่สามารถย้อนกลับได้`,
                    )
                  ) {
                    return
                  }
                  cleanupMut.mutate(cleanupDate)
                }}
              >
                {cleanupMut.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 size-4" />
                )}
                ลบเก่า
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {listQ.isLoading && effectiveRows.length === 0 ? (
          <div className="app-table-shell overflow-hidden">
            <Table embedded stickyHeader zebra>
              <TableHeader>
                <TableRow>
                  <TableHead>เวลา</TableHead>
                  <TableHead>ผู้กระทำ</TableHead>
                  <TableHead>action</TableHead>
                  <TableHead>resource</TableHead>
                  <TableHead>status</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead className="text-right">diff</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AuditTableSkeleton />
              </TableBody>
            </Table>
          </div>
        ) : listQ.isError && effectiveRows.length === 0 ? (
          <EmptyState
            icon={AlertCircle}
            title="โหลด audit ไม่สำเร็จ"
            description={(listQ.error as Error).message}
            action={{ label: 'ลองใหม่', onClick: () => void listQ.refetch() }}
          />
        ) : (
          <div className="app-table-shell overflow-hidden">
            <Table embedded stickyHeader zebra>
              <TableHeader>
                <TableRow>
                  <TableHead>เวลา</TableHead>
                  <TableHead>ผู้กระทำ</TableHead>
                  <TableHead>action</TableHead>
                  <TableHead>resource</TableHead>
                  <TableHead>status</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead className="text-right">diff</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {effectiveRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-caption">
                      ไม่พบรายการในช่วงที่เลือก
                    </TableCell>
                  </TableRow>
                ) : (
                  effectiveRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="whitespace-nowrap text-xs tabular-nums">
                        {new Date(row.createdAt).toLocaleString('th-TH')}
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="font-medium">{row.actorId ?? '—'}</span>
                        {row.actorRole ? (
                          <span className="ml-1 text-app-muted">({row.actorRole})</span>
                        ) : null}
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate font-mono text-xs">
                        {row.action}
                      </TableCell>
                      <TableCell className="max-w-[120px] truncate text-xs">
                        {row.resource ?? '—'}
                        {row.resourceId ? (
                          <span className="block text-app-muted">{row.resourceId}</span>
                        ) : null}
                      </TableCell>
                      <TableCell>{statusBadge(row.status)}</TableCell>
                      <TableCell className="text-xs tabular-nums">{row.ip ?? '—'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={row.before == null && row.after == null}
                          onClick={() => setDiffRow(row)}
                        >
                          ดู diff
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {listQ.isFetchingNextPage ? (
              <div className="border-t border-app px-4 py-2">
                <Table>
                  <TableBody>
                    <AuditTableSkeleton rows={3} />
                  </TableBody>
                </Table>
              </div>
            ) : null}
            {listQ.hasNextPage ? (
              <div className="border-t border-app p-4 text-center">
                <Button
                  type="button"
                  variant="outline"
                  disabled={listQ.isFetchingNextPage}
                  onClick={() => void listQ.fetchNextPage()}
                >
                  {listQ.isFetchingNextPage ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : null}
                  โหลดเพิ่ม ({effectiveRows.length} / {effectiveTotal})
                </Button>
              </div>
            ) : (
              <p className="border-t border-app py-2 text-center text-xs text-app-muted">
                แสดง {effectiveRows.length} จาก {effectiveTotal} (หน้าละ {PAGE_SIZE})
              </p>
            )}
          </div>
        )}

      <Dialog open={diffRow != null} onOpenChange={(open) => !open && setDiffRow(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Diff — {diffRow?.action}</DialogTitle>
            <DialogDescription>
              #{diffRow?.id} · {diffRow?.resource}
              {diffRow?.resourceId ? ` / ${diffRow.resourceId}` : ''}
              {diffRow?.message ? ` · ${diffRow.message}` : ''}
            </DialogDescription>
          </DialogHeader>
          {diffRow ? (
            <AuditDiffViewer before={diffRow.before} after={diffRow.after} />
          ) : null}
        </DialogContent>
      </Dialog>
    </AdminPageShell>
  )
}
