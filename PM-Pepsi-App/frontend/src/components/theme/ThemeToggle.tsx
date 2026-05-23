import { Button } from '@/components/ui/button'
import { useTheme } from '@/providers/ThemeProvider'
import { Monitor, Moon, Sun } from 'lucide-react'

const labels: Record<string, string> = {
  light: 'โหมดสว่าง',
  dark: 'โหมดมืด',
  system: 'ตามระบบ',
}

type ThemeToggleProps = {
  variant?: 'icon' | 'compact'
  className?: string
}

export function ThemeToggle({ variant = 'icon', className }: ThemeToggleProps) {
  const { resolvedTheme, serverThemeMode, preference, toggleTheme, resetToServerDefault } =
    useTheme()

  const followingServer = preference === null
  const serverLabel = labels[serverThemeMode] ?? serverThemeMode

  if (variant === 'compact') {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={className}
        onClick={toggleTheme}
        title={
          followingServer
            ? `สลับธีม (ค่าเริ่มต้น: ${serverLabel})`
            : `สลับธีม (กำหนดเอง — คลิกขวาคืนค่าเริ่มต้น)`
        }
        onContextMenu={(e) => {
          e.preventDefault()
          resetToServerDefault()
        }}
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="mr-2 size-4" aria-hidden />
        ) : (
          <Moon className="mr-2 size-4" aria-hidden />
        )}
        {resolvedTheme === 'dark' ? 'สว่าง' : 'มืด'}
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      onClick={toggleTheme}
      aria-label={resolvedTheme === 'dark' ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
      title={
        followingServer
          ? `ธีม: ${resolvedTheme === 'dark' ? 'มืด' : 'สว่าง'} (ตาม ${serverLabel}) — คลิกสลับ`
          : `ธีม: ${resolvedTheme === 'dark' ? 'มืด' : 'สว่าง'} (กำหนดเอง) — คลิกขวาคืนค่า admin`
      }
      onContextMenu={(e) => {
        e.preventDefault()
        resetToServerDefault()
      }}
    >
      {followingServer && serverThemeMode === 'system' ? (
        <Monitor className="size-5" aria-hidden />
      ) : resolvedTheme === 'dark' ? (
        <Sun className="size-5" aria-hidden />
      ) : (
        <Moon className="size-5" aria-hidden />
      )}
    </Button>
  )
}
