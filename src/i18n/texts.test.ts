import { afterEach, describe, expect, it } from 'vitest'
import { sq } from './sq'
import { TEXT_ENTRIES, applyOverrides, clearOverride, currentText, getOverrides, isKnownKey, setOverride } from './texts'
import { fill, placeholdersOf } from './tpl'

afterEach(() => applyOverrides({}))

describe('template language', () => {
  it('fills variables, conditionals and plurals', () => {
    expect(fill('Raundi {n}', { n: 3 })).toBe('Raundi 3')
    expect(fill('{who} {you?kape|kapi} {n} {n=1?letër|letra}', { who: 'Ti', you: true, n: 5 })).toBe('Ti kape 5 letra')
    expect(fill('{who} {you?kape|kapi} {n} {n=1?letër|letra}', { who: 'Drita', you: false, n: 1 })).toBe('Drita kapi 1 letër')
  })
  it('supports nested placeholders in branches and missing variables', () => {
    expect(fill('te {you?ty|{who}}', { you: false, who: 'Arben' })).toBe('te Arben')
    expect(fill('te {you?ty|{who}}', { you: true, who: 'Arben' })).toBe('te ty')
    expect(fill('a {missing} b')).toBe('a  b')
    expect(fill('no braces here')).toBe('no braces here')
  })
  it('lists the variables a template uses', () => {
    expect(placeholdersOf('{who} {you?kape|kapi} {n} {n=1?a|b}').sort()).toEqual(['n', 'who', 'you'])
  })
})

describe('game wording', () => {
  it('uses the correct verb form for "Ti" (kape) and for others (kapi)', () => {
    expect(sq.fx.captured('Ti', true, 5)).toBe('Ti kape 5 letra')
    expect(sq.fx.captured('Drita', false, 5)).toBe('Drita kapi 5 letra')
    expect(sq.fx.xingSub('Ti', true)).toBe('Ti kape një letër të vetme')
    expect(sq.fx.jackXingSub('Ilir', false)).toContain('Ilir kapi')
    expect(sq.fx.lastCards('Ti', true)).toBe('Letrat e fundit shkojnë te ty')
    expect(sq.ev.tookStack('Ti', true, 'J♦', 2)).toBe('Ti more pirgun me J♦ dhe kape 2 letra')
  })
  it('keeps plural and singular right', () => {
    expect(sq.game.onTable(1)).toBe('letër në tavolinë')
    expect(sq.game.onTable(4)).toBe('letra në tavolinë')
    expect(sq.results.teamWins('Ti', true)).toBe('Ti fiton')
    expect(sq.results.teamWins('Drita & Ilir', false)).toBe('Drita & Ilir fitojnë')
  })
})

describe('editable texts', () => {
  it('has unique keys and every template only uses its declared variables', () => {
    expect(TEXT_ENTRIES.length).toBeGreaterThan(150)
    expect(new Set(TEXT_ENTRIES.map((e) => e.key)).size).toBe(TEXT_ENTRIES.length)
    for (const e of TEXT_ENTRIES.filter((x) => x.kind === 'tpl')) {
      const unknown = placeholdersOf(e.default).filter((p) => !e.args.includes(p))
      expect(unknown, e.key).toEqual([])
    }
  })

  it('does not expose the page meta or unknown keys', () => {
    expect(isKnownKey('meta.title')).toBe(false)
    expect(isKnownKey('game.round')).toBe(true)
    expect(isKnownKey('landing.features.0.title')).toBe(true)
    expect(isKnownKey('rules.sections.2.ol.1')).toBe(true)
  })

  it('applies and resets overrides on plain text, templates and array items', () => {
    const before = sq.landing.headline
    setOverride('landing.headline', 'LUAJ XING')
    setOverride('game.round', 'Ture {n}')
    setOverride('landing.features.0.title', 'Titull i ri')
    expect(sq.landing.headline).toBe('LUAJ XING')
    expect(sq.game.round(4)).toBe('Ture 4')
    expect(sq.landing.features[0].title).toBe('Titull i ri')
    expect(currentText('game.round')).toBe('Ture {n}')
    clearOverride('game.round')
    expect(sq.game.round(4)).toBe('Raundi 4')
    applyOverrides({})
    expect(sq.landing.headline).toBe(before)
    expect(sq.landing.features[0].title).toBe('Online me shokët')
    expect(getOverrides()).toEqual({})
  })

  it('ignores overrides for keys that do not exist', () => {
    applyOverrides({ 'nope.nothing': 'x', 'game.rules': 'Rregulla' })
    expect(getOverrides()).toEqual({ 'game.rules': 'Rregulla' })
  })
})
