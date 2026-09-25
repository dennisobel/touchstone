// Renders the Touchstone mark (a graphite touchstone with a gold streak on a laterite tile)
// into the PNG icons the PWA manifest and iOS need. No dependencies: signed-distance shapes
// are rasterised with anti-aliasing and encoded with a minimal PNG writer.
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'apps', 'web', 'public', 'icons')
mkdirSync(OUT, { recursive: true })

const LATERITE = [0xb4, 0x53, 0x2a]
const GRAPHITE = [0x0f, 0x14, 0x19]
const GOLD = [0xf2, 0xc0, 0x63]

const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}
const png = (size, rgba) => {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const sdRoundRect = (x, y, half, r) => {
  const qx = Math.abs(x) - half + r
  const qy = Math.abs(y) - half + r
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - r
}
const sdEllipse = (x, y, rx, ry, angle) => {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  const px = x * c + y * s
  const py = -x * s + y * c
  const k = Math.hypot(px / rx, py / ry)
  return (k - 1) * Math.min(rx, ry)
}
const sdSegment = (x, y, ax, ay, bx, by, r) => {
  const pax = x - ax
  const pay = y - ay
  const bax = bx - ax
  const bay = by - ay
  const h = Math.max(0, Math.min(1, (pax * bax + pay * bay) / (bax * bax + bay * bay)))
  return Math.hypot(pax - bax * h, pay - bay * h) - r
}

// Coordinates in a 32-unit design space, matching public/favicon.svg.
function render(size, { maskable = false, fullBleed = false } = {}) {
  const buf = Buffer.alloc(size * size * 4)
  const scale = 32 / size
  const inset = maskable ? 0.78 : 1 // maskable icons keep the mark inside the safe zone
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const x = (px + 0.5) * scale - 16
      const y = (py + 0.5) * scale - 16
      const aa = scale
      const cov = (d) => Math.max(0, Math.min(1, 0.5 - d / aa))
      let r = 0
      let g = 0
      let b = 0
      let a = 0
      const over = (col, alpha) => {
        r = r * (1 - alpha) + col[0] * alpha
        g = g * (1 - alpha) + col[1] * alpha
        b = b * (1 - alpha) + col[2] * alpha
        a = a + alpha * (1 - a)
      }
      const tile = maskable || fullBleed ? 1 : cov(sdRoundRect(x, y, 16, 8))
      over(LATERITE, tile)
      const mx = x / inset
      const my = (y - 1 * inset) / inset
      over(GRAPHITE, cov(sdEllipse(mx, my, 10, 7.5, (-18 * Math.PI) / 180) * inset) * tile)
      over(GOLD, cov(sdSegment(mx, my, -5.5, 2.5, 5.5, -3, 1.2) * inset) * tile)
      // r, g, b are premultiplied by a; store straight alpha.
      const i = (py * size + px) * 4
      if (a > 0) {
        buf[i] = Math.round(r / a)
        buf[i + 1] = Math.round(g / a)
        buf[i + 2] = Math.round(b / a)
        buf[i + 3] = Math.round(a * 255)
      }
    }
  }
  return png(size, buf)
}

writeFileSync(join(OUT, 'icon-192.png'), render(192))
writeFileSync(join(OUT, 'icon-512.png'), render(512))
writeFileSync(join(OUT, 'maskable-512.png'), render(512, { maskable: true }))
writeFileSync(join(OUT, 'apple-touch-icon.png'), render(180, { fullBleed: true }))
console.log('Icons written to', OUT)
