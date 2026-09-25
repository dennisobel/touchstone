import { ChevronDown, Paperclip } from 'lucide-react'
import { forwardRef, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { daysBetween, daysUntil, fmtDate, fmtNumber, type Lang } from '@/lib/format'
import { flags, person, type Claim } from '@/data'
import { SeverityShape } from '../icons'
import { Tip } from '../ui'
import { EvidenceChip } from './evidence'
import { MethodBadges, VerificationStamp } from './stamp'

/** Days until a claim goes stale; striped grey once stale (UI PRD §6). */
export function FreshnessMeter({ claim, className }: { claim: Claim; className?: string }) {
  if (claim.status === 'stale') {
    return (
      <Tip content={claim.staleNote ? `Last checked ${fmtDate(claim.staleNote.lastChecked)}. Re-check scheduled for ${fmtDate(claim.staleNote.recheckOn)}.` : 'Stale'}>
        <span className={cn('inline-flex items-center gap-1.5 text-micro text-stale', className)}>
          <span className="stale-stripes h-1.5 w-12 rounded-full border border-stale-border bg-stale-fill" aria-hidden />
          Stale
        </span>
      </Tip>
    )
  }
  if (!claim.expiresOn || !claim.verifiedOn) {
    return <span className={cn('text-micro text-muted', className)}>—</span>
  }
  const total = Math.max(1, daysBetween(claim.verifiedOn, claim.expiresOn))
  const left = daysUntil(claim.expiresOn)
  const pct = Math.max(0, Math.min(100, (left / total) * 100))
  const tone = left <= 1 ? 'bg-review' : pct < 25 ? 'bg-review' : 'bg-verified'
  const label = left <= 1 ? 'Re-checks daily' : left > 365 ? `${Math.round(left / 30)} mo left` : `${fmtNumber(left)} d left`
  return (
    <Tip content={`Fresh until ${fmtDate(claim.expiresOn)}. Next scheduled check ${fmtDate(claim.expiresOn)}.`}>
      <span className={cn('inline-flex items-center gap-1.5 text-micro text-muted', className)}>
        <span className="h-1.5 w-12 overflow-hidden rounded-full bg-sunken" aria-hidden>
          <span className={cn('block h-full rounded-full', tone)} style={{ width: `${pct}%` }} />
        </span>
        <span className="tabular-nums">{label}</span>
      </span>
    </Tip>
  )
}

export function claimValue(c: Claim) {
  if (!c.value) return null
  switch (c.value.kind) {
    case 'date':
      return fmtDate(c.value.value)
    case 'number':
      return `${fmtNumber(c.value.value, c.value.value % 1 ? 1 : 0)} ${c.value.unit}`
    default:
      return c.value.value
  }
}

interface ClaimRowProps {
  claim: Claim
  expanded?: boolean
  onToggle?: () => void
  active?: boolean
  actions?: ReactNode
  lang?: Lang
  plain?: boolean
  className?: string
}

/** Claim Row: statement, typed value, stamp, evidence count, freshness, flags. Expands to evidence. */
export const ClaimRow = forwardRef<HTMLDivElement, ClaimRowProps>(function ClaimRow({ claim, expanded, onToggle, active, actions, lang = 'en', plain, className }, ref) {
  const flag = claim.flagId ? flags.find((f) => f.id === claim.flagId) : undefined
  const statement = plain && claim.plain ? claim.plain[lang] : claim.statement
  const value = claimValue(claim)
  return (
    <div
      ref={ref}
      data-claim={claim.id}
      className={cn(
        'group @container border-b border-line/80 last:border-0 transition-colors',
        active && 'bg-primary-tint/70 shadow-[inset_3px_0_0_var(--primary)]',
        claim.status === 'declared' && 'border-dashed',
        className,
      )}
    >
      <div
        role={onToggle ? 'button' : undefined}
        tabIndex={onToggle ? 0 : undefined}
        aria-expanded={onToggle ? expanded : undefined}
        onClick={onToggle}
        onKeyDown={(e) => onToggle && (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onToggle())}
        className={cn('flex flex-col gap-2 px-4 py-3 @2xl:flex-row @2xl:items-center @2xl:gap-3 @2xl:py-2.5', onToggle && 'cursor-pointer hover:bg-sunken/60')}
      >
        <div className="flex min-w-0 flex-1 items-start gap-2">
          {flag && (
            <Tip content={`${flag.severity[0].toUpperCase() + flag.severity.slice(1)} flag: ${flag.title}`}>
              <span className="mt-1">
                <SeverityShape severity={flag.severity} size={14} />
                <span className="sr-only">{flag.severity} flag</span>
              </span>
            </Tip>
          )}
          <div className="min-w-0">
            <p className={cn('text-body text-fg', claim.status === 'declared' && 'text-muted')}>{statement}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-micro text-muted">
              {value && <span className="font-mono text-[12px] text-fg">{value}</span>}
              {!claim.material && <span>Not material</span>}
              <span className="inline-flex items-center gap-1">
                <Paperclip className="size-3" aria-hidden />
                {claim.evidence.length} evidence
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 @2xl:flex-nowrap @2xl:justify-end">
          <VerificationStamp claim={claim} lang={lang} />
          <FreshnessMeter claim={claim} className="ml-auto @2xl:ml-0" />
          {onToggle && <ChevronDown className={cn('hidden size-4 text-muted transition-transform @2xl:block', expanded && 'rotate-180')} aria-hidden />}
        </div>
      </div>
      {expanded && (
        <div className="space-y-3 px-4 pb-4 animate-fade-in @2xl:pl-10">
          <div className="flex flex-wrap items-center gap-2 text-micro text-muted">
            <MethodBadges methods={claim.methods} />
            <span>{claim.method ?? 'No verification yet'}</span>
            {claim.verifierId && <span>· {person(claim.verifierId).name}</span>}
            {claim.source && <span>· Source: {claim.source}</span>}
          </div>
          {claim.dispute && (
            <div className="grid gap-2 @xl:grid-cols-2">
              <div className="rounded-sm border border-line bg-surface p-3">
                <p className="text-micro font-semibold text-muted">Finding</p>
                <p className="mt-1 text-meta text-fg">{claim.dispute.finding}</p>
              </div>
              <div className="rounded-sm border border-disputed-border bg-disputed-fill p-3">
                <p className="text-micro font-semibold text-disputed">Owner's reply · {fmtDate(claim.dispute.replyOn)}</p>
                <p className="mt-1 text-meta text-fg">{claim.dispute.reply}</p>
              </div>
            </div>
          )}
          {claim.staleNote && (
            <p className="rounded-sm border border-stale-border bg-stale-fill px-3 py-2 text-meta text-fg">
              Last checked {Math.round(daysBetween(claim.staleNote.lastChecked, '2026-09-24') / 30)} months ago. Re-check scheduled for {fmtDate(claim.staleNote.recheckOn)}.
            </p>
          )}
          {claim.evidence.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {claim.evidence.map((e, i) => (
                <EvidenceChip key={i} ev={e} />
              ))}
            </div>
          ) : (
            <p className="text-meta text-muted">No evidence supplied yet.</p>
          )}
          {actions}
        </div>
      )}
    </div>
  )
})
