import { useEffect, useRef } from 'react'

/** Debounce serialized form snapshot into submitted filter state (scheduling pages). */
export function useDebouncedFormFilters(
  snapshot: string,
  apply: () => void,
  delayMs = 400,
): void {
  const applyRef = useRef(apply)
  applyRef.current = apply

  useEffect(() => {
    const id = window.setTimeout(() => {
      applyRef.current()
    }, delayMs)
    return () => window.clearTimeout(id)
  }, [snapshot, delayMs])
}
