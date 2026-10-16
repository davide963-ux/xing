import { supabase } from '../auth/supabase'
import type { Overrides } from '../i18n/texts'

export async function fetchOverrides(): Promise<Overrides> {
  const { data, error } = await supabase.from('text_overrides').select('key,value')
  if (error) throw error
  return Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]))
}

export async function checkAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_admin')
  if (error) return false
  return data === true
}

export async function saveText(key: string, value: string): Promise<void> {
  const { error } = await supabase.rpc('admin_set_text', { p_key: key, p_value: value })
  if (error) throw new Error(error.message)
}

export async function resetText(key: string): Promise<void> {
  const { error } = await supabase.rpc('admin_reset_text', { p_key: key })
  if (error) throw new Error(error.message)
}

// ---------------------------------------------------------------- weekly report

export interface Period {
  online_matches: number
  online_2p: number
  online_4p: number
  computer: number
  daily: number
  daily_players: number
  active_players: number
  new_players: number
  xing10: number
  xing20: number
  vs_computer_games: number
  vs_computer_wins: number
}

export interface Report {
  start: string
  end: string
  offset: number
  cur: Period
  prev: Period
  days: { day: string; games: number }[]
  top: { username: string; wins: number; games: number; online_wins: number; rating: number }[]
  totals: { registered: number; games: number }
}

/** offset 0 = this week (Mon-Sun, Albania time), -1 = last week, ... */
export async function fetchReport(offset: number): Promise<Report> {
  const { data, error } = await supabase.rpc('admin_report', { p_week_offset: offset })
  if (error) throw new Error(error.message)
  return data as Report
}

export const totalGames = (p: Period): number => p.online_matches + p.computer + p.daily
