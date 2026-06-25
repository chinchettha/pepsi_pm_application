import { describe, expect, it } from 'vitest'
import { formatIw37nWorkUnit } from './iw37n-export-display'

describe('formatIw37nWorkUnit', () => {
  it('shows MIN when work exists but unit text was not stored', () => {
    expect(formatIw37nWorkUnit({ work: 30 } as never)).toBe('MIN')
  })

  it('returns empty when no work fields', () => {
    expect(formatIw37nWorkUnit({} as never)).toBe('')
  })
})
