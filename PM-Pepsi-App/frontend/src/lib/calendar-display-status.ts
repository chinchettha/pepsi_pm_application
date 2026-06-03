/** สีตัวกรองสถานะปฏิทิน — สอดคล้อง backend CALENDAR_DISPLAY_STATUS_OPTIONS */
export const CALENDAR_DISPLAY_STATUS_COLORS: Record<string, string> = {
  overdue: '#dc2626',
  completed: '#16a34a',
  in_progress: '#eab308',
  upcoming: '#2563eb',
}

export function withDisplayStatusColors(
  options: { code: string; label: string }[],
): { code: string; label: string; color?: string }[] {
  return options.map((o) => ({
    ...o,
    color: CALENDAR_DISPLAY_STATUS_COLORS[o.code],
  }))
}
