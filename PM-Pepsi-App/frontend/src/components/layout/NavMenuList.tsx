import type { NavEntry, NavLinkEntry } from '@/components/layout/nav-config'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'

export function NavMenuList({
  entries,
  variant,
  onNavigate,
  showMeta,
  navSource,
  userst,
  collapsed = false,
}: {
  entries: NavEntry[]
  variant: 'sidebar' | 'navbar'
  onNavigate?: () => void
  showMeta?: boolean
  navSource?: 'api' | 'fallback'
  userst?: string
  /** แถบไอคอน — ซ่อนข้อความ (desktop collapsed) */
  collapsed?: boolean
}) {
  if (variant === 'navbar') {
    return (
      <div
        className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1 gap-y-1"
        aria-label="เมนูหลัก"
      >
        {entries.map((entry, idx) =>
          entry.kind === 'heading' ? (
            <span
              key={`h-${idx}-${entry.label}`}
              className="nav-menu-group-heading nav-menu-group-heading--navbar hidden shrink-0 px-2 first:pl-0 sm:inline"
            >
              {entry.label}
            </span>
          ) : (
            <NavMenuLink
              key={entry.to}
              item={entry}
              variant="navbar"
              onNavigate={onNavigate}
            />
          ),
        )}
      </div>
    )
  }

  const nav = (
    <nav
      className={cn(
        'sidebar-nav flex flex-1 flex-col gap-0.5 overflow-y-auto',
        collapsed && 'sidebar-nav--collapsed',
        collapsed ? 'px-2 py-2' : 'px-2 py-2',
      )}
      aria-label="เมนูหลัก"
      data-collapsed={collapsed ? 'true' : 'false'}
    >
      {showMeta && !collapsed ? (
        <p className="mb-1 px-2 text-sidebar-muted">
          เมนูจาก <code className="opacity-80">tbmenu</code>
          {navSource === 'api' ? ' (API+DB)' : ' (fallback)'}
          {userst ? ` · ${userst}` : ''}
        </p>
      ) : null}
      {entries.map((entry, idx) =>
        entry.kind === 'heading' ? (
          <NavGroupHeading
            key={`h-${idx}-${entry.label}`}
            label={entry.label}
            collapsed={collapsed}
            isFirst={idx === 0}
          />
        ) : (
          <NavMenuLink
            key={entry.to}
            item={entry}
            variant="sidebar"
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ),
      )}
    </nav>
  )

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={200}>
        {nav}
      </TooltipProvider>
    )
  }

  return nav
}

function NavGroupHeading({
  label,
  collapsed,
  isFirst,
}: {
  label: string
  collapsed: boolean
  isFirst: boolean
}) {
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'sidebar-group-marker',
              !isFirst && 'sidebar-group-marker--spaced',
            )}
            aria-label={label}
          >
            <span className="sidebar-group-marker__line" aria-hidden />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div
      className={cn(
        'nav-menu-group-heading nav-menu-group-heading--sidebar',
        isFirst && 'nav-menu-group-heading--first',
      )}
    >
      {label}
    </div>
  )
}

function NavMenuLink({
  item,
  variant,
  onNavigate,
  collapsed = false,
}: {
  item: NavLinkEntry
  variant: 'sidebar' | 'navbar'
  onNavigate?: () => void
  collapsed?: boolean
}) {
  const Icon = item.icon as LucideIcon

  if (variant === 'navbar') {
    return (
      <NavLink
        to={item.to}
        end={item.end}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            'nav-menu-link nav-menu-link--navbar shrink-0 rounded-button px-3 py-2 text-body-sm font-medium transition-colors focus-app-ring focus-visible:outline-none',
            isActive
              ? 'nav-menu-link--active bg-[color-mix(in_srgb,var(--app-primary)_15%,white)] text-[var(--app-primary)]'
              : 'text-app-muted hover:bg-app-muted hover:text-app',
          )
        }
      >
        <span className="flex items-center gap-2">
          <Icon className="size-3.5" aria-hidden />
          {item.label}
        </span>
      </NavLink>
    )
  }

  const link = (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'nav-menu-link nav-menu-link--sidebar flex items-center rounded-card font-medium transition-[background,color,box-shadow] text-[length:var(--app-nav-link-size)] focus-app-ring focus-visible:outline-none',
          collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-3 py-2.5',
          isActive && 'nav-menu-link--active font-semibold',
        )
      }
    >
      <Icon className="nav-menu-link__icon size-4 shrink-0" aria-hidden />
      <span
        className={cn(
          'nav-menu-link__label min-w-0 leading-snug',
          collapsed && 'sr-only',
        )}
      >
        {item.label}
      </span>
    </NavLink>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    )
  }

  return link
}
