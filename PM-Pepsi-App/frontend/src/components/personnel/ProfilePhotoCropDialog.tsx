import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  cropProfilePhotoToBlob,
  croppedBlobToFile,
} from '@/lib/profile-photo-crop'
import { RotateCw, ZoomIn } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import Cropper, { type Area, type Point } from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

type Props = {
  open: boolean
  imageSrc: string | null
  fileName: string
  saving?: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (file: File) => void
}

export function ProfilePhotoCropDialog({
  open,
  imageSrc,
  fileName,
  saving = false,
  onOpenChange,
  onConfirm,
}: Props) {
  const { t } = useTranslation('personnel')
  const { t: tc } = useTranslation('common')
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [processing, setProcessing] = useState(false)

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const resetTransforms = useCallback(() => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setCroppedAreaPixels(null)
  }, [])

  useEffect(() => {
    if (open && imageSrc) {
      resetTransforms()
    }
  }, [open, imageSrc, resetTransforms])

  const handleOpenChange = (next: boolean) => {
    if (!next && !processing && !saving) {
      resetTransforms()
    }
    onOpenChange(next)
  }

  async function handleConfirm() {
    if (!imageSrc || !croppedAreaPixels) return
    setProcessing(true)
    try {
      const blob = await cropProfilePhotoToBlob(imageSrc, croppedAreaPixels, rotation)
      onConfirm(croppedBlobToFile(blob, fileName))
      resetTransforms()
    } catch (err) {
      console.error('[ProfilePhotoCropDialog]', err)
      toast.error(t('admin.photo.cropFailed'))
    } finally {
      setProcessing(false)
    }
  }

  const busy = processing || saving

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="space-y-1 px-6 pt-6 pb-2">
          <DialogTitle>{t('admin.photo.cropTitle')}</DialogTitle>
          <DialogDescription>{t('admin.photo.cropHint')}</DialogDescription>
        </DialogHeader>

        <div className="relative mx-6 aspect-square overflow-hidden rounded-card bg-[var(--app-muted)]">
          {imageSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
            />
          ) : null}
        </div>

        <div className="space-y-4 px-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="profile-photo-zoom" className="flex items-center gap-2 text-xs">
              <ZoomIn className="size-3.5" aria-hidden />
              {t('admin.photo.cropZoom')}
            </Label>
            <input
              id="profile-photo-zoom"
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              disabled={busy}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-[var(--app-accent)]"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => setRotation((r) => (r + 90) % 360)}
          >
            <RotateCw className="mr-1.5 size-4" aria-hidden />
            {t('admin.photo.cropRotate')}
          </Button>
        </div>

        <DialogFooter className="gap-2 border-t border-app px-6 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => handleOpenChange(false)}
          >
            {tc('actions.cancel')}
          </Button>
          <Button
            type="button"
            disabled={busy || !croppedAreaPixels}
            onClick={() => void handleConfirm()}
          >
            {busy ? t('admin.photo.uploading') : t('admin.photo.cropSave')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
