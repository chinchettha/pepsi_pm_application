/**
 * PRE-UAT U4c — CSS class motion with useReducedMotion() + motion-reduce: fallback in index.css
 */

/** PRE-UAT U4c — single-row feedback only; never bulk `<tr>` stagger (see list-kpi-stagger.ts) */
export const PLANNING_ROW_HIGHLIGHT_ANIMATED = 'planning-row--assign-highlight'
export const PLANNING_ROW_HIGHLIGHT_STATIC = 'planning-row--assign-highlight-static'

export const PLANNING_ACK_PULSE_ANIMATED = 'planning-ack-pending-pulse-once'
export const PLANNING_ACK_PULSE_STATIC = 'planning-ack-pending-pulse-static'

/** Pick animated vs static class; undefined when inactive */
export function appCssMotionClassWhen(
  active: boolean,
  reduceMotion: boolean | null,
  animatedClass: string,
  staticClass: string,
): string | undefined {
  if (!active) return undefined
  return reduceMotion ? staticClass : animatedClass
}
