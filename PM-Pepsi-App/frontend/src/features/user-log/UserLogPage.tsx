import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
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
import { useQuery } from '@tanstack/react-query'

export function UserLogPage() {
  const q = useQuery({
    queryKey: ['user-log', 50, 0],
    queryFn: () => fetchUserLog({ limit: 50, offset: 0 }),
    retry: 0,
  })

  return (
    <div>
      <PageHeader title="User Log" description="เทียบ M_UserLog.php — รายการ login/logout ของผู้ใช้">
        <Badge variant="secondary">GET /api/v1/user-log</Badge>
        <Badge className="bg-violet-700">API + DB</Badge>
      </PageHeader>

      <div className="space-y-6 px-4 py-6 sm:px-6">
        {q.isLoading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : q.isError ? (
          <p className="text-sm text-red-600">{(q.error as Error).message}</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>userIp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(q.data ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-sm text-zinc-500">
                      No logs
                    </TableCell>
                  </TableRow>
                ) : (
                  (q.data ?? []).map((row, idx) => (
                    <TableRow key={row.id}>
                      <TableCell className="tabular-nums">{idx + 1}</TableCell>
                      <TableCell className="tabular-nums">
                        {row.actionTime ? new Date(row.actionTime).toLocaleString() : ''}
                      </TableCell>
                      <TableCell className="uppercase">{row.action}</TableCell>
                      <TableCell className="tabular-nums text-center">
                        {row.myIp ?? row.userIp ?? ''}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}

