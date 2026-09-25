import { ArrowRight, Ban, Bot, FileClock, Link2, Repeat, ShieldCheck, UserCheck, type LucideIcon } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { useDocumentTitle } from '@/lib/hooks'
import { WORKSTREAMS, type ClaimStatus, type Severity } from '@/data'
import { StatusStamp } from '@/ds/components'
import { SeverityShape } from '@/ds/icons'
import { CtaBand, Hero, HeroLink, Section, SectionHeading } from './SiteLayout'
import { ClaimAnatomy, EvidenceLadder, StatusLegend, TierCards } from './parts'

const SECTIONS = [
  { id: 'claims', label: 'Claims' },
  { id: 'evidence', label: 'Evidence levels' },
  { id: 'status', label: 'Status words' },
  { id: 'flags', label: 'Red flags' },
  { id: 'freshness', label: 'Freshness' },
  { id: 'tiers', label: 'Tiers' },
  { id: 'completeness', label: 'Completeness' },
  { id: 'independence', label: 'Independence' },
]

const CLAIM_FIELDS: [string, string][] = [
  ['Statement', 'The prospecting licence is active until March 2027'],
  ['Workstream', 'Title and tenure'],
  ['Materiality', 'Material: a wrong answer could change an investment decision'],
  ['Source', 'Registry: the national mining cadastre'],
  ['Evidence', 'Portal capture with address and timestamp; certified search; counsel opinion'],
  ['Evidence level', 'E3 Expert-verified'],
  ['Verifier and method', 'A mining lawyer, by title opinion; an automated cadastre check'],
  ['Verified on, expires on', '10 September 2026, 10 October 2026 (30-day freshness)'],
  ['Status', 'Verified'],
]

const LIFECYCLE: { from: ClaimStatus; via: string; to: ClaimStatus }[] = [
  { from: 'declared', via: 'evidence added', to: 'in_review' },
  { from: 'in_review', via: 'confirmed', to: 'verified' },
  { from: 'in_review', via: 'evidence conflicts', to: 'discrepancy' },
  { from: 'in_review', via: 'no source reachable', to: 'unverifiable' },
  { from: 'discrepancy', via: 'owner replies', to: 'disputed' },
  { from: 'disputed', via: 'resolved', to: 'verified' },
  { from: 'verified', via: 'freshness lapses', to: 'stale' },
  { from: 'stale', via: 're-check', to: 'in_review' },
]

const FLAGS: { sev: Severity; name: string; meaning: string; example: string; effect: string }[] = [
  { sev: 'critical', name: 'Critical', meaning: 'Could void title or create legal liability', example: 'Licence area closed to mining; owner on a sanctions list; forged document', effect: 'Blocks release' },
  { sev: 'high', name: 'High', meaning: 'Material risk to value or timeline', example: 'Licence expires within six months with no renewal filed; active community dispute', effect: 'Release allowed, with the flag at the top of the passport' },
  { sev: 'medium', name: 'Medium', meaning: 'Needs attention during diligence', example: 'QA/QC data missing; artisanal mining on part of the licence', effect: 'Disclosed in the workstream' },
  { sev: 'low', name: 'Low', meaning: 'Housekeeping', example: 'Registry address differs from correspondence address', effect: 'Disclosed in detail view' },
]

const FRESHNESS: [string, string][] = [
  ['Sanctions and politically exposed persons', 'Continuous, re-screened daily'],
  ['Adverse media', 'Continuous'],
  ['Licence status', '30 days'],
  ['Satellite activity', 'Monthly'],
  ['Company registry and beneficial owners', '90 days'],
  ['Title opinion; environmental permits', '6 months'],
  ['Site visit', '12 months'],
  ['Resource estimate', 'Until superseded, reviewed at 24 months'],
]

