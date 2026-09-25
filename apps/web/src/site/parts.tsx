import { Check, Gavel, Leaf, MapPinCheck, Microscope, X } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import type { Lang } from '@/lib/format'
import { CLAIM_STATUS_LABEL, EVIDENCE_LEVELS, person, type ClaimStatus, type EvidenceLevel, type Tier } from '@/data'
import { EvidenceBadge, StatusStamp, TierBadge } from '@/ds/components'
import { StampIcon } from '@/ds/icons'
import { Avatar } from '@/ds/ui'

/* ——— Content shared by the landing page and the audience pages (from Platform PRD §4–5) ——— */

type TierCopy = { name: string; duration: string; lead?: string; scope: string[] }

// Swahili is a draft: it must be reviewed by a native speaker before launch (as in the Owner App).
export const TIERS: ({ id: Tier; sw: TierCopy } & TierCopy)[] = [
  {
    id: 'desk',
    name: 'Desk screen',
    duration: '10 working days',
    scope: ['Identity and company checks', 'Sanctions and adverse-media screening', 'Mining cadastre status and boundary check', 'Document review', 'Satellite snapshot of the licence area'],
    sw: {
      name: 'Ukaguzi wa awali',
      duration: 'siku 10 za kazi',
      scope: ['Ukaguzi wa utambulisho na kampuni', 'Uchunguzi wa vikwazo na habari mbaya', 'Hali ya leseni kwenye kadastra na ukaguzi wa mipaka', 'Mapitio ya nyaraka', 'Picha ya setilaiti ya eneo la leseni'],
    },
  },
  {
    id: 'standard',
    name: 'Standard',
    duration: '30 days',
    lead: 'Everything in Desk screen, plus',
    scope: ['Title opinion from a mining lawyer', 'Beneficial owners traced to real people', 'Environmental and social desk review', 'Geologist desk review', 'One-day site visit'],
    sw: {
      name: 'Kawaida',
      duration: 'siku 30',
      lead: 'Kila kitu katika Ukaguzi wa awali, pamoja na',
      scope: ['Maoni ya wakili wa madini kuhusu uhalali wa leseni', 'Wamiliki halisi wa kampuni wanatambuliwa', 'Mapitio ya mazingira na jamii', 'Mapitio ya mwanajiolojia', 'Ziara ya siku moja kwenye eneo'],
    },
  },
  {
    id: 'investor_ready',
    name: 'Investor-ready',
    duration: '8–10 weeks',
    lead: 'Everything in Standard, plus',
    scope: ['Full resource review by a Qualified Person', 'Field environmental and social assessment, with community input', 'Technical and infrastructure review', 'An organised data room'],
    sw: {
      name: 'Tayari kwa wawekezaji',
      duration: 'wiki 8–10',
      lead: 'Kila kitu katika Kawaida, pamoja na',
      scope: ['Mapitio kamili ya rasilimali na Mtaalamu Aliyehitimu', 'Tathmini ya mazingira na jamii eneoni, pamoja na maoni ya jamii', 'Mapitio ya kiufundi na miundombinu', 'Chumba cha data kilichopangwa'],
    },
  },
]

export const DOES = [
  'Verify facts and publish how well each is proven',
  'Qualify investors and document every relationship',
  'Introduce parties, with approval and a log',
  'Host NDAs, data rooms and moderated questions',
  'Charge subscriptions and fixed fees',
]

export const DOES_NOT = [
  'Recommend investments or rate their merit',
  'Value assets for investors',
  'Negotiate terms for either party',
  'Hold investor money or securities',
  'Take fees tied to a deal closing',
]

export const SSD_TEAM = ['james', 'sarah', 'kevin', 'aisha']

export const DISCIPLINES = [
  { icon: Microscope, title: 'Resource geologists', body: 'Qualified Persons registered with recognised professional bodies review data and estimates.' },
  { icon: Gavel, title: 'Mining lawyers', body: 'Advocates write title opinions on validity, ownership, charges and consents.' },
  { icon: Leaf, title: 'ESG and community specialists', body: 'Registered experts check permits, protected areas and community agreements.' },
  { icon: MapPinCheck, title: 'Field verifiers', body: 'Geologists visit the site and capture tamper-evident photos, samples and interviews.' },
]

