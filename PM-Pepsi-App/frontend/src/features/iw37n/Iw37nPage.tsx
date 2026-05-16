import { PageHeader } from '@/components/layout/PageHeader'
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
import { fetchIw37nBatches, postIw37nImport } from '@/lib/api-public'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Upload } from 'lucide-react'
import { useRef } from 'react'
import { toast } from 'sonner'

export function Iw37nPage() {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const batches = useQuery({
    queryKey: ['iw37n-batches'],
    queryFn: fetchIw37nBatches,
  })

  const importMut = useMutation({
    mutationFn: postIw37nImport,
    onSuccess: (batch) => {
      toast.success(
        `นำเข้า ${batch.fileName}: ${batch.rows} แถว (${batch.status}) — SHA ${batch.sha256.slice(0, 8)}…`,
      )
      void qc.invalidateQueries({ queryKey: ['iw37n-batches'] })
      void qc.invalidateQueries({ queryKey: ['dashboard'] })
      void qc.invalidateQueries({ queryKey: ['work-orders'] })
      void qc.invalidateQueries({ queryKey: ['calendar'] })
      void qc.invalidateQueries({ queryKey: ['backlog'] })
      if (fileRef.current) fileRef.current.value = ''
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const runImport = () => {
    const f = fileRef.current?.files?.[0]
    if (!f) {
      toast.message('เลือกไฟล์ .xls / .xlsx / .csv ก่อน')
      return
    }
    importMut.mutate(f)
  }

  return (
    <div>
      <PageHeader
        title="IW37N / นำเข้า SAP"
        description="อัปโหลด Excel ตาม M_iw37n.php — แมปคอลัมน์ SAP, upsert ลง app.tbiw37n, บันทึก SHA256"
      >
        <Badge variant="secondary">Import</Badge>
        <Badge className="bg-amber-700">API + DB</Badge>
      </PageHeader>

      <div className="space-y-6 px-4 py-6 sm:px-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900">นำเข้าไฟล์</h3>
          <p className="mt-1 text-xs text-zinc-500">
            รูปแบบเดียวกับ PHP: ข้าม 2 แถวแรก, คีย์ซ้ำ wkorder + opac → UPDATE
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-zinc-600">เลือกไฟล์</label>
              <Input
                ref={fileRef}
                type="file"
                accept=".xls,.xlsx,.csv"
              />
            </div>
            <Button
              type="button"
              onClick={runImport}
              disabled={importMut.isPending}
              className="gap-2"
            >
              <Upload className="size-4" />
              {importMut.isPending ? 'กำลังนำเข้า…' : 'เริ่มนำเข้า'}
            </Button>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-zinc-900">ประวัติการนำเข้า</h3>
          {batches.isLoading ? (
            <Skeleton className="h-40 w-full rounded-xl" />
          ) : batches.isError ? (
            <p className="text-sm text-red-600">{(batches.error as Error).message}</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ไฟล์</TableHead>
                    <TableHead>วันที่</TableHead>
                    <TableHead className="text-right">แถว</TableHead>
                    <TableHead>SHA256</TableHead>
                    <TableHead>สถานะ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(batches.data?.length ?? 0) === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-sm text-zinc-500">
                        ยังไม่มีประวัติ — รัน migration 006 แล้วนำเข้าไฟล์แรก
                      </TableCell>
                    </TableRow>
                  ) : (
                    batches.data?.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="max-w-[220px] truncate text-sm font-medium">
                          {b.fileName}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs">
                          {b.importedAt.slice(0, 19).replace('T', ' ')}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{b.rows}</TableCell>
                        <TableCell className="max-w-[120px] truncate font-mono text-xs text-zinc-500">
                          {b.sha256}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={b.status === 'OK' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {b.status}
                          </Badge>
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
    </div>
  )
}
