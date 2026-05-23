export const COLOR_PRESETS = [
  {
    id: 'pepsi',
    label: 'Pepsi (ค่าเริ่มต้น)',
    primary: '#004C97',
    accent: '#E31837',
  },
  {
    id: 'glass-light',
    label: 'Liquid Glass Light',
    primary: '#007AFF',
    accent: '#30D158',
  },
  {
    id: 'glass-dark',
    label: 'Liquid Glass Dark',
    primary: '#0A84FF',
    accent: '#FF9F0A',
  },
] as const

export const THEME_MODES = [
  { value: 'light' as const, label: 'สว่าง' },
  { value: 'dark' as const, label: 'มืด' },
  { value: 'system' as const, label: 'ตามระบบ' },
]
