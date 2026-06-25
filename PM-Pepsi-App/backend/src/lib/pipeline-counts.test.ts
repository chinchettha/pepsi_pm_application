import { describe, expect, it } from 'vitest'
import { aggregatePipelineCounts, EMPTY_PIPELINE_COUNTS } from './pipeline-counts.js'

describe('aggregatePipelineCounts', () => {
  it('returns empty counts for no items', () => {
    expect(aggregatePipelineCounts([])).toEqual(EMPTY_PIPELINE_COUNTS)
  })

  it('counts pipeline statuses', () => {
    const counts = aggregatePipelineCounts([
      { pipelineStatus: 'partial' },
      { pipelineStatus: 'partial' },
      { pipelineStatus: 'assigned' },
      { pipelineStatus: 'closed' },
    ])
    expect(counts.partial).toBe(2)
    expect(counts.assigned).toBe(1)
    expect(counts.closed).toBe(1)
    expect(counts.unassigned).toBe(0)
  })
})
