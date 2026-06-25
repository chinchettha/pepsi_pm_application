import type { Pool } from 'pg'
import { getTelegramWebAppUrl } from '../lib/telegram-web-url.js'
import {
  isTelegramBotConfigured,
  isTelegramNotifyEnabled,
  sendTelegramMessage,
} from '../lib/telegram-bot.js'
import { createAppNotification } from './app-notifications.js'
import type { PlanMoveRequestItem } from './plan-move-request.js'
import {
  buildNotifyContextForWo,
  resolveNotifyGroupChatIds,
} from './telegram-notify-groups.js'

type WoSnapshot = {
  wkorder: string
  wktype: string | null
  operationshorttext: string | null
  bscstart: string | number | null
}

function unixToDisplayDate(sec: string | number | null): string {
  if (sec == null || sec === '') return '—'
  const n = Number(sec)
  if (!Number.isFinite(n) || n <= 0) return '—'
  return new Date(n * 1000).toLocaleDateString('th-TH')
}

async function loadWoSnapshot(pool: Pool, idiw37: number): Promise<WoSnapshot | null> {
  const { rows } = await pool.query<WoSnapshot>(
    `SELECT wkorder, wktype, operationshorttext, bscstart
     FROM app.tbiw37n WHERE idiw37 = $1`,
    [idiw37],
  )
  return rows[0] ?? null
}

async function loadTechDisplayName(pool: Pool, wkctr: string): Promise<string> {
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

/**
 * แจ้ง Planner หลังช่างขอเลื่อนแผน — Telegram + in-app
 */
export async function notifyPlannerMoveRequest(
  pool: Pool,
  request: PlanMoveRequestItem,
): Promise<void> {
  const wo = await loadWoSnapshot(pool, request.idiw37)
  if (!wo) return

  const displayName = await loadTechDisplayName(pool, request.requesterWkctr)
  const planDate = unixToDisplayDate(wo.bscstart)
  const requestedAt = new Date(request.createdAt).toLocaleString('th-TH')
  const linkRoute = `/iw37n?${new URLSearchParams({ idiw37: String(request.idiw37), focus: 'import' }).toString()}`

  const bodyLines = [
    `WO: ${wo.wkorder}`,
    `ประเภท: ${wo.wktype?.trim() || '—'}`,
    `วันที่แผนเดิม: ${planDate}`,
    `ช่าง: ${request.requesterWkctr} — ${displayName}`,
    `เหตุผล: ${request.comment}`,
    request.preferredDate
      ? `วันที่ต้องการเลื่อนไป: ${request.preferredDate}`
      : 'วันที่ต้องการเลื่อนไป: (ไม่ระบุ)',
    `เวลาส่งคำขอ: ${requestedAt}`,
  ]

  await createAppNotification(pool, {
    notifyKind: 'move_request_to_planner',
    audience: 'planner',
    idiw37: request.idiw37,
    title: `ขอเลื่อนแผน — ${wo.wkorder}`,
    body: bodyLines.join('\n'),
    linkRoute,
  })

  if (!isTelegramBotConfigured() || !isTelegramNotifyEnabled()) return

  const assignR = await pool.query<{ wkctr: string }>(
    `SELECT wkctr FROM app.tbplangingwork WHERE idiw37 = $1`,
    [request.idiw37],
  )
  const ctx = await buildNotifyContextForWo(
    pool,
    request.idiw37,
    assignR.rows.map((r) => r.wkctr),
  )

  const text = [
    '📅 ช่างขอเลื่อนแผนงาน',
    ...bodyLines,
    '\nกรุณา Planner ย้ายวันแผนในระบบ',
    `เปิด: ${getTelegramWebAppUrl()}${linkRoute}`,
  ].join('\n')

  const chatIds = await resolveNotifyGroupChatIds(pool, 'move_request_to_planner', ctx)
  for (const chatId of chatIds) {
    const result = await sendTelegramMessage(chatId, text)
    if (!result.ok) {
      console.error('[telegram/move-request-planner]', chatId, result.error)
    }
  }
}
