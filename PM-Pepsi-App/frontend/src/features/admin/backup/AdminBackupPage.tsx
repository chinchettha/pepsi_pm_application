import type { BackupHistoryItem, BackupListResponse, BackupScheduleResponse } from '@/api/schemas'
import { AdminAccessDenied } from '@/components/admin/AdminAccessDenied'
import { AdminPageRoot } from '@/components/admin/AdminPageRoot'
import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CronInput } from './CronInput'
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
import {
  deleteBackup,
  downloadBackup,
  fetchBackupList,
  fetchBackupSchedule,
  formatBytes,
  patchBackupSchedule,
  restoreBackupFromHistory,
  restoreBackupUpload,
  startBackupNow,
} from '@/lib/admin-backup-api'
import { idbGet, idbSet } from '@/lib/idb-cache'
import { usePublicSettings } from '@/providers/SettingsProvider'
import { usePermission } from '@/lib/use-permission'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertCircle, DatabaseBackup, Download, Loader2, RefreshCcw, RotateCcw, Save, Trash2, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const BACKUP_CACHE_TTL_MS = 10 * 60 * 1000
const BACKUP_SCHEDULE_CACHE_KEY = 'admin.backup.schedule.v1'
const BACKUP_LIST_CACHE_KEY = 'admin.backup.list.v1'

function statusBadge(status: BackupHistoryItem['status']) {
  if (status === 'success') return <Badge className="bg-emerald-700">สำเร็จ</Badge>
  if (status === 'failed') return <Badge variant="destructive">ล้มเหลว</Badge>
  if (status === 'running') return <Badge variant="secondary">กำลังรัน…</Badge>
  return <Badge variant="outline">{status}</Badge>
}

