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
import { cn } from '@/lib/utils'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

type ConfirmPhraseDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  /** User must type this exactly (case-sensitive). */
  phrase: string
  phraseLabel?: string
  confirmLabel?: string
  loading?: boolean
  onConfirm: () => void
  /** Strong destructive styling for backup / delete / restore flows */
  tone?: 'default' | 'danger'
}

/** Destructive confirm — user types a phrase (e.g. RESTORE, RESET, role code). */
export function ConfirmPhraseDialog({
  open,
  onOpenChange,
  title,
  description,
  phrase,
  phraseLabel,
  confirmLabel = 'ยืนยัน',
  loading = false,
  onConfirm,
  tone = 'default',
}: ConfirmPhraseDialogProps) {
  const [typed, setTyped] = useState('')
  const ready = typed === phrase
  const isDanger = tone === 'danger'
  const showMismatch = typed.length > 0 && !ready

  useEffect(() => {
    if (!open) setTyped('')
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          isDanger &&
            'border-red-300 bg-red-50/40 dark:border-red-900 dark:bg-red-950/30 sm:max-w-md',
        )}
      >
        <DialogHeader className={cn(isDanger && 'text-left')}>
          {isDanger ? (
            <div className="flex items-start gap-3">
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700"
                aria-hidden
              >
                <AlertTriangle className="size-5" />
              </span>
              <div className="min-w-0 space-y-1">
                <DialogTitle className="text-red-950">{title}</DialogTitle>
                {description ? (
                  <DialogDescription className="text-red-900/80">{description}</DialogDescription>
                ) : null}
              </div>
            </div>
          ) : (
            <>
              <DialogTitle>{title}</DialogTitle>
              {description ? <DialogDescription>{description}</DialogDescription> : null}
            </>
          )}
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="confirm-phrase" className={cn(isDanger && 'text-red-950')}>
            {phraseLabel ?? `พิมพ์ ${phrase} เพื่อยืนยัน`}
          </Label>
          {isDanger ? (
            <p className="rounded-button border border-red-200 bg-white px-3 py-2 font-mono text-sm font-semibold tracking-wide text-red-800">
              {phrase}
            </p>
          ) : null}
          <Input
            id="confirm-phrase"
            value={typed}
            autoComplete="off"
            spellCheck={false}
            autoFocus
            placeholder={isDanger ? 'พิมพ์ตามข้อความด้านบน' : undefined}
            className={cn(
              isDanger &&
                'border-red-300 bg-white focus-visible:ring-red-400',
            )}
            aria-invalid={showMismatch}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && ready && !loading) onConfirm()
            }}
          />
          {showMismatch ? (
            <p className="text-xs text-red-700" role="status">
              ข้อความไม่ตรง — ต้องพิมพ์ให้ตรงทุกตัวอักษร
            </p>
          ) : ready ? (
            <p className="text-xs text-emerald-700" role="status">
              ตรงแล้ว — กดยืนยันได้
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            ยกเลิก
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!ready || loading}
            onClick={onConfirm}
          >
            {loading ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden /> : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
