import { PageHeader } from '@/components/layout/PageHeader'
import { PlaceholderBlock } from '@/components/layout/PlaceholderBlock'
import { WorkOrderAutocomplete } from '@/components/scheduling/WorkOrderAutocomplete'
import { WorkOrderDetailDialog } from '@/components/scheduling/WorkOrderDetailDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { fetchWorkOrders, type WorkOrderListItem } from '@/lib/api-public'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useState } from 'react'

export function WorkOrdersPage() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [applied, setApplied] = useState({ q: '', status: '' })
  const [openId, setOpenId] = useState<string | null>(null)

  const listQuery = useQuery({
    queryKey: ['work-orders', applied],
    queryFn: () =>
      fetchWorkOrders({
        q: applied.q || undefined,
        status: applied.status || undefined,
      }),
  })

  const applyFilters = () => setApplied({ q: q.trim(), status })

  return (
    <div>
      <PageHeader
        title="ใบงาน (Work orders)"
        description="กรอง ค้นหา ดูรายละเอียด WO / operation / component — เทียบ workorder.php, W_confirm*, ModalOrderDetail"
      >
        <Badge variant="secondary">SAP-style fields</Badge>
      </PageHeader>

      <div className="space-y-4 px-4 py-6 sm:px-6">
        <div className="max-w-md space-y-1 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-4">
          <p className="text-xs font-medium text-zinc-700">ค้น wkorder (เทียบ `autocomplete.php`)</p>
          <WorkOrderAutocomplete
            value={q}
            onSelect={(item) => {
              setQ(item.wkorder)
              setOpenId(item.id)
            }}
          />
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1 space-y-1">
            <label className="text-xs font-medium text-zinc-600" htmlFor="wo-q">
              ค้นหา (เลขที่ / ชื่อ / equipment)
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <Input
                id="wo-q"
                className="pl-9"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                placeholder="เช่น 4000001 หรือ motor"
              />
            </div>
          </div>
          <div className="w-full space-y-1 sm:w-44">
            <label className="text-xs font-medium text-zinc-600" htmlFor="wo-st">
              สถานะระบบ
            </label>
            <select
              id="wo-st"
              className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">ทั้งหมด</option>
              <option value="REL">REL</option>
              <option value="CRTD">CRTD</option>
              <option value="TECO">TECO</option>
              <option value="CLSD">CLSD</option>
            </select>
          </div>
          <Button type="button" onClick={applyFilters}>
            ใช้ตัวกรอง
          </Button>
        </div>

        {listQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : listQuery.isError ? (
          <PlaceholderBlock title="โหลดใบงานไม่สำเร็จ">
            <p className="text-sm text-red-600">{(listQuery.error as Error).message}</p>
          </PlaceholderBlock>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>เลขที่</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>หัวข้อ</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>FunctLoc</TableHead>
                  <TableHead>WC</TableHead>
                  <TableHead>เริ่ม</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">รายละเอียด</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listQuery.data?.map((row: WorkOrderListItem) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-sm font-medium">{row.id}</TableCell>
                    <TableCell className="text-sm">{row.orderType}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">{row.title}</TableCell>
                    <TableCell className="font-mono text-xs">{row.equipment}</TableCell>
                    <TableCell className="font-mono text-xs">{row.functLoc}</TableCell>
                    <TableCell className="text-sm">{row.workCenter}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs">{row.basicStart}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        onClick={() => setOpenId(row.id)}
                      >
                        เปิด
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <WorkOrderDetailDialog orderId={openId} onOpenChange={(o) => !o && setOpenId(null)} />
    </div>
  )
}