export function AdminBackupPage() {
  const qc = useQueryClient()
  const canRead = usePermission('admin.backup.read')
  const canWrite = usePermission('admin.backup.write')
  const canDelete = usePermission('admin.backup.delete')
  const canRestore = usePermission('admin.backup.restore')
  const { settings: publicSettings, refetch: refetchPublicSettings } = usePublicSettings()
  const idbCacheEnabled = publicSettings?.featureIndexeddbOffline === true

  const scheduleQ = useQuery({
    queryKey: ['admin', 'backup', 'schedule'],
    queryFn: fetchBackupSchedule,
    enabled: canRead,
    placeholderData: keepPreviousData,
  })

  const listQ = useQuery({
    queryKey: ['admin', 'backup', 'list'],
    queryFn: () => fetchBackupList(0, 50),
    enabled: canRead,
    placeholderData: keepPreviousData,
    refetchInterval: (q) =>
      q.state.data?.items.some((i) => i.status === 'running') ? 3000 : false,
  })

  const [cron, setCron] = useState('0 2 * * *')
  const [retention, setRetention] = useState(30)
  const [targetDir, setTargetDir] = useState('D:/PM-Pepsi-App/backup')
  const [restoreFile, setRestoreFile] = useState<File | null>(null)
  const [restorePhrase, setRestorePhrase] = useState('')
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [restoreTargetId, setRestoreTargetId] = useState<number | null>(null)
  const [cachedScheduleLoaded, setCachedScheduleLoaded] = useState(false)
  const [cachedListLoaded, setCachedListLoaded] = useState(false)
  const [cachedList, setCachedList] = useState<BackupListResponse | null>(null)

  useEffect(() => {
    if (scheduleQ.data) {
      setCron(scheduleQ.data.scheduleCron)
      setRetention(scheduleQ.data.retentionDays)
      setTargetDir(scheduleQ.data.targetDir)
      if (idbCacheEnabled) {
        void idbSet(BACKUP_SCHEDULE_CACHE_KEY, scheduleQ.data, BACKUP_CACHE_TTL_MS)
      }
    }
  }, [scheduleQ.data, idbCacheEnabled])

  useEffect(() => {
    if (!idbCacheEnabled) return
    if (cachedScheduleLoaded || scheduleQ.data || !canRead) return
    setCachedScheduleLoaded(true)
    void (async () => {
      const cached = await idbGet<BackupScheduleResponse>(BACKUP_SCHEDULE_CACHE_KEY)
      if (!cached) return
      setCron(cached.scheduleCron)
      setRetention(cached.retentionDays)
      setTargetDir(cached.targetDir)
    })()
  }, [cachedScheduleLoaded, scheduleQ.data, canRead, idbCacheEnabled])

  useEffect(() => {
    if (!idbCacheEnabled) {
      setCachedList(null)
      return
    }
    if (listQ.data && canRead) {
      void idbSet(BACKUP_LIST_CACHE_KEY, listQ.data, BACKUP_CACHE_TTL_MS)
    }
  }, [listQ.data, canRead, idbCacheEnabled])

  useEffect(() => {
    if (!idbCacheEnabled) return
    if (cachedListLoaded || listQ.data || !canRead) return
    setCachedListLoaded(true)
    void (async () => {
      const cached = await idbGet<BackupListResponse>(BACKUP_LIST_CACHE_KEY)
      if (!cached) return
      setCachedList(cached)
    })()
  }, [cachedListLoaded, listQ.data, canRead, idbCacheEnabled])

  const listData = listQ.data ?? cachedList
  const showingCache = !listQ.data && Boolean(cachedList)

  const saveScheduleMut = useMutation({
    mutationFn: () =>
      patchBackupSchedule({
        scheduleCron: cron,
        retentionDays: retention,
        targetDir,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'backup'] })
      toast.success('บันทึกตั้งค่าสำรองแล้ว')
    },
    onError: (e: Error) => toast.error(e.message || 'บันทึกไม่สำเร็จ'),
  })

  const backupMut = useMutation({
    mutationFn: startBackupNow,
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['admin', 'backup'] })
      if (data.item.status === 'success') {
        toast.success('สำรองข้อมูลสำเร็จ')
      } else {
        toast.error(data.item.errorText || 'สำรองข้อมูลล้มเหลว')
      }
    },
    onError: (e: Error) => toast.error(e.message || 'เริ่มสำรองไม่สำเร็จ'),
  })

  const deleteMut = useMutation({
    mutationFn: deleteBackup,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'backup'] })
      toast.success('ลบไฟล์สำรองแล้ว')
    },
    onError: (e: Error) => toast.error(e.message || 'ลบไม่สำเร็จ'),
  })

  const restoreUploadMut = useMutation({
    mutationFn: () => {
      if (!restoreFile) throw new Error('เลือกไฟล์ .sql.gz')
      return restoreBackupUpload(restoreFile)
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['admin', 'backup'] })
      void qc.invalidateQueries({ queryKey: ['settings', 'public'] })
      refetchPublicSettings()
      setRestoreFile(null)
      setRestorePhrase('')
      toast.success(`กู้คืนสำเร็จ (${(data.durationMs / 1000).toFixed(1)} วินาที)`)
    },
    onError: (e: Error) => toast.error(e.message || 'กู้คืนไม่สำเร็จ'),
  })

  const restoreHistoryMut = useMutation({
    mutationFn: (id: number) => restoreBackupFromHistory(id),
    onSuccess: (data) => {
      setRestoreDialogOpen(false)
      setRestoreTargetId(null)
      setRestorePhrase('')
      void qc.invalidateQueries({ queryKey: ['settings', 'public'] })
      refetchPublicSettings()
      toast.success(`กู้คืนจาก backup #${data.backupId} สำเร็จ`)
    },
    onError: (e: Error) => toast.error(e.message || 'กู้คืนไม่สำเร็จ'),
  })

  if (!canRead) {
    return (
      <AdminPageRoot tourTarget="admin-backup">
        <AdminAccessDenied
          message={
            <>
              ไม่มีสิทธิ์ <code className="text-xs">admin.backup.read</code>
            </>
          }
        />
      </AdminPageRoot>
    )
  }

  const pgOk = scheduleQ.data?.pgDumpAvailable ?? false
  const psqlOk = scheduleQ.data?.psqlAvailable ?? false
  const last = scheduleQ.data?.lastSuccess
  const restoreReady = restorePhrase === 'RESTORE'

  const refetchAll = () => {
    void scheduleQ.refetch()
    void listQ.refetch()
  }

  return (
    <AdminPageShell
      tourTarget="admin-backup"
      title="สำรอง & กู้คืน"
      description="pg_dump → ไฟล์ .sql.gz · ตั้ง cron + retention · SHA256"
      contentClassName="space-y-6"
      headerActions={
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="admin-toolbar-btn"
            onClick={refetchAll}
            disabled={scheduleQ.isFetching || listQ.isFetching}
          >
            <RefreshCcw
              className={`mr-1 size-3.5 ${scheduleQ.isFetching || listQ.isFetching ? 'animate-spin' : ''}`}
              aria-hidden
            />
            รีเฟรช
          </Button>
          {canWrite ? (
            <Button
              type="button"
              className="admin-toolbar-btn"
              disabled={!pgOk || backupMut.isPending}
              onClick={() => backupMut.mutate()}
            >
              {backupMut.isPending ? (
                <Loader2 className="mr-1 size-4 animate-spin" />
              ) : (
                <DatabaseBackup className="mr-1 size-4" />
              )}
              สำรองตอนนี้
            </Button>
          ) : null}
        </>
      }
    >
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-base">เครื่องมือ PostgreSQL (Windows / PATH)</CardTitle>
            <CardDescription>ใช้ก่อนสำรองหรือกู้คืน — ต้องมี pg_dump และ psql</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-body-sm sm:grid-cols-2">
            <p>
              <span className="font-medium text-app">pg_dump:</span>{' '}
              {pgOk ? (
                <Badge className="ml-1 bg-emerald-700">พร้อม</Badge>
              ) : (
                <Badge variant="destructive" className="ml-1">
                  ไม่พบ
                </Badge>
              )}
              <code className="mt-1 block truncate font-mono text-xs text-app-muted">
                {scheduleQ.data?.pgDumpBin ?? 'pg_dump'}
              </code>
            </p>
            <p>
              <span className="font-medium text-app">psql:</span>{' '}
              {psqlOk ? (
                <Badge className="ml-1 bg-emerald-700">พร้อม</Badge>
              ) : (
                <Badge variant="destructive" className="ml-1">
                  ไม่พบ
                </Badge>
              )}
              <code className="mt-1 block truncate font-mono text-xs text-app-muted">
                {scheduleQ.data?.psqlBin ?? 'psql'}
              </code>
            </p>
          </CardContent>
        </Card>

        {!pgOk ? (
          <Card className="border-amber-300 bg-amber-50">
            <CardContent className="pt-6 text-body-sm text-amber-950">
              ติดตั้ง PostgreSQL client tools หรือตั้ง env <code>PG_DUMP_PATH</code> /{' '}
              <code>PSQL_PATH</code> ให้ service ที่รัน API เห็นใน PATH
            </CardContent>
          </Card>
        ) : null}

        {canRestore ? (
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="text-base text-red-900">กู้คืนฐานข้อมูล</CardTitle>
              <CardDescription className="text-red-800/80">
                อัปโหลดไฟล์ <code>.sql.gz</code> จาก pg_dump — ระบบเปิดโหมดบำรุงรักษาอัตโนมัติระหว่าง restore
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="restore-file">ไฟล์ backup</Label>
                <Input
                  id="restore-file"
                  type="file"
                  accept=".sql.gz,.gz"
                  disabled={!psqlOk || restoreUploadMut.isPending}
                  onChange={(e) => setRestoreFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="restore-phrase">พิมพ์ RESTORE เพื่อยืนยัน</Label>
                <Input
                  id="restore-phrase"
                  value={restorePhrase}
                  autoComplete="off"
                  disabled={!psqlOk || restoreUploadMut.isPending}
                  onChange={(e) => setRestorePhrase(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                disabled={
                  !psqlOk || !restoreFile || !restoreReady || restoreUploadMut.isPending
                }
                onClick={() => {
                  if (
                    !window.confirm(
                      'กู้คืนจะเขียนทับข้อมูลในฐานข้อมูลปัจจุบัน — ดำเนินการต่อ?',
                    )
                  ) {
                    return
                  }
                  restoreUploadMut.mutate()
                }}
              >
                {restoreUploadMut.isPending ? (
                  <Loader2 className="mr-1 size-4 animate-spin" />
                ) : (
                  <Upload className="mr-1 size-4" />
                )}
                กู้คืนจากไฟล์
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="admin-card">
            <CardHeader>
              <CardTitle className="text-base">สถานะ</CardTitle>
              <CardDescription>backup ล่าสุดที่สำเร็จ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-body-sm">
              {scheduleQ.isLoading ? <Skeleton className="h-16" /> : null}
              {last ? (
                <>
                  <p>
                    <span className="text-app-muted">เวลา:</span>{' '}
                    {new Date(last.finishedAt ?? last.startedAt).toLocaleString('th-TH')}
                  </p>
                  <p>
                    <span className="text-app-muted">ขนาด:</span> {formatBytes(last.sizeBytes)}
                  </p>
                  {last.sha256 ? (
                    <p className="font-mono text-xs text-app-muted" title={last.sha256}>
                      SHA256: {last.sha256.slice(0, 16)}…
                    </p>
                  ) : null}
                  <p className="truncate font-mono text-xs text-app-muted">{last.filePath}</p>
                </>
              ) : (
                <p className="text-app-muted">ยังไม่มี backup สำเร็จ</p>
              )}
            </CardContent>
          </Card>

          <Card className="admin-card">
            <CardHeader>
              <CardTitle className="text-base">ตั้งค่า schedule</CardTitle>
              <CardDescription>cron แบบนาที+ชั่วโมง (เช่น 0 2 * * * = 02:00 ทุกวัน)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <CronInput value={cron} disabled={!canWrite} onChange={setCron} />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="backup-retention">เก็บ (วัน)</Label>
                  <Input
                    id="backup-retention"
                    type="number"
                    min={1}
                    max={365}
                    value={retention}
                    disabled={!canWrite}
                    onChange={(e) => setRetention(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="backup-dir">โฟลเดอร์ปลายทาง</Label>
                  <Input
                    id="backup-dir"
                    value={targetDir}
                    disabled={!canWrite}
                    onChange={(e) => setTargetDir(e.target.value)}
                  />
                </div>
              </div>
              {canWrite ? (
                <Button
                  type="button"
                  size="sm"
                  disabled={saveScheduleMut.isPending}
                  onClick={() => saveScheduleMut.mutate()}
                >
                  <Save className="mr-1 size-4" />
                  บันทึกตั้งค่า
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-base">ประวัติการสำรอง</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {listQ.isLoading && !listData ? (
              <Skeleton className="m-4 h-40" />
            ) : listQ.isError && !listData ? (
              <EmptyState
                icon={AlertCircle}
                className="m-4"
                title="โหลดประวัติสำรองไม่สำเร็จ"
                description={(listQ.error as Error).message}
                action={{ label: 'ลองใหม่', onClick: () => void listQ.refetch() }}
              />
            ) : (
              <>
                {showingCache ? (
                  <div className="m-4 rounded-card border border-app bg-app-subtle px-3 py-2 text-xs text-app-muted">
                    แสดงจาก IndexedDB (offline flag เปิด) — จะอัปเดตเมื่อโหลดจากเซิร์ฟเวอร์สำเร็จ
                  </div>
                ) : null}
                <div className="app-table-shell overflow-x-auto">
                <Table embedded stickyHeader zebra>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>ขนาด</TableHead>
                    <TableHead>SHA256</TableHead>
                    <TableHead>เริ่ม</TableHead>
                    <TableHead className="text-right">การกระทำ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(listData?.items ?? []).map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.trigger}</TableCell>
                      <TableCell>{statusBadge(row.status)}</TableCell>
                      <TableCell>{formatBytes(row.sizeBytes)}</TableCell>
                      <TableCell className="max-w-[100px] truncate font-mono text-xs" title={row.sha256 ?? ''}>
                        {row.sha256 ? `${row.sha256.slice(0, 10)}…` : '—'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        {new Date(row.startedAt).toLocaleString('th-TH')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {row.status === 'success' && row.filePath ? (
                            <>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                aria-label="ดาวน์โหลด backup"
                                onClick={() => {
                                  const name =
                                    row.filePath?.split(/[/\\]/).pop() ??
                                    `backup-${row.id}.sql.gz`
                                  void downloadBackup(row.id, name)
                                }}
                              >
                                <Download className="size-4" />
                              </Button>
                              {canRestore && psqlOk ? (
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  aria-label="กู้คืนจากไฟล์ backup นี้"
                                  disabled={restoreHistoryMut.isPending}
                                  onClick={() => {
                                    setRestoreTargetId(row.id)
                                    setRestorePhrase('')
                                    setRestoreDialogOpen(true)
                                  }}
                                >
                                  <RotateCcw className="size-4 text-red-700" />
                                </Button>
                              ) : null}
                            </>
                          ) : null}
                          {canDelete && row.status !== 'running' ? (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              aria-label="ลบไฟล์ backup"
                              disabled={deleteMut.isPending}
                              onClick={() => {
                                if (!window.confirm('ลบไฟล์ backup นี้?')) return
                                deleteMut.mutate(row.id)
                              }}
                            >
                              <Trash2 className="size-4 text-red-600" />
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>กู้คืนจาก backup #{restoreTargetId}</DialogTitle>
            <DialogDescription>
              ข้อมูลปัจจุบันจะถูกเขียนทับ — พิมพ์ RESTORE เพื่อยืนยัน
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="restore-history-phrase">ยืนยัน</Label>
            <Input
              id="restore-history-phrase"
              value={restorePhrase}
              autoComplete="off"
              onChange={(e) => setRestorePhrase(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRestoreDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={
                !restoreReady ||
                restoreTargetId == null ||
                restoreHistoryMut.isPending
              }
              onClick={() => {
                if (restoreTargetId == null) return
                restoreHistoryMut.mutate(restoreTargetId)
              }}
            >
              {restoreHistoryMut.isPending ? (
                <Loader2 className="mr-1 size-4 animate-spin" />
              ) : null}
              กู้คืน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageShell>
  )
}
