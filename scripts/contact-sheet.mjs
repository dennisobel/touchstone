// Tiles screenshots into one contact sheet for quick visual review.
// Usage: node scripts/contact-sheet.mjs <dir> <prefix> <out.png> [columns=6] [tileWidth=240]
import { chromium } from 'playwright-core'
import { readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const [dir, prefix, out, cols = '6', tile = '240'] = process.argv.slice(2)
const files = readdirSync(dir).filter((f) => f.startsWith(prefix) && f.endsWith('.png')).sort()
const html = `<!doctype html><body style="margin:0;background:#888;display:grid;grid-template-columns:repeat(${cols},${tile}px);gap:6px;padding:6px;font:11px sans-serif">${files
  .map((f) => `<figure style="margin:0"><img src="${pathToFileURL(resolve(join(dir, f)))}" style="width:${tile}px;display:block"><figcaption style="color:#fff">${f}</figcaption></figure>`)
  .join('')}</body>`
const exe = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--allow-file-access-from-files'] })
const page = await browser.newPage({ viewport: { width: Number(cols) * (Number(tile) + 6) + 6, height: 800 } })
const sheet = resolve(out.replace(/.png$/, '.html'))
writeFileSync(sheet, html)
await page.goto(pathToFileURL(sheet).href, { waitUntil: 'load' })
await page.waitForTimeout(300)
await page.screenshot({ path: out, fullPage: true })
await browser.close()
console.log(out, files.length, 'tiles')
