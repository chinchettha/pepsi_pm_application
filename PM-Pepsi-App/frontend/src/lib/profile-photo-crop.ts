/** Square output size — matches backend PERSONNEL_IMG_WIDTH (600px). */
export const PROFILE_PHOTO_CROP_SIZE = 600

export type PixelCropArea = {
  x: number
  y: number
  width: number
  height: number
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', () => reject(new Error('Failed to load image')))
    img.crossOrigin = 'anonymous'
    img.src = src
  })
}

/**
 * Crop + resize to a square JPEG blob (backend converts to WebP).
 * Circular mask is visual-only in the crop UI; stored image is square for object-cover avatars.
 */
export async function cropProfilePhotoToBlob(
  imageSrc: string,
  pixelCrop: PixelCropArea,
  rotation = 0,
  outputSize = PROFILE_PHOTO_CROP_SIZE,
): Promise<Blob> {
  const image = await loadImageElement(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')

  const maxSize = Math.max(image.width, image.height)
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

  canvas.width = safeArea
  canvas.height = safeArea

  ctx.translate(safeArea / 2, safeArea / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-safeArea / 2, -safeArea / 2)
  ctx.drawImage(image, (safeArea - image.width) / 2, (safeArea - image.height) / 2)

  const data = ctx.getImageData(0, 0, safeArea, safeArea)

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width / 2 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height / 2 - pixelCrop.y),
  )

  const out = document.createElement('canvas')
  out.width = outputSize
  out.height = outputSize
  const outCtx = out.getContext('2d')
  if (!outCtx) throw new Error('Canvas not supported')
  outCtx.drawImage(canvas, 0, 0, outputSize, outputSize)

  return new Promise((resolve, reject) => {
    out.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to export cropped image'))
          return
        }
        resolve(blob)
      },
      'image/jpeg',
      0.92,
    )
  })
}

export function croppedBlobToFile(blob: Blob, originalName: string): File {
  const base = originalName.replace(/\.[^.]+$/, '') || 'profile'
  return new File([blob], `${base}-crop.jpg`, { type: blob.type || 'image/jpeg' })
}
