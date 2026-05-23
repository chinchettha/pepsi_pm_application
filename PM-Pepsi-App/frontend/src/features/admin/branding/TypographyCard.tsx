import type { AdminBranding } from '@/api/schemas'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_PRESET_OPTIONS,
  resolveBaseFontSizePx,
} from '@/lib/typography-tokens'
import { Type } from 'lucide-react'

const selectClass =
  'flex h-10 w-full rounded-button border border-app bg-[var(--app-surface)] px-3 text-body-sm text-app focus-visible:outline-none focus-app-ring'

type TypographyCardProps = {
  form: AdminBranding
  onChange: (patch: Partial<AdminBranding>) => void
  disabled?: boolean
}

export function TypographyCard({ form, onChange, disabled }: TypographyCardProps) {
  const basePx = resolveBaseFontSizePx(form.fontSizePreset, form.fontSizeBasePx)

  return (
    <Card className="admin-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Type className="size-4" />
          ตัวอักษรทั้งแอป
        </CardTitle>
        <CardDescription>
          ฟอนต์ · ขนาด · สีข้อความ — มีผลทุกหน้า (เมนู, Admin, ฟอร์ม) หลังบันทึก
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="font-family">แบบอักษร</Label>
          <select
            id="font-family"
            className={selectClass}
            disabled={disabled}
            value={form.fontFamily}
            onChange={(e) =>
              onChange({ fontFamily: e.target.value as AdminBranding['fontFamily'] })
            }
          >
            {FONT_FAMILY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="font-preset">ขนาดพื้นฐาน</Label>
          <select
            id="font-preset"
            className={selectClass}
            disabled={disabled}
            value={form.fontSizePreset}
            onChange={(e) =>
              onChange({ fontSizePreset: e.target.value as AdminBranding['fontSizePreset'] })
            }
          >
            {FONT_SIZE_PRESET_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label} (~{o.px}px)
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="font-base-px">ขนาดกำหนดเอง (px)</Label>
          <Input
            id="font-base-px"
            type="number"
            min={12}
            max={22}
            disabled={disabled}
            placeholder="ว่าง = ใช้ preset"
            value={form.fontSizeBasePx ?? ''}
            onChange={(e) => {
              const v = e.target.value.trim()
              onChange({ fontSizeBasePx: v ? Number(v) : null })
            }}
          />
          <p className="text-xs text-app-muted">
            ตอนนี้ ≈ {basePx}px · หัวข้อเมนู ≈ {Math.round(basePx * 0.95)}px · หัวข้อหน้า ≈{' '}
            {Math.round(basePx * 1.6)}px
          </p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="font-color">สีข้อความหลัก</Label>
          <div className="flex gap-2">
            <Input
              id="font-color"
              type="color"
              className="h-10 w-14 shrink-0 cursor-pointer p-1"
              disabled={disabled}
              value={form.fontColor ?? '#18181b'}
              onChange={(e) => onChange({ fontColor: e.target.value })}
            />
            <Input
              disabled={disabled}
              placeholder="#18181b หรือว่าง = ตามธีม"
              value={form.fontColor ?? ''}
              onChange={(e) => {
                const v = e.target.value.trim()
                onChange({ fontColor: v || null })
              }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="font-heading-color">สีหัวข้อ</Label>
          <div className="flex gap-2">
            <Input
              id="font-heading-color"
              type="color"
              className="h-10 w-14 shrink-0 cursor-pointer p-1"
              disabled={disabled}
              value={form.fontHeadingColor ?? '#004c97'}
              onChange={(e) => onChange({ fontHeadingColor: e.target.value })}
            />
            <Input
              disabled={disabled}
              placeholder="ว่าง = ตามธีม"
              value={form.fontHeadingColor ?? ''}
              onChange={(e) => {
                const v = e.target.value.trim()
                onChange({ fontHeadingColor: v || null })
              }}
            />
          </div>
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="font-muted-color">สีข้อความรอง</Label>
          <div className="flex gap-2">
            <Input
              id="font-muted-color"
              type="color"
              className="h-10 w-14 shrink-0 cursor-pointer p-1"
              disabled={disabled}
              value={form.fontMutedColor ?? '#71717a'}
              onChange={(e) => onChange({ fontMutedColor: e.target.value })}
            />
            <Input
              disabled={disabled}
              placeholder="#71717a หรือว่าง = ตามธีม"
              value={form.fontMutedColor ?? ''}
              onChange={(e) => {
                const v = e.target.value.trim()
                onChange({ fontMutedColor: v || null })
              }}
            />
          </div>
        </div>

        <div
          className="rounded-card border border-app bg-app-subtle p-4 sm:col-span-2"
          style={{ fontFamily: `var(--app-font-family)` }}
        >
          <p className="text-heading-page font-semibold text-[var(--app-heading-color,var(--app-primary))]">
            ตัวอย่างหัวข้อหน้า
          </p>
          <p className="mt-2 text-body text-[var(--app-text)]">
            ข้อความทั่วไปในตารางและฟอร์ม — อ่านสบายตาบนจอโรงงาน
          </p>
          <p className="text-caption mt-1">
            คำอธิบายรอง / วันที่ / สถานะ
          </p>
          <p className="nav-menu-group-heading mt-3">กลุ่มเมนูตัวอย่าง</p>
        </div>
      </CardContent>
    </Card>
  )
}
