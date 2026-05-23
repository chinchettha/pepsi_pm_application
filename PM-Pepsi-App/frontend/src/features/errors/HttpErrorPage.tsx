import { Button } from '@/components/ui/button'
import { ErrorPageShell } from '@/features/errors/ErrorPageShell'
import { getHttpErrorMeta, parseHttpErrorCode } from '@/features/errors/http-error-catalog'
import { ArrowLeft, Home, RefreshCw } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

export type HttpErrorPageProps = {
  /** ใช้กับ catch-all `*` เมื่อไม่มีพารามิเตอร์ใน URL */
  forcedCode?: number
}

export function HttpErrorPage({ forcedCode }: HttpErrorPageProps) {
  const { code: codeParam } = useParams<{ code: string }>()
  const navigate = useNavigate()

  const parsed = parseHttpErrorCode(codeParam)
  const code =
    typeof forcedCode === 'number' && Number.isFinite(forcedCode)
      ? forcedCode
      : parsed ?? 404

  const meta = getHttpErrorMeta(code)
  const Icon = meta.icon
  const isServerSide = meta.code >= 500
  const tone = isServerSide ? 'server' : 'client'

  return (
    <ErrorPageShell
      codeDisplay={String(meta.code)}
      titleTh={meta.titleTh}
      titleEn={meta.titleEn}
      descriptionTh={meta.descriptionTh}
      icon={Icon}
      tone={tone}
    >
      <Button type="button" className="gap-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="size-4" aria-hidden />
        ย้อนกลับ
      </Button>
      <Button type="button" variant="outline" className="gap-2" asChild>
        <Link to="/">
          <Home className="size-4" aria-hidden />
          หน้าแรก
        </Link>
      </Button>
      {isServerSide ? (
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="size-4" aria-hidden />
          โหลดใหม่
        </Button>
      ) : null}
    </ErrorPageShell>
  )
}