export const STATUS_MEANING: { status: ClaimStatus; meaning: string }[] = [
  { status: 'verified', meaning: 'Confirmed by a named verifier, within its freshness window' },
  { status: 'in_review', meaning: 'Evidence is in and being checked' },
  { status: 'discrepancy', meaning: 'The evidence conflicts with what was declared' },
  { status: 'disputed', meaning: 'The owner has replied to a discrepancy; SSD is resolving it' },
  { status: 'stale', meaning: 'The check has expired and a re-check is scheduled' },
  { status: 'declared', meaning: 'The owner says so; nothing checked yet' },
  { status: 'unverifiable', meaning: 'No reliable source could be reached' },
]

/* ——— Parts ——— */

export function TierCards({ cta, className, lang = 'en' }: { cta?: (tier: Tier) => ReactNode; className?: string; lang?: Lang }) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 lg:grid-cols-3', className)}>
      {TIERS.map((tier) => {
        const t = lang === 'sw' ? { ...tier.sw, id: tier.id } : tier
        return (
        <article key={t.id} className={cn('flex flex-col rounded-2xl border bg-surface p-6 shadow-e1', t.id === 'standard' ? 'border-primary/40 ring-1 ring-primary/20' : 'border-line')}>
          <div className="flex items-center justify-between gap-3">
            <TierBadge tier={t.id} />
            <span className="text-micro font-medium text-muted">
              {lang === 'sw' ? 'Lengo' : 'Target'} {t.duration}
            </span>
          </div>
          <h3 className="mt-4 font-serif text-[26px] leading-[32px] font-semibold text-fg">{t.name}</h3>
          <p className="mt-1 text-meta font-medium text-fg">{lang === 'sw' ? 'Ada ya kudumu, inayoonyeshwa kabla ya kulipa' : 'Fixed fee, quoted before you pay'}</p>
          {t.lead && <p className="mt-4 text-micro font-semibold uppercase tracking-wider text-muted">{t.lead}</p>}
          <ul className={cn('space-y-2.5', t.lead ? 'mt-2' : 'mt-4')}>
            {t.scope.map((s) => (
              <li key={s} className="flex gap-2.5 text-meta text-fg">
                <Check className="mt-0.5 size-4 shrink-0 text-verified" aria-hidden />
                {s}
              </li>
            ))}
          </ul>
          {cta && <div className="mt-auto pt-6">{cta(t.id)}</div>}
        </article>
        )
      })}
    </div>
  )
}

