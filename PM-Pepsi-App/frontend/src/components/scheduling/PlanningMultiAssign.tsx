/**
 * PlanningMultiAssign — UI "เพิ่ม assignee" หลายคนในคลิกเดียว
 *
 * เทียบ legacy `AddPlan.php`/`M_personel` ที่ต้องคลิกทีละช่าง — เราขยายเป็น
 * batch upsert ผ่าน `POST /api/v1/work-orders/:id/planning/batch`.
 *
 * รับข้อมูล workcenters + รายชื่อที่ถูกจ่ายแล้ว (เพื่อ disable),
 * ภายในจัดการ search/selection/recent-result เอง.
 *
 * Parent ส่ง `onAssign(codes)` (เช่น mutateAsync) และ component จะแสดงสรุป
 * (เพิ่ม/ข้าม/ไม่พบ) หลังจาก resolve.
 */

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMemo, useState } from 'react'

export type PlanningMultiAssignWorkcenter = {
  wkctr: string
  displayName: string
}

export type PlanningMultiAssignResult = {
  assigned: string[]
  skipped: string[]
  notFound: string[]
}

type Props = {
  workcenters: PlanningMultiAssignWorkcenter[]
  /** รหัสที่จ่ายงานไปแล้ว — จะ disabled เป็นสีจาง */
  assignedCodes: string[]
  /** หมายเหตุ — ถ้าไม่ส่ง ใช้ uncontrolled (ค่าใน component นี้) */
  comment?: string
  onCommentChange?: (v: string) => void
  /** เรียก mutation จริงและคืนผลลัพธ์ — parent invalidate queries เอง */
  onAssign: (codes: string[]) => Promise<PlanningMultiAssignResult>
  /** เช่น mutation.isPending */
  submitting?: boolean
  className?: string
}

