import type { Card, Rank, Rng, Suit } from './types'

export const SUITS: Suit[] = ['S', 'H', 'D', 'C']
export const SUIT_SYMBOL: Record<Suit, string> = { S: '♠', H: '♥', D: '♦', C: '♣' }
export const SUIT_NAME: Record<Suit, string> = { S: 'spades', H: 'hearts', D: 'diamonds', C: 'clubs' }

export const ALL_CARDS: readonly Card[] = SUITS.flatMap((suit, si) =>
  Array.from({ length: 13 }, (_, i) => ({
    id: si * 13 + i,
    suit,
    rank: (i + 1) as Rank,
  })),
)

export const cardById = (id: number): Card => ALL_CARDS[id]

export const rankLabel = (rank: Rank): string =>
  rank === 1 ? 'A' : rank === 11 ? 'J' : rank === 12 ? 'Q' : rank === 13 ? 'K' : String(rank)

export const cardLabel = (id: number): string => {
  const c = cardById(id)
  return `${rankLabel(c.rank)}${SUIT_SYMBOL[c.suit]}`
}

export const isJack = (id: number): boolean => cardById(id).rank === 11
export const isTenDiamonds = (id: number): boolean => {
  const c = cardById(id)
  return c.rank === 10 && c.suit === 'D'
}
export const isTwoClubs = (id: number): boolean => {
  const c = cardById(id)
  return c.rank === 2 && c.suit === 'C'
}

/** Ordinary point value of a single card (no majority / bonuses). */
export const cardPoints = (id: number): number => {
  const c = cardById(id)
  if (c.rank === 1 || c.rank === 11) return 1
  if (isTenDiamonds(id)) return 3
  if (isTwoClubs(id)) return 2
  return 0
}

export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const a = items.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Small deterministic PRNG (mulberry32) for tests and replays. */
export function seededRng(seed: number): Rng {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
