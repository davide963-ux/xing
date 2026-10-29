export type Suit = 'S' | 'H' | 'D' | 'C'
/** 1 = Ace, 11 = Jack, 12 = Queen, 13 = King */
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13

export interface Card {
  id: number // unique 0..51
  suit: Suit
  rank: Rank
}

export interface RulesConfig {
  /** A lone jack captured by another jack earns 20 bonus points. */
  jackXing20: boolean
  /** If false, the very last card of the round cannot earn a Xing bonus. */
  allowFinalXing: boolean
}

export interface GameConfig {
  /** Display-only: whose screen this is and the seat names (set for online games). */
  view?: { me: number; names: string[] }
  playerCount: 2 | 3 | 4
  targetScore: 51 | 101
  rules: RulesConfig
}

export type CaptureKind = 'match' | 'jack'
export type PlayKind = 'start' | 'push' | 'capture'

export interface PlayEvent {
  seq: number
  seat: number
  cardId: number
  kind: PlayKind
  captureKind?: CaptureKind
  /** Cards taken (including the played card). */
  captured: number[]
  /** Table size before the move. */
  tableBefore: number
  bonus: 0 | 10 | 20
  /** The play was the last card of the round (no bonus when disallowed). */
  isFinalCard: boolean
  /** A hand deal happened right after this play. */
  dealtAfter: boolean
}

export interface RoundState {
  config: GameConfig
  dealer: number
  current: number
  hands: number[][]
  deck: number[]
  /** Bottom -> top. The last entry is the top card. */
  table: number[]
  /** Table cards whose identity is not yet public (initial face-down cards). */
  hiddenOnTable: number[]
  /** Captured card ids per team (index = team). */
  captured: number[][]
  /** Bonus counters per team. */
  xing10: number[]
  xing20: number[]
  lastCapturer: number | null
  /** Card ids publicly revealed so far. */
  revealed: number[]
  events: PlayEvent[]
  phase: 'playing' | 'finished'
  /** Cards handed out by the end-of-round collection. */
  leftoverTo: number | null
  leftoverCount: number
}

export interface TeamRoundScore {
  cards: number
  aces: number
  jacks: number
  tenDiamonds: number
  twoClubs: number
  majority: number
  xing10Count: number
  xing20Count: number
  xingPoints: number
  cardPoints: number // aces + jacks + 10D + 2C + majority
  total: number
}

/** One entry per side: 2 players -> 2 sides, 3 players -> 3 sides (everyone alone), 4 players -> 2 teams. */
export interface RoundScore {
  teams: TeamRoundScore[]
}

export interface MatchState {
  config: GameConfig
  scores: number[]
  dealer: number
  roundNumber: number
  round: RoundState
  roundHistory: RoundScore[]
  winner: number | null
  /** Set when the highest totals at or above the target are equal. */
  tiedAtTarget: boolean
  /** The finished round has been added to `scores`. */
  roundCommitted: boolean
}

export type Rng = () => number
