import { cardLabel } from '../engine/cards'
import type { GameConfig, PlayEvent } from '../engine/types'
import { ME, sq } from '../i18n/sq'


/** The seat shown at the bottom of the screen (always 0 offline). */
export const meOf = (config: GameConfig): number => config.view?.me ?? 0

export const isMe = (config: GameConfig, seat: number): boolean => seat === meOf(config)

export const seatName = (config: GameConfig, seat: number): string => {
  if (isMe(config, seat)) return ME
  const n = sq.names
  return config.view?.names[seat] ?? (config.playerCount === 2 ? [ME, n.computer] : [ME, n.bot1, n.bot2, n.bot3])[seat]
}

export const teamName = (config: GameConfig, team: number): string => {
  const seats = [...Array(config.playerCount).keys()].filter((s) => s % 2 === team)
  return seats
    .sort((a, b) => Number(!isMe(config, a)) - Number(!isMe(config, b)))
    .map((s) => seatName(config, s))
    .join(' & ')
}

export type Pos = 'bottom' | 'right' | 'top' | 'left'

/** Screen position of a seat. Play runs counterclockwise: bottom -> right -> top -> left. */
export function posOf(config: GameConfig, seat: number): Pos {
  const n = config.playerCount
  const rel = (seat - meOf(config) + n) % n
  if (n === 2) return rel === 0 ? 'bottom' : 'top'
  return (['bottom', 'right', 'top', 'left'] as const)[rel]
}

export function describeEvent(config: GameConfig, e: PlayEvent): { text: string; tone: string } {
  const who = seatName(config, e.seat)
  const you = isMe(config, e.seat)
  const card = cardLabel(e.cardId)
  if (e.kind === 'start') return { text: sq.ev.playedEmpty(who, you, card), tone: '' }
  if (e.kind === 'push') return { text: sq.ev.played(who, you, card), tone: '' }
  if (e.bonus === 20) return { text: sq.ev.jackXing(who, you, card), tone: 'xing20' }
  if (e.bonus === 10) return { text: sq.ev.xing(who, you, card), tone: 'xing10' }
  const n = e.captured.length
  return {
    text: e.captureKind === 'jack' ? sq.ev.tookStack(who, you, card, n) : sq.ev.matched(who, you, card, n),
    tone: 'capture',
  }
}
