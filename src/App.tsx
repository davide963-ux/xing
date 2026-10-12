import { useMemo } from 'react'
import { cardLabel } from './engine/cards'
import type { GameConfig, MatchState } from './engine/types'
import { Card } from './ui/Card'
import { EndedScreen, LobbyScreen, RoundResults, RulesModal, SettingsModal, SetupScreen, WinnerScreen } from './ui/Panels'
import { describeEvent, meOf, posOf, seatName, teamName } from './ui/format'
import type { Pos } from './ui/format'
import { useGame } from './ui/useGame'
import type { Settings } from './ui/useGame'
import type { Anim, Banner } from './ui/playFx'
import { useOnline } from './online/useOnline'
import { teamOf } from './engine/engine'
import { AuthGate, displayName, signOut } from './auth/AuthGate'
import { sq } from './i18n/sq'

export default function App() {
  return (
    <AuthGate>
      {(session) => <Game user={displayName(session)} />}
    </AuthGate>
  )
}

export interface Ctl {
  match: MatchState | null
  anim: Anim | null
  banner: Banner | null
  overlay: 'round' | 'winner' | null
  modal: 'rules' | 'settings' | null
  setModal: (m: 'rules' | 'settings' | null) => void
  settings: Settings
  setSettings: (s: Settings) => void
  play: (seat: number, cardId: number) => void
  continueRound: () => void
  again: () => void
  leave: () => void
  online: boolean
  waitingNext: boolean
}

function Game({ user }: { user: string }) {
  const off = useGame()
  const on = useOnline(user, off.settings, off.setSettings)
  const { settings } = off

  const offline: Ctl = {
    ...off,
    again: () => off.startMatch(off.match?.config ?? settings.config),
    leave: off.backToSetup,
    online: false,
    waitingNext: false,
  }
  const online: Ctl = {
    ...on,
    again: () => on.search(on.wantPlayers),
    online: true,
  }
  const g = on.phase === 'playing' && on.match ? online : offline
  const { match } = g

  let screen
  if (on.phase === 'searching' || on.phase === 'joining') {
    screen = <LobbyScreen phase={on.phase} waiting={on.waiting} need={on.wantPlayers} onCancel={on.leave} />
  } else if (on.phase === 'ended') {
    screen = <EndedScreen message={on.endMsg} onRetry={() => on.search(on.wantPlayers)} onMenu={on.leave} />
  } else if (!match) {
    screen = (
      <SetupScreen
        settings={settings}
        onChange={off.setSettings}
        onStart={() => off.startMatch(settings.config)}
        onOnline={() => on.search(settings.config.playerCount)}
        onRules={() => off.setModal('rules')}
        user={user}
        onSignOut={() => void signOut()}
      />
    )
  } else {
    screen = <GameView g={g} match={match} user={user} />
  }

  return (
    <div className="app">
      {screen}
      {g.modal === 'rules' && <RulesModal onClose={() => g.setModal(null)} />}
      {g.modal === 'settings' && !g.online && (
        <SettingsModal
          settings={settings}
          onSound={(on) => off.setSettings({ ...settings, sound: on })}
          onApply={(s) => {
            const rulesChanged = JSON.stringify(s.config) !== JSON.stringify(settings.config)
            off.setSettings(s)
            if (rulesChanged) off.startMatch(s.config)
            else off.setModal(null)
          }}
          onClose={() => off.setModal(null)}
        />
      )}
    </div>
  )
}

