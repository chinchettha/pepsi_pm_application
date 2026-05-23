import { AdminAccessDenied } from '@/components/admin/AdminAccessDenied'
import { AdminPageRoot } from '@/components/admin/AdminPageRoot'
import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { fetchMasterDataMeta } from '@/lib/api-public'
import { usePermission } from '@/lib/use-permission'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, RefreshCcw } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MASTER_ENTITIES, masterDataHref } from './master-entities'

export function AdminMasterHubPage() {
  const qc = useQueryClient()
  const canRead = usePermission('master-data.read')

  const metas = useQueries({
    queries: MASTER_ENTITIES.map((e) => ({
      queryKey: ['master-data', 'meta', e.id],
      queryFn: () => fetchMasterDataMeta(e.id),
      enabled: canRead,
      staleTime: 60_000,
    })),
  })

  const totalRows = useMemo(
    () =>
      metas.reduce((sum, q) => {
        if (!q.data || q.isError) return sum
        return sum + q.data.count
      }, 0),
    [metas],
  )

  const loadedCount = metas.filter((q) => q.isSuccess).length
  const anyLoading = metas.some((q) => q.isLoading && !q.data)
  const anyError = metas.some((q) => q.isError)
  const isRefreshing = metas.some((q) => q.isFetching)

  const refetchAll = () => {
    void qc.invalidateQueries({ queryKey: ['master-data', 'meta'] })
  }

  if (!canRead) {
    return (
      <AdminPageRoot tourTarget="admin-master">
        <AdminAccessDenied
          message={
            <>
              ไม่มีสิทธิ์ <code className="text-xs">master-data.read</code>
            </>
          }
        />
      </AdminPageRoot>
    )
  }

  return (
    <AdminPageShell
      tourTarget="admin-master"
      title="ศูนย์ Master Data"
      description={`สรุปข้อมูลหลัก ${MASTER_ENTITIES.length} ตาราง — เปิดแก้ไขที่หน้า Master Data`}
      contentClassName="space-y-6"
      headerActions={
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="admin-toolbar-btn"
          onClick={refetchAll}
          disabled={isRefreshing}
        >
          <RefreshCcw className={`mr-1 size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden />
          รีเฟรช
        </Button>
      }
    >
      <Card className="admin-card">
        <CardHeader>
          <CardTitle className="text-base">ตาราง master ({MASTER_ENTITIES.length})</CardTitle>
          <CardDescription>
            จำนวนแถวและวันแก้ไขล่าสุดจาก audit master-data (ถ้ามี)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {anyError && !anyLoading ? (
            <p className="mb-3 text-body-sm text-amber-800">
              บางตารางโหลดไม่สำเร็จ — ตรวจสิทธิ์ login และการเชื่อมต่อ backend
            </p>
          ) : null}
          <div className="app-table-shell overflow-x-auto">
            <Table embedded stickyHeader zebra>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อ</TableHead>
                  <TableHead className="w-28 text-right">จำนวนแถว</TableHead>
                  <TableHead className="w-40">แก้ไขล่าสุด</TableHead>
                  <TableHead className="w-32" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {MASTER_ENTITIES.map((entity, index) => {
                  const q = metas[index]
                  const count = q?.data?.count
                  const lastUpdatedAt = q?.data?.lastUpdatedAt ?? null
                  const lastUpdatedLabel = lastUpdatedAt
                    ? new Date(lastUpdatedAt).toLocaleString('th-TH')
                    : '—'
                  return (
                    <TableRow key={entity.id}>
                      <TableCell>
                        <div className="font-medium text-app">{entity.label}</div>
                        <p className="font-mono text-xs text-app-muted">{entity.id}</p>
                        {entity.legacy ? (
                          <p className="text-xs text-app-muted">Legacy: {entity.legacy}</p>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {q?.isLoading && !q.data ? (
                          <Skeleton className="ml-auto h-5 w-12" />
                        ) : q?.isError ? (
                          <span className="text-xs text-red-600" title="โหลด meta ไม่สำเร็จ">
                            —
                          </span>
                        ) : (
                          (count ?? 0).toLocaleString('th-TH')
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-app-muted">{lastUpdatedLabel}</TableCell>
                      <TableCell>
                        <Button type="button" size="sm" variant="outline" asChild>
                          <Link to={masterDataHref(entity.id)}>
                            เปิด
                            <ExternalLink className="ml-1 size-3.5" aria-hidden />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
                <TableRow className="font-medium">
                  <TableCell>
                    รวม ({loadedCount}/{MASTER_ENTITIES.length} ตารางโหลดแล้ว)
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {anyLoading ? (
                      <Skeleton className="ml-auto h-5 w-16" />
                    ) : (
                      totalRows.toLocaleString('th-TH')
                    )}
                  </TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableBody>
            </Table>
          </div>
          {loadedCount === 0 && anyError && !anyLoading ? (
            <EmptyState
              className="mt-4"
              title="โหลดสรุป master ไม่สำเร็จ"
              description="ตรวจสิทธิ์ master-data.read และ backend"
              action={{ label: 'ลองใหม่', onClick: refetchAll }}
            />
          ) : null}
          <p className="mt-3 text-xs text-app-muted">
            ลิงก์เปิดแท็บ entity ที่ตรงกัน ·{' '}
            <Link to="/master-data" className="text-sky-700 underline">
              ไปหน้า Master Data
            </Link>
            {' · '}
            <Link to="/admin" className="text-sky-700 underline">
              ศูนย์ผู้ดูแลระบบ
            </Link>
          </p>
        </CardContent>
      </Card>
    </AdminPageShell>
  )
}
