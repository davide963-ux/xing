import { describe, expect, it } from 'vitest'
import { ROOM_ALPHABET, codeFromHash, genRoomCode, isValidRoomCode, normalizeRoomCode, roomLink } from './roomCode'

describe('room codes', () => {
  it('generates 5-character codes from the readable alphabet', () => {
    for (let i = 0; i < 500; i++) {
      const c = genRoomCode()
      expect(c).toHaveLength(5)
      expect([...c].every((ch) => ROOM_ALPHABET.includes(ch))).toBe(true)
      expect(isValidRoomCode(c)).toBe(true)
    }
  })

  it('never uses look-alike characters', () => {
    for (const bad of ['0', 'O', '1', 'I', 'L']) expect(ROOM_ALPHABET.includes(bad)).toBe(false)
  })

  it('rarely repeats', () => {
    const seen = new Set(Array.from({ length: 2000 }, genRoomCode))
    expect(seen.size).toBeGreaterThan(1990)
  })

  it('normalizes typed codes', () => {
    expect(normalizeRoomCode(' k7m-2q ')).toBe('K7M2Q')
    expect(normalizeRoomCode('k7 m2q')).toBe('K7M2Q')
  })

  it('validates codes', () => {
    expect(isValidRoomCode('K7M2Q')).toBe(true)
    expect(isValidRoomCode('K7M2')).toBe(false)
    expect(isValidRoomCode('K7M2QQ')).toBe(false)
    expect(isValidRoomCode('K7M20')).toBe(false) // 0 is not in the alphabet
    expect(isValidRoomCode('k7m2q')).toBe(false) // must be normalized first
  })

  it('builds and reads join links', () => {
    expect(roomLink('K7M2Q')).toBe('https://luajxing.com/#room=K7M2Q')
    expect(codeFromHash('#room=k7m2q')).toBe('K7M2Q')
    expect(codeFromHash('#admin')).toBeNull()
    expect(codeFromHash('#room=')).toBeNull()
    expect(codeFromHash('#room=<script>')).toBeNull()
  })
})
