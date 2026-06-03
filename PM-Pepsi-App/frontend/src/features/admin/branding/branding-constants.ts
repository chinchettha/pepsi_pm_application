export const COLOR_PRESETS = [
  {
    id: 'pepsi',
    primary: '#004C97',
    accent: '#E31837',
  },
  {
    id: 'glass-light',
    primary: '#007AFF',
    accent: '#30D158',
  },
  {
    id: 'glass-dark',
    primary: '#0A84FF',
    accent: '#FF9F0A',
  },
] as const

export const THEME_MODES = [
  { value: 'light' as const },
  { value: 'dark' as const },
  { value: 'system' as const },
] as const
