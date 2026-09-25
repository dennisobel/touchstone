import {
  ArrowRight,
  Camera,
  CircleCheck,
  CloudOff,
  Compass,
  Link2,
  LocateFixed,
  MapPin,
  MessageCircle,
  Mic,
  RefreshCw,
  RotateCcw,
  Sparkles,
  ThumbsDown,
  Wifi,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { fmtDate, fmtDateTime, fmtTime, NOW } from '@/lib/format'
import { assetFlagCounts, FlagCounts, TierBadge } from './passport'
import { person, shortHash, type Asset, type AuditEvent } from '@/data'
import { FingerprintPattern } from 'lucide-react'
import { Avatar, Button, Checkbox, Chip, IconButton, Switch } from '../ui'

export function AsOf({ at = NOW, zone = 'EAT', className, label = 'As of' }: { at?: string | Date; zone?: string; className?: string; label?: string }) {
  return (
    <p className={cn('text-micro text-muted tabular-nums', className)}>
      {label} {fmtDateTime(at, zone)}
    </p>
  )
}

export function Banner({
  tone = 'info',
  icon,
  title,
  children,
  action,
  className,
}: {
  tone?: 'info' | 'offline' | 'warning' | 'success' | 'critical' | 'neutral'
  icon?: ReactNode
  title?: ReactNode
  children?: ReactNode
  action?: ReactNode
  className?: string
}) {
  const tones = {
    info: 'bg-primary-tint border-primary/25 text-fg [&_.bi]:text-primary',
    offline: 'bg-fg text-canvas border-transparent [&_.bi]:text-canvas',
    warning: 'bg-review-fill border-review-border text-fg [&_.bi]:text-review',
    success: 'bg-verified-fill border-verified-border text-fg [&_.bi]:text-verified',
    critical: 'bg-critical-fill border-critical-border text-fg [&_.bi]:text-critical',
    neutral: 'bg-sunken border-line text-fg [&_.bi]:text-muted',
  }
  return (
    <div role={tone === 'critical' ? 'alert' : 'status'} className={cn('flex items-start gap-3 rounded-lg border p-3.5', tones[tone], className)}>
      {icon && <span className="bi mt-0.5 shrink-0 [&_svg]:size-5">{icon}</span>}
      <div className="min-w-0 flex-1 text-meta">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && 'mt-0.5', tone === 'offline' ? 'text-canvas/80' : 'text-muted')}>{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

/** Empty State: never a blank panel; says what belongs here, the next step and a named contact. */
export function EmptyState({
  icon,
  title,
  body,
  action,
  contactId,
  className,
  compact,
}: {
  icon?: ReactNode
  title: ReactNode
  body?: ReactNode
  action?: ReactNode
  contactId?: string
  className?: string
  compact?: boolean
}) {
  return (
    <div className={cn('flex flex-col items-center rounded-lg border border-dashed border-line-strong/50 bg-surface/60 text-center', compact ? 'p-5' : 'px-6 py-10', className)}>
      {icon && <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary-tint text-primary [&_svg]:size-6">{icon}</div>}
      <p className="text-h3 font-semibold text-fg">{title}</p>
      {body && <p className="mt-1 max-w-md text-meta text-muted text-balance">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
      {contactId && (
        <p className="mt-4 inline-flex items-center gap-2 text-micro text-muted">
          <Avatar id={contactId} size={20} />
          Your contact: <span className="font-medium text-fg">{person(contactId).name}</span>
        </p>
      )}
    </div>
  )
}

/** Explain-This Toggle: plain-English version of a technical block, labelled with its approver. */
export function ExplainThis({
  technical,
  plain,
  approvedBy = 'kevin',
  approvedOn = '2026-09-18',
  defaultOn = false,
  className,
}: {
  technical: ReactNode
  plain: ReactNode
  approvedBy?: string
  approvedOn?: string
  defaultOn?: boolean
  className?: string
}) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-end">
        <label className="inline-flex cursor-pointer items-center gap-2 text-micro font-medium text-primary">
          <Sparkles className="size-3.5" aria-hidden />
          Explain this
          <Switch checked={on} onCheckedChange={setOn} />
        </label>
      </div>
      {on ? (
        <div className="rounded-lg border border-primary/25 bg-primary-tint/60 p-3.5 animate-fade-in">
          <div className="text-body text-fg">{plain}</div>
          <p className="mt-2 text-micro text-muted">
            Drafted by AI, approved by {person(approvedBy).name}, {fmtDate(approvedOn)}
          </p>
        </div>
      ) : (
        <div>{technical}</div>
      )}
    </div>
  )
}

/** Teaser Card: anonymised facts, flags first; actions Interested / Not now / Ask SSD; no urgency elements. */
export function TeaserCard({
  asset: a,
  status,
  onInterested,
  onNotNow,
  onAsk,
  onOpen,
  className,
  sentOn,
}: {
  asset: Asset
  status?: 'waiting' | 'interested' | 'not_now'
  onInterested?: () => void
  onNotNow?: () => void
  onAsk?: () => void
  onOpen?: () => void
  className?: string
  sentOn?: string
}) {
  const counts = assetFlagCounts(a.id)
  return (
    <article className={cn('rounded-lg border border-line bg-surface shadow-e1', status === 'not_now' && 'opacity-75', className)}>
      <button type="button" onClick={onOpen} className="block w-full p-4 text-left pressable" disabled={!onOpen}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-[13px] font-medium text-muted">{a.code}</p>
          {status === 'not_now' ? <Chip tone="neutral">Not now</Chip> : status === 'interested' ? <Chip tone="verified">Interested</Chip> : <Chip tone="primary">Teaser</Chip>}
        </div>
        <p className="mt-1 font-serif text-h2 font-semibold text-fg">
          {a.commodity}, {a.region}
        </p>
        <p className="text-meta text-muted">
          {a.country} · {a.stage}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <TierBadge tier={a.tier} size="sm" />
          <FlagCounts counts={counts} compact showZero={false} />
        </div>
        {a.capitalSought && (
          <dl className="mt-3 grid grid-cols-2 gap-2 rounded-sm bg-sunken/70 p-2.5 text-micro">
            <div>
              <dt className="text-muted">Capital sought</dt>
              <dd className="font-medium text-fg">{a.capitalSought}</dd>
            </div>
            <div>
              <dt className="text-muted">Structure</dt>
              <dd className="font-medium text-fg">{a.structure}</dd>
            </div>
          </dl>
        )}
        {sentOn && <p className="mt-2 text-micro text-muted">Sent by SSD on {fmtDate(sentOn)}</p>}
      </button>
      {status === 'waiting' && (onInterested || onNotNow || onAsk) && (
        <div className="flex flex-wrap gap-2 border-t border-line p-3">
          {onInterested && (
            <Button size="sm" onClick={onInterested} iconRight={<ArrowRight />}>
              Express interest
            </Button>
          )}
          {onNotNow && (
            <Button size="sm" variant="secondary" icon={<ThumbsDown />} onClick={onNotNow}>
              Not now
            </Button>
          )}
          {onAsk && (
            <Button size="sm" variant="ghost" icon={<MessageCircle />} onClick={onAsk}>
              Ask SSD
            </Button>
          )}
        </div>
      )}
    </article>
  )
}

/** Audit Row: time, actor, action, object, device, hash link. */
export function AuditRow({ event, onOpen, className }: { event: AuditEvent; onOpen?: () => void; className?: string }) {
  const p = person(event.actorId)
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'grid w-full grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-b border-line/70 px-3 py-3 text-left transition-colors last:border-0 hover:bg-sunken/60 md:grid-cols-[90px_180px_minmax(0,1fr)_200px_110px] md:items-center md:py-2',
        className,
      )}
    >
      <span className="font-mono text-[12px] tabular-nums text-muted">
        {fmtTime(event.at)}
        <span className="hidden md:inline"> {event.at.slice(5, 10).split('-').reverse().join('/')}</span>
      </span>
      <span className="flex min-w-0 items-center gap-1.5 text-meta font-medium text-fg">
        <Avatar id={event.actorId} size={20} />
        <span className="truncate">{p.name}</span>
      </span>
      <span className="col-span-2 min-w-0 text-meta md:col-span-1">
        <span className="font-medium text-fg">{event.action}</span>
        <span className="text-muted"> · {event.object}</span>
      </span>
      <span className="col-span-2 truncate text-micro text-muted md:col-span-1">{event.device}</span>
      <span className="col-span-2 inline-flex items-center gap-1 font-mono text-[11px] text-primary md:col-span-1">
        <Link2 className="size-3" aria-hidden />
        {shortHash(event.hash)}
      </span>
    </button>
  )
}

