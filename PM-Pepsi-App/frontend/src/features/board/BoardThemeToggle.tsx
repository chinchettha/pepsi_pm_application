import { boardThemeLabel, type BoardThemeId } from '@/lib/board-theme'

type Props = {
  value: BoardThemeId
  onChange: (theme: BoardThemeId) => void
}

/** สลับธีมมืด / สว่าง */
export function BoardThemeToggle({ value, onChange }: Props) {
  return (
    <div className="engineering-board__theme-toggle" role="group" aria-label="ธีม Engineering Board">
      {(['dark', 'light'] as const).map((id) => (
        <button
          key={id}
          type="button"
          className={
            value === id
              ? 'engineering-board__theme-btn engineering-board__theme-btn--active'
              : 'engineering-board__theme-btn'
          }
          aria-pressed={value === id}
          onClick={() => onChange(id)}
        >
          {id === 'dark' ? '🌙' : '☀️'} {boardThemeLabel(id)}
        </button>
      ))}
    </div>
  )
}
