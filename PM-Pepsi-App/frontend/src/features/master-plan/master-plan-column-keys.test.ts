import { describe, expect, it } from 'vitest'
import {
  masterPlanCellValue,
  masterPlanColumnDisplayLabel,
  masterPlanColumnStorageKey,
  masterPlanColumnStorageKeys,
} from './master-plan-column-keys'

describe('masterPlanColumnStorageKey', () => {
  it('keeps first occurrence as plain header', () => {
    expect(masterPlanColumnStorageKey(['Zone', 'Craft', 'Type'], 1)).toBe('Craft')
  })

  it('suffixes duplicate headers', () => {
    const cols = ['Frequency', 'Type', 'Craft', 'Craft']
    const keys = masterPlanColumnStorageKeys(cols)
    expect(keys[2]).toBe('Craft')
    expect(keys[3]).not.toBe('Craft')
    expect(keys[3]).toContain('Craft')
    expect(keys[3]).not.toBe(keys[2])
  })

  it('strips dedup suffix for display label', () => {
    const key = masterPlanColumnStorageKey(['Craft', 'Craft'], 1)
    expect(masterPlanColumnDisplayLabel(key)).toBe('Craft')
  })
})

describe('masterPlanCellValue', () => {
  it('falls back to legacy single-key cells for first duplicate label', () => {
    const row = { cells: { Craft: 'EE' }, display: { Craft: 'EE' } }
    expect(masterPlanCellValue(row, 'Craft', 'Craft', true)).toBe('EE')
  })

  it('does not fall back to legacy key for later duplicate columns', () => {
    const row = { cells: { Craft: 'EE' }, display: { Craft: 'EE' } }
    const secondKey = masterPlanColumnStorageKey(['Craft', 'Craft'], 1)
    expect(masterPlanCellValue(row, secondKey, 'Craft', false)).toBe('')
  })
})
