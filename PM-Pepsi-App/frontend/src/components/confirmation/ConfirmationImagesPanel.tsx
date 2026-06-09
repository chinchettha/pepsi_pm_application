import {
  SchedulingPageSection,
  SchedulingSection,
} from '@/components/scheduling/SchedulingPageLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ImageLightbox } from '@/components/ui/image-lightbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  deleteConfirmationImage,
  fetchConfirmationImageData,
  fetchConfirmationImages,
  postConfirmationImage,
  type ConfirmationImagePhase,
} from '@/lib/api-public'
import { CONFIRM_IMAGE_RECOMMENDED_PER_PHASE } from '@/lib/confirm-image-limits'
import { cn } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Camera,
  Eye,
  ImageIcon,
  ImagePlus,
  Loader2,
  Trash2,
  Upload,
} from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export { CONFIRM_IMAGE_RECOMMENDED_PER_PHASE } from '@/lib/confirm-image-limits'

const PHASE_META: {
  phase: ConfirmationImagePhase
  titleKey: 'images.phaseAfterTitle'
  hintKey: 'images.phaseAfterHint'
  icon: typeof ImagePlus
  tone: 'after'
}[] = [
  {
    phase: 'after',
    titleKey: 'images.phaseAfterTitle',
    hintKey: 'images.phaseAfterHint',
    icon: ImagePlus,
    tone: 'after',
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
  },
}

type ConfirmationImageItem = Awaited<ReturnType<typeof fetchConfirmationImages>>[number]

function phaseToneClass(tone: 'before' | 'after') {
  return tone === 'before'
    ? 'border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-white'
    : 'border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 to-white'
}

function phaseBadgeClass(tone: 'before' | 'after') {
  return tone === 'before'
    ? 'bg-amber-600/10 text-amber-900 border-amber-200/80'
    : 'bg-emerald-600/10 text-emerald-900 border-emerald-200/80'
}

function ImageThumbnail({
  idcimg,
  alt,
  className,
}: {
  idcimg: number
  alt: string
  className?: string
}) {
  const q = useQuery({
    queryKey: ['confirmation', 'image-data', idcimg],
    queryFn: () => fetchConfirmationImageData(idcimg),
    staleTime: 5 * 60 * 1000,
  })

  if (q.isLoading) {
    return <Skeleton className={cn('size-full', className)} />
  }

  if (q.isError || !q.data) {
    return (
      <div
        className={cn(
          'flex size-full items-center justify-center bg-app-subtle text-app-muted',
          className,
        )}
      >
        <ImageIcon className="size-8 opacity-40" aria-hidden />
      </div>
    )
  }

  return (
    <img
      alt={alt}
      className={cn('size-full object-cover', className)}
      src={`data:${q.data.mime};base64,${q.data.base64}`}
      loading="lazy"
    />
  )
}

function ImageGalleryCard({
  img,
  idiw37,
  onView,
  readOnly,
  index,
}: {
  img: ConfirmationImageItem
  idiw37: number
  onView: (idcimg: number) => void
  readOnly?: boolean
  index: number
}) {
  const { t } = useTranslation('confirmation')
  const reduceMotion = useReducedMotion()
  const qc = useQueryClient()
  const delMut = useMutation({
    mutationFn: () => deleteConfirmationImage(img.idcimg),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['confirmation', 'images', idiw37] })
      await qc.invalidateQueries({ queryKey: ['confirmation-images', idiw37] })
    },
  })

  const label = img.originalName || img.fileName

  return (
    <motion.li
      variants={reduceMotion ? undefined : cardVariants}
      initial={reduceMotion ? false : 'hidden'}
      animate="show"
      custom={index}
      className="group overflow-hidden rounded-xl border border-app/70 app-surface-panel shadow-sm transition-shadow hover:shadow-md"
    >
      <button
        type="button"
        className="relative block aspect-[4/3] w-full overflow-hidden bg-app-subtle"
        onClick={() => onView(img.idcimg)}
      >
        <ImageThumbnail idcimg={img.idcimg} alt={label} />
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/25 group-hover:opacity-100">
          <Eye className="size-7 text-white drop-shadow" aria-hidden />
        </span>
      </button>
      <div className="space-y-1 p-2.5">
        <p className="truncate text-xs font-medium text-app" title={label}>
          {label}
        </p>
        {img.comment ? (
          <p className="line-clamp-2 text-[11px] leading-snug text-app-muted">{img.comment}</p>
        ) : null}
        <p className="text-[10px] text-app-muted">
          {img.wkctr} · {new Date(img.createdAt).toLocaleString('th-TH')}
        </p>
        <div className="flex gap-1.5 pt-0.5">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 flex-1 text-xs"
            onClick={() => onView(img.idcimg)}
          >
            <Eye className="size-3" aria-hidden />
            {t('images.view')}
          </Button>
          {!readOnly ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
              disabled={delMut.isPending}
              onClick={() => delMut.mutate()}
              aria-label={t('images.deletePhotoAria')}
            >
              {delMut.isPending ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <Trash2 className="size-3.5" aria-hidden />
              )}
            </Button>
          ) : null}
        </div>
      </div>
    </motion.li>
  )
}

