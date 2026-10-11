import { describe, expect, it } from 'vitest'
import { chooseCard, getPublicView } from './ai'
import { ALL_CARDS, cardById, seededRng } from './cards'
import {
  DEFAULT_CONFIG,
  allCardIds,
  commitRound,
  createRound,
  newMatch,
  nextRound,
  playCard,
  scoreRound,
  teamOf,
} from './engine'
import type { GameConfig, RoundState, Suit } from './types'

const cfg2: GameConfig = DEFAULT_CONFIG
const cfg4: GameConfig = { ...DEFAULT_CONFIG, playerCount: 4 }

const SUIT_INDEX: Record<Suit, number> = { S: 0, H: 1, D: 2, C: 3 }
/** Card id from rank (1=A, 11=J, ...) and suit. */
const c = (rank: number, suit: Suit = 'S'): number => SUIT_INDEX[suit] * 13 + rank - 1

/**
 * Build a custom round. Every card not mentioned is parked in team 1's captured pile so the
 * 52-card conservation invariant keeps holding.
 */
function custom(
  config: GameConfig,
  o: {
    hands: number[][]
    table?: number[]
    deck?: number[]
    current?: number
    captured0?: number[]
    lastCapturer?: number | null
  },
): RoundState {
  const base = createRound(config, 0, seededRng(1))
  const used = new Set([...o.hands.flat(), ...(o.table ?? []), ...(o.deck ?? []), ...(o.captured0 ?? [])])
  expect(used.size).toBe(
    o.hands.flat().length + (o.table ?? []).length + (o.deck ?? []).length + (o.captured0 ?? []).length,
  )
  const rest = ALL_CARDS.map((x) => x.id).filter((id) => !used.has(id))
  return {
    ...base,
    hands: o.hands,
    table: o.table ?? [],
    hiddenOnTable: [],
    deck: o.deck ?? [],
    captured: [o.captured0 ?? [], rest],
    current: o.current ?? 0,
    lastCapturer: o.lastCapturer ?? null,
    revealed: [],
    events: [],
    xing10: [0, 0],
    xing20: [0, 0],
  }
}

const expectConserved = (s: RoundState) => {
  const ids = allCardIds(s)
  expect(ids.length).toBe(52)
  expect(new Set(ids).size).toBe(52)
}

describe('dealing', () => {
  it('creates a legal initial layout for 2 and 4 players over many seeds', () => {
    for (const config of [cfg2, cfg4]) {
      for (let seed = 1; seed <= 400; seed++) {
        const s = createRound(config, seed % config.playerCount, seededRng(seed))
        expect(s.table.length).toBe(4)
        expect(s.hiddenOnTable).toEqual(s.table.slice(0, 3))
        expect(cardById(s.table[3]).rank).not.toBe(11)
        expect(s.hands.every((h) => h.length === 4)).toBe(true)
        expect(s.deck.length).toBe(52 - 4 - 4 * config.playerCount)
        expect(s.current).toBe((s.dealer + 1) % config.playerCount)
        expectConserved(s)
      }
    }
  })

  it('deals 4 more to everyone when all hands are empty, without touching the table', () => {
    for (const config of [cfg2, cfg4]) {
      let s = createRound(config, 0, seededRng(7))
      let deals = 0
      while (s.phase === 'playing') {
        const seat = s.current
        const before = s.table.length
        const { state, event } = playCard(s, seat, s.hands[seat][0])
        if (event.dealtAfter) {
          deals++
          expect(state.hands.every((h) => h.length === 4)).toBe(true)
          // the table is only changed by the play itself, not by dealing
          const expectedTable = event.kind === 'capture' ? 0 : before + 1
          expect(state.table.length).toBe(expectedTable)
        }
        expectConserved(state)
        s = state
      }
      // 2 players: 48/8 = 6 hands, so 5 re-deals; 4 players: 48/16 = 3 hands, so 2 re-deals
      expect(deals).toBe(config.playerCount === 2 ? 5 : 2)
      expect(s.deck.length).toBe(0)
      expect(s.hands.flat().length).toBe(0)
    }
  })
})