export function DoesDoesNot({ className }: { className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 md:grid-cols-2', className)}>
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-e1">
        <p className="text-h3 font-semibold text-fg">SSD does</p>
        <ul className="mt-4 space-y-3">
          {DOES.map((d) => (
            <li key={d} className="flex gap-3 text-body text-fg">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-verified-fill text-verified">
                <Check className="size-3.5" strokeWidth={3} aria-hidden />
              </span>
              {d}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-e1">
        <p className="text-h3 font-semibold text-fg">SSD does not</p>
        <ul className="mt-4 space-y-3">
          {DOES_NOT.map((d) => (
            <li key={d} className="flex gap-3 text-body text-fg">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-sunken text-muted">
                <X className="size-3.5" strokeWidth={3} aria-hidden />
              </span>
              {d}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** A generic example claim (no real asset): the passport-and-stamps metaphor made concrete. */
export function ClaimAnatomy({ className }: { className?: string }) {
  const rows: { label: string; value: ReactNode }[] = [
    { label: 'Who checked it', value: 'A mining lawyer registered with the Law Society of Kenya' },
    {
      label: 'How',
      value: (
        <span className="flex flex-wrap items-center gap-1.5">
          Title opinion and cadastre check <EvidenceBadge level={3} /> <EvidenceBadge level={2} />
        </span>
      ),
    },
    { label: 'When', value: '10 Sep 2026' },
    {
      label: 'Until',
      value: (
        <span className="block">
          10 Oct 2026 · re-checked every 30 days
          <span className="mt-2 block h-1.5 w-full overflow-hidden rounded-full bg-sunken" aria-hidden>
            <span className="block h-full w-[46%] rounded-full bg-verified" />
          </span>
          <span className="mt-1 block text-micro text-muted">16 of 30 days left</span>
        </span>
      ),
    },
  ]
  return (
    <div className={cn('relative rounded-2xl border border-line bg-surface p-5 shadow-e2 md:p-6', className)}>
      <RoundStamp className="pointer-events-none absolute -right-1 -top-7 size-24 rotate-[14deg] text-verified/70 sm:-right-4 sm:size-28 md:-right-8 md:size-32" />
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-micro font-semibold uppercase tracking-[0.14em] text-muted">Example claim</span>
        <span className="text-micro text-muted">· Title and tenure</span>
      </div>
      <p className="mt-2 max-w-[85%] font-serif text-[22px] leading-[29px] font-semibold text-fg">The prospecting licence is active until March 2027</p>
      <div className="mt-3">
        <StatusStamp status="verified" size="lg" />
      </div>
      <dl className="mt-5 divide-y divide-line border-t border-line">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[132px_minmax(0,1fr)] sm:gap-4">
            <dt className="text-micro font-semibold uppercase tracking-wider text-brand">{r.label}</dt>
            <dd className="text-meta text-fg">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function EvidenceLadder({ className }: { className?: string }) {
  return (
    <ol className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5', className)}>
      {EVIDENCE_LEVELS.map((e) => (
        <li key={e.code} className="rounded-xl border border-line bg-surface p-4 shadow-e1">
          <EvidenceBadge level={e.level as EvidenceLevel} showName />
          <p className="mt-2 text-meta text-muted">{e.meaning}</p>
        </li>
      ))}
    </ol>
  )
}

export function StatusLegend({ className }: { className?: string }) {
  return (
    <ul className={cn('grid grid-cols-1 gap-2 sm:grid-cols-2', className)}>
      {STATUS_MEANING.map((s) => (
        <li key={s.status} className="flex items-start gap-3 rounded-lg border border-line bg-surface p-3">
          <StatusStamp status={s.status} className="mt-px" />
          <span className="text-meta text-muted">
            <span className="sr-only">{CLAIM_STATUS_LABEL[s.status]}: </span>
            {s.meaning}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function TeamGrid({ ids = SSD_TEAM, className }: { ids?: string[]; className?: string }) {
  return (
    <ul className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {ids.map((id) => {
        const p = person(id)
        return (
          <li key={id} className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4 shadow-e1 lg:flex-col lg:items-start">
            <Avatar id={id} size={56} />
            <span className="min-w-0">
              <span className="block text-body font-semibold text-fg">{p.name}</span>
              <span className="block text-meta text-muted">{p.role}</span>
              <span className="mt-1 block text-micro text-muted">{p.location}</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export function DisciplineGrid({ className }: { className?: string }) {
  return (
    <ul className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {DISCIPLINES.map((d) => (
        <li key={d.title} className="rounded-xl border border-line bg-surface p-5 shadow-e1">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary-tint text-primary">
            <d.icon className="size-5" aria-hidden />
          </span>
          <p className="mt-3 text-body font-semibold text-fg">{d.title}</p>
          <p className="mt-1 text-meta text-muted">{d.body}</p>
        </li>
      ))}
    </ul>
  )
}

/** Round rubber-stamp mark (decorative). */
export function RoundStamp({ className, label = 'TOUCHSTONE • VERIFIED • SSD • ' }: { className?: string; label?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <defs>
        <path id={`stamp-${id}`} d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
      </defs>
      <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="60" cy="60" r="33" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <text fontSize="10" fontWeight="700" fill="currentColor" style={{ fontFamily: 'var(--font-sans)' }}>
        <textPath href={`#stamp-${id}`} textLength="272" lengthAdjust="spacing">
          {label}
        </textPath>
      </text>
      <StampIcon x={42} y={40} width={36} height={36} strokeWidth={1.8} />
    </svg>
  )
}
