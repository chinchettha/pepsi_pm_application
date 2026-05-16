import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { fetchPersonnel } from '@/lib/api-public'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

function PersonnelTable({ tab }: { tab: 'all' | 'pending' }) {
  const q = useQuery({
    queryKey: ['personnel', tab],
    queryFn: () => fetchPersonnel(tab),
  })

  if (q.isLoading) return <Skeleton className="h-48 w-full rounded-lg" />
  if (q.isError) return <p className="text-sm text-red-600">{(q.error as Error).message}</p>

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>รหัส</TableHead>
            <TableHead>ชื่อ</TableHead>
            <TableHead>สายงาน</TableHead>
            <TableHead>WC</TableHead>
            <TableHead>สถานะยืนยัน</TableHead>
            <TableHead className="text-right">การทำงาน</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {q.data?.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-mono text-sm">{p.id}</TableCell>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.craft}</TableCell>
              <TableCell>{p.wc}</TableCell>
              <TableCell>
                <Badge variant={p.confirmStatus === 'OK' ? 'default' : 'secondary'}>
                  {p.confirmStatus === 'OK' ? 'ยืนยันแล้ว' : 'รอยืนยัน'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  disabled={p.confirmStatus === 'OK'}
                  onClick={() =>
                    toast.message('ยืนยันบุคลากร — ต่อ API M_personel_confirm')
                  }
                >
                  ยืนยัน
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function PersonnelPage() {
  const [tab, setTab] = useState<'all' | 'pending'>('all')

  return (
    <div>
      <PageHeader
        title="บุคลากร / ทีมช่าง"
        description="รายการและสถานะยืนยัน — เทียบ M_personel*, personel_form_tab*, M_personel_confirm"
      >
        <Badge variant="secondary">แท็บรอยืนยัน</Badge>
      </PageHeader>

      <div className="px-4 py-6 sm:px-6">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as 'all' | 'pending')}
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
            <TabsTrigger value="pending">รอยืนยัน</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <PersonnelTable tab="all" />
          </TabsContent>
          <TabsContent value="pending" className="mt-4">
            <PersonnelTable tab="pending" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
