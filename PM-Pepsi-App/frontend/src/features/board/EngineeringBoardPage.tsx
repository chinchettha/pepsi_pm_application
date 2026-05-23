/**
 * Engineering Board — มอนิเตอร์กลางแผนก (ประชุมครั้งที่ 1 §2)
 * เปิดเต็มจอ: `/board` — ไม่บังคับ login (kiosk token หรือ session)
 */
import { PepsiStripe } from '@/components/brand/PepsiStripe'
import { BoardKpiZone } from '@/features/board/BoardKpiZone'
import type { SparklineTone } from '@/components/charts/Sparkline'
import { BoardActivityFeed } from '@/features/board/BoardActivityFeed'
import { BoardCarouselShell } from '@/features/board/BoardCarouselShell'
import { BoardPeriodSelector } from '@/features/board/BoardPeriodSelector'
import { BoardThemeToggle } from '@/features/board/BoardThemeToggle'
import { BoardZoneB } from '@/features/board/BoardZoneB'
import { useBoardCarousel } from '@/features/board/use-board-carousel'
import { useBoardPeriod } from '@/features/board/use-board-period'
import { useBoardTheme } from '@/features/board/use-board-theme'
import { isLoggedIn } from '@/features/auth/login-api'
import {
  fetchDashboardSummary,
  fetchKpi,
  fetchSummaryWeekly,
} from '@/lib/api-public'
import { fetchBoardActivity } from '@/lib/board-activity-api'
import {
  parseBoardCarouselFromSearchParams,
  readBoardCarouselEnabled,
  writeBoardCarouselEnabled,
} from '@/lib/board-carousel'
import { applyBoardKioskFromSearchParams, getBoardKioskToken } from '@/lib/board-kiosk'
import { useBoardKioskViewport } from '@/lib/use-board-kiosk-viewport'
import { fetchBoardKioskStatus } from '@/lib/board-kiosk-api'
import { AnnouncementBannerRow } from '@/components/layout/AnnouncementBanner'
import {
  dismissAnnouncement,
  readDismissedAnnouncements,
} from '@/lib/announcement-dismiss'
import { fetchActiveAnnouncements } from '@/lib/announcements-api'
import { usePublicSettings } from '@/providers/SettingsProvider'
import { usePermission } from '@/lib/use-permission'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import './engineering-board.css'
import './engineering-board-theme.css'
import './engineering-board-display.css'

const REFRESH_MS = 60_000

