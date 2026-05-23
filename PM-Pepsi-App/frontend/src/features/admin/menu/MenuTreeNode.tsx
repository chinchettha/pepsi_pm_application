import type { AdminMenuRow } from '@/api/schemas'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Trash2 } from 'lucide-react'

export type MenuTreeNodeProps = {
  item: AdminMenuRow
  canWrite: boolean
  onEdit: () => void
  onDelete: () => void
}

/** Sortable row in Menu Builder DnD list (§7.1 MenuTreeNode) */
export function MenuTreeNode({ item, canWrite, onEdit, onDelete }: MenuTreeNodeProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.idmenu,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 rounded-card border border-app bg-[var(--app-surface)] px-2 py-2',
        isDragging && 'z-10 shadow-md ring-2 ring-[var(--admin-primary)]',
        item.menuKind === 'heading' && 'border-app bg-app-subtle',
      )}
    >
      {canWrite ? (
        <button
          type="button"
          className="cursor-grab touch-none rounded p-1 text-app-muted hover:bg-app-muted active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="ลากจัดลำดับ"
        >
          <GripVertical className="size-4" />
        </button>
      ) : (
        <span className="w-6" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={item.menuKind === 'heading' ? 'secondary' : 'outline'}>
            {item.menuKind === 'heading' ? 'หัวข้อ' : 'เมนู'}
          </Badge>
          <span className="font-medium text-app">{item.menutitle}</span>
          <span className="text-xs text-app-muted">#{item.menuon}</span>
        </div>
        {item.menuKind === 'item' ? (
          <p className="truncate text-xs text-app-muted">
            {item.reactRoute || item.menulink || '—'} · {item.menuright}
          </p>
        ) : (
          <p className="text-xs text-app-muted">{item.menuright}</p>
        )}
      </div>
      {canWrite ? (
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8"
            aria-label="แก้ไขเมนู"
            onClick={onEdit}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8 text-red-700"
            aria-label="ลบเมนู"
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ) : null}
    </div>
  )
}