export function PlanningMultiAssign({
  workcenters,
  assignedCodes,
  comment: commentProp,
  onCommentChange,
  onAssign,
  submitting = false,
  className,
}: Props) {
  const assignedSet = useMemo(() => new Set(assignedCodes.map((c) => c.trim())), [assignedCodes])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [innerComment, setInnerComment] = useState('')
  const [lastResult, setLastResult] = useState<PlanningMultiAssignResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const commentControlled = typeof onCommentChange === 'function'
  const comment = commentControlled ? (commentProp ?? '') : innerComment

  const q = search.trim().toLowerCase()
  const filtered = useMemo(() => {
    if (!q) return workcenters
    return workcenters.filter(
      (w) =>
        w.wkctr.toLowerCase().includes(q) ||
        (w.displayName ?? '').toLowerCase().includes(q),
    )
  }, [workcenters, q])

  const availableInFilter = useMemo(
    () => filtered.filter((w) => !assignedSet.has(w.wkctr)),
    [filtered, assignedSet],
  )

  const allSelectedInView = availableInFilter.length > 0 && availableInFilter.every((w) => selected.has(w.wkctr))

  function toggle(code: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
    setLastResult(null)
    setErrorMsg(null)
  }

  function toggleAllInView() {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allSelectedInView) {
        for (const w of availableInFilter) next.delete(w.wkctr)
      } else {
        for (const w of availableInFilter) next.add(w.wkctr)
      }
      return next
    })
    setLastResult(null)
    setErrorMsg(null)
  }

  function clearSelection() {
    setSelected(new Set())
    setLastResult(null)
    setErrorMsg(null)
  }

  async function handleSubmit() {
    if (submitting || selected.size === 0) return
    setLastResult(null)
    setErrorMsg(null)
    try {
      const codes = Array.from(selected)
      const res = await onAssign(codes)
      setLastResult(res)
      // ล้างเฉพาะคนที่สำเร็จ + คนที่ "ข้าม" (มีอยู่แล้ว) — ส่วน not-found ยังคงไว้ให้เห็นว่าผิดพลาด
      setSelected((prev) => {
        const next = new Set(prev)
        for (const c of res.assigned) next.delete(c)
        for (const c of res.skipped) next.delete(c)
        return next
      })
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    }
  }

  const selectedArr = Array.from(selected)
  const selectedCount = selectedArr.length

  return (
    <div className={`rounded-card border border-indigo-200 bg-indigo-50/40 p-3 ${className ?? ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium text-indigo-900">จ่ายงานหลายคน (Multi-assign)</p>
          <p className="text-xs text-indigo-900/70">
            ติ๊กช่างที่ต้องการ แล้วกด "เพิ่ม Assignee" เพื่อจ่ายงานพร้อมกันหลายคนในคลิกเดียว
          </p>
        </div>
        <span className="rounded-full bg-indigo-600 px-2 py-1 text-xs font-medium text-white tabular-nums">
          {selectedCount} เลือก
        </span>
      </div>

      {!commentControlled ? (
        <div className="mt-3 space-y-1">
          <Label htmlFor="multi-plan-comment">หมายเหตุ (ใช้ร่วมกับทุกคน)</Label>
          <Input
            id="multi-plan-comment"
            value={comment}
            onChange={(e) => setInnerComment(e.target.value)}
            placeholder="pwcomment"
          />
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหา wkctr หรือชื่อ…"
          className="max-w-[260px]"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={toggleAllInView}
          disabled={availableInFilter.length === 0}
        >
          {allSelectedInView ? 'ยกเลิกทั้งหมดในมุมมอง' : 'เลือกทั้งหมดในมุมมอง'}
        </Button>
        {selectedCount > 0 ? (
          <Button type="button" size="sm" variant="ghost" onClick={clearSelection}>
            ล้างการเลือก
          </Button>
        ) : null}
      </div>

      {selectedCount > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedArr.map((c) => {
            const w = workcenters.find((x) => x.wkctr === c)
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggle(c)}
                className="inline-flex items-center gap-1 rounded-full border border-indigo-300 bg-white px-2 py-1 text-xs text-indigo-900 hover:bg-indigo-100"
                title="คลิกเพื่อนำออก"
              >
                <span className="font-mono">{c}</span>
                {w?.displayName && w.displayName !== c ? <span className="text-indigo-900/70">— {w.displayName}</span> : null}
                <span aria-hidden className="text-indigo-700">×</span>
              </button>
            )
          })}
        </div>
      ) : null}

      <div className="mt-3 max-h-64 overflow-auto rounded border border-indigo-200 bg-white">
        {filtered.length === 0 ? (
          <p className="px-3 py-4 text-caption">ไม่มี workcenter ที่ตรงคำค้น</p>
        ) : (
          <ul className="divide-y divide-[var(--app-border)]">
            {filtered.map((w) => {
              const already = assignedSet.has(w.wkctr)
              const checked = selected.has(w.wkctr)
              return (
                <li key={w.wkctr} className="flex items-center justify-between gap-2 px-3 py-2">
                  <label className={`flex flex-1 cursor-pointer items-center gap-2 ${already ? 'cursor-not-allowed opacity-50' : ''}`}>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-indigo-600"
                      checked={checked}
                      disabled={already}
                      onChange={() => toggle(w.wkctr)}
                    />
                    <span className="font-mono text-body-sm text-app">{w.wkctr}</span>
                    {w.displayName && w.displayName !== w.wkctr ? (
                      <span className="text-caption">— {w.displayName}</span>
                    ) : null}
                  </label>
                  {already ? (
                    <span className="rounded bg-emerald-100 px-2 py-1 text-badge font-medium text-emerald-800">
                      จ่ายแล้ว
                    </span>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-app-muted">
          {workcenters.length} workcenters • {assignedSet.size} จ่ายแล้ว •{' '}
          {workcenters.length - assignedSet.size} ว่าง
        </p>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || selectedCount === 0}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {submitting ? 'กำลังจ่ายงาน…' : `เพิ่ม Assignee (${selectedCount})`}
        </Button>
      </div>

      {lastResult ? (
        <div className="mt-3 rounded border border-indigo-200 bg-white p-2 text-xs text-app">
          <p>
            สรุป — เพิ่ม {lastResult.assigned.length} • ข้าม {lastResult.skipped.length} • ไม่พบ{' '}
            {lastResult.notFound.length}
          </p>
          {lastResult.skipped.length > 0 ? (
            <p className="mt-1">ข้าม (จ่ายไปแล้ว): {lastResult.skipped.join(', ')}</p>
          ) : null}
          {lastResult.notFound.length > 0 ? (
            <p className="mt-1 text-red-700">ไม่พบ: {lastResult.notFound.join(', ')}</p>
          ) : null}
        </div>
      ) : null}
      {errorMsg ? (
        <p className="mt-2 text-xs text-red-700">{errorMsg}</p>
      ) : null}
    </div>
  )
}
