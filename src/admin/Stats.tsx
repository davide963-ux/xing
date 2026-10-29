import './poster.css'
import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Icon, SuitRow } from '../ui/Icon'
import type { IconName } from '../ui/Icon'
import { fetchReport, totalGames } from './api'
import { DAYS, delta, rangeLabel } from './reportFormat'
import type { Period, Report } from './api'

const winRate = (p: Period) => (p.vs_computer_games ? Math.round((p.vs_computer_wins / p.vs_computer_games) * 100) : 0)

export function StatsTab() {
  const [offset, setOffset] = useState(0)
  const [res, setRes] = useState<{ state: 'loading' } | { state: 'error'; msg: string } | { state: 'ok'; data: Report }>({ state: 'loading' })
  const [names, setNames] = useState(true)
  const [saving, setSaving] = useState(false)
  const posterRef = useRef<HTMLDivElement>(null)

  const load = useCallback(() => {
    setRes({ state: 'loading' })
    fetchReport(offset)
      .then((data) => setRes({ state: 'ok', data }))
      .catch((e: Error) => setRes({ state: 'error', msg: e.message }))
  }, [offset])
  useEffect(load, [load])

  async function download() {
    if (!posterRef.current || res.state !== 'ok') return
    setSaving(true)
    try {
      const url = await toPng(posterRef.current, {
        pixelRatio: 1,
        width: 1080,
        height: 1350,
        cacheBust: true,
        style: { transform: 'none' },
      })
      const a = document.createElement('a')
      a.href = url
      a.download = `xing-raporti-javor-${res.data.days[0]?.day ?? 'java'}.png`
      a.click()
    } finally {
      setSaving(false)
    }
  }

  const range = res.state === 'ok' && res.data.days.length ? rangeLabel(res.data.days[0].day, res.data.days[6].day) : ''

  return (
    <div className="stats-tab">
      <div className="week-nav">
        <button className="btn sm" onClick={() => setOffset((o) => o - 1)} aria-label="Java e mëparshme">
          ◀
        </button>
        <div className="week-label">
          <b>{range || '…'}</b>
          <small>{offset === 0 ? 'Kjo javë (ende vazhdon)' : offset === -1 ? 'Java e kaluar' : `${-offset} javë më parë`}</small>
        </div>
        <button className="btn sm" onClick={() => setOffset((o) => Math.min(0, o + 1))} disabled={offset === 0} aria-label="Java tjetër">
          ▶
        </button>
        <button className="btn sm" onClick={load}>
          Rifresko
        </button>
      </div>

      {res.state === 'loading' && <p className="note">Po ngarkohen statistikat…</p>}
      {res.state === 'error' && <p className="note warn">Nuk u ngarkuan statistikat ({res.msg}).</p>}
      {res.state === 'ok' && (
        <>
          <PosterFrame>
            <WeeklyPoster ref={posterRef} report={res.data} showNames={names} />
          </PosterFrame>
          <div className="poster-actions">
            <label className="check">
              <input type="checkbox" checked={names} onChange={(e) => setNames(e.target.checked)} />
              <span>Shfaq emrat e lojtarëve në foto</span>
            </label>
            <button className="btn primary" onClick={download} disabled={saving}>
              {saving ? 'Po përgatitet…' : 'Shkarko foton (PNG 1080×1350)'}
            </button>
          </div>
          <p className="note">
            Foto është në formatin 4:5 për Instagram. Javët numërohen nga e hëna në të dielë (ora e Shqipërisë). Lojërat online
            numërohen vetëm kur të gjithë lojtarët raportojnë të njëjtin rezultat. Totali i lojtarëve të regjistruar: {res.data.totals.registered}{' '}
            · Lojra gjithsej: {res.data.totals.games}.
          </p>
        </>
      )}
    </div>
  )
}