function UploadDropZone({
  phase,
  files,
  onFilesChange,
  disabled,
}: {
  phase: ConfirmationImagePhase
  files: File[]
  onFilesChange: (files: File[]) => void
  disabled?: boolean
}) {
  const { t } = useTranslation('confirmation')
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        id={`img-files-${phase}`}
        type="file"
        accept="image/*"
        multiple
        disabled={disabled}
        className="sr-only"
        onChange={(e) => onFilesChange(Array.from(e.target.files ?? []))}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors',
          'border-teal-200/80 bg-teal-50/40 hover:border-teal-300 hover:bg-teal-50/70',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        <span className="flex size-10 items-center justify-center rounded-full app-surface-panel text-teal-700 shadow-sm ring-1 ring-teal-200/80 dark:text-teal-300">
          <Upload className="size-5" aria-hidden />
        </span>
        <span className="text-sm font-medium text-app">{t('images.pickFromDevice')}</span>
        <span className="max-w-sm text-xs text-app-muted">{t('images.fileTypesHint')}</span>
      </button>
      {files.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 rounded-lg border border-teal-100 bg-teal-50/50 p-2">
          {files.map((f) => (
            <Badge
              key={`${f.name}-${f.size}`}
              variant="outline"
              className="max-w-full truncate border-teal-200/80 app-surface-panel text-[11px] font-normal dark:text-teal-200"
            >
              {f.name}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  )
}

type PhaseUploadBlockProps = {
  phase: ConfirmationImagePhase
  title: string
  hint: string
  icon: typeof Camera
  tone: 'before' | 'after'
  sectionIndex: number
  idiw37: number
  items: ConfirmationImageItem[]
  onView: (idcimg: number) => void
  readOnly?: boolean
}

function PhaseUploadBlock({
  phase,
  title,
  hint,
  icon: Icon,
  tone,
  sectionIndex,
  idiw37,
  items,
  onView,
  readOnly,
}: PhaseUploadBlockProps) {
  const { t } = useTranslation('confirmation')
  const qc = useQueryClient()
  const [files, setFiles] = useState<File[]>([])
  const [caption, setCaption] = useState('')
  const [uploadError, setUploadError] = useState<string | null>(null)

  const uploadMut = useMutation({
    mutationFn: async () => {
      setUploadError(null)
      for (const file of files) {
        await postConfirmationImage(idiw37, file, { phase, caption })
      }
    },
    onSuccess: async () => {
      setFiles([])
      setCaption('')
      await qc.invalidateQueries({ queryKey: ['confirmation', 'images', idiw37] })
      await qc.invalidateQueries({ queryKey: ['confirmation-images', idiw37] })
    },
    onError: (err: Error) => setUploadError(err.message),
  })

  return (
    <SchedulingPageSection index={sectionIndex}>
      <SchedulingSection
        icon={Icon}
        title={title}
        description={hint}
        badge={
          <Badge variant="outline" className={cn('border text-[10px]', phaseBadgeClass(tone))}>
            {t('images.photoCount', { count: items.length })}
          </Badge>
        }
        className={phaseToneClass(tone)}
      >
        <p className="mb-3 text-xs text-app-muted">
          {t('images.recommendedPerPhase', { count: CONFIRM_IMAGE_RECOMMENDED_PER_PHASE })}
        </p>

        {!readOnly ? (
          <div className="mb-4 space-y-3 rounded-xl border border-teal-100/80 app-surface-panel--soft p-3">
            <div className="space-y-1.5">
              <Label htmlFor={`img-caption-${phase}`} className="text-xs font-medium">
                {t('images.captionLabel')}
              </Label>
              <Textarea
                id={`img-caption-${phase}`}
                rows={2}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={t('images.captionPlaceholder')}
                maxLength={500}
                className="resize-none bg-[var(--app-surface)]"
              />
            </div>
            <UploadDropZone
              phase={phase}
              files={files}
              onFilesChange={(next) => {
                setUploadError(null)
                setFiles(next)
              }}
              disabled={uploadMut.isPending}
            />
            {uploadError ? <p className="text-xs text-red-600">{uploadError}</p> : null}
            <Button
              type="button"
              className="w-full bg-teal-700 hover:bg-teal-800 sm:w-auto"
              disabled={!files.length || uploadMut.isPending}
              onClick={() => uploadMut.mutate()}
            >
              {uploadMut.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {t('images.uploading')}
                </>
              ) : (
                <>
                  <Upload className="size-4" aria-hidden />
                  {files.length > 0
                    ? t('images.uploadCount', { count: files.length })
                    : t('images.upload')}
                </>
              )}
            </Button>
          </div>
        ) : null}

        {items.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((img, i) => (
              <ImageGalleryCard
                key={img.idcimg}
                img={img}
                idiw37={idiw37}
                onView={onView}
                readOnly={readOnly}
                index={i}
              />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-app/60 bg-app-subtle/50 px-4 py-8 text-center">
            <ImageIcon className="size-8 text-app-muted/50" aria-hidden />
            <p className="mt-2 text-sm text-app-muted">{t('images.noPhotosInPhase')}</p>
          </div>
        )}
      </SchedulingSection>
    </SchedulingPageSection>
  )
}

function ImageViewerLightbox({
  viewImage,
  onClose,
  enabled,
}: {
  viewImage: ConfirmationImageItem | null
  onClose: () => void
  enabled: boolean
}) {
  const { t } = useTranslation('confirmation')
  const imageDataQ = useQuery({
    queryKey: ['confirmation', 'image-data', viewImage?.idcimg],
    queryFn: () => fetchConfirmationImageData(viewImage!.idcimg),
    enabled: enabled && viewImage != null,
  })

  const src = imageDataQ.data
    ? `data:${imageDataQ.data.mime};base64,${imageDataQ.data.base64}`
    : null

  const title = viewImage?.originalName || viewImage?.fileName || t('images.lightboxFallbackTitle')
  const subtitle = viewImage
    ? [
        viewImage.comment || null,
        viewImage.wkctr,
        new Date(viewImage.createdAt).toLocaleString('th-TH'),
      ]
        .filter(Boolean)
        .join(' · ')
    : undefined

  return (
    <ImageLightbox
      open={viewImage != null}
      onOpenChange={(open) => !open && onClose()}
      title={title}
      subtitle={subtitle}
      src={src}
      alt={title}
      loading={imageDataQ.isLoading}
      error={imageDataQ.isError ? (imageDataQ.error as Error).message : null}
    />
  )
}

export type ConfirmationImagesPanelProps = {
  idiw37: number | null | undefined
  enabled?: boolean
  readOnly?: boolean
}

export function ConfirmationImagesPanel({
  idiw37,
  enabled = true,
  readOnly = false,
}: ConfirmationImagesPanelProps) {
  const { t } = useTranslation('confirmation')
  const reduceMotion = useReducedMotion()
  const [viewImageId, setViewImageId] = useState<number | null>(null)
  const ready = enabled && typeof idiw37 === 'number' && Number.isFinite(idiw37)

  const imagesQ = useQuery({
    queryKey: ['confirmation', 'images', idiw37],
    queryFn: () => fetchConfirmationImages(idiw37!),
    enabled: ready,
  })

  const viewImage = useMemo(() => {
    if (viewImageId == null) return null
    return (imagesQ.data ?? []).find((i) => i.idcimg === viewImageId) ?? null
  }, [imagesQ.data, viewImageId])

  const grouped = useMemo(() => {
    const all = imagesQ.data ?? []
    return {
      after: all.filter((i) => i.phase === 'after'),
      legacy: all.filter((i) => i.phase !== 'after'),
    }
  }, [imagesQ.data])

  const totalCount = (imagesQ.data ?? []).length

  if (!ready) {
    return <p className="text-caption">{t('images.selectWoFirst')}</p>
  }

  const id = idiw37 as number

  return (
    <div className="space-y-4">
      <SchedulingPageSection index={0}>
        <motion.div
          layout={!reduceMotion}
          className="overflow-hidden rounded-card border border-sky-200/90 bg-gradient-to-br from-sky-50 via-[var(--app-surface)] to-[color-mix(in_srgb,var(--app-accent)_4%,var(--app-surface))] p-4 shadow-[var(--app-shadow-card)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-800/70">
                <Camera className="size-3.5" aria-hidden />
                {t('images.panelTitle')}
              </p>
              <p className="mt-0.5 text-body-sm text-app-muted">{t('images.panelDesc')}</p>
            </div>
            <Badge className="shrink-0 border-0 bg-sky-600/10 text-sky-900">
              {t('images.totalPhotos', { count: totalCount })}
            </Badge>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="flex min-w-[8rem] flex-1 items-center gap-2 rounded-button border border-emerald-200/70 app-surface-panel--soft px-3 py-2">
              <ImagePlus className="size-4 shrink-0 text-emerald-700" aria-hidden />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-800/65">
                  {t('images.after')}
                </p>
                <p className="text-sm font-bold tabular-nums text-emerald-950">{grouped.after.length}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </SchedulingPageSection>

      {imagesQ.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-40 w-full rounded-card" />
          <Skeleton className="h-40 w-full rounded-card" />
        </div>
      ) : null}

      {imagesQ.isError ? (
        <p className="text-body-sm text-red-600">{(imagesQ.error as Error).message}</p>
      ) : null}

      {imagesQ.isSuccess ? (
        <>
          {PHASE_META.map(({ phase, titleKey, hintKey, icon, tone }, i) => (
            <PhaseUploadBlock
              key={phase}
              phase={phase}
              title={t(titleKey)}
              hint={t(hintKey)}
              icon={icon}
              tone={tone}
              sectionIndex={i + 1}
              idiw37={id}
              items={grouped.after}
              onView={setViewImageId}
              readOnly={readOnly}
            />
          ))}

          {grouped.legacy.length > 0 ? (
            <SchedulingPageSection index={3}>
              <SchedulingSection
                icon={ImageIcon}
                title={t('images.legacyTitle')}
                description={t('images.legacyDesc')}
                badge={
                  <Badge variant="outline" className="text-[10px]">
                    {t('images.photoCount', { count: grouped.legacy.length })}
                  </Badge>
                }
                className="border-dashed"
              >
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {grouped.legacy.map((img, i) => (
                    <ImageGalleryCard
                      key={img.idcimg}
                      img={img}
                      idiw37={id}
                      onView={setViewImageId}
                      readOnly={readOnly}
                      index={i}
                    />
                  ))}
                </ul>
              </SchedulingSection>
            </SchedulingPageSection>
          ) : null}
        </>
      ) : null}

      <ImageViewerLightbox
        viewImage={viewImage}
        onClose={() => setViewImageId(null)}
        enabled={ready}
      />
    </div>
  )
}
