import { describe, expect, it } from 'vitest'
import {
  formatPlannerCommentText,
  isPlannerCommentTimestamp,
  resolvePlannerCommentForWkctr,
  resolveSharedPlannerComment,
} from './planner-comment'

describe('planner-comment', () => {
  it('detects legacy timestamp pwcomment', () => {
    expect(isPlannerCommentTimestamp('1717200000')).toBe(true)
    expect(isPlannerCommentTimestamp('Check bearing')).toBe(false)
  })

  it('hides timestamp-only pwcomment', () => {
    expect(formatPlannerCommentText('1717200000')).toBe('')
    expect(formatPlannerCommentText(' ตรวจเพิ่มที่สายพาน ')).toBe('ตรวจเพิ่มที่สายพาน')
  })

  it('resolves comment for technician assignment', () => {
    expect(
      resolvePlannerCommentForWkctr(
        [
          {
            kind: 'person',
            code: 'WC001',
            displayName: 'Tech One',
            pwcomment: 'ทำก่อนกะเช้า',
            pwteam: 'P',
          },
          {
            kind: 'person',
            code: 'WC002',
            displayName: 'Tech Two',
            pwcomment: 'other',
            pwteam: 'P',
          },
        ],
        'WC001',
      ),
    ).toBe('ทำก่อนกะเช้า')
  })

  it('resolves shared comment from first person assignee', () => {
    expect(
      resolveSharedPlannerComment([
        {
          kind: 'person',
          code: 'WC001',
          displayName: 'Tech One',
          pwcomment: '1717200000',
          pwteam: 'P',
        },
        {
          kind: 'person',
          code: 'WC002',
          displayName: 'Tech Two',
          pwcomment: 'shared note',
          pwteam: 'P',
        },
      ]),
    ).toBe('shared note')
  })
})
