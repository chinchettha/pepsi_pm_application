import { PepsiBrandMark } from '@/components/brand/PepsiBrandMark'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { logoLoginStyle, logoNavStyle } from '@/lib/branding-asset-css'
import { cn } from '@/lib/utils'
import { ImageIcon, Upload } from 'lucide-react'
import type { ChangeEvent } from 'react'

export type LogoUploadCardProps = {
  hasLogo: boolean
  logoPreviewSrc: string | null
  logoNavHeightPx: number
  logoLoginHeightPx: number
  canWrite: boolean
  removeBackground: boolean
  onRemoveBackgroundChange: (value: boolean) => void
  uploadPending: boolean
  deletePending: boolean
  onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void
  onDelete: () => void
}

export function LogoUploadCard({
  hasLogo,
  logoPreviewSrc,
  logoNavHeightPx,
  logoLoginHeightPx,
  canWrite,
  removeBackground,
  onRemoveBackgroundChange,
  uploadPending,
  deletePending,
  onFileSelect,
  onDelete,
}: LogoUploadCardProps) {
  return (
    <Card className="admin-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="size-5" aria-hidden />
          โลโก้
        </CardTitle>
        <CardDescription>PNG / JPEG / WebP / SVG → แปลงเป็น WebP สูงสุด 256px</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-start gap-6">
          {logoPreviewSrc ? (
            <>
              <div className="space-y-1">
                <p className="text-xs text-app-muted">เมนู ({logoNavHeightPx}px)</p>
                <img
                  src={logoPreviewSrc}
                  alt=""
                  className="rounded-card object-contain ring-1 ring-app"
                  style={logoNavStyle(logoNavHeightPx)}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-app-muted">Login ({logoLoginHeightPx}px)</p>
                <img
                  src={logoPreviewSrc}
                  alt=""
                  className="rounded-card object-contain ring-1 ring-app"
                  style={logoLoginStyle(logoLoginHeightPx)}
                />
              </div>
            </>
          ) : (
            <PepsiBrandMark size="lg" />
          )}
          <p className="text-caption">
            {logoPreviewSrc
              ? uploadPending
                ? 'กำลังอัปโหลด… แสดงตัวอย่างจากไฟล์ที่เลือก'
                : 'ใช้โลโก้กำหนดเอง'
              : 'ใช้โลโก้ Pepsi เริ่มต้น'}
          </p>
        </div>
        {canWrite ? (
          <label className="flex cursor-pointer items-center gap-2 text-body-sm text-app">
            <input
              type="checkbox"
              className="size-4 rounded border-app"
              checked={removeBackground}
              onChange={(e) => onRemoveBackgroundChange(e.target.checked)}
            />
            ลบพื้นหลังสว่างอัตโนมัติ (พื้นขาว/เทาอ่อน)
          </label>
        ) : null}
        {canWrite ? (
          <div className="flex flex-wrap gap-2">
            <Label
              className={cn(
                'inline-flex cursor-pointer items-center gap-2 rounded-button border border-app bg-[var(--app-surface)] px-3 py-2 text-body-sm font-medium hover:bg-app-subtle',
                uploadPending && 'pointer-events-none opacity-60',
              )}
            >
              <Upload className="size-4" aria-hidden />
              อัปโหลดโลโก้
              <input type="file" accept="image/*" className="sr-only" onChange={onFileSelect} />
            </Label>
            {hasLogo ? (
              <Button type="button" variant="outline" disabled={deletePending} onClick={onDelete}>
                ลบโลโก้
              </Button>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
