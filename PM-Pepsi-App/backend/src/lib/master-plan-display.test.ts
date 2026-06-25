import { describe, expect, it } from 'vitest'
import { applyFillDownDisplay } from './master-plan-display.js'

describe('applyFillDownDisplay', () => {
  it('fills empty Zone from row above', () => {
    const rows = [
      { rowIndex: 3, cells: { Zone: 'SE0', 'Machine List': 'Batch Mixer' } },
      { rowIndex: 4, cells: { Zone: '', 'Machine List': 'Agitator' } },
    ]
    const out = applyFillDownDisplay(rows, ['Zone', 'Machine List'])
    expect(out[1]?.display.Zone).toBe('SE0')
    expect(out[1]?.display['Machine List']).toBe('Agitator')
  })

  it('fills Machine List from row above when empty', () => {
    const rows = [
      { rowIndex: 1, cells: { Zone: 'PK1', 'Machine List': 'Line A' } },
      { rowIndex: 2, cells: { Zone: '', 'Machine List': '' } },
    ]
    const out = applyFillDownDisplay(rows, ['Zone', 'Machine List'])
    expect(out[1]?.display.Zone).toBe('PK1')
    expect(out[1]?.display['Machine List']).toBe('Line A')
  })

  it('fills Min, Man, Man hour from row above when empty (Excel merge)', () => {
    const rows = [
      { rowIndex: 251, cells: { Min: '30', Man: '1', 'Man hour': '30' } },
      { rowIndex: 252, cells: { Min: '', Man: '', 'Man hour': '' } },
    ]
    const out = applyFillDownDisplay(rows, ['Min', 'Man', 'Man hour'])
    expect(out[1]?.display.Min).toBe('30')
    expect(out[1]?.display.Man).toBe('1')
    expect(out[1]?.display['Man hour']).toBe('30')
  })

  it('fills SAP Code and Task list from row above when empty (Excel merge)', () => {
    const rows = [
      {
        rowIndex: 10,
        cells: {
          Zone: 'SE3',
          'SAP Code': '610000004496',
          'Task list': '100930',
          Legacy: 'SE3-MI-EE',
          'PM list': 'Check motor',
        },
      },
      {
        rowIndex: 11,
        cells: {
          Zone: '',
          'SAP Code': '',
          'Task list': '',
          Legacy: 'SE3-MI-EE',
          'PM list': 'Check belt',
        },
      },
    ]
    const out = applyFillDownDisplay(rows, ['Zone', 'SAP Code', 'Task list', 'Legacy', 'PM list'])
    expect(out[1]?.display['SAP Code']).toBe('610000004496')
    expect(out[1]?.display['Task list']).toBe('100930')
    expect(out[1]?.display.Zone).toBe('SE3')
  })

  it('fills Maintenance plan alias the same as SAP Code', () => {
    const rows = [
      { rowIndex: 1, cells: { 'Maintenance plan': '342596', 'Task list': '9189' } },
      { rowIndex: 2, cells: { 'Maintenance plan': '', 'Task list': '' } },
    ]
    const out = applyFillDownDisplay(rows, ['Maintenance plan', 'Task list'])
    expect(out[1]?.display['Maintenance plan']).toBe('342596')
    expect(out[1]?.display['Task list']).toBe('9189')
  })
})
