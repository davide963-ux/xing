import { ALL_CARDS, cardById, cardPoints, isJack, isTenDiamonds, isTwoClubs, shuffle } from './cards'
import type {
  GameConfig,
  MatchState,
  PlayEvent,
  Rng,
  RoundScore,
  RoundState,
  TeamRoundScore,
} from './types'

export const DEFAULT_CONFIG: GameConfig = {
  playerCount: 2,
  targetScore: 101,
  rules: { jackXing20: true, allowFinalXing: false },
}

export const HAND_SIZE = 4

/** Number of sides: 2 players -> 2, 3 players -> 3 (everyone plays alone), 4 players -> 2 teams. */
export const teamCount = (playerCount: number): number => (playerCount === 4 ? 2 : playerCount)

/** Side of a seat: 4 players -> seats 0&2 vs 1&3 (partners sit opposite); otherwise one side per seat. */
export const teamOf = (seat: number, playerCount: number): number => (playerCount === 4 ? seat % 2 : seat)

// ---------------------------------------------------------------- dealing

export function createRound(config: GameConfig, dealer: number, rng: Rng): RoundState {
  const n = config.playerCount
  const deck = shuffle(
    ALL_CARDS.map((c) => c.id),
    rng,
  )
  const stack = deck.splice(0, 4) // stack[3] is the face-up top card
  if (isJack(stack[3])) {
    // swap with a non-jack from the remaining deck (no card is duplicated or lost)
    const idx = deck.findIndex((id) => !isJack(id))
    const swapped = deck[idx]
    deck[idx] = stack[3]
    stack[3] = swapped
  }
  const hands: number[][] = Array.from({ length: n }, () => [])
  for (let p = 0; p < n; p++) hands[p] = deck.splice(0, HAND_SIZE)
  return {
    config,
    dealer,
    current: (dealer + 1) % n, // the player to the dealer's right starts (counterclockwise)
    hands,
    deck,
    table: stack,
    hiddenOnTable: stack.slice(0, 3),
    captured: Array.from({ length: teamCount(n) }, () => [] as number[]),
    xing10: new Array<number>(teamCount(n)).fill(0),
    xing20: new Array<number>(teamCount(n)).fill(0),
    lastCapturer: null,
    revealed: [stack[3]],
    events: [],
    phase: 'playing',
    leftoverTo: null,
    leftoverCount: 0,
  }
}

// ---------------------------------------------------------------- playing

export function canPlay(state: RoundState, seat: number, cardId: number): boolean {
  return state.phase === 'playing' && state.current === seat && state.hands[seat].includes(cardId)
}

/** Pure: returns a new state and the resulting event. Throws on illegal plays. */
export function playCard(
  prev: RoundState,
  seat: number,
  cardId: number,
): { state: RoundState; event: PlayEvent } {
  if (!canPlay(prev, seat, cardId)) throw new Error(`Illegal play: seat ${seat}, card ${cardId}`)
  const s: RoundState = structuredClone(prev)
  const n = s.config.playerCount
  const card = cardById(cardId)
  s.hands[seat] = s.hands[seat].filter((id) => id !== cardId)

  const tableBefore = s.table.length
  const top = tableBefore > 0 ? cardById(s.table[tableBefore - 1]) : null
  // the last card of the whole round: deck empty and this was the last card in any hand
  const isFinalCard = s.deck.length === 0 && s.hands.every((h) => h.length === 0)
  s.revealed.push(cardId)

  let kind: PlayEvent['kind']
  let captureKind: PlayEvent['captureKind']
  if (!top) {
    kind = 'start' // empty table: even a jack just starts a stack
  } else if (top.rank === card.rank) {
    kind = 'capture'
    captureKind = 'match'
  } else if (card.rank === 11) {
    kind = 'capture'
    captureKind = 'jack'
  } else {
    kind = 'push'
  }

  s.table.push(cardId)
  let captured: number[] = []
  let bonus: 0 | 10 | 20 = 0

  if (kind === 'capture') {
    if (captureKind === 'match' && tableBefore === 1) {
      if (card.rank !== 11) bonus = 10
      else if (s.config.rules.jackXing20) bonus = 20
    }
    if (isFinalCard && !s.config.rules.allowFinalXing) bonus = 0
    const team = teamOf(seat, n)
    captured = s.table
    s.captured[team].push(...captured)
    for (const id of captured) if (!s.revealed.includes(id)) s.revealed.push(id)
    s.table = []
    s.hiddenOnTable = []
    s.lastCapturer = seat
    if (bonus === 10) s.xing10[team]++
    if (bonus === 20) s.xing20[team]++
  }

  let dealtAfter = false
  const handsEmpty = s.hands.every((h) => h.length === 0)
  if (handsEmpty && s.deck.length > 0) {
    for (let k = 0; k < n; k++) {
      const p = (s.dealer + 1 + k) % n
      s.hands[p] = s.deck.splice(0, HAND_SIZE)
    }
    dealtAfter = true
  }

  if (handsEmpty && !dealtAfter) {
    // End of round: leftovers go to the last capturer; never earns a bonus.
    if (s.lastCapturer !== null && s.table.length > 0) {
      const team = teamOf(s.lastCapturer, n)
      s.leftoverTo = s.lastCapturer
      s.leftoverCount = s.table.length
      s.captured[team].push(...s.table)
      for (const id of s.table) if (!s.revealed.includes(id)) s.revealed.push(id)
      s.table = []
      s.hiddenOnTable = []
    }
    s.phase = 'finished'
  } else {
    s.current = (seat + 1) % n
  }

  const event: PlayEvent = {
    seq: s.events.length,
    seat,
    cardId,
    kind,
    captureKind,
    captured,
    tableBefore,
    bonus,
    isFinalCard,
    dealtAfter,
  }
  s.events.push(event)
  return { state: s, event }
}

