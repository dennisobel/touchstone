import { CircleCheck, Filter, OctagonX, ShieldCheck, Wrench } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useDemoState } from '@/lib/demo-states'
import { daysAgo, fmtDate } from '@/lib/format'
import { useDemo } from '@/lib/store'
import { asset, FLAG_STATUS_LABEL, flags as allFlags, person, WORKSTREAMS, workstreamName, type FlagStatus, type RedFlag, type Severity } from '@/data'
import { EmptyState, EvidenceChip, SeverityBadge, StatusTimeline } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Button, Chip, DataTable, Select, Sheet, Textarea, toast } from '@/ds/ui'
import { SectionTabs, verificationTabs } from './common'

const STATES = [
  { id: 'default', label: 'Default' },
  { id: 'empty', label: 'No flags match' },
] as const

const statusTone = { open: 'neutral', mitigated: 'review', accepted: 'disputed', resolved: 'verified' } as const

export default function CC07Flags() {
  const [state] = useDemoState('CC-07', STATES)
  const persona = useDemo((s) => s.commandPersona)
  const [sev, setSev] = useState<Severity | 'all'>('all')
  const [status, setStatus] = useState<FlagStatus | 'all'>('all')
  const [ws, setWs] = useState('all')
  const [open, setOpen] = useState<RedFlag | null>(null)
  const [mode, setMode] = useState<null | 'mitigate' | 'accept' | 'resolve'>(null)
  const [text, setText] = useState('')
  const [local, setLocal] = useState<Record<string, FlagStatus>>({})

  const rows = useMemo(() => {
    if (state === 'empty') return []
    return allFlags
      .map((f) => ({ ...f, status: local[f.id] ?? f.status }))
      .filter((f) => (sev === 'all' || f.severity === sev) && (status === 'all' || f.status === status) && (ws === 'all' || f.workstream === ws))
  }, [sev, status, ws, state, local])

  const counts = (s: Severity) => allFlags.filter((f) => f.severity === s && f.status !== 'resolved').length

  const finish = (next: FlagStatus, message: string) => {
    if (!open) return
    setLocal((l) => ({ ...l, [open.id]: next }))
    setMode(null)
    setText('')
    setOpen(null)
    toast.success(message)
  }

  return (
    <Page title="Red-flag register" large headerExtra={<SectionTabs items={verificationTabs} />} asOf>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Filter className="size-4 text-muted" aria-hidden />
        {(['all', 'critical', 'high', 'medium', 'low'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSev(s)}
            aria-pressed={sev === s}
            className={`pressable inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-micro font-medium capitalize max-md:h-10 ${sev === s ? 'border-primary bg-primary-tint text-primary' : 'border-line bg-surface text-muted'}`}
          >
            {s === 'all' ? 'All severities' : s}
            {s !== 'all' && <span className="tabular-nums">{counts(s)}</span>}
          </button>
        ))}
        <div className="ml-auto flex gap-2 max-md:w-full">
          <Select value={status} onChange={(e) => setStatus(e.target.value as FlagStatus | 'all')} aria-label="Status" className="md:w-36">
            <option value="all">All statuses</option>
            {(['open', 'mitigated', 'accepted', 'resolved'] as FlagStatus[]).map((s) => (
              <option key={s} value={s}>
                {FLAG_STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
          <Select value={ws} onChange={(e) => setWs(e.target.value)} aria-label="Workstream" className="md:w-48">
            <option value="all">All workstreams</option>
            {WORKSTREAMS.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <DataTable
        caption="Red flags"
        rows={rows}
        getId={(f) => f.id}
        onRowClick={(f) => setOpen(f)}
        empty={<EmptyState icon={<ShieldCheck />} title="No flags match these filters" compact />}
        columns={[
          { key: 'sev', header: 'Severity', sortValue: (f) => ['critical', 'high', 'medium', 'low'].indexOf(f.severity), cell: (f) => <SeverityBadge severity={f.severity} /> },
          { key: 'title', header: 'Flag', cell: (f) => <span className="font-medium">{f.title}</span> },
          { key: 'asset', header: 'Asset', sortValue: (f) => asset(f.assetId).name, cell: (f) => asset(f.assetId).name },
          { key: 'ws', header: 'Workstream', cell: (f) => <span className="text-muted">{workstreamName(f.workstream)}</span>, hideBelow: 'xl' },
          { key: 'status', header: 'Status', cell: (f) => <Chip tone={statusTone[f.status]}>{FLAG_STATUS_LABEL[f.status]}</Chip> },
          { key: 'age', header: 'Age', align: 'right', sortValue: (f) => daysAgo(f.raisedOn), cell: (f) => `${daysAgo(f.raisedOn)} d` },
          { key: 'owner', header: 'Owner', cell: (f) => person(f.ownerId).name, hideBelow: 'lg' },
        ]}
        mobileCard={(f) => (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <SeverityBadge severity={f.severity} />
              <Chip tone={statusTone[f.status]}>{FLAG_STATUS_LABEL[f.status]}</Chip>
            </div>
            <p className="font-medium">{f.title}</p>
            <p className="text-micro text-muted">
              {asset(f.assetId).name} · {daysAgo(f.raisedOn)} d
            </p>
          </div>
        )}
      />

      <Sheet
        open={!!open}
        onOpenChange={(o) => {
          if (!o) {
            setOpen(null)
            setMode(null)
          }
        }}
        title={open?.title ?? ''}
        description={open ? `${asset(open.assetId).name} · ${workstreamName(open.workstream)}` : ''}
        size="lg"
        footer={
          open &&
          (mode ? (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setMode(null)}>
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={!text}
                onClick={() =>
                  mode === 'mitigate'
                    ? finish('mitigated', 'Mitigation plan saved')
                    : mode === 'accept'
                      ? finish('accepted', `Acceptance recorded by ${person(persona).name}; compliance co-approval requested from Sarah Mitchell`)
                      : finish('resolved', 'Flag resolved with evidence')
                }
              >
                {mode === 'mitigate' ? 'Save mitigation' : mode === 'accept' ? 'Accept (needs compliance co-approval)' : 'Resolve'}
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" icon={<Wrench />} onClick={() => setMode('mitigate')}>
                Mitigate
              </Button>
              {open.severity === 'critical' ? (
                <Button variant="secondary" icon={<OctagonX />} disabled title="Critical flags cannot be accepted, only resolved">
                  Cannot be accepted, only resolved
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => setMode('accept')}>
                  Accept
                </Button>
              )}
              <Button icon={<CircleCheck />} onClick={() => setMode('resolve')}>
                Resolve
              </Button>
            </div>
          ))
        }
      >
        {open && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={open.severity} />
              <Chip tone={statusTone[open.status]}>{FLAG_STATUS_LABEL[open.status]}</Chip>
              <span className="text-micro text-muted">Raised {fmtDate(open.raisedOn)} by {person(open.ownerId).name}</span>
            </div>
            <p className="text-body">{open.description}</p>
            {open.evidence.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {open.evidence.map((e, i) => (
                  <EvidenceChip key={i} ev={e} />
                ))}
              </div>
            )}
            {open.mitigation && (
              <div className="rounded-sm border border-line bg-sunken/60 p-3">
                <p className="text-micro font-semibold text-muted">Mitigation plan</p>
                <p className="mt-1 text-meta">{open.mitigation}</p>
              </div>
            )}
            {mode && (
              <div className="space-y-2 animate-fade-in">
                <p className="text-meta font-semibold">{mode === 'mitigate' ? 'Mitigation plan' : mode === 'accept' ? 'Written rationale (required)' : 'Resolution and evidence'}</p>
                {mode === 'accept' && open.severity === 'high' && <p className="text-micro text-muted">Accepting a High flag needs the analyst and compliance (two approvals, both logged).</p>}
                <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} aria-label="Details" />
              </div>
            )}
            <div>
              <p className="mb-2 text-micro font-semibold uppercase tracking-wide text-muted">History</p>
              <StatusTimeline
                steps={[
                  { label: 'Raised', date: open.raisedOn, who: open.ownerId, state: 'done' },
                  ...(open.mitigation ? [{ label: 'Mitigation plan added', date: open.updatedOn, who: open.ownerId, state: 'done' as const }] : []),
                  { label: open.status === 'resolved' ? 'Resolved' : open.status === 'accepted' ? 'Accepted with rationale' : 'Awaiting decision', date: open.updatedOn, who: 'sarah', state: open.status === 'open' ? 'current' : 'done' },
                ]}
              />
            </div>
          </div>
        )}
      </Sheet>
    </Page>
  )
}
