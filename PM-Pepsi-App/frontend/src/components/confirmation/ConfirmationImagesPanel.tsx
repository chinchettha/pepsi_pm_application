import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

export { CONFIRM_IMAGE_RECOMMENDED_PER_PHASE } from '@/lib/confirm-image-limits'

const PHASE_CONFIG: {
  phase: ConfirmationImagePhase
  title: string
  hint: string
}[] = [
  { phase: 'before', title: 'ก่อนทำงาน (Before)', hint: 'ภาพสภาพก่อนซ่อม / ก่อนดำเนินการ' },
  { phase: 'after', title: 'หลังทำงาน (After)', hint: 'ภาพหลังปิดงาน / หลังซ่อมเสร็จ' },
]

type ConfirmationImageItem = Awaited<ReturnType<typeof fetchConfirmationImages>>[number]

type PhaseUploadBlockProps = {
  phase: ConfirmationImagePhase
  title: string
  hint: string
  idiw37: number
  items: ConfirmationImageItem[]
  onView: (idcimg: number) => void
  readOnly?: boolean
}

function PhaseUploadBlock({
  phase,
  title,
  hint,
  idiw37,
  items,
  onView,
  readOnly,
}: PhaseUploadBlockProps) {
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
    <section className="space-y-3 rounded-card border border-app bg-[var(--app-surface)] p-3">
      <div>
        <h4 className="text-body-sm font-semibold text-app">{title}</h4>
        <p className="text-xs text-app-muted">{hint}</p>
        <p className="mt-1 text-xs text-app-muted">
          {items.length} รูป · แนะนำประมาณ {CONFIRM_IMAGE_RECOMMENDED_PER_PHASE} รูปต่อฝั่ง (ไม่จำกัดจำนวน)
        </p>
      </div>

      {!readOnly ? (
        <div className="space-y-2">
          <div>
            <Label htmlFor={`img-caption-${phase}`}>คำอธิบาย (ใช้ร่วมกับชุดรูปที่เลือก)</Label>
            <Textarea
              id={`img-caption-${phase}`}
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="เช่น จุดรั่ว, หลังเปลี่ยนอะไหล่"
              maxLength={500}
            />
          </div>
          <div>
            <Label htmlFor={`img-files-${phase}`}>
              เลือกรูป (JPEG, PNG, HEIC … — ไม่จำกัดขนาด · ระบบย่อเป็น WebP ใน DB)
            </Label>
            <Input
              id={`img-files-${phase}`}
              type="file"
              accept="image/*"
              multiple
              disabled={uploadMut.isPending}
              onChange={(e) => {
                setUploadError(null)
                setFiles(Array.from(e.target.files ?? []))
              }}
            />
          </div>
          {uploadError ? <p className="text-body-sm text-red-600">{uploadError}</p> : null}
          <Button
            type="button"
            disabled={!files.length || uploadMut.isPending}
            onClick={() => uploadMut.mutate()}
          >
            {uploadMut.isPending
              ? 'กำลังอัปโหลด…'
              : `อัปโหลด ${files.length || ''} รูป`.trim()}
          </Button>
        </div>
      ) : null}

      {items.length ? (
        <ul className="grid gap-2 sm:grid-cols-2">
          {items.map((img) => (
            <ImageRow key={img.idcimg} img={img} idiw37={idiw37} onView={onView} readOnly={readOnly} />
          ))}
        </ul>
      ) : (
        <p className="text-caption">ยังไม่มีรูปในหมวดนี้</p>
      )}
    </section>
  )
}

