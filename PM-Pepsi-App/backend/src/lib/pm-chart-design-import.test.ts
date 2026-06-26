import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parsePmChartDesignWorkbook } from './pm-chart-design-import.js'

describe('parsePmChartDesignWorkbook', () => {
  it('parses customer PMChartDesign.xlsx template', () => {
    const path = resolve(process.cwd(), '../../PMChartDesign.xlsx')
    const buf = readFileSync(path)
    const result = parsePmChartDesignWorkbook(buf)

    expect(result.vibration).toBeTruthy()
    expect((result.vibration!.rows as unknown[]).length).toBeGreaterThanOrEqual(8)

    expect(result.current).toBeTruthy()
    expect((result.current!.phases as unknown[]).length).toBe(3)

    expect(result.combustion).toBeTruthy()
    expect((result.combustion!.blocks as unknown[]).length).toBeGreaterThanOrEqual(4)
  })
})
