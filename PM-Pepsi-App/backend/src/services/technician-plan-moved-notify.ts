import type { Pool } from 'pg'
import { getTelegramWebAppUrl } from '../lib/telegram-web-url.js'
import {
  isTelegramBotConfigured,
  isTelegramNotifyEnabled,
  sendTelegramMessage,
} from '../lib/telegram-bot.js'
import { createAppNotification } from './app-notifications.js'

type WoSnapshot = {
  wkorder: string
  wktype: string | null
  operationshorttext: string | null
}

function isoToDisplayDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!m) return iso
  const yyyy = Number(m[1])
  const mm = Number(m[2])
  const dd = Number(m[3])
  if (!Number.isFinite(yyyy) || !Number.isFinite(mm) || !Number.isFinite(dd)) return iso
  return new Date(yyyy, mm - 1, dd).toLocaleDateString('th-TH')
}

function buildPlanCalendarLink(idiw37: number, targetDateIso: string): string {
  const params = new URLSearchParams({
    idiw37: String(idiw37),
    date: targetDateIso,
  })
  return `/plan-calendar?${params.toString()}`
}

async function loadWoSnapshot(pool: Pool, idiw37: number): Promise<WoSnapshot | null> {
  const { rows } = await pool.query<WoSnapshot>(
    `SELECT wkorder, wktype, operationshorttext FROM app.tbiw37n WHERE idiw37 = $1`,
    [idiw37],
  )
  return rows[0] ?? null
}

async function loadPlannerDisplayName(pool: Pool, wkctr: string): Promise<string> {
  const { rows } = await pool.query<{
    titlewkctr: string | null
    namewkctr: string | null
    surnamewkctr: string | null
  }>(
    `SELECT titlewkctr, namewkctr, surnamewkctr FROM app.tbworkcenter WHERE wkctr = $1`,
    [wkctr],
  )
  const r = rows[0]
  if (!r) return wkctr
  const name = [r.titlewkctr, r.namewkctr, r.surnamewkctr]
    .map((p) => (p ?? '').trim())
    .filter(Boolean)
    .join(' ')
  return name || wkctr
}

async function loadNotifyRecipients(
  pool: Pool,
  idiw37: number,
): Promise<string[]> {
  const { rows } = await pool.query<{ wkctr: string }>(
    `SELECT DISTINCT wkctr
     FROM app.tbplangingwork
     WHERE idiw37 = $1
       AND COALESCE(TRIM(pwteam), '') IN ('P', 'G')
     UNION
     SELECT DISTINCT requester_wkctr AS wkctr
     FROM app.tbplan_move_request
     WHERE idiw37 = $1 AND status = 'pending'`,
    [idiw37],
  )
  return [...new Set(rows.map((r) => r.wkctr.trim()).filter(Boolean))]
}

/**
 * แจ้งช่างหลัง Planner ย้ายวันแผน — in-app (+ Telegram DM ถ้ามี)
 */
export async function notifyTechniciansPlanMoved(
  pool: Pool,
  idiw37: number,
  input: {
    targetDateIso: string
    beforeDateIso: string
    movedByWkctr: string
    context?: 'default' | 'qc_reject'
    rejectNote?: string
  },
): Promise<void> {
  const wo = await loadWoSnapshot(pool, idiw37)
  if (!wo) return

  const recipients = await loadNotifyRecipients(pool, idiw37)
  if (recipients.length === 0) return

  const plannerName = await loadPlannerDisplayName(pool, input.movedByWkctr)
  const linkRoute = buildPlanCalendarLink(idiw37, input.targetDateIso)
  const newDateLabel = isoToDisplayDate(input.targetDateIso)
  const oldDateLabel = isoToDisplayDate(input.beforeDateIso)

  const isQcReject = input.context === 'qc_reject'
  const bodyLines = isQcReject
    ? [
        `WO: ${wo.wkorder}`,
        `ประเภท: ${wo.wktype?.trim() || '—'}`,
        `Planner ไม่อนุมัติงานปิด`,
        input.rejectNote ? `เหตุผล: ${input.rejectNote}` : null,
        `วันแผนเดิม: ${oldDateLabel}`,
        `วันแผนใหม่: ${newDateLabel}`,
        `Planner: ${input.movedByWkctr} — ${plannerName}`,
      ].filter((line): line is string => Boolean(line))
    : [
        `WO: ${wo.wkorder}`,
        `ประเภท: ${wo.wktype?.trim() || '—'}`,
        `วันแผนเดิม: ${oldDateLabel}`,
        `วันแผนใหม่: ${newDateLabel}`,
        `Planner: ${input.movedByWkctr} — ${plannerName}`,
      ]

  for (const wkctr of recipients) {
    await createAppNotification(pool, {
      notifyKind: 'plan_moved_to_tech',
      audience: 'wkctr',
      recipientWkctr: wkctr,
      idiw37,
      title: isQcReject
        ? `ไม่อนุมัติงานปิด — ${wo.wkorder}`
        : `เลื่อนแผนแล้ว — ${wo.wkorder}`,
      body: bodyLines.join('\n'),
      linkRoute,
    })
  }

  if (!isTelegramBotConfigured() || !isTelegramNotifyEnabled()) return

  const text = [
    isQcReject ? '🚫 Planner ไม่อนุมัติงานปิด — เลื่อนแผน' : '📅 Planner เลื่อนวันแผนงานแล้ว',
    ...bodyLines,
    `\nเปิดปฏิทิน: ${getTelegramWebAppUrl()}${linkRoute}`,
  ].join('\n')

  const techR = await pool.query<{ wkctr: string; telegram_chat_id: string | null }>(
    `SELECT wkctr, telegram_chat_id::text
     FROM app.tbworkcenter
     WHERE wkctr = ANY($1::text[]) AND telegram_chat_id IS NOT NULL`,
    [recipients],
  )

  for (const tech of techR.rows) {
    if (!tech.telegram_chat_id) continue
    const result = await sendTelegramMessage(tech.telegram_chat_id, text)
    if (!result.ok) {
      console.error('[telegram/plan-moved-tech]', tech.wkctr, result.error)
    }
  }
}
