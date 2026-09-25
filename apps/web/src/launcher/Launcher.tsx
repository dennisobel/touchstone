import {
  ArrowUpRight,
  Bell,
  BookOpen,
  Building2,
  FileText,
  Globe,
  LogIn,
  LayoutDashboard,
  MonitorSmartphone,
  Palette,
  RotateCcw,
  ServerCrash,
  Smartphone,
  Tablet,
  UserRound,
  Wrench,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import { Logo } from '@/ds/icons'
import { Button, Chip, Switch, toast } from '@/ds/ui'
import { ThemeSwitch } from '@/ds/shell'
import { cn } from '@/lib/cn'
import { useDocumentTitle } from '@/lib/hooks'
import { useDemo } from '@/lib/store'

function AppCard({
  icon,
  name,
  who,
  device,
  to,
  personas,
  tone,
  planned,
  auth,
  children,
}: {
  icon: ReactNode
  name: string
  who: string
  device: string
  to?: string
  personas?: { label: string; onPick: () => void; active: boolean }[]
  tone: string
  planned?: boolean
  auth?: { signIn: string; signUp: string; signUpLabel: string }
  children?: ReactNode
}) {
  const navigate = useNavigate()
  return (
    <article className={cn('flex flex-col rounded-xl border border-line bg-surface p-5 shadow-e1', planned && 'border-dashed opacity-80')}>
      <div className="flex items-start justify-between gap-3">
        <span className={cn('flex size-11 items-center justify-center rounded-xl [&_svg]:size-5.5', tone)}>{icon}</span>
        {planned ? <Chip tone="outline">Phase 9 · not started</Chip> : <Chip tone="verified">Built</Chip>}
      </div>
      <h2 className="mt-4 text-h2 font-semibold">{name}</h2>
      <p className="mt-1 text-meta text-muted">{who}</p>
      <p className="mt-2 inline-flex items-center gap-1.5 text-micro text-muted">
        <MonitorSmartphone className="size-3.5" aria-hidden /> {device}
      </p>
      {auth && (
        <p className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-micro">
          <Link to={auth.signIn} viewTransition className="inline-flex h-8 items-center gap-1 rounded-full border border-line px-3 font-medium text-fg hover:border-line-strong">
            <LogIn className="size-3.5" aria-hidden /> Sign in
          </Link>
          <Link to={auth.signUp} viewTransition className="inline-flex h-8 items-center rounded-full border border-line px-3 font-medium text-fg hover:border-line-strong">
            {auth.signUpLabel}
          </Link>
        </p>
      )}
      {children}
      {personas && (
        <div className="mt-4 space-y-2">
          <p className="text-micro font-medium text-muted">Open as</p>
          <div className="flex flex-wrap gap-2">
            {personas.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  p.onPick()
                  if (to) navigate(to, { viewTransition: true })
                }}
                className={cn(
                  'pressable inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-micro font-medium',
                  p.active ? 'border-primary bg-primary-tint text-primary' : 'border-line bg-surface text-fg hover:border-line-strong',
                )}
              >
                <UserRound className="size-3.5" aria-hidden />
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="mt-auto pt-5">
        {to && !planned ? (
          <Link to={to} viewTransition className="pressable inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-fg px-4 text-meta font-medium text-canvas">
            Open {name}
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        ) : (
          <p className="text-micro text-muted">Planned as a React Native app (see PLAN.md, Phase 9).</p>
        )}
      </div>
    </article>
  )
}

function OutputLink({ to, icon, title, body }: { to: string; icon: ReactNode; title: string; body: string }) {
  return (
    <Link to={to} viewTransition className="pressable flex items-start gap-3 rounded-lg border border-line bg-surface p-4 shadow-e1 hover:border-line-strong">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sunken text-muted [&_svg]:size-4.5">{icon}</span>
      <span className="min-w-0">
        <span className="block text-meta font-semibold text-fg">{title}</span>
        <span className="block text-micro text-muted">{body}</span>
      </span>
    </Link>
  )
}

export default function Launcher() {
  useDocumentTitle('All apps')
  const s = useDemo()
  return (
    <div className="min-h-dvh bg-canvas pb-[calc(var(--safe-bottom)+32px)]">
      <header className="glass sticky top-0 z-20 border-b border-line/70 pt-safe">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:px-8">
          <Logo size={32} />
          <div className="min-w-0 flex-1">
            <p className="text-meta font-semibold leading-tight">Touchstone</p>
            <p className="truncate text-[11px] leading-tight text-muted">UI prototype · all apps · fictional sample data</p>
          </div>
          <Link to="/" viewTransition className="hidden h-9 items-center gap-1.5 rounded-full border border-line px-3.5 text-meta font-medium text-fg hover:border-line-strong sm:inline-flex">
            <Globe className="size-4" aria-hidden /> Public site
          </Link>
          <ThemeSwitch className="max-sm:hidden" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 md:px-8">
        <section className="py-8 md:py-12">
          <p className="text-micro font-semibold uppercase tracking-widest text-brand">Mine Passports for East African assets</p>
          <h1 className="mt-2 max-w-3xl text-[30px] leading-[38px] font-semibold tracking-tight md:text-[40px] md:leading-[48px]">
            Five front doors on one core. Pick an app to explore.
          </h1>
          <p className="mt-3 max-w-2xl text-body text-muted">
            Every fact about a mine is a claim with evidence, a named verifier and an expiry. Owners, experts and SSD feed evidence in; investors see only what SSD releases. Today in the sample data is 24 Sep 2026.
          </p>
        </section>

        <section aria-label="Apps" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AppCard
            icon={<Smartphone />}
            tone="bg-[color-mix(in_srgb,var(--brand)_14%,transparent)] text-brand"
            name="Owner App"
            who="Licence holders and sponsors (P1–P3). English and Swahili."
            device="Phone first · 360 × 800 · 3G"
            to="/owner"
            auth={{ signIn: '/owner/sign-in', signUp: '/owner/sign-up', signUpLabel: 'Sign up' }}
            personas={[
              { label: 'Peter Ouma · gold, verifying', onPick: () => s.setOwnerPersona('peter'), active: s.ownerPersona === 'peter' },
              { label: 'Grace Wanjiku · graphite, released', onPick: () => s.setOwnerPersona('grace'), active: s.ownerPersona === 'grace' },
            ]}
          />
          <AppCard
            icon={<LayoutDashboard />}
            tone="bg-primary-tint text-primary"
            name="Command Center"
            who="SSD analysts, compliance, partners and operations (P8–P11)."
            device="Desktop 1440 · keyboard-first · works on phones"
            to="/command"
            auth={{ signIn: '/command/sign-in', signUp: '/command/sign-up', signUpLabel: 'Staff invitation' }}
          />
          <AppCard icon={<BookOpen />} tone="bg-disputed-fill text-disputed" name="Expert Desk" who="Resource geologists, mining lawyers, ESG specialists (P5–P7)." device="Laptop 1280+ · works on phones" to="/expert" auth={{ signIn: '/expert/sign-in', signUp: '/expert/sign-up', signUpLabel: 'Join by invitation' }} />
          <AppCard
            icon={<Building2 />}
            tone="bg-verified-fill text-verified"
            name="Investor Portal"
            who="Invited US investors and advisers (P12–P15). Never indexed."
            device="Desktop and iPad · works on phones"
            to="/investor"
            auth={{ signIn: '/investor/sign-in', signUp: '/investor/sign-up', signUpLabel: 'By invitation' }}
            personas={[
              { label: 'Rachel Kim · Brightwater', onPick: () => s.setInvestorPersona('rachel'), active: s.investorPersona === 'rachel' },
              { label: 'Marcus Bell · Cedar Peak', onPick: () => s.setInvestorPersona('marcus'), active: s.investorPersona === 'marcus' },
            ]}
          />
          <AppCard icon={<Tablet />} tone="bg-sunken text-muted" name="Field App" who="Field geologists and site verifiers (P4, P7). Offline for days." device="Native Android" planned />
          <AppCard icon={<Globe />} tone="bg-review-fill text-review" name="Public site" who="Landing page, audience pages and contact forms. Nothing about any specific asset; no investor sign-up." device="Responsive · EN/SW for licence holders" to="/" />
        </section>

        <section className="mt-10" aria-labelledby="outputs">
          <h2 id="outputs" className="text-h2 font-semibold">Shared outputs and design system</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <OutputLink to="/gallery" icon={<Palette />} title="Component gallery" body="Tokens, 20 signature components, every state" />
            <OutputLink to="/print/passport/kiboko" icon={<FileText />} title="Mine Passport PDF" body="Print layout, A4 and US Letter" />
            <OutputLink to="/notifications" icon={<Bell />} title="Notification templates" body="Email, SMS and WhatsApp, EN/SW" />
            <OutputLink to="/system/server-error" icon={<ServerCrash />} title="System pages" body="Errors, offline, maintenance, access" />
          </div>
        </section>

        <section className="mt-10 rounded-xl border border-line bg-surface p-5 shadow-e1" aria-labelledby="demo">
          <div className="flex items-center gap-2">
            <Wrench className="size-4 text-muted" aria-hidden />
            <h2 id="demo" className="text-h3 font-semibold">Demo settings</h2>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <Switch
              checked={s.showDemoControls}
              onCheckedChange={s.setShowDemoControls}
              label="Show the States control"
              description="Switch each screen between its designed states: empty, offline, error and more."
            />
            <Switch
              checked={s.libraryOn}
              onCheckedChange={(v) => {
                s.setLibraryOn(v)
                toast(v ? 'Verified library switched on (hybrid mode)' : 'Gatekeeper mode: library off')
              }}
              label="Verified library (hybrid mode)"
              description="Off at launch. In the product this needs two approvers and counsel's approval (CC-24)."
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4">
            <ThemeSwitch className="sm:hidden" />
            <Button
              variant="secondary"
              size="sm"
              icon={<RotateCcw />}
              onClick={() => {
                s.reset()
                toast('Demo data reset')
              }}
            >
              Reset demo data
            </Button>
            <p className="text-micro text-muted">Progress and the build plan are tracked in PLAN.md at the repository root.</p>
          </div>
        </section>
      </main>
    </div>
  )
}
