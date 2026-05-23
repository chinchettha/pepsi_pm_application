/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ReportExportButton } from './ReportExportButton'

describe('ReportExportButton', () => {
  it('shows Thai CSV label and download icon', () => {
    render(<ReportExportButton format="csv" />)
    expect(screen.getByRole('button', { name: /ดาวน์โหลด CSV/i })).toBeInTheDocument()
  })

  it('shows loading label when busy', () => {
    render(<ReportExportButton format="xlsx" loading loadingLabel="กำลังส่งออก…" />)
    expect(screen.getByRole('button', { name: /กำลังส่งออก/i })).toBeDisabled()
  })
})
