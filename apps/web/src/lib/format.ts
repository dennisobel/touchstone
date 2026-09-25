// Formatting rules from UI PRD §8: dates as "24 Sep 2026", times with zone, currency code
// before every amount, metric units with symbols.

export type Lang = 'en' | 'sw'

/** Demo "today" from the shared sample data. */
export const TODAY_ISO = '2026-09-24'
export const NOW = new Date(2026, 8, 24, 9, 30)

const MONTHS: Record<Lang, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  sw: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'],
}
const MONTHS_LONG: Record<Lang, string[]> = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  sw: ['Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'],
}

/** Parse "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm" as a local date without time-zone drift. */
export function parseDate(value: string | Date): Date {
  if (value instanceof Date) return value
  const [d, t] = value.split('T')
  const [y, m, day] = d.split('-').map(Number)
  const [hh, mm] = (t ?? '12:00').split(':').map(Number)
  return new Date(y, (m ?? 1) - 1, day ?? 1, hh ?? 12, mm ?? 0)
}

/** 24 Sep 2026 */
export function fmtDate(value: string | Date, lang: Lang = 'en') {
  const d = parseDate(value)
  return `${d.getDate()} ${MONTHS[lang][d.getMonth()]} ${d.getFullYear()}`
}

/** 24 Sep (omits the year) */
export function fmtDay(value: string | Date, lang: Lang = 'en') {
  const d = parseDate(value)
  return `${d.getDate()} ${MONTHS[lang][d.getMonth()]}`
}

/** 10 September 2026, used in screen-reader sentences */
export function fmtDateLong(value: string | Date, lang: Lang = 'en') {
  const d = parseDate(value)
  return `${d.getDate()} ${MONTHS_LONG[lang][d.getMonth()]} ${d.getFullYear()}`
}

export function fmtTime(value: string | Date) {
  const d = parseDate(value)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** 24 Sep 2026, 14:05 EAT */
export function fmtDateTime(value: string | Date, zone = 'EAT', lang: Lang = 'en') {
  return `${fmtDate(value, lang)}, ${fmtTime(value)} ${zone}`
}

const DAY_MS = 86_400_000

export function daysBetween(a: string | Date, b: string | Date) {
  const da = parseDate(a)
  const db = parseDate(b)
  const ua = Date.UTC(da.getFullYear(), da.getMonth(), da.getDate())
  const ub = Date.UTC(db.getFullYear(), db.getMonth(), db.getDate())
  return Math.round((ub - ua) / DAY_MS)
}

/** Days from demo-today until the date (negative when past). */
export function daysUntil(value: string | Date) {
  return daysBetween(NOW, value)
}

export function daysAgo(value: string | Date) {
  return daysBetween(value, NOW)
}

export function addDays(value: string | Date, days: number) {
  const d = parseDate(value)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days, d.getHours(), d.getMinutes())
}

export function toIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** "2 days ago", "today", "in 3 days" */
export function relativeDays(value: string | Date, lang: Lang = 'en') {
  const n = daysUntil(value)
  if (lang === 'sw') {
    if (n === 0) return 'leo'
    if (n === 1) return 'kesho'
    if (n === -1) return 'jana'
    return n > 0 ? `baada ya siku ${n}` : `siku ${-n} zilizopita`
  }
  if (n === 0) return 'today'
  if (n === 1) return 'tomorrow'
  if (n === -1) return 'yesterday'
  if (n > 0) return `in ${n} days`
  return `${-n} days ago`
}

export function fmtNumber(n: number, digits = 0) {
  return n.toLocaleString('en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

/** KES 12,500 · USD 1,200 */
export function money(currency: 'KES' | 'USD', amount: number, digits = 0) {
  return `${currency} ${fmtNumber(amount, digits)}`
}

/** USD 8–12 million */
export function moneyRangeMillions(currency: 'KES' | 'USD', lo: number, hi: number) {
  return `${currency} ${lo}–${hi} million`
}

export function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${Math.round(bytes / 1024)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`
}

export function initials(name: string) {
  const parts = name.replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, '').split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase()
}

export function plural(n: number, one: string, many: string) {
  return `${fmtNumber(n)} ${n === 1 ? one : many}`
}
