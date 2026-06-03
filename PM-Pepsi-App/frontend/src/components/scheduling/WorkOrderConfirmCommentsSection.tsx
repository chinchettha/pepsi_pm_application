import {
  SchedulingPageSection,
  SchedulingSection,
} from '@/components/scheduling/SchedulingPageLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Loader2,
  MessageSquarePlus,
  MessageSquareText,
  Pencil,
  Send,
  Trash2,
  UserRound,
} from 'lucide-react'
import { useMemo, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'

export type ConfirmCommentItem = {
  idcom: number
  comdetail: string
  wkctr: string
  createdAt: string
}

type Props = {
  newComment: string
  onNewCommentChange: (v: string) => void
  onAdd: () => void
  addPending: boolean
  editingId: number | null
  editingText: string
  onEditingTextChange: (v: string) => void
  onStartEdit: (idcom: number, text: string) => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  savePending: boolean
  isLoading: boolean
  isError: boolean
  error: Error | null
  items: ConfirmCommentItem[]
  onDelete: (idcom: number) => void
  deletePending: boolean
}

const MAX_COMMENT_LENGTH = 1000

const cardVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
  },
}

function fmtDateTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function CommentCard({
  comment,
  editingId,
  editingText,
  onEditingTextChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  savePending,
  deletePending,
  reduceMotion,
  t,
  tc,
  dateLocale,
}: {
  comment: ConfirmCommentItem
  editingId: number | null
  editingText: string
  onEditingTextChange: (v: string) => void
  onStartEdit: (idcom: number, text: string) => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  onDelete: (idcom: number) => void
  savePending: boolean
  deletePending: boolean
  reduceMotion: boolean | null
  t: ReturnType<typeof useTranslation>['t']
  tc: ReturnType<typeof useTranslation>['t']
  dateLocale: string
}) {
  const isEditing = editingId === comment.idcom

  return (
    <motion.li variants={reduceMotion ? undefined : cardVariants} layout={!reduceMotion}>
      <article
        className={cn(
          'relative overflow-hidden rounded-xl border app-surface-panel shadow-sm transition-shadow hover:shadow-md',
          isEditing ? 'border-violet-300 ring-1 ring-violet-200/80' : 'border-app/70',
        )}
      >
        <div
          className={cn(
            'absolute inset-y-0 left-0 w-1',
            isEditing ? 'bg-violet-500' : 'bg-violet-300/80',
          )}
          aria-hidden
        />
        <div className="p-4 pl-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                <UserRound className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="truncate font-mono text-sm font-semibold text-app">{comment.wkctr}</p>
                <p className="text-[11px] text-app-muted">
                  {fmtDateTime(comment.createdAt, dateLocale)}
                </p>
              </div>
            </div>
            {!isEditing ? (
              <div className="flex shrink-0 gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 text-xs"
                  onClick={() => onStartEdit(comment.idcom, comment.comdetail)}
                >
                  <Pencil className="size-3" aria-hidden />
                  {t('shared.edit')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => onDelete(comment.idcom)}
                  disabled={deletePending}
                  aria-label={t('woComments.deleteAria')}
                >
                  {deletePending ? (
                    <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  ) : (
                    <Trash2 className="size-3.5" aria-hidden />
                  )}
                </Button>
              </div>
            ) : null}
          </div>

          {isEditing ? (
            <div className="mt-3 space-y-2">
              <Textarea
                value={editingText}
                onChange={(e) => onEditingTextChange(e.target.value)}
                rows={4}
                maxLength={MAX_COMMENT_LENGTH}
                className="resize-none bg-violet-50/30"
                autoFocus
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-app-muted tabular-nums">
                  {editingText.length}/{MAX_COMMENT_LENGTH}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="bg-violet-700 hover:bg-violet-800"
                    onClick={onSaveEdit}
                    disabled={!editingText.trim() || savePending}
                  >
                    {savePending ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" aria-hidden />
                        {tc('shared.saving')}
                      </>
                    ) : (
                      tc('common:actions.save')
                    )}
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={onCancelEdit}>
                    {tc('common:actions.cancel')}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-app">
              {comment.comdetail}
            </p>
          )}
        </div>
      </article>
    </motion.li>
  )
}

