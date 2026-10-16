import { useRef, useState } from 'react'
import { sq } from '../i18n/sq'
import { AdUnit } from './AdUnit'
import { Card } from './Card'
import { Icon } from './Icon'
import type { IconName } from './Icon'
import { RulesBody } from './Panels'

// Face-up cards for the hero: ace of spades, jack of diamonds, 10 of diamonds, 2 of clubs (the point cards).
const HERO_CARDS = [0, 36, 35, 40] // ids: S=0..12, H=13..25, D=26..38, C=39..51 (rank-1 offset)

export function Landing({ onPlay, onLogin }: { onPlay: () => void; onLogin: () => void }) {
  const l = sq.landing
  const stepsRef = useRef<HTMLElement>(null)
  const [rulesOpen, setRulesOpen] = useState(false)
  return (
    <div className="landing">
      <header className="lp-top">
        <div className="brand">XING</div>
        <button className="btn sm" onClick={onLogin}>
          {l.login}
        </button>
      </header>

      <AdUnit />

      <section className="lp-hero">
        <div className="lp-cards" aria-hidden>
          {HERO_CARDS.map((id, i) => (
            <Card key={id} id={id} className={`lp-card c${i}`} />
          ))}
        </div>
        <h1>{l.headline}</h1>
        <p className="lp-sub">{l.sub}</p>
        <div className="row">
          <button className="btn primary big" onClick={onPlay}>
            {l.play}
          </button>
          <button className="btn big" onClick={() => stepsRef.current?.scrollIntoView({ behavior: 'smooth' })}>
            {l.howTo}
          </button>
        </div>
      </section>

      <section className="lp-features">
        {l.features.map((f) => (
          <div className="lp-feature" key={f.title}>
            <div className="ico">
              <Icon name={f.icon as IconName} size={34} />
            </div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </section>

      <section className="lp-steps" ref={stepsRef}>
        <h2>{l.stepsTitle}</h2>
        <ol>
          {l.steps.map((s, i) => (
            <li key={s.title}>
              <span className="n">{i + 1}</span>
              <div>
                <b>{s.title}</b>
                <span>{s.text}</span>
              </div>
            </li>
          ))}
        </ol>
        <button className="linkbtn" onClick={() => setRulesOpen((v) => !v)}>
          {sq.rules.title} {rulesOpen ? '▲' : '▼'}
        </button>
        {rulesOpen && <RulesBody />}
      </section>

      <AdUnit lazy />

      <section className="lp-final">
        <h2>{l.finalTitle}</h2>
        <p>{l.finalText}</p>
        <button className="btn primary big" onClick={onPlay}>
          {l.play}
        </button>
        <div className="lp-domain">luajxing.com</div>
      </section>
    </div>
  )
}