// ---------------------------------------------------------------- scoring

export function scoreRound(state: RoundState): RoundScore {
  const base = state.captured.map((ids): TeamRoundScore => ({
    cards: ids.length,
    aces: ids.filter((id) => cardById(id).rank === 1).length,
    jacks: ids.filter(isJack).length,
    tenDiamonds: ids.filter(isTenDiamonds).length * 3,
    twoClubs: ids.filter(isTwoClubs).length * 2,
    majority: 0,
    xing10Count: 0,
    xing20Count: 0,
    xingPoints: 0,
    cardPoints: 0,
    total: 0,
  }))
  // most cards: 3 points to the side with strictly the most; a tie for the most gives nobody the bonus
  const most = Math.max(...base.map((t) => t.cards))
  const leaders = base.filter((t) => t.cards === most)
  if (leaders.length === 1) leaders[0].majority = 3
  base.forEach((t, i) => {
    t.xing10Count = state.xing10[i]
    t.xing20Count = state.xing20[i]
    t.xingPoints = t.xing10Count * 10 + t.xing20Count * 20
    t.cardPoints = t.aces + t.jacks + t.tenDiamonds + t.twoClubs + t.majority
    t.total = t.cardPoints + t.xingPoints
  })
  return { teams: base }
}

/** Sum of ordinary point values of a set of cards (no majority, no bonus). */
export const pointsOf = (ids: readonly number[]): number => ids.reduce((a, id) => a + cardPoints(id), 0)

// ---------------------------------------------------------------- match

export function newMatch(config: GameConfig, rng: Rng, dealer?: number): MatchState {
  const d = dealer ?? Math.floor(rng() * config.playerCount)
  return {
    config,
    scores: new Array<number>(teamCount(config.playerCount)).fill(0),
    dealer: d,
    roundNumber: 1,
    round: createRound(config, d, rng),
    roundHistory: [],
    winner: null,
    tiedAtTarget: false,
    roundCommitted: false,
  }
}

/** Add the finished round to the totals and decide whether the match is over. */
export function commitRound(match: MatchState): MatchState {
  if (match.round.phase !== 'finished' || match.roundCommitted) return match
  const score = scoreRound(match.round)
  const scores = match.scores.map((s, i) => s + score.teams[i].total)
  const t = match.config.targetScore
  // Only sides at or above the target can win; the highest total wins, equal highest totals mean another round.
  const reached = scores.filter((x) => x >= t)
  let winner: number | null = null
  let tiedAtTarget = false
  if (reached.length > 0) {
    const top = Math.max(...reached)
    const leaders = scores.map((x, i) => (x === top ? i : -1)).filter((i) => i >= 0)
    if (leaders.length === 1) winner = leaders[0]
    else tiedAtTarget = true
  }
  return {
    ...match,
    scores,
    roundHistory: [...match.roundHistory, score],
    winner,
    tiedAtTarget,
    roundCommitted: true,
  }
}

export function nextRound(match: MatchState, rng: Rng): MatchState {
  if (!match.roundCommitted || match.winner !== null) return match
  const dealer = (match.dealer + 1) % match.config.playerCount
  return {
    ...match,
    dealer,
    roundNumber: match.roundNumber + 1,
    round: createRound(match.config, dealer, rng),
    tiedAtTarget: false,
    roundCommitted: false,
  }
}

/** All card ids currently in the round (for conservation checks). */
export function allCardIds(state: RoundState): number[] {
  return [...state.hands.flat(), ...state.deck, ...state.table, ...state.captured.flat()]
}
