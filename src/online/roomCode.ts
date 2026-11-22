/**
 * Codes for private rooms. 5 characters from an alphabet without look-alikes (no 0/O, 1/I/L),
 * so a code is easy to read out loud or type from a message: 31^5 = ~28 million combinations.
 */
export const ROOM_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
export const ROOM_CODE_LENGTH = 5
export const ROOM_CODE_RE = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{5}$/

export function genRoomCode(): string {
  const bytes = new Uint32Array(ROOM_CODE_LENGTH)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => ROOM_ALPHABET[b % ROOM_ALPHABET.length]).join('')
}

/** Upper-case a typed or pasted code and drop spaces, dashes and other separators. */
export const normalizeRoomCode = (input: string): string => input.toUpperCase().replace(/[^A-Z0-9]/g, '')

export const isValidRoomCode = (code: string): boolean => ROOM_CODE_RE.test(code)

/** Link that opens the game and joins the room once the player is signed in. */
export const roomLink = (code: string, origin: string = 'https://luajxing.com'): string => `${origin}/#room=${code}`

/** The code from a "#room=CODE" URL fragment, or null. */
export function codeFromHash(hash: string): string | null {
  const m = /^#room=([A-Za-z0-9 -]{1,12})$/.exec(hash)
  return m ? normalizeRoomCode(m[1]) : null
}
