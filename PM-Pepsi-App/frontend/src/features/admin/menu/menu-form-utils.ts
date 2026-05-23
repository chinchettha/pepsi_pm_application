export const MENU_ROLE_BITS = ['A', 'H', 'U', 'W'] as const

export const menuSelectClass =
  'flex h-10 w-full rounded-button border border-app bg-[var(--app-surface)] px-3 py-2 text-body-sm text-app focus-app-ring focus-visible:outline-none'

export function parseMenuright(value: string): Set<string> {
  return new Set(
    value
      .split(':')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean),
  )
}

export function formatMenuright(bits: Set<string>): string {
  return MENU_ROLE_BITS.filter((r) => bits.has(r)).join(':') || 'A'
}
