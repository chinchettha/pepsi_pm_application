import { Input } from '@/components/ui/input'
import { fetchWorkOrderSuggestions } from '@/lib/api-public'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

type WorkOrderAutocompleteProps = {
  value: string
  onSelect: (item: { id: string; wkorder: string; label: string }) => void
  placeholder?: string
  className?: string
  minLength?: number
}

export function WorkOrderAutocomplete({
  value,
  onSelect,
  placeholder = 'ค้นเลขที่ wkorder…',
  className,
  minLength = 2,
}: WorkOrderAutocompleteProps) {
  const [q, setQ] = useState(value)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setQ(value)
  }, [value])

  const suggestionsQ = useQuery({
    queryKey: ['work-orders', 'suggestions', q],
    queryFn: () => fetchWorkOrderSuggestions(q),
    enabled: open && q.trim().length >= minLength,
  })

  return (
    <div className={cn('relative', className)}>
      <Input
        value={q}
        placeholder={placeholder}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 150)
        }}
        autoComplete="off"
      />
      {open && q.trim().length >= minLength ? (
        <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border border-zinc-200 bg-white py-1 text-sm shadow-md">
          {suggestionsQ.isLoading ? (
            <li className="px-3 py-2 text-zinc-500">กำลังค้น…</li>
          ) : suggestionsQ.isError ? (
            <li className="px-3 py-2 text-red-600">{(suggestionsQ.error as Error).message}</li>
          ) : (suggestionsQ.data?.length ?? 0) === 0 ? (
            <li className="px-3 py-2 text-zinc-500">ไม่พบ</li>
          ) : (
            suggestionsQ.data?.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left hover:bg-zinc-100"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setQ(item.wkorder)
                    onSelect(item)
                    setOpen(false)
                  }}
                >
                  {item.label}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  )
}
