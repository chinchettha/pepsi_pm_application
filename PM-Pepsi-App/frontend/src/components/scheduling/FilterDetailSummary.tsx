import { KpiStatCard } from '@/components/kpi/KpiStatCard'
import { KpiStatGrid } from '@/components/kpi/KpiStatGrid'
import { AppCard } from '@/components/layout/AppCard'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import type { z } from 'zod'
import type { workOrderFilterDetailResponseSchema } from '@/api/schemas'
import { Filter } from 'lucide-react'

type FilterDetailData = z.infer<typeof workOrderFilterDetailResponseSchema>

type FilterDetailSummaryProps = {
  title: string
  subtitle?: string
  data: FilterDetailData | undefined
  isLoading: boolean
  isError: boolean
  error?: Error | null
  teamOnly?: boolean
  isLivePreview?: boolean
  isRefreshing?: boolean
}

export function FilterDetailSummary({
  title,
  subtitle,
  data,
  isLoading,
  isError,
  error,
  teamOnly = false,
  isLivePreview = false,
  isRefreshing = false,
}: FilterDetailSummaryProps) {
  return (
    <AppCard pad="compact">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-body-sm font-medium text-app">{title}</p>
        {isLivePreview ? (
          <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-900">
            อัปเดตทันที (ยังไม่บันทึก)
          </Badge>
        ) : null}
        {isRefreshing ? (
          <Badge variant="secondary" className="text-app-muted">
            กำลัง sync…
          </Badge>
        ) : null}
      </div>
      {subtitle ? <p className="mt-1 text-xs text-app-muted">{subtitle}</p> : null}

      {isLoading ? (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-10 w-full rounded-card" />
          <Skeleton className="h-16 w-full rounded-card" />
        </div>
      ) : isError ? (
        <p className="mt-3 text-body-sm text-red-600">{(error as Error)?.message ?? 'โหลดสรุปไม่สำเร็จ'}</p>
      ) : data ? (
        <div className="mt-3 space-y-3">
          {!teamOnly ? (
            <KpiStatCard
              tone="amber"
              label="WorkOrder"
              value={data.totalOrders}
              footer={
                <>
                  <p className="text-app-muted">
                    ปิดแล้ว: {data.completionCount} ใบ · Completion {data.completionPercent}%
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {data.byWkzb.map((x) => (
                      <Badge key={x.code} variant="secondary" title={x.label}>
                        {x.code}={x.count}
                      </Badge>
                    ))}
                  </div>
                </>
              }
            />
          ) : null}

          <KpiStatGrid>
            <KpiStatCard
              tone="emerald"
              label="TeamA (No.)"
              value={data.teamA.count}
              footer={
                <>
                  <p className="text-app-muted">Work (Min)</p>
                  <p className="tabular-nums">{data.teamA.workSumMinutes}</p>
                </>
              }
            />
            <KpiStatCard
              tone="rose"
              label="TeamB (No.)"
              value={data.teamB.count}
              footer={
                <>
                  <p className="text-app-muted">Work (Min)</p>
                  <p className="tabular-nums">{data.teamB.workSumMinutes}</p>
                </>
              }
            />
            <KpiStatCard
              tone="info"
              label="TeamP (No.)"
              value={data.teamP.count}
              footer={
                <>
                  <p className="text-app-muted">Work (Min)</p>
                  <p className="tabular-nums">{data.teamP.workSumMinutes}</p>
                </>
              }
            />
          </KpiStatGrid>
        </div>
      ) : (
        <div className="mt-3">
          <EmptyState
            icon={Filter}
            title="ยังไม่มีสรุป"
            description="กด Search เพื่อดูสรุปตามตัวกรอง"
          />
        </div>
      )}
    </AppCard>
  )
}
