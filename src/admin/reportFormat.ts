// Pure helpers for the weekly report (kept separate so they can be unit-tested).

const MONTHS = ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor']
export const DAYS = ['Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht', 'Die']

const parts = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return { y, m, d }
}

/** "12 – 18 Tetor 2026" / "28 Shtator – 4 Tetor 2026". */
export function rangeLabel(first: string, last: string): string {
  const a = parts(first)
  const b = parts(last)
  if (a.m === b.m && a.y === b.y) return `${a.d} – ${b.d} ${MONTHS[b.m - 1]} ${b.y}`
  const left = a.y === b.y ? `${a.d} ${MONTHS[a.m - 1]}` : `${a.d} ${MONTHS[a.m - 1]} ${a.y}`
  return `${left} – ${b.d} ${MONTHS[b.m - 1]} ${b.y}`
}

/** Change versus last week, or null if there is nothing to compare with. */
export function delta(cur: number, prev: number): { pct: number; dir: 'up' | 'down' | 'flat' } | null {
  if (prev === 0) return null
  const pct = Math.round(((cur - prev) / prev) * 100)
  return { pct, dir: pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat' }
}

