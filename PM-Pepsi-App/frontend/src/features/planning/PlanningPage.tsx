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
import { fetchPlanning } from '@/lib/api-public'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  OPEN: { label: 'รอจ่ายงาน', variant: 'secondary' },
  CONF: { label: 'จ่ายแล้ว', variant: 'default' },
  CLOS: { label: 'ปิด', variant: 'outline' },
}

export function PlanningPage() {
  const q = useQuery({ queryKey: ['planning'], queryFn: fetchPlanning })

  return (
    <div>
      <PageHeader
        title="แผน PM / CM"
        description="Plan Work View — เทียบ M_planwork_view.php (view_planwork, CRTD/REL ตาม work center ที่ login)"
      >
        <Badge variant="secondary">CRTD + REL</Badge>
        <Badge className="bg-teal-700">API + DB</Badge>
      </PageHeader>

      <div className="px-4 py-6 sm:px-6">
        <p className="mb-4 text-xs text-zinc-500">
          แสดงเฉพาะใบงานของ work center ของคุณ — กดเลข WO เพื่อดูรายละเอียด
        </p>
        {q.isLoading ? (
          <Skeleton className="h-56 w-full rounded-xl" />
        ) : q.isError ? (
          <p className="text-sm text-red-600">{(q.error as Error).message}</p>
        ) : (q.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-zinc-600">
            ไม่มีแผนเปิด — นำเข้า IW37N หรือตรวจว่า `wkctr` ตรงกับ user ที่ login
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>WO</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>รายละเอียด</TableHead>
                  <TableHead>สาย / FL</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>ย้ายแผน</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>ผู้รับ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {q.data?.map((p) => {
                  const st = statusMap[p.status] ?? { label: p.status, variant: 'outline' as const }
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Link
                          to={`/work-orders`}
                          className="font-mono text-sm text-blue-700 hover:underline"
                          title="ดูในรายการใบงาน"
                        >
                          {p.wkorder ?? p.id}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">{p.wktype ?? '—'}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm">{p.planName}</TableCell>
                      <TableCell className="text-sm">{p.line}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{p.planDate ?? '—'}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{p.movedDate ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{p.owner || '—'}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
