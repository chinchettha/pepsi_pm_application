import { personnelImageUrl } from '@/lib/api-public'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export type ProfileAvatarProps = {
  displayName: string
  /** idwkctr สำหรับโหลดรูปจาก /api/v1/personnel/:id/image */
  idwkctr?: string
  hasImage?: boolean
  imgMember?: string | null
  className?: string
}

/** รูปโปรไฟล์ workcenter หรือตัวอักษรย่อ */
export function ProfileAvatar({
  displayName,
  idwkctr,
  hasImage,
  imgMember,
  className,
}: ProfileAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const initial = displayName.trim().charAt(0).toUpperCase() || '?'
  const showPhoto = Boolean(idwkctr && (hasImage || imgMember) && !imgFailed)

  if (showPhoto && idwkctr) {
    return (
      <img
        src={personnelImageUrl(idwkctr, imgMember ?? (hasImage ? 1 : undefined))}
        alt={displayName.trim() || idwkctr}
        loading="lazy"
        decoding="async"
        className={cn(
          'size-9 shrink-0 rounded-full object-cover ring-2 ring-app',
          className,
        )}
        onError={() => setImgFailed(true)}
      />
    )
  }

  return (
    <span
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--app-text)] text-body-sm font-semibold text-white ring-2 ring-app',
        className,
      )}
      aria-hidden
    >
      {initial}
    </span>
  )
}
