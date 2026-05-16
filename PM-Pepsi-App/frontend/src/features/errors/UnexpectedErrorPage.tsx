import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Bug, Home, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'

export type UnexpectedErrorPageProps = {
  error: Error
  onReset: () => void
}

export function UnexpectedErrorPage({ error, onReset }: UnexpectedErrorPageProps) {
  const showStack = import.meta.env.DEV

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-gradient-to-b from-red-50/40 via-white to-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 30%, rgba(239, 68, 68, 0.12), transparent 42%)',
        }}
      />

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-lg"
        >
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex size-20 items-center justify-center rounded-2xl border border-red-200 bg-white text-red-600 shadow-lg">
              <Bug className="size-10" strokeWidth={1.5} aria-hidden />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">เกิดข้อผิดพลาดในแอป</h1>
            <p className="mt-2 text-sm text-zinc-600">
              มีบางอย่างผิดพลาดระหว่างแสดงผล คุณสามารถลองโหลดใหม่หรือกลับหน้าหลักได้
            </p>
          </div>

          <Card className="border-red-100 shadow-xl shadow-red-100/40">
            <CardHeader>
              <CardTitle className="text-base text-red-800">รายละเอียด (สำหรับผู้พัฒนา)</CardTitle>
              <CardDescription className="font-mono text-xs text-zinc-700 break-all">
                {error.name}: {error.message}
              </CardDescription>
            </CardHeader>
            {showStack && error.stack ? (
              <CardContent>
                <pre className="max-h-48 overflow-auto rounded-lg border border-zinc-200 bg-zinc-950 p-3 text-left text-[11px] leading-relaxed text-zinc-100">
                  {error.stack}
                </pre>
              </CardContent>
            ) : null}
            <CardContent className="flex flex-col gap-3 pt-0 sm:flex-row sm:flex-wrap sm:justify-center">
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
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
