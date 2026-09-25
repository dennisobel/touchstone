import { ArrowRight, ArrowUpRight, BookOpen, Building2, ChevronDown, ChevronRight, LayoutDashboard, LogIn, Menu as MenuIcon, Plus, Smartphone, type LucideIcon } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { cn } from '@/lib/cn'
import { useDemo } from '@/lib/store'
import { Contours } from '@/auth/AuthLayout'
import { Logo } from '@/ds/icons'
import { ThemeSwitch } from '@/ds/shell'
import { Popover, Sheet } from '@/ds/ui'

// X-03 · Public site. L0 only: nothing about any specific asset, deal or return; no investor sign-up; no testimonials.

export const SITE_NAV = [
  { to: '/#how', label: 'How it works' },
  { to: '/for/licence-holders', label: 'Licence holders' },
  { to: '/for/investors', label: 'Investors' },
  { to: '/for/experts', label: 'Experts' },
  { to: '/methodology', label: 'Methodology' },
  { to: '/about', label: 'About' },
]

export const APP_DOORS: { to: string; label: string; sub: string; icon: LucideIcon }[] = [
  { to: '/owner/sign-in', label: 'Owner App', sub: 'Licence holders and representatives', icon: Smartphone },
  { to: '/investor/sign-in', label: 'Investor Portal', sub: 'Invited investors and advisers', icon: Building2 },
  { to: '/expert/sign-in', label: 'Expert Desk', sub: 'Verification network', icon: BookOpen },
  { to: '/command/sign-in', label: 'Command Center', sub: 'SSD staff', icon: LayoutDashboard },
]

/** The three front doors a visitor can walk through from the public site. */
export const PATHS = [
  { to: '/owner/sign-up', icon: Smartphone, title: 'I hold a mining licence', body: 'Verify your licence and documents. Fixed fees, shown before you pay.' },
  { to: '/for/investors#talk', icon: Building2, title: 'I invest in mining', body: 'Talk to SSD about access to verified Mine Passports.' },
  { to: '/for/experts#apply', icon: BookOpen, title: "I'm a geologist, lawyer or ESG specialist", body: 'Apply to join the independent verification network.' },
]

