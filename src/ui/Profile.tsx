import { useEffect, useState } from 'react'
import { sq } from '../i18n/sq'
import { fetchLeaderboard, fetchMyStats } from '../stats/api'
import type { BoardRow, PlayerStats } from '../stats/api'
import { Badge } from './Icon'
import { Modal } from './Panels'

type Load<T> = { state: 'loading' } | { state: 'error' } | { state: 'ok'; data: T }

function useLoad<T>(fn: () => Promise<T>, deps: unknown[]): Load<T> {
  const [res, setRes] = useState<Load<T>>({ state: 'loading' })
  useEffect(() => {
    let alive = true
    setRes({ state: 'loading' })
    fn()
      .then((data) => alive && setRes({ state: 'ok', data }))
      .catch(() => alive && setRes({ state: 'error' }))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return res
}

export function ProfileModal({ onClose }: { onClose: () => void }) {
  const res = useLoad(fetchMyStats, [])
  const p = sq.profile
  return (
    <Modal title={p.title} onClose={onClose}>
      {res.state === 'loading' && <p className="note">{p.loading}</p>}
      {res.state === 'error' && <p className="note warn">{p.error}</p>}
      {res.state === 'ok' && !res.data && <p className="note">{p.empty}</p>}
      {res.state === 'ok' && res.data && <ProfileBody s={res.data} />}
    </Modal>
  )
}

function ProfileBody({ s }: { s: PlayerStats }) {
  const p = sq.profile
  const rate = s.games_played ? Math.round((s.wins / s.games_played) * 100) : 0
  const tiles: [string, string | number][] = [
    [p.stats.games, s.games_played],
    [p.stats.wins, s.wins],
    [p.stats.losses, s.losses],
    [p.stats.winRate, `${rate}%`],
    [p.stats.xings, s.xings],
    [p.stats.jackXings, s.jack_xings],
    [p.stats.streak, s.current_streak],
    [p.stats.bestStreak, s.best_streak],
    [p.stats.online, s.online_games],
    [p.stats.dailyPlayed, s.daily_played],
    [p.stats.dailyStreak, s.daily_streak],
  ]
  const ids = Object.keys(sq.ach)
  const got = new Set(s.achievements)
  return (
    <div className="profile">
      <h3 className="pname">{s.username}</h3>
      {s.online_games > 0 && (
        <p className="prating">
          {p.rating}: <b>{s.rating}</b>
        </p>
      )}
      <div className="stat-grid">
        {tiles.map(([label, value]) => (
          <div className="stat" key={label}>
            <b>{value}</b>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <h3>
        {p.achievements} <small>{p.unlocked(ids.filter((i) => got.has(i)).length, ids.length)}</small>
      </h3>
      <ul className="ach-grid">
        {ids.map((id) => (
          <li key={id} className={got.has(id) ? 'got' : 'locked'}>
            <Badge id={id} unlocked={got.has(id)} />
            <div>
              <b>{sq.ach[id].title}</b>
              <small>{sq.ach[id].text}</small>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function LeaderboardModal({ onClose }: { onClose: () => void }) {
  const [period, setPeriod] = useState<'week' | 'all'>('week')
  const res = useLoad(() => fetchLeaderboard(period), [period])
  const b = sq.board
  return (
    <Modal title={b.title} onClose={onClose}>
      <div className="tabs" role="tablist">
        {(['week', 'all'] as const).map((k) => (
          <button key={k} role="tab" aria-selected={period === k} className={period === k ? 'on' : ''} onClick={() => setPeriod(k)}>
            {b[k]}
          </button>
        ))}
      </div>
      {res.state === 'loading' && <p className="note">{b.loading}</p>}
      {res.state === 'error' && <p className="note warn">{b.error}</p>}
      {res.state === 'ok' && res.data.length === 0 && <p className="note">{b.empty}</p>}
      {res.state === 'ok' && res.data.length > 0 && <Board rows={res.data} />}
      <p className="note">{b.note}</p>
    </Modal>
  )
}

function Board({ rows }: { rows: BoardRow[] }) {
  const b = sq.board
  return (
    <table className="board-table">
      <thead>
        <tr>
          <th>#</th>
          <th>{b.player}</th>
          <th>{b.rating}</th>
          <th>{b.wins}</th>
          <th>{b.games}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.rank} className={r.is_me ? 'mine' : ''}>
            <td>{r.rank}</td>
            <td>
              {r.username} {r.is_me && <small>{b.you}</small>}
            </td>
            <td>{r.rating}</td>
            <td>{r.wins}</td>
            <td>{r.games}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
