import { describe, expect, it } from 'vitest'
import { chooseCard, getPublicView } from './ai'
import {
  DAILY_EPOCH,
  challengeNumber,
  createDailyRound,
  dailyAiRng,
  dailyResultOf,
  dateKey,
  timeToNext,
} from './daily'
import { allCardIds, playCard } from './engine'

describe('daily challenge', () => {
  it('gives the same deal for the same day and a different deal on another day', () => {
    const a = createDailyRound('2026-10-12')
    const b = createDailyRound('2026-10-12')
    const c = createDailyRound('2026-10-13')
    expect(b).toEqual(a)
    expect(c.hands[0]).not.toEqual(a.hands[0])
  })

  it('is a legal 2-player deal where the human (seat 0) starts', () => {
    const r = createDailyRound('2026-11-02')
    expect(r.config.playerCount).toBe(2)
    expect(r.current).toBe(0)
    expect(new Set(allCardIds(r)).size).toBe(52)
  })

  it('numbers challenges from the epoch date', () => {
    expect(challengeNumber(DAILY_EPOCH)).toBe(1)
    expect(challengeNumber('2026-10-13')).toBe(2)
    expect(challengeNumber('2026-11-12')).toBe(32)
  })

  it('formats the Albanian-time date key and the time to the next challenge', () => {
    expect(dateKey(new Date('2026-10-12T12:00:00Z'))).toBe('2026-10-12')
    // 22:30 UTC on 11 Oct is already 12 Oct in Albania (UTC+2 in October)
    expect(dateKey(new Date('2026-10-11T22:30:00Z'))).toBe('2026-10-12')
    const t = timeToNext(new Date('2026-10-12T20:30:00Z')) // 22:30 local
    expect(t).toEqual({ hours: 1, minutes: 30 })
  })

  it('replays identically when the same moves are made (computer included)', () => {
    const play = () => {
      let s = createDailyRound('2026-10-20')
      const ai = dailyAiRng('2026-10-20')
      while (s.phase === 'playing') {
        const seat = s.current
        // the "human" always plays their first card; the computer uses its seeded stream
        const card = seat === 0 ? s.hands[0][0] : chooseCard(getPublicView(s, seat), ai, 'normal')
        s = playCard(s, seat, card).state
      }
      return dailyResultOf('2026-10-20', s)
    }
    const r1 = play()
    expect(play()).toEqual(r1)
    expect(r1.you + r1.cpu).toBeGreaterThanOrEqual(13)
  })
})
