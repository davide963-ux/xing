import { useSyncExternalStore } from 'react'
import { sq } from './sq'
import type { Tpl } from './tpl'

/** One editable piece of text (a plain string or a template with variables). */
export interface TextEntry {
  key: string // e.g. "game.onTable" or "landing.features.0.title"
  kind: 'text' | 'tpl'
  default: string
  /** Variables available in a template (empty for plain text). */
  args: string[]
}

const SKIP_TOP = new Set(['meta']) // used outside React (index.html), not editable here

type Json = Record<string, unknown> | unknown[]

function isTpl(x: unknown): x is Tpl<unknown[]> {
  return typeof x === 'function' && typeof (x as { text?: unknown }).text === 'string'
}

function collect(node: unknown, path: string[], out: TextEntry[]) {
  if (typeof node === 'string') {
    out.push({ key: path.join('.'), kind: 'text', default: node, args: [] })
  } else if (isTpl(node)) {
    out.push({ key: path.join('.'), kind: 'tpl', default: node.text, args: node.names })
  } else if (Array.isArray(node)) {
    node.forEach((v, i) => collect(v, [...path, String(i)], out))
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (path.length === 0 && SKIP_TOP.has(k)) continue
      collect(v, [...path, k], out)
    }
  }
}

/** Every editable text with its original (built-in) wording. Captured once at start-up. */
export const TEXT_ENTRIES: TextEntry[] = (() => {
  const out: TextEntry[] = []
  collect(sq, [], out)
  return out
})()

const BY_KEY = new Map(TEXT_ENTRIES.map((e) => [e.key, e]))
export const isKnownKey = (key: string): boolean => BY_KEY.has(key)

function parentOf(key: string): { parent: Json; last: string } | null {
  const parts = key.split('.')
  let cur: unknown = sq
  for (const p of parts.slice(0, -1)) {
    if (cur === null || typeof cur !== 'object') return null
    cur = (cur as Record<string, unknown>)[p]
  }
  if (cur === null || typeof cur !== 'object') return null
  return { parent: cur as Json, last: parts[parts.length - 1] }
}

/** Current text of a key (override if any, otherwise the built-in wording). */
export function currentText(key: string): string | null {
  const loc = parentOf(key)
  if (!loc) return null
  const leaf = (loc.parent as Record<string, unknown>)[loc.last]
  if (typeof leaf === 'string') return leaf
  if (isTpl(leaf)) return leaf.text
  return null
}

function write(key: string, value: string): boolean {
  const loc = parentOf(key)
  if (!loc) return false
  const rec = loc.parent as Record<string, unknown>
  const leaf = rec[loc.last]
  if (typeof leaf === 'string') rec[loc.last] = value
  else if (isTpl(leaf)) leaf.text = value
  else return false
  return true
}

// ---------------------------------------------------------------- overrides

export type Overrides = Record<string, string>
let overrides: Overrides = {}
let version = 0
const listeners = new Set<() => void>()
const CACHE = 'xing.texts.v1'

const notify = () => {
  version++
  listeners.forEach((l) => l())
}

/** Replace all overrides: texts not in `next` go back to the built-in wording. */
export function applyOverrides(next: Overrides): void {
  for (const e of TEXT_ENTRIES) if (e.key in overrides) write(e.key, e.default)
  overrides = {}
  for (const [k, v] of Object.entries(next)) {
    if (isKnownKey(k) && typeof v === 'string' && write(k, v)) overrides[k] = v
  }
  notify()
}

export const getOverrides = (): Overrides => overrides

export function setOverride(key: string, value: string): void {
  applyOverrides({ ...overrides, [key]: value })
}
export function clearOverride(key: string): void {
  const { [key]: _removed, ...rest } = overrides
  void _removed
  applyOverrides(rest)
}

export function loadCachedOverrides(): void {
  try {
    const raw = localStorage.getItem(CACHE)
    if (raw) applyOverrides(JSON.parse(raw) as Overrides)
  } catch {
    /* ignore */
  }
}

export function cacheOverrides(): void {
  try {
    localStorage.setItem(CACHE, JSON.stringify(overrides))
  } catch {
    /* ignore */
  }
}

/** Re-render subscribers when texts change. */
export function useTextsVersion(): number {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => version,
  )
}
