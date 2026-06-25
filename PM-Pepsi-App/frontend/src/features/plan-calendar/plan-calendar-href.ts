/** Deep link to plan calendar on the moved plan date + WO detail. */
export function buildPlanCalendarDeepLink(idiw37: number, planDateIso: string): string {
  const params = new URLSearchParams({
    idiw37: String(idiw37),
    date: planDateIso.trim(),
  })
  return `/plan-calendar?${params.toString()}`
}