function ImageRow({
  img,
  idiw37,
  onView,
  readOnly,
}: {
  img: ConfirmationImageItem
  idiw37: number
  onView: (id: number) => void
  readOnly?: boolean
}) {
  const qc = useQueryClient()
  const delMut = useMutation({
    mutationFn: () => deleteConfirmationImage(img.idcimg),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['confirmation', 'images', idiw37] })
      await qc.invalidateQueries({ queryKey: ['confirmation-images', idiw37] })
    },
  })

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-button border border-app bg-app-subtle px-2 py-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-body-sm font-medium">{img.originalName || img.fileName}</p>
        {img.comment ? <p className="text-xs text-app-muted">{img.comment}</p> : null}
        <p className="text-xs text-app-muted">
          {img.wkctr} · {new Date(img.createdAt).toLocaleString('th-TH')}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => onView(img.idcimg)}>
          ดู
        </Button>
        {!readOnly ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={delMut.isPending}
            onClick={() => delMut.mutate()}
          >
            ลบ
          </Button>
        ) : null}
      </div>
    </li>
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
  const [viewImageId, setViewImageId] = useState<number | null>(null)
  const ready = enabled && typeof idiw37 === 'number' && Number.isFinite(idiw37)

  const imagesQ = useQuery({
    queryKey: ['confirmation', 'images', idiw37],
    queryFn: () => fetchConfirmationImages(idiw37!),
    enabled: ready,
  })

  const imageDataQ = useQuery({
    queryKey: ['confirmation', 'image-data', viewImageId],
    queryFn: () => fetchConfirmationImageData(viewImageId!),
    enabled: ready && typeof viewImageId === 'number',
  })

  const grouped = useMemo(() => {
    const all = imagesQ.data ?? []
    return {
      before: all.filter((i) => i.phase === 'before'),
      after: all.filter((i) => i.phase === 'after'),
      legacy: all.filter((i) => i.phase !== 'before' && i.phase !== 'after'),
    }
  }, [imagesQ.data])

  if (!ready) {
    return <p className="text-caption">เลือก Work Order ก่อนอัปโหลดรูป</p>
  }

  const id = idiw37 as number

  return (
    <div className="space-y-4">
      <p className="text-caption">
        อัปโหลดรูปปิดงานแยก <strong>Before</strong> / <strong>After</strong> — เลือกหลายไฟล์ต่อครั้งได้ (JPEG)
      </p>

      {imagesQ.isLoading ? <Skeleton className="h-32 w-full" /> : null}
      {imagesQ.isError ? (
        <p className="text-body-sm text-red-600">{(imagesQ.error as Error).message}</p>
      ) : null}

      {imagesQ.isSuccess ? (
        <>
          {PHASE_CONFIG.map(({ phase, title, hint }) => (
            <PhaseUploadBlock
              key={phase}
              phase={phase}
              title={title}
              hint={hint}
              idiw37={id}
              items={grouped[phase]}
              onView={setViewImageId}
              readOnly={readOnly}
            />
          ))}

          {grouped.legacy.length > 0 ? (
            <section className="space-y-2 rounded-card border border-dashed border-app bg-app-subtle p-3">
              <h4 className="text-body-sm font-medium text-app">รูปเก่า (ไม่ระบุ Before/After)</h4>
              <ul className="space-y-2">
                {grouped.legacy.map((img) => (
                  <ImageRow
                    key={img.idcimg}
                    img={img}
                    idiw37={id}
                    onView={setViewImageId}
                    readOnly={readOnly}
                  />
                ))}
              </ul>
            </section>
          ) : null}
        </>
      ) : null}

      {viewImageId != null ? (
        <div className="rounded-card border border-app bg-[var(--app-surface)] p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-body-sm font-medium">ดูรูป</span>
            <Button type="button" size="sm" variant="outline" onClick={() => setViewImageId(null)}>
              ปิด
            </Button>
          </div>
          {imageDataQ.isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : imageDataQ.isError ? (
            <p className="text-body-sm text-red-600">{(imageDataQ.error as Error).message}</p>
          ) : imageDataQ.data ? (
            <img
              alt=""
              className="max-h-[min(70vh,480px)] w-full rounded object-contain"
              src={`data:${imageDataQ.data.mime};base64,${imageDataQ.data.base64}`}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
