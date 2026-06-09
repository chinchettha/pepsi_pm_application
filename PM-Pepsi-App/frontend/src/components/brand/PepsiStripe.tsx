import { cn } from '@/lib/utils'

/** แถบ 6 สีโลโก้ลูกค้า (น้ำเงินเข้ม · ส้ม · เขียวเข้ม · เขียวอ่อน · ฟ้า · ขาว) — header hero */
export function PepsiStripe({ className }: { className?: string }) {
  return (
    <div
      className={cn('admin-pepsi-stripe h-1 w-full shrink-0', className)}
      role="presentation"
      aria-hidden
    />
  )
}
