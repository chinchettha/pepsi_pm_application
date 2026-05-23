import { readSidebarPinned, writeSidebarPinned } from '@/lib/sidebar-prefs'
import { useCallback, useState } from 'react'

/** Desktop: ยุบไอคอน · hover ขยาย · ปักหมุดค้างขยาย */
export function useSidebarState() {
  const [pinned, setPinnedState] = useState(readSidebarPinned)
  const [hovered, setHovered] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const setPinned = useCallback((value: boolean) => {
    setPinnedState(value)
    writeSidebarPinned(value)
  }, [])

  const togglePinned = useCallback(() => {
    setPinned(!pinned)
  }, [pinned, setPinned])

  const desktopExpanded = pinned || hovered

  return {
    pinned,
    setPinned,
    togglePinned,
    hovered,
    setHovered,
    desktopExpanded,
    mobileOpen,
    setMobileOpen,
  }
}
