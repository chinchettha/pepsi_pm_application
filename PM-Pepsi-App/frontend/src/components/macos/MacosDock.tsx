import { cn } from '@/lib/utils'
import {
  FolderKanban,
  Home,
  MessagesSquare,
  Settings,
  Shield,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

type DockItem = {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export function MacosDock() {
  const navigate = useNavigate()
  const location = useLocation()
  const [hoverId, setHoverId] = useState<string | null>(null)

  const items = useMemo<DockItem[]>(
    () => [
      { id: 'console', label: 'Console', href: '/admin', icon: Home },
      { id: 'users', label: 'Users', href: '/admin/users', icon: Users },
      { id: 'roles', label: 'Roles', href: '/admin/roles', icon: Shield },
      { id: 'menu', label: 'Menu', href: '/admin/menu', icon: FolderKanban },
      { id: 'ann', label: 'Announcements', href: '/admin/announcements', icon: MessagesSquare },
      { id: 'settings', label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
    [],
  )

  const activeId = useMemo(() => {
    const m = items.find((it) => location.pathname === it.href)
    if (m) return m.id
    if (location.pathname === '/admin') return 'console'
    const best = items
      .filter((it) => it.href !== '/admin')
      .sort((a, b) => b.href.length - a.href.length)
      .find((it) => location.pathname.startsWith(it.href))
    return best?.id ?? null
  }, [items, location.pathname])

  return (
    <div className="macos-dock fixed inset-x-0 bottom-3 z-[60]">
      <div className="mx-auto w-fit">
        <div className="macos-dock-glass flex items-end gap-2 rounded-[18px] border px-3 py-2">
          {items.map((it) => {
            const Icon = it.icon
            const isActive = activeId === it.id
            const isHover = hoverId === it.id
            return (
              <button
                key={it.id}
                type="button"
                className={cn('macos-dock-item group relative', isActive && 'is-active')}
                onMouseEnter={() => setHoverId(it.id)}
                onMouseLeave={() => setHoverId(null)}
                onClick={() => navigate(it.href)}
                aria-label={it.label}
              >
                <span className={cn('macos-dock-icon', isHover && 'is-hover')}>
                  <Icon className="size-[20px]" aria-hidden />
                </span>
                <span className="macos-dock-dot" aria-hidden />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

