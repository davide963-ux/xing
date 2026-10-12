import { useEffect, useMemo, useState } from 'react'
import { TEXT_ENTRIES, clearOverride, currentText, cacheOverrides, getOverrides, setOverride, useTextsVersion } from '../i18n/texts'
import type { TextEntry } from '../i18n/texts'
import { fill, placeholdersOf } from '../i18n/tpl'
import type { Vars } from '../i18n/tpl'
import { checkAdmin, resetText, saveText } from './api'

const GROUPS: Record<string, string> = {
  landing: 'Faqja kryesore (landing)',
  auth: 'Hyrja / regjistrimi',
  setup: 'Menyja dhe cilësimet e lojës',
  game: 'Tavolina e lojës',
  ev: 'Historia e lëvizjeve',
  fx: 'Njoftimet gjatë lojës',
  results: 'Rezultatet dhe fituesi',
  online: 'Loja online',
  daily: 'Sfida e Ditës',
  profile: 'Profili',
  board: 'Top lojtarët',
  ach: 'Arritjet',
  rules: 'Rregullat',
  settingsModal: 'Dritarja e cilësimeve',
  common: 'Të përbashkëta',
  names: 'Emrat e kundërshtarëve',
}

const MAX = 1200

/** Example output of a template, for both values of yes/no variables. */
function previews(e: TextEntry, text: string): string[] {
  if (e.kind === 'text') return []
  const make = (flag: boolean): Vars =>
    Object.fromEntries(
      e.args.map((a) => [a, ['you', 'single'].includes(a) ? flag : /^(who|name|a|b|card)$/.test(a) ? (flag ? 'Ti' : 'Drita') : 3]),
    )
  const one = fill(text, make(false))
  const two = fill(text, make(true))
  return one === two ? [one] : [one, two]
}

