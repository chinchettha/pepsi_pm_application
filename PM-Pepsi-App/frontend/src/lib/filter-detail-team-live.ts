import type { z } from 'zod'
import type { workOrderFilterDetailResponseSchema } from '@/api/schemas'

export type FilterDetailData = z.infer<typeof workOrderFilterDetailResponseSchema>
export type TeamCode = '' | 'A' | 'B' | 'P'

export function normalizeTeamCode(team: string | undefined): TeamCode {
  if (team === 'A' || team === 'B' || team === 'P') return team
  return ''
}

/** Patch saved `team` on search rows after batch/single save (keeps UI stable). */
export function patchRowsTeam<T extends { id: string; team: string }>(
  rows: T[],
  updates: ReadonlyMap<string, TeamCode>,
): T[] {
  return rows.map((row) => {
    const team = updates.get(row.id)
    if (team === undefined) return row
    return { ...row, team }
  })
}

type TeamTotals = FilterDetailData['teamA']

function adjustBucket(
  bucket: TeamCode,
  totals: { teamA: TeamTotals; teamB: TeamTotals; teamP: TeamTotals },
  countDelta: number,
  workDelta: number,
): void {
  if (bucket === 'A') {
    totals.teamA.count += countDelta
    totals.teamA.workSumMinutes += workDelta
  } else if (bucket === 'B') {
    totals.teamB.count += countDelta
    totals.teamB.workSumMinutes += workDelta
  } else if (bucket === 'P') {
    totals.teamP.count += countDelta
    totals.teamP.workSumMinutes += workDelta
  }
}

/**
 * ปรับ Team A/B/P จากค่า server โดยใช้ delta ของแถวในตารางที่เปลี่ยน team ชั่วคราว (radio ก่อน Save).
 * เทียบ LEGACY B.4c — ไม่ refresh ทั้งหน้า
 */
export function applyPendingTeamToFilterDetail(
  base: FilterDetailData,
  rows: Array<{ id: string; team: string; work: number }>,
  pendingTeam: Record<string, TeamCode>,
): { data: FilterDetailData; hasPendingChanges: boolean } {
  const teamA = { ...base.teamA }
  const teamB = { ...base.teamB }
  const teamP = { ...base.teamP }
  const totals = { teamA, teamB, teamP }
  let hasPendingChanges = false

  for (const row of rows) {
    const saved = normalizeTeamCode(row.team)
    const pending = pendingTeam[row.id] ?? saved
    if (pending === saved) continue
    hasPendingChanges = true
    adjustBucket(saved, totals, -1, -row.work)
    adjustBucket(pending, totals, 1, row.work)
  }

  return {
    data: { ...base, teamA, teamB, teamP },
    hasPendingChanges,
  }
}
