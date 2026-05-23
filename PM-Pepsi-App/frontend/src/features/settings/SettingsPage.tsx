import { AppCard } from '@/components/layout/AppCard'
import { AppPageShell } from '@/components/layout/AppPageShell'
import { ProfilePanel } from '@/features/settings/ProfilePanel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { apiUrl, getApiBaseUrl } from '@/lib/api-client'
import { fetchPublicHealth } from '@/lib/health-api'
import { fetchUsers } from '@/lib/api-public'
import { usePermission } from '@/lib/use-permission'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AlertCircle, RefreshCcw } from 'lucide-react'

export function SettingsPage() {
  const canRead = usePermission('admin.settings.read')

  const health = useQuery({
    queryKey: ['health'],
    queryFn: fetchPublicHealth,
    enabled: canRead,
    placeholderData: keepPreviousData,
    retry: 1,
  })

  const users = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled: canRead,
    placeholderData: keepPreviousData,
  })

  if (!canRead) {
    return (
      <AppPageShell title="ตั้งค่า" description="โปรไฟล์และการเชื่อมต่อระบบ">
        <EmptyState
          icon={AlertCircle}
          title="ไม่มีสิทธิ์เข้าถึง"
          description={
            <>
              ต้องมีสิทธิ์ <code className="text-xs">admin.settings.read</code>
            </>
          }
        />
      </AppPageShell>
    )
  }

  return (
    <AppPageShell
      title="ตั้งค่า"
      description="โปรไฟล์ผู้ใช้ · ตรวจการเชื่อมต่อ API · รายชื่อผู้ใช้ระบบ"
      contentClassName="mx-auto max-w-4xl space-y-4"
    >
      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">โปรไฟล์</TabsTrigger>
          <TabsTrigger value="connection">การเชื่อมต่อ</TabsTrigger>
          <TabsTrigger value="users">ผู้ใช้ระบบ</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <ProfilePanel />
        </TabsContent>

        <TabsContent value="connection" className="mt-4 space-y-4">
          <AppCard pad="compact" className="space-y-2">
            <h3 className="text-body-sm font-semibold text-app">ที่อยู่ API</h3>
            <p className="text-body-sm">
              <span className="font-medium">VITE_API_URL:</span>{' '}
              <code className="rounded bg-app-muted px-2 py-1 text-xs">
                {getApiBaseUrl() || '(ว่าง = same-origin)'}
              </code>
            </p>
            <p className="text-body-sm">
              Health:{' '}
              <code className="rounded bg-app-muted px-2 py-1 text-xs">
                {apiUrl('/api/v1/health')}
              </code>
            </p>
            <p className="text-xs text-app-muted">ดูค่าใน `.env` / `.env.example`</p>
          </AppCard>

          <AppCard pad="compact">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-body-sm font-semibold text-app">สุขภาพ API</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void health.refetch()}
                disabled={health.isFetching}
              >
                <RefreshCcw
                  className={`mr-1 size-3.5 ${health.isFetching ? 'animate-spin' : ''}`}
                  aria-hidden
                />
                รีเฟรช
              </Button>
            </div>
            {health.isLoading && !health.data ? (
              <div className="mt-3 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-full max-w-md" />
              </div>
            ) : health.isError ? (
              <EmptyState
                icon={AlertCircle}
                className="mt-3 border-0 bg-transparent py-6"
                title="เชื่อมต่อ API ไม่ได้"
                description={(health.error as Error).message}
                action={{ label: 'ลองใหม่', onClick: () => void health.refetch() }}
              />
            ) : health.data ? (
              <dl className="mt-3 grid gap-2 text-body-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-app-muted">สถานะ</dt>
                  <dd>
                    <Badge className="bg-emerald-700">พร้อม</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-app-muted">เวลาเซิร์ฟเวอร์</dt>
                  <dd className="tabular-nums">
                    {health.data.time
                      ? new Date(health.data.time).toLocaleString('th-TH')
                      : '—'}
                  </dd>
                </div>
              </dl>
            ) : null}
          </AppCard>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          {users.isLoading && !users.data ? (
            <Skeleton className="h-40 w-full rounded-card" />
          ) : users.isError ? (
            <EmptyState
              icon={AlertCircle}
              title="โหลดรายชื่อผู้ใช้ไม่สำเร็จ"
              description={(users.error as Error).message}
              action={{ label: 'ลองใหม่', onClick: () => void users.refetch() }}
            />
          ) : (
            <AppCard pad="compact" className="p-0">
              <div className="app-table-shell overflow-x-auto">
                <Table embedded stickyHeader zebra>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>ชื่อผู้ใช้</TableHead>
                      <TableHead>บทบาท</TableHead>
                      <TableHead>ใช้งาน</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(users.data ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="p-0">
                          <EmptyState
                            className="border-0 bg-transparent py-8"
                            title="ไม่มีข้อมูล"
                          />
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.data?.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>{u.id}</TableCell>
                          <TableCell className="font-mono text-body-sm">{u.username}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{u.role}</Badge>
                          </TableCell>
                          <TableCell>{u.active ? 'ใช่' : 'ไม่'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </AppCard>
          )}
        </TabsContent>
      </Tabs>
    </AppPageShell>
  )
}
