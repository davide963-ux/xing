import { describe, expect, it } from 'vitest'
import { delta, rangeLabel } from './reportFormat'

describe('weekly report helpers', () => {
  it('formats a week inside one month', () => {
    expect(rangeLabel('2026-10-12', '2026-10-18')).toBe('12 – 18 Tetor 2026')
  })
  it('formats a week that crosses months and years', () => {
    expect(rangeLabel('2026-09-28', '2026-10-04')).toBe('28 Shtator – 4 Tetor 2026')
    expect(rangeLabel('2026-12-28', '2027-01-03')).toBe('28 Dhjetor 2026 – 3 Janar 2027')
  })
  it('computes the change versus last week', () => {
    expect(delta(125, 100)).toEqual({ pct: 25, dir: 'up' })
    expect(delta(90, 100)).toEqual({ pct: -10, dir: 'down' })
    expect(delta(100, 100)).toEqual({ pct: 0, dir: 'flat' })
    expect(delta(50, 0)).toBeNull()
  })
})
