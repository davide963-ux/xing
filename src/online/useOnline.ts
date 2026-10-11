import type { RealtimeChannel } from '@supabase/supabase-js'
import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../auth/supabase'
import { canPlay, commitRound, newMatch, nextRound, playCard } from '../engine/engine'
import type { MatchState } from '../engine/types'
import { runPlayFx } from '../ui/playFx'
import type { Anim, Banner } from '../ui/playFx'
import { sfx } from '../ui/sound'
import type { Modal, Overlay, Settings } from '../ui/useGame'
import { maskMatch } from './protocol'
import type { HostMsg, LobbyPlayer, MatchOffer, Snapshot } from './protocol'

export type OnlinePhase = 'idle' | 'searching' | 'joining' | 'playing' | 'ended'

const JOIN_TIMEOUT_MS = 15000

interface HostState {
  match: MatchState
  ready: Set<number>
  joined: Set<string>
  started: boolean
  /** All player channels are subscribed, so snapshots can be delivered. */
  up: boolean
  seq: number
}

function subscribe(ch: RealtimeChannel): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = window.setTimeout(() => reject(new Error('timeout')), 10000)
    ch.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        window.clearTimeout(t)
        resolve()
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        window.clearTimeout(t)
        reject(new Error(status))
      }
    })
  })
}

/**
 * Online play over Supabase Realtime. Players queue in a lobby channel; the earliest waiting
 * player becomes the host, runs the engine and sends every seat its own masked view.
 */
