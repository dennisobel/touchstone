// Screenshot helper for visual QA with a locally installed Chrome (playwright-core, no browser download).
// Usage: node scripts/shot.mjs [--mobile] [--desktop] [--tablet] [--dark] [--full | --segments] [--wait=ms] /path:name [/path2:name2 ...]
// --segments scrolls and captures one viewport at a time (headless Chrome wraps full-page captures taller than ~8,000 px).
// --scroll=px scrolls first; --click="css|css" clicks each selector in turn (e.g. to open a menu or sheet) before capturing.
// Output: $SHOT_DIR or ./.shots
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const args = process.argv.slice(2)
const flags = new Set(args.filter((a) => a.startsWith('--') && !a.includes('=')))
const opt = Object.fromEntries(args.filter((a) => a.startsWith('--') && a.includes('=')).map((a) => [a.slice(2, a.indexOf('=')), a.slice(a.indexOf('=') + 1)]))
const targets = args.filter((a) => !a.startsWith('--'))
const base = process.env.SHOT_BASE ?? 'http://localhost:5173'
const out = process.env.SHOT_DIR ?? '.shots'
mkdirSync(out, { recursive: true })

const exe = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] })

const sizes = []
if (flags.has('--mobile') || (!flags.has('--desktop') && !flags.has('--tablet'))) sizes.push(['m', { width: 360, height: 800, deviceScaleFactor: 2, isMobile: true, hasTouch: true }])
if (flags.has('--tablet')) sizes.push(['t', { width: 820, height: 1180, deviceScaleFactor: 1 }])
if (flags.has('--desktop')) sizes.push(['d', { width: 1440, height: 900, deviceScaleFactor: 1 }])

const errors = []
for (const [tag, vp] of sizes) {
  const { width, height, ...rest } = vp
  const ctx = await browser.newContext({ viewport: { width, height }, ...rest, colorScheme: flags.has('--dark') ? 'dark' : 'light' })
  // SHOT_DEMO='{"investorPersona":"marcus"}' preloads persisted demo state (zustand persist format).
  await ctx.addInitScript(([dark, demo]) => {
    try {
      localStorage.setItem('ts-theme', dark ? 'dark' : 'light')
      if (demo) localStorage.setItem('ts-demo', JSON.stringify({ state: JSON.parse(demo), version: 1 }))
    } catch {}
  }, [flags.has('--dark'), process.env.SHOT_DEMO ?? ''])
  const page = await ctx.newPage()
  page.on('pageerror', (e) => errors.push(`${tag} ${page.url()}: ${e.message}`))
  page.on('console', (m) => m.type() === 'error' && errors.push(`${tag} console: ${m.text().slice(0, 300)}`))
  for (const t of targets) {
    const [path, name = path.replace(/[^a-z0-9]+/gi, '_')] = t.split(':')
    await page.goto(base + path, { waitUntil: 'networkidle' })
    await page.waitForTimeout(Number(opt.wait ?? 600))
    if (opt.scroll) {
      await page.evaluate((y) => window.scrollTo(0, y), Number(opt.scroll))
      await page.waitForTimeout(400)
    }
    for (const sel of (opt.click ?? '').split('|').filter(Boolean)) {
      await page.locator(sel).first().click()
      await page.waitForTimeout(500)
    }
    const suffix = `${tag}${flags.has('--dark') ? '-dark' : ''}`
    if (flags.has('--segments')) {
      const total = await page.evaluate(() => document.documentElement.scrollHeight)
      for (let y = 0, i = 0; y < total; y += height - 80, i++) {
        await page.evaluate((yy) => window.scrollTo(0, yy), y)
        await page.waitForTimeout(300)
        const file = join(out, `${name}-${suffix}-${String(i).padStart(2, '0')}.png`)
        await page.screenshot({ path: file })
        console.log(file)
      }
      continue
    }
    const file = join(out, `${name}-${suffix}.png`)
    await page.screenshot({ path: file, fullPage: flags.has('--full') })
    console.log(file)
  }
  await ctx.close()
}
await browser.close()
if (errors.length) console.log('ERRORS:\n' + [...new Set(errors)].join('\n'))
