import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const SPINNER_SIZE = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
} as const

export function Spinner({
  size = 'md',
  label = 'กำลังโหลด…',
  className,
}: {
  size?: keyof typeof SPINNER_SIZE
  label?: string
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-app-muted', className)} role="status">
      <Loader2 className={cn('animate-spin', SPINNER_SIZE[size])} aria-hidden />
      <span className="text-caption">{label}</span>
    </span>
  )
}

export function SpinnerBlock({
  label = 'กำลังโหลด…',
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <div className={cn('flex justify-center py-8', className)}>
      <Spinner size="lg" label={label} />
    </div>
  )
}
