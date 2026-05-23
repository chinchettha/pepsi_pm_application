const PINNED_KEY = 'pm_sidebar_pinned'

export function readSidebarPinned(): boolean {
  try {
    return localStorage.getItem(PINNED_KEY) === '1'
  } catch {
    return false
  }
}

export function writeSidebarPinned(pinned: boolean): void {
  try {
    localStorage.setItem(PINNED_KEY, pinned ? '1' : '0')
  } catch {
    /* ignore */
  }
}
