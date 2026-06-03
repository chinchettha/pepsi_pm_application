import type { PmChartPoint } from '@/lib/pm-measurement-chart'
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

type Props = {
  points: PmChartPoint[]
  axisLabels: [string, string, string]
  unit: string
  chartTitle?: string
  chartSubtitle?: string
  warningLimit?: number | null
  alarmLimit?: number | null
}

export function PmMeasurementLineChart({
  points,
  axisLabels,
  unit,
  chartTitle,
  chartSubtitle,
  warningLimit,
  alarmLimit,
}: Props) {
  if (points.length === 0) {
    return (
      <p className="rounded-button border border-dashed border-app px-3 py-6 text-center text-xs text-app-muted">
        ยังไม่มีค่าวัด — บันทึกครั้งแรกเพื่อเริ่มกราฟแนวโน้ม
      </p>
    )
  }

  const labels = points.map((p) => p.label)
  const limitPlugin = {
    id: 'pmLimits',
    afterDraw(chart: ChartJS) {
      const yScale = chart.scales.y
      if (!yScale) return
      const ctx = chart.ctx
      const drawLine = (value: number | null | undefined, color: string, text: string) => {
        if (value == null || !Number.isFinite(value)) return
        const y = yScale.getPixelForValue(value)
        if (!Number.isFinite(y)) return
        ctx.save()
        ctx.strokeStyle = color
        ctx.setLineDash([6, 4])
        ctx.beginPath()
        ctx.moveTo(chart.chartArea.left, y)
        ctx.lineTo(chart.chartArea.right, y)
        ctx.stroke()
        ctx.fillStyle = color
        ctx.font = '11px sans-serif'
        ctx.fillText(text, chart.chartArea.left + 4, y - 4)
        ctx.restore()
      }
      drawLine(warningLimit, 'rgba(234, 179, 8, 0.9)', 'Warning')
      drawLine(alarmLimit, 'rgba(239, 68, 68, 0.9)', 'Alarm')
    },
  }

  return (
    <div className="rounded-button border border-app bg-[var(--app-surface)] p-3">
      {chartTitle ? (
        <p className="mb-1 text-sm font-semibold text-app">{chartTitle}</p>
      ) : null}
      {chartSubtitle ? (
        <p className="mb-2 text-xs text-app-muted">{chartSubtitle}</p>
      ) : null}
      <Line
        plugins={[limitPlugin]}
        data={{
          labels,
          datasets: [
            {
              label: axisLabels[0],
              data: points.map((p) => p.v1),
              borderColor: 'rgb(37, 99, 235)',
              backgroundColor: 'rgba(37, 99, 235, 0.15)',
              tension: 0.2,
            },
            {
              label: axisLabels[1],
              data: points.map((p) => p.v2),
              borderColor: 'rgb(22, 163, 74)',
              backgroundColor: 'rgba(22, 163, 74, 0.15)',
              tension: 0.2,
            },
            {
              label: axisLabels[2],
              data: points.map((p) => p.v3),
              borderColor: 'rgb(234, 88, 12)',
              backgroundColor: 'rgba(234, 88, 12, 0.15)',
              tension: 0.2,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
            title: {
              display: true,
              text: chartTitle ?? (unit ? `แนวโน้ม (${unit})` : 'แนวโน้มค่าวัด'),
              font: { size: 12 },
            },
          },
          scales: {
            y: {
              title: { display: !!unit, text: unit },
              beginAtZero: false,
            },
          },
        }}
        height={220}
      />
    </div>
  )
}
