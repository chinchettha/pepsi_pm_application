import { AppCard } from '@/components/layout/AppCard'
import { AppPageShell } from '@/components/layout/AppPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { fetchUserLog } from '@/lib/api-public'
import { usePermission } from '@/lib/use-permission'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AlertCircle, RefreshCcw } from 'lucide-react'

/** แสดง IP client — localhost เป็น ::1 ใน dev */
function formatClientIp(ip: string | null | undefined): string {
  if (!ip?.trim()) return '—'
  const v = ip.trim()
  if (v === '::1' || v === '::ffff:127.0.0.1') return '127.0.0.1 (localhost)'
  return v
}

function formatServerHost(host: string | null | undefined): string {
  if (!host?.trim()) return '—'
  return host.trim()
}

function formatAction(action: string): string {
  const a = action.toLowerCase()
  if (a === 'login') return 'เข้าสู่ระบบ'
  if (a === 'logout') return 'ออกจากระบบ'
  return action
}

export function UserLogPage() {
  const canRead = usePermission('user-log.read')

  const q = useQuery({
    queryKey: ['user-log', 50, 0],
    queryFn: () => fetchUserLog({ limit: 50, offset: 0 }),
    enabled: canRead,
    placeholderData: keepPreviousData,
    retry: 1,
  })

  const rows = q.data ?? []

  if (!canRead) {
    return (
      <AppPageShell title="ประวัติการใช้งาน" description="บันทึก login / logout">
        <EmptyState
          icon={AlertCircle}
          title="ไม่มีสิทธิ์เข้าถึง"
          description={
            <>
              ต้องมีสิทธิ์ <code className="text-xs">user-log.read</code>
            </>
          }
        />
      </AppPageShell>
    )
  }

  return (
    <AppPageShell
      title="ประวัติการใช้งาน"
      description="เทียบ M_UserLog.php — IP ผู้ใช้ (userIp) และเครื่องเซิร์ฟเวอร์ (myIp)"
      contentClassName="space-y-6"
      headerActions={
        <>
          <Badge variant="secondary" className="text-xs">
            {rows.length} รายการล่าสุด
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void q.refetch()}
            disabled={q.isFetching}
          >
            <RefreshCcw className={`mr-1 size-3.5 ${q.isFetching ? 'animate-spin' : ''}`} aria-hidden />
            รีเฟรช
          </Button>
        </>
      }
    >
      {q.isLoading && !q.data ? (
        <Skeleton className="h-64 w-full rounded-card" />
      ) : q.isError ? (
        <EmptyState
          icon={AlertCircle}
          title="โหลดประวัติไม่สำเร็จ"
          description={(q.error as Error).message}
          action={{ label: 'ลองใหม่', onClick: () => void q.refetch() }}
        />
      ) : (
        <AppCard pad="compact" className="p-0">
          <div className="app-table-shell overflow-x-auto">
            <Table embedded stickyHeader zebra>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ลำดับ</TableHead>
                  <TableHead>วันที่-เวลา</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>IP ผู้ใช้</TableHead>
                  <TableHead>เซิร์ฟเวอร์</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="p-0">
                      <EmptyState
                        className="border-0 bg-transparent py-10"
                        title="ยังไม่มีบันทึก"
                        description="ยังไม่มี login/logout ในระบบ"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row, idx) => (
                    <TableRow key={row.id}>
                      <TableCell className="tabular-nums">{idx + 1}</TableCell>
                      <TableCell className="whitespace-nowrap text-body-sm tabular-nums">
                        {row.actionTime
                          ? new Date(row.actionTime).toLocaleString('th-TH')
                          : '—'}
                      </TableCell>
                      <TableCell>{formatAction(row.action)}</TableCell>
                      <TableCell className="font-mono text-xs tabular-nums">
                        {formatClientIp(row.userIp)}
                      </TableCell>
                      <TableCell className="font-mono text-xs tabular-nums">
                        {formatServerHost(row.myIp)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </AppCard>
      )}
    </AppPageShell>
  )
}
