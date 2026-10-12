import { supabase } from '../auth/supabase'
import type { RoundScore } from '../engine/types'

export interface PlayerStats {
  user_id: string
  username: string
  games_played: number
  wins: number
  losses: number
  ties: number
  rounds_played: number
  xings: number
  jack_xings: number
  current_streak: number
  best_streak: number
  online_games: number
  online_wins: number
  rating: number
  daily_played: number
  daily_streak: number
  best_daily_streak: number
  last_daily: string | null
  achievements: string[]
}

export interface BoardRow {
  rank: number
  username: string
  rating: number
  wins: number
  games: number
  is_me: boolean
}

export async function fetchMyStats(): Promise<PlayerStats | null> {
  const { data, error } = await supabase.from('player_stats').select('*').maybeSingle()
  if (error) throw error
  return data as PlayerStats | null
}

export async function fetchLeaderboard(period: 'week' | 'all'): Promise<BoardRow[]> {
  const { data, error } = await supabase.rpc('get_leaderboard', { p_period: period })
  if (error) throw error
  return (data ?? []) as BoardRow[]
}

// ---------------------------------------------------------------- reporting results

type Job =
  | {
      fn: 'record_solo'
      args: { p_mode: 'computer' | 'daily'; p_outcome: 'win' | 'loss' | 'tie'; p_rounds: number; p_xing10: number; p_xing20: number; p_daily_date: string | null }
    }
  | {
      fn: 'report_online'
      args: { p_match_id: string; p_players: number; p_my_team: number; p_score0: number; p_score1: number; p_rounds: number; p_xing10: number; p_xing20: number }
    }

const OUTBOX = 'xing.outbox.v1'
const PERMANENT = ['bad_input', 'bad_date'] // the server will never accept these

const readBox = (): Job[] => {
  try {
    return JSON.parse(localStorage.getItem(OUTBOX) ?? '[]') as Job[]
  } catch {
    return []
  }
}
const writeBox = (jobs: Job[]) => {
  try {
    localStorage.setItem(OUTBOX, JSON.stringify(jobs.slice(-20)))
  } catch {
    /* ignore */
  }
}

async function send(job: Job): Promise<'ok' | 'drop' | 'retry'> {
  const { error } = await supabase.rpc(job.fn, job.args)
  if (!error) return 'ok'
  return PERMANENT.some((m) => error.message.includes(m)) ? 'drop' : 'retry'
}

/** Send a result; if the network or server fails it is kept and retried later. Never throws. */
export async function submit(job: Job): Promise<void> {
  try {
    if ((await send(job)) === 'retry') writeBox([...readBox(), job])
  } catch {
    writeBox([...readBox(), job])
  }
}

/** Retry results that could not be sent earlier (call when the app starts). */
export async function flushOutbox(): Promise<void> {
  const jobs = readBox()
  if (!jobs.length) return
  writeBox([])
  const keep: Job[] = []
  for (const job of jobs) {
    try {
      if ((await send(job)) === 'retry') keep.push(job)
    } catch {
      keep.push(job)
    }
  }
  if (keep.length) writeBox([...keep, ...readBox()])
}

/** Xing bonuses made by one team over finished rounds. */
export function xingTotals(history: RoundScore[], team: number): { x10: number; x20: number } {
  return history.reduce(
    (a, r) => ({ x10: a.x10 + r.teams[team].xing10Count, x20: a.x20 + r.teams[team].xing20Count }),
    { x10: 0, x20: 0 },
  )
}
