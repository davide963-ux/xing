import { ALL_CARDS, cardById, cardPoints } from './cards'
import { teamOf } from './engine'
import type { RoundState, Rng, RulesConfig } from './types'

/**
 * Everything a player is legitimately allowed to know. The AI only ever receives this
 * object - never the RoundState - so it cannot read other hands, the deck order or the
 * identity of face-down table cards.
 */
export interface PublicView {
  seat: number
  playerCount: 2 | 4
  rules: RulesConfig
  hand: number[]
  /** Table bottom -> top; `null` marks a face-down card that has not been revealed. */
  table: (number | null)[]
  deckCount: number
  /** Number of cards in every seat's hand (public: hands are physically visible in size). */
  handSizes: number[]
  /** Every card that has been shown to everybody (played or captured face-up). */
  revealed: number[]
  capturedCount: number[]
}

export function getPublicView(state: RoundState, seat: number): PublicView {
  const hidden = new Set(state.hiddenOnTable)
  return {
    seat,
    playerCount: state.config.playerCount,
    rules: { ...state.config.rules },
    hand: state.hands[seat].slice(),
    table: state.table.map((id) => (hidden.has(id) ? null : id)),
    deckCount: state.deck.length,
    handSizes: state.hands.map((h) => h.length),
    revealed: state.revealed.slice(),
    capturedCount: state.captured.map((c) => c.length),
  }
}

export type AiLevel = 'easy' | 'normal'

const HIDDEN_CARD_EXPECTED_POINTS = 16 / 52

export function chooseCard(view: PublicView, rng: Rng, level: AiLevel = 'normal'): number {
  const { hand } = view
  if (hand.length === 1) return hand[0]
  if (level === 'easy' && rng() < 0.3) return hand[Math.floor(rng() * hand.length)]

  const me = view.seat
  const n = view.playerCount
  const myTeam = teamOf(me)

  // --- card counting from public information only
  const seenByRank = new Array<number>(14).fill(0)
  for (const id of view.revealed) seenByRank[cardById(id).rank]++
  for (const id of view.hand) if (!view.revealed.includes(id)) seenByRank[cardById(id).rank]++
  const unseenTotal = ALL_CARDS.length - new Set([...view.revealed, ...view.hand]).size
  const unseen = (rank: number) => Math.max(0, 4 - seenByRank[rank])

  const opponentSeats: number[] = []
  for (let s = 0; s < n; s++) if (teamOf(s) !== myTeam) opponentSeats.push(s)
  /** Probability that at least one opponent holds one of the unseen cards of a rank. */
  const pOppHolds = (rank: number): number => {
    const k = unseen(rank)
    if (k === 0 || unseenTotal === 0) return 0
    let none = 1
    for (const s of opponentSeats) {
      const q = Math.min(1, view.handSizes[s] / unseenTotal)
      none *= Math.pow(1 - q, k)
    }
    return 1 - none
  }
  const pOppJack = pOppHolds(11)

  // --- table valuation
  const known = view.table.filter((x): x is number => x !== null)
  const hiddenCount = view.table.length - known.length
  const stackPts =
    known.reduce((a, id) => a + cardPoints(id), 0) + hiddenCount * HIDDEN_CARD_EXPECTED_POINTS
  const tableLen = view.table.length
  const topId = tableLen > 0 ? view.table[tableLen - 1] : null
  const topRank = topId !== null ? cardById(topId).rank : null

  // is this my very last card of the round (no Xing bonus when disallowed)?
  const othersEmpty = view.handSizes.every((h, s) => s === me || h === 0)
  const lastCard = view.deckCount === 0 && othersEmpty && view.hand.length === 1
  const bonusAllowed = view.rules.allowFinalXing || !lastCard
  const jackKeep = view.deckCount > 0 || view.hand.length > 2 ? 0.8 : 0.2

  const score = (id: number): number => {
    const c = cardById(id)
    const pts = cardPoints(id)
    const isJ = c.rank === 11
    if (tableLen === 0) {
      // starting a lone card: an opponent matching it scores a Xing
      const bonus = isJ ? (view.rules.jackXing20 ? 20 : 0) : 10
      const risk = pOppHolds(c.rank)
      return -risk * (bonus + pts + 0.5) - (isJ ? jackKeep : 0) - pts * 0.1
    }
    if (c.rank === topRank) {
      let bonus = 0
      if (tableLen === 1 && bonusAllowed) bonus = isJ ? (view.rules.jackXing20 ? 20 : 0) : 10
      return stackPts + pts + bonus + 0.15 * tableLen + (isJ ? -jackKeep * 0.5 : 0) + 1
    }
    if (isJ) {
      return stackPts + pts + 0.15 * tableLen - jackKeep
    }
    // plain push: onto a growing stack that the opponents may then capture
    const pCapture = 1 - (1 - pOppHolds(c.rank)) * (1 - pOppJack)
    return -pCapture * (stackPts + pts + 0.15 * (tableLen + 1)) - pts * 0.2
  }

  let best = hand[0]
  let bestScore = -Infinity
  for (const id of hand) {
    const s = score(id) + (level === 'easy' ? (rng() - 0.5) * 3 : rng() * 0.01)
    if (s > bestScore) {
      bestScore = s
      best = id
    }
  }
  return best
}