function useScrollY() {
  const [y, setY] = useState(0)
  useEffect(() => {
    const on = () => setY(window.scrollY)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return y
}

/** Phone-only primary action per page, like a native app's bottom action bar. */
const STICKY: Record<string, { en: string; sw?: string; to?: string }> = {
  '/': { en: 'Get started' },
  '/for/licence-holders': { en: 'Start with your phone number', sw: 'Anza na namba yako ya simu', to: '/owner/sign-up' },
  '/for/investors': { en: 'Talk to SSD', to: '/for/investors#talk' },
  '/for/experts': { en: 'Apply to join the network', to: '/for/experts#apply' },
  '/methodology': { en: 'Get started' },
  '/about': { en: 'Get started' },
}

export default function SiteLayout() {
  const { pathname } = useLocation()
  const y = useScrollY()
  const lang = useDemo((s) => s.lang)
  const [menuOpen, setMenuOpen] = useState(false)
  const [startOpen, setStartOpen] = useState(false)
  const solid = y > 8
  const sticky = STICKY[pathname]
  useEffect(() => setMenuOpen(false), [pathname])

  return (
    <div data-density="comfortable" className="min-h-dvh overflow-x-clip bg-canvas text-body text-fg">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:shadow-e2">
        Skip to content
      </a>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 pt-safe transition-[background-color,border-color,color] duration-200',
          solid ? 'glass border-b border-line/60 text-fg' : 'border-b border-transparent text-white',
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:px-8">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Touchstone home">
            <Logo size={32} />
            <span className="leading-tight">
              <span className="block text-[15px] font-semibold">Touchstone</span>
              <span className={cn('block text-[11px]', solid ? 'text-muted' : 'text-white/60')}>by SSD</span>
            </span>
          </Link>
          <nav aria-label="Main" className="ml-6 hidden items-center gap-0.5 lg:flex">
            {SITE_NAV.map((n) =>
              n.to.includes('#') ? (
                <Link key={n.to} to={n.to} className={cn('rounded-full px-3 py-2 text-meta font-medium transition-colors', solid ? 'text-muted hover:bg-sunken hover:text-fg' : 'text-white/75 hover:bg-white/10 hover:text-white')}>
                  {n.label}
                </Link>
              ) : (
                <NavLink
                  key={n.to}
                  to={n.to}
                  viewTransition
                  className={({ isActive }) =>
                    cn(
                      'rounded-full px-3 py-2 text-meta font-medium transition-colors',
                      solid ? (isActive ? 'bg-sunken text-fg' : 'text-muted hover:bg-sunken hover:text-fg') : isActive ? 'bg-white/10 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white',
                    )
                  }
                >
                  {n.label}
                </NavLink>
              ),
            )}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <SignInMenu solid={solid} />
            <Link
              to="/owner/sign-up"
              viewTransition
              className={cn(
                'pressable hidden h-9 items-center rounded-full px-4 text-meta font-semibold transition-colors md:inline-flex',
                solid ? 'bg-primary text-on-primary hover:bg-primary-hover' : 'bg-white text-[#0F1419] hover:bg-white/90',
              )}
            >
              Verify my licence
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-haspopup="dialog"
              className={cn('pressable flex size-10 items-center justify-center rounded-full lg:hidden', solid ? 'hover:bg-sunken' : 'hover:bg-white/10')}
            >
              <MenuIcon className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <main id="main">
        <Outlet />
      </main>

      <SiteFooter padForSticky={!!sticky} />

      {sticky && (
        <div
          className={cn(
            'glass fixed inset-x-0 bottom-0 z-30 border-t border-line/70 px-4 pt-3 pb-[calc(12px+var(--safe-bottom))] transition-transform duration-200 md:hidden',
            y > 420 ? 'translate-y-0' : 'translate-y-full',
          )}
          aria-hidden={y <= 420}
        >
          {sticky.to ? (
            <Link to={sticky.to} viewTransition tabIndex={y > 420 ? 0 : -1} className="pressable flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[17px] font-semibold text-on-primary shadow-e1">
              {(lang === 'sw' && sticky.sw) || sticky.en}
              <ArrowRight className="size-5" aria-hidden />
            </Link>
          ) : (
            <button type="button" tabIndex={y > 420 ? 0 : -1} onClick={() => setStartOpen(true)} className="pressable flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[17px] font-semibold text-on-primary shadow-e1">
              {sticky.en}
              <ArrowRight className="size-5" aria-hidden />
            </button>
          )}
        </div>
      )}

      <Sheet open={menuOpen} onOpenChange={setMenuOpen} title="Menu" size="sm">
        <nav aria-label="Site" className="-mx-1">
          <ul>
            {SITE_NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} onClick={() => setMenuOpen(false)} className="pressable flex min-h-12 items-center justify-between rounded-lg px-3 text-[17px] font-medium text-fg hover:bg-sunken">
                  {n.label}
                  <ChevronRight className="size-5 text-muted" aria-hidden />
                </Link>
              </li>
            ))}
            <li>
              <Link to="/contact" onClick={() => setMenuOpen(false)} className="pressable flex min-h-12 items-center justify-between rounded-lg px-3 text-[17px] font-medium text-fg hover:bg-sunken">
                Contact
                <ChevronRight className="size-5 text-muted" aria-hidden />
              </Link>
            </li>
          </ul>
        </nav>
        <Link to="/owner/sign-up" className="pressable mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[17px] font-semibold text-on-primary">
          Verify my licence
        </Link>
        <Link to="/for/investors#talk" onClick={() => setMenuOpen(false)} className="pressable mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-line-strong text-[17px] font-medium text-fg">
          Talk to SSD
        </Link>
        <p className="mt-6 px-1 text-micro font-semibold uppercase tracking-wider text-muted">Sign in</p>
        <AppDoorList className="mt-2" />
        <div className="mt-6 flex items-center justify-between gap-3 px-1">
          <span className="text-meta text-muted">Theme</span>
          <ThemeSwitch />
        </div>
      </Sheet>

      <GetStartedSheet open={startOpen} onOpenChange={setStartOpen} />
    </div>
  )
}

function SignInMenu({ solid }: { solid: boolean }) {
  return (
    <Popover
      align="end"
      className="w-[300px] p-2"
      trigger={
        <button
          type="button"
          className={cn(
            'pressable hidden h-9 items-center gap-1.5 rounded-full border px-3.5 text-meta font-medium transition-colors sm:inline-flex',
            solid ? 'border-line-strong text-fg hover:bg-sunken' : 'border-white/25 text-white hover:bg-white/10',
          )}
        >
          <LogIn className="size-4" aria-hidden />
          Sign in
          <ChevronDown className="size-3.5 opacity-70" aria-hidden />
        </button>
      }
    >
      <p className="px-2 pt-1 pb-2 text-micro font-semibold text-muted">Sign in to</p>
      <AppDoorList compact />
    </Popover>
  )
}