export default function Methodology() {
  useDocumentTitle('Methodology')
  const active = useScrollSpy(SECTIONS.map((s) => s.id))
  return (
    <>
      <Hero
        eyebrow="Methodology"
        title="How a fact becomes a stamp."
        sub="Every fact about an asset is a claim. A claim becomes trustworthy only through evidence, a named verifier and a date, and its trust decays until it is checked again. The Mine Passport is the claims ledger, organised and rendered."
      />

      <nav aria-label="On this page" className="glass sticky top-[calc(64px+var(--safe-top))] z-30 border-b border-line/70">
        <ul className="no-scrollbar mx-auto flex max-w-7xl gap-1.5 overflow-x-auto px-4 py-2.5 md:px-8">
          {SECTIONS.map((s) => (
            <li key={s.id} className="shrink-0">
              <a
                href={`#${s.id}`}
                aria-current={active === s.id ? 'location' : undefined}
                className={cn('inline-flex h-9 items-center rounded-full border px-3.5 text-meta font-medium transition-colors', active === s.id ? 'border-primary bg-primary-tint text-primary' : 'border-line bg-surface text-muted hover:text-fg')}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <Section id="claims" labelledBy="claims-title" className="scroll-mt-32">
        <SectionHeading id="claims-title" eyebrow="1 · Claims" title="Anatomy of a claim" sub="No claim reaches a passport without a source, an evidence level, a verifier, a date and an expiry." />
        <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-start">
          <dl className="overflow-hidden rounded-2xl border border-line bg-surface shadow-e1">
            {CLAIM_FIELDS.map(([k, v]) => (
              <div key={k} className="grid grid-cols-1 gap-1 border-b border-line px-5 py-3 last:border-b-0 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
                <dt className="text-meta font-semibold text-fg">{k}</dt>
                <dd className="text-meta text-muted">{v}</dd>
              </div>
            ))}
          </dl>
          <ClaimAnatomy />
        </div>
      </Section>

      <Section id="evidence" tone="surface" labelledBy="evidence-title" className="scroll-mt-32">
        <SectionHeading id="evidence-title" eyebrow="2 · Evidence levels" title="Five levels, from declared to observed" sub="E3 and E4 are different methods rather than a strict ladder, so a claim can hold both; the passport shows method badges beside the level." />
        <EvidenceLadder className="mt-10" />
      </Section>

      <Section id="status" labelledBy="status-title" className="scroll-mt-32">
        <SectionHeading id="status-title" eyebrow="3 · Status words" title="Seven words, used the same way everywhere" sub="Status is always a colour, an icon and a word, never colour alone. Expiry never deletes a verification: it marks the claim Stale, creates a re-check task, and the history stays on the passport." />
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <StatusLegend className="sm:grid-cols-1" />
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-e1">
            <p className="text-h3 font-semibold text-fg">How a claim moves</p>
            <ul className="mt-4 space-y-2.5">
              {LIFECYCLE.map((l) => (
                <li key={`${l.from}-${l.to}`} className="flex flex-wrap items-center gap-2">
                  <StatusStamp status={l.from} size="sm" />
                  <span className="inline-flex items-center gap-1 text-micro text-muted">
                    <ArrowRight className="size-3.5" aria-hidden /> {l.via} <ArrowRight className="size-3.5" aria-hidden />
                  </span>
                  <StatusStamp status={l.to} size="sm" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section id="flags" tone="surface" labelledBy="flags-title" className="scroll-mt-32">
        <SectionHeading id="flags-title" eyebrow="4 · Red flags" title="Severity has a shape as well as a colour" sub="Flags move from open to mitigated, accepted with a written rationale, or resolved. Accepting a High flag needs the analyst and compliance; a Critical flag can only be resolved, never accepted." />
        <div className="mt-10 overflow-hidden rounded-2xl border border-line bg-surface shadow-e1">
          <table className="w-full text-left text-meta max-md:block">
            <thead className="bg-sunken text-micro uppercase tracking-wider text-muted max-md:hidden">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Severity</th>
                <th scope="col" className="px-5 py-3 font-semibold">Meaning</th>
                <th scope="col" className="px-5 py-3 font-semibold">Example</th>
                <th scope="col" className="px-5 py-3 font-semibold">Effect on release</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line max-md:block">
              {FLAGS.map((f) => (
                <tr key={f.sev} className="max-md:grid max-md:gap-1 max-md:px-5 max-md:py-4">
                  <th scope="row" className="px-5 py-4 align-top font-semibold text-fg max-md:p-0">
                    <span className="inline-flex items-center gap-2">
                      <SeverityShape severity={f.sev} size={16} /> {f.name}
                    </span>
                  </th>
                  <td className="px-5 py-4 align-top text-fg max-md:p-0">{f.meaning}</td>
                  <td className="px-5 py-4 align-top text-muted max-md:p-0">{f.example}</td>
                  <td className="px-5 py-4 align-top font-medium text-fg max-md:p-0">
                    <span className="md:hidden text-muted font-normal">Effect: </span>
                    {f.effect}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="freshness" labelledBy="freshness-title" className="scroll-mt-32">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <SectionHeading id="freshness-title" eyebrow="5 · Freshness" title="Every stamp has an expiry" sub="Each claim type has its own re-check interval. Watch rules re-run the checks; a lapsed check turns the claim Stale until it is re-verified." />
          <dl className="overflow-hidden rounded-2xl border border-line bg-surface shadow-e1">
            {FRESHNESS.map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-4 border-b border-line px-5 py-3 last:border-b-0">
                <dt className="flex items-center gap-2.5 text-meta text-fg">
                  <FileClock className="size-4 shrink-0 text-muted" aria-hidden />
                  {k}
                </dt>
                <dd className="text-right text-meta font-semibold text-fg">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section id="tiers" tone="surface" labelledBy="tiers-title" className="scroll-mt-32">
        <SectionHeading id="tiers-title" eyebrow="6 · Tiers" title="Three depths of verification" sub="The release gate needs an analyst's request and compliance approval, and is blocked by any open Critical flag or unfinished required task for the tier." />
        <TierCards className="mt-10" />
      </Section>

      <Section id="completeness" labelledBy="completeness-title" className="scroll-mt-32">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
          <SectionHeading
            id="completeness-title"
            eyebrow="7 · Completeness, not scores"
            title="How well the facts are proven. Never how good the investment is."
            sub="Verification completeness is the share of a workstream's material claims at E2 or above. There is no single overall score, rating or valuation, anywhere."
          />
          <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {WORKSTREAMS.map((w, i) => (
              <li key={w.id} className="rounded-xl border border-line bg-surface p-4 shadow-e1">
                <span className="font-mono text-micro text-muted">{String(i + 1).padStart(2, '0')}</span>
                <p className="text-meta font-semibold text-fg">{w.name}</p>
                <p className="text-micro text-muted">For owners: “{w.plain.en}”</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section id="independence" tone="surface" labelledBy="independence-title" className="scroll-mt-32">
        <SectionHeading id="independence-title" eyebrow="8 · Independence and people" title="Designed so a good verdict cannot be bought" />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Principle icon={Ban} title="Nobody is paid by the party they verify">
            Experts and field verifiers are paid by SSD. Fees are fixed and never depend on the verdict or a deal.
          </Principle>
          <Principle icon={UserCheck} title="Conflicts declared per assignment">
            Before any access, for every task. Access covers one asset and one task, and it expires.
          </Principle>
          <Principle icon={Repeat} title="Random repeat visits">
            A sample of field visits is repeated by a second verifier.
          </Principle>
          <Principle icon={Bot} title="AI drafts; people decide">
            AI can propose, extract and summarise, always labelled with its source. Only a named person can set a claim to Verified or release a passport.
          </Principle>
          <Principle icon={ShieldCheck} title="Compliance by construction">
            Gates live in the workflow and are enforced by the platform's core, so a screen cannot show what the core refuses to send.
          </Principle>
          <Principle icon={Link2} title="A tamper-evident trail">
            Every view, change, approval and release is logged on a hash-chained audit trail.
          </Principle>
        </ul>
        <p className="mt-10 max-w-4xl rounded-xl border border-line bg-canvas p-5 text-meta text-muted dark:bg-raised">
          <span className="font-semibold text-fg">Scope and limits.</span> A Mine Passport is not investment advice, a valuation or an offer of securities. It reports what was checked, by whom, how and when, within the scope of the tier shown. Reliance terms are set in each engagement and approved by counsel.
        </p>
      </Section>

      <CtaBand title="Evidence you can check, from both sides." sub="Owners start with a phone number. Investors start with a conversation.">
        <HeroLink to="/owner/sign-up">Verify my licence</HeroLink>
        <HeroLink to="/for/investors#talk" variant="outline">
          Talk to SSD
        </HeroLink>
      </CtaBand>
    </>
  )
}

function Principle({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <li className="rounded-2xl border border-line bg-canvas p-5 dark:bg-raised">
      <Icon className="size-6 text-primary" aria-hidden />
      <p className="mt-3 text-body font-semibold text-fg">{title}</p>
      <p className="mt-1 text-meta text-muted">{children}</p>
    </li>
  )
}

/** Highlights the section currently in view in the on-page navigation. */
function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el)
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-140px 0px -55% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [ids.join()])
  return active
}
