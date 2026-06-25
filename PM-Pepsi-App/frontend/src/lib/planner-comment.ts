import type { z } from 'zod'
import type { workOrderPlanningAssignedSchema } from '@/api/schemas'

type PlanningAssignee = z.infer<typeof workOrderPlanningAssignedSchema>

/** Legacy default when planner leaves comment empty — unix seconds stored in pwcomment */
export function isPlannerCommentTimestamp(value: string): boolean {
  return /^[0-9]{9,11}$/.test(value.trim())
}

export function formatPlannerCommentText(pwcomment: string | null | undefined): string {
  const text = pwcomment?.trim() ?? ''
  if (!text || isPlannerCommentTimestamp(text)) return ''
  return text
}

/** pwcomment from tbplangingwork for the signed-in technician's assignment row */
export function resolvePlannerCommentForWkctr(
  assignees: PlanningAssignee[] | undefined,
  wkctr: string | null | undefined,
): string {
  const code = wkctr?.trim()
  if (!code || !assignees?.length) return ''
  const row = assignees.find((a) => a.code === code && a.pwteam !== 'G')
  return formatPlannerCommentText(row?.pwcomment)
}

/** First non-timestamp pwcomment on any person assignee — for planner edit UI */
export function resolveSharedPlannerComment(
  assignees: PlanningAssignee[] | undefined,
): string {
  if (!assignees?.length) return ''
  for (const a of assignees) {
    if (a.pwteam === 'G' || a.kind === 'group') continue
    const text = formatPlannerCommentText(a.pwcomment)
    if (text) return text
  }
  return ''
}