export function useOnline(name: string, settings: Settings, setSettings: (s: Settings) => void) {
  const [phase, setPhase] = useState<OnlinePhase>('idle')
  const [waiting, setWaiting] = useState(0)
  const [wantPlayers, setWantPlayers] = useState<2 | 4>(2)
  const [endMsg, setEndMsg] = useState<string | null>(null)
  const [match, setMatchState] = useState<MatchState | null>(null)
  const [anim, setAnim] = useState<Anim | null>(null)
  const [banner, setBanner] = useState<Banner | null>(null)
  const [overlay, setOverlay] = useState<Overlay>(null)
  const [modal, setModal] = useState<Modal>(null)
  const [waitingNext, setWaitingNext] = useState(false)

  const myId = useRef(crypto.randomUUID())
  const chans = useRef<RealtimeChannel[]>([])
  const timers = useRef<number[]>([])
  const matchRef = useRef<MatchState | null>(null)
  const phaseRef = useRef<OnlinePhase>('idle')
  const modalRef = useRef<Modal>(null)
  modalRef.current = modal
  const settingsRef = useRef(settings)
  settingsRef.current = settings
  const nameRef = useRef(name)
  nameRef.current = name

  const hostRef = useRef<HostState | null>(null)
  const hostCh = useRef<RealtimeChannel | null>(null)
  const playerChs = useRef<RealtimeChannel[]>([])
  const roomPlayers = useRef<LobbyPlayer[]>([])
  const queue = useRef<Snapshot[]>([])
  const processing = useRef(false)
  const pending = useRef(false)
  const lastSeq = useRef(-1)
  const generation = useRef(0) // invalidates callbacks of an abandoned search/match

  const setPhaseBoth = useCallback((p: OnlinePhase) => {
    phaseRef.current = p
    setPhase(p)
  }, [])
  const setMatch = useCallback((m: MatchState | null) => {
    matchRef.current = m
    setMatchState(m)
  }, [])
  const later = useCallback((ms: number, fn: () => void) => {
    const gen = generation.current
    timers.current.push(
      window.setTimeout(() => {
        if (gen === generation.current) fn()
      }, ms),
    )
  }, [])

  const showBanner = useCallback(
    (b: Omit<Banner, 'id'>) => {
      const id = Date.now() + Math.random()
      setBanner({ ...b, id })
      later(1700, () => setBanner((cur) => (cur && cur.id === id ? null : cur)))
    },
    [later],
  )

  const cleanup = useCallback(() => {
    generation.current++
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
    chans.current.forEach((c) => void supabase.removeChannel(c))
    chans.current = []
    hostRef.current = null
    hostCh.current = null
    playerChs.current = []
    roomPlayers.current = []
    queue.current = []
    processing.current = false
    pending.current = false
    lastSeq.current = -1
    setAnim(null)
    setBanner(null)
    setOverlay(null)
    setWaitingNext(false)
  }, [])

  useEffect(() => cleanup, [cleanup])

  const leave = useCallback(() => {
    cleanup()
    setMatch(null)
    setEndMsg(null)
    setModal(null)
    setPhaseBoth('idle')
  }, [cleanup, setMatch, setPhaseBoth])

  // ------------------------------------------------------------------ client side

  const drain = useCallback((): void => {
    if (processing.current) return
    const p = queue.current.shift()
    if (!p) return
    if (p.seq <= lastSeq.current) return drain()
    lastSeq.current = p.seq
    processing.current = true
    pending.current = false
    const cur = matchRef.current
    const next = p.match

    if (!cur || !p.event || p.newRound) {
      setMatch(next)
      setAnim(null)
      setBanner(null)
      setOverlay(null)
      setWaitingNext(false)
      if (phaseRef.current !== 'playing') setPhaseBoth('playing')
      processing.current = false
      return drain()
    }

    // while animating, keep the pre-round totals so the scoreboard does not jump early
    setMatch(
      next.round.phase === 'finished'
        ? { ...next, scores: cur.scores, roundHistory: cur.roundHistory, winner: null, roundCommitted: false }
        : next,
    )
    runPlayFx({ setAnim, showBanner, later }, cur.round, next.round, p.event, () => {
      setMatch(next)
      if (next.round.phase === 'finished') {
        later(450, () => {
          const myTeam = (next.config.view?.me ?? 0) % 2
          if (next.winner !== null) sfx(next.winner === myTeam ? 'win' : 'lose')
          else sfx('round')
          setOverlay(next.winner !== null ? 'winner' : 'round')
        })
      }
      processing.current = false
      drain()
    })
  }, [later, setMatch, setPhaseBoth, showBanner])

  const enqueue = useCallback(
    (s: Snapshot) => {
      queue.current.push(s)
      drain()
    },
    [drain],
  )

  // ------------------------------------------------------------------ host side

  const broadcastSnap = useCallback(
    (event: Snapshot['event'], newRound: boolean) => {
      const h = hostRef.current
      if (!h) return
      const names = roomPlayers.current.map((p) => p.name)
      h.seq++
      roomPlayers.current.forEach((_, seat) => {
        const snap: Snapshot = { seq: h.seq, event, newRound, match: maskMatch(h.match, seat, names) }
        if (seat === 0) enqueue(snap)
        else void playerChs.current[seat - 1]?.send({ type: 'broadcast', event: 'snap', payload: snap })
      })
    },
    [enqueue],
  )

  const hostApply = useCallback(
    (seat: number, cardId: number) => {
      const h = hostRef.current
      if (!h || !h.started || h.match.winner !== null || h.match.roundCommitted) return
      if (!canPlay(h.match.round, seat, cardId)) return
      const { state, event } = playCard(h.match.round, seat, cardId)
      let m: MatchState = { ...h.match, round: state }
      if (state.phase === 'finished') m = commitRound(m)
      h.match = m
      h.ready.clear()
      broadcastSnap(event, false)
    },
    [broadcastSnap],
  )

  const hostReady = useCallback(
    (seat: number) => {
      const h = hostRef.current
      if (!h || !h.match.roundCommitted || h.match.winner !== null) return
      h.ready.add(seat)
      if (h.ready.size === roomPlayers.current.length) {
        h.match = nextRound(h.match, Math.random)
        h.ready.clear()
        broadcastSnap(null, true)
      }
    },
    [broadcastSnap],
  )

  const startHostGame = useCallback(
    (offer: MatchOffer) => {
      const h = hostRef.current
      if (!h || h.started) return
      h.started = true
      const dealer = Math.floor(Math.random() * offer.config.playerCount)
      h.match = newMatch(offer.config, Math.random, dealer)
      broadcastSnap(null, false)
    },
    [broadcastSnap],
  )

  // ------------------------------------------------------------------ matchmaking

  const search = useCallback(
    (n: 2 | 4) => {
      cleanup()
      const gen = generation.current
      const id = myId.current
      setWantPlayers(n)
      setEndMsg(null)
      setWaiting(1)
      setMatch(null)
      setPhaseBoth('searching')

      const lobby = supabase.channel(`xing-lobby-v1-${n}`, { config: { presence: { key: id } } })
      chans.current.push(lobby)
      let matched = false
      const joinedAt = Date.now()

      const retry = () => {
        if (gen === generation.current) search(n)
      }

      const enterRoom = async (offer: MatchOffer) => {
        matched = true
        const players = offer.players
        const seat = players.findIndex((p) => p.id === id)
        const isHost = seat === 0
        roomPlayers.current = players
        setPhaseBoth('joining')
        void lobby.untrack()
        void supabase.removeChannel(lobby)
        chans.current = chans.current.filter((c) => c !== lobby)
        later(JOIN_TIMEOUT_MS, () => {
          if (phaseRef.current === 'joining') retry()
        })

        try {
          const hc = supabase.channel(`xing-host-${offer.roomId}`, { config: { presence: { key: id } } })
          chans.current.push(hc)
          hostCh.current = hc
          hc.on('presence', { event: 'leave' }, () => {
            const m = matchRef.current
            if (phaseRef.current === 'playing' && m && m.winner === null) {
              setEndMsg('A player left the match.')
              setPhaseBoth('ended')
            }
          })

          if (isHost) {
            hostRef.current = {
              match: newMatch(offer.config, Math.random, 0),
              ready: new Set(),
              joined: new Set([id]),
              started: false,
              up: false,
              seq: 0,
            }
            hc.on('broadcast', { event: 'msg' }, ({ payload }) => {
              const msg = payload as HostMsg
              const h = hostRef.current
              if (!h) return
              const from = players.findIndex((p) => p.id === msg.from)
              if (from < 1) return
              if (msg.type === 'join') {
                h.joined.add(msg.from)
                if (h.up && h.joined.size === players.length) startHostGame(offer)
              } else if (msg.type === 'play') hostApply(from, msg.cardId)
              else if (msg.type === 'ready') hostReady(from)
            })
            for (const p of players.slice(1)) {
              const pc = supabase.channel(`xing-p-${offer.roomId}-${p.id}`)
              chans.current.push(pc)
              playerChs.current.push(pc)
            }
            await Promise.all([subscribe(hc), ...playerChs.current.map(subscribe)])
            hostRef.current.up = true
            if (hostRef.current.joined.size === players.length) startHostGame(offer)
          } else {
            const mine = supabase.channel(`xing-p-${offer.roomId}-${id}`)
            chans.current.push(mine)
            mine.on('broadcast', { event: 'snap' }, ({ payload }) => enqueue(payload as Snapshot))
            await Promise.all([subscribe(hc), subscribe(mine)])
          }
          await hc.track({ id })
          if (!isHost) {
            const msg: HostMsg = { type: 'join', from: id }
            // the host channel may still be settling; resend until the first snapshot arrives
            const send = () => {
              if (phaseRef.current === 'joining') void hc.send({ type: 'broadcast', event: 'msg', payload: msg })
            }
            send()
            for (const ms of [1000, 2500, 5000]) later(ms, send)
          } else if (players.length === 1) startHostGame(offer)
        } catch {
          retry()
        }
      }

      lobby.on('presence', { event: 'sync' }, () => {
        if (matched) return
        const state = lobby.presenceState() as Record<string, LobbyPlayer[]>
        const list = Object.values(state)
          .map((a) => a[0])
          .filter(Boolean)
          .sort((a, b) => a.t - b.t || a.id.localeCompare(b.id))
        setWaiting(list.length)
        if (list.length >= n && list[0].id === id) {
          const offer: MatchOffer = {
            roomId: crypto.randomUUID(),
            players: list.slice(0, n),
            config: { ...settingsRef.current.config, playerCount: n },
          }
          matched = true
          void lobby.send({ type: 'broadcast', event: 'match', payload: offer })
          void enterRoom(offer)
        }
      })
      lobby.on('broadcast', { event: 'match' }, ({ payload }) => {
        const offer = payload as MatchOffer
        if (!matched && offer.players.some((p) => p.id === id)) void enterRoom(offer)
      })
      subscribe(lobby)
        .then(() => lobby.track({ id, name: nameRef.current, t: joinedAt }))
        .catch(() => {
          if (gen === generation.current) {
            setEndMsg('Could not reach the game server. Check your connection and try again.')
            setPhaseBoth('ended')
          }
        })
    },
    [cleanup, enqueue, hostApply, hostReady, later, setMatch, setPhaseBoth, startHostGame],
  )

  // ------------------------------------------------------------------ actions

  const play = useCallback(
    (_seat: number, cardId: number) => {
      const m = matchRef.current
      if (!m || processing.current || pending.current || modalRef.current) return
      const me = m.config.view?.me ?? 0
      if (!canPlay(m.round, me, cardId)) return
      pending.current = true
      later(5000, () => (pending.current = false))
      if (me === 0) hostApply(0, cardId)
      else {
        const msg: HostMsg = { type: 'play', from: myId.current, cardId }
        void hostCh.current?.send({ type: 'broadcast', event: 'msg', payload: msg })
      }
    },
    [hostApply, later],
  )

  const continueRound = useCallback(() => {
    const m = matchRef.current
    if (!m || waitingNext) return
    setWaitingNext(true)
    if ((m.config.view?.me ?? 0) === 0) hostReady(0)
    else {
      const msg: HostMsg = { type: 'ready', from: myId.current }
      void hostCh.current?.send({ type: 'broadcast', event: 'msg', payload: msg })
    }
  }, [hostReady, waitingNext])

  return {
    phase,
    waiting,
    wantPlayers,
    endMsg,
    settings,
    setSettings,
    match,
    anim,
    banner,
    overlay,
    modal,
    setModal,
    waitingNext,
    search,
    leave,
    play,
    continueRound,
  }
}
