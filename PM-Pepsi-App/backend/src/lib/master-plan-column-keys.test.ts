import { describe, expect, it } from 'vitest'
import { masterPlanColumnStorageKeys } from './master-plan-column-keys.js'

describe('masterPlanColumnStorageKeys', () => {
  it('assigns unique keys for duplicate Craft headers', () => {
    const keys = masterPlanColumnStorageKeys(['Frequency', 'Type', 'Craft', 'Craft'])
    expect(new Set(keys).size).toBe(4)
    expect(keys.filter((k) => k.startsWith('Craft')).length).toBe(2)
    expect(keys[2]).toBe('Craft')
    expect(keys[3]).not.toBe('Craft')
  })
})
