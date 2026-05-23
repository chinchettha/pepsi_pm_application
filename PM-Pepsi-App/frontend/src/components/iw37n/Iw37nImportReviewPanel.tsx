import type { Iw37nImportPreviewResponse, Iw37nImportSummary } from '@/api/schemas'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatIw37nDuplicateMessage } from '@/lib/iw37n-import-messages'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

export type Iw37nImportRow = Iw37nImportPreviewResponse['rows'][number]

type RowFilter = 'all' | 'error' | 'skipped' | 'ok'

function actionBadgeClass(action: Iw37nImportRow['action']): string {
  if (action === 'error') return 'border-transparent bg-red-600 text-white hover:bg-red-700'
  if (action === 'updated') return 'border-transparent bg-sky-700 text-white hover:bg-sky-800'
  if (action === 'inserted') return 'border-transparent bg-emerald-700 text-white hover:bg-emerald-800'
  return ''
}

type Iw37nImportReviewPanelProps = {
  summary: Iw37nImportSummary
  rows: Iw37nImportRow[]
  onCommit: () => void
  onCancel: () => void
  committing?: boolean
}

export function Iw37nImportReviewPanel({
  summary,
  rows,
  onCommit,
  onCancel,
  committing = false,
}: Iw37nImportReviewPanelProps) {
  const [filter, setFilter] = useState<RowFilter>('all')

  const filteredRows = useMemo(() => {
    if (filter === 'all') return rows
    if (filter === 'error') return rows.filter((r) => r.action === 'error')
    if (filter === 'skipped') return rows.filter((r) => r.action === 'skipped')
    return rows.filter((r) => r.action === 'inserted' || r.action === 'updated')
  }, [rows, filter])

  const canCommit = summary.inserted + summary.updated > 0

  return (
    <div className="mt-4 space-y-4 rounded-card border border-amber-300/80 bg-amber-50/50 p-4">
      <div>
        <h4 className="text-body-sm font-semibold text-amber-950">สรุปก่อนนำเข้า (ตรวจสอบด้วยมือ)</h4>
        <p className="mt-1 text-xs text-amber-900/80">
          {summary.fileName} · {summary.totalRows} แถว · SHA {summary.sha256.slice(0, 12)}… · สถานะที่คาดหวัง{' '}
          <Badge variant="secondary" className="ml-1 text-xs">
            {summary.wouldStatus}
          </Badge>
        </p>
      </div>

      {summary.isDuplicate ? (
        <div
          role="alert"
          className="rounded-button border border-purple-400 bg-purple-50 px-3 py-2 text-body-sm text-purple-950"
        >
          <p className="font-medium">{formatIw37nDuplicateMessage(summary.duplicateOfBatchId)}</p>
          <p className="mt-1 text-xs text-purple-800/90">
            เทียบ PHP: นำเข้าไฟล์เดิมซ้ำได้ — ระบบจะ upsert ตาม wkorder+OpAc เหมือนเดิม (มีบันทึก batch ซ้ำไว้ตรวจสอบ)
          </p>
          {summary.duplicateOfBatchId ? (
            <Link
              to="/iw37n"
              className="mt-2 inline-block text-xs font-medium text-purple-900 underline hover:text-purple-700"
            >
              เปิดหน้า IW37N → batch #{summary.duplicateOfBatchId}
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="เพิ่ม" value={summary.inserted} tone="emerald" />
        <Stat label="อัปเดต" value={summary.updated} tone="sky" />
        <Stat label="ข้าม" value={summary.skipped} tone="zinc" />
        <Stat label="ผิดพลาด" value={summary.errors} tone="red" />
        <Stat label="รวม" value={summary.totalRows} tone="zinc" />
      </div>

      {summary.errorGroups.length > 0 ? (
        <div className="rounded-button border border-red-200 bg-red-50/80 px-3 py-2">
          <p className="text-xs font-medium text-red-900">สรุป error ({summary.errors} แถว)</p>
          <ul className="mt-1 max-h-32 space-y-1 overflow-y-auto text-xs text-red-800">
            {summary.errorGroups.map((g) => (
              <li key={g.message}>
                <span className="font-mono tabular-nums">{g.count}×</span> {g.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['all', `ทั้งหมด (${rows.length})`],
            ['error', `ผิดพลาด (${summary.errors})`],
            ['skipped', `ข้าม (${summary.skipped})`],
            ['ok', `สำเร็จ (${summary.inserted + summary.updated})`],
          ] as const
        ).map(([key, label]) => (
          <Button
            key={key}
            type="button"
            size="sm"
            variant={filter === key ? 'default' : 'outline'}
            onClick={() => setFilter(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="app-table-shell max-h-[min(50vh,420px)] overflow-auto">
        <Table embedded stickyHeader zebra>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14 text-center">ลำดับ</TableHead>
              <TableHead>ผลลัพธ์</TableHead>
              <TableHead>ใบงาน/Op</TableHead>
              <TableHead>ประเภท</TableHead>
              <TableHead>ข้อความ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-caption">
                  ไม่มีแถวในตัวกรองนี้
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((r) => (
                <TableRow key={r.rowNo}>
                  <TableCell className="text-center tabular-nums">{r.rowNo}</TableCell>
                  <TableCell>
                    <Badge variant={r.action === 'skipped' ? 'secondary' : 'default'} className={actionBadgeClass(r.action)}>
                      {r.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {r.wkorder}/{r.opac}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{r.wktype}</TableCell>
                  <TableCell className="max-w-[320px] truncate text-xs" title={r.message}>
                    {r.message}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-amber-200/80 pt-3">
        <Button type="button" disabled={!canCommit || committing} onClick={onCommit}>
          {committing ? 'กำลัง commit…' : 'ยืนยันนำเข้า (commit)'}
        </Button>
        <Button type="button" variant="outline" disabled={committing} onClick={onCancel}>
          ยกเลิก / เลือกไฟล์ใหม่
        </Button>
        {summary.isDuplicate ? (
          <p className="self-center text-xs font-medium text-purple-900">
            ไม่สามารถ commit ไฟล์ซ้ำ — เลือกไฟล์อื่น
          </p>
        ) : !canCommit ? (
          <p className="self-center text-xs text-amber-800">ไม่มีแถว insert/update — แก้ไฟล์ก่อน commit</p>
        ) : null}
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'emerald' | 'sky' | 'red' | 'zinc'
}) {
  const bg =
    tone === 'emerald'
      ? 'bg-emerald-50 text-emerald-900'
      : tone === 'sky'
        ? 'bg-sky-50 text-sky-900'
        : tone === 'red'
          ? 'bg-red-50 text-red-900'
          : 'bg-app-muted text-app'
  return (
    <div className={`rounded-button px-3 py-2 ${bg}`}>
      <div className="text-xs opacity-80">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  )
}
