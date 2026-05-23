import { cn } from '@/lib/utils'

/** แถบสามสี Pepsi (น้ำเงิน · ขาว · แดง) — Admin + แอปหลัก */
export function PepsiStripe({ className }: { className?: string }) {
  return (
    <div
      className={cn('admin-pepsi-stripe h-1 w-full shrink-0', className)}
      role="presentation"
      aria-hidden
    />
  )
}
