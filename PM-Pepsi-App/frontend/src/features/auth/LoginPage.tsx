import { resolvePostLoginPath } from '@/features/auth/auth-paths'
import { LoginBackdrop } from '@/features/auth/LoginBackdrop'
import { loginCardMotion, loginLogoMotion, loginToolbarMotion } from '@/features/auth/login-motion'
import { LoginFeedbackDialog } from '@/components/auth/LoginFeedbackDialog'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { usePublicSettings } from '@/providers/SettingsProvider'
import { publicLogoUrl } from '@/lib/settings-api'
import { logoLoginStyle } from '@/lib/branding-asset-css'
import { PepsiBrandMark } from '@/components/brand/PepsiBrandMark'
import { loginWithApi } from '@/features/auth/login-api'
import type { AuthFeedbackState } from '@/lib/auth-api-error'
import { resolveAuthFeedback } from '@/lib/auth-api-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'

type LoginForm = { username: string; password: string }

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { settings, brandingCacheKey } = usePublicSettings()
  const appName = settings?.appName?.trim() || 'PM Pepsi'
  const hasLogo = Boolean(settings?.hasLogo)
  const hasLoginBackground = Boolean(settings?.hasLoginBackground)
  const logoSrc = hasLogo ? publicLogoUrl(brandingCacheKey) : null

  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<AuthFeedbackState | null>(null)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [postLoginPath, setPostLoginPath] = useState<string | null>(null)
  const [cardShake, setCardShake] = useState(false)

  const loginSchema = useMemo(
    () =>
      z.object({
        username: z.string().min(1, t('auth.usernameRequired')),
        password: z.string().min(1, t('auth.passwordRequired')),
      }),
    [t],
  )

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  const closeFeedback = useCallback(() => {
    setFeedbackOpen(false)
    setFeedback(null)
    setPostLoginPath(null)
  }, [])

  const showFeedback = useCallback((state: AuthFeedbackState) => {
    setFeedback(state)
    setFeedbackOpen(true)
    if (state.kind === 'invalid' || state.kind === 'lockout') {
      setCardShake(true)
      window.setTimeout(() => setCardShake(false), 500)
      form.setFocus('password')
    }
  }, [form])

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true)
    try {
      const data = await loginWithApi(values.username, values.password, 'workcenter')
      const name = data.user.fullnameTh?.trim() || data.user.username
      const from = (location.state as { from?: { pathname?: string } } | null)?.from
      const target = resolvePostLoginPath(from?.pathname, 'workcenter')
      setPostLoginPath(target)
      showFeedback({
        kind: 'success',
        title: t('auth.loginSuccess'),
        message: t('auth.hello', { name }),
      })
    } catch (err) {
      showFeedback(resolveAuthFeedback(err))
    } finally {
      setSubmitting(false)
    }
  })

  const onFeedbackConfirm = () => {
    if (feedback?.kind === 'success' && postLoginPath) {
      closeFeedback()
      navigate(postLoginPath, { replace: true })
      return
    }
    closeFeedback()
  }

  return (
    <div className="login-page">
      <LoginBackdrop
        hasLoginBackground={hasLoginBackground}
        brandingCacheKey={brandingCacheKey}
      />

      <div className="login-page__glow login-page__glow--accent" aria-hidden />
      <div className="login-page__glow login-page__glow--primary" aria-hidden />

      <motion.div className="login-page__toolbar flex items-center gap-2" {...loginToolbarMotion}>
        <LanguageSwitcher />
        <ThemeToggle />
      </motion.div>

      <div className="login-page__center">
        <motion.div className="login-page__logo-wrap" {...loginLogoMotion}>
          {hasLogo && logoSrc ? (
            <img
              key={logoSrc}
              src={logoSrc}
              alt={appName}
              className="login-page__logo object-contain"
              style={logoLoginStyle(settings?.logoLoginHeightPx)}
            />
          ) : (
            <PepsiBrandMark size="lg" />
          )}
        </motion.div>

        <motion.div
          className={cn('login-page__card', cardShake && 'login-page__card--shake')}
          {...loginCardMotion}
          whileHover={{ y: -4, transition: { duration: 0.35 } }}
        >
          <div className="login-page__card-shine" aria-hidden />
          <div className="login-page__card-inner">
            <div className="login-page__card-header">
              <h1 className="text-heading-page font-semibold text-app">{t('auth.signInTitle')}</h1>
              {appName ? (
                <p className="mt-1 text-caption text-app-muted">{t('auth.signInTo', { app: appName })}</p>
              ) : null}
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username">{t('auth.username')}</Label>
                <Input
                  id="login-username"
                  autoComplete="username"
                  placeholder={t('auth.usernamePlaceholder')}
                  disabled={submitting || feedbackOpen}
                  {...form.register('username')}
                />
                {form.formState.errors.username ? (
                  <p className="text-body-sm text-form-error">{form.formState.errors.username.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">{t('auth.password')}</Label>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  disabled={submitting || feedbackOpen}
                  {...form.register('password')}
                />
                {form.formState.errors.password ? (
                  <p className="text-body-sm text-form-error">{form.formState.errors.password.message}</p>
                ) : null}
              </div>
              <Button type="submit" className="w-full" disabled={submitting || feedbackOpen}>
                {submitting ? t('auth.signingIn') : t('actions.login')}
              </Button>
            </form>

            <Button type="button" variant="ghost" className="mt-4 w-full" asChild>
              <Link to="/">{t('auth.backHome')}</Link>
            </Button>
          </div>
        </motion.div>
      </div>

      <LoginFeedbackDialog
        open={feedbackOpen}
        state={feedback}
        onClose={closeFeedback}
        onConfirm={onFeedbackConfirm}
      />
    </div>
  )
}
