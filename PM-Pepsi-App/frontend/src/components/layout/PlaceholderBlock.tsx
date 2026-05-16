import type { ReactNode } from 'react'

export function PlaceholderBlock({
  title,
  children,
}: {
  title: string
  children?: ReactNode
}) {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50/80 p-6 text-sm text-zinc-600">
        <p className="font-medium text-zinc-800">{title}</p>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  )
}