describe('playing and capturing', () => {
  it('rejects out-of-turn plays and cards not in hand', () => {
    const s = custom(cfg2, { hands: [[c(5)], [c(6)]], table: [c(9)] })
    expect(() => playCard(s, 1, c(6))).toThrow()
    expect(() => playCard(s, 0, c(6))).toThrow()
  })

  it('a card on an empty table starts a stack; a jack there stays', () => {
    const s = custom(cfg2, { hands: [[c(11), c(3)], [c(4), c(5)]] })
    const { state, event } = playCard(s, 0, c(11))
    expect(event.kind).toBe('start')
    expect(state.table).toEqual([c(11)])
    expect(state.captured[0].length).toBe(0)
    expect(state.lastCapturer).toBeNull()
  })

  it('matching the top card captures the whole stack, including the played card', () => {
    const s = custom(cfg2, { hands: [[c(8, 'H'), c(2)], [c(4), c(5)]], table: [c(3), c(9), c(8)] })
    const { state, event } = playCard(s, 0, c(8, 'H'))
    expect(event.kind).toBe('capture')
    expect(event.captureKind).toBe('match')
    expect(event.captured).toEqual([c(3), c(9), c(8), c(8, 'H')])
    expect(state.table).toEqual([])
    expect(state.captured[0].length).toBe(4)
    expect(state.lastCapturer).toBe(0)
  })

  it('only the top card matters: a buried match does not capture', () => {
    const s = custom(cfg2, { hands: [[c(8, 'H'), c(2)], [c(4), c(5)]], table: [c(8), c(9)] })
    const { state, event } = playCard(s, 0, c(8, 'H'))
    expect(event.kind).toBe('push')
    expect(state.table).toEqual([c(8), c(9), c(8, 'H')])
  })

  it('a jack captures any non-empty stack', () => {
    const s = custom(cfg2, { hands: [[c(11), c(2)], [c(4), c(5)]], table: [c(3), c(9)] })
    const { state, event } = playCard(s, 0, c(11))
    expect(event.captureKind).toBe('jack')
    expect(state.table).toEqual([])
    expect(state.captured[0]).toEqual([c(3), c(9), c(11)])
    expect(event.bonus).toBe(0)
  })

  it('the next player starts a fresh stack after a capture', () => {
    const s = custom(cfg2, { hands: [[c(8, 'H'), c(2)], [c(4), c(5)]], table: [c(3), c(8)] })
    const a = playCard(s, 0, c(8, 'H')).state
    const b = playCard(a, 1, c(4))
    expect(b.event.kind).toBe('start')
    expect(b.state.table).toEqual([c(4)])
  })
})

describe('Xing bonuses', () => {
  it('single card captured by the same rank = +10', () => {
    const s = custom(cfg2, { hands: [[c(8, 'H'), c(2)], [c(4), c(5)]], table: [c(8)] })
    const { state, event } = playCard(s, 0, c(8, 'H'))
    expect(event.bonus).toBe(10)
    expect(state.xing10).toEqual([1, 0])
  })

  it('8 above other cards captured by an 8 is an ordinary capture', () => {
    const s = custom(cfg2, { hands: [[c(8, 'H'), c(2)], [c(4), c(5)]], table: [c(3), c(8)] })
    expect(playCard(s, 0, c(8, 'H')).event.bonus).toBe(0)
  })

  it('single 8 captured with a jack is ordinary', () => {
    const s = custom(cfg2, { hands: [[c(11), c(2)], [c(4), c(5)]], table: [c(8)] })
    const { state, event } = playCard(s, 0, c(11))
    expect(event.kind).toBe('capture')
    expect(event.bonus).toBe(0)
    expect(state.xing10).toEqual([0, 0])
  })

  it('single jack captured with another jack = +20 when enabled', () => {
    const s = custom(cfg2, { hands: [[c(11, 'H'), c(2)], [c(4), c(5)]], table: [c(11)] })
    const { state, event } = playCard(s, 0, c(11, 'H'))
    expect(event.bonus).toBe(20)
    expect(state.xing20).toEqual([1, 0])
    expect(state.xing10).toEqual([0, 0])
  })

  it('jack-on-jack Xing is just a capture when the setting is off', () => {
    const config = { ...cfg2, rules: { ...cfg2.rules, jackXing20: false } }
    const s = custom(config, { hands: [[c(11, 'H'), c(2)], [c(4), c(5)]], table: [c(11)] })
    const { state, event } = playCard(s, 0, c(11, 'H'))
    expect(event.kind).toBe('capture')
    expect(event.bonus).toBe(0)
    expect(state.captured[0]).toEqual([c(11), c(11, 'H')])
  })

  it('the initial four-card stack never qualifies', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const s = createRound(cfg2, 0, seededRng(seed))
      const seat = s.current
      const top = cardById(s.table[3]).rank
      const match = s.hands[seat].find((id) => cardById(id).rank === top)
      if (match !== undefined) expect(playCard(s, seat, match).event.bonus).toBe(0)
    }
  })

  it('the final card of the round cannot Xing by default, but can when allowed', () => {
    const mk = (allowFinalXing: boolean) =>
      custom(
        { ...cfg2, rules: { ...cfg2.rules, allowFinalXing } },
        { hands: [[c(8, 'H')], []], table: [c(8)], deck: [] },
      )
    const off = playCard(mk(false), 0, c(8, 'H'))
    expect(off.event.isFinalCard).toBe(true)
    expect(off.event.kind).toBe('capture')
    expect(off.event.bonus).toBe(0)
    expect(off.state.phase).toBe('finished')
    const on = playCard(mk(true), 0, c(8, 'H'))
    expect(on.event.bonus).toBe(10)
    expect(on.state.xing10).toEqual([1, 0])
  })

  it('the final-card exception also covers the 20-point jack Xing', () => {
    const s = custom(cfg2, { hands: [[c(11, 'H')], []], table: [c(11)], deck: [] })
    expect(playCard(s, 0, c(11, 'H')).event.bonus).toBe(0)
  })

  it('a second-to-last card is not "final"', () => {
    const s = custom(cfg2, { hands: [[c(8, 'H')], [c(3)]], table: [c(8)], deck: [] })
    const { event } = playCard(s, 0, c(8, 'H'))
    expect(event.isFinalCard).toBe(false)
    expect(event.bonus).toBe(10)
  })
})