export function AdminPage({ onExit }: { onExit: () => void }) {
  const [state, setState] = useState<'checking' | 'yes' | 'no'>('checking')
  useEffect(() => {
    let alive = true
    checkAdmin().then((ok) => alive && setState(ok ? 'yes' : 'no'))
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="admin">
      <header className="admin-top">
        <h1>Paneli i adminit · Tekstet e lojës</h1>
        <button className="btn sm" onClick={onExit}>
          ← Kthehu te loja
        </button>
      </header>
      {state === 'checking' && <p className="note">Po kontrollohet qasja…</p>}
      {state === 'no' && <p className="note warn">Nuk ke qasje në këtë faqe.</p>}
      {state === 'yes' && <Editor />}
    </div>
  )
}

function Editor() {
  useTextsVersion() // re-render after saves
  const [q, setQ] = useState('')
  const [onlyEdited, setOnlyEdited] = useState(false)
  const overrides = getOverrides()

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return TEXT_ENTRIES.filter((e) => {
      if (onlyEdited && !(e.key in overrides)) return false
      if (!needle) return true
      return e.key.toLowerCase().includes(needle) || e.default.toLowerCase().includes(needle) || (currentText(e.key) ?? '').toLowerCase().includes(needle)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, onlyEdited, Object.keys(overrides).join('|')])

  const grouped = useMemo(() => {
    const m = new Map<string, TextEntry[]>()
    for (const e of rows) {
      const g = e.key.split('.')[0]
      m.set(g, [...(m.get(g) ?? []), e])
    }
    return [...m.entries()]
  }, [rows])

  return (
    <>
      <p className="note">
        Ndrysho çdo fjali të lojës. Ndryshimet shfaqen për të gjithë lojtarët sapo i ruan (mund të duhet një rifreskim i faqes).
        Përdor <code>{'{emri}'}</code> për të futur vlera dhe <code>{'{kushti?A|B}'}</code> për dy trajta (p.sh. <code>{'{you?kape|kapi}'}</code>
        ). Mund të përdorësh <code>&lt;b&gt;…&lt;/b&gt;</code> për shkronja të trasha.
      </p>
      <div className="admin-tools">
        <input type="search" placeholder="Kërko (tekst ose çelës)…" value={q} onChange={(e) => setQ(e.target.value)} />
        <label className="check">
          <input type="checkbox" checked={onlyEdited} onChange={(e) => setOnlyEdited(e.target.checked)} />
          <span>Vetëm të ndryshuarat ({Object.keys(overrides).length})</span>
        </label>
      </div>
      {grouped.length === 0 && <p className="note">Asnjë tekst nuk u gjet.</p>}
      {grouped.map(([g, list]) => (
        <section key={g} className="admin-group">
          <h2>
            {GROUPS[g] ?? g} <small>{list.length}</small>
          </h2>
          {list.map((e) => (
            <Row key={e.key} entry={e} />
          ))}
        </section>
      ))}
    </>
  )
}

function Row({ entry }: { entry: TextEntry }) {
  const saved = currentText(entry.key) ?? entry.default
  const edited = entry.key in getOverrides()
  const [draft, setDraft] = useState(saved)
  const [status, setStatus] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  // keep the box in sync when the saved text changes elsewhere (reset, reload)
  useEffect(() => setDraft(saved), [saved])

  const unknown = entry.kind === 'tpl' ? placeholdersOf(draft).filter((p) => !entry.args.includes(p)) : []
  const dirty = draft !== saved
  const problem =
    draft.trim() === ''
      ? 'Teksti nuk mund të jetë bosh.'
      : draft.length > MAX
        ? `Teksti është shumë i gjatë (maksimumi ${MAX} shkronja).`
        : unknown.length
          ? `Ndryshore të panjohura: ${unknown.map((u) => `{${u}}`).join(', ')}. Lejohen: ${entry.args.map((a) => `{${a}}`).join(', ') || 'asnjë'}.`
          : null

  async function save() {
    if (problem || busy) return
    setBusy(true)
    setStatus(null)
    try {
      await saveText(entry.key, draft)
      setOverride(entry.key, draft)
      cacheOverrides()
      setStatus({ kind: 'ok', text: 'U ruajt ✓' })
    } catch (err) {
      setStatus({ kind: 'err', text: err instanceof Error && err.message.includes('not_admin') ? 'Nuk ke leje.' : 'Nuk u ruajt. Provo përsëri.' })
    } finally {
      setBusy(false)
    }
  }

  async function reset() {
    if (busy) return
    setBusy(true)
    setStatus(null)
    try {
      await resetText(entry.key)
      clearOverride(entry.key)
      cacheOverrides()
      setStatus({ kind: 'ok', text: 'U rikthye teksti fillestar ✓' })
    } catch {
      setStatus({ kind: 'err', text: 'Nuk u rikthye. Provo përsëri.' })
    } finally {
      setBusy(false)
    }
  }

  const ex = previews(entry, draft)
  const multiline = draft.length > 70 || draft.includes('\n')

  return (
    <div className={`admin-row ${edited ? 'edited' : ''}`}>
      <div className="admin-key">
        <code>{entry.key}</code>
        {edited && <span className="tag">ndryshuar</span>}
      </div>
      <textarea
        value={draft}
        rows={multiline ? Math.min(8, Math.ceil(draft.length / 60) + draft.split('\n').length - 1) : 1}
        maxLength={MAX + 200}
        onChange={(e) => {
          setDraft(e.target.value)
          setStatus(null)
        }}
        aria-label={entry.key}
      />
      {entry.args.length > 0 && (
        <div className="admin-vars">
          Ndryshore: {entry.args.map((a) => <code key={a}>{`{${a}}`}</code>)}
        </div>
      )}
      {ex.length > 0 && (
        <div className="admin-preview">
          Shembull: {ex.map((x, i) => <span key={i}>“{x}”</span>)}
        </div>
      )}
      {edited && <div className="admin-default">Fillimisht: “{entry.default}”</div>}
      {problem && dirty && <div className="admin-msg err">{problem}</div>}
      {status && <div className={`admin-msg ${status.kind}`}>{status.text}</div>}
      <div className="admin-actions">
        <button className="btn sm primary" onClick={save} disabled={!dirty || !!problem || busy}>
          Ruaj
        </button>
        {dirty && (
          <button className="btn sm" onClick={() => setDraft(saved)} disabled={busy}>
            Anulo
          </button>
        )}
        {edited && (
          <button className="btn sm" onClick={reset} disabled={busy}>
            Rikthe fillestarin
          </button>
        )}
      </div>
    </div>
  )
}