/** Sync Indicator: online / offline with queue / syncing. Never hidden in the Owner and Field apps. */
export function SyncIndicator({
  state,
  queued = 0,
  lastSync = '06:40',
  onClick,
  variant = 'pill',
  className,
}: {
  state: 'online' | 'offline' | 'syncing'
  queued?: number
  lastSync?: string
  onClick?: () => void
  variant?: 'pill' | 'dot'
  className?: string
}) {
  const label =
    state === 'online' ? `Online · synced ${lastSync}` : state === 'syncing' ? `Syncing · ${queued} left` : `Offline · ${queued} queued · last sync ${lastSync}`
  if (variant === 'dot') {
    return (
      <button type="button" onClick={onClick} aria-label={label} title={label} className={cn('inline-flex size-10 items-center justify-center rounded-full hover:bg-sunken', className)}>
        <span className={cn('size-2.5 rounded-full', state === 'online' ? 'bg-verified' : state === 'syncing' ? 'bg-review animate-pulse-dot' : 'bg-muted')} />
      </button>
    )
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'pressable inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-micro font-medium',
        state === 'online' && 'border-verified-border bg-verified-fill text-verified',
        state === 'syncing' && 'border-review-border bg-review-fill text-review',
        state === 'offline' && 'border-transparent bg-fg text-canvas',
        className,
      )}
    >
      {state === 'online' ? <Wifi className="size-3.5" /> : state === 'syncing' ? <RefreshCw className="size-3.5 animate-spin" /> : <CloudOff className="size-3.5" />}
      {label}
    </button>
  )
}

