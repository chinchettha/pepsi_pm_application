import type { EngUtilizationChartRow } from '@/lib/eng-utilization-chart'
import { EngUtilizationPersonCard } from './EngUtilizationPersonCard'

type Props = {
  people: EngUtilizationChartRow[]
  showRca?: boolean
  variant?: 'default' | 'kiosk'
  imageUrl?: (idwkctr: string) => string
  className?: string
}

/** กริดรายคนพร้อมรูป — เทียบ Summary Daily/Weekly ใน Eng Utilization 2026.xlsx */
export function EngUtilizationTeamGrid({
  people,
  showRca = false,
  variant = 'default',
  imageUrl,
  className,
}: Props) {
  const kiosk = variant === 'kiosk'

  if (people.length === 0) {
    return (
      <p
        className={
          kiosk
            ? 'py-6 text-center text-body-sm text-white/55'
            : 'py-6 text-center text-caption'
        }
      >
        ไม่มีช่างที่มี HR hour ในช่วงนี้
      </p>
    )
  }

  const gridClass = kiosk
    ? `eng-util-team-grid eng-util-team-grid--kiosk${className ? ` ${className}` : ''}`
    : `grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6${className ? ` ${className}` : ''}`

  return (
    <div className={gridClass}>
      {people.map((person) => (
        <EngUtilizationPersonCard
          key={person.idwkctr}
          person={person}
          showRca={showRca}
          variant={variant}
          imageUrl={imageUrl}
        />
      ))}
    </div>
  )
}
