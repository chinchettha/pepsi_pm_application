import { MovePlanDialog } from '@/components/scheduling/MovePlanDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetchWorkOrderDetail } from '@/lib/api-public'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

type WorkOrderDetailDialogProps = {
  orderId: string | null
  onOpenChange: (open: boolean) => void
}

export function WorkOrderDetailDialog({ orderId, onOpenChange }: WorkOrderDetailDialogProps) {
  const open = Boolean(orderId)
  const [moveOpen, setMoveOpen] = useState(false)

  const detailQ = useQuery({
    queryKey: ['work-order', orderId],
    queryFn: () => fetchWorkOrderDetail(orderId!),
    enabled: open,
  })

  const d = detailQ.data

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="pr-8">
              {d ? (
                <span className="flex flex-wrap items-center gap-2">
                  <span>{d.title}</span>
                  {d.team ? <Badge variant="secondary">TEAM {d.team}</Badge> : null}
                </span>
              ) : (
                'รายละเอียดใบงาน'
              )}
            </DialogTitle>
            <DialogDescription>
              เทียบ `ModalOrderDetail.php` — แท็บ Work Order / Planning / Task / Machine / Material
            </DialogDescription>
          </DialogHeader>

          {detailQ.isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : detailQ.isError ? (
            <p className="text-sm text-red-600">{(detailQ.error as Error).message}</p>
          ) : d ? (
            <Tabs defaultValue="work-order" className="w-full">
              <TabsList className="flex h-auto w-full flex-wrap gap-1">
                <TabsTrigger value="work-order">Work Order</TabsTrigger>
                <TabsTrigger value="task-list">Task List</TabsTrigger>
                <TabsTrigger value="machine">Machine</TabsTrigger>
                {d.canMovePlan ? (
                  <TabsTrigger value="planning">Planning</TabsTrigger>
                ) : null}
                <TabsTrigger value="material">Material</TabsTrigger>
              </TabsList>

              <TabsContent value="work-order" className="space-y-2 text-sm">
                <p>
                  <span className="font-medium text-zinc-700">เลขที่ WO:</span> {d.wkorder}
                </p>
                <p>
                  <span className="font-medium text-zinc-700">Id:</span> {d.id}
                </p>
                <p>
                  <span className="font-medium text-zinc-700">สถานะ:</span>{' '}
                  <Badge style={{ backgroundColor: d.statusColor }} className="text-white">
                    {d.status}
                  </Badge>
                </p>
                <p>
                  <span className="font-medium text-zinc-700">ประเภท:</span> {d.orderType}{' '}
                  {d.mat ? `· mat ${d.mat}` : ''}
                </p>
                <p>
                  <span className="font-medium text-zinc-700">อุปกรณ์:</span> {d.equipment}
                </p>
                <p>
                  <span className="font-medium text-zinc-700">Functional loc.:</span> {d.functLoc}
                </p>
                <p>
                  <span className="font-medium text-zinc-700">WC:</span> {d.workCenter}
                </p>
                <p>
                  <span className="font-medium text-zinc-700">วางแผน:</span> {d.plannedDate || '—'}
                </p>
                <p>
                  <span className="font-medium text-zinc-700">ปิดงาน:</span> {d.finishDate || '—'}
                </p>
                <p className="text-zinc-600">{d.description}</p>
              </TabsContent>

              <TabsContent value="task-list" className="text-sm text-zinc-600">
                <p>เทียบ `TabTarkList.php` — จะเชื่อม task list API ในลำดับถัดไป</p>
              </TabsContent>

              <TabsContent value="machine" className="text-sm text-zinc-600">
                <p>เทียบ `TabMachine.php` — จะเชื่อม machine list API ในลำดับถัดไป</p>
              </TabsContent>

              <TabsContent value="planning" className="space-y-3 text-sm">
                {d.movePlan ? (
                  <div className="rounded-lg border border-orange-200 bg-orange-50/80 p-3">
                    <p className="font-medium text-orange-900">ย้ายแผนแล้ว</p>
                    <p>วันที่ย้าย: {d.movePlan.movedDate}</p>
                    <p>จำนวนครั้ง: {d.movePlan.moveCount}</p>
                    <p>
                      เหตุผล: {d.movePlan.reasonCode} — {d.movePlan.reasonName}
                    </p>
                    <p>โดย WC: {d.movePlan.movedByWkctr}</p>
                  </div>
                ) : (
                  <p className="text-zinc-600">ยังไม่มีการย้ายแผน</p>
                )}
                {d.canMovePlan ? (
                  <Button type="button" variant="outline" onClick={() => setMoveOpen(true)}>
                    ย้ายแผน (MovePlant)
                  </Button>
                ) : (
                  <p className="text-xs text-zinc-500">สถานะนี้ย้ายแผนไม่ได้ (ต้อง CRTD/REL)</p>
                )}
              </TabsContent>

              <TabsContent value="material" className="space-y-2 text-sm">
                {d.components.length === 0 ? (
                  <p className="text-zinc-600">เทียบ `TabMaterial.php` — ยังไม่มีข้อมูล material</p>
                ) : (
                  <ul className="list-disc pl-5">
                    {d.components.map((c) => (
                      <li key={c.material}>
                        {c.material} — {c.qty} {c.unit}
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
            </Tabs>
          ) : null}
        </DialogContent>
      </Dialog>

      {d && orderId ? (
        <MovePlanDialog
          open={moveOpen}
          onOpenChange={setMoveOpen}
          idiw37={d.id}
          wkorder={d.wkorder}
          defaultDate={d.movePlan?.movedDate || d.plannedDate}
          onSuccess={() => {
            void detailQ.refetch()
          }}
        />
      ) : null}
    </>
  )
}
