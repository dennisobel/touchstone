import { Bell, BookOpenText, Columns3, Download, FileSearch, Handshake, KeyRound, ListChecks, MessagesSquare, ScrollText, SearchCheck, ShieldCheck, Target, UserRoundPlus, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { useDocumentTitle } from '@/lib/hooks'
import { WORKSTREAMS, type Severity, type WorkstreamId } from '@/data'
import { SeverityShape } from '@/ds/icons'
import { Avatar } from '@/ds/ui'
import { CtaBand, Faq, Hero, HeroLink, Section, SectionHeading } from './SiteLayout'
import { DoesDoesNot, TierCards } from './parts'
import { TalkToSsdForm } from './forms'

const COVERS: Record<WorkstreamId, string> = {
  title: 'Licence validity, boundaries, expiry and renewal, and consents to transfer or charge the licence.',
  ownership: "The holder's company, directors and shareholders, with beneficial owners traced to real people.",
  integrity: 'Sanctions, politically exposed persons and adverse media, re-screened continuously.',
  geology: 'Data, QA/QC and resource estimates, reviewed by a Qualified Person against the reporting codes.',
  technical: 'Access, power, water and the route to market.',
  esg: 'Permits, protected areas, community agreements and artisanal activity, mapped to lender standards.',
  legal: 'Taxes, royalties, state participation and export rules.',
}

export default function ForInvestors() {
  useDocumentTitle('For investors')
  return (
    <>
      <Hero
        eyebrow="For investors and their advisers"
        title="Evidence you can defend."
        sub="Touchstone gives qualified US investors Mine Passports for East African mining assets: every claim linked to its evidence, its verifier and its expiry date. Listing sites pass on the seller's claims; Touchstone checks them."
        actions={
          <>
            <HeroLink to="/for/investors#talk">Talk to SSD</HeroLink>
            <HeroLink to="/investor/sign-in" variant="outline">
              Already invited? Sign in
            </HeroLink>
          </>
        }
        note="Invitation-only · Never indexed · No opportunities are listed publicly"
        aside={<RedFlagsArt />}
      />

      <Section labelledBy="covers-title">
        <SectionHeading id="covers-title" eyebrow="What verification covers" title="Seven workstreams, the same fields on every asset" sub="Each workstream shows its status, its verification completeness and any open red flags, so you can compare assets side by side." />
        <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {WORKSTREAMS.map((w, i) => (
            <li key={w.id} className="rounded-2xl border border-line bg-surface p-5 shadow-e1">
              <span className="font-mono text-micro text-muted">{String(i + 1).padStart(2, '0')}</span>
              <p className="mt-1 text-body font-semibold text-fg">{w.name}</p>
              <p className="mt-1 text-meta text-muted">{COVERS[w.id]}</p>
            </li>
          ))}
          <li className="flex flex-col justify-center rounded-2xl border border-dashed border-line-strong/60 p-5">
            <p className="text-meta text-muted">Verification completeness is the share of a workstream's material claims at E2 or above. It measures how well facts are proven, never how good the investment is.</p>
            <Link to="/methodology" className="mt-3 text-meta font-semibold text-primary hover:underline">
              Read the methodology
            </Link>
          </li>
        </ol>
      </Section>

      <Section tone="surface" labelledBy="lines-title">
        <SectionHeading id="lines-title" eyebrow="What it does not do" title="Facts, not recommendations" sub="SSD is not a broker and not an adviser. There is no score, rating, valuation or return projection anywhere in the product; you decide with your own advisers." />
        <DoesDoesNot className="mt-10" />
      </Section>

      <Section labelledBy="access-title">
        <SectionHeading id="access-title" eyebrow="How access works" title="From a conversation to a deal room" sub="Each step is gated, logged and explained. Nothing about a specific asset reaches you before SSD has documented your relationship." />
        <ol className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <AccessStep n={1} icon={MessagesSquare} title="A conversation">
            You talk to an SSD partner about your organisation and what you look for.
          </AccessStep>
          <AccessStep n={2} icon={ShieldCheck} title="Qualification">
            A short questionnaire and checks, pre-filled where possible. A decision within three working days.
          </AccessStep>
          <AccessStep n={3} icon={Target} title="Your mandate">
            Commodities, countries, stage and ticket size as structured fields, including product specifications.
          </AccessStep>
          <AccessStep n={4} icon={FileSearch} title="Anonymised teasers">
            Only assets that fit your mandate, with red flags and verification status above the fold.
          </AccessStep>
          <AccessStep n={5} icon={KeyRound} title="NDA and deal room">
            The full passport, watermarked documents and questions moderated by SSD, with the owner's consent.
          </AccessStep>
          <AccessStep n={6} icon={Handshake} title="Your decision">
            Terms are between the parties and their advisers. SSD logs access but does not negotiate.
          </AccessStep>
        </ol>
      </Section>

      <Section tone="surface" labelledBy="built-title">
        <SectionHeading id="built-title" eyebrow="Built for diligence" title="Kill a weak deal in an hour. Defend a good one to your board." />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feature icon={ListChecks} title="Red flags first">
            Critical and High flags lead every teaser and passport, with the evidence behind them.
          </Feature>
          <Feature icon={Columns3} title="Compare side by side">
            The same fields on every asset, in dense comparison tables with keyboard shortcuts.
          </Feature>
          <Feature icon={Download} title="Raw data, usable formats">
            Download everything you are permitted to in one click, to Excel, CSV and PDF, watermarked to you.
          </Feature>
          <Feature icon={BookOpenText} title="Explain this">
            A plain-English layer and glossary on every technical term, approved by a named analyst.
          </Feature>
          <Feature icon={UserRoundPlus} title="Bring your advisers">
            Invite consultants and counsel as guests: one deal, a fixed period, under your NDA.
          </Feature>
          <Feature icon={Bell} title="Know when facts change">
            Follow a passport and get alerts in the portal when a claim goes stale or a flag moves. Emails never carry deal details.
          </Feature>
        </ul>
      </Section>

      <Section labelledBy="tiers-title">
        <SectionHeading id="tiers-title" eyebrow="Verification tiers" title="Know the depth behind every badge" sub="The tier badge on a passport tells you exactly what was checked. Verifiers are paid by SSD, never by the party they verify." />
        <TierCards className="mt-10" />
      </Section>

      <Section id="talk" tone="surface" labelledBy="talk-title">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div>
            <SectionHeading id="talk-title" eyebrow="Talk to SSD" title="Tell us what you're looking for" sub="There is no sign-up. A partner reads every request and arranges a call; access to the Investor Portal follows that conversation and qualification." />
            <ul className="mt-8 space-y-4">
              <NextItem icon={MessagesSquare}>A call with an SSD partner, usually within a week</NextItem>
              <NextItem icon={ScrollText}>Qualification: questionnaire and checks, decided within three working days</NextItem>
              <NextItem icon={SearchCheck}>Teasers only for assets that fit your mandate</NextItem>
            </ul>
            <div className="mt-8 flex items-center gap-4 rounded-2xl border border-line bg-canvas p-5 dark:bg-raised">
              <Avatar id="james" size={56} />
              <div>
                <p className="text-h3 font-semibold text-fg">James Whitfield</p>
                <p className="text-meta text-muted">Managing partner, SSD · Houston</p>
                <p className="mt-1 text-micro text-muted">Owns SSD's investor relationships</p>
              </div>
            </div>
          </div>
          <TalkToSsdForm />
        </div>
      </Section>

      <Section labelledBy="faq-title">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <SectionHeading id="faq-title" eyebrow="Questions" title="What investors ask first" />
          <Faq items={FAQ} />
        </div>
      </Section>

      <CtaBand title="Evidence first. Then the conversation." sub="A partner arranges a call. Qualification and access follow that conversation.">
        <HeroLink to="/for/investors#talk">Talk to SSD</HeroLink>
        <HeroLink to="/methodology" variant="outline">
          Read the methodology
        </HeroLink>
      </CtaBand>
    </>
  )
}

const FAQ: { q: string; a: ReactNode }[] = [
  { q: 'Is Touchstone a marketplace or a broker?', a: 'No. SSD verifies facts, qualifies investors and introduces parties with approval and a log. It does not negotiate terms, hold money or take fees tied to a deal closing.' },
  { q: 'Who pays for verification?', a: 'Fees are fixed, disclosed up front and never tied to the verdict. Experts and field verifiers are paid by SSD, never by the owner or by you.' },
  { q: 'Can my consultant or counsel get access?', a: 'Yes. You can invite advisers into a deal room as guests, for one deal and a fixed period, under your NDA. Their notes stay in your private workspace.' },
  { q: 'What happens when a fact changes after release?', a: 'Every claim has a freshness window. When a check lapses the claim is marked Stale and re-checked, and followers are alerted in the portal.' },
  { q: 'Do you rate or value assets?', a: 'No. There is no overall score, rating, valuation or return projection anywhere in the product.' },
]

function RedFlagsArt() {
  const flags: { sev: Severity; label: string; text: string }[] = [
    { sev: 'high', label: 'High', text: 'Licence expires within six months; renewal not yet filed' },
    { sev: 'medium', label: 'Medium', text: 'QA/QC data missing for part of the drilling' },
    { sev: 'low', label: 'Low', text: 'Registry address differs from correspondence address' },
  ]
  const bars = [92, 88, 100, 64, 40, 71, 58]
  return (
    <div className="dark mx-auto w-full max-w-[460px] rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur lg:mr-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E08A62]">Red flags first · example</p>
      <ul className="mt-3 space-y-2">
        {flags.map((f) => (
          <li key={f.text} className="flex items-start gap-3 rounded-lg bg-black/20 px-3 py-2.5">
            <SeverityShape severity={f.sev} size={16} className="mt-0.5" />
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-white/55">{f.label}</span>
              <span className="block text-[13px] text-white/90">{f.text}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-[11px] font-semibold uppercase tracking-wide text-white/55">Verification completeness by workstream</p>
      <ul className="mt-2 space-y-1.5">
        {WORKSTREAMS.map((w, i) => (
          <li key={w.id} className="grid grid-cols-[96px_minmax(0,1fr)_34px] items-center gap-2 text-[11.5px] text-white/70">
            <span className="truncate">{w.short}</span>
            <span className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <span className="block h-full rounded-full bg-[#8FB3E8]" style={{ width: `${bars[i]}%` }} />
            </span>
            <span className="text-right tabular-nums">{bars[i]}%</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[10.5px] text-white/45">Illustrative. Completeness measures how well facts are proven, not investment merit.</p>
    </div>
  )
}

function AccessStep({ n, icon: Icon, title, children }: { n: number; icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-4 rounded-2xl border border-line bg-surface p-5 shadow-e1">
      <span className="relative flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-tint text-primary">
        <Icon className="size-5" aria-hidden />
        <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-fg text-[11px] font-semibold text-canvas">{n}</span>
      </span>
      <span>
        <span className="block text-body font-semibold text-fg">{title}</span>
        <span className="mt-1 block text-meta text-muted">{children}</span>
      </span>
    </li>
  )
}

function Feature({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <li className="rounded-2xl border border-line bg-canvas p-5 dark:bg-raised">
      <Icon className="size-6 text-primary" aria-hidden />
      <p className="mt-3 text-body font-semibold text-fg">{title}</p>
      <p className="mt-1 text-meta text-muted">{children}</p>
    </li>
  )
}

function NextItem({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-body text-fg">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-tint text-primary">
        <Icon className="size-[18px]" aria-hidden />
      </span>
      <span className="pt-1.5">{children}</span>
    </li>
  )
}
