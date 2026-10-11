import { useCallback, useEffect, useRef, useState } from 'react'
import { chooseCard, getPublicView } from '../engine/ai'
import type { AiLevel } from '../engine/ai'
import { DEFAULT_CONFIG, canPlay, commitRound, newMatch, nextRound, playCard, pointsOf } from '../engine/engine'
import type { GameConfig, MatchState } from '../engine/types'
import { seatName } from './format'
import { setSoundEnabled, sfx } from './sound'

export interface Settings {
  config: GameConfig
  aiLevel: AiLevel
  sound: boolean
}

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

export type Modal = 'rules' | 'settings' | null
export type Overlay = 'round' | 'winner' | null

const KEY = 'xing.settings.v1'
const DEFAULT_SETTINGS: Settings = { config: DEFAULT_CONFIG, aiLevel: 'normal', sound: true }

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const p = JSON.parse(raw)
      return {
        config: {
          playerCount: p.config?.playerCount === 4 ? 4 : 2,
          targetScore: p.config?.targetScore === 51 ? 51 : 101,
          rules: {
            jackXing20: p.config?.rules?.jackXing20 !== false,
            allowFinalXing: p.config?.rules?.allowFinalXing === true,
          },
        },
        aiLevel: p.aiLevel === 'easy' ? 'easy' : 'normal',
        sound: p.sound !== false,
      }
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_SETTINGS
}

const PLAY_MS = 450
const SWEEP_MS = 700

export function useGame() {
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [match, setMatchState] = useState<MatchState | null>(null)
  const [anim, setAnim] = useState<Anim | null>(null)
  const [banner, setBanner] = useState<Banner | null>(null)
  const [overlay, setOverlay] = useState<Overlay>(null)
  const [modal, setModal] = useState<Modal>(null)

  const matchRef = useRef<MatchState | null>(null)
  const busy = useRef(false)
  const timers = useRef<number[]>([])
  const settingsRef = useRef(settings)
  settingsRef.current = settings
  const modalRef = useRef<Modal>(null)
  modalRef.current = modal

  const setMatch = useCallback((m: MatchState | null) => {
    matchRef.current = m
    setMatchState(m)
  }, [])

  const later = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms))
  }, [])

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }, [])

  useEffect(() => {
    setSoundEnabled(settings.sound)
    try {
      localStorage.setItem(KEY, JSON.stringify(settings))
    } catch {
      /* ignore */
    }
  }, [settings])

  useEffect(() => clearTimers, [clearTimers])

  const showBanner = useCallback(
    (b: Omit<Banner, 'id'>) => {
      const id = Date.now() + Math.random()
      setBanner({ ...b, id })
      later(1700, () => setBanner((cur) => (cur && cur.id === id ? null : cur)))
    },
    [later],
  )

  const reset = useCallback(() => {
    clearTimers()
    busy.current = false
    setAnim(null)
    setBanner(null)
    setOverlay(null)
    setModal(null)
  }, [clearTimers])

  const startMatch = useCallback(
    (config: GameConfig) => {
      reset()
      setMatch(newMatch(config, Math.random))
    },
    [reset, setMatch],
  )

  const backToSetup = useCallback(() => {
    reset()
    setMatch(null)
  }, [reset, setMatch])

  const play = useCallback(
    (seat: number, cardId: number) => {
      const m = matchRef.current
      if (!m || busy.current || modalRef.current) return
      if (!canPlay(m.round, seat, cardId)) return
      busy.current = true // blocks out-of-turn / double submissions until the animation ends
      const cfg = m.config
      const before = m.round
      const { state, event } = playCard(before, seat, cardId)
      setMatch({ ...m, round: state })
      sfx('play')
      setAnim({
        table: [...before.table, cardId],
        hidden: before.hiddenOnTable,
        flyFrom: seat,
        flyCard: cardId,
        sweepTo: null,
      })

      const finish = () => {
        setAnim(null)
        if (event.dealtAfter) sfx('deal')
        if (state.phase === 'finished') {
          const done = commitRound(matchRef.current!)
          setMatch(done)
          later(450, () => {
            if (done.winner !== null) sfx(done.winner === 0 ? 'win' : 'lose')
            else sfx('round')
            setOverlay(done.winner !== null ? 'winner' : 'round')
          })
        } else {
          busy.current = false
        }
      }

      later(PLAY_MS, () => {
        const sweep = (to: number) => setAnim((a) => (a ? { ...a, sweepTo: to, flyFrom: null } : a))
        if (event.kind === 'capture') {
          const who = seatName(cfg, seat)
          const pts = pointsOf(event.captured)
          if (event.bonus === 20) {
            showBanner({ kind: 'xing20', text: 'JACK XING! +20', sub: `${who} captured a lone jack with a jack` })
            sfx('xing20')
          } else if (event.bonus === 10) {
            showBanner({ kind: 'xing10', text: 'XING! +10', sub: `${who} captured a lone card` })
            sfx('xing10')
          } else {
            const n = event.captured.length
            showBanner({
              kind: 'capture',
              text: `${who} captured ${n} card${n === 1 ? '' : 's'}`,
              sub: pts > 0 ? `${pts} point${pts === 1 ? '' : 's'} in the stack` : undefined,
            })
            sfx('capture')
          }
          sweep(seat)
          later(event.bonus ? SWEEP_MS + 500 : SWEEP_MS, finish)
        } else if (state.leftoverTo !== null) {
          showBanner({
            kind: 'info',
            text: `Last cards go to ${seatName(cfg, state.leftoverTo)}`,
            sub: `${state.leftoverCount} left on the table (no bonus)`,
          })
          sfx('capture')
          sweep(state.leftoverTo)
          later(SWEEP_MS, finish)
        } else {
          finish()
        }
      })
    },
    [later, setMatch, showBanner],
  )

  const continueRound = useCallback(() => {
    const m = matchRef.current
    if (!m) return
    setOverlay(null)
    setBanner(null)
    setMatch(nextRound(m, Math.random))
    busy.current = false
  }, [setMatch])

  // --- computer turns (they only ever see the public view of their own seat)
  const round = match?.round
  useEffect(() => {
    if (!match || !round || round.phase !== 'playing' || overlay || modal || anim) return
    const seat = round.current
    if (seat === 0) return
    const t = window.setTimeout(
      () => {
        const m = matchRef.current
        if (!m || m.round.current !== seat || m.round.phase !== 'playing') return
        play(seat, chooseCard(getPublicView(m.round, seat), Math.random, settingsRef.current.aiLevel))
      },
      700 + Math.random() * 500,
    )
    return () => window.clearTimeout(t)
  }, [match, round, overlay, modal, anim, play])

  return {
    settings,
    setSettings,
    match,
    anim,
    banner,
    overlay,
    modal,
    setModal,
    startMatch,
    backToSetup,
    play,
    continueRound,
  }
}