describe('end of round', () => {
  it('leftover table cards go to the last capturer without any bonus', () => {
    // seat 1 captured earlier; seat 0 then seat 1 push the final cards onto the table
    const s = custom(cfg2, {
      hands: [[c(5)], [c(6)]],
      table: [c(9)],
      deck: [],
      lastCapturer: 1,
    })
    const a = playCard(s, 0, c(5)).state
    const { state } = playCard(a, 1, c(6))
    expect(state.phase).toBe('finished')
    expect(state.table).toEqual([])
    expect(state.leftoverTo).toBe(1)
    expect(state.leftoverCount).toBe(3)
    expect(state.captured[1]).toEqual(expect.arrayContaining([c(9), c(5), c(6)]))
    expect(state.xing10).toEqual([0, 0])
    expectConserved(state)
  })

  it('leftovers are given to the last capturer team, in team mode too', () => {
    const s = custom(cfg4, {
      hands: [[c(5)], [c(6)], [c(7)], [c(9)]],
      table: [c(3)],
      deck: [],
      lastCapturer: 2,
    })
    let st = s
    for (let i = 0; i < 4; i++) st = playCard(st, st.current, st.hands[st.current][0]).state
    expect(st.leftoverTo).toBe(2)
    expect(st.captured[0]).toEqual(expect.arrayContaining([c(3), c(5), c(6), c(7), c(9)]))
  })
})

