import type { DailyResult } from '../engine/daily'

const KEY = 'xing.daily.v1'

type Store = Record<string, DailyResult>

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Store) : {}
  } catch {
    return {}
  }
}

export const loadDaily = (key: string): DailyResult | null => read()[key] ?? null

/** Keeps the first finished result of the day (one official attempt). */
export function saveDaily(result: DailyResult): DailyResult {
  const store = read()
  if (store[result.key]) return store[result.key]
  store[result.key] = result
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    /* storage unavailable: result only lives for this session */
  }
  return result
}
