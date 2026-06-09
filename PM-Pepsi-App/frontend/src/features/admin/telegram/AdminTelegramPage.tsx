import type {
  CreateTelegramGroupBody,
  TelegramGroupItem,
  TelegramNotifyKind,
  TelegramLinkType,
} from '@/api/schemas'
import { ConfirmPhraseDialog } from '@/components/admin/ConfirmPhraseDialog'
import { AdminAccessDenied } from '@/components/admin/AdminAccessDenied'
import { AdminKpiCard } from '@/components/admin/AdminKpiCard'
import { AdminKpiGrid } from '@/components/admin/AdminKpiGrid'
import { AdminPageSection, AdminPageShell } from '@/components/admin/AdminPageShell'
import { AdminPageRoot } from '@/components/admin/AdminPageRoot'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  createTelegramGroup,
  deleteTelegramGroup,
  fetchTelegramGroups,
  fetchTelegramLinkStatus,
  fetchTelegramSummary,
  patchTelegramGroup,
  testTelegramGroup,
} from '@/lib/admin-telegram-api'
import { usePermission } from '@/lib/use-permission'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  Bot,
  Loader2,
  MessageSquare,
  Pencil,
  Plus,
  RefreshCcw,
  Send,
  Trash2,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

type FormState = {
  code: string
  name: string
  notifyKind: TelegramNotifyKind
  linkType: TelegramLinkType
  linkRef: string
  telegramChatId: string
  enabled: boolean
  note: string
  memberWkctrsText: string
}

const emptyForm = (): FormState => ({
  code: '',
  name: '',
  notifyKind: 'ack_to_planner',
  linkType: 'none',
  linkRef: '',
  telegramChatId: '',
  enabled: true,
  note: '',
  memberWkctrsText: '',
})

function parseWkctrs(text: string): string[] {
  return [...new Set(text.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean))]
}

function formToBody(form: FormState): CreateTelegramGroupBody {
  const body: CreateTelegramGroupBody = {
    code: form.code.trim(),
    name: form.name.trim(),
    notifyKind: form.notifyKind,
    linkType: form.linkType,
    linkRef: form.linkRef.trim() || null,
    telegramChatId: form.telegramChatId.trim() || null,
    enabled: form.enabled,
    note: form.note.trim() || null,
  }
  if (form.linkType === 'workcenters') {
    body.memberWkctrs = parseWkctrs(form.memberWkctrsText)
  }
  return body
}