/** Consent Capture: consent text, version, timestamp; cannot proceed without consent; withdrawal flow. */
export function ConsentCapture({
  title,
  text,
  version,
  consented,
  onChange,
  mode = 'checkbox',
  consentedAt,
  className,
  agreeLabel = 'I agree',
  withdrawLabel = 'Withdraw consent',
}: {
  title: ReactNode
  text: ReactNode
  version: string
  consented: boolean
  onChange: (v: boolean) => void
  mode?: 'checkbox' | 'audio'
  consentedAt?: string
  className?: string
  agreeLabel?: string
  withdrawLabel?: string
}) {
  const [recording, setRecording] = useState(false)
  return (
    <div className={cn('rounded-lg border border-line bg-surface p-4', consented && 'border-verified-border', className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-h3 font-semibold text-fg">{title}</p>
        <Chip tone="outline" size="sm">
          {version}
        </Chip>
      </div>
      <div className="mt-2 max-h-40 overflow-y-auto rounded-sm bg-sunken/70 p-3 text-meta text-fg">{text}</div>
      <div className="mt-3">
        {consented ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="inline-flex items-center gap-1.5 text-meta font-medium text-verified">
              <CircleCheck className="size-4" aria-hidden />
              Consent recorded {consentedAt ?? fmtDateTime(NOW)}
            </p>
            <Button size="sm" variant="quiet" onClick={() => onChange(false)}>
              {withdrawLabel}
            </Button>
          </div>
        ) : mode === 'checkbox' ? (
          <Checkbox checked={false} onCheckedChange={onChange} label={agreeLabel} />
        ) : (
          <Button
            variant={recording ? 'danger' : 'secondary'}
            icon={<Mic />}
            onClick={() => {
              if (recording) {
                setRecording(false)
                onChange(true)
              } else setRecording(true)
            }}
          >
            {recording ? 'Stop and save spoken consent' : 'Record spoken consent'}
          </Button>
        )}
      </div>
    </div>
  )
}

/** Capture Frame: in-app camera with time, GPS, accuracy and boundary indicator; stamps after capture. */
export function CaptureFrame({
  state: initial = 'live',
  className,
  onKeep,
  hint,
  showGps = true,
}: {
  state?: 'live' | 'captured' | 'no_location'
  className?: string
  onKeep?: () => void
  hint?: string
  showGps?: boolean
}) {
  const [state, setState] = useState(initial)
  const [count, setCount] = useState(7)
  return (
    <div className={cn('relative overflow-hidden rounded-xl bg-[#0b0f13] text-white', className)} style={{ aspectRatio: '3 / 4' }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,#5b6b4a_0%,#3a4430_35%,#1d2419_70%,#0b0f13_100%)]" />
      <div className="absolute inset-0 opacity-30 [background:repeating-linear-gradient(0deg,transparent_0_33%,rgba(255,255,255,.25)_33%_33.3%),repeating-linear-gradient(90deg,transparent_0_33%,rgba(255,255,255,.25)_33%_33.3%)]" />
      {hint && <p className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-lg border-2 border-dashed border-white/70 px-4 py-16 text-center text-meta">{hint}</p>}
      {showGps && (
        <div className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 bg-gradient-to-b from-black/70 to-transparent p-3 text-[12px]">
          <div className="space-y-0.5">
            <p className="font-mono">{fmtDateTime(NOW)}</p>
            {state === 'no_location' ? (
              <p className="font-mono text-[#F28B94]">Location unavailable</p>
            ) : (
              <p className="font-mono">−3.45612, 38.44803 · ± 6 m</p>
            )}
            <p className="inline-flex items-center gap-1 font-mono">
              <Compass className="size-3" aria-hidden /> 042° NE
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {state !== 'no_location' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#1E6B4A] px-2 py-0.5 text-[11px] font-semibold">
                <MapPin className="size-3" aria-hidden /> Inside boundary
              </span>
            )}
            <span className="rounded-full bg-black/50 px-2 py-0.5 text-[11px]">{count} captures</span>
          </div>
        </div>
      )}
      {state === 'captured' ? (
        <div className="absolute inset-x-0 bottom-0 animate-rise-in rounded-t-xl bg-[#1a2129] p-4 text-[#e9edf1]">
          <div className="flex gap-3">
            <div className="h-16 w-12 shrink-0 rounded-sm bg-[radial-gradient(ellipse_at_30%_40%,#5b6b4a,#1d2419)]" />
            <dl className="grid flex-1 grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
              <dt className="text-[#b4bec8]">Time</dt>
              <dd className="font-mono">{fmtTime(NOW)} EAT</dd>
              <dt className="text-[#b4bec8]">Coordinates</dt>
              <dd className="font-mono">−3.45612, 38.44803</dd>
              <dt className="text-[#b4bec8]">Device</dt>
              <dd className="font-mono">TS-FA-0142</dd>
              <dt className="text-[#b4bec8]">Fingerprint</dt>
              <dd className="inline-flex items-center gap-1 font-mono text-[#7FD1A8]">
                <FingerprintPattern className="size-3" aria-hidden /> Fingerprinted
              </dd>
            </dl>
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="secondary" icon={<RotateCcw />} className="flex-1" onClick={() => setState('live')}>
              Retake
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => {
                setCount((c) => c + 1)
                setState('live')
                onKeep?.()
              }}
            >
              Keep
            </Button>
          </div>
        </div>
      ) : (
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 bg-gradient-to-t from-black/70 to-transparent p-4">
          {state === 'no_location' && <p className="text-center text-[12px]">Capture is blocked until location is available, unless you give a reason.</p>}
          <div className="flex items-center gap-6">
            <IconButton label="Locate" variant="ghost" className="text-white hover:bg-white/10">
              <LocateFixed />
            </IconButton>
            <button
              type="button"
              aria-label="Capture"
              disabled={state === 'no_location'}
              onClick={() => setState('captured')}
              className="pressable size-16 rounded-full border-4 border-white bg-white/20 disabled:opacity-40"
            >
              <Camera className="mx-auto size-6" aria-hidden />
            </button>
            <span className="size-10" />
          </div>
        </div>
      )}
    </div>
  )
}
