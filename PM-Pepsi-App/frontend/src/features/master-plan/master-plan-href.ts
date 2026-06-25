import type { MasterPlanDiscipline } from '@/lib/master-plan-api'

type MasterPlanLinkInput = {
  masterPlanMntplan?: string
  masterPlanDiscipline?: MasterPlanDiscipline | ''
  mntplan?: string
  sapCode?: string
}

/** Deep link to Master Plan — targets Maintenance plan column via ?q= and discipline tab. */
export function buildMasterPlanHref(item: MasterPlanLinkInput): string | null {
  const q = (item.masterPlanMntplan || item.mntplan || item.sapCode || '').trim()
  if (!q) return null
  const params = new URLSearchParams({ q })
  const discipline = item.masterPlanDiscipline?.trim()
  if (discipline === 'EE' || discipline === 'ME' || discipline === 'PK') {
    params.set('discipline', discipline)
  }
  return `/master-plan?${params.toString()}`
}
