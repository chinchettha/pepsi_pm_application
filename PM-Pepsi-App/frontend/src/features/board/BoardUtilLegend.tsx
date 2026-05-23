type Props = {
  showRca: boolean
}

/** สี PM / Reactive / RCA — ใช้คู่กับกราฟและการ์ดรายคน */
export function BoardUtilLegend({ showRca }: Props) {
  return (
    <div className="engineering-board__legend" aria-hidden>
      <span className="engineering-board__legend-item engineering-board__legend-item--pm">
        PM
      </span>
      <span className="engineering-board__legend-item engineering-board__legend-item--re">
        Reactive
      </span>
      {showRca ? (
        <span className="engineering-board__legend-item engineering-board__legend-item--rca">
          RCA
        </span>
      ) : null}
    </div>
  )
}
