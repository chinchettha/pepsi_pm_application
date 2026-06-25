import { describe, expect, it } from 'vitest'
import {
  appendFunctionalLocFilter,
  isMasterStyleFunctionalCode,
} from './functional-filter-options.js'

describe('isMasterStyleFunctionalCode', () => {
  it('detects master short codes', () => {
    expect(isMasterStyleFunctionalCode('7151-PL01')).toBe(true)
    expect(isMasterStyleFunctionalCode('PI-TH-7151-BS-AC-01')).toBe(false)
  })
})

describe('appendFunctionalLocFilter', () => {
  it('uses exact match for SAP functional loc', () => {
    const params: unknown[] = []
    const sql = appendFunctionalLocFilter(['PI-TH-7151-BS-AC-01'], 'o', 'ti', params)
    expect(sql).toContain('TRIM(o.functionalloc) = $1')
    expect(params).toEqual(['PI-TH-7151-BS-AC-01'])
  })

  it('uses flexible match for master short codes', () => {
    const params: unknown[] = []
    const sql = appendFunctionalLocFilter(['7151-CONV-02'], 'o', 'ti', params)
    expect(sql).toContain('ILIKE')
    expect(sql).toContain('ti.ostdescription')
    expect(params).toEqual(['7151-CONV-02', '%7151-CONV-02%'])
  })
})
