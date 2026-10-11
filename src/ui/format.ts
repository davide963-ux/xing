import { cardLabel } from '../engine/cards'
import type { GameConfig, PlayEvent } from '../engine/types'

const NAMES_4 = ['You', 'Drita', 'Arben', 'Ilir']
const NAMES_2 = ['You', 'Computer']

export const seatName = (config: GameConfig, seat: number): string =>
  (config.playerCount === 2 ? NAMES_2 : NAMES_4)[seat]

export const teamName = (config: GameConfig, team: number): string =>
  config.playerCount === 2 ? NAMES_2[team] : team === 0 ? 'You & Arben' : 'Drita & Ilir'

export type Pos = 'bottom' | 'right' | 'top' | 'left'

/** Screen position of a seat. Play runs counterclockwise: bottom -> right -> top -> left. */
export function posOf(config: GameConfig, seat: number): Pos {
  if (config.playerCount === 2) return seat === 0 ? 'bottom' : 'top'
  return (['bottom', 'right', 'top', 'left'] as const)[seat]
}

export function describeEvent(config: GameConfig, e: PlayEvent): { text: string; tone: string } {
  const who = seatName(config, e.seat)
  const card = cardLabel(e.cardId)
  if (e.kind === 'start') return { text: `${who} played ${card} on the empty table`, tone: '' }
  if (e.kind === 'push') return { text: `${who} played ${card}`, tone: '' }
  const n = e.captured.length
  if (e.bonus === 20) return { text: `${who} made a JACK XING with ${card}: +20!`, tone: 'xing20' }
  if (e.bonus === 10) return { text: `${who} made a XING with ${card}: +10!`, tone: 'xing10' }
  const how = e.captureKind === 'jack' ? `took the stack with ${card}` : `matched with ${card}`
  return { text: `${who} ${how} and captured ${n} card${n === 1 ? '' : 's'}`, tone: 'capture' }
}
