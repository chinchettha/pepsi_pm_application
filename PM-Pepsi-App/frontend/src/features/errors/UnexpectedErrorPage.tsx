import { Button } from '@/components/ui/button'
import { ErrorPageShell } from '@/features/errors/ErrorPageShell'
import { Bug, Home, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'

export type UnexpectedErrorPageProps = {
  error: Error
  onReset: () => void
}

export function UnexpectedErrorPage({ error, onReset }: UnexpectedErrorPageProps) {
  const showStack = import.meta.env.DEV

  const detail = showStack && error.stack ? (
    <details className="error-page__stack">
      <summary className="cursor-pointer text-caption font-medium text-app">
        {error.name}: {error.message}
      </summary>
      <pre className="mt-2 max-h-40 overflow-auto rounded-button bg-[var(--app-text)] p-3 text-caption leading-relaxed text-[var(--app-surface)]">
        {error.stack}
      </pre>
    </details>
  ) : (
    <p className="error-page__dev-msg text-center font-mono text-caption text-app-muted">
      {error.name}: {error.message}
    </p>
  )

  return (
    <ErrorPageShell
      codeDisplay="!"
      titleTh="เกิดข้อผิดพลาดในแอป"
      titleEn="Unexpected Error"
      descriptionTh="มีบางอย่างผิดพลาดระหว่างแสดงผล คุณสามารถลองโหลดใหม่หรือกลับหน้าหลักได้"
      icon={Bug}
      tone="crash"
      detail={detail}
    >
      <Button type="button" className="gap-2" onClick={onReset}>
        <RefreshCw className="size-4" aria-hidden />
        ลองแสดงผลอีกครั้ง
      </Button>
      <Button type="button" variant="outline" className="gap-2" asChild>
        <Link to="/">
          <Home className="size-4" aria-hidden />
          หน้าแรก
        </Link>
      </Button>
    </ErrorPageShell>
  )
}