function GameView({ g, match, user }: { g: Ctl; match: MatchState; user: string }) {
  const { round, config } = match
  const n = config.playerCount
  const hiddenSet = useMemo(() => new Set(g.anim ? g.anim.hidden : round.hiddenOnTable), [g.anim, round.hiddenOnTable])
  const tableIds = g.anim ? g.anim.table : round.table
  const me = meOf(config)
  const myTurn = round.phase === 'playing' && round.current === me && !g.anim && !g.overlay && !g.modal

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
              {sq.game.rules}
            </button>
            {!g.online && (
              <button className="btn sm" onClick={() => g.setModal('settings')}>
                {sq.game.settings}
              </button>
            )}
            <button
              className="btn sm"
              onClick={() => {
                if (g.online) {
                  if (window.confirm(sq.game.leaveConfirm)) g.leave()
                } else if (window.confirm(sq.game.restartConfirm)) g.again()
              }}
            >
              {g.online ? sq.game.leave : sq.game.restart}
            </button>
            <button
              className="btn sm"
              aria-pressed={g.settings.sound}
              onClick={() => g.setSettings({ ...g.settings, sound: !g.settings.sound })}
              title={sq.game.toggleSound}
            >
              {g.settings.sound ? '🔊' : '🔇'}
            </button>
            <button className="btn sm" onClick={() => void signOut()} title={sq.setup.signedIn(user)}>
              {sq.common.signOut}
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
                <b>{round.deck.length}</b> {sq.game.inDeck}
              </div>
              <div className="dealer">{sq.game.dealer(seatName(config, round.dealer))}</div>
            </div>
            <Pile ids={tableIds} hidden={hiddenSet} anim={g.anim} config={config} />
            <TurnBanner g={g} match={match} />
          </div>

          <div className={`me ${myTurn ? 'active' : ''}`}>
            <div className="nameplate">
              <span className="dot" />
              {seatName(config, me)} {n === 4 && <small>{sq.game.withPartner(seatName(config, (me + 2) % 4))}</small>}
              {myTurn && <em>{sq.game.yourTurnPick}</em>}
            </div>
            <div className="hand">
              {round.hands[me].map((id, i) => (
                <Card
                  key={id}
                  id={id}
                  className="deal"
                  style={{ ['--i' as string]: i }}
                  onClick={() => g.play(me, id)}
                  disabled={!myTurn}
                />
              ))}
            </div>
          </div>

          {g.banner && <BannerView b={g.banner} />}
        </div>
      </div>

      <aside className="history">
        <h3>{sq.game.history}</h3>
        <ol>
          {[...round.events]
            .reverse()
            .slice(0, 30)
            .map((e) => {
              const d = describeEvent(config, e)
              return (
                <li key={e.seq} className={d.tone}>
                  {d.text}
                  {e.dealtAfter && <span className="deal-note">{sq.game.dealtNote}</span>}
                </li>
              )
            })}
          {round.events.length === 0 && <li className="muted">{sq.game.roundBegins(match.roundNumber)}</li>}
        </ol>
      </aside>

      {g.overlay === 'round' && <RoundResults match={match} onContinue={g.continueRound} waiting={g.waitingNext} />}
      {g.overlay === 'winner' && match.winner !== null && (
        <WinnerScreen match={match} onAgain={g.again} onMenu={g.leave} />
      )}
    </div>
  )
}

function Scoreboard({ match }: { match: MatchState }) {
  const { config, round } = match
  const myTeam = meOf(config) % 2
  const turnTeam = round.phase === 'playing' ? teamOf(round.current) : -1
  return (
    <div className="scoreboard">
      {[0, 1].map((t) => {
        const past10 = match.roundHistory.reduce((a, r) => a + r.teams[t].xing10Count, 0) + round.xing10[t] * (match.roundCommitted ? 0 : 1)
        const past20 = match.roundHistory.reduce((a, r) => a + r.teams[t].xing20Count, 0) + round.xing20[t] * (match.roundCommitted ? 0 : 1)
        return (
          <div key={t} className={`team ${t === myTeam ? 't0' : 't1'} ${turnTeam === t ? 'turn' : ''}`}>
            <div className="tname">{teamName(config, t)}</div>
            <div className="tscore">{match.scores[t]}</div>
            <div className="tmeta">
              <span title={sq.game.cardsTaken}>🂠 {round.captured[t].length}</span>
              <span title={sq.game.xingTitle}>
                ✕ {past10}×10{config.rules.jackXing20 ? ` · ${past20}×20` : ''}
              </span>
            </div>
          </div>
        )
      })}
      <div className="roundinfo">
        {sq.game.round(match.roundNumber)}
        <br />
        <small>{sq.game.to(config.targetScore)}</small>
      </div>
    </div>
  )
}

function Opponent({ pos, seat, match, active }: { pos: Pos; seat: number; match: MatchState; active: boolean }) {
  const { config, round } = match
  const count = round.hands[seat].length
  const partner = config.playerCount === 4 && teamOf(seat) === meOf(config) % 2
  return (
    <div className={`opp ${pos} ${active ? 'active' : ''}`}>
      <div className="nameplate">
        <span className="dot" />
        {seatName(config, seat)} {partner && <small>{sq.game.partner}</small>}
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
      <div className={`pile ${sweep}`} aria-label={sq.game.centralStack}>
        {ids.length === 0 && <div className="empty-slot">{sq.game.empty}</div>}
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
        <b>{ids.length}</b> {sq.game.onTable(ids.length)}
        {top !== null && (
          <>
            {` · ${sq.game.top} `}
            <b>{cardLabel(top)}</b>
          </>
        )}
        {ids.length === 1 && <span className="xing-hint">{sq.game.xingChance}</span>}
      </div>
    </div>
  )
}

function TurnBanner({ g, match }: { g: Ctl; match: MatchState }) {
  const { round, config } = match
  if (round.phase !== 'playing') return <div className="turnline">{sq.game.roundOver}</div>
  const mine = round.current === meOf(config)
  return (
    <div className={`turnline ${mine ? 'mine' : ''}`}>
      {g.anim ? '…' : mine ? sq.game.yourMove : sq.game.thinking(seatName(config, round.current))}
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