/** Scales the 1080x1350 poster down to the width available on screen. */
function PosterFrame({ children }: { children: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.4)
  useLayoutEffect(() => {
    const el = wrap.current
    if (!el) return
    const fit = () => setScale(Math.min(1, el.clientWidth / 1080))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={wrap} className="poster-frame" style={{ height: 1350 * scale }}>
      <div className="poster-scaler" style={{ transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  )
}

const WeeklyPoster = forwardRef<HTMLDivElement, { report: Report; showNames: boolean }>(function WeeklyPoster({ report, showNames }, ref) {
  const { cur, prev, days, top } = report
  const total = totalGames(cur)
  const d = delta(total, totalGames(prev))
  const max = Math.max(1, ...days.map((x) => x.games))
  const best = days.findIndex((x) => x.games === max && max > 0)
  const first = days[0]?.day ?? report.start
  const last = days[6]?.day ?? report.end
  const podium = top.filter((t) => t.wins > 0).slice(0, 3)

  const tiles: { icon: IconName; value: number | string; label: string; sub: string }[] = [
    { icon: 'globe', value: cur.online_matches, label: 'Lojra online', sub: `2 lojtarë: ${cur.online_2p} · 3: ${cur.online_3p ?? 0} · 4: ${cur.online_4p}` },
    { icon: 'bot', value: cur.computer, label: 'Kundër kompjuterit', sub: cur.vs_computer_games ? `${winRate(cur)}% fitore të lojtarëve` : 'Ende asnjë lojë' },
    { icon: 'calendar', value: cur.daily, label: 'Sfida e Ditës', sub: `${cur.daily_players} lojtarë të ndryshëm` },
    { icon: 'spark', value: cur.xing10 + cur.xing20, label: 'Xing të bëra', sub: `${cur.xing20} me Jan (+20)` },
    { icon: 'users', value: cur.active_players, label: 'Lojtarë aktivë', sub: 'që luajtën këtë javë' },
    { icon: 'user', value: cur.new_players, label: 'Lojtarë të rinj', sub: 'u regjistruan këtë javë' },
  ]

  return (
    <div ref={ref} className="poster">
      <div className="poster-suits" aria-hidden>
        <Icon name="spade" size={150} />
        <Icon name="heart" size={120} />
        <Icon name="diamond" size={140} />
        <Icon name="club" size={130} />
      </div>

      <header className="p-head">
        <div>
          <div className="p-logo">XING</div>
          <SuitRow size={26} />
        </div>
        <div className="p-date">
          <span className="p-badge">RAPORTI JAVOR</span>
          <b>{rangeLabel(first, last)}</b>
        </div>
      </header>

      <section className="p-hero">
        <div className="p-big">{total}</div>
        <div className="p-bigl">LOJRA TË LUAJTURA KËTË JAVË</div>
        {d ? (
          <div className={`p-delta ${d.dir}`}>
            {d.dir === 'up' ? '▲' : d.dir === 'down' ? '▼' : '■'} {d.dir === 'flat' ? 'Njësoj si' : `${Math.abs(d.pct)}% ${d.dir === 'up' ? 'më shumë se' : 'më pak se'}`} java e kaluar
          </div>
        ) : (
          <div className="p-delta flat">{total > 0 ? 'Një javë e re plot lojë' : 'Java sapo nisi'}</div>
        )}
      </section>

      <section className="p-tiles">
        {tiles.map((t) => (
          <div className="p-tile" key={t.label}>
            <div className="p-ico">
              <Icon name={t.icon} size={36} />
            </div>
            <div className="p-tx">
              <b>{t.value}</b>
              <span>{t.label}</span>
              <small>{t.sub}</small>
            </div>
          </div>
        ))}
      </section>

      <section className="p-chart">
        <h3>Lojra çdo ditë</h3>
        <div className="p-bars">
          {days.map((x, i) => (
            <div className="p-barcol" key={x.day}>
              <span className="p-val">{x.games}</span>
              <div className={`p-bar ${i === best ? 'best' : ''}`} style={{ height: `${Math.max(6, (x.games / max) * 100)}%` }} />
              <span className="p-day">{DAYS[i]}</span>
            </div>
          ))}
        </div>
      </section>

      {showNames && podium.length > 0 && (
        <section className="p-podium">
          <h3>Lojtarët e javës</h3>
          <div className="p-places">
            {podium.map((t, i) => (
              <div className={`p-place r${i + 1}`} key={t.username}>
                <Icon name={i === 0 ? 'crown' : 'trophy'} size={34} />
                <b>{t.username}</b>
                <span>{t.online_wins > 0 ? `${t.online_wins} fitore online` : `${t.wins} fitore`}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="p-foot">
        <div className="p-url">luajxing.com</div>
        <span>Luaj Xing me nacut dhe cogat</span>
      </footer>
    </div>
  )
})
