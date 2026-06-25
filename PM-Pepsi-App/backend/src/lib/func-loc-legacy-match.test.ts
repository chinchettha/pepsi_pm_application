import { describe, expect, it } from 'vitest'
import {
  buildFuncLocDescripByLegacyMap,
  legacyMatchesFunctionalloc,
  resolveFuncLocDescripForLegacy,
} from './func-loc-legacy-match.js'

describe('func-loc-legacy-match', () => {
  it('matches legacy prefix in Functional Loc.', () => {
    expect(legacyMatchesFunctionalloc('P17-HR-ME2', 'P17-HR-ME2 · ME · P17')).toBe(true)
    expect(legacyMatchesFunctionalloc('P17-HR-ME2', 'P17-HR-ME2')).toBe(true)
    expect(legacyMatchesFunctionalloc('P17-HR-ME2', 'P14-NI-EE · EE · P14')).toBe(false)
  })

  it('resolves FunctLocDescrip. by legacy from IW37N rows', () => {
    const map = buildFuncLocDescripByLegacyMap([
      {
        functionalloc: 'P17-HR-ME2 · ME · P17',
        funcdescrip: 'Mechanical HR Zone 2',
      },
    ])
    expect(resolveFuncLocDescripForLegacy('P17-HR-ME2', map)).toBe('Mechanical HR Zone 2')
  })

  it('falls back to current WO Functional Loc. when map has no row', () => {
    expect(
      resolveFuncLocDescripForLegacy('P17-HR-ME2', new Map(), {
        functionalloc: 'P17-HR-ME2 · ME · P17',
        funcdescrip: 'WO zone description',
      }),
    ).toBe('WO zone description')
  })
})
