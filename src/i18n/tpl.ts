/**
 * Tiny template language so that every sentence of the game can be edited as plain text.
 *
 *   {name}            -> value of the variable
 *   {name?A|B}        -> A if the variable is truthy, otherwise B
 *   {name=1?A|B}      -> A if String(variable) equals "1", otherwise B   (used for singular/plural)
 *
 * A and B may contain further {…} placeholders. Missing variables render as empty text.
 */
export type Vars = Record<string, string | number | boolean | undefined>

/** Index of the "}" that closes the "{" at `open`, or -1. */
function closeOf(s: string, open: number): number {
  let depth = 0
  for (let i = open; i < s.length; i++) {
    if (s[i] === '{') depth++
    else if (s[i] === '}' && --depth === 0) return i
  }
  return -1
}

/** First index of `ch` outside any nested braces, or -1. */
function topLevel(s: string, ch: string): number {
  let depth = 0
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '{') depth++
    else if (s[i] === '}') depth--
    else if (depth === 0 && s[i] === ch) return i
  }
  return -1
}

export function fill(template: string, vars: Vars = {}): string {
  let out = ''
  let i = 0
  while (i < template.length) {
    const open = template.indexOf('{', i)
    if (open < 0) {
      out += template.slice(i)
      break
    }
    out += template.slice(i, open)
    const close = closeOf(template, open)
    if (close < 0) {
      out += template.slice(open) // unbalanced: keep as written
      break
    }
    const inner = template.slice(open + 1, close)
    const q = topLevel(inner, '?')
    if (q < 0) {
      out += String(vars[inner.trim()] ?? '')
    } else {
      const cond = inner.slice(0, q).trim()
      const rest = inner.slice(q + 1)
      const bar = topLevel(rest, '|')
      const a = bar < 0 ? rest : rest.slice(0, bar)
      const b = bar < 0 ? '' : rest.slice(bar + 1)
      const eq = cond.indexOf('=')
      const yes = eq < 0 ? Boolean(vars[cond]) : String(vars[cond.slice(0, eq).trim()]) === cond.slice(eq + 1).trim()
      out += fill(yes ? a : b, vars)
    }
    i = close + 1
  }
  return out
}

/** Names of all variables a template uses (for validation in the admin dashboard). */
export function placeholdersOf(template: string): string[] {
  const names = new Set<string>()
  const walk = (s: string) => {
    let i = 0
    while (i < s.length) {
      const open = s.indexOf('{', i)
      if (open < 0) return
      const close = closeOf(s, open)
      if (close < 0) return
      const inner = s.slice(open + 1, close)
      const q = topLevel(inner, '?')
      if (q < 0) names.add(inner.trim())
      else {
        const cond = inner.slice(0, q).trim()
        names.add(cond.split('=')[0].trim())
        walk(inner.slice(q + 1))
      }
      i = close + 1
    }
  }
  walk(template)
  return [...names]
}

export interface Tpl<A extends unknown[]> {
  (...args: A): string
  /** Current text (can be replaced by the admin dashboard). */
  text: string
  /** Names given to the positional arguments, in order. */
  names: string[]
}

/** A template with named positional arguments: `tpl<[number]>('Raundi {n}', ['n'])`. */
export function tpl<A extends unknown[]>(text: string, names: string[]): Tpl<A> {
  const fn = ((...args: A) => {
    const vars: Vars = {}
    names.forEach((n, i) => (vars[n] = args[i] as string | number | boolean))
    return fill(fn.text, vars)
  }) as Tpl<A>
  fn.text = text
  fn.names = names
  return fn
}
