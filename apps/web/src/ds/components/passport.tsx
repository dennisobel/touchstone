import { CalendarClock, ChevronRight, History, MapPin, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { fmtDate, type Lang } from '@/lib/format'
import {
  claimsFor,
  flagCounts,
  flags,
  person,
  TIER_BADGE,
  WORKSTREAMS,
  type Asset,
  type Severity,
  type Tier,
  type WorkstreamId,
} from '@/data'
import { SeverityShape, StampIcon } from '../icons'
import { Avatar, Chip, Progress } from '../ui'
import { StatusStamp } from './stamp'

export function TierBadge({ tier, className, size = 'md' }: { tier: Tier; className?: string; size?: 'sm' | 'md' }) {
  const tone =
    tier === 'investor_ready'
      ? 'bg-primary text-on-primary border-primary'
      : tier === 'standard'
        ? 'bg-primary-tint text-primary border-primary/40'
        : 'bg-surface text-fg border-line-strong'
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full border font-semibold',
        size === 'sm' ? 'h-5 px-2 text-[11px] [&_svg]:size-3' : 'h-7 px-2.5 text-micro [&_svg]:size-3.5',
        tone,
        className,
      )}
    >
      <StampIcon />
      {TIER_BADGE[tier]}
    </span>
  )
}

const SEV: Severity[] = ['critical', 'high', 'medium', 'low']
const SEV_WORD: Record<Severity, string> = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' }

export function FlagCounts({ counts, className, showZero = true, compact }: { counts: Record<Severity, number>; className?: string; showZero?: boolean; compact?: boolean }) {
  return (
    <span className={cn('inline-flex flex-wrap items-center gap-x-3 gap-y-1', className)} aria-label={SEV.map((s) => `${counts[s]} ${SEV_WORD[s]}`).join(', ')}>
      {SEV.filter((s) => showZero || counts[s] > 0).map((s) => (
        <span key={s} className={cn('inline-flex items-center gap-1 text-micro tabular-nums', counts[s] ? 'text-fg font-semibold' : 'text-muted')}>
          <SeverityShape severity={s} size={13} className={counts[s] ? '' : 'opacity-35'} />
          {counts[s]}
          {!compact && <span className="font-normal text-muted">{SEV_WORD[s]}</span>}
        </span>
      ))}
    </span>
  )
}

export function assetFlagCounts(assetId: string) {
  return flagCounts(assetId, flags)
}

interface PassportHeaderProps {
  asset: Asset
  /** teaser = anonymised code, region only; full = named after NDA; internal = SSD view */
  view: 'library' | 'teaser' | 'full' | 'internal'
  actions?: ReactNode
  className?: string
  compact?: boolean
}

export function PassportHeader({ asset, view, actions, className, compact }: PassportHeaderProps) {
  const anonymous = view === 'library' || view === 'teaser'
  const counts = assetFlagCounts(asset.id)
  const p = asset.passport
  return (
    <header className={cn('rounded-lg border border-line bg-surface shadow-e1', className)}>
      <div className={cn('flex flex-col gap-4 p-4 md:p-5 lg:flex-row lg:items-start', compact && 'md:p-4')}>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <TierBadge tier={asset.tier} />
            {asset.tierInProgress && (
              <span className="text-micro text-muted">
                {asset.tierInProgress === 'investor_ready' ? 'Investor-ready' : 'Standard'} review in progress
              </span>
            )}
            {p.status !== 'released' && <Chip tone="review">{p.status === 'findings_review' ? 'In findings review' : 'Draft'}</Chip>}
          </div>
          <div>
            <h1 className={cn('font-serif font-semibold text-fg text-balance', view === 'internal' ? 'text-passport-sm' : 'text-passport-sm md:text-passport')}>
              {anonymous ? asset.code : asset.name}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-muted">
              {!anonymous && <span className="font-mono text-[13px]">{asset.code}</span>}
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" aria-hidden />
                {anonymous ? `${asset.region}, ${asset.country}` : `${asset.county}, ${asset.country}`}
              </span>
              <span aria-hidden>·</span>
              <span>{asset.stage}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="outline">{asset.commodity}</Chip>
            <Chip tone="outline">{asset.licence.type}</Chip>
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">{actions}</div>}
      </div>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-b-lg border-t border-line bg-line md:grid-cols-4">
        <HeaderStat
          icon={<History />}
          label="Version"
          value={p.version ? `v${p.version} · released ${fmtDate(p.releasedOn!)}` : `Draft v${p.draftVersion ?? 1}`}
          sub={p.draftVersion && p.version ? `v${p.draftVersion} in progress` : undefined}
        />
        <HeaderStat icon={<CalendarClock />} label="As of" value={fmtDate('2026-09-24')} sub="09:30 EAT" />
        <HeaderStat
          icon={<ShieldCheck />}
          label="Freshness"
          value={asset.fresh.total ? `${asset.fresh.fresh} of ${asset.fresh.total} material claims fresh` : 'Not yet assessed'}
        />
        <div className="bg-surface px-4 py-3">
          <p className="text-micro font-medium uppercase tracking-wide text-muted">Red flags</p>
          <FlagCounts counts={counts} className="mt-1.5" compact />
        </div>
      </div>
    </header>
  )
}

