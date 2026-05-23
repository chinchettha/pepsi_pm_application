import type { BlockedIpItem } from '@/api/schemas'
import { ConfirmPhraseDialog } from '@/components/admin/ConfirmPhraseDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { blockIpAddress, unblockIpAddress } from '@/lib/admin-security-api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Ban, Loader2, ShieldOff } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

type BlockedIpCardProps = {
  items: BlockedIpItem[]
  canWrite: boolean
}

export function BlockedIpCard({ items, canWrite }: BlockedIpCardProps) {
  const qc = useQueryClient()
  const [ip, setIp] = useState('')
  const [reason, setReason] = useState('')
  const [expiresLocal, setExpiresLocal] = useState('')
  const [unblockTarget, setUnblockTarget] = useState<BlockedIpItem | null>(null)

  const blockMut = useMutation({
    mutationFn: blockIpAddress,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'security'] })
      setIp('')
      setReason('')
      setExpiresLocal('')
      toast.success('บล็อก IP แล้ว')
    },
    onError: (e: Error) => toast.error(e.message || 'บล็อกไม่สำเร็จ'),
  })

  const unblockMut = useMutation({
    mutationFn: unblockIpAddress,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'security'] })
      setUnblockTarget(null)
      toast.success('ปลดบล็อกแล้ว')
    },
    onError: (e: Error) => toast.error(e.message || 'ปลดบล็อกไม่สำเร็จ'),
  })

  const submitBlock = () => {
    const trimmed = ip.trim()
    if (!trimmed) return
    let expiresAt: string | null = null
    if (expiresLocal.trim()) {
      const d = new Date(expiresLocal)
      if (!Number.isNaN(d.getTime())) expiresAt = d.toISOString()
    }
    blockMut.mutate({ ip: trimmed, reason: reason.trim() || null, expiresAt })
  }

  return (
    <Card className="admin-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Ban className="size-4 text-red-600" />
          Block IP
          <Badge variant="secondary" className="ml-1 tabular-nums">
            {items.length}
          </Badge>
        </CardTitle>
        <CardDescription>
          บันทึกใน <code>tbl_blocked_ip</code> — API ทุกคำขอจาก IP นี้ได้ 403 (รวม login)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {canWrite ? (
          <div className="grid gap-3 rounded-card border border-app bg-app-subtle p-4 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="block-ip">ที่อยู่ IP</Label>
              <Input
                id="block-ip"
                placeholder="เช่น 203.0.113.50"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="block-reason">เหตุผล</Label>
              <Textarea
                id="block-reason"
                rows={2}
                placeholder="เช่น brute force / rate limit ซ้ำ"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="block-expires">หมดอายุ (ว่าง = ถาวร)</Label>
              <Input
                id="block-expires"
                type="datetime-local"
                value={expiresLocal}
                onChange={(e) => setExpiresLocal(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="destructive"
                disabled={!ip.trim() || blockMut.isPending}
                onClick={submitBlock}
              >
                {blockMut.isPending ? (
                  <Loader2 className="mr-1 size-4 animate-spin" />
                ) : (
                  <Ban className="mr-1 size-4" />
                )}
                บล็อก IP
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-caption">
            ต้องมีสิทธิ์ <code>admin.security.write</code> เพื่อบล็อก/ปลดบล็อก
          </p>
        )}

        <div className="overflow-x-auto rounded-card border border-app">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP</TableHead>
                <TableHead>เหตุผล</TableHead>
                <TableHead>บล็อกโดย</TableHead>
                <TableHead>หมดอายุ</TableHead>
                {canWrite ? <TableHead className="text-right">การกระทำ</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canWrite ? 5 : 4}
                    className="py-8 text-center text-caption"
                  >
                    ยังไม่มี IP ที่ถูกบล็อก
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">{row.ip}</TableCell>
                    <TableCell className="max-w-[160px] truncate text-xs">
                      {row.reason ?? '—'}
                    </TableCell>
                    <TableCell className="text-xs">{row.blockedBy}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs">
                      {row.expiresAt
                        ? new Date(row.expiresAt).toLocaleString('th-TH')
                        : 'ถาวร'}
                    </TableCell>
                    {canWrite ? (
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setUnblockTarget(row)}
                        >
                          <ShieldOff className="mr-1 size-3" />
                          ปลดบล็อก
                        </Button>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {unblockTarget ? (
        <ConfirmPhraseDialog
          open
          onOpenChange={(open) => !open && setUnblockTarget(null)}
          title="ปลดบล็อก IP"
          description={`${unblockTarget.ip} — จะเข้า API ได้ตามปกติ`}
          phrase="UNBLOCK"
          confirmLabel="ปลดบล็อก"
          loading={unblockMut.isPending}
          onConfirm={() => unblockMut.mutate(unblockTarget.id)}
        />
      ) : null}
    </Card>
  )
}

/** ปุ่มบล็อกด่วนจากตาราง rate limit */
export function BlockIpQuickButton({
  ip,
  canWrite,
}: {
  ip: string
  canWrite: boolean
}) {
  const qc = useQueryClient()
  const mut = useMutation({
    mutationFn: () => blockIpAddress({ ip, reason: 'Blocked from security dashboard' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'security'] })
      toast.success(`บล็อก ${ip} แล้ว`)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (!canWrite) return null

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="h-7 text-xs"
      disabled={mut.isPending}
      onClick={() => mut.mutate()}
    >
      บล็อก
    </Button>
  )
}