function formatClock(now: Date): string {
  return now.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatDate(now: Date): string {
  return now.toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function deltaClass(n: number): string {
  if (n > 0) return 'delta-up'
  if (n < 0) return 'delta-down'
  return ''
}

export function EngineeringBoardPage() {
  const [searchParams] = useSearchParams()
  const [kioskReady, setKioskReady] = useState(false)
  const loggedIn = isLoggedIn()
  const canReadSession = usePermission('dashboard.read')
  const { settings } = usePublicSettings()
  const appName = settings?.appName?.trim() || 'PM Pepsi'
  const [now, setNow] = useState(() => new Date())
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [dismissedAnn, setDismissedAnn] = useState(() => readDismissedAnnouncements())
  const { isFullscreen, toggleFullscreen } = useBoardKioskViewport()
  const { theme, setTheme, themeClass, kioskDark } = useBoardTheme()
  const { period, range, rangeLabel, setPeriod } = useBoardPeriod()
  const [showRcaUtil, setShowRcaUtil] = useState(false)
  const [carouselEnabled, setCarouselEnabled] = useState(() => readBoardCarouselEnabled())
  const carousel = useBoardCarousel({ enabled: carouselEnabled })
  const kioskStatusQ = useQuery({
    queryKey: ['board', 'kiosk-status'],
    queryFn: fetchBoardKioskStatus,
    staleTime: 60_000,
  })

  useEffect(() => {
    applyBoardKioskFromSearchParams(searchParams)
    const fromUrl = parseBoardCarouselFromSearchParams(searchParams)
    if (fromUrl != null) {
      setCarouselEnabled(fromUrl)
      writeBoardCarouselEnabled(fromUrl)
    }
    setKioskReady(true)
  }, [searchParams])

  const toggleCarousel = () => {
    setCarouselEnabled((prev) => {
      const next = !prev
      writeBoardCarouselEnabled(next)
      return next
    })
  }

  const canFetchData = useMemo(() => {
    if (!kioskReady) return false
    if (loggedIn && canReadSession) return true
    const status = kioskStatusQ.data
    if (!status) return false
    if (!status.enabled) return true
    if (!status.tokenRequired) return true
    return Boolean(getBoardKioskToken())
  }, [kioskReady, loggedIn, canReadSession, kioskStatusQ.data])

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const dashQ = useQuery({
    queryKey: ['dashboard', 'board'],
    queryFn: fetchDashboardSummary,
    enabled: canFetchData,
    refetchInterval: REFRESH_MS,
  })

  const kpiQ = useQuery({
    queryKey: ['reports-kpi', 'board', 8],
    queryFn: () => fetchKpi({ weeksBack: 8 }),
    enabled: canFetchData,
    refetchInterval: REFRESH_MS,
  })

  const weeklyQ = useQuery({
    queryKey: ['summary-weekly', 'board', period, range.from, range.to],
    queryFn: () => fetchSummaryWeekly({ from: range.from, to: range.to }),
    enabled: canFetchData,
    refetchInterval: REFRESH_MS * 2,
  })

  const activityQ = useQuery({
    queryKey: ['board', 'activity', period],
    queryFn: () => fetchBoardActivity({ period, limit: 12 }),
    enabled: canFetchData,
    refetchInterval: REFRESH_MS,
  })

  const annQ = useQuery({
    queryKey: ['announcements', 'active', 'board'],
    queryFn: fetchActiveAnnouncements,
    enabled: canFetchData,
    refetchInterval: REFRESH_MS * 2,
  })

  useEffect(() => {
    if (dashQ.dataUpdatedAt) setLastRefresh(new Date(dashQ.dataUpdatedAt))
  }, [dashQ.dataUpdatedAt])

  const trends = dashQ.data?.trends
  const kpis =
    dashQ.data && trends
      ? [
          {
            label: 'ใบงานเปิด',
            value: dashQ.data.openOrders.toLocaleString('th-TH'),
            hint: 'CRTD / REL',
            trend: trends.openDaily,
            tone: 'pepsi-blue' as SparklineTone,
          },
          {
            label: 'ปิดเดือนนี้',
            value: dashQ.data.closedThisMonth.toLocaleString('th-TH'),
            hint: 'เดือนปฏิทินปัจจุบัน',
            trend: trends.closedDaily,
            tone: 'pepsi-red' as SparklineTone,
          },
          {
            label: 'รอจ่ายงาน',
            value: dashQ.data.pendingPersonnel.toLocaleString('th-TH'),
            hint: 'ยังไม่มีแผน',
            trend: trends.pendingDaily,
            tone: 'pepsi-orange' as SparklineTone,
          },
          {
            label: 'นำเข้า IW37N',
            value: dashQ.data.iw37nLastImport
              ? new Date(dashQ.data.iw37nLastImport).toLocaleString('th-TH', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })
              : '—',
            hint: 'ล่าสุดจาก batch',
            trend: trends.importDaily,
            tone: 'pepsi-blue' as SparklineTone,
            compactValue: true,
          },
        ]
      : []

  const weekRows = kpiQ.data?.weekToWeek ?? []
  const topAnn = (annQ.data?.items ?? []).find((a) => !dismissedAnn.has(a.id))

  const boardRootClass = [
    'engineering-board',
    'engineering-board--kiosk',
    themeClass,
    carouselEnabled ? 'engineering-board--carousel' : '',
  ]
    .filter(Boolean)
    .join(' ')

  if (!kioskReady || kioskStatusQ.isLoading) {
    return (
      <div className={`${boardRootClass} flex items-center justify-center p-8`}>
        <p className="text-lg opacity-80">กำลังเตรียม Engineering Board…</p>
      </div>
    )
  }

  if (!canFetchData) {
    const needToken = kioskStatusQ.data?.tokenRequired
    return (
      <div className={`${boardRootClass} engineering-board--gate flex flex-col items-center justify-center gap-4 p-8 text-center`}>
        <h1 className="text-2xl font-semibold">Engineering Board (Kiosk)</h1>
        {needToken ? (
          <p className="max-w-lg text-base opacity-80">
            ต้องใช้ลิงก์ที่มี <code className="rounded bg-white/10 px-1">?token=…</code> จาก Admin →
            ตั้งค่าระบบ → Engineering Board Kiosk
          </p>
        ) : (
          <p className="max-w-lg text-base opacity-80">
            โหมด kiosk ปิดอยู่ — ติดต่อผู้ดูแลระบบ หรือ{' '}
            <Link to="/login" className="engineering-board__footer-link underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        )}
        <BoardThemeToggle value={theme} onChange={setTheme} />
        <Link to="/login" className="engineering-board__footer-link underline">
          เข้าสู่ระบบแอปเต็มรูปแบบ
        </Link>
      </div>
    )
  }

  return (
    <div className={boardRootClass}>
      <div className="engineering-board__ambient" aria-hidden>
        <span className="engineering-board__orb engineering-board__orb--1" />
        <span className="engineering-board__orb engineering-board__orb--2" />
        <span className="engineering-board__orb engineering-board__orb--3" />
      </div>
      <div className="engineering-board__viewport">
        <div className="engineering-board__main">
          <header className="engineering-board__header">
            <div className="engineering-board__header-brand">
              <p className="engineering-board__eyebrow">
                Engineering Board
                <span className="engineering-board__eyebrow-dot" aria-hidden>
                  ·
                </span>
                {loggedIn ? 'Signed in' : 'Kiosk'}
              </p>
              <h1 className="engineering-board__title">{appName}</h1>
              <p className="engineering-board__meta">{formatDate(now)}</p>
            </div>
            <div className="engineering-board__header-tools">
              <BoardThemeToggle value={theme} onChange={setTheme} />
              <BoardPeriodSelector value={period} onChange={setPeriod} />
              <div className="engineering-board__clock-block">
                <div className="engineering-board__clock">{formatClock(now)}</div>
                <p className="engineering-board__refresh-meta">
                  {lastRefresh
                    ? `อัปเดต ${lastRefresh.toLocaleTimeString('th-TH')}`
                    : 'กำลังโหลด…'}
                  {dashQ.isFetching || weeklyQ.isFetching || activityQ.isFetching
                    ? ' · รีเฟรช'
                    : ''}
                </p>
              </div>
            </div>
          </header>

          <div className="engineering-board__body">
            {topAnn ? (
              <AnnouncementBannerRow
                item={topAnn}
                onDismiss={(id) => setDismissedAnn(dismissAnnouncement(id))}
                className="engineering-board__announce mx-0 rounded-none border-x-0"
              />
            ) : null}

            {dashQ.isError ? (
              <p className="engineering-board__error">{(dashQ.error as Error).message}</p>
            ) : (
              <BoardCarouselShell
                enabled={carouselEnabled}
                slide={carousel.slide}
                paused={carousel.paused}
                onPauseChange={carousel.setPaused}
                onGoTo={carousel.goTo}
                zoneA={
                  <BoardKpiZone
                    items={kpis}
                    loading={dashQ.isLoading && !dashQ.data}
                    carousel={carouselEnabled}
                  />
                }
                zoneB={
                  <BoardZoneB
                    rangeLabel={rangeLabel}
                    showRca={showRcaUtil}
                    onShowRcaChange={setShowRcaUtil}
                    weeklyRows={weeklyQ.data?.rows}
                    weeklyLoading={weeklyQ.isLoading}
                    weeklyError={weeklyQ.isError ? (weeklyQ.error as Error) : null}
                    weekRows={weekRows}
                    deltaClass={deltaClass}
                    carousel={carouselEnabled}
                    kioskDark={kioskDark}
                  />
                }
                zoneC={
                  <BoardActivityFeed
                    items={activityQ.data?.items ?? []}
                    loading={activityQ.isLoading}
                    error={activityQ.isError ? (activityQ.error as Error) : null}
                    carousel={carouselEnabled}
                  />
                }
              />
            )}
          </div>

          <footer className="engineering-board__footer">
            <span className="engineering-board__live">
              <span className="engineering-board__live-dot" />
              Live · รีเฟรชทุก {REFRESH_MS / 1000} วินาที
            </span>
            <span>
              {loggedIn ? (
                <Link to="/" className="engineering-board__footer-link">
                  กลับแอป
                </Link>
              ) : (
                <Link to="/login" className="engineering-board__footer-link">
                  เข้าสู่ระบบ
                </Link>
              )}
              {' · '}
              <button
                type="button"
                className="engineering-board__footer-link border-0 bg-transparent p-0 cursor-pointer"
                onClick={toggleCarousel}
              >
                {carouselEnabled ? 'แสดงทั้งหมด' : 'สไลด์ A→B→C'}
              </button>
              {' · '}
              <button
                type="button"
                className="engineering-board__footer-link border-0 bg-transparent p-0 cursor-pointer"
                onClick={() => void toggleFullscreen()}
              >
                {isFullscreen ? 'ออกจากเต็มจอ' : 'เต็มจอ'}
              </button>
              <span className="opacity-60"> (F11)</span>
            </span>
          </footer>
        </div>

        <PepsiStripe className="engineering-board__stripe h-1.5" />
      </div>
    </div>
  )
}
