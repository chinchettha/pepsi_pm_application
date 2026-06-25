import { buildIw37nMoveRequestHref } from '@/features/iw37n/iw37n-href'
import { buildPlanCalendarDeepLink } from '@/features/plan-calendar/plan-calendar-href'

type NotificationLinkInput = {
  notifyKind: string
  linkRoute: string | null
  idiw37: number | null
}

/** Resolve in-app notification target — move-request opens IW37N; plan moved opens plan calendar. */
export function resolveNotificationHref(item: NotificationLinkInput): string {
  if (item.notifyKind === 'plan_moved_to_tech' && item.idiw37 != null) {
    const date = parsePlanDateFromLink(item.linkRoute)
    if (date) return buildPlanCalendarDeepLink(item.idiw37, date)
    return item.linkRoute ?? '/plan-calendar'
  }

  if (item.idiw37 != null) {
    if (
      item.notifyKind === 'move_request_to_planner' ||
      item.linkRoute?.includes('/calendar') ||
      item.linkRoute?.includes('/planning')
    ) {
      return buildIw37nMoveRequestHref(item.idiw37)
    }
  }
  return item.linkRoute ?? '/confirmation'
}

function parsePlanDateFromLink(linkRoute: string | null): string | null {
  if (!linkRoute) return null
  try {
    const q = linkRoute.includes('?') ? linkRoute.slice(linkRoute.indexOf('?')) : linkRoute
    const params = new URLSearchParams(q.startsWith('?') ? q : `?${q}`)
    const date = params.get('date')?.trim() ?? ''
    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null
  } catch {
    return null
  }
}
