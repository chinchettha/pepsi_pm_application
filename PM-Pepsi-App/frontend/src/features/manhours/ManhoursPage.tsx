import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { fetchManhours } from '@/lib/api-public'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'
import { useQuery } from '@tanstack/react-query'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export function ManhoursPage() {
  const q = useQuery({ queryKey: ['manhours'], queryFn: fetchManhours })

  const chartData = {
    labels: q.data?.map((w) => w.week) ?? [],
    datasets: [
      {
        label: 'Planned (h)',
        data: q.data?.map((w) => w.planned) ?? [],
        backgroundColor: 'rgba(24,24,27,0.85)',
      },
      {
        label: 'Actual (h)',
        data: q.data?.map((w) => w.actual) ?? [],
        backgroundColor: 'rgba(113,113,122,0.9)',
      },
    ],
  }

  return (
    <div>
      <PageHeader
        title="Manhours / ชั่วโมงทำงาน"
        description="สรุปรายสัปดาห์ — เทียบ M_manhour_chart_performance, W_manhours_hr, worktime_manhours"
      >
        <Badge variant="secondary">Chart + ตาราง</Badge>
      </PageHeader>

      <div className="space-y-6 px-4 py-6 sm:px-6">
        {q.isLoading ? (
          <Skeleton className="h-72 w-full rounded-xl" />
        ) : q.isError ? (
          <p className="text-sm text-red-600">{(q.error as Error).message}</p>
        ) : (
          <>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    title: { display: true, text: 'Planned vs Actual (tbmanhours)' },
                    legend: { position: 'top' },
                  },
                }}
              />
            </div>
            <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>สัปดาห์</TableHead>
                    <TableHead className="text-right">Planned</TableHead>
                    <TableHead className="text-right">Actual</TableHead>
                    <TableHead className="text-right">Backlog</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {q.data?.map((w) => (
                    <TableRow key={w.week}>
                      <TableCell className="font-medium">{w.week}</TableCell>
                      <TableCell className="text-right tabular-nums">{w.planned}</TableCell>
                      <TableCell className="text-right tabular-nums">{w.actual}</TableCell>
                      <TableCell className="text-right tabular-nums">{w.backlog}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