function HeaderStat({ icon, label, value, sub }: { icon: ReactNode; label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="bg-surface px-4 py-3">
      <p className="flex items-center gap-1 text-micro font-medium uppercase tracking-wide text-muted [&_svg]:size-3.5">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-meta font-medium text-fg">{value}</p>
      {sub && <p className="text-micro text-muted">{sub}</p>}
    </div>
  )
}

const NOMINAL: Record<WorkstreamId, number> = { title: 6, ownership: 3, integrity: 4, geology: 7, technical: 7, esg: 6, legal: 5 }

export function workstreamProgress(asset: Asset, ws: WorkstreamId) {
  const material = claimsFor(asset.id).filter((c) => c.workstream === ws && c.material)
  const total = material.length || NOMINAL[ws]
  const proven = material.length ? material.filter((c) => c.level >= 2 && c.status !== 'stale').length : Math.round((asset.completeness[ws] / 100) * total)
  const lastVerified = material
    .map((c) => c.verifiedOn)
    .filter(Boolean)
    .sort()
    .at(-1)
  return { total, proven, pct: total ? (proven / total) * 100 : 0, lastVerified }
}

/** Workstream Card: completeness bar (never a score out of 100), open flags, last verified, responsible person. */
export function WorkstreamCard({
  asset,
  ws,
  plain,
  lang = 'en',
  onClick,
  responsibleId,
  className,
}: {
  asset: Asset
  ws: WorkstreamId
  plain?: boolean
  lang?: Lang
  onClick?: () => void
  responsibleId?: string
  className?: string
}) {
  const w = WORKSTREAMS.find((x) => x.id === ws)!
  const { total, proven, pct, lastVerified } = workstreamProgress(asset, ws)
  const wsFlags = flags.filter((f) => f.assetId === asset.id && f.workstream === ws && f.status !== 'resolved')
  const status = asset.workstreamStatus[ws]
  const who = responsibleId ?? asset.analystId
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      onClick={onClick}
      className={cn(
        'flex w-full flex-col gap-3 rounded-lg border border-line bg-surface p-4 text-left shadow-e1',
        onClick && 'pressable transition-shadow hover:shadow-e2 hover:border-line-strong/50',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-h3 font-semibold text-fg">{plain ? w.plain[lang] : w.name}</h3>
          {plain && <p className="text-micro text-muted">{w.name}</p>}
        </div>
        {onClick && <ChevronRight className="mt-1 size-4 shrink-0 text-muted" aria-hidden />}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StatusStamp status={status} size="sm" lang={lang} />
        {wsFlags.map((f) => (
          <span key={f.id} className="inline-flex items-center gap-1 text-micro text-fg">
            <SeverityShape severity={f.severity} size={12} />
            <span className="sr-only">{f.severity} flag:</span>
            <span className="max-w-40 truncate">{f.title}</span>
          </span>
        ))}
      </div>
      <div className="space-y-1.5">
        <Progress value={pct} tone={pct >= 80 ? 'verified' : pct >= 40 ? 'primary' : 'review'} label={`${proven} of ${total} material claims proven`} />
        <p className="text-micro text-muted">
          <span className="font-semibold text-fg tabular-nums">
            {proven} of {total}
          </span>{' '}
          {lang === 'sw' ? 'madai muhimu yamethibitishwa' : 'material claims proven (E2 or above)'}
        </p>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-line pt-3 text-micro text-muted">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <Avatar id={who} size={20} />
          <span className="truncate">{person(who).name}</span>
        </span>
        <span className="shrink-0">{lastVerified ? `Last verified ${fmtDate(lastVerified, lang)}` : lang === 'sw' ? 'Bado' : 'Not yet verified'}</span>
      </div>
    </Comp>
  )
}
