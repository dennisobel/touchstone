import { BadgeCheck, Circle, CircleQuestionMark, FileText, Hourglass, Link2, MapPinCheck, MessagesSquare, OctagonAlert, type LucideIcon } from 'lucide-react'
import type { ReactNode, SVGProps } from 'react'
import { cn } from '@/lib/cn'
import { fmtDate, fmtDateLong, fmtDay, type Lang } from '@/lib/format'
import { CLAIM_STATUS_LABEL, CLAIM_STATUS_LABEL_SW, EVIDENCE_LEVELS, person, type Claim, type ClaimStatus, type EvidenceLevel } from '@/data'
import { StampIcon } from '../icons'
import { Popover } from '../ui'
import { EvidenceChip } from './evidence'

export function ClockSlashIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
      <path d="M12 7v5l2 1.2" />
      <path d="M20.2 15.5A9 9 0 0 0 8.5 3.7M5.6 5.6A9 9 0 0 0 18.4 18.4" />
      <path d="m3 3 18 18" />
    </svg>
  )
}

type IconType = LucideIcon | ((p: SVGProps<SVGSVGElement>) => ReactNode)

export const STATUS_META: Record<ClaimStatus, { Icon: IconType; className: string }> = {
  verified: { Icon: BadgeCheck, className: 'bg-verified-fill text-verified border-verified-border' },
  in_review: { Icon: Hourglass, className: 'bg-review-fill text-review border-review-border' },
  discrepancy: { Icon: OctagonAlert, className: 'bg-critical-fill text-critical border-critical-border' },
  disputed: { Icon: MessagesSquare, className: 'bg-disputed-fill text-disputed border-disputed-border' },
  stale: { Icon: ClockSlashIcon, className: 'bg-stale-fill stale-stripes text-stale border-stale-border' },
  unverifiable: { Icon: CircleQuestionMark, className: 'bg-unverifiable-fill text-unverifiable border-unverifiable-border border-dotted' },
  declared: { Icon: Circle, className: 'bg-transparent text-declared border-declared-border border-dashed' },
}

/** Status is always colour + icon + word (UI PRD §8). */
export function StatusStamp({ status, size = 'md', lang = 'en', className, label }: { status: ClaimStatus; size?: 'sm' | 'md' | 'lg'; lang?: Lang; className?: string; label?: string }) {
  const { Icon, className: tone } = STATUS_META[status]
  const word = label ?? (lang === 'sw' ? CLAIM_STATUS_LABEL_SW : CLAIM_STATUS_LABEL)[status]
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-sm border font-semibold',
        size === 'sm' && 'h-5 px-1.5 text-[11px] [&_svg]:size-3',
        size === 'md' && 'h-6 px-2 text-micro [&_svg]:size-3.5',
        size === 'lg' && 'h-8 px-2.5 text-meta [&_svg]:size-4',
        tone,
        className,
      )}
    >
      <Icon />
      {word}
    </span>
  )
}

const LEVEL_STYLE: Record<EvidenceLevel, { Icon: IconType; className: string }> = {
  0: { Icon: Circle, className: 'border-dashed border-line-strong text-muted bg-transparent' },
  1: { Icon: FileText, className: 'border-line-strong text-fg bg-surface' },
  2: { Icon: Link2, className: 'border-primary text-primary bg-surface' },
  3: { Icon: StampIcon, className: 'border-primary bg-primary text-on-primary' },
  4: { Icon: MapPinCheck, className: 'border-primary bg-primary text-on-primary' },
}

export function EvidenceBadge({ level, showName, className }: { level: EvidenceLevel; showName?: boolean; className?: string }) {
  const { Icon, className: tone } = LEVEL_STYLE[level]
  const meta = EVIDENCE_LEVELS[level]
  return (
    <span
      title={`${meta.code} ${meta.name}: ${meta.meaning}`}
      className={cn('inline-flex h-6 shrink-0 items-center gap-1 rounded-sm border px-1.5 text-micro font-semibold [&_svg]:size-3.5', tone, className)}
    >
      <Icon />
      {meta.code}
      {showName && <span className="font-medium">{meta.name}</span>}
    </span>
  )
}

