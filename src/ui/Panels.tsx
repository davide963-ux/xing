import { useState } from 'react'
import type { AiLevel } from '../engine/ai'
import type { GameConfig, MatchState, RoundScore } from '../engine/types'
import { sq } from '../i18n/sq'
import { Icon, SuitRow } from './Icon'
import type { Settings } from './useGame'
import { meOf, teamName } from './format'

// ------------------------------------------------------------ settings form

export function SettingsForm({ value, onChange }: { value: Settings; onChange: (s: Settings) => void }) {
  const { config } = value
  const s = sq.setup
  const setCfg = (patch: Partial<GameConfig>) => onChange({ ...value, config: { ...config, ...patch } })
  return (
    <div className="form">
      <fieldset>
        <legend>{s.mode}</legend>
        <label className={`choice ${config.playerCount === 2 ? 'on' : ''}`}>
          <input type="radio" name="mode" checked={config.playerCount === 2} onChange={() => setCfg({ playerCount: 2 })} />
          <b>{sq.common.players2}</b>
          <span>{s.mode2}</span>
        </label>
        <label className={`choice ${config.playerCount === 4 ? 'on' : ''}`}>
          <input type="radio" name="mode" checked={config.playerCount === 4} onChange={() => setCfg({ playerCount: 4 })} />
          <b>{sq.common.players4}</b>
          <span>{s.mode4}</span>
        </label>
      </fieldset>
      <fieldset>
        <legend>{s.playTo}</legend>
        {([51, 101] as const).map((t) => (
          <label key={t} className={`choice small ${config.targetScore === t ? 'on' : ''}`}>
            <input type="radio" name="target" checked={config.targetScore === t} onChange={() => setCfg({ targetScore: t })} />
            <b>{s.points(t)}</b>
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>{s.variants}</legend>
        <label className="check">
          <input
            type="checkbox"
            checked={config.rules.jackXing20}
            onChange={(e) => setCfg({ rules: { ...config.rules, jackXing20: e.target.checked } })}
          />
          <span>
            <b>{s.jackXing}</b>
            <small>{s.jackXingHint}</small>
          </span>
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={config.rules.allowFinalXing}
            onChange={(e) => setCfg({ rules: { ...config.rules, allowFinalXing: e.target.checked } })}
          />
          <span>
            <b>{s.finalXing}</b>
            <small>{s.finalXingHint}</small>
          </span>
        </label>
      </fieldset>
      <fieldset>
        <legend>{s.skill}</legend>
        {(['normal', 'easy'] as AiLevel[]).map((l) => (
          <label key={l} className={`choice small ${value.aiLevel === l ? 'on' : ''}`}>
            <input type="radio" name="ai" checked={value.aiLevel === l} onChange={() => onChange({ ...value, aiLevel: l })} />
            <b>{l === 'normal' ? s.normal : s.easy}</b>
          </label>
        ))}
      </fieldset>
      <label className="check">
        <input type="checkbox" checked={value.sound} onChange={(e) => onChange({ ...value, sound: e.target.checked })} />
        <span>
          <b>{s.sound}</b>
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
  onOnline,
  onProfile,
  onBoard,
  user,
  onSignOut,
  extra,
}: {
  settings: Settings
  onChange: (s: Settings) => void
  onStart: () => void
  onRules: () => void
  onOnline: () => void
  onProfile: () => void
  onBoard: () => void
  user: string
  onSignOut: () => void
  extra?: React.ReactNode
}) {
  return (
    <div className="setup">
      <div className="setup-card">
        <h1 className="logo">
          XING<span><SuitRow /></span>
        </h1>
        <p className="tagline">{sq.setup.tagline}</p>
        <p className="whoami">
          {sq.setup.signedIn(user)} ·{' '}
          <button type="button" onClick={onSignOut}>
            {sq.common.signOut}
          </button>
        </p>
        <div className="row nav-row">
          <button className="btn" onClick={onProfile}>
            <Icon name="user" size={18} /> {sq.profile.menu}
          </button>
          <button className="btn" onClick={onBoard}>
            <Icon name="trophy" size={18} /> {sq.board.menu}
          </button>
        </div>
        {extra}
        <SettingsForm value={settings} onChange={onChange} />
        <div className="row">
          <button className="btn primary big online" onClick={onOnline}>
            {sq.setup.playOnline}
          </button>
          <button className="btn primary big" onClick={onStart}>
            {sq.setup.playComputer}
          </button>
          <button className="btn" onClick={onRules}>
            {sq.setup.rules}
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
          <button className="icon" onClick={onClose} aria-label={sq.common.close}>
            ✕
          </button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

/** Static, trusted strings from `sq` only (may contain <b>). */
const Rich = ({ html }: { html: string }) => <span dangerouslySetInnerHTML={{ __html: html }} />

export function RulesBody() {
  return (
    <div className="rules">
      {sq.rules.sections.map((sec) => (
        <section key={sec.h}>
          <h3>{sec.h}</h3>
          {'ol' in sec && sec.ol && (
            <ol>
              {sec.ol.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ol>
          )}
          {'ul' in sec && sec.ul && (
            <ul>
              {sec.ul.map((x) => (
                <li key={x}>
                  <Rich html={x} />
                </li>
              ))}
            </ul>
          )}
          {'table' in sec && sec.table && (
            <table className="mini">
              <tbody>
                {sec.table.map(([a, b]) => (
                  <tr key={a}>
                    <td>{a}</td>
                    <td>{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {sec.p?.map((x) => <p key={x}>{x}</p>)}
        </section>
      ))}
    </div>
  )
}

export function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title={sq.rules.title} onClose={onClose}>
      <RulesBody />
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
    <Modal title={sq.game.settings} onClose={onClose}>
      <SettingsForm
        value={draft}
        onChange={(s) => {
          setDraft(s)
          if (s.sound !== draft.sound) onSound(s.sound)
        }}
      />
      <div className="row">
        <button className="btn primary" onClick={() => onApply(draft)}>
          {rulesChanged ? sq.settingsModal.apply : sq.settingsModal.save}
        </button>
        <button className="btn" onClick={onClose}>
          {sq.common.cancel}
        </button>
      </div>
      {rulesChanged && <p className="note">{sq.settingsModal.note}</p>}
    </Modal>
  )
}

// ------------------------------------------------------------ results

const R = sq.results.rows
const ROWS: { label: string; get: (t: RoundScore['teams'][0]) => string | number; kind?: 'sub' | 'sum' }[] = [
  { label: R.cards, get: (t) => t.cards },
  { label: R.aces, get: (t) => t.aces },
  { label: R.jacks, get: (t) => t.jacks },
  { label: R.ten, get: (t) => t.tenDiamonds },
  { label: R.two, get: (t) => t.twoClubs },
  { label: R.majority, get: (t) => t.majority },
  { label: R.cardPoints, get: (t) => t.cardPoints, kind: 'sub' },
  { label: R.xing10, get: (t) => (t.xing10Count ? `${t.xing10Count} × 10 = ${t.xing10Count * 10}` : 0) },
  { label: R.xing20, get: (t) => (t.xing20Count ? `${t.xing20Count} × 20 = ${t.xing20Count * 20}` : 0) },
  { label: R.total, get: (t) => t.total, kind: 'sum' },
]

export function RoundResults({
  match,
  onContinue,
  waiting = false,
}: {
  match: MatchState
  onContinue: () => void
  waiting?: boolean
}) {
  const myTeam = meOf(match.config) % 2
  const score = match.roundHistory[match.roundHistory.length - 1]
  const cfg = match.config
  const leftover = match.round.leftoverCount
  return (
    <div className="backdrop">
      <div className="modal results" role="dialog" aria-label={sq.results.title(match.roundNumber)}>
        <header>
          <h2>{sq.results.title(match.roundNumber)}</h2>
        </header>
        <div className="modal-body">
          <table className="breakdown">
            <thead>
              <tr>
                <th></th>
                {[0, 1].map((t) => (
                  <th key={t} className={t === myTeam ? 'me' : 'them'}>
                    {teamName(cfg, t)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.label} className={r.kind ?? ''}>
                  <td>{r.label}</td>
                  <td>{r.get(score.teams[0])}</td>
                  <td>{r.get(score.teams[1])}</td>
                </tr>
              ))}
              <tr className="match">
                <td>{sq.results.match(cfg.targetScore)}</td>
                <td>{match.scores[0]}</td>
                <td>{match.scores[1]}</td>
              </tr>
            </tbody>
          </table>
          {leftover > 0 && <p className="note">{sq.results.leftover(leftover)}</p>}
          {match.tiedAtTarget && <p className="note warn">{sq.results.tie(cfg.targetScore)}</p>}
          <div className="row">
            <button className="btn primary big" onClick={onContinue} disabled={waiting}>
              {waiting ? sq.results.waiting : sq.results.next}
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
  const humanWon = w === meOf(cfg) % 2
  const score = match.roundHistory[match.roundHistory.length - 1]
  const xing = [0, 1].map((t) => match.roundHistory.reduce((a, r) => a + r.teams[t].xingPoints, 0))
  return (
    <div className="backdrop win">
      <div className="modal winner" role="dialog" aria-label={sq.results.win}>
        <div className={`trophy ${humanWon ? 'won' : 'lost'}`}>
          <Icon name={humanWon ? 'trophy' : 'cards'} size={96} />
        </div>
        <h2>{humanWon ? sq.results.win : sq.results.teamWins(teamName(cfg, w), cfg.playerCount === 2)}</h2>
        <p className="big-score">
          <span className={w === 0 ? 'hi' : ''}>{match.scores[0]}</span>
          <i>–</i>
          <span className={w === 1 ? 'hi' : ''}>{match.scores[1]}</span>
        </p>
        <p className="note">
          {sq.results.summary(teamName(cfg, 0), teamName(cfg, 1), match.roundHistory.length, xing[0], xing[1])}
        </p>
        <details>
          <summary>{sq.results.finalBreakdown}</summary>
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
            {sq.results.again}
          </button>
          <button className="btn" onClick={onMenu}>
            {sq.results.menu}
          </button>
        </div>
      </div>
    </div>
  )
}

// ------------------------------------------------------------ online screens

export function LobbyScreen({
  phase,
  waiting,
  need,
  onCancel,
}: {
  phase: 'searching' | 'joining'
  waiting: number
  need: number
  onCancel: () => void
}) {
  return (
    <div className="setup">
      <div className="setup-card lobby">
        <h1 className="logo">
          XING<span><SuitRow /></span>
        </h1>
        <div className="spinner" aria-hidden />
        <h2>{phase === 'joining' ? sq.online.found : sq.online.waiting}</h2>
        <p className="players-found">
          {Array.from({ length: need }, (_, i) => (
            <span key={i} className={`seatdot ${i < waiting || phase === 'joining' ? 'on' : ''}`} />
          ))}
        </p>
        <p className="note">
          {phase === 'joining' ? sq.online.connecting : sq.online.queue(Math.min(waiting, need), need)}
        </p>
        <div className="row">
          <button className="btn" onClick={onCancel}>
            {sq.common.cancel}
          </button>
        </div>
      </div>
    </div>
  )
}

export function EndedScreen({
  message,
  onRetry,
  onMenu,
}: {
  message: string | null
  onRetry: () => void
  onMenu: () => void
}) {
  return (
    <div className="setup">
      <div className="setup-card lobby">
        <h2>{message ?? sq.online.left}</h2>
        <div className="row">
          <button className="btn primary" onClick={onRetry}>
            {sq.online.another}
          </button>
          <button className="btn" onClick={onMenu}>
            {sq.results.menu}
          </button>
        </div>
      </div>
    </div>
  )
}
