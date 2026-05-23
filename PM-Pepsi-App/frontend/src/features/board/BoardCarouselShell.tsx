import {
  BOARD_CAROUSEL_INTERVAL_MS,
  BOARD_CAROUSEL_LABELS,
  type BoardCarouselSlide,
} from '@/lib/board-carousel'
import type { ReactNode } from 'react'

type Props = {
  enabled: boolean
  slide: BoardCarouselSlide
  paused: boolean
  onPauseChange: (paused: boolean) => void
  onGoTo: (slide: BoardCarouselSlide) => void
  zoneA: ReactNode
  zoneB: ReactNode
  zoneC: ReactNode
}

/** โซน D — สไลด์อัตโนมัติ A → B → C */
export function BoardCarouselShell({
  enabled,
  slide,
  paused,
  onPauseChange,
  onGoTo,
  zoneA,
  zoneB,
  zoneC,
}: Props) {
  if (!enabled) {
    return (
      <>
        {zoneA}
        {zoneB}
        {zoneC}
      </>
    )
  }

  const slides: { id: BoardCarouselSlide; node: ReactNode }[] = [
    { id: 'a', node: zoneA },
    { id: 'b', node: zoneB },
    { id: 'c', node: zoneC },
  ]

  return (
    <div className="engineering-board__carousel" aria-live="polite">
      <nav className="engineering-board__carousel-nav" aria-label="สไลด์โซน A B C">
        <span className="engineering-board__zone-tag">โซน D · สไลด์</span>
        <div className="engineering-board__carousel-dots">
          {slides.map(({ id }) => (
            <button
              key={id}
              type="button"
              className={
                slide === id
                  ? 'engineering-board__carousel-dot engineering-board__carousel-dot--active'
                  : 'engineering-board__carousel-dot'
              }
              aria-current={slide === id ? 'true' : undefined}
              aria-label={`โซน ${id.toUpperCase()} — ${BOARD_CAROUSEL_LABELS[id]}`}
              onClick={() => onGoTo(id)}
            />
          ))}
        </div>
        <span className="engineering-board__carousel-label">
          {BOARD_CAROUSEL_LABELS[slide]} · {slide.toUpperCase()} · ทุก{' '}
          {BOARD_CAROUSEL_INTERVAL_MS / 1000} วินาที
        </span>
        <button
          type="button"
          className="engineering-board__carousel-pause"
          onClick={() => onPauseChange(!paused)}
        >
          {paused ? 'เล่นต่อ' : 'หยุดชั่วคราว'}
        </button>
      </nav>

      <div className="engineering-board__carousel-viewport">
        {slides.map(({ id, node }) => (
          <div
            key={id}
            className={
              slide === id
                ? 'engineering-board__carousel-slide engineering-board__carousel-slide--active'
                : 'engineering-board__carousel-slide'
            }
            aria-hidden={slide !== id}
            inert={slide !== id ? true : undefined}
          >
            {node}
          </div>
        ))}
      </div>

      <div className="engineering-board__carousel-progress" aria-hidden key={slide}>
        <div
          className="engineering-board__carousel-progress-bar"
          style={{
            animationDuration: paused ? undefined : `${BOARD_CAROUSEL_INTERVAL_MS}ms`,
            animationPlayState: paused ? 'paused' : 'running',
          }}
        />
      </div>
    </div>
  )
}
