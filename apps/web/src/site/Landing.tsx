import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarClock,
  CalendarX2,
  Check,
  Eye,
  FileStack,
  Handshake,
  LayoutDashboard,
  Lock,
  Presentation,
  Receipt,
  Scale,
  SearchCheck,
  Smartphone,
  Tablet,
  WifiOff,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from '@/lib/cn'
import { useDocumentTitle } from '@/lib/hooks'
import { PassportIllustration } from '@/auth/AuthLayout'
import { SeverityShape, StampIcon } from '@/ds/icons'
import { StatusStamp } from '@/ds/components'
import { ButtonLink } from '@/ds/ui'
import { CtaBand, Faq, Hero, HeroLink, Section, SectionHeading } from './SiteLayout'
import { ClaimAnatomy, DisciplineGrid, DoesDoesNot, EvidenceLadder, RoundStamp, TeamGrid, TierCards } from './parts'

export default function Landing() {
  useDocumentTitle('Evidence-backed Mine Passports for East African mining')
  return (
    <>
      <Hero
        eyebrow="Mine Passports · Kenya pilot"
        title="Every mine that deserves capital should be able to prove it."
        sub="Touchstone turns a mine's paperwork into an evidence-backed Mine Passport. Every fact shows who checked it, how, when, and when the check expires, so owners can prove what they hold and investors can check the proof."
        actions={
          <>
            <HeroLink to="/owner/sign-up">Verify my licence</HeroLink>
            <HeroLink to="/for/investors#talk" variant="outline">
              I'm an investor · Talk to SSD
            </HeroLink>
          </>
        }
        note={
          <div className="space-y-3">
            <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
              {['Fixed fees, quoted before you pay', 'English and Swahili', 'No fees tied to a deal'].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <Check className="size-4 text-[#7FD1A8]" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
            <Link to="/for/experts" className="block font-medium text-white/80 underline-offset-4 hover:text-white hover:underline">
              Geologist, lawyer or ESG specialist? Join the verification network <ArrowRight className="inline size-4 align-[-3px]" aria-hidden />
            </Link>
          </div>
        }
        aside={<HeroArt />}
      />

      <TrustStrip />

      <Section id="why" labelledBy="why-title">
        <SectionHeading id="why-title" eyebrow="Why Touchstone" title="Listing sites pass on the seller's claims. Touchstone checks them." />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Problem icon={FileStack} who="For licence holders" title="The same documents, again and again">
            Owners hand the same licence and reports to every interested party, pay fees to people who vanish, and rarely learn what happened to their files.
          </Problem>
          <Problem icon={Presentation} who="For investors" title="Decks, not evidence">
            Weeks go into assets with a title problem hidden behind a polished presentation. Nobody can tell a checked fact from a declared one.
          </Problem>
          <Problem icon={CalendarX2} who="For everyone" title="Trust that quietly expires">
            A licence valid in March can lapse by September. Without dates and expiries, last year's diligence reads like today's.
          </Problem>
        </div>
        <p className="mt-8 max-w-3xl text-[19px] leading-[30px] font-medium text-fg">
          One Mine Passport, built claim by claim, that both sides can rely on, and that stays honest about what has not been checked yet.
        </p>
      </Section>

      <Section id="paths" tone="surface" labelledBy="paths-title">
        <SectionHeading id="paths-title" eyebrow="Who it's for" title="Built for each side of the table" sub="Owners, investors and the experts who check the facts each get their own app, shaped to how they work." />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          <PathCard
            icon={Smartphone}
            tone="bg-[color-mix(in_srgb,var(--brand)_14%,transparent)] text-brand"
            who="Licence holders and sponsors"
            title="Prove what you hold."
            points={['Fixed fees, shown before you pay', 'See every finding first, with 5 working days to reply', 'See everyone who opens your documents']}
            primary={{ to: '/owner/sign-up', label: 'Start with your phone number' }}
            secondary={{ to: '/for/licence-holders', label: 'For licence holders' }}
          />
          <PathCard
            icon={Building2}
            tone="bg-primary-tint text-primary"
            who="Investors and their advisers"
            title="Evidence you can defend."
            points={['Red flags first, then the facts', 'Every claim linked to its evidence, verifier and expiry', 'Private and invitation-only']}
            primary={{ to: '/for/investors#talk', label: 'Talk to SSD' }}
            secondary={{ to: '/for/investors', label: 'For investors' }}
          />
          <PathCard
            icon={BookOpen}
            tone="bg-disputed-fill text-disputed"
            who="Experts and field verifiers"
            title="Scoped, signed, independent."
            points={['One asset, one task, time-limited access', 'Structured templates signed with your credentials', 'Paid by SSD, never by the party you verify']}
            primary={{ to: '/for/experts#apply', label: 'Apply to join the network' }}
            secondary={{ to: '/for/experts', label: 'For experts' }}
          />
        </div>
      </Section>

      <Section id="how" labelledBy="how-title">
        <SectionHeading id="how-title" eyebrow="How it works" title="From paperwork to passport in four steps" sub="A Standard passport targets 30 days from an accepted submission. Every hand-off has a named owner and a deadline." />
        <ol className="relative mt-12 grid gap-8 lg:grid-cols-4 lg:gap-6">
          <span className="absolute left-[22px] top-2 bottom-2 w-px bg-line lg:left-0 lg:right-0 lg:top-[22px] lg:bottom-auto lg:h-px lg:w-auto" aria-hidden />
          <Step n={1} icon={Smartphone} title="Submit" who="Owner App">
            Sign up with your phone number, mark your licence on the map and add the documents you have. Your fee is fixed and quoted before you pay.
          </Step>
          <Step n={2} icon={SearchCheck} title="Verify" who="SSD and independent experts">
            SSD checks registries, the mining cadastre and sanctions lists. Independent lawyers, geologists and ESG specialists review, and a field verifier visits the site.
          </Step>
          <Step n={3} icon={StampIcon} title="Release" who="Owner review, then compliance">
            You see every finding first and have five working days to reply. Only then does SSD's compliance team release the Mine Passport.
          </Step>
          <Step n={4} icon={Handshake} title="Introduce" who="Through SSD only">
            SSD shares an anonymised teaser with qualified investors whose mandate fits. Names and documents follow only after an NDA and the owner's approval.
          </Step>
        </ol>
      </Section>

      <Section id="passport" tone="surface" labelledBy="passport-title">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
          <div>
            <SectionHeading
              id="passport-title"
              eyebrow="The Mine Passport"
              title="Read the stamps, not the pitch."
              sub="A Mine Passport works like a travel passport. Each fact about a mine is a claim, and each claim carries a stamp: who checked it, how, when, and when the check expires."
            />
            <ul className="mt-8 space-y-4">
              <Bullet icon={BadgeCheck} title="Seven workstreams">
                From title and ownership to geology, environment and community, each with its own status and completeness.
              </Bullet>
              <Bullet icon={CalendarClock} title="Stamps expire">
                When a check lapses the claim is marked Stale and re-checked. History is kept, never quietly deleted.
              </Bullet>
              <Bullet icon={Scale} title="Evidence quality, not investment merit">
                No overall score, rating or valuation. Red flags are listed first, by severity.
              </Bullet>
            </ul>
          </div>
          <ClaimAnatomy className="lg:ml-6" />
        </div>
        <div className="mt-14">
          <p className="text-h3 font-semibold text-fg">Five levels of evidence</p>
          <p className="mt-1 max-w-2xl text-meta text-muted">Every claim shows how it was proven. Expert and field verification are different methods, so a claim can carry both.</p>
          <EvidenceLadder className="mt-5" />
        </div>
      </Section>

      <Section id="tiers" labelledBy="tiers-title">
        <SectionHeading
          id="tiers-title"
          eyebrow="Verification tiers"
          title="Choose the depth. Know the fee first."
          sub="Every tier has a fixed fee, quoted in writing before you pay. Fees never depend on the verdict, and never on whether a deal happens."
        />
        <TierCards
          className="mt-10"
          cta={(t) => (
            <ButtonLink to="/owner/sign-up" variant={t === 'standard' ? 'primary' : 'secondary'} block size="lg">
              Get a quote
            </ButtonLink>
          )}
        />
        <p className="mt-6 flex items-start gap-2 text-meta text-muted">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
          SSD never asks for money before a written quote, and never by phone or WhatsApp. You pay inside the Owner App, by M-Pesa or bank transfer.
        </p>
      </Section>

      <Section id="platform" tone="surface" labelledBy="platform-title">
        <SectionHeading id="platform-title" eyebrow="One platform" title="Five front doors. One ledger of evidence." sub="Each app is shaped to the people who use it. All of them write to the same claims ledger and the same tamper-evident audit trail." />
        <Bento />
      </Section>

      <Section id="lines" labelledBy="lines-title">
        <SectionHeading id="lines-title" eyebrow="Clear lines" title="SSD verifies facts. It never sells a deal." sub="The boundaries are built into the product: gates, rules and approvals that every introduction has to pass." />
        <DoesDoesNot className="mt-10" />
      </Section>

      <Section id="people" tone="surface" labelledBy="people-title">
        <SectionHeading
          id="people-title"
          eyebrow="The people behind it"
          title="Named people, not a black box"
          sub="SSD is a US company with teams in Nairobi, Houston and Washington DC. Every owner has a named contact; every stamp names the professional who gave it."
        />
        <TeamGrid className="mt-10" />
        <p className="mt-12 text-h3 font-semibold text-fg">An independent verification network</p>
        <p className="mt-1 max-w-2xl text-meta text-muted">Paid by SSD per assignment, never by the owner or the investor. Conflicts are declared for every assignment, and a random sample of site visits is repeated.</p>
        <DisciplineGrid className="mt-5" />
        <Coverage />
      </Section>

      <Section id="faq" labelledBy="faq-title">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <SectionHeading id="faq-title" eyebrow="Questions" title="What people ask first" sub={<>Something else? <Link to="/contact" className="font-medium text-primary hover:underline">Contact SSD</Link>; a named person replies.</>} />
          <Faq items={FAQ} />
        </div>
      </Section>

      <CtaBand title="Start with what you can prove." sub="Licence holders sign up with a phone number. Investors and experts start with a conversation.">
        <HeroLink to="/owner/sign-up">Verify my licence</HeroLink>
        <HeroLink to="/for/investors#talk" variant="outline">
          Talk to SSD
        </HeroLink>
        <HeroLink to="/for/experts#apply" variant="outline">
          Join the network
        </HeroLink>
      </CtaBand>
    </>
  )
}

const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: 'Do I pay anything before I get a quote?',
    a: 'No. SSD never asks for money before a written quote, and never by phone or WhatsApp. You pay inside the Owner App, by M-Pesa or bank transfer, only after you accept the quote.',
  },
  {
    q: 'Does a Mine Passport mean the mine is a good investment?',
    a: 'No. A passport reports how well each fact is proven, not whether an investment is good. There is no overall score, rating or valuation, and investors make their own decisions with their own advisers.',
  },
  {
    q: 'Who can see my documents?',
    a: 'Nothing about your asset appears on this site. Qualified investors first see an anonymised teaser you approve. Documents are shared only after an NDA and your consent, watermarked, and every view is logged for you to see.',
  },
  {
    q: 'How do you keep verifiers independent?',
    a: 'Experts and field verifiers are paid by SSD, never by the owner or the investor. They declare conflicts before every assignment, their access covers one asset and one task, and a random sample of site visits is repeated.',
  },
  {
    q: 'Can I sign up as an investor?',
    a: 'The Investor Portal is by invitation. Talk to SSD: a partner arranges a call, and qualification follows that conversation. Opportunities are never listed publicly.',
  },
  {
    q: 'Is the Owner App available in Swahili?',
    a: 'Yes. The Owner App, its messages and your findings are in English and Swahili, and an SSD field agent can help you complete forms in person.',
  },
  {
    q: 'Which countries do you cover?',
    a: 'Kenya, as the pilot. Tanzania, Zambia and Uganda are next; each country gets its own rules for licences, consents and document checklists.',
  },
]

