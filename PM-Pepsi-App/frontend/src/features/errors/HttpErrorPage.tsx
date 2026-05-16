import { Button } from '@/components/ui/button'
import { PepsiBrandMark } from '@/components/brand/PepsiBrandMark'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getHttpErrorMeta, parseHttpErrorCode } from '@/features/errors/http-error-catalog'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
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

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-gradient-to-b from-zinc-100 via-white to-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--brand-pepsi-red) 14%, transparent), transparent 45%),
            radial-gradient(circle at 80% 10%, color-mix(in srgb, var(--brand-pepsi-blue) 10%, transparent), transparent 40%),
            radial-gradient(circle at 50% 100%, rgba(63, 63, 70, 0.08), transparent 50%)`,
        }}
      />

      <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-zinc-200/80 bg-white/80 px-4 py-3 backdrop-blur-sm">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold text-zinc-900 transition-colors hover:text-zinc-700"
        >
          <PepsiBrandMark size="md" className="ring-1 ring-zinc-200" />
          <span className="hidden sm:inline">Planning PM/CM</span>
        </Link>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to="/login">เข้าสู่ระบบ</Link>
        </Button>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-lg"
        >
          <div className="mb-6 flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.4, type: 'spring', stiffness: 260, damping: 22 }}
              className={cn(
                'mb-4 flex size-20 items-center justify-center rounded-2xl border shadow-lg',
                isServerSide
                  ? 'border-red-200 bg-gradient-to-br from-red-50 to-white text-red-600'
                  : 'border-amber-200/80 bg-gradient-to-br from-amber-50 to-white text-amber-600',
              )}
            >
              <Icon className="size-10" strokeWidth={1.5} aria-hidden />
            </motion.div>
            <p className="font-mono text-5xl font-bold tracking-tight text-zinc-900 tabular-nums">
              {meta.code}
            </p>
            <p className="mt-1 text-lg font-semibold text-zinc-800">{meta.titleTh}</p>
            <p className="text-sm font-medium text-zinc-500">{meta.titleEn}</p>
          </div>

          <Card className="border-zinc-200/90 shadow-xl shadow-zinc-200/50">
            <CardHeader className="space-y-1 pb-2">
              <CardTitle className="text-base">สิ่งที่คุณสามารถทำได้</CardTitle>
              <CardDescription>{meta.descriptionTh}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
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
                  className="gap-2 border-zinc-300"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="size-4" aria-hidden />
                  โหลดใหม่
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <p className="mt-8 text-center text-xs text-zinc-400">
            ระบบวางแผน PM/CM — โรงงาน (offline-ready ตาม skills.md)
          </p>
        </motion.div>
      </main>
    </div>
  )
}
