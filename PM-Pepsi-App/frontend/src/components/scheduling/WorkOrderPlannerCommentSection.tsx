import { SchedulingSection } from '@/components/scheduling/SchedulingPageLayout'
import { MessageSquareText } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type Props = {
  comment: string
}

export function WorkOrderPlannerCommentSection({ comment }: Props) {
  const { t } = useTranslation('scheduling')
  const text = comment.trim()

  return (
    <SchedulingSection
      icon={MessageSquareText}
      title={t('plannerComment.title')}
      description={t('plannerComment.description')}
      bodyClassName="space-y-2"
    >
      {text ? (
        <p className="whitespace-pre-wrap rounded-button border border-app/70 bg-[var(--app-surface)] px-3 py-2.5 text-body-sm text-app shadow-sm">
          {text}
        </p>
      ) : (
        <p className="text-xs text-app-muted">{t('plannerComment.empty')}</p>
      )}
    </SchedulingSection>
  )
}
