import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { buildBoardUrl } from '@/lib/board-kiosk'
import {
  clearAdminBoardKioskToken,
  fetchAdminBoardKiosk,
  patchAdminBoardKiosk,
  rotateAdminBoardKioskToken,
} from '@/lib/board-kiosk-api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Copy, Monitor, RefreshCw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function BoardKioskCard({ canWrite }: { canWrite: boolean }) {
  const qc = useQueryClient()
  const [lastUrl, setLastUrl] = useState<string | null>(null)

  const q = useQuery({
    queryKey: ['admin', 'board-kiosk'],
    queryFn: fetchAdminBoardKiosk,
  })

  const patchMut = useMutation({
    mutationFn: patchAdminBoardKiosk,
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['admin', 'board-kiosk'] })
      void qc.invalidateQueries({ queryKey: ['board', 'kiosk-status'] })
      toast.success(data.enabled ? 'เปิดโหมด kiosk แล้ว' : 'ปิดโหมด kiosk แล้ว')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const rotateMut = useMutation({
    mutationFn: rotateAdminBoardKioskToken,
    onSuccess: (data) => {
      const url = buildBoardUrl(window.location.origin, data.token)
      setLastUrl(url)
      void qc.invalidateQueries({ queryKey: ['admin', 'board-kiosk'] })
      void qc.invalidateQueries({ queryKey: ['board', 'kiosk-status'] })
      toast.success('สร้าง kiosk token ใหม่แล้ว — คัดลอก URL ด้านล่าง')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const clearMut = useMutation({
    mutationFn: clearAdminBoardKioskToken,
    onSuccess: () => {
      setLastUrl(null)
      void qc.invalidateQueries({ queryKey: ['admin', 'board-kiosk'] })
      void qc.invalidateQueries({ queryKey: ['board', 'kiosk-status'] })
      toast.success('ลบ kiosk token แล้ว')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const data = q.data

  return (
    <Card className="admin-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="size-5" aria-hidden />
          Engineering Board (Kiosk / TV)
        </CardTitle>
        <CardDescription>
          เปิด <code className="text-xs">/board</code> โดยไม่ login — ใช้ token ใน URL สำหรับมอนิเตอร์แผนก
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {q.isLoading ? (
          <p className="text-caption">กำลังโหลด…</p>
        ) : data ? (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <Label className="flex items-center gap-2 text-body-sm">
                <input
                  type="checkbox"
                  className="size-4 rounded border-app"
                  checked={data.enabled}
                  disabled={!canWrite || patchMut.isPending}
                  onChange={(e) => patchMut.mutate({ enabled: e.target.checked })}
                />
                เปิดโหมด kiosk
              </Label>
              <span className="text-caption">
                {data.hasToken ? 'มี token แล้ว' : 'ยังไม่มี token — กดสร้าง token'}
              </span>
            </div>
            {canWrite ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="default"
                  disabled={rotateMut.isPending}
                  onClick={() => rotateMut.mutate()}
                >
                  <RefreshCw className="mr-2 size-4" aria-hidden />
                  {data.hasToken ? 'สร้าง token ใหม่' : 'สร้าง token'}
                </Button>
                {data.hasToken ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={clearMut.isPending}
                    onClick={() => {
                      if (!window.confirm('ลบ kiosk token? TV ต้องใช้ token ใหม่')) return
                      clearMut.mutate()
                    }}
                  >
                    <Trash2 className="mr-2 size-4" aria-hidden />
                    ลบ token
                  </Button>
                ) : null}
              </div>
            ) : null}
            {lastUrl ? (
              <div className="rounded-card border border-amber-200 bg-amber-50 p-3 text-body-sm text-amber-950">
                <p className="font-medium">URL สำหรับ TV (เก็บลับ — แสดงครั้งเดียวหลังสร้าง)</p>
                <code className="mt-2 block break-all text-xs">{lastUrl}</code>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    void navigator.clipboard.writeText(lastUrl)
                    toast.success('คัดลอก URL แล้ว')
                  }}
                >
                  <Copy className="mr-1 size-3.5" aria-hidden />
                  คัดลอก
                </Button>
              </div>
            ) : data.hasToken ? (
              <p className="text-xs text-app-muted">
                มี token อยู่แล้ว — กด「สร้าง token ใหม่」เพื่อดู URL อีกครั้ง (token เดิมจะใช้ไม่ได้)
              </p>
            ) : null}
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