function HeroArt() {
  return (
    <div className="relative mx-auto w-full max-w-[460px] sm:pb-14 lg:mr-0">
      <PassportIllustration seal={false} className="relative rotate-[-1.5deg]" />
      <RoundStamp label="TOUCHSTONE • STANDARD TIER • " className="absolute -right-3 -top-10 size-28 rotate-[16deg] text-[#8FB3E8]/85 sm:-right-8 sm:size-32" />
      <div className="absolute -bottom-4 -left-6 hidden items-center gap-3 rounded-xl border border-white/10 bg-[#1A2129]/95 px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.45)] sm:flex">
        <span className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-[#7FD1A8]">
          <Eye className="size-[18px]" aria-hidden />
        </span>
        <span>
          <span className="block text-[13px] font-semibold text-white">Every document view is logged</span>
          <span className="block text-[11.5px] text-white/55">and shown to the owner</span>
        </span>
      </div>
    </div>
  )
}

function TrustStrip() {
  const items: { icon: LucideIcon; title: string; body: string }[] = [
    { icon: BadgeCheck, title: 'Named, credentialed verifiers', body: 'Every stamp names who gave it' },
    { icon: Receipt, title: 'Fixed fees', body: 'Quoted in writing before you pay' },
    { icon: CalendarClock, title: 'Dated checks that expire', body: 'Stale claims are re-checked' },
    { icon: Scale, title: 'No fees tied to a deal', body: 'Subscriptions and fixed fees only' },
  ]
  return (
    <section aria-label="Commitments" className="border-b border-line bg-surface">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-6 px-4 py-8 md:px-8 lg:grid-cols-4">
        {items.map((i) => (
          <li key={i.title} className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-tint text-primary">
              <i.icon className="size-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-meta font-semibold text-fg">{i.title}</span>
              <span className="block text-micro text-muted">{i.body}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Problem({ icon: Icon, who, title, children }: { icon: LucideIcon; who: string; title: string; children: ReactNode }) {
  return (
    <article className="rounded-2xl border border-line bg-surface p-6 shadow-e1">
      <span className="flex size-10 items-center justify-center rounded-xl bg-sunken text-muted">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="mt-4 text-micro font-semibold uppercase tracking-wider text-muted">{who}</p>
      <h3 className="mt-1 text-h2 font-semibold text-fg">{title}</h3>
      <p className="mt-2 text-body text-muted">{children}</p>
    </article>
  )
}

function PathCard({
  icon: Icon,
  tone,
  who,
  title,
  points,
  primary,
  secondary,
}: {
  icon: LucideIcon
  tone: string
  who: string
  title: string
  points: string[]
  primary: { to: string; label: string }
  secondary: { to: string; label: string }
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-line bg-canvas p-6 dark:bg-raised">
      <span className={cn('flex size-12 items-center justify-center rounded-xl', tone)}>
        <Icon className="size-6" aria-hidden />
      </span>
      <p className="mt-5 text-micro font-semibold uppercase tracking-wider text-muted">{who}</p>
      <h3 className="mt-1 font-serif text-[26px] leading-[32px] font-semibold text-fg">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {points.map((p) => (
          <li key={p} className="flex gap-2.5 text-body text-fg">
            <BadgeCheck className="mt-0.5 size-5 shrink-0 text-verified" aria-hidden />
            {p}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-col gap-2 pt-6">
        <ButtonLink to={primary.to} size="lg" block iconRight={<ArrowRight />}>
          {primary.label}
        </ButtonLink>
        <ButtonLink to={secondary.to} variant="ghost" block>
          {secondary.label}
        </ButtonLink>
      </div>
    </article>
  )
}

function Step({ n, icon: Icon, title, who, children }: { n: number; icon: LucideIcon | typeof StampIcon; title: string; who: string; children: ReactNode }) {
  return (
    <li className="relative flex gap-5 lg:block">
      <span className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-primary shadow-e1">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="lg:mt-5">
        <p className="text-micro font-semibold text-brand">Step {n}</p>
        <h3 className="mt-0.5 text-h2 font-semibold text-fg">{title}</h3>
        <p className="mt-1 inline-flex rounded-full bg-sunken px-2.5 py-0.5 text-micro font-medium text-muted">{who}</p>
        <p className="mt-3 text-body text-muted">{children}</p>
      </div>
    </li>
  )
}

function Bullet({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-tint text-primary">
        <Icon className="size-5" aria-hidden />
      </span>
      <span>
        <span className="block text-body font-semibold text-fg">{title}</span>
        <span className="block text-meta text-muted">{children}</span>
      </span>
    </li>
  )
}

function Bento() {
  return (
    <div className="mt-10 grid gap-4 md:grid-cols-6">
      <BentoCard className="md:col-span-3 md:row-span-2" icon={Smartphone} name="Owner App" who="Licence holders and representatives" body="Built for a mid-range Android over 3G. English and Swahili, M-Pesa, and one next step at a time.">
        <PhoneMock />
      </BentoCard>
      <BentoCard className="md:col-span-3" icon={Tablet} name="Field App" who="Field verifiers" body="Works offline for two weeks. Photos are stamped with time, GPS and a digital fingerprint.">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-fg px-3 py-1 text-micro font-medium text-canvas">
            <WifiOff className="size-3.5" aria-hidden /> Offline · 42 items saved on this phone
          </span>
          <span className="rounded-md border border-line bg-canvas px-2 py-1 font-mono text-[11px] text-muted">GPS ±4 m · 08:14 EAT · #a41f…c2</span>
        </div>
      </BentoCard>
      <BentoCard className="md:col-span-3" icon={BookOpen} name="Expert Desk" who="Geologists, lawyers, ESG specialists" body="Access to one asset and one task, ending after the deadline. Structured templates, signed with your credentials.">
        <div className="flex flex-wrap items-center gap-2">
          <StatusStamp status="in_review" />
          <span className="rounded-md border border-line bg-canvas px-2 py-1 text-micro text-muted">Opinion covers 6 claims · signed on submission</span>
        </div>
      </BentoCard>
      <BentoCard className="md:col-span-3" icon={LayoutDashboard} name="Command Center" who="SSD analysts, compliance and partners" body="Every gate, rule and approval in one place. Each rule explains itself; every action lands on a hash-chained audit trail.">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-critical-border bg-critical-fill px-2 py-1 text-micro font-semibold text-critical">
            <SeverityShape severity="critical" size={12} /> R03 · Fee tied to a closing · Blocked
          </span>
          <span className="rounded-md border border-line bg-canvas px-2 py-1 font-mono text-[11px] text-muted">#9be0…17 → #a41f…c2</span>
        </div>
      </BentoCard>
      <BentoCard className="md:col-span-3" icon={Building2} name="Investor Portal" who="Invited investors and advisers" body="Invitation-only and never indexed. Red flags first, then the facts, with a plain-English layer over technical data.">
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-canvas px-3 py-2">
          <span className="inline-flex items-center gap-1 text-micro font-semibold text-fg">
            <SeverityShape severity="high" size={13} /> 1 <span className="font-normal text-muted">High</span>
          </span>
          <span className="inline-flex items-center gap-1 text-micro font-semibold text-fg">
            <SeverityShape severity="medium" size={13} /> 2 <span className="font-normal text-muted">Medium</span>
          </span>
          <span className="text-micro text-muted">· shown above the fold</span>
        </div>
      </BentoCard>
    </div>
  )
}

function BentoCard({ className, icon: Icon, name, who, body, children }: { className?: string; icon: LucideIcon; name: string; who: string; body: string; children?: ReactNode }) {
  return (
    <article className={cn('flex flex-col gap-4 overflow-hidden rounded-2xl border border-line bg-canvas p-6 dark:bg-raised', className)}>
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary-tint text-primary">
          <Icon className="size-5" aria-hidden />
        </span>
        <span>
          <span className="block text-h3 font-semibold text-fg">{name}</span>
          <span className="block text-micro text-muted">{who}</span>
        </span>
      </div>
      <p className="text-body text-muted">{body}</p>
      {children && <div className="mt-auto">{children}</div>}
    </article>
  )
}

/** Owner App home, drawn with design-system parts (illustrative, no real asset). */
function PhoneMock() {
  const rows: { label: string; status: 'verified' | 'in_review' | 'declared' }[] = [
    { label: 'Your licence', status: 'verified' },
    { label: 'Who owns the company', status: 'verified' },
    { label: "What's in the ground", status: 'in_review' },
    { label: 'Land, environment and community', status: 'declared' },
  ]
  return (
    <div className="mx-auto w-full max-w-[280px] rounded-[2.2rem] border-[6px] border-fg/90 bg-canvas p-3 shadow-e3">
      <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-fg/20" aria-hidden />
      <div className="flex items-center justify-between px-1">
        <span className="text-[13px] font-semibold text-fg">Habari, welcome back</span>
        <span className="inline-flex rounded-full border border-line bg-surface p-0.5 text-[10px] font-semibold">
          <span className="rounded-full bg-fg px-1.5 text-canvas">EN</span>
          <span className="px-1.5 text-muted">SW</span>
        </span>
      </div>
      <div className="mt-3 rounded-xl border border-line bg-surface p-3">
        <p className="text-[11px] font-medium text-muted">Next step</p>
        <p className="text-[13px] font-semibold text-fg">Site visit on 2 Oct</p>
        <p className="text-[11px] text-muted">Your contact: Kevin Omondi, SSD</p>
      </div>
      <ul className="mt-2 space-y-1.5">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center justify-between gap-2 rounded-lg border border-line bg-surface px-2.5 py-2">
            <span className="truncate text-[12px] text-fg">{r.label}</span>
            <StatusStamp status={r.status} size="sm" />
          </li>
        ))}
      </ul>
    </div>
  )
}

function Coverage() {
  const countries = [
    { name: 'Kenya', state: 'Pilot · open now', live: true },
    { name: 'Tanzania', state: 'Next', live: false },
    { name: 'Zambia', state: 'Next', live: false },
    { name: 'Uganda', state: 'Next', live: false },
  ]
  return (
    <div className="mt-12 rounded-2xl border border-line bg-canvas p-6 dark:bg-raised md:flex md:items-center md:gap-8">
      <div className="md:w-2/5">
        <p className="text-h3 font-semibold text-fg">Kenya first. East Africa next.</p>
        <p className="mt-1 text-meta text-muted">Each country's licence types, consents and document checklists live in a versioned country pack, reviewed by local counsel.</p>
      </div>
      <ul className="mt-5 grid flex-1 grid-cols-2 gap-2 md:mt-0 md:grid-cols-4">
        {countries.map((c) => (
          <li key={c.name} className={cn('rounded-xl border p-3', c.live ? 'border-verified-border bg-verified-fill' : 'border-line bg-surface')}>
            <span className="block text-body font-semibold text-fg">{c.name}</span>
            <span className={cn('mt-0.5 inline-flex items-center gap-1.5 text-micro font-medium', c.live ? 'text-verified' : 'text-muted')}>
              <span className={cn('size-1.5 rounded-full', c.live ? 'bg-verified' : 'bg-line-strong')} aria-hidden />
              {c.state}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
