import { useMemo } from 'react'
import { cardLabel } from './engine/cards'
import type { GameConfig, MatchState } from './engine/types'
import { Card } from './ui/Card'
import { RoundResults, RulesModal, SettingsModal, SetupScreen, WinnerScreen } from './ui/Panels'
import { describeEvent, posOf, seatName, teamName } from './ui/format'
import type { Pos } from './ui/format'
import { useGame } from './ui/useGame'
import type { Anim, Banner } from './ui/useGame'
import { teamOf } from './engine/engine'

export default function App() {
  const g = useGame()
  const { match, settings } = g

  return (
    <div className="app">
      {!match ? (
        <SetupScreen
          settings={settings}
          onChange={g.setSettings}
          onStart={() => g.startMatch(settings.config)}
          onRules={() => g.setModal('rules')}
        />
      ) : (
        <GameView g={g} match={match} />
      )}
      {g.modal === 'rules' && <RulesModal onClose={() => g.setModal(null)} />}
      {g.modal === 'settings' && (
        <SettingsModal
          settings={settings}
          onSound={(on) => g.setSettings({ ...settings, sound: on })}
          onApply={(s) => {
            const rulesChanged = JSON.stringify(s.config) !== JSON.stringify(settings.config)
            g.setSettings(s)
            if (rulesChanged) g.startMatch(s.config)
            else g.setModal(null)
          }}
          onClose={() => g.setModal(null)}
        />
      )}
    </div>
  )
}

function GameView({ g, match }: { g: ReturnType<typeof useGame>; match: MatchState }) {
  const { round, config } = match
  const n = config.playerCount
  const hiddenSet = useMemo(() => new Set(g.anim ? g.anim.hidden : round.hiddenOnTable), [g.anim, round.hiddenOnTable])
  const tableIds = g.anim ? g.anim.table : round.table
  const myTurn = round.phase === 'playing' && round.current === 0 && !g.anim && !g.overlay && !g.modal

  const seatsByPos = new Map<Pos, number>()
  for (let s = 0; s < n; s++) seatsByPos.set(posOf(config, s), s)

  return (
    <div className="game">
      <div className="board">
        <header className="topbar">
          <div className="brand">XING</div>
          <Scoreboard match={match} />
          <div className="controls">
            <button className="btn sm" onClick={() => g.setModal('rules')}>
              Rules
            </button>
            <button className="btn sm" onClick={() => g.setModal('settings')}>
              Settings
            </button>
            <button
              className="btn sm"
              onClick={() => {
                if (window.confirm('Restart the match? Current scores will be lost.')) g.startMatch(config)
              }}
            >
              Restart
            </button>
            <button
              className="btn sm"
              aria-pressed={g.settings.sound}
              onClick={() => g.setSettings({ ...g.settings, sound: !g.settings.sound })}
              title="Toggle sound"
            >
              {g.settings.sound ? '🔊' : '🔇'}
            </button>
          </div>
        </header>

        <div className={`felt n${n}`}>
          {(['top', 'left', 'right'] as Pos[]).map((pos) => {
            const seat = seatsByPos.get(pos)
            return seat === undefined ? null : (
              <Opponent key={pos} pos={pos} seat={seat} match={match} active={round.phase === 'playing' && round.current === seat} />
            )
          })}

          <div className="center">
            <div className="deckinfo">
              <div className="deckpile">
                <Card faceDown />
                <Card faceDown />
                <Card faceDown />
              </div>
              <div className="deckcount">
                <b>{round.deck.length}</b> in deck
              </div>
              <div className="dealer">Dealer: {seatName(config, round.dealer)}</div>
            </div>
            <Pile ids={tableIds} hidden={hiddenSet} anim={g.anim} config={config} />
            <TurnBanner g={g} match={match} />
          </div>

          <div className={`me ${myTurn ? 'active' : ''}`}>
            <div className="nameplate">
              <span className="dot" />
              {seatName(config, 0)} {n === 4 && <small>(with {seatName(config, 2)})</small>}
              {myTurn && <em>Your turn – pick a card</em>}
            </div>
            <div className="hand">
              {round.hands[0].map((id, i) => (
                <Card
                  key={id}
                  id={id}
                  className="deal"
                  style={{ ['--i' as string]: i }}
                  onClick={() => g.play(0, id)}
                  disabled={!myTurn}
                />
              ))}
            </div>
          </div>

          {g.banner && <BannerView b={g.banner} />}
        </div>
      </div>

      <aside className="history">
        <h3>Action history</h3>
        <ol>
          {[...round.events]
            .reverse()
            .slice(0, 30)
            .map((e) => {
              const d = describeEvent(config, e)
              return (
                <li key={e.seq} className={d.tone}>
                  {d.text}
                  {e.dealtAfter && <span className="deal-note">New cards dealt</span>}
                </li>
              )
            })}
          {round.events.length === 0 && <li className="muted">Round {match.roundNumber} begins…</li>}
        </ol>
      </aside>

      {g.overlay === 'round' && <RoundResults match={match} onContinue={g.continueRound} />}
      {g.overlay === 'winner' && match.winner !== null && (
        <WinnerScreen match={match} onAgain={() => g.startMatch(config)} onMenu={g.backToSetup} />
      )}
    </div>
  )
}

