import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

const CHART_FONT = { family: 'Sarabun, system-ui, sans-serif', size: 11 }

function resolveYScale(
  series: Array<{ data: Array<number | null> }>,
  yMin?: number,
  yMax?: number,
): { min: number | undefined; max: number | undefined } {
  const nums = series
    .flatMap((s) => s.data)
    .filter((v): v is number => v != null && Number.isFinite(v))
  if (nums.length === 0) return { min: yMin, max: yMax }

  const dataMin = Math.min(...nums)
  const dataMax = Math.max(...nums)
  const span = dataMax - dataMin || Math.abs(dataMax) || 1
  const pad = span * 0.12

  let min = yMin
  let max = yMax
  if (min == null || dataMin < min) min = Math.floor(dataMin - pad)
  if (max == null || dataMax > max) max = Math.ceil(dataMax + pad)
  if (min != null && max != null && min >= max) max = min + 1

  return { min, max }
}

type LineSeries = {
  label: string
  data: Array<number | null>
  color: string
  dashed?: boolean
  pointRadius?: number
}

export function PmDesignLineChart({
  labels,
  series,
  yTitle,
  yMin,
  yMax,
}: {
  labels: string[]
  series: LineSeries[]
  yTitle: string
  yMin?: number
  yMax?: number
}) {
  const yScale = resolveYScale(series, yMin, yMax)
  return (
    <Line
      data={{
        labels,
        datasets: series.map((s) => ({
          label: s.label,
          data: s.data,
          borderColor: s.color,
          backgroundColor: s.color,
          borderDash: s.dashed ? [6, 4] : undefined,
          pointRadius: s.pointRadius ?? (s.dashed ? 0 : 4),
          pointHoverRadius: 5,
          tension: s.dashed ? 0 : 0.2,
          spanGaps: true,
        })),
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: CHART_FONT, boxWidth: 12 } },
        },
        scales: {
          x: {
            ticks: { font: CHART_FONT, maxRotation: 45, minRotation: 45 },
            grid: { display: false },
          },
          y: {
            title: { display: true, text: yTitle, font: CHART_FONT },
            min: yScale.min,
            max: yScale.max,
            ticks: { font: CHART_FONT },
          },
        },
      }}
    />
  )
}

type BarSeries = {
  label: string
  data: Array<number | null>
  color: string
}

export function PmDesignGroupedBarChart({
  labels,
  series,
  yTitle,
  yMax,
}: {
  labels: string[]
  series: BarSeries[]
  yTitle: string
  yMax?: number
}) {
  return (
    <Bar
      data={{
        labels,
        datasets: series.map((s) => ({
          label: s.label,
          data: s.data,
          backgroundColor: s.color,
          borderRadius: 4,
        })),
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: CHART_FONT, boxWidth: 12 } },
          tooltip: { enabled: true },
        },
        scales: {
          x: {
            ticks: { font: CHART_FONT },
            grid: { display: false },
          },
          y: {
            title: { display: true, text: yTitle, font: CHART_FONT },
            max: yMax,
            ticks: { font: CHART_FONT },
            beginAtZero: true,
          },
        },
      }}
      plugins={[
        {
          id: 'barValueLabels',
          afterDatasetsDraw(chart) {
            const { ctx } = chart
            chart.data.datasets.forEach((dataset, datasetIndex) => {
              const meta = chart.getDatasetMeta(datasetIndex)
              if (meta.hidden) return
              meta.data.forEach((bar, index) => {
                const value = dataset.data[index]
                if (value == null || typeof value !== 'number') return
                ctx.save()
                ctx.fillStyle = '#334155'
                ctx.font = '10px Sarabun, sans-serif'
                ctx.textAlign = 'center'
                ctx.fillText(String(value), bar.x, bar.y - 4)
                ctx.restore()
              })
            })
          },
        },
      ]}
    />
  )
}

export function PmDesignEfficiencyLineChart({
  labels,
  tAir,
  tGas,
  eff,
}: {
  labels: string[]
  tAir: Array<number | null>
  tGas: Array<number | null>
  eff: Array<number | null>
}) {
  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: 'T. Air',
            data: tAir,
            borderColor: '#1f4e79',
            backgroundColor: '#1f4e79',
            pointRadius: 4,
            tension: 0.2,
          },
          {
            label: 'T. Gas',
            data: tGas,
            borderColor: '#c55a11',
            backgroundColor: '#c55a11',
            pointRadius: 4,
            tension: 0.2,
          },
          {
            label: '%Efficiency',
            data: eff,
            borderColor: '#548235',
            backgroundColor: '#548235',
            borderDash: [5, 3],
            pointRadius: 4,
            tension: 0.2,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: CHART_FONT, boxWidth: 12 } },
        },
        scales: {
          x: { ticks: { font: CHART_FONT }, grid: { display: false } },
          y: {
            title: { display: true, text: 'Temperature (Celsius)', font: CHART_FONT },
            ticks: { font: CHART_FONT },
          },
        },
      }}
      plugins={[
        {
          id: 'effLabels',
          afterDatasetsDraw(chart) {
            const effMeta = chart.getDatasetMeta(2)
            const { ctx } = chart
            effMeta.data.forEach((point, index) => {
              const value = eff[index]
              if (value == null) return
              ctx.save()
              ctx.fillStyle = '#548235'
              ctx.font = '10px Sarabun, sans-serif'
              ctx.textAlign = 'center'
              ctx.fillText(String(value), point.x, point.y - 8)
              ctx.restore()
            })
          },
        },
      ]}
    />
  )
}
