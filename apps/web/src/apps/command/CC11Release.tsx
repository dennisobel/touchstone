import { ArrowRight, BellRing, CircleCheck, CircleX, EyeOff, Rocket, Send, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { cn } from '@/lib/cn'
import { useDemoState } from '@/lib/demo-states'
import { fmtDate, fmtDateTime, NOW } from '@/lib/format'
import { useDemo } from '@/lib/store'
import { flagsFor, person, WORKSTREAMS, type Asset } from '@/data'
import { assetFlagCounts, FlagCounts, PassportHeader, RuleGateBanner, StatusStamp, TeaserCard, TierBadge, WorkstreamCard } from '@/ds/components'
import { Button, Chip, Segmented, Switch, toast } from '@/ds/ui'
import { Panel } from './common'
import { useAsset } from './CC04Asset'

const STATES = [
  { id: 'default', label: 'Current checklist' },
  { id: 'ready', label: 'All items pass' },
  { id: 'released', label: 'After release' },
] as const

type Level = 'L1' | 'L2' | 'L3'

const HIDDEN: Record<Level, string[]> = {
  L1: ['Capital sought and terms', 'Valuation (never shown)', 'Owner identity (unless opted in)', 'Exact location', 'Documents and claims detail'],
  L2: ['Owner identity', 'Exact location (region only)', 'Documents', 'Claims ledger and evidence'],
  L3: ['Parties-only documents (L4)', "Investors' private notes", 'Internal analyst notes'],
}

function checklist(a: Asset, ready: boolean) {
  const critical = flagsFor(a.id).some((f) => f.severity === 'critical' && f.status === 'open')
  const tierDone = a.id === 'kakamega' || a.id === 'pwani' || a.id === 'galana'
  const windowClosed = a.id === 'pwani' || a.id === 'galana'
  const items = [
    { id: 'tier', label: 'Tier requirements complete', ok: tierDone, fail: a.id === 'kiboko' ? 'Qualified Person resource review due 7 Oct' : `${a.checks.done} of ${a.checks.total} checks done`, fix: `/command/assets/${a.id}/workbench` },
    { id: 'critical', label: 'No open Critical flag', ok: !critical, fail: '1 Critical flag open (R11)', fix: `/command/assets/${a.id}/flags` },
    { id: 'reply', label: 'Owner reply window closed', ok: windowClosed, fail: `Closes ${fmtDate(a.replyUntil ?? '2026-10-28')}`, fix: `/command/assets/${a.id}/findings` },
    { id: 'summaries', label: 'Plain-English summaries approved', ok: a.id !== 'kiboko', fail: '3 of 7 workstream summaries waiting for approval', fix: `/command/assets/${a.id}/workbench` },
    { id: 'disclaimers', label: 'Standard disclaimers present', ok: true, fail: '', fix: '' },
    { id: 'paid', label: 'Who paid for verification stated', ok: true, fail: '', fix: '' },
  ]
  return items.map((i) => (ready ? { ...i, ok: true } : i))
}

export default function CC11Release() {
  const a = useAsset()
  const [state] = useDemoState('CC-11', STATES)
  const persona = useDemo((s) => s.commandPersona)
  const markReleased = useDemo((s) => s.markReleased)
  const [level, setLevel] = useState<Level>('L2')
  const [requested, setRequested] = useState(false)
  const [released, setReleased] = useState(false)
  const [notify, setNotify] = useState(true)
  useEffect(() => setReleased(state === 'released'), [state])
  const items = checklist(a, state === 'ready' || state === 'released')
  const failing = items.filter((i) => !i.ok)
  const isCompliance = persona === 'sarah'
  const critical = flagsFor(a.id).find((f) => f.severity === 'critical' && f.status === 'open')
  const nextVersion = (a.passport.version ?? 0) + 1

  return (
    <div className="space-y-4">
      {critical && state === 'default' && (
        <RuleGateBanner
          level="hard_stop"
          rule="R11 Critical flag"
          reason={`${critical.title}. Resolve the flag to release.`}
          triggering={`Flag ${critical.id} · raised ${fmtDate(critical.raisedOn)}`}
          alternatives={
            <Link to={`/command/assets/${a.id}/flags`} viewTransition className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
              Open the flag <ArrowRight className="size-3.5" />
            </Link>
          }
        />
      )}

      {released && (
        <div className="rounded-lg border border-verified-border bg-verified-fill p-4 animate-rise-in">
          <div className="flex flex-wrap items-center gap-3">
            <CircleCheck className="size-6 text-verified" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-h3 font-semibold">
                Released v{nextVersion} · {fmtDateTime(NOW)}
              </p>
              <p className="text-meta text-muted">Approved by {person('sarah').name}, compliance · release is immutable; changes create a new version</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-verified-border pt-3">
            <Switch checked={notify} onCheckedChange={setNotify} label={<span className="text-meta">Notify followers (2 investors entitled to this level)</span>} />
            <Button size="sm" icon={<BellRing />} onClick={() => toast.success(notify ? 'Followers notified (no deal details in the message)' : 'Released without notifications')}>
              Confirm
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Preview by disclosure level */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmented<Level>
              ariaLabel="Disclosure level"
              value={level}
              onChange={setLevel}
              options={[
                { value: 'L1', label: 'L1 Library' },
                { value: 'L2', label: 'L2 Teaser' },
                { value: 'L3', label: 'L3 Full' },
              ]}
            />
            <p className="text-micro text-muted">Exactly what each audience will see; enforced on the server.</p>
          </div>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="min-w-0 rounded-lg border border-dashed border-line-strong/60 bg-canvas p-3">
              {level === 'L1' && <LibraryProfile a={a} />}
              {level === 'L2' && <TeaserCard asset={a} status="waiting" sentOn="2026-09-24" />}
              {level === 'L3' && (
                <div className="space-y-3">
                  <PassportHeader asset={a} view="full" compact />
                  <div className="grid gap-2 sm:grid-cols-2">
                    {WORKSTREAMS.slice(0, 4).map((w) => (
                      <WorkstreamCard key={w.id} asset={a} ws={w.id} />
                    ))}
                  </div>
                  <p className="text-center text-micro text-muted">+ 3 more workstreams, red-flag register, claims ledger, map, evidence index</p>
                </div>
              )}
            </div>
            <aside className="rounded-lg border border-line bg-surface p-3">
              <p className="flex items-center gap-1.5 text-micro font-semibold uppercase tracking-wide text-muted">
                <EyeOff className="size-3.5" aria-hidden /> Not shown at {level}
              </p>
              <ul className="mt-2 space-y-1.5 text-micro text-fg">
                {HIDDEN[level].map((h) => (
                  <li key={h} className="flex gap-1.5">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted" aria-hidden />
                    {h}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        {/* Release checklist */}
        <Panel title="Release checklist" subtitle={`Version v${nextVersion} · ${a.tierInProgress ? 'Investor-ready' : 'current tier'}`}>
          <ul className="space-y-2">
            {items.map((i) => (
              <li key={i.id} className={cn('flex items-start gap-2.5 rounded-sm p-2', !i.ok && 'bg-critical-fill/60')}>
                {i.ok ? <CircleCheck className="mt-0.5 size-4.5 shrink-0 text-verified" aria-label="Pass" /> : <CircleX className="mt-0.5 size-4.5 shrink-0 text-critical" aria-label="Fail" />}
                <div className="min-w-0 flex-1">
                  <p className="text-meta font-medium">{i.label}</p>
                  {!i.ok && (
                    <p className="text-micro text-muted">
                      {i.fail} ·{' '}
                      <Link to={i.fix} viewTransition className="font-medium text-primary hover:underline">
                        Fix
                      </Link>
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-line pt-4">
            {failing.length > 0 && (
              <p className="text-meta font-medium text-critical">
                {failing.length} item{failing.length > 1 ? 's' : ''} block release: {failing.map((f) => f.label.toLowerCase()).join('; ')}.
              </p>
            )}
            <Button block variant="secondary" icon={<Send />} disabled={failing.length > 0 || requested || released} onClick={() => (setRequested(true), toast.success('Release requested · Sarah Mitchell notified'))}>
              {requested ? 'Release requested' : 'Request release'}
            </Button>
            <Button
              block
              icon={<Rocket />}
              disabled={failing.length > 0 || !isCompliance || released}
              onClick={() => {
                setReleased(true)
                markReleased(a.id)
              }}
            >
              Release
            </Button>
            {!isCompliance && (
              <p className="flex items-center gap-1.5 text-micro text-muted">
                <ShieldCheck className="size-3.5" aria-hidden /> Only compliance (Sarah Mitchell) can release. Switch “Act as” to try it.
              </p>
            )}
          </div>
        </Panel>
      </div>
    </div>
  )
}

function LibraryProfile({ a }: { a: Asset }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4 shadow-e1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-meta font-medium text-muted">{a.code}</p>
        <TierBadge tier={a.tier} size="sm" />
      </div>
      <p className="mt-1 font-serif text-h2 font-semibold">
        {a.commodity} · {a.region}, {a.country}
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-micro">
        <div>
          <dt className="text-muted">Stage</dt>
          <dd className="font-medium">{a.stage}</dd>
        </div>
        <div>
          <dt className="text-muted">Licence</dt>
          <dd className="font-medium">
            {a.licence.type} · <Chip tone="verified" size="sm">Active</Chip>
          </dd>
        </div>
      </dl>
      <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {WORKSTREAMS.map((w) => (
          <li key={w.id} className="flex items-center justify-between gap-2 text-micro">
            <span className="truncate">{w.name}</span>
            <StatusStamp status={a.workstreamStatus[w.id]} size="sm" />
          </li>
        ))}
      </ul>
      <FlagCounts counts={assetFlagCounts(a.id)} className="mt-3" />
    </div>
  )
}