export function MethodBadges({ methods }: { methods: EvidenceLevel[] }) {
  return (
    <span className="inline-flex gap-1">
      {methods.map((m) => (
        <EvidenceBadge key={m} level={m} />
      ))}
    </span>
  )
}

/** "Verified by Wanjiru Kamau, expert-verified, on 10 September 2026." */
export function stampSentence(c: Claim) {
  const who = c.verifierId ? person(c.verifierId).name : undefined
  const level = EVIDENCE_LEVELS[c.level].name.toLowerCase()
  const status = CLAIM_STATUS_LABEL[c.status]
  if (c.status === 'verified' && who && c.verifiedOn) return `Verified by ${who}, ${level}, on ${fmtDateLong(c.verifiedOn)}.`
  if (c.status === 'stale' && c.staleNote) return `Stale. Last checked on ${fmtDateLong(c.staleNote.lastChecked)}; re-check scheduled for ${fmtDateLong(c.staleNote.recheckOn)}.`
  return `${status}${who ? `, ${who}` : ''}, ${level}.`
}

/**
 * Verification Stamp: status, evidence-level icon, verifier initials and date.
 * Tap or hover opens verifier, credential, method, dates and evidence links.
 */
export function VerificationStamp({ claim, compact, lang = 'en' }: { claim: Claim; compact?: boolean; lang?: Lang }) {
  const { Icon, className: tone } = STATUS_META[claim.status]
  const { Icon: LIcon } = LEVEL_STYLE[claim.level]
  const v = claim.verifierId ? person(claim.verifierId) : undefined
  const initialsText = v ? v.name.replace(/^Dr\s+/, '').split(' ').map((n) => n[0]).join('') : '—'
  const word = (lang === 'sw' ? CLAIM_STATUS_LABEL_SW : CLAIM_STATUS_LABEL)[claim.status]
  return (
    <Popover
      className="w-80"
      trigger={
        <button
          type="button"
          aria-label={stampSentence(claim)}
          className={cn('pressable inline-flex h-7 shrink-0 items-center overflow-hidden rounded-sm border text-micro font-semibold [&_svg]:size-3.5 max-md:h-8', tone)}
        >
          <span className="inline-flex items-center gap-1 px-1.5">
            <Icon />
            {word}
          </span>
          {!compact && (v || claim.verifiedOn) && (
            <span className="inline-flex h-full items-center gap-1 border-l border-current/25 px-1.5 font-medium">
              <LIcon />
              <span className="font-mono text-[11px]">{initialsText}</span>
              {claim.verifiedOn && <span className="tabular-nums">· {fmtDay(claim.verifiedOn, lang)}</span>}
            </span>
          )}
        </button>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <StatusStamp status={claim.status} lang={lang} />
          <EvidenceBadge level={claim.level} showName />
        </div>
        {v ? (
          <div>
            <p className="text-meta font-semibold text-fg">{v.name}</p>
            <p className="text-micro text-muted">{v.role}</p>
            {v.credential && (
              <p className="mt-1 text-micro text-muted">
                {v.credentialBody} · <span className="font-mono">{v.credential}</span>
              </p>
            )}
          </div>
        ) : (
          <p className="text-meta text-muted">No verifier yet: {claim.source ?? 'owner declaration'}.</p>
        )}
        <dl className="grid grid-cols-2 gap-2 text-micro">
          <div className="col-span-2">
            <dt className="text-muted">Method</dt>
            <dd className="text-fg">{claim.method ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted">Verified on</dt>
            <dd className="text-fg">{claim.verifiedOn ? fmtDate(claim.verifiedOn) : '—'}</dd>
          </div>
          <div>
            <dt className="text-muted">{claim.status === 'stale' ? 'Re-check' : 'Expires on'}</dt>
            <dd className="text-fg">{claim.staleNote ? fmtDate(claim.staleNote.recheckOn) : claim.expiresOn ? fmtDate(claim.expiresOn) : '—'}</dd>
          </div>
        </dl>
        {claim.evidence.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-micro font-medium text-muted">Evidence</p>
            <div className="flex flex-wrap gap-1.5">
              {claim.evidence.map((e, i) => (
                <EvidenceChip key={i} ev={e} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Popover>
  )
}