describe('scoring', () => {
  it('scores every category exactly', () => {
    const s = custom(cfg2, {
      hands: [[], []],
      captured0: [c(1, 'S'), c(1, 'H'), c(11, 'S'), c(10, 'D'), c(2, 'C'), c(13, 'S')],
    })
    const sc = scoreRound({ ...s, xing10: [2, 0], xing20: [1, 0], phase: 'finished' })
    const t0 = sc.teams[0]
    expect(t0.cards).toBe(6)
    expect(t0.aces).toBe(2)
    expect(t0.jacks).toBe(1)
    expect(t0.tenDiamonds).toBe(3)
    expect(t0.twoClubs).toBe(2)
    expect(t0.majority).toBe(0) // team 1 holds 46 cards
    expect(sc.teams[1].majority).toBe(3)
    expect(t0.xingPoints).toBe(40)
    expect(t0.total).toBe(2 + 1 + 3 + 2 + 40)
  })

  it('a 26-26 card split gives no majority bonus and 13 ordinary points', () => {
    const base = createRound(cfg2, 0, seededRng(3))
    const ids = ALL_CARDS.map((x) => x.id)
    const sc = scoreRound({
      ...base,
      hands: [[], []],
      deck: [],
      table: [],
      captured: [ids.slice(0, 26), ids.slice(26)],
      phase: 'finished',
    })
    expect(sc.teams[0].majority + sc.teams[1].majority).toBe(0)
    expect(sc.teams[0].total).toBe(4) // spades+hearts: 2 aces + 2 jacks
    expect(sc.teams[1].total).toBe(9) // diamonds+clubs: 2 aces + 2 jacks + 3 + 2
    expect(sc.teams[0].total + sc.teams[1].total).toBe(13)
  })

  it('credits captures and Xings to the capturing seat’s team (partners share)', () => {
    const s = custom(cfg4, {
      hands: [[c(2)], [c(3)], [c(8, 'H'), c(9)], [c(8, 'D'), c(4)]],
      table: [c(8)],
      current: 2,
    })
    const a = playCard(s, 2, c(8, 'H'))
    expect(teamOf(2)).toBe(0)
    expect(a.state.xing10).toEqual([1, 0])
    expect(a.state.captured[0]).toEqual([c(8), c(8, 'H')])
    const s2 = custom(cfg4, { hands: [[c(2)], [c(3)], [c(5)], [c(8, 'D'), c(4)]], table: [c(8)], current: 3 })
    const b = playCard(s2, 3, c(8, 'D'))
    expect(b.state.xing10).toEqual([0, 1])
    expect(b.state.captured[1].slice(-2)).toEqual([c(8), c(8, 'D')])
  })
})

describe('match flow', () => {
  const finishedWith = (scores: [number, number]) => {
    const m = newMatch(cfg2, seededRng(5), 0)
    const ids = ALL_CARDS.map((x) => x.id)
    return {
      ...m,
      scores,
      round: {
        ...m.round,
        hands: [[], []],
        deck: [],
        table: [],
        captured: [ids.slice(0, 26), ids.slice(26)], // round totals 4 and 9
        phase: 'finished' as const,
      },
    }
  }

  it('does not end the match before the target', () => {
    const m = commitRound(finishedWith([10, 10]))
    expect(m.scores).toEqual([14, 19])
    expect(m.winner).toBeNull()
  })

  it('a single team reaching the target wins', () => {
    expect(commitRound(finishedWith([97, 50])).winner).toBe(0)
    expect(commitRound(finishedWith([50, 92])).winner).toBe(1)
  })

  it('if both reach the target the higher total wins', () => {
    const m = commitRound(finishedWith([98, 95])) // 102 vs 104
    expect(m.scores).toEqual([102, 104])
    expect(m.winner).toBe(1)
  })

  it('equal totals at the target force another round', () => {
    const m = commitRound(finishedWith([97, 92])) // 101 vs 101
    expect(m.winner).toBeNull()
    expect(m.tiedAtTarget).toBe(true)
    const n = nextRound(m, seededRng(9))
    expect(n.roundNumber).toBe(2)
    expect(n.dealer).toBe(1)
    expect(n.round.phase).toBe('playing')
    expect(n.scores).toEqual([101, 101])
  })

  it('commits a round only once and supports the 51 target', () => {
    const m = { ...finishedWith([45, 0]), config: { ...cfg2, targetScore: 51 as const } }
    const done = commitRound(m)
    expect(done.scores[0]).toBe(49)
    expect(done.winner).toBeNull()
    expect(commitRound(done)).toBe(done)
  })
})

describe('full-game simulations', () => {
  it('conserves 52 cards and totals 16 (or 13 on a tie) ordinary points, in both modes', () => {
    for (const config of [cfg2, cfg4]) {
      for (let seed = 1; seed <= 60; seed++) {
        const rng = seededRng(seed * 31)
        let s = createRound(config, seed % config.playerCount, rng)
        let plays = 0
        while (s.phase === 'playing') {
          const seat = s.current
          s = playCard(s, seat, chooseCard(getPublicView(s, seat), rng)).state
          plays++
          expectConserved(s)
        }
        expect(plays).toBe(48)
        expect(s.table.length).toBe(s.lastCapturer === null ? s.table.length : 0)
        const sc = scoreRound(s)
        const ordinary = sc.teams[0].cardPoints + sc.teams[1].cardPoints
        expect(s.captured[0].length + s.captured[1].length).toBe(52)
        expect(ordinary).toBe(s.captured[0].length === s.captured[1].length ? 13 : 16)
      }
    }
  })
})

