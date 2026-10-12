import { useState } from 'react'
import { challengeNumber, timeToNext } from '../engine/daily'
import type { DailyResult } from '../engine/daily'
import { sq } from '../i18n/sq'
import { Icon } from './Icon'
import { Modal } from './Panels'

export const shareTextOf = (r: DailyResult): string =>
  sq.daily.shareText(challengeNumber(r.key), r.you, r.cpu, r.outcome, sq.daily.xingLine(r.xing10, r.xing20))

function ResultBody({ r }: { r: DailyResult }) {
  const [copied, setCopied] = useState(false)
  const text = shareTextOf(r)
  const t = timeToNext()

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked: WhatsApp button still works */
    }
  }

  return (
    <div className="daily-result">
      <p className={`daily-outcome ${r.outcome}`}>{sq.daily[r.outcome]}</p>
      <p className="big-score">
        <span className={r.outcome === 'win' ? 'hi' : ''}>{r.you}</span>
        <i>–</i>
        <span className={r.outcome === 'loss' ? 'hi' : ''}>{r.cpu}</span>
      </p>
      <p className="note">{sq.daily.xingLine(r.xing10, r.xing20)}</p>
      <pre className="share-preview">{text}</pre>
      <div className="row">
        <a className="btn primary" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer">
          {sq.daily.whatsapp}
        </a>
        <button className="btn" onClick={copy}>
          {copied ? sq.daily.copied : sq.daily.copy}
        </button>
      </div>
      <p className="note">{sq.daily.next(t.hours, t.minutes)}</p>
    </div>
  )
}

/** Card on the setup screen: play today's challenge, or see today's result. */
export function DailyCard({ dayKey, result, onPlay }: { dayKey: string; result: DailyResult | null; onPlay: () => void }) {
  return (
    <section className="daily-card">
      <h2>
        <Icon name="calendar" size={22} className="h-ico" /> {sq.daily.title(challengeNumber(dayKey))}
      </h2>
      {result ? (
        <>
          <p className="note">{sq.daily.yourResult}</p>
          <ResultBody r={result} />
        </>
      ) : (
        <>
          <p>{sq.daily.blurb}</p>
          <div className="row">
            <button className="btn primary big" onClick={onPlay}>
              {sq.daily.play}
            </button>
          </div>
        </>
      )}
    </section>
  )
}

/** Shown right after finishing the daily round. */
export function DailyResultModal({ result, onMenu }: { result: DailyResult; onMenu: () => void }) {
  return (
    <Modal title={sq.daily.title(challengeNumber(result.key))} onClose={onMenu}>
      <ResultBody r={result} />
      <div className="row">
        <button className="btn" onClick={onMenu}>
          {sq.daily.menu}
        </button>
      </div>
    </Modal>
  )
}
