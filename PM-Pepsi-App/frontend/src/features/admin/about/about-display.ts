const LICENSE_LABELS: Record<string, string> = {
  not_configured: 'ยังไม่ตั้งค่า',
  configured: 'ตั้งคีย์แล้ว',
  active: 'ใช้งานได้',
  expired: 'หมดอายุ',
  trial: 'ทดลองใช้',
}

export function licenseStatusLabel(status: string): string {
  return LICENSE_LABELS[status] ?? status
}

export function licenseStatusTone(status: string): 'ok' | 'warn' | 'muted' {
  if (status === 'active' || status === 'configured' || status === 'trial') return 'ok'
  if (status === 'expired') return 'warn'
  return 'muted'
}

export function migrationProgressPercent(applied: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(100, Math.round((applied / total) * 100))
}
