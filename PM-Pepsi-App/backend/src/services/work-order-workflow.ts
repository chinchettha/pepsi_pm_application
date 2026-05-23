import type { Pool } from 'pg'
import { isConfirmQcApproved } from '../lib/confirm-qc-status.js'

/** เทียบ `ChackStatus.php` + suffix ใน `calendar.php` title (`STwork` + `STwork2` + …) */
export type WorkOrderWorkflowStep = {
  step: 1 | 2 | 3 | 4
  key: 'team' | 'assign' | 'worktime' | 'confirm'
  label: string
  done: boolean
}

export function workflowSuffixFromSteps(steps: WorkOrderWorkflowStep[]): string {
  return steps.filter((s) => s.done).map((s) => String(s.step)).join('')
}

let tbwrkcloseAvailable: boolean | null = null

async function hasTbwrkcloseTable(pool: Pool): Promise<boolean> {
  if (tbwrkcloseAvailable != null) return tbwrkcloseAvailable
  try {
    const r = await pool.query<{ reg: string | null }>(
      `SELECT to_regclass('app.tbwrkclose')::text AS reg`,
    )
    tbwrkcloseAvailable = Boolean(r.rows[0]?.reg)
  } catch {
    tbwrkcloseAvailable = false
  }
  return tbwrkcloseAvailable
}

export async function getWorkOrderWorkflowSteps(
  pool: Pool,
  idiw37: number,
): Promise<WorkOrderWorkflowStep[]> {
  const teamR = await pool.query<{ team: string | null }>(
    `SELECT team FROM app.tbiw37n WHERE idiw37 = $1 LIMIT 1`,
    [idiw37],
  )
  const hasTeam = Boolean(teamR.rows[0]?.team?.trim())

  const assignR = await pool.query<{ n: string }>(
    `SELECT COUNT(*)::text AS n FROM app.tbplangingwork WHERE idiw37 = $1`,
    [idiw37],
  )
  const hasAssign = Number(assignR.rows[0]?.n ?? 0) > 0

  let hasWorktime = false
  if (await hasTbwrkcloseTable(pool)) {
    const wrkR = await pool.query<{ n: string }>(
      `SELECT COUNT(*)::text AS n FROM app.tbwrkclose WHERE idiw37 = $1`,
      [idiw37],
    )
    hasWorktime = Number(wrkR.rows[0]?.n ?? 0) > 0
  }

  const qcR = await pool.query<{ status: string | null }>(
    `SELECT confirm_qc_status AS status FROM app.tbiw37n WHERE idiw37 = $1 LIMIT 1`,
    [idiw37],
  )
  const qcApproved = isConfirmQcApproved(qcR.rows[0]?.status)

  return [
    { step: 1, key: 'team', label: 'ตั้ง Team A/B/P', done: hasTeam },
    { step: 2, key: 'assign', label: 'Supervisor จ่ายงานให้ช่าง', done: hasAssign },
    {
      step: 3,
      key: 'worktime',
      label: 'ช่างบันทึกเวลาทำงาน',
      done: hasWorktime,
    },
    {
      step: 4,
      key: 'confirm',
      label: 'รับรองงาน (Admin QC)',
      done: qcApproved,
    },
  ]
}

/** Suffix สำหรับ title ปฏิทิน — เทียบ `wkorder / wktype / 1234` ใน PHP */
export async function loadWorkflowSuffixMap(
  pool: Pool,
  idiw37List: number[],
): Promise<Map<number, string>> {
  const map = new Map<number, string>()
  if (idiw37List.length === 0) return map

  const useWrkclose = await hasTbwrkcloseTable(pool)
  const step3Sql = useWrkclose
    ? `CASE WHEN EXISTS (SELECT 1 FROM app.tbwrkclose w WHERE w.idiw37 = i.idiw37) THEN '3' ELSE '' END`
    : `''`

  const r = await pool.query<{ idiw37: number; suffix: string }>(
    `SELECT i.idiw37,
       TRIM(
         CASE WHEN COALESCE(TRIM(i.team), '') <> '' THEN '1' ELSE '' END ||
         CASE WHEN EXISTS (SELECT 1 FROM app.tbplangingwork p WHERE p.idiw37 = i.idiw37) THEN '2' ELSE '' END ||
         ${step3Sql} ||
         CASE WHEN i.confirm_qc_status = 'approved' THEN '4' ELSE '' END
       ) AS suffix
     FROM app.tbiw37n i
     WHERE i.idiw37 = ANY($1::int[])`,
    [idiw37List],
  )

  for (const row of r.rows) {
    map.set(Number(row.idiw37), (row.suffix ?? '').trim())
  }
  return map
}

export function appendWorkflowSuffixToTitle(
  baseTitle: string,
  suffix: string | undefined,
): string {
  const s = suffix?.trim()
  if (!s) return baseTitle
  return `${baseTitle}/${s}`
}
