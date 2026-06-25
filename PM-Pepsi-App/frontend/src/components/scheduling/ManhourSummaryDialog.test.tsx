/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest'
import '@/i18n'
import { ManhourSummaryDialog } from '@/components/scheduling/ManhourSummaryDialog'
import { postBacklogManhourSummary } from '@/lib/api-public'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/api-public', () => ({
  postBacklogManhourSummary: vi.fn(),
}))

vi.mock('@/lib/use-permission', () => ({
  usePermission: (code: string) => code === 'planning.assign',
}))

function renderDialog(props: {
  open?: boolean
  fromDate?: string
  toDate?: string
  onAssign?: (target: { idiw37: number; wkorder: string }) => void
} = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <ManhourSummaryDialog
        open={props.open ?? true}
        onOpenChange={vi.fn()}
        fromDate={props.fromDate ?? '2026-05-01'}
        toDate={props.toDate ?? '2026-05-01'}
        onAssign={props.onAssign}
      />
    </QueryClientProvider>,
  )
}

describe('ManhourSummaryDialog', () => {
  it('shows Man Hours Date header and plan/action summary from API', async () => {
    vi.mocked(postBacklogManhourSummary).mockResolvedValue({
      fromDate: '2026-05-01',
      toDate: '2026-05-01',
      plannedMinutes: 480,
      plannedHours: 8,
      actualMinutes: 60,
      actualHours: 1,
      totalOrders: 1,
      completionCount: 0,
      completionPercent: 0,
      byWkzb: [{ code: 'ZB01', label: 'ZB01', count: 1 }],
      rows: [
        {
          idiw37: 42,
          wkorder: '1001',
          wktype: 'ZB01',
          syst: 'REL',
          work: 8,
          actwork: 1,
          unit: 'H',
          operationshorttext: 'Test WO',
          planDate: '2026-05-01',
          dispatchStatus: 'unassigned',
          ackStatus: 'none',
          assigneeCount: 0,
          ackCount: 0,
        },
      ],
    })

    renderDialog()

    expect(await screen.findByText(/Man Hours/)).toBeInTheDocument()
    expect(await screen.findByText(/Man Hour Plan/)).toBeInTheDocument()
    expect(screen.getByText(/480/)).toBeInTheDocument()
    expect(screen.getByText('1001 / ZB01')).toBeInTheDocument()
    expect(postBacklogManhourSummary).toHaveBeenCalledWith({
      fromDate: '2026-05-01',
      toDate: '2026-05-01',
    })
  })

  it('shows empty state when no work orders on selected day', async () => {
    vi.mocked(postBacklogManhourSummary).mockResolvedValue({
      fromDate: '2026-05-01',
      toDate: '2026-05-01',
      plannedMinutes: 0,
      plannedHours: 0,
      actualMinutes: 0,
      actualHours: 0,
      totalOrders: 0,
      completionCount: 0,
      completionPercent: 0,
      byWkzb: [],
      rows: [],
    })

    renderDialog()

    expect(
      await screen.findByText(/No work orders for the selected date/),
    ).toBeInTheDocument()
  })

  it('does not fetch when dialog is closed', async () => {
    vi.mocked(postBacklogManhourSummary).mockClear()
    renderDialog({ open: false })
    await waitFor(() => expect(postBacklogManhourSummary).not.toHaveBeenCalled())
  })

  it('shows unassigned when API returns dispatchStatus unassigned', async () => {
    vi.mocked(postBacklogManhourSummary).mockResolvedValue({
      fromDate: '2026-06-02',
      toDate: '2026-06-02',
      plannedMinutes: 30,
      plannedHours: 0.5,
      actualMinutes: 0,
      actualHours: 0,
      totalOrders: 1,
      completionCount: 0,
      completionPercent: 0,
      byWkzb: [],
      rows: [
        {
          idiw37: 1300,
          wkorder: '4001568407',
          wktype: 'ZB02',
          syst: 'CRTD',
          work: 30,
          actwork: 0,
          unit: 'MIN',
          planDate: '2026-06-02',
          dispatchStatus: 'unassigned',
          ackStatus: 'none',
          assigneeCount: 0,
          ackCount: 0,
        },
      ],
    })

    renderDialog({ fromDate: '2026-06-02', toDate: '2026-06-02', onAssign: vi.fn() })

    expect(await screen.findByText('Not assigned')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Assign/i })).toBeInTheDocument()
    expect(screen.queryByText('Awaiting ack')).not.toBeInTheDocument()
  })

  it('toggles expanded layout when expand button is clicked', async () => {
    vi.mocked(postBacklogManhourSummary).mockResolvedValue({
      fromDate: '2026-06-02',
      toDate: '2026-06-02',
      plannedMinutes: 30,
      plannedHours: 0.5,
      actualMinutes: 0,
      actualHours: 0,
      totalOrders: 1,
      completionCount: 0,
      completionPercent: 0,
      byWkzb: [],
      rows: [
        {
          idiw37: 1300,
          wkorder: '4001568407',
          wktype: 'ZB02',
          syst: 'CRTD',
          work: 30,
          actwork: 0,
          unit: 'MIN',
          planDate: '2026-06-02',
          dispatchStatus: 'unassigned',
          ackStatus: 'none',
          assigneeCount: 0,
          ackCount: 0,
        },
      ],
    })

    renderDialog({ fromDate: '2026-06-02', toDate: '2026-06-02', onAssign: vi.fn() })

    const expandButton = await screen.findByRole('button', { name: /Expand dialog/i })
    fireEvent.click(expandButton)
    expect(screen.getByRole('button', { name: /Collapse dialog/i })).toBeInTheDocument()
  })
})