export function AppDoorList({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <ul className={cn('space-y-1', className)}>
      {APP_DOORS.map((d) => (
        <li key={d.to}>
          <Link to={d.to} viewTransition className={cn('pressable flex items-center gap-3 rounded-lg hover:bg-sunken', compact ? 'p-2' : 'border border-line bg-surface p-3')}>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-tint text-primary">
              <d.icon className="size-[18px]" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-meta font-semibold text-fg">{d.label}</span>
              <span className="block truncate text-micro text-muted">{d.sub}</span>
            </span>
            <ChevronRight className="size-4 text-muted" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  )
}

/** "How can we help?" chooser, shaped like a native action sheet on phones. */
export function GetStartedSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="How can we help?" description="Choose the door that fits you." desktop="center" size="sm">
      <ul className="space-y-2">
        {PATHS.map((p) => (
          <li key={p.to}>
            <Link to={p.to} viewTransition onClick={() => onOpenChange(false)} className="pressable flex items-center gap-3 rounded-xl border border-line bg-surface p-4 hover:border-line-strong">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-tint text-primary">
                <p.icon className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-body font-semibold text-fg">{p.title}</span>
                <span className="block text-meta text-muted">{p.body}</span>
              </span>
              <ChevronRight className="size-5 text-muted" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-center text-meta text-muted">
        Already have an account?{' '}
        <Link to="/owner/sign-in" onClick={() => onOpenChange(false)} className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </Sheet>
  )
}

function SiteFooter({ padForSticky }: { padForSticky: boolean }) {
  const cols: { title: string; links: { to: string; label: string }[] }[] = [
    {
      title: 'Product',
      links: [
        { to: '/#how', label: 'How it works' },
        { to: '/#passport', label: 'The Mine Passport' },
        { to: '/#tiers', label: 'Verification tiers' },
        { to: '/methodology', label: 'Methodology' },
      ],
    },
    {
      title: "Who it's for",
      links: [
        { to: '/for/licence-holders', label: 'Licence holders' },
        { to: '/for/investors', label: 'Investors and advisers' },
        { to: '/for/experts', label: 'Experts and field verifiers' },
      ],
    },
    {
      title: 'Company',
      links: [
        { to: '/about', label: 'About SSD' },
        { to: '/contact', label: 'Contact' },
        { to: '/contact?topic=press', label: 'Press and partners' },
      ],
    },
    { title: 'Sign in', links: APP_DOORS.map((d) => ({ to: d.to, label: d.label })) },
  ]
  return (
    <footer className={cn('border-t border-line bg-surface', padForSticky && 'max-md:pb-24')}>
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2.5" aria-label="Touchstone home">
              <Logo size={32} />
              <span className="text-[15px] font-semibold">Touchstone</span>
            </Link>
            <p className="mt-3 max-w-xs text-meta text-muted">Evidence-backed Mine Passports for East African mining assets, operated by SSD.</p>
            <p className="mt-3 text-micro text-muted">Nairobi · Houston · Washington DC</p>
            <ThemeSwitch className="mt-5" />
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <p className="text-micro font-semibold uppercase tracking-wider text-muted">{c.title}</p>
              <ul className="mt-3 space-y-1">
                {c.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="inline-flex min-h-9 items-center text-meta text-fg hover:text-primary hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 space-y-3 border-t border-line pt-6 text-micro text-muted">
          <p className="max-w-4xl">
            SSD verifies facts and publishes evidence quality. It does not give investment advice, rate or value assets, negotiate terms or hold investor money, and it takes no fee tied to a transaction. Nothing on this site is an offer to sell, or a solicitation of an offer to buy, any security. A Mine
            Passport describes what was checked, by whom and when; it is not a recommendation.
          </p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>© 2026 SSD</span>
            <Link to="/contact?topic=privacy" className="hover:text-fg">
              Privacy · Kenya Data Protection Act 2019
            </Link>
            <Link to="/contact" className="hover:text-fg">
              Terms
            </Link>
            <Link to="/apps" className="inline-flex items-center gap-1 hover:text-fg">
              Prototype: all apps <ArrowUpRight className="size-3" aria-hidden />
            </Link>
            <span className="rounded-full border border-dashed border-brand/50 px-2 py-0.5 text-[11px] text-brand">Prototype · fictional sample data</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

/* ——— Shared page parts ——— */

export function Hero({
  eyebrow,
  title,
  sub,
  actions,
  aside,
  note,
  top,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  sub?: ReactNode
  actions?: ReactNode
  aside?: ReactNode
  note?: ReactNode
  top?: ReactNode
}) {
  return (
    <section className="relative isolate overflow-hidden bg-[#0F1419] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_88%_8%,rgba(180,83,42,0.38),transparent_42%),radial-gradient(circle_at_6%_100%,rgba(31,78,140,0.5),transparent_52%)]" aria-hidden />
      <Contours className="absolute inset-0 -z-10 h-full w-full text-white/20" />
      <div
        className={cn(
          'mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 pb-16 pt-[calc(104px+var(--safe-top))] md:px-8 md:pb-24 md:pt-[calc(136px+var(--safe-top))]',
          aside && 'lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-center',
        )}
      >
        <div className="min-w-0 animate-rise-in">
          {top}
          {eyebrow && (
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-micro font-medium text-white/80">
              <span className="size-1.5 rounded-full bg-[#E08A62]" aria-hidden />
              {eyebrow}
            </p>
          )}
          <h1 className="mt-5 max-w-3xl font-serif text-[36px] leading-[42px] font-semibold tracking-tight text-balance sm:text-[46px] sm:leading-[52px] lg:text-[58px] lg:leading-[64px]">{title}</h1>
          {sub && <p className="mt-5 max-w-2xl text-[17px] leading-[27px] text-white/75 md:text-[19px] md:leading-[30px]">{sub}</p>}
          {actions && <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">{actions}</div>}
          {note && <div className="mt-6 text-meta text-white/60">{note}</div>}
        </div>
        {aside && <div className="relative min-w-0">{aside}</div>}
      </div>
    </section>
  )
}

/** Buttons for the dark hero and CTA bands. */
export function HeroLink({ to, children, variant = 'light', icon }: { to: string; children: ReactNode; variant?: 'light' | 'outline'; icon?: ReactNode }) {
  return (
    <Link
      to={to}
      viewTransition
      className={cn(
        'pressable inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-[17px] font-semibold transition-colors [&_svg]:size-5',
        variant === 'light' ? 'bg-white text-[#0F1419] shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:bg-white/90' : 'border border-white/25 text-white hover:bg-white/10',
      )}
    >
      {children}
      {icon ?? (variant === 'light' ? <ArrowRight aria-hidden /> : null)}
    </Link>
  )
}

export function Section({ id, children, className, tone = 'canvas', labelledBy }: { id?: string; children: ReactNode; className?: string; tone?: 'canvas' | 'surface'; labelledBy?: string }) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn('scroll-mt-20 py-16 md:py-24', tone === 'surface' && 'border-y border-line bg-surface', className)}>
      <div className="mx-auto max-w-7xl px-4 md:px-8">{children}</div>
    </section>
  )
}

export function SectionHeading({ eyebrow, title, sub, align = 'left', className, id }: { eyebrow?: ReactNode; title: ReactNode; sub?: ReactNode; align?: 'left' | 'center'; className?: string; id?: string }) {
  return (
    <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow && <p className="text-micro font-semibold uppercase tracking-[0.16em] text-brand">{eyebrow}</p>}
      <h2 id={id} className="mt-3 font-serif text-[30px] leading-[36px] font-semibold tracking-tight text-balance text-fg md:text-[40px] md:leading-[46px]">
        {title}
      </h2>
      {sub && <p className="mt-4 text-[17px] leading-[27px] text-muted">{sub}</p>}
    </div>
  )
}

export function CtaBand({ title, sub, children }: { title: ReactNode; sub?: ReactNode; children: ReactNode }) {
  return (
    <section className="px-4 py-16 md:px-8 md:py-24">
      <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-2xl bg-[#0F1419] px-6 py-12 text-white shadow-e3 md:px-14 md:py-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_100%_0%,rgba(180,83,42,0.4),transparent_45%),radial-gradient(circle_at_0%_100%,rgba(31,78,140,0.55),transparent_55%)]" aria-hidden />
        <Contours className="absolute inset-0 -z-10 h-full w-full text-white/15" />
        <h2 className="max-w-2xl font-serif text-[30px] leading-[36px] font-semibold tracking-tight text-balance md:text-[42px] md:leading-[48px]">{title}</h2>
        {sub && <p className="mt-4 max-w-2xl text-[17px] leading-[27px] text-white/75">{sub}</p>}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{children}</div>
      </div>
    </section>
  )
}

/** Accessible FAQ built on details/summary: works without JavaScript and with keyboard. */
export function Faq({ items, className }: { items: { q: string; a: ReactNode }[]; className?: string }) {
  return (
    <div className={cn('divide-y divide-line rounded-xl border border-line bg-surface shadow-e1', className)}>
      {items.map((it) => (
        <details key={it.q} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-body font-semibold text-fg [&::-webkit-details-marker]:hidden">
            {it.q}
            <Plus className="size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-45" aria-hidden />
          </summary>
          <div className="px-5 pb-5 -mt-1 text-body text-muted">{it.a}</div>
        </details>
      ))}
    </div>
  )
}
