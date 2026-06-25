import path from 'node:path'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { detectMasterPlanDiscipline } from './master-plan-discipline-detect.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const customerDir = path.join(path.resolve(here, '../../../..'), 'docs from customer')

const EE = path.join(customerDir, '01-MASTER PM PROCESS EE 2026.xlsx')
const ME = path.join(customerDir, '02-MASTER PM PROCESS ME 2026.xlsx')
const PK = path.join(customerDir, '03-MASTER PM PACKING 2026.xlsx')

describe('detectMasterPlanDiscipline', () => {
  it('detects EE from customer workbook', () => {
    const buf = readFileSync(EE)
    expect(detectMasterPlanDiscipline(buf, '01-MASTER PM PROCESS EE 2026.xlsx')).toBe('EE')
    expect(detectMasterPlanDiscipline(buf, 'renamed-ee-plan.xlsx')).toBe('EE')
  })

  it('detects ME from customer workbook', () => {
    const buf = readFileSync(ME)
    expect(detectMasterPlanDiscipline(buf, '02-MASTER PM PROCESS ME 2026.xlsx')).toBe('ME')
    expect(detectMasterPlanDiscipline(buf, 'any-me-file.xlsx')).toBe('ME')
  })

  it('detects PK from customer workbook', () => {
    const buf = readFileSync(PK)
    expect(detectMasterPlanDiscipline(buf, '03-MASTER PM PACKING 2026.xlsx')).toBe('PK')
    expect(detectMasterPlanDiscipline(buf, 'customer-upload.xlsx')).toBe('PK')
  })
})