export function WorkOrderConfirmCommentsSection({
  newComment,
  onNewCommentChange,
  onAdd,
  addPending,
  editingId,
  editingText,
  onEditingTextChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  savePending,
  isLoading,
  isError,
  error,
  items,
  onDelete,
  deletePending,
}: Props) {
  const { t, i18n } = useTranslation('scheduling')
  const { t: tc } = useTranslation(['scheduling', 'common'])
  const reduceMotion = useReducedMotion()
  const dateLocale = i18n.language.startsWith('th') ? 'th-TH' : 'en-US'

  const authorCount = useMemo(() => new Set(items.map((c) => c.wkctr)).size, [items])

  const handleNewCommentKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && newComment.trim() && !addPending) {
      e.preventDefault()
      onAdd()
    }
  }

  return (
    <div className="space-y-4">
      <SchedulingPageSection index={0}>
        <motion.div
          layout={!reduceMotion}
          className="overflow-hidden rounded-card border border-violet-200/90 bg-gradient-to-br from-violet-50 via-[var(--app-surface)] to-[color-mix(in_srgb,var(--app-accent)_4%,var(--app-surface))] p-4 shadow-[var(--app-shadow-card)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-800/70">
                <MessageSquareText className="size-3.5" aria-hidden />
                {t('woComments.title')}
              </p>
              <p className="mt-0.5 text-body-sm text-app-muted">{t('woComments.subtitle')}</p>
            </div>
            <Badge className="shrink-0 border-0 bg-violet-600/10 text-violet-900">
              {t('shared.items', { count: items.length })}
            </Badge>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="flex min-w-[6rem] flex-1 items-center gap-2 rounded-button border border-violet-200/70 app-surface-panel--soft px-3 py-2">
              <MessageSquareText className="size-4 shrink-0 text-violet-700" aria-hidden />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-800/65">
                  {t('woComments.notes')}
                </p>
                <p className="text-sm font-bold tabular-nums text-violet-950">{items.length}</p>
              </div>
            </div>
            <div className="flex min-w-[6rem] flex-1 items-center gap-2 rounded-button border border-violet-200/70 app-surface-panel--soft px-3 py-2">
              <UserRound className="size-4 shrink-0 text-violet-700" aria-hidden />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-800/65">
                  {t('woComments.authors')}
                </p>
                <p className="text-sm font-bold tabular-nums text-violet-950">{authorCount}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </SchedulingPageSection>

      <SchedulingPageSection index={1}>
        <SchedulingSection
          icon={MessageSquarePlus}
          title={t('woComments.addTitle')}
          description={t('woComments.addDesc')}
          className="border-violet-200/80 bg-gradient-to-br from-violet-50/60 to-white"
        >
          <div className="space-y-3 rounded-xl border border-violet-100/80 app-surface-panel--soft p-3">
            <div className="space-y-1.5">
              <Label htmlFor="new-comment" className="text-xs font-medium">
                {t('shared.comment')}
              </Label>
              <Textarea
                id="new-comment"
                value={newComment}
                onChange={(e) => onNewCommentChange(e.target.value)}
                onKeyDown={handleNewCommentKeyDown}
                placeholder={t('woComments.placeholder')}
                rows={4}
                maxLength={MAX_COMMENT_LENGTH}
                className="resize-none bg-[var(--app-surface)]"
              />
              <div className="flex items-center justify-between gap-2 text-[11px] text-app-muted">
                <span>{t('woComments.ctrlEnter')}</span>
                <span className="tabular-nums">
                  {newComment.length}/{MAX_COMMENT_LENGTH}
                </span>
              </div>
            </div>
            <Button
              type="button"
              onClick={onAdd}
              disabled={!newComment.trim() || addPending}
              className="w-full bg-violet-700 shadow-sm hover:bg-violet-800 sm:w-auto"
            >
              {addPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {t('woComments.adding')}
                </>
              ) : (
                <>
                  <Send className="size-4" aria-hidden />
                  {t('woComments.addButton')}
                </>
              )}
            </Button>
          </div>
        </SchedulingSection>
      </SchedulingPageSection>

      <SchedulingPageSection index={2}>
        <SchedulingSection
          icon={MessageSquareText}
          title={t('woComments.savedTitle')}
          description={t('woComments.savedDesc')}
          badge={
            items.length > 0 ? (
              <Badge variant="outline" className="border-violet-200/80 text-[10px] text-violet-900">
                {t('shared.items', { count: items.length })}
              </Badge>
            ) : null
          }
          bodyClassName="space-y-3"
        >
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>
          ) : isError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error?.message ?? t('shared.loadingFailed')}
            </p>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-violet-200/80 bg-violet-50/30 px-4 py-10 text-center">
              <MessageSquareText className="size-9 text-violet-300" aria-hidden />
              <p className="mt-2 text-sm font-medium text-app">{t('woComments.emptyTitle')}</p>
              <p className="mt-1 max-w-xs text-xs text-app-muted">{t('woComments.emptyDesc')}</p>
            </div>
          ) : (
            <motion.ul
              initial={reduceMotion ? false : 'hidden'}
              animate="show"
              variants={
                reduceMotion
                  ? undefined
                  : {
                      hidden: { opacity: 0 },
                      show: { opacity: 1, transition: { staggerChildren: 0.04 } },
                    }
              }
              className="space-y-3"
            >
              <AnimatePresence mode="popLayout">
                {items.map((c) => (
                  <CommentCard
                    key={c.idcom}
                    comment={c}
                    editingId={editingId}
                    editingText={editingText}
                    onEditingTextChange={onEditingTextChange}
                    onStartEdit={onStartEdit}
                    onCancelEdit={onCancelEdit}
                    onSaveEdit={onSaveEdit}
                    onDelete={onDelete}
                    savePending={savePending}
                    deletePending={deletePending}
                    reduceMotion={reduceMotion}
                    t={t}
                    tc={tc}
                    dateLocale={dateLocale}
                  />
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </SchedulingSection>
      </SchedulingPageSection>
    </div>
  )
}
