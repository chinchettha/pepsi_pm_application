import { PepsiBrandMark } from '@/components/brand/PepsiBrandMark'
import { Button } from '@/components/ui/button'
import {
  errorCardMotion,
  errorIconMotion,
  errorPageItem,
  errorPageStagger,
} from '@/features/errors/error-page-motion'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export type ErrorPageTone = 'client' | 'server' | 'crash'

export type ErrorPageShellProps = {
  /** ตัวเลข HTTP หรือข้อความสั้น เช่น "!" */
  codeDisplay: string
  titleTh: string
  titleEn?: string
  descriptionTh: string
  icon: LucideIcon
  tone: ErrorPageTone
  /** รายละเอียดเพิ่มในการ์ด (เช่น stack trace โหมด dev) */
  detail?: ReactNode
  children: ReactNode
  showLoginLink?: boolean
  footerNote?: string
}

function AnimatedCode({ value }: { value: string }) {
  const chars = [...value]
  return (
    <p className="error-page__code" aria-hidden>
      {chars.map((ch, i) => (
        <motion.span
          key={`${ch}-${i}`}
          className="error-page__code-digit"
          initial={{ opacity: 0, y: 28, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: 0.08 + i * 0.07,
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {ch}
        </motion.span>
      ))}
      <span className="sr-only">{value}</span>
    </p>
  )
}

export function ErrorPageShell({
  codeDisplay,
  titleTh,
  titleEn,
  descriptionTh,
  icon: Icon,
  tone,
  detail,
  children,
  showLoginLink = true,
  footerNote = 'ระบบวางแผน PM/CM — โรงงาน',
}: ErrorPageShellProps) {
  return (
    <div className={cn('error-page', `error-page--${tone}`)}>
      <div className="error-page__backdrop" aria-hidden />
      <div className="error-page__glow error-page__glow--accent" aria-hidden />
      <div className="error-page__glow error-page__glow--primary" aria-hidden />
      <div className="error-page__glow error-page__glow--soft" aria-hidden />

      <motion.header
        className="error-page__header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link to="/" className="error-page__brand">
          <PepsiBrandMark size="md" className="ring-1 ring-app" />
          <span className="hidden sm:inline">Planning PM/CM</span>
        </Link>
        {showLoginLink ? (
          <Button type="button" variant="outline" size="sm" className="error-page__login-btn" asChild>
            <Link to="/login">เข้าสู่ระบบ</Link>
          </Button>
        ) : null}
      </motion.header>

      <main className="error-page__main">
        <motion.div
          className="error-page__content"
          variants={errorPageStagger}
          initial="hidden"
          animate="show"
        >
          <motion.div className="error-page__hero" variants={errorPageItem}>
            <motion.div
              className={cn('error-page__icon-wrap', `error-page__icon-wrap--${tone}`)}
              {...errorIconMotion}
            >
              <div className="error-page__icon-ring" aria-hidden />
              <Icon className="error-page__icon size-10" strokeWidth={1.5} />
            </motion.div>
            <AnimatedCode value={codeDisplay} />
            <h1 className="error-page__title">{titleTh}</h1>
            {titleEn ? <p className="error-page__subtitle">{titleEn}</p> : null}
          </motion.div>

          <motion.div className="error-page__card" {...errorCardMotion}>
            <div className="error-page__card-shine" aria-hidden />
            <div className="error-page__card-inner">
              <p className="error-page__card-label">สิ่งที่คุณสามารถทำได้</p>
              <p className="error-page__card-desc">{descriptionTh}</p>
              {detail ? <div className="error-page__detail">{detail}</div> : null}
              <div className="error-page__actions">{children}</div>
            </div>
          </motion.div>

          {footerNote ? (
            <motion.p className="error-page__footer" variants={errorPageItem}>
              {footerNote}
            </motion.p>
          ) : null}
        </motion.div>
      </main>
    </div>
  )
}
