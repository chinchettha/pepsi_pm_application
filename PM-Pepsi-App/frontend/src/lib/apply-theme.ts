import type { PublicSettings } from '@/api/schemas'
import type { ThemePreference } from '@/lib/theme-preference'
import { applyTypographyToDocument, typographyFromPublicSettings } from '@/lib/typography-tokens'

export type ResolvedTheme = 'light' | 'dark'
export type ServerThemeMode = 'light' | 'dark' | 'system'

const DEFAULT_PRIMARY = '#004C97'
const DEFAULT_ACCENT = '#E31837'
const DEFAULT_SUCCESS = '#34C759'
const DEFAULT_WARNING = '#FF9F0A'
const DEFAULT_DANGER = '#E31837'
const DEFAULT_INFO = '#0A84FF'

export function resolveTheme(
  serverMode: ServerThemeMode | undefined,
  preference: ThemePreference,
): ResolvedTheme {
  if (preference === 'light' || preference === 'dark') return preference
  const mode = serverMode ?? 'system'
  if (mode === 'light') return 'light'
  if (mode === 'dark') return 'dark'
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '').trim()
  if (h.length !== 6) return '255, 59, 48'
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  if ([r, g, b].some((n) => Number.isNaN(n))) return '255, 59, 48'
  return `${r}, ${g}, ${b}`
}

/** Apply Pepsi / admin branding colors + light/dark surface tokens to `document.documentElement`. */
export function applyThemeToDocument(
  settings: PublicSettings | undefined,
  resolved: ResolvedTheme,
): void {
  const root = document.documentElement
  const primary = settings?.primaryColor?.trim() || DEFAULT_PRIMARY
  const accent = settings?.accentColor?.trim() || DEFAULT_ACCENT
  const success = settings?.successColor?.trim() || DEFAULT_SUCCESS
  const warning = settings?.warningColor?.trim() || DEFAULT_WARNING
  const danger = settings?.dangerColor?.trim() || DEFAULT_DANGER
  const info = settings?.infoColor?.trim() || DEFAULT_INFO

  root.style.setProperty('--app-primary', primary)
  root.style.setProperty('--app-accent', accent)
  root.style.setProperty('--app-primary-rgb', hexToRgb(primary))
  root.style.setProperty('--app-accent-rgb', hexToRgb(accent))
  root.style.setProperty('--brand-pepsi-red', accent)
  root.style.setProperty('--brand-pepsi-blue', primary)
  root.style.setProperty('--admin-success', success)
  root.style.setProperty('--admin-warning', warning)
  root.style.setProperty('--admin-danger', danger)
  root.style.setProperty('--admin-info', info)

  /* Sidebar — Light: พื้นเทา #EAEAEA + ตัวอักษรเข้ม · Dark: โทน slate + ข้อความขาว */
  if (resolved === 'dark') {
    root.style.setProperty('--app-sidebar-fg', 'rgba(255, 255, 255, 0.94)')
    root.style.setProperty('--app-sidebar-fg-muted', 'rgba(255, 255, 255, 0.72)')
    root.style.setProperty('--app-sidebar-border', 'rgba(255, 255, 255, 0.14)')
    root.style.setProperty('--app-sidebar-hover', 'rgba(255, 255, 255, 0.1)')
    root.style.setProperty('--app-sidebar-active', 'rgba(255, 255, 255, 0.18)')
  } else {
    root.style.setProperty('--app-sidebar-fg', '#1f2937')
    root.style.setProperty('--app-sidebar-fg-muted', '#6b7280')
    root.style.setProperty('--app-sidebar-border', '#d4d4d8')
    root.style.setProperty('--app-sidebar-hover', `color-mix(in srgb, ${primary} 10%, #eaeaea)`)
    root.style.setProperty('--app-sidebar-active', `color-mix(in srgb, ${primary} 16%, #eaeaea)`)
  }

  root.classList.toggle('dark', resolved === 'dark')
  root.dataset.theme = resolved

  if (resolved === 'dark') {
    // skill-theme.md §1 — cinematic dark; ข้อความ/accent สว่างพอบนพื้นมืด
    root.style.setProperty('--app-bg', '#0f172a')
    root.style.setProperty('--app-surface', '#1e293b')
    root.style.setProperty('--app-surface-muted', '#334155')
    root.style.setProperty('--app-text', '#f8fafc')
    root.style.setProperty('--app-text-muted', '#cbd5e1')
    root.style.setProperty('--app-border', '#475569')
    root.style.setProperty('--app-sidebar', '#1e293b')
    root.style.setProperty('--app-accent', '#60a5fa')
    root.style.setProperty('--app-glass-bg', 'rgba(30, 41, 59, 0.78)')
    root.style.setProperty('--app-glass-border', 'rgba(255, 255, 255, 0.14)')
  } else {
    // skill-theme.md §13.4 — corporate flat #EEF2F7 (ไม่ใช้ gradient หลายสี)
    root.style.setProperty('--app-bg', '#eef2f7')
    root.style.setProperty('--app-surface', '#ffffff')
    root.style.setProperty('--app-surface-muted', '#f4f4f5')
    root.style.setProperty('--app-text', '#18181b')
    root.style.setProperty('--app-text-muted', '#71717a')
    root.style.setProperty('--app-border', '#e4e4e7')
    /* พื้น sidebar เทา corporate — ไม่ใช้สีน้ำเงินเต็มแผง */
    root.style.setProperty('--app-sidebar', '#eaeaea')
    root.style.setProperty('--app-glass-bg', 'rgba(255, 255, 255, 0.7)')
    root.style.setProperty('--app-glass-border', 'rgba(255, 255, 255, 0.18)')
  }

  applyTypographyToDocument(typographyFromPublicSettings(settings))
}

export function clearThemeFromDocument(): void {
  const root = document.documentElement
  root.classList.remove('dark')
  delete root.dataset.theme
  const keys = [
    '--app-primary',
    '--app-accent',
    '--app-primary-rgb',
    '--app-accent-rgb',
    '--app-bg',
    '--app-surface',
    '--app-surface-muted',
    '--app-text',
    '--app-text-muted',
    '--app-border',
    '--app-sidebar',
    '--app-sidebar-fg',
    '--app-sidebar-fg-muted',
    '--app-sidebar-border',
    '--app-sidebar-hover',
    '--app-sidebar-active',
    '--app-glass-bg',
    '--app-glass-border',
    '--admin-success',
    '--admin-warning',
    '--admin-danger',
    '--admin-info',
  ]
  for (const key of keys) root.style.removeProperty(key)
  applyTypographyToDocument(typographyFromPublicSettings(undefined))
}
