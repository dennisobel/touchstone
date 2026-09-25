import { ArrowLeft, BadgeCheck, Hourglass, MapPinCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from '@/lib/cn'
import { useDocumentTitle, useNoIndex } from '@/lib/hooks'
import { StampIcon, Logo } from '@/ds/icons'
import { ShellProvider, StatesControl } from '@/ds/shell'

export type AuthApp = 'owner' | 'expert' | 'command' | 'investor'

export const APP_META: Record<AuthApp, { name: string; density: string; headline: string; sub: string; points: string[] }> = {
  owner: {
    name: 'Owner App',
    density: 'touch',
    headline: 'Prove what you hold.',
    sub: 'For licence holders and their representatives in Kenya.',
    points: ['Fixed fees, shown before you pay', 'You see every finding before anyone else', 'You see who opens your documents'],
  },
  investor: {
    name: 'Investor Portal',
    density: 'comfortable',
    headline: 'Evidence you can defend.',
    sub: 'For investors and advisers invited by SSD.',
    points: ['Red flags first, then the facts', 'Every claim linked to its evidence, verifier and expiry', 'Private, invitation-only, never indexed'],
  },
  expert: {
    name: 'Expert Desk',
    density: 'comfortable',
    headline: 'Scoped, signed, independent.',
    sub: 'For resource geologists, mining lawyers and ESG specialists.',
    points: ['One asset, one task, time-limited access', 'Structured templates, signed with your credentials', 'Paid by SSD, never by the party you verify'],
  },
  command: {
    name: 'Command Center',
    density: 'comfortable',
    headline: 'The compliant path is the fastest path.',
    sub: 'For SSD analysts, compliance, partners and operations.',
    points: ['One queue for what is stuck and who acts next', 'Every rule explains itself', 'Every action logged on a hash-chained trail'],
  },
}

/** Topographic contour lines, generated (no images): the brand's quiet "geology" texture. */
export function Contours({ className }: { className?: string }) {
  const rings = Array.from({ length: 14 }, (_, i) => i)
  const path = (i: number, cx: number, cy: number, seed: number) => {
    const n = 48
    let d = ''
    for (let k = 0; k <= n; k++) {
      const t = (k / n) * Math.PI * 2
      const r = 30 + i * 22 + 9 * Math.sin(3 * t + seed) + 6 * Math.sin(5 * t + seed * 2 + i * 0.3)
      const x = cx + Math.cos(t) * r * 1.35
      const y = cy + Math.sin(t) * r
      d += `${k ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`
    }
    return d + 'Z'
  }
  return (
    <svg viewBox="0 0 800 800" className={className} aria-hidden preserveAspectRatio="xMidYMid slice">
      {rings.map((i) => (
        <path key={`a${i}`} d={path(i, 620, 180, 1.2)} fill="none" stroke="currentColor" strokeWidth={i % 4 === 0 ? 1.4 : 0.8} opacity={0.5 - i * 0.025} />
      ))}
      {rings.slice(0, 9).map((i) => (
        <path key={`b${i}`} d={path(i, 140, 690, 2.6)} fill="none" stroke="currentColor" strokeWidth={i % 4 === 0 ? 1.4 : 0.8} opacity={0.45 - i * 0.03} />
      ))}
    </svg>
  )
}

/** Illustrative passport card (generic; not a real asset). */
export function PassportIllustration({ className, seal = true }: { className?: string; seal?: boolean }) {
  const rows = [
    { t: 'Licence active until Mar 2027', s: 'Verified', by: 'Mining lawyer · 10 Sep', icon: <StampIcon className="size-3.5" />, tone: 'text-[#7FD1A8] border-[#7FD1A8]/50 bg-[#7FD1A8]/10' },
    { t: 'Boundary beacons observed on site', s: 'Field-verified', by: 'Field geologist · 2 Sep', icon: <MapPinCheck className="size-3.5" />, tone: 'text-[#7FD1A8] border-[#7FD1A8]/50 bg-[#7FD1A8]/10' },
    { t: 'Owners traced to natural persons', s: 'Verified', by: 'Registry check · 5 Sep', icon: <BadgeCheck className="size-3.5" />, tone: 'text-[#7FD1A8] border-[#7FD1A8]/50 bg-[#7FD1A8]/10' },
    { t: 'Resource estimate reviewed', s: 'In review', by: 'Qualified Person · due 7 Oct', icon: <Hourglass className="size-3.5" />, tone: 'text-[#F2C063] border-[#F2C063]/50 bg-[#F2C063]/10' },
  ]
  return (
    <div className={cn('rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur', className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E08A62]">Mine Passport · example</p>
          <p className="mt-1 font-serif text-[20px] font-semibold text-white">KE-XX-00</p>
        </div>
        {seal && (
          <span className="flex size-14 flex-col items-center justify-center rounded-full border-2 border-[#8FB3E8] text-[#8FB3E8]">
            <StampIcon className="size-4" />
            <span className="text-[8px] font-bold uppercase tracking-wide">Standard</span>
          </span>
        )}
      </div>
      <ul className="mt-4 space-y-2">
        {rows.map((r) => (
          <li key={r.t} className="flex items-center gap-3 rounded-lg bg-black/20 px-3 py-2">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12.5px] text-white/90">{r.t}</span>
              <span className="block text-[10.5px] text-white/50">{r.by}</span>
            </span>
            <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10.5px] font-semibold', r.tone)}>
              {r.icon}
              {r.s}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[10.5px] text-white/45">Every claim shows who checked it, how, when, and when it expires.</p>
    </div>
  )
}

export function AuthLayout({ app, title, children, headerExtra }: { app: AuthApp; title?: string; children: ReactNode; headerExtra?: ReactNode }) {
  useDocumentTitle(title)
  useNoIndex()
  const m = APP_META[app]
  return (
    <ShellProvider app={app} hasTabBar={false}>
      <div data-density={m.density} data-app={app} className="min-h-dvh bg-canvas text-body lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        {/* Brand panel (desktop) */}
        <aside className="relative hidden overflow-hidden bg-[#0f1419] text-white lg:flex lg:flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(180,83,42,0.35),transparent_45%),radial-gradient(circle_at_10%_90%,rgba(31,78,140,0.45),transparent_50%)]" aria-hidden />
          <Contours className="absolute inset-0 h-full w-full text-white/25" />
          <div className="relative flex flex-1 flex-col p-10 xl:p-14">
            <Link to="/" className="flex items-center gap-3" aria-label="Touchstone home">
              <Logo size={36} />
              <span>
                <span className="block text-[15px] font-semibold leading-tight">Touchstone</span>
                <span className="block text-[12px] leading-tight text-white/60">{m.name}</span>
              </span>
            </Link>
            <div className="mt-auto max-w-lg pt-8">
              <h2 className="text-[40px] leading-[46px] font-semibold tracking-tight text-balance">{m.headline}</h2>
              <p className="mt-3 text-[16px] text-white/70">{m.sub}</p>
              <ul className="mt-6 space-y-2.5">
                {m.points.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-[15px] text-white/85">
                    <span className="flex size-6 items-center justify-center rounded-full bg-white/10">
                      <BadgeCheck className="size-3.5 text-[#8FB3E8]" aria-hidden />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            {/* Short laptop screens: shrink the card (CSS zoom affects layout), and drop it below 800 px tall. */}
            <PassportIllustration className="mt-10 max-w-md [@media(max-height:960px)]:mt-8 [@media(max-height:960px)]:[zoom:0.8] [@media(max-height:800px)]:hidden" />
            <p className="mt-8 text-[12px] text-white/40">SSD · Nairobi · Houston · Washington DC</p>
          </div>
        </aside>

        {/* Form column */}
        <div className="flex min-h-dvh flex-col">
          <header className="flex items-center gap-3 px-4 pb-2 pt-[calc(12px+var(--safe-top))] md:px-8">
            <Link to="/" className="inline-flex items-center gap-2 rounded-full py-1.5 pr-3 text-micro font-medium text-muted hover:text-fg" aria-label="Back to the Touchstone site">
              <ArrowLeft className="size-4" aria-hidden />
              <span className="lg:hidden">
                <Logo size={24} />
              </span>
              <span className="hidden lg:inline">Touchstone home</span>
            </Link>
            <span className="text-meta font-semibold lg:hidden">{m.name}</span>
            <div className="ml-auto flex items-center gap-2">{headerExtra}</div>
          </header>
          <main className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center px-5 py-8 md:py-12">{children}</main>
          <footer className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 pb-[calc(16px+var(--safe-bottom))] text-micro text-muted">
            <Link to="/about" className="hover:text-fg">
              About SSD
            </Link>
            <Link to="/contact" className="hover:text-fg">
              Help
            </Link>
            <span>Privacy · Kenya Data Protection Act 2019</span>
            <span className="rounded-full border border-dashed border-brand/50 px-2 py-0.5 text-[11px] text-brand">Prototype · sample data</span>
          </footer>
        </div>
        <StatesControl />
      </div>
    </ShellProvider>
  )
}

/** Title block used at the top of every auth form. */
export function AuthHeading({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: ReactNode }) {
  return (
    <div className="mb-6">
      {eyebrow && <p className="text-micro font-semibold uppercase tracking-[0.14em] text-brand">{eyebrow}</p>}
      <h1 className="mt-1 text-[28px] leading-[34px] font-semibold tracking-tight text-fg text-balance">{title}</h1>
      {sub && <p className="mt-2 text-body text-muted">{sub}</p>}
    </div>
  )
}

export function OrDivider({ label = 'or' }: { label?: string }) {
  return (
    <div className="my-5 flex items-center gap-3 text-micro text-muted">
      <span className="h-px flex-1 bg-line" />
      {label}
      <span className="h-px flex-1 bg-line" />
    </div>
  )
}
