import { seededRng } from './cards'
import { createRound, scoreRound } from './engine'
import type { GameConfig, RoundState, Rng } from './types'

/** Challenge #1 is played on this date (Albania time). */
export const DAILY_EPOCH = '2026-10-12'

/** One round, you vs the computer, default rules. Same for every player on a given day. */
export const DAILY_CONFIG: GameConfig = {
  playerCount: 2,
  targetScore: 51,
  rules: { jackXing20: true, allowFinalXing: false },
}

/** The computer deals, so seat 0 (the human) starts. */
const DAILY_DEALER = 1

const TZ = 'Europe/Tirane'

/** YYYY-MM-DD in Albania time. */
export function dateKey(d: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}

const dayNumber = (key: string): number => {
  const [y, m, d] = key.split('-').map(Number)
  return Math.round(Date.UTC(y, m - 1, d) / 86400000)
}

/** 1-based number of the challenge for a date key. */
export const challengeNumber = (key: string): number => dayNumber(key) - dayNumber(DAILY_EPOCH) + 1

/** Hours and minutes left until the next challenge (midnight Albania time). */
export function timeToNext(d: Date = new Date()): { hours: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false })
    .formatToParts(d)
    .reduce<Record<string, string>>((a, p) => ({ ...a, [p.type]: p.value }), {})
  const used = (Number(parts.hour) % 24) * 60 + Number(parts.minute)
  const left = 24 * 60 - used
  return { hours: Math.floor(left / 60), minutes: left % 60 }
}

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export const dailyDealRng = (key: string): Rng => seededRng(hash(`deal:${key}`))
/** Separate stream for the computer's tie-breaks so its play only depends on the moves made. */
export const dailyAiRng = (key: string): Rng => seededRng(hash(`ai:${key}`))

export const createDailyRound = (key: string): RoundState => createRound(DAILY_CONFIG, DAILY_DEALER, dailyDealRng(key))

export interface DailyResult {
  key: string
  you: number
  cpu: number
  xing10: number
  xing20: number
  outcome: 'win' | 'loss' | 'tie'
}

/** Result of a finished daily round, from the human's (seat 0 / team 0) point of view. */
export function dailyResultOf(key: string, round: RoundState): DailyResult {
  const [me, cpu] = scoreRound(round).teams
  return {
    key,
    you: me.total,
    cpu: cpu.total,
    xing10: me.xing10Count,
    xing20: me.xing20Count,
    outcome: me.total > cpu.total ? 'win' : me.total < cpu.total ? 'loss' : 'tie',
  }
}
