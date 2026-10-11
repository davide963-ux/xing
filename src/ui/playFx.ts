import type { Dispatch, SetStateAction } from 'react'
import { pointsOf } from '../engine/engine'
import type { PlayEvent, RoundState } from '../engine/types'
import { seatName } from './format'
import { sfx } from './sound'

/** What the table shows while a move is being animated. */
export interface Anim {
  table: number[]
  hidden: number[]
  flyFrom: number | null
  flyCard: number | null
  sweepTo: number | null
}

export interface Banner {
  id: number
  kind: 'capture' | 'xing10' | 'xing20' | 'info'
  text: string
  sub?: string
}

export interface FxCtx {
  setAnim: Dispatch<SetStateAction<Anim | null>>
  showBanner: (b: Omit<Banner, 'id'>) => void
  later: (ms: number, fn: () => void) => void
}

export const PLAY_MS = 450
export const SWEEP_MS = 700

/**
 * Animate one move (card flies in, stack is swept to the capturer, banners and sounds) and
 * call `onFinish` when the table is quiet again. `before`/`after` are the round states around
 * the move; the same routine drives local and online games.
 */
export function runPlayFx(ctx: FxCtx, before: RoundState, after: RoundState, event: PlayEvent, onFinish: () => void) {
  const { setAnim, showBanner, later } = ctx
  const cfg = after.config
  sfx('play')
  setAnim({
    table: [...before.table, event.cardId],
    hidden: before.hiddenOnTable,
    flyFrom: event.seat,
    flyCard: event.cardId,
    sweepTo: null,
  })

  const finish = () => {
    setAnim(null)
    if (event.dealtAfter) sfx('deal')
    onFinish()
  }

  later(PLAY_MS, () => {
    const sweep = (to: number) => setAnim((a) => (a ? { ...a, sweepTo: to, flyFrom: null } : a))
    if (event.kind === 'capture') {
      const who = seatName(cfg, event.seat)
      const pts = pointsOf(event.captured)
      const verb = 'captured'
      if (event.bonus === 20) {
        showBanner({ kind: 'xing20', text: 'JACK XING! +20', sub: `${who} ${verb} a lone jack with a jack` })
        sfx('xing20')
      } else if (event.bonus === 10) {
        showBanner({ kind: 'xing10', text: 'XING! +10', sub: `${who} ${verb} a lone card` })
        sfx('xing10')
      } else {
        const n = event.captured.length
        showBanner({
          kind: 'capture',
          text: `${who} ${verb} ${n} card${n === 1 ? '' : 's'}`,
          sub: pts > 0 ? `${pts} point${pts === 1 ? '' : 's'} in the stack` : undefined,
        })
        sfx('capture')
      }
      sweep(event.seat)
      later(event.bonus ? SWEEP_MS + 500 : SWEEP_MS, finish)
    } else if (after.leftoverTo !== null) {
      showBanner({
        kind: 'info',
        text: `Last cards go to ${seatName(cfg, after.leftoverTo)}`,
        sub: `${after.leftoverCount} left on the table (no bonus)`,
      })
      sfx('capture')
      sweep(after.leftoverTo)
      later(SWEEP_MS, finish)
    } else {
      finish()
    }
  })
}
