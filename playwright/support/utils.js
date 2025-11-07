/**
 * Gera um ULID (Universally Unique Lexicographically Sortable Identifier)
 * Formato: 26 caracteres (10 timestamp + 16 random)
 */
export function generateULID() {
  const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ' // Crockford's Base32
  const ENCODING_LEN = ENCODING.length
  const TIME_MAX = Math.pow(2, 48) - 1
  const TIME_LEN = 10
  const RANDOM_LEN = 16

  function encodeTime(now, len) {
    if (now > TIME_MAX) {
      throw new Error('Time value is too large')
    }
    let str = ''
    for (let i = len; i > 0; i--) {
      const mod = now % ENCODING_LEN
      str = ENCODING.charAt(mod) + str
      now = (now - mod) / ENCODING_LEN
    }
    return str
  }

  function encodeRandom(len) {
    let str = ''
    for (let i = 0; i < len; i++) {
      const rand = Math.floor(Math.random() * ENCODING_LEN)
      str += ENCODING.charAt(rand)
    }
    return str
  }

  const now = Date.now()
  return encodeTime(now, TIME_LEN) + encodeRandom(RANDOM_LEN)
}