describe('AI information restrictions', () => {
  it('the public view contains no other hand, deck order or face-down table identity', () => {
    const s = createRound(cfg4, 0, seededRng(11))
    const v = getPublicView(s, 0)
    expect(v.hand).toEqual(s.hands[0])
    expect(v.table.slice(0, 3)).toEqual([null, null, null])
    expect(v.table[3]).toBe(s.table[3])
    expect(v.handSizes).toEqual([4, 4, 4, 4])
    expect(v.deckCount).toBe(s.deck.length)
    const json = JSON.stringify(v)
    expect(json).not.toContain('"deck"')
    expect(json).not.toContain('"hands"')
    // every revealed card is public: initially only the face-up top card
    expect(v.revealed).toEqual([s.table[3]])
  })

  it('decisions are identical when all hidden cards are rearranged', () => {
    for (let seed = 1; seed <= 150; seed++) {
      const config = seed % 2 ? cfg2 : cfg4
      const rng = seededRng(seed)
      let s = createRound(config, 0, rng)
      // advance a few moves to reach varied positions
      for (let i = 0; i < seed % 20 && s.phase === 'playing'; i++) {
        s = playCard(s, s.current, chooseCard(getPublicView(s, s.current), rng)).state
      }
      if (s.phase !== 'playing') continue
      const me = s.current
      // pool of everything hidden from `me`: other hands + deck + face-down table cards
      const hiddenTable = s.hiddenOnTable
      const slots: { get: () => number; set: (x: number) => void }[] = []
      s.hands.forEach((h, p) => {
        if (p === me) return
        h.forEach((_, i) => slots.push({ get: () => h[i], set: (x) => (h[i] = x) }))
      })
      s.deck.forEach((_, i) => slots.push({ get: () => s.deck[i], set: (x) => (s.deck[i] = x) }))
      const tableIdx = s.table.map((id, i) => (hiddenTable.includes(id) ? i : -1)).filter((i) => i >= 0)
      tableIdx.forEach((ti) => slots.push({ get: () => s.table[ti], set: (x) => (s.table[ti] = x) }))
      const values = slots.map((x) => x.get())
      const shuffled = values.slice().sort(() => rng() - 0.5)
      const t2 = structuredClone(s)
      // re-map: hidden table ids follow the move so they stay "hidden"
      const slots2: typeof slots = []
      t2.hands.forEach((h, p) => {
        if (p === me) return
        h.forEach((_, i) => slots2.push({ get: () => h[i], set: (x) => (h[i] = x) }))
      })
      t2.deck.forEach((_, i) => slots2.push({ get: () => t2.deck[i], set: (x) => (t2.deck[i] = x) }))
      tableIdx.forEach((ti) => slots2.push({ get: () => t2.table[ti], set: (x) => (t2.table[ti] = x) }))
      slots2.forEach((slot, i) => slot.set(shuffled[i]))
      t2.hiddenOnTable = tableIdx.map((i) => t2.table[i])

      const v1 = getPublicView(s, me)
      const v2 = getPublicView(t2, me)
      expect(v2).toEqual(v1)
      expect(chooseCard(v2, seededRng(99))).toBe(chooseCard(v1, seededRng(99)))
    }
  })

  it('always picks a card from its own hand', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const rng = seededRng(seed)
      const s = createRound(cfg2, 0, rng)
      for (const level of ['easy', 'normal'] as const) {
        expect(s.hands[s.current]).toContain(chooseCard(getPublicView(s, s.current), rng, level))
      }
    }
  })

  it('takes an available Xing and prefers a normal capture over spending a jack', () => {
    const rng = seededRng(2)
    const xing = custom(cfg2, { hands: [[c(3), c(8, 'H'), c(11)], [c(4), c(5)]], table: [c(8)] })
    xing.revealed = [c(8)]
    expect(chooseCard(getPublicView(xing, 0), rng)).toBe(c(8, 'H'))
    const cap = custom(cfg2, { hands: [[c(3), c(9, 'H'), c(11)], [c(4), c(5)]], table: [c(2), c(7), c(9)] })
    cap.revealed = [c(2), c(7), c(9)]
    expect(chooseCard(getPublicView(cap, 0), rng)).toBe(c(9, 'H'))
  })
})
