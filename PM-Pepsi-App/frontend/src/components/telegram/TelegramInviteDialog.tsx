import type { TelegramLinkTokenResponse } from '@/api/schemas'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: TelegramLinkTokenResponse | null
  loading?: boolean
  title?: string
  description?: string
}

async function copyText(text: string, okMsg: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(okMsg)
  } catch {
    toast.error('Copy failed')
  }
}

export function TelegramInviteDialog({
  open,
  onOpenChange,
  data,
  loading = false,
  title,
  description,
}: Props) {
  const { t } = useTranslation('personnel')
  const { t: tc } = useTranslation('common')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title ?? t('telegram.inviteTitle')}</DialogTitle>
          <DialogDescription>
            {description ??
              (data
                ? t('telegram.inviteDesc', { wkctr: data.wkctr, id: data.idwkctr })
                : t('telegram.inviteLoading'))}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-app-muted" />
          </div>
        ) : data ? (
          <div className="grid gap-3">
            <div className="grid gap-1">
              <Label>{t('telegram.deepLink')}</Label>
              <div className="flex gap-2">
                <Input readOnly value={data.deepLink} className="font-mono text-xs" />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => void copyText(data.deepLink, t('telegram.copiedLink'))}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid gap-1">
              <Label>{t('telegram.startCommand')}</Label>
              <div className="flex gap-2">
                <Input readOnly value={`/start ${data.token}`} className="font-mono text-xs" />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    void copyText(`/start ${data.token}`, t('telegram.copiedCommand'))
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-app-muted">
              {t('telegram.expiresAt', {
                at: new Date(data.expiresAt).toLocaleString(),
              })}
            </p>
            {!data.botUsername ? (
              <p className="text-xs text-amber-700">{t('telegram.botUsernameMissing')}</p>
            ) : null}
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {tc('actions.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
