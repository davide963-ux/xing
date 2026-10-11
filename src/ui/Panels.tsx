import { useState } from 'react'
import type { AiLevel } from '../engine/ai'
import type { GameConfig, MatchState, RoundScore } from '../engine/types'
import type { Settings } from './useGame'
import { teamName } from './format'

// ------------------------------------------------------------ settings form

export function SettingsForm({
  value,
  onChange,
}: {
  value: Settings
  onChange: (s: Settings) => void
}) {
  const { config } = value
  const setCfg = (patch: Partial<GameConfig>) => onChange({ ...value, config: { ...config, ...patch } })
  return (
    <div className="form">
      <fieldset>
        <legend>Mode</legend>
        <label className={`choice ${config.playerCount === 2 ? 'on' : ''}`}>
          <input type="radio" name="mode" checked={config.playerCount === 2} onChange={() => setCfg({ playerCount: 2 })} />
          <b>2 players</b>
          <span>You vs. the computer</span>
        </label>
        <label className={`choice ${config.playerCount === 4 ? 'on' : ''}`}>
          <input type="radio" name="mode" checked={config.playerCount === 4} onChange={() => setCfg({ playerCount: 4 })} />
          <b>4 players</b>
          <span>You &amp; Arben vs. Drita &amp; Ilir</span>
        </label>
      </fieldset>
      <fieldset>
        <legend>Play to</legend>
        {([51, 101] as const).map((t) => (
          <label key={t} className={`choice small ${config.targetScore === t ? 'on' : ''}`}>
            <input type="radio" name="target" checked={config.targetScore === t} onChange={() => setCfg({ targetScore: t })} />
            <b>{t} points</b>
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Rule variants</legend>
        <label className="check">
          <input
            type="checkbox"
            checked={config.rules.jackXing20}
            onChange={(e) => setCfg({ rules: { ...config.rules, jackXing20: e.target.checked } })}
          />
          <span>
            <b>Jack-on-jack Xing = 20 points</b>
            <small>A lone jack captured by another jack. When off it is an ordinary capture.</small>
          </span>
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={config.rules.allowFinalXing}
            onChange={(e) => setCfg({ rules: { ...config.rules, allowFinalXing: e.target.checked } })}
          />
          <span>
            <b>Allow Xing on the final card</b>
            <small>Off: the last card of the round never earns a Xing bonus.</small>
          </span>
        </label>
      </fieldset>
      <fieldset>
        <legend>Computer skill</legend>
        {(['normal', 'easy'] as AiLevel[]).map((l) => (
          <label key={l} className={`choice small ${value.aiLevel === l ? 'on' : ''}`}>
            <input type="radio" name="ai" checked={value.aiLevel === l} onChange={() => onChange({ ...value, aiLevel: l })} />
            <b>{l === 'normal' ? 'Normal' : 'Easy'}</b>
          </label>
        ))}
      </fieldset>
      <label className="check">
        <input type="checkbox" checked={value.sound} onChange={(e) => onChange({ ...value, sound: e.target.checked })} />
        <span>
          <b>Sound effects</b>
        </span>
      </label>
    </div>
  )
}

export function SetupScreen({
  settings,
  onChange,
  onStart,
  onRules,
}: {
  settings: Settings
  onChange: (s: Settings) => void
  onStart: () => void
  onRules: () => void
}) {
  return (
    <div className="setup">
      <div className="setup-card">
        <h1 className="logo">
          XING<span>♠ ♥ ♦ ♣</span>
        </h1>
        <p className="tagline">The Albanian card game of captures, jacks and the 10-point Xing.</p>
        <SettingsForm value={settings} onChange={onChange} />
        <div className="row">
          <button className="btn primary big" onClick={onStart}>
            Start match
          </button>
          <button className="btn" onClick={onRules}>
            How to play
          </button>
        </div>
      </div>
    </div>
  )
}

// ------------------------------------------------------------ modals

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="backdrop" onClick={onClose} role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <header>
          <h2>{title}</h2>
          <button className="icon" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Rules of Xing" onClose={onClose}>
      <div className="rules">
        <h3>Cards &amp; players</h3>
        <p>
          52 cards, no jokers. Only rank matters, never suit. Play 1 vs 1, or 2 vs 2 with partners sitting opposite
          each other (partners share captured cards and points).
        </p>
        <h3>Dealing</h3>
        <p>
          Four cards go to the middle (three face down, one face up – never a jack), then four to each player. The
          player to the dealer&rsquo;s right starts; play runs counterclockwise. When hands run out, four more are dealt
          to each player from the deck (nothing is added to the middle) until the deck is finished.
        </p>
        <h3>Your turn</h3>
        <ol>
          <li>Empty table: your card starts a new stack (even a jack).</li>
          <li>Same rank as the <b>top</b> card: you capture the whole stack, including your card.</li>
          <li>A jack captures any non-empty stack.</li>
          <li>Otherwise your card becomes the new top card.</li>
        </ol>
        <p>Only the top card counts – no adding values, no buried matches.</p>
        <h3>Xing bonuses</h3>
        <ul>
          <li>
            <b>Xing +10:</b> exactly one card on the table, captured with the same rank (not with a jack).
          </li>
          <li>
            <b>Jack Xing +20:</b> a single jack captured by another jack (can be switched off).
          </li>
          <li>The opening four-card stack never counts. By default the very last card of the round cannot Xing.</li>
        </ul>
        <h3>Scoring (16 points per round + Xings)</h3>
        <table className="mini">
          <tbody>
            <tr><td>Each ace / each jack</td><td>1</td></tr>
            <tr><td>10♦</td><td>3</td></tr>
            <tr><td>2♣</td><td>2</td></tr>
            <tr><td>Most cards captured (a 26–26 tie scores nobody)</td><td>3</td></tr>
            <tr><td>Xing / Jack Xing</td><td>10 / 20</td></tr>
          </tbody>
        </table>
        <p>
          Cards left on the table at the end go to the last player (team) who captured – without a bonus. The match is
          decided after a completed round: at the target score the higher total wins; equal totals mean another round.
        </p>
      </div>
    </Modal>
  )
}

export function SettingsModal({
  settings,
  onApply,
  onSound,
  onClose,
}: {
  settings: Settings
  onApply: (s: Settings) => void
  onSound: (on: boolean) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState(settings)
  const rulesChanged = JSON.stringify(draft.config) !== JSON.stringify(settings.config)
  return (
    <Modal title="Settings" onClose={onClose}>
      <SettingsForm
        value={draft}
        onChange={(s) => {
          setDraft(s)
          if (s.sound !== draft.sound) onSound(s.sound)
        }}
      />
      <div className="row">
        <button
          className="btn primary"
          onClick={() => {
            onApply(draft)
          }}
        >
          {rulesChanged ? 'Apply & restart match' : 'Save'}
        </button>
        <button className="btn" onClick={onClose}>
          Cancel
        </button>
      </div>
      {rulesChanged && <p className="note">Changing mode, target or rule variants starts a new match.</p>}
    </Modal>
  )
}

// ------------------------------------------------------------ results

const ROWS: { label: string; get: (t: RoundScore['teams'][0]) => string | number; hint?: string }[] = [
  { label: 'Cards captured', get: (t) => t.cards },
  { label: 'Aces', get: (t) => t.aces },
  { label: 'Jacks', get: (t) => t.jacks },
  { label: '10♦', get: (t) => t.tenDiamonds },
  { label: '2♣', get: (t) => t.twoClubs },
  { label: 'Most cards', get: (t) => t.majority },
  { label: 'Card points', get: (t) => t.cardPoints },
  { label: 'Xing × 10', get: (t) => (t.xing10Count ? `${t.xing10Count} × 10 = ${t.xing10Count * 10}` : 0) },
  { label: 'Jack Xing × 20', get: (t) => (t.xing20Count ? `${t.xing20Count} × 20 = ${t.xing20Count * 20}` : 0) },
  { label: 'Round total', get: (t) => t.total },
]

export function RoundResults({
  match,
  onContinue,
}: {
  match: MatchState
  onContinue: () => void
}) {
  const score = match.roundHistory[match.roundHistory.length - 1]
  const cfg = match.config
  const leftover = match.round.leftoverCount
  return (
    <div className="backdrop">
      <div className="modal results" role="dialog" aria-label="Round results">
        <header>
          <h2>Round {match.roundNumber} results</h2>
        </header>
        <div className="modal-body">
          <table className="breakdown">
            <thead>
              <tr>
                <th></th>
                {[0, 1].map((t) => (
                  <th key={t} className={t === 0 ? 'me' : 'them'}>
                    {teamName(cfg, t)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.label} className={r.label === 'Round total' ? 'sum' : r.label === 'Card points' ? 'sub' : ''}>
                  <td>{r.label}</td>
                  <td>{r.get(score.teams[0])}</td>
                  <td>{r.get(score.teams[1])}</td>
                </tr>
              ))}
              <tr className="match">
                <td>Match score ({cfg.targetScore})</td>
                <td>{match.scores[0]}</td>
                <td>{match.scores[1]}</td>
              </tr>
            </tbody>
          </table>
          {leftover > 0 && (
            <p className="note">{leftover} cards left on the table went to the last capturer (no bonus).</p>
          )}
          {match.tiedAtTarget && (
            <p className="note warn">Both sides reached {cfg.targetScore} with equal totals – another round decides it.</p>
          )}
          <div className="row">
            <button className="btn primary big" onClick={onContinue}>
              Next round
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function WinnerScreen({
  match,
  onAgain,
  onMenu,
}: {
  match: MatchState
  onAgain: () => void
  onMenu: () => void
}) {
  const cfg = match.config
  const w = match.winner!
  const humanWon = w === 0
  const score = match.roundHistory[match.roundHistory.length - 1]
  const xing = [0, 1].map((t) => match.roundHistory.reduce((a, r) => a + r.teams[t].xingPoints, 0))
  return (
    <div className="backdrop win">
      <div className="modal winner" role="dialog" aria-label="Match result">
        <div className="trophy">{humanWon ? '🏆' : '🃏'}</div>
        <h2>{humanWon ? 'You win!' : `${teamName(cfg, w)} win${cfg.playerCount === 2 ? 's' : ''}`}</h2>
        <p className="big-score">
          <span className={w === 0 ? 'hi' : ''}>{match.scores[0]}</span>
          <i>–</i>
          <span className={w === 1 ? 'hi' : ''}>{match.scores[1]}</span>
        </p>
        <p className="note">
          {teamName(cfg, 0)} vs. {teamName(cfg, 1)} · {match.roundHistory.length} round
          {match.roundHistory.length === 1 ? '' : 's'} · Xing points {xing[0]} – {xing[1]}
        </p>
        <details>
          <summary>Final round breakdown</summary>
          <table className="breakdown">
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.label}>
                  <td>{r.label}</td>
                  <td>{r.get(score.teams[0])}</td>
                  <td>{r.get(score.teams[1])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
        <div className="row">
          <button className="btn primary big" onClick={onAgain}>
            Play again
          </button>
          <button className="btn" onClick={onMenu}>
            Main menu
          </button>
        </div>
      </div>
    </div>
  )
}
