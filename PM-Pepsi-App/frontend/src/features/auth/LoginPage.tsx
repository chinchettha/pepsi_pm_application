import { resolvePostLoginPath } from '@/features/auth/auth-paths'
import { loginWithApi, type LoginMode } from '@/features/auth/login-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

const loginSchema = z.object({
  username: z.string().min(1, 'กรุณากรอกชื่อผู้ใช้'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginFormPanel({
  mode,
  usernameLabel,
  usernameAutoComplete,
}: {
  mode: LoginMode
  usernameLabel: string
  usernameAutoComplete: string
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true)
    try {
      const data = await loginWithApi(values.username, values.password, mode)
      const name = data.user.fullnameTh?.trim() || data.user.username
      toast.success(`สวัสดี ${name}`)
      const from = (location.state as { from?: { pathname?: string } } | null)?.from
      const target = resolvePostLoginPath(from?.pathname, mode)
      navigate(target, { replace: true })
    } catch (err) {
      let message = 'เข้าสู่ระบบไม่สำเร็จ'
      if (err instanceof Error && err.message) {
        try {
          const parsed = JSON.parse(err.message) as { message?: string }
          if (parsed.message) message = parsed.message
        } catch {
          message = err.message
        }
      }
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`username-${mode}`}>{usernameLabel}</Label>
        <Input
          id={`username-${mode}`}
          autoComplete={usernameAutoComplete}
          {...form.register('username')}
        />
        {form.formState.errors.username ? (
          <p className="text-sm text-red-600">{form.formState.errors.username.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`password-${mode}`}>รหัสผ่าน</Label>
        <Input
          id={`password-${mode}`}
          type="password"
          autoComplete="current-password"
          {...form.register('password')}
        />
        {form.formState.errors.password ? (
          <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
        ) : null}
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
      </Button>
    </form>
  )
}

export function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col bg-zinc-100">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-zinc-900">เข้าสู่ระบบ</h1>
          <p className="mt-2 text-sm text-zinc-600">
            React Hook Form + Zod + bcrypt (API) — เมนูจาก <code className="text-xs">tbmenu</code>
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <Tabs defaultValue="workcenter">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="workcenter">Work center</TabsTrigger>
              <TabsTrigger value="member">สมาชิก (BK)</TabsTrigger>
            </TabsList>
            <TabsContent value="workcenter">
              <p className="text-xs text-zinc-500">เทียบ <code>login.php</code> — รหัสช่าง (idwkctr)</p>
              <LoginFormPanel
                mode="workcenter"
                usernameLabel="รหัส Work center (idwkctr)"
                usernameAutoComplete="username"
              />
            </TabsContent>
            <TabsContent value="member">
              <p className="text-xs text-zinc-500">เทียบ <code>login-bk.php</code> — tbl_member</p>
              <LoginFormPanel
                mode="member"
                usernameLabel="ชื่อผู้ใช้ (username)"
                usernameAutoComplete="username"
              />
            </TabsContent>
          </Tabs>
          <Button type="button" variant="ghost" className="mt-4 w-full" asChild>
            <Link to="/">กลับหน้าแรก</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
