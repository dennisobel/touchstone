/** Deterministic 64-character hex string standing in for a SHA-256 fingerprint in sample data. */
export function fakeHash(seed: string) {
  let h1 = 0x811c9dc5
  let out = ''
  for (let round = 0; round < 8; round++) {
    for (let i = 0; i < seed.length; i++) {
      h1 ^= seed.charCodeAt(i) + round * 31
      h1 = Math.imul(h1, 0x01000193) >>> 0
    }
    out += h1.toString(16).padStart(8, '0')
  }
  return out
}

export const shortHash = (h: string) => `${h.slice(0, 8)}…${h.slice(-6)}`
