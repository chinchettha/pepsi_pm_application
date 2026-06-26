import ExcelJS from 'exceljs'
import type {
  CombustionPointBlock,
  CurrentPhaseRow,
  VibrationReadingRow,
} from '@/features/pm-charts/pm-chart-design-data'
import { vibrationAverages } from '@/features/pm-charts/pm-chart-design-data'
import type { PmChartPeriod } from '@/features/pm-charts/pm-chart-period'

export type PmChartReportMeta = {
  sheetName: string
  period: PmChartPeriod
  from: string
  to: string
  wkorder?: string
}

function styleHeader(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } }
}

async function addChartImages(
  ws: ExcelJS.Worksheet,
  charts: Array<{ title: string; base64: string }>,
  startRow: number,
) {
  let row = startRow
  for (const chart of charts) {
    ws.getCell(row, 1).value = chart.title
    ws.getCell(row, 1).font = { bold: true, size: 12 }
    row += 1
    const imageId = ws.workbook.addImage({
      base64: chart.base64,
      extension: 'png',
    })
    ws.addImage(imageId, {
      tl: { col: 0, row: row - 1 },
      ext: { width: 640, height: 280 },
    })
    row += 18
  }
}

export async function buildVibrationReportSheet(
  wb: ExcelJS.Workbook,
  rows: VibrationReadingRow[],
  meta: PmChartReportMeta,
  charts: Array<{ title: string; base64: string }>,
) {
  const ws = wb.addWorksheet(meta.sheetName.slice(0, 31))
  ws.getCell(1, 1).value = meta.sheetName
  ws.getCell(2, 1).value = `Period: ${meta.period} · ${meta.from} → ${meta.to}`
  if (meta.wkorder) ws.getCell(3, 1).value = `WO: ${meta.wkorder}`

  const headerRow = ws.getRow(5)
  headerRow.values = [
    undefined,
    'Date / Period',
    'MF Dst',
    'MF dB',
    'MB Dst',
    'MB dB',
    'P1 Dst',
    'P1 dB',
    'P2 Dst',
    'P2 dB',
    'Avg Dst',
    'Avg dB',
  ]
  styleHeader(headerRow)

  rows.forEach((row, idx) => {
    const avg = vibrationAverages(row)
    ws.getRow(6 + idx).values = [
      undefined,
      row.date,
      row.motorFrontDst,
      row.motorFrontDb,
      row.motorBackDst,
      row.motorBackDb,
      row.pump1Dst,
      row.pump1Db,
      row.pump2Dst,
      row.pump2Db,
      avg.dst,
      avg.db,
    ]
  })

  await addChartImages(ws, charts, 6 + rows.length + 2)
}

export async function buildCurrentReportSheet(
  wb: ExcelJS.Workbook,
  phases: CurrentPhaseRow[],
  labels: string[],
  slotIds: string[],
  machine: string,
  year: number,
  meta: PmChartReportMeta,
  charts: Array<{ title: string; base64: string }>,
) {
  const ws = wb.addWorksheet(meta.sheetName.slice(0, 31))
  ws.getCell(1, 1).value = `${machine} Motor Current`
  ws.getCell(2, 1).value = `Period: ${meta.period} · ${meta.from} → ${meta.to}`

  const headerRow = ws.getRow(4)
  headerRow.values = [undefined, 'Phase', `${year} Avg`, ...labels]
  styleHeader(headerRow)

  phases.forEach((phase, idx) => {
    ws.getRow(5 + idx).values = [
      undefined,
      phase.phase,
      phase.yearAverage,
      ...slotIds.map((id) => phase.values[id] ?? null),
    ]
  })

  await addChartImages(ws, charts, 5 + phases.length + 2)
}

export async function buildCombustionReportSheet(
  wb: ExcelJS.Workbook,
  block: CombustionPointBlock,
  monthLabels: string[],
  months: string[],
  meta: PmChartReportMeta,
  charts: Array<{ title: string; base64: string }>,
) {
  const ws = wb.addWorksheet(`Combustion ${block.point}`.slice(0, 31))
  ws.getCell(1, 1).value = `Combustion — Point ${block.point}`
  ws.getCell(2, 1).value = `Period: ${meta.period} · ${meta.from} → ${meta.to}`

  const headerRow = ws.getRow(4)
  headerRow.values = [undefined, 'Parameter', ...monthLabels]
  styleHeader(headerRow)

  block.rows.forEach((row, idx) => {
    ws.getRow(5 + idx).values = [
      undefined,
      row.parameter,
      ...months.map((m) => row.values[m as keyof typeof row.values] ?? null),
    ]
  })

  await addChartImages(ws, charts, 5 + block.rows.length + 2)
}

export async function downloadPmChartReportWorkbook(wb: ExcelJS.Workbook, filename: string) {
  const buf = await wb.xlsx.writeBuffer()
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
