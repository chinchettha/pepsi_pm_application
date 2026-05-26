export const RBAC_PREVIEW_EVENT = 'pm-rbac-preview-changed'
const STORAGE_KEY = 'pm_rbac_preview'

export type RbacPreview = {
  roleCode: string
  roleName: string
  permissions: string[]
}

/** Stable parse cache — required for useSyncExternalStore (referential equality). */
let cachedPreviewRaw: string | null | undefined
let cachedPreviewParsed: RbacPreview | null = null

function readRbacPreview(): RbacPreview | null {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (raw === cachedPreviewRaw) return cachedPreviewParsed
  cachedPreviewRaw = raw
  if (!raw) {
    cachedPreviewParsed = null
    return null
  }
  try {
    cachedPreviewParsed = JSON.parse(raw) as RbacPreview
  } catch {
    cachedPreviewParsed = null
  }
  return cachedPreviewParsed
}

/** Snapshot for useSyncExternalStore — same reference until sessionStorage changes. */
export function getRbacPreviewSnapshot(): RbacPreview | null {
  return readRbacPreview()
}

export function subscribeRbacPreview(onStoreChange: () => void) {
  window.addEventListener(RBAC_PREVIEW_EVENT, onStoreChange)
  return () => window.removeEventListener(RBAC_PREVIEW_EVENT, onStoreChange)
}

export function setRbacPreview(preview: RbacPreview | null) {
  if (preview) {
    const raw = JSON.stringify(preview)
    sessionStorage.setItem(STORAGE_KEY, raw)
    cachedPreviewRaw = raw
    cachedPreviewParsed = preview
  } else {
    sessionStorage.removeItem(STORAGE_KEY)
    cachedPreviewRaw = null
    cachedPreviewParsed = null
  }
  window.dispatchEvent(new Event(RBAC_PREVIEW_EVENT))
}

export function clearRbacPreview() {
  setRbacPreview(null)
}

/** Test-only: reset in-memory cache between vitest cases. */
export function resetRbacPreviewCacheForTests(): void {
  cachedPreviewRaw = undefined
  cachedPreviewParsed = null
}



