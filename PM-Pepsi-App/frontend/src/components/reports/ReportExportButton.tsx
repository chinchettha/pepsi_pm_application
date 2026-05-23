import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Download, Loader2 } from 'lucide-react'

export type ReportExportFormat = 'csv' | 'xlsx' | 'excel'

const FORMAT_LABEL: Record<ReportExportFormat, string> = {
  csv: 'ดาวน์โหลด CSV',
  xlsx: 'ดาวน์โหลด Excel',
  excel: 'ดาวน์โหลด Excel',
}

export type ReportExportButtonProps = Omit<ButtonProps, 'children'> & {
  format?: ReportExportFormat
  /** ข้อความไทย — ถ้าไม่ระบุ ใช้ตาม `format` */
  label?: string
  loading?: boolean
  loadingLabel?: string
}

/** ปุ่มส่งออกรายงาน — ไอคอน Download + ข้อความไทย (มาตรฐาน U3) */
export function ReportExportButton({
  format,
  label,
  loading = false,
  loadingLabel = 'กำลังดาวน์โหลด…',
  className,
  disabled,
  variant = 'outline',
  size = 'sm',
  ...props
}: ReportExportButtonProps) {
  const text = loading
    ? loadingLabel
    : (label ?? (format ? FORMAT_LABEL[format] : 'ดาวน์โหลด'))

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn('gap-2', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
      ) : (
        <Download className="size-4 shrink-0" aria-hidden />
      )}
      <span>{text}</span>
    </Button>
  )
}
