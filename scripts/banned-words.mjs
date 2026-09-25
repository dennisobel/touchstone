// Rule R05 (promotional language) as a build check: fails if user-facing copy uses a banned phrase.
// The phrase list is the product's own (apps/web/src/data/compliance.ts, BANNED_PHRASES), so the check and the
// in-product rule never drift apart. Usage: npm run check:words
// A line that demonstrates R05 firing on purpose can be marked on the line above with
// "banned-words-ignore-next-line: <reason>" (as a // comment, or {/* */} inside JSX).
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = new URL('../apps/web/src/', import.meta.url)
const src = root.pathname.replace(/^\/([A-Za-z]:)/, '$1')

// Files that quote banned phrases on purpose: the rule definition, and sample escalations that show R05 firing.
const ALLOW = new Set(['data/compliance.ts'])

const compliance = readFileSync(join(src, 'data/compliance.ts'), 'utf8')
const list = compliance.match(/BANNED_PHRASES\s*=\s*\[([\s\S]*?)\]/)
if (!list) {
  console.error('Could not find BANNED_PHRASES in data/compliance.ts')
  process.exit(2)
}
const phrases = [...list[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
const patterns = phrases.map((p) => ({ p, re: new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '[\\s-]+')}\\b`, 'i') }))

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) yield* walk(full)
    else if (/\.(tsx?|mjs)$/.test(name)) yield full
  }
}

// Only string literals and JSX text count as copy; identifiers and comments do not.
const COPY = /'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`|>([^<>{}\n]+)</g

const hits = []
for (const file of walk(src)) {
  const rel = relative(src, file).replace(/\\/g, '/')
  if (ALLOW.has(rel)) continue
  const lines = readFileSync(file, 'utf8').split('\n')
  lines.forEach((line, i) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*') || trimmed.startsWith('{/*')) return
    if (i > 0 && lines[i - 1].includes('banned-words-ignore-next-line')) return
    for (const m of line.matchAll(COPY)) {
      const text = m[1] ?? m[0]
      for (const { p, re } of patterns) if (re.test(text)) hits.push({ rel, line: i + 1, p, text: text.trim().slice(0, 110) })
    }
  })
}

if (hits.length) {
  console.log(`Banned phrases found (rule R05): ${hits.length}`)
  for (const h of hits) console.log(`  ${h.rel}:${h.line}  "${h.p}"  ${h.text}`)
  process.exit(1)
}
console.log(`No banned phrases in user-facing copy (${phrases.length} phrases checked).`)
