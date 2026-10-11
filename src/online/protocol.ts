import type { GameConfig, MatchState, PlayEvent } from '../engine/types'

export interface LobbyPlayer {
  id: string
  name: string
  t: number
}

export interface MatchOffer {
  roomId: string
  players: LobbyPlayer[]
  config: GameConfig
}

/** Host -> player. `match` is already masked for the receiving seat. */
export interface Snapshot {
  seq: number
  event: PlayEvent | null
  newRound: boolean
  match: MatchState
}

/** Player -> host. */
export type HostMsg =
  | { type: 'join'; from: string }
  | { type: 'play'; from: string; cardId: number }
  | { type: 'ready'; from: string }

/**
 * Build the match as seen by one seat: other players' hands, the deck order and the identity
 * of face-down table cards are replaced by unique negative placeholder ids, so the receiving
 * client never holds hidden information. Everything already public (played / captured cards)
 * stays real. `config.view` tells the UI whose screen it is.
 */
export function maskMatch(match: MatchState, seat: number, names: string[]): MatchState {
  const view = { me: seat, names }
  const config: GameConfig = { ...match.config, view }
  const r = structuredClone(match.round)
  const hidden = new Set(r.hiddenOnTable)
  const fake = new Map<number, number>()
  r.hands = r.hands.map((h, s) => (s === seat ? h : h.map((_, i) => -(1 + s * 8 + i))))
  r.deck = r.deck.map((_, i) => -(100 + i))
  r.table = r.table.map((id, i) => {
    if (!hidden.has(id)) return id
    fake.set(id, -(200 + i))
    return -(200 + i)
  })
  r.hiddenOnTable = r.hiddenOnTable.map((id) => fake.get(id)!)
  r.config = config
  return { ...match, config, round: r }
}