export function AdminTelegramPage() {
  const { t } = useTranslation('admin')
  const { t: tc } = useTranslation('common')
  const qc = useQueryClient()
  const canRead = usePermission('admin.telegram.read')
  const canWrite = usePermission('admin.telegram.write')

  const summaryQ = useQuery({
    queryKey: ['admin', 'telegram', 'summary'],
    queryFn: fetchTelegramSummary,
    enabled: canRead,
    placeholderData: keepPreviousData,
  })

  const groupsQ = useQuery({
    queryKey: ['admin', 'telegram', 'groups'],
    queryFn: fetchTelegramGroups,
    enabled: canRead,
    placeholderData: keepPreviousData,
  })

  const linkQ = useQuery({
    queryKey: ['admin', 'telegram', 'link-status'],
    queryFn: fetchTelegramLinkStatus,
    enabled: canRead,
    placeholderData: keepPreviousData,
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<TelegramGroupItem | null>(null)
  const [editing, setEditing] = useState<TelegramGroupItem | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [showLinkTable, setShowLinkTable] = useState(false)

  const wkctrGroupOptions = summaryQ.data?.wkctrGroups ?? []
  const pmTeamOptions = summaryQ.data?.pmTeams ?? ['A', 'B', 'EE', 'UT']

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm())
    setDialogOpen(true)
  }

  const openEdit = (row: TelegramGroupItem) => {
    setEditing(row)
    setForm({
      code: row.code,
      name: row.name,
      notifyKind: row.notifyKind,
      linkType: row.linkType,
      linkRef: row.linkRef ?? '',
      telegramChatId: row.telegramChatId ?? '',
      enabled: row.enabled,
      note: row.note ?? '',
      memberWkctrsText: (row.memberWkctrs ?? []).join(', '),
    })
    setDialogOpen(true)
  }

  const invalidateAll = async () => {
    await qc.invalidateQueries({ queryKey: ['admin', 'telegram'] })
  }

  const saveMut = useMutation({
    mutationFn: async () => {
      const body = formToBody(form)
      if (editing) return patchTelegramGroup(editing.id, body)
      return createTelegramGroup(body)
    },
    onSuccess: async () => {
      await invalidateAll()
      toast.success(editing ? t('telegram.updated') : t('telegram.created'))
      setDialogOpen(false)
    },
    onError: (err) => toast.error((err as Error).message || t('telegram.saveFailed')),
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteTelegramGroup(id),
    onSuccess: async () => {
      await invalidateAll()
      toast.success(t('telegram.deleted'))
      setDeleteTarget(null)
    },
    onError: (err) => toast.error((err as Error).message || t('telegram.deleteFailed')),
  })

  const testMut = useMutation({
    mutationFn: (id: number) => testTelegramGroup(id),
    onSuccess: (res) => {
      if (res.ok) toast.success(t('telegram.testOk'))
      else toast.error(res.error || t('telegram.testFailed'))
    },
    onError: (err) => toast.error((err as Error).message || t('telegram.testFailed')),
  })

  const notifyKindLabel = useMemo(
    () =>
      (kind: TelegramNotifyKind) =>
        t(`telegram.notifyKinds.${kind}`, { defaultValue: kind }),
    [t],
  )

  const linkTypeLabel = useMemo(
    () =>
      (lt: TelegramLinkType) =>
        t(`telegram.linkTypes.${lt}`, { defaultValue: lt }),
    [t],
  )

  if (!canRead) {
    return (
      <AdminPageRoot tourTarget="admin-telegram">
        <AdminAccessDenied permission="admin.telegram.read" />
      </AdminPageRoot>
    )
  }

  const schemaMissing =
    summaryQ.error &&
    String((summaryQ.error as Error).message).includes('SCHEMA_MISSING')

  const isRefreshing =
    summaryQ.isFetching || groupsQ.isFetching || linkQ.isFetching

  return (
    <AdminPageShell
      tourTarget="admin-telegram"
      title={t('telegram.title')}
      description={t('telegram.description')}
      hints={t('telegram.hints', { returnObjects: true }) as string[]}
      headerActions={
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="admin-toolbar-btn"
            onClick={() => void invalidateAll()}
            disabled={isRefreshing}
          >
            <RefreshCcw
              className={`mr-1 size-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
              aria-hidden
            />
            {t('shared.refresh')}
          </Button>
          {canWrite ? (
            <Button type="button" className="admin-toolbar-btn" onClick={openCreate}>
              <Plus className="mr-1 size-4" />
              {t('telegram.addGroup')}
            </Button>
          ) : null}
        </>
      }
    >
        {schemaMissing ? (
          <AdminPageSection index={0}>
            <Card className="admin-card border-amber-300 bg-amber-50/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-amber-900">
                  <AlertCircle className="h-5 w-5" />
                  {t('telegram.schemaMissingTitle')}
                </CardTitle>
                <CardDescription className="text-amber-900/80">
                  {t('telegram.schemaMissingHint')}
                </CardDescription>
              </CardHeader>
            </Card>
          </AdminPageSection>
        ) : null}

        <AdminPageSection index={schemaMissing ? 1 : 0}>
          {summaryQ.isLoading ? (
            <AdminKpiGrid>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-card" />
              ))}
            </AdminKpiGrid>
          ) : summaryQ.data ? (
            <AdminKpiGrid className="lg:grid-cols-3">
              <AdminKpiCard
                icon={Bot}
                label={t('telegram.summary.bot')}
                tone={summaryQ.data.botConfigured ? 'success' : 'warning'}
                value={
                  summaryQ.data.botConfigured ? (
                    <Badge className="bg-emerald-600">{t('telegram.summary.configured')}</Badge>
                  ) : (
                    <Badge variant="outline">{t('telegram.summary.notConfigured')}</Badge>
                  )
                }
                hint={
                  summaryQ.data.notifyEnabled
                    ? t('telegram.summary.notifyOn')
                    : t('telegram.summary.notifyOff')
                }
              />
              <AdminKpiCard
                icon={MessageSquare}
                label={t('telegram.summary.groups')}
                value={
                  <span className="tabular-nums">
                    {summaryQ.data.enabledGroups}/{summaryQ.data.totalGroups}
                  </span>
                }
              />
              <AdminKpiCard
                icon={Users}
                label={t('telegram.summary.linkedTech')}
                value={
                  <span className="tabular-nums">
                    {summaryQ.data.linkedTechnicians}/{summaryQ.data.activeTechnicians}
                  </span>
                }
                hint={
                  <Link to="/admin/users" className="text-blue-600 underline">
                    {t('telegram.manageUsersLink')}
                  </Link>
                }
              />
            </AdminKpiGrid>
          ) : null}
          {summaryQ.data ? (
            <Card className="admin-card">
              <CardHeader>
                <CardTitle className="text-base">{t('telegram.helpCardTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-[var(--admin-text-muted)] whitespace-pre-line">
                {t('telegram.helpSteps')}
              </CardContent>
            </Card>
          ) : null}
        </AdminPageSection>

        <AdminPageSection index={schemaMissing ? 2 : 1}>
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="size-4" aria-hidden />
              {t('telegram.groupsTitle')}
            </CardTitle>
            <CardDescription>{t('telegram.groupsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {groupsQ.isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : groupsQ.isError ? (
              <p className="text-sm text-red-600">{(groupsQ.error as Error).message}</p>
            ) : !groupsQ.data?.length ? (
              <EmptyState
                icon={MessageSquare}
                title={t('telegram.emptyTitle')}
                description={t('telegram.emptyDesc')}
                action={
                  canWrite
                    ? { label: t('telegram.addGroup'), onClick: openCreate }
                    : undefined
                }
              />
            ) : (
              <div className="overflow-auto rounded-button border border-app">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('telegram.col.code')}</TableHead>
                      <TableHead>{t('telegram.col.name')}</TableHead>
                      <TableHead>{t('telegram.col.kind')}</TableHead>
                      <TableHead>{t('telegram.col.link')}</TableHead>
                      <TableHead>{t('telegram.col.chatId')}</TableHead>
                      <TableHead>{t('telegram.col.enabled')}</TableHead>
                      <TableHead className="text-right">{t('telegram.col.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupsQ.data.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-body-sm">{row.code}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell className="text-caption">{notifyKindLabel(row.notifyKind)}</TableCell>
                        <TableCell className="text-caption">
                          {linkTypeLabel(row.linkType)}
                          {row.linkRef ? ` · ${row.linkRef}` : ''}
                          {row.memberWkctrs?.length ? ` (${row.memberWkctrs.length} wkctr)` : ''}
                        </TableCell>
                        <TableCell className="font-mono text-caption">
                          {row.telegramChatId || '—'}
                        </TableCell>
                        <TableCell>
                          {row.enabled ? (
                            <Badge className="bg-emerald-600">{t('telegram.enabledYes')}</Badge>
                          ) : (
                            <Badge variant="outline">{t('telegram.enabledNo')}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {canWrite ? (
                              <>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  disabled={testMut.isPending}
                                  onClick={() => testMut.mutate(row.id)}
                                  title={t('telegram.testSend')}
                                >
                                  {testMut.isPending && testMut.variables === row.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Send className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEdit(row)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setDeleteTarget(row)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        </AdminPageSection>

        {linkQ.data ? (
          <AdminPageSection index={schemaMissing ? 3 : 2}>
          <Card className="admin-card">
            <CardHeader>
              <CardTitle className="text-base">{t('telegram.linkStatusTitle')}</CardTitle>
              <CardDescription>
                {t('telegram.linkStatusDesc', {
                  linked: linkQ.data.linked,
                  unlinked: linkQ.data.unlinked,
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowLinkTable((v) => !v)}
              >
                {showLinkTable ? t('telegram.hideLinkTable') : t('telegram.showLinkTable')}
              </Button>
              {showLinkTable ? (
                <div className="mt-3 max-h-64 overflow-auto rounded-button border border-app">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>wkctr</TableHead>
                        <TableHead>{t('telegram.col.name')}</TableHead>
                        <TableHead>chat_id</TableHead>
                        <TableHead>@username</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {linkQ.data.items.map((item) => (
                        <TableRow key={item.wkctr} className={!item.telegramChatId ? 'opacity-60' : ''}>
                          <TableCell className="font-mono">{item.wkctr}</TableCell>
                          <TableCell>{item.displayName || '—'}</TableCell>
                          <TableCell className="font-mono text-caption">
                            {item.telegramChatId || '—'}
                          </TableCell>
                          <TableCell>{item.telegramUsername ? `@${item.telegramUsername}` : '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : null}
            </CardContent>
          </Card>
          </AdminPageSection>
        ) : null}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? t('telegram.editGroup') : t('telegram.addGroup')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1">
              <Label htmlFor="tg-code">{t('telegram.field.code')}</Label>
              <Input
                id="tg-code"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                disabled={!!editing || saveMut.isPending}
                placeholder="PLANNER_ACK"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="tg-name">{t('telegram.field.name')}</Label>
              <Input
                id="tg-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                disabled={saveMut.isPending}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="tg-kind">{t('telegram.field.notifyKind')}</Label>
              <select
                id="tg-kind"
                className="flex h-9 w-full rounded-button border border-app bg-[var(--app-surface)] px-3 text-body-sm"
                value={form.notifyKind}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notifyKind: e.target.value as TelegramNotifyKind }))
                }
                disabled={saveMut.isPending}
              >
                {(
                  [
                    'ack_to_planner',
                    'ack_summary',
                    'confirm_reminder',
                    'custom',
                    'assignment_to_tech',
                  ] as TelegramNotifyKind[]
                ).map((k) => (
                  <option key={k} value={k}>
                    {notifyKindLabel(k)}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="tg-link-type">{t('telegram.field.linkType')}</Label>
              <select
                id="tg-link-type"
                className="flex h-9 w-full rounded-button border border-app bg-[var(--app-surface)] px-3 text-body-sm"
                value={form.linkType}
                onChange={(e) =>
                  setForm((f) => ({ ...f, linkType: e.target.value as TelegramLinkType, linkRef: '' }))
                }
                disabled={saveMut.isPending}
              >
                {(['none', 'wkctrgroup', 'pm_team', 'workcenters'] as TelegramLinkType[]).map(
                  (lt) => (
                    <option key={lt} value={lt}>
                      {linkTypeLabel(lt)}
                    </option>
                  ),
                )}
              </select>
            </div>
            {form.linkType === 'wkctrgroup' ? (
              <div className="grid gap-1">
                <Label htmlFor="tg-link-ref">{t('telegram.field.wkctrGroup')}</Label>
                <select
                  id="tg-link-ref"
                  className="flex h-9 w-full rounded-button border border-app bg-[var(--app-surface)] px-3 text-body-sm"
                  value={form.linkRef}
                  onChange={(e) => setForm((f) => ({ ...f, linkRef: e.target.value }))}
                  disabled={saveMut.isPending}
                >
                  <option value="">—</option>
                  {wkctrGroupOptions.map((g) => (
                    <option key={g.code} value={g.code}>
                      {g.code}
                      {g.description ? ` — ${g.description}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            {form.linkType === 'pm_team' ? (
              <div className="grid gap-1">
                <Label htmlFor="tg-pm-team">{t('telegram.field.pmTeam')}</Label>
                <select
                  id="tg-pm-team"
                  className="flex h-9 w-full rounded-button border border-app bg-[var(--app-surface)] px-3 text-body-sm"
                  value={form.linkRef}
                  onChange={(e) => setForm((f) => ({ ...f, linkRef: e.target.value }))}
                  disabled={saveMut.isPending}
                >
                  <option value="">—</option>
                  {pmTeamOptions.map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            {form.linkType === 'workcenters' ? (
              <div className="grid gap-1">
                <Label htmlFor="tg-wkctrs">{t('telegram.field.memberWkctrs')}</Label>
                <Textarea
                  id="tg-wkctrs"
                  rows={3}
                  value={form.memberWkctrsText}
                  onChange={(e) => setForm((f) => ({ ...f, memberWkctrsText: e.target.value }))}
                  placeholder="PAC006, PAC007"
                  disabled={saveMut.isPending}
                />
              </div>
            ) : null}
            <div className="grid gap-1">
              <Label htmlFor="tg-chat">{t('telegram.field.chatId')}</Label>
              <Input
                id="tg-chat"
                value={form.telegramChatId}
                onChange={(e) => setForm((f) => ({ ...f, telegramChatId: e.target.value }))}
                disabled={saveMut.isPending}
                placeholder="-1001234567890"
              />
              <p className="text-xs text-app-muted">{t('telegram.field.chatIdHint')}</p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
                disabled={saveMut.isPending}
              />
              {t('telegram.field.enabled')}
            </label>
            <div className="grid gap-1">
              <Label htmlFor="tg-note">{t('telegram.field.note')}</Label>
              <Textarea
                id="tg-note"
                rows={2}
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                disabled={saveMut.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              {tc('actions.cancel')}
            </Button>
            <Button
              type="button"
              onClick={() => saveMut.mutate()}
              disabled={saveMut.isPending || !form.code.trim() || !form.name.trim()}
            >
              {saveMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {tc('actions.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {deleteTarget ? (
        <ConfirmPhraseDialog
          open
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          tone="danger"
          title={t('telegram.deleteTitle')}
          description={deleteTarget.name}
          phrase="DELETE"
          confirmLabel={t('telegram.deleteConfirm')}
          loading={deleteMut.isPending}
          onConfirm={() => deleteMut.mutate(deleteTarget.id)}
        />
      ) : null}
    </AdminPageShell>
  )
}
