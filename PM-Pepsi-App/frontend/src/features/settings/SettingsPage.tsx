import { PageHeader } from '@/components/layout/PageHeader'
import { ProfilePanel } from '@/features/settings/ProfilePanel'
import { PlaceholderBlock } from '@/components/layout/PlaceholderBlock'
import { Badge } from '@/components/ui/badge'
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
import { fetchApi } from '@/lib/fetch-api'
import { fetchUsers } from '@/lib/api-public'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

const healthSchema = z.object({
  ok: z.boolean(),
  service: z.string().optional(),
  time: z.string().optional(),
  db: z.enum(['ok', 'error']).optional(),
})

async function fetchHealth() {
  const json = await fetchApi<unknown>('/api/v1/health')
  return healthSchema.parse(json)
}

export function SettingsPage() {
  const health = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    retry: 0,
  })

  const users = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })

  return (
    <div>
      <PageHeader
        title="ตั้งค่า"
        description="การเชื่อมต่อ API, ผู้ใช้ — เทียบ user.php, member.php, ค่า config ใน define/connection เดิม"
      >
        <Badge variant="secondary">แท็บ</Badge>
      </PageHeader>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
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
            <PlaceholderBlock title="Base URL">
              <p className="mb-2 text-sm">
                <span className="font-medium">VITE_API_URL:</span>{' '}
                <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs">
                  {getApiBaseUrl() || '(ว่าง = same-origin)'}
                </code>
                {' → '}
                <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs">
                  {apiUrl('/api/v1/health')}
                </code>
              </p>
              <p className="text-xs text-zinc-500">ดู `.env.example`</p>
            </PlaceholderBlock>
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-zinc-900">สุขภาพ API</h3>
              {health.isLoading ? (
                <div className="mt-3 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-full max-w-md" />
                </div>
              ) : health.isError ? (
                <p className="mt-2 text-sm text-red-600">{(health.error as Error).message}</p>
              ) : (
                <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-100 p-3 text-xs text-zinc-800">
                  {JSON.stringify(health.data, null, 2)}
                </pre>
              )}
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            {users.isLoading ? (
              <Skeleton className="h-40 w-full rounded-xl" />
            ) : users.isError ? (
              <p className="text-sm text-red-600">{(users.error as Error).message}</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>ใช้งาน</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.data?.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.id}</TableCell>
                        <TableCell className="font-mono text-sm">{u.username}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{u.role}</Badge>
                        </TableCell>
                        <TableCell>{u.active ? 'ใช่' : 'ไม่'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
