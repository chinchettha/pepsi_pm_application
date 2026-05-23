import { formatWktypeDisplay } from '@/lib/wktype-zd-mapping'

type WktypeDisplayProps = {
  code: string
  mat?: string | null
  className?: string
}

/** คอลัมน์ Type — แสดง ZB ใน DB + ZD จากประชุม (tooltip) */
export function WktypeDisplay({ code, mat, className }: WktypeDisplayProps) {
  const d = formatWktypeDisplay(code)
  return (
    <span className={className ?? 'text-xs'} title={d.tooltip}>
      <span className="font-mono">{d.primary}</span>
      {mat ? <span className="text-app-muted">/{mat}</span> : null}
    </span>
  )
}
