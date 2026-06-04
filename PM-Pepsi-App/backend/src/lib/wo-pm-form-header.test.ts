import { describe, expect, it } from 'vitest'
import { buildOperationText, buildWoPmFormHeader, formatSapPrintDate } from './wo-pm-form-header.js'

describe('wo-pm-form-header', () => {
  it('formats SAP print date', () => {
    expect(formatSapPrintDate('2026-05-26')).toBe('26.05.2026')
  })

  it('maps WO 4001565681 sample fields', () => {
    const h = buildWoPmFormHeader(
      {
        wkorder: '4001565681',
        functionalloc: 'PI-TH-7151-FA-F1-P1',
        mat: '10049361',
        equipment: '10049361',
        equdescrip: 'FACTORY 1 PC50MZ',
        ostdescription: 'Oil Heating Zone',
        operationshorttext: '369039 & P14-NI-EE',
        wkctr: 'PRO002',
        bscstart: Math.floor(new Date('2026-05-26T00:00:00Z').getTime() / 1000),
        actfinish: Math.floor(new Date('2026-05-26T00:00:00Z').getTime() / 1000),
        untime: null,
        systemstatus: null,
        syst: 'REL',
        opac: '0010',
        wktype: 'ZB02',
        team: null,
      },
      {
        firstTask: {
          mat: '001',
          matdescrip: 'Inspection & Cond. Monitoring',
          idwkctrtype: 'P14',
        },
        materialCount: 0,
      },
    )
    expect(h.wkorder).toBe('4001565681')
    expect(h.functionalLocation).toBe('PI-TH-7151-FA-F1-P1')
    expect(h.equipment).toBe('10049361')
    expect(h.workCentre).toBe('PRO002')
    expect(h.techId).toBe('P14')
    expect(h.activityType).toBe('001 Inspection & Cond. Monitoring')
    expect(h.headerShortText).toBe('369039 & P14-NI-EE')
    expect(h.operationNumber).toBe('0010')
    expect(h.operationText).toBe('2M - EE Oil Heating Zone (P14)')
    expect(h.sysCond).toBe('-')
    expect(h.printMetaLine).toContain('26.05.2026')
  })

  it('builds operation text from ostdescription and header discipline', () => {
    expect(
      buildOperationText(
        {
          wkorder: '1',
          functionalloc: null,
          mat: null,
          equipment: null,
          equdescrip: null,
          ostdescription: 'Oil Heating Zone',
          operationshorttext: '369039 & P14-NI-EE',
          wkctr: null,
          bscstart: null,
          actfinish: null,
          untime: null,
          systemstatus: null,
          syst: null,
          opac: null,
          wktype: 'ZB02',
          team: null,
        },
        'P14',
      ),
    ).toBe('2M - EE Oil Heating Zone (P14)')
  })
})