function Scoreboard({ match }: { match: MatchState }) {
  const { config, round } = match
  const turnTeam = round.phase === 'playing' ? teamOf(round.current) : -1
  return (
    <div className="scoreboard">
      {[0, 1].map((t) => {
        const past10 = match.roundHistory.reduce((a, r) => a + r.teams[t].xing10Count, 0) + round.xing10[t] * (match.roundCommitted ? 0 : 1)
        const past20 = match.roundHistory.reduce((a, r) => a + r.teams[t].xing20Count, 0) + round.xing20[t] * (match.roundCommitted ? 0 : 1)
        return (
          <div key={t} className={`team t${t} ${turnTeam === t ? 'turn' : ''}`}>
            <div className="tname">{teamName(config, t)}</div>
            <div className="tscore">{match.scores[t]}</div>
            <div className="tmeta">
              <span title="Cards captured this round">🂠 {round.captured[t].length}</span>
              <span title="Xing bonuses (×10 / ×20) this match">
                ✕ {past10}×10{config.rules.jackXing20 ? ` · ${past20}×20` : ''}
              </span>
            </div>
          </div>
        )
      })}
      <div className="roundinfo">
        Round {match.roundNumber}
        <br />
        <small>to {config.targetScore}</small>
      </div>
    </div>
  )
}

function Opponent({ pos, seat, match, active }: { pos: Pos; seat: number; match: MatchState; active: boolean }) {
  const { config, round } = match
  const count = round.hands[seat].length
  const partner = config.playerCount === 4 && teamOf(seat) === 0
  return (
    <div className={`opp ${pos} ${active ? 'active' : ''}`}>
      <div className="nameplate">
        <span className="dot" />
        {seatName(config, seat)} {partner && <small>(partner)</small>}
        <b className="count">{count}</b>
      </div>
      <div className="backs">
        {round.hands[seat].map((id, i) => (
          <Card key={id} faceDown className="deal" style={{ ['--i' as string]: i }} />
        ))}
      </div>
    </div>
  )
}

function Pile({ ids, hidden, anim, config }: { ids: number[]; hidden: Set<number>; anim: Anim | null; config: GameConfig }) {
  const shown = ids.slice(-6)
  const top = ids.length ? ids[ids.length - 1] : null
  const sweep = anim?.sweepTo != null ? `sweep-${posOf(config, anim.sweepTo)}` : ''
  return (
    <div className="pile-wrap">
      <div className={`pile ${sweep}`} aria-label="Central stack">
        {ids.length === 0 && <div className="empty-slot">Empty</div>}
        {shown.map((id, i) => {
          const isTop = i === shown.length - 1
          const flying = anim?.flyCard === id && anim.flyFrom !== null
          return (
            <Card
              key={id}
              id={id}
              faceDown={hidden.has(id)}
              className={`pilecard ${isTop ? 'top' : ''} ${flying ? `fly-${posOf(config, anim!.flyFrom!)}` : ''}`}
              style={{ ['--k' as string]: i }}
            />
          )
        })}
      </div>
      <div className="pileinfo">
        <b>{ids.length}</b> card{ids.length === 1 ? '' : 's'} on the table
        {top !== null && (
          <>
            {' · top '}
            <b>{cardLabel(top)}</b>
          </>
        )}
        {ids.length === 1 && <span className="xing-hint">Xing chance!</span>}
      </div>
    </div>
  )
}

function TurnBanner({ g, match }: { g: ReturnType<typeof useGame>; match: MatchState }) {
  const { round, config } = match
  if (round.phase !== 'playing') return <div className="turnline">Round over</div>
  const mine = round.current === 0
  return (
    <div className={`turnline ${mine ? 'mine' : ''}`}>
      {g.anim ? '…' : mine ? 'Your move' : `${seatName(config, round.current)} is thinking…`}
    </div>
  )
}

function BannerView({ b }: { b: Banner }) {
  return (
    <div className={`bannerfx ${b.kind}`} key={b.id} role="status">
      <div className="bt">{b.text}</div>
      {b.sub && <div className="bs">{b.sub}</div>}
      {b.kind === 'xing10' || b.kind === 'xing20' ? (
        <div className="sparks" aria-hidden>
          {Array.from({ length: 14 }, (_, i) => (
            <i key={i} style={{ ['--a' as string]: `${(i / 14) * 360}deg`, ['--d' as string]: `${i % 3}` }} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
