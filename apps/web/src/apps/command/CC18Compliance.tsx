import { Braces, CheckCheck, CircleCheck, CircleX, FileArchive, FileJson, Gavel, History, Link2, Lock, Play, Scale, Search, ShieldCheck, Unlock } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useDemoState } from '@/lib/demo-states'
import { daysUntil, fmtDate, fmtDateTime } from '@/lib/format'
import { useDemo } from '@/lib/store'
import { auditEvents, escalations, legalHolds, person, rules, shortHash, type AuditEvent, type Escalation, type Rule } from '@/data'
import { AuditRow, EmptyState } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Avatar, Button, Chip, DataTable, Input, RadioGroup, Select, Sheet, Tabs, TabsContent, TabsList, TabsTrigger, Textarea, toast } from '@/ds/ui'
import { complianceTabs, SectionTabs } from './common'

const LEVEL = {
  hard_stop: { label: 'Hard stop', tone: 'critical' },
  counsel_review: { label: 'Counsel review', tone: 'disputed' },
  warning: { label: 'Warning', tone: 'review' },
  log_only: { label: 'Log only', tone: 'neutral' },
} as const

const ESC_STATES = [
  { id: 'default', label: 'Default' },
  { id: 'empty', label: 'Nothing waiting' },
] as const

/** CC-18 · Escalations queue */
export default function CC18Escalations() {
  const [state] = useDemoState('CC-18', ESC_STATES)
  const persona = useDemo((s) => s.commandPersona)
  const [open, setOpen] = useState<Escalation | null>(null)
  const [decision, setDecision] = useState<'approve' | 'deny' | 'modify'>('approve')
  const [notes, setNotes] = useState('')
  const [decided, setDecided] = useState<Record<string, string>>({})
  const rows = state === 'empty' ? [] : escalations.map((e) => ({ ...e, status: decided[e.id] ? ('decided' as const) : e.status }))
  const deadlineChip = (e: Escalation) => {
    if (e.status === 'decided') return <Chip tone="verified">Decided</Chip>
    const d = daysUntil(e.deadline)
    return <Chip tone={d < 0 ? 'critical' : d <= 1 ? 'review' : 'neutral'}>{d < 0 ? `Overdue ${-d} d` : d === 0 ? 'Due today' : `Due ${fmtDate(e.deadline)}`}</Chip>
  }
  return (
    <Page title="Escalations" large headerExtra={<SectionTabs items={complianceTabs} />} subtitle={`For Sarah Mitchell and outside counsel · default deadline 2 working days`}>
      <DataTable
        caption="Escalations"
        rows={rows}
        getId={(e) => e.id}
        onRowClick={(e) => {
          setOpen(e)
          setNotes('')
        }}
        empty={<EmptyState icon={<Scale />} title="Nothing waiting for a decision" body="New escalations arrive when a counsel-review rule fires." compact />}
        columns={[
          { key: 'rule', header: 'Rule', cell: (e) => <span className="font-mono text-meta font-semibold">{e.ruleId}</span> },
          { key: 'obj', header: 'Object', cell: (e) => <span className="font-medium">{e.object}</span> },
          { key: 'req', header: 'Requester', cell: (e) => <span className="inline-flex items-center gap-1.5"><Avatar id={e.requesterId} size={20} />{person(e.requesterId).name}</span>, hideBelow: 'lg' },
          { key: 'raised', header: 'Raised', cell: (e) => fmtDate(e.raisedOn) },
          { key: 'dl', header: 'Deadline', cell: deadlineChip },
        ]}
        mobileCard={(e) => (
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-meta font-semibold">{e.ruleId}</span>
              {deadlineChip(e)}
            </div>
            <p className="font-medium">{e.object}</p>
            <p className="text-micro text-muted">
              {person(e.requesterId).name} · raised {fmtDate(e.raisedOn)}
            </p>
          </div>
        )}
      />

      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        title={open ? `${open.ruleId} · ${rules.find((r) => r.id === open.ruleId)?.name}` : ''}
        description={open?.object}
        size="lg"
        footer={
          open &&
          open.status === 'open' &&
          !decided[open.id] && (
            <div className="space-y-2">
              {persona !== 'sarah' && <p className="text-micro text-muted">Decisions are recorded by compliance or counsel. Switch “Act as” to Sarah Mitchell.</p>}
              <Button
                block
                icon={<Gavel />}
                disabled={!notes || persona !== 'sarah'}
                onClick={() => {
                  setDecided((d) => ({ ...d, [open.id]: decision }))
                  toast.success(decision === 'approve' ? 'Approved for this instance only' : decision === 'deny' ? 'Denied' : 'Approved with modification')
                  setOpen(null)
                }}
              >
                Record decision
              </Button>
            </div>
          )
        }
      >
        {open && (
          <div className="space-y-5">
            <section>
              <p className="text-micro font-semibold uppercase tracking-wide text-muted">Triggering data</p>
              <p className="mt-1 rounded-sm border border-line bg-sunken/60 p-3 font-mono text-[13px]">{open.triggering}</p>
            </section>
            <section>
              <p className="text-micro font-semibold uppercase tracking-wide text-muted">Why the rule exists</p>
              <p className="mt-1 text-meta">{rules.find((r) => r.id === open.ruleId)?.rationale}</p>
            </section>
            <section>
              <p className="text-micro font-semibold uppercase tracking-wide text-muted">Prior similar decisions</p>
              {open.priorDecisions.length ? (
                <ul className="mt-1 space-y-1.5 text-meta">
                  {open.priorDecisions.map((p) => (
                    <li key={p} className="flex gap-2">
                      <History className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
                      {p}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-meta text-muted">None.</p>
              )}
            </section>
            {open.status === 'open' && !decided[open.id] ? (
              <section className="space-y-3">
                <RadioGroup
                  name="dec"
                  value={decision}
                  onValueChange={setDecision}
                  variant="cards"
                  options={[
                    { value: 'approve', label: 'Approve this instance', description: 'Covers only this object; the rule still applies elsewhere' },
                    { value: 'modify', label: 'Approve with modification', description: 'State the change required' },
                    { value: 'deny', label: 'Deny' },
                  ]}
                />
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (required, logged)" aria-label="Notes" />
              </section>
            ) : (
              <Chip tone="verified" icon={<CheckCheck />}>
                Decided
              </Chip>
            )}
          </div>
        )}
      </Sheet>
    </Page>
  )
}

/** CC-19 · Rules catalogue */
export function CC19Rules() {
  useDemoState('CC-19', [{ id: 'default', label: 'Default' }] as const)
  const persona = useDemo((s) => s.commandPersona)
  const [open, setOpen] = useState<Rule | null>(null)
  const [view, setView] = useState<'readable' | 'json'>('readable')
  const [replay, setReplay] = useState<'idle' | 'running' | 'done'>('idle')
  const [firstApprover, setFirstApprover] = useState<string | null>(null)
  return (
    <Page title="Rules catalogue" large headerExtra={<SectionTabs items={complianceTabs} />} subtitle="Versioned configuration · every evaluation logged with inputs and rule version">
      <DataTable
        caption="Rules"
        rows={rules}
        getId={(r) => r.id}
        onRowClick={(r) => {
          setOpen(r)
          setReplay('idle')
          setFirstApprover(null)
        }}
        columns={[
          { key: 'id', header: 'Rule', cell: (r) => <span className="font-mono font-semibold">{r.id}</span>, sortValue: (r) => r.id },
          { key: 'name', header: 'Name', cell: (r) => <div><p className="font-medium">{r.name}</p><p className="line-clamp-1 text-micro text-muted">{r.firesWhen}</p></div> },
          { key: 'level', header: 'Level', cell: (r) => <Chip tone={LEVEL[r.level].tone}>{LEVEL[r.level].label}</Chip> },
          { key: 'v', header: 'Version', cell: (r) => <span className="font-mono text-micro">{r.version}</span>, hideBelow: 'lg' },
          { key: 'eff', header: 'Effective', cell: (r) => fmtDate(r.effective), hideBelow: 'xl' },
          { key: 'owner', header: 'Owner', cell: (r) => <Avatar id={r.ownerId} size={22} />, align: 'center', hideBelow: 'lg' },
          { key: 'hits', header: 'Hits (30 d)', align: 'right', sortValue: (r) => r.hits30d, cell: (r) => r.hits30d },
        ]}
        mobileCard={(r) => (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-meta font-semibold">{r.id}</span>
              <span className="font-medium">{r.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Chip tone={LEVEL[r.level].tone}>{LEVEL[r.level].label}</Chip>
              <span className="text-micro text-muted">{r.hits30d} hits in 30 days</span>
            </div>
          </div>
        )}
      />
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        title={open ? `${open.id} ${open.name}` : ''}
        description={open ? `${LEVEL[open.level].label} · ${open.version} · effective ${fmtDate(open.effective)}` : ''}
        size="xl"
        footer={
          open && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-micro text-muted">{firstApprover ? `First approval: ${person(firstApprover).name}. A second, different approver must publish.` : 'Publishing a new version needs a second approver.'}</p>
              <Button
                icon={<ShieldCheck />}
                disabled={firstApprover === persona}
                onClick={() => {
                  if (!firstApprover) {
                    setFirstApprover(persona)
                    toast('First approval recorded for draft v1.1')
                  } else {
                    toast.success(`${open.id} v1.1 published by ${person(firstApprover).name} and ${person(persona).name}`)
                    setOpen(null)
                  }
                }}
              >
                {firstApprover ? (firstApprover === persona ? 'Waiting for a second approver' : 'Approve and publish v1.1') : 'Approve draft v1.1'}
              </Button>
            </div>
          )
        }
      >
        {open && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <section>
                <p className="text-micro font-semibold uppercase tracking-wide text-muted">Fires when</p>
                <p className="mt-1 text-meta">{open.firesWhen}</p>
              </section>
              <section>
                <p className="text-micro font-semibold uppercase tracking-wide text-muted">Rationale</p>
                <p className="mt-1 text-meta">{open.rationale}</p>
              </section>
              <section>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-micro font-semibold uppercase tracking-wide text-muted">Condition</p>
                  <div className="flex gap-1">
                    <Button size="xs" variant={view === 'readable' ? 'tint' : 'ghost'} onClick={() => setView('readable')}>
                      Readable
                    </Button>
                    <Button size="xs" variant={view === 'json' ? 'tint' : 'ghost'} icon={<Braces />} onClick={() => setView('json')}>
                      JSON
                    </Button>
                  </div>
                </div>
                <pre className="overflow-x-auto rounded-sm border border-line bg-sunken/70 p-3 font-mono text-[12px] leading-5">{view === 'readable' ? open.condition : JSON.stringify(open.json, null, 2)}</pre>
              </section>
            </div>
            <div className="space-y-4">
              <section>
                <p className="mb-1.5 text-micro font-semibold uppercase tracking-wide text-muted">Test cases</p>
                <ul className="space-y-1.5">
                  {open.tests.map((t) => (
                    <li key={t.name} className="flex items-center gap-2 text-meta">
                      {t.pass ? <CircleCheck className="size-4 text-verified" aria-label="Pass" /> : <CircleX className="size-4 text-critical" aria-label="Fail" />}
                      {t.name}
                    </li>
                  ))}
                </ul>
              </section>
              <section className="rounded-lg border border-line p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-meta font-semibold">Replay last 90 days (draft v1.1)</p>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<Play />}
                    loading={replay === 'running'}
                    onClick={() => {
                      setReplay('running')
                      window.setTimeout(() => setReplay('done'), 1200)
                    }}
                  >
                    Replay
                  </Button>
                </div>
                {replay === 'done' && (
                  <div className="mt-3 space-y-2 text-meta animate-fade-in">
                    <p>
                      1,284 events replayed. Draft would have blocked <span className="font-semibold">{open.hits30d + 2}</span> (current: {open.hits30d}).
                    </p>
                    <ul className="space-y-1 text-micro text-muted">
                      <li>+ 12 Aug · teaser KE-GR-04 → Lakeshore Battery Metals (would block)</li>
                      <li>+ 3 Sep · message draft to Hargrove Family Office (would block)</li>
                    </ul>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </Sheet>
    </Page>
  )
}

/** CC-20 · Audit explorer */
export function CC20Audit() {
  useDemoState('CC-20', [{ id: 'default', label: 'Default' }] as const)
  const [q, setQ] = useState('Who viewed KE-GR-07 documents on 22 Sep 2026?')
  const [actor, setActor] = useState('all')
  const [type, setType] = useState('all')
  const [date, setDate] = useState('2026-09-22')
  const [open, setOpen] = useState<AuditEvent | null>(null)
  const [exportOpen, setExportOpen] = useState(false)
  const [verified, setVerified] = useState(false)
  const rows = useMemo(() => {
    let r = auditEvents
    if (/viewed/i.test(q)) r = r.filter((e) => /viewed/i.test(e.action))
    if (/KE-GR-07/i.test(q)) r = r.filter((e) => e.object.includes('KE-GR-07'))
    if (actor !== 'all') r = r.filter((e) => e.actorId === actor)
    if (type !== 'all') r = r.filter((e) => e.action.toLowerCase().includes(type))
    if (date) r = r.filter((e) => e.at.startsWith(date))
    return r
  }, [q, actor, type, date])

  return (
    <Page
      title="Audit explorer"
      large
      headerExtra={<SectionTabs items={complianceTabs} />}
      actions={
        <Button variant="secondary" icon={<FileArchive />} onClick={() => setExportOpen(true)}>
          Export matter
        </Button>
      }
    >
      <Tabs defaultValue="events">
        <TabsList className="mb-4">
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="holds" count={legalHolds.length}>
            Legal holds
          </TabsTrigger>
        </TabsList>
        <TabsContent value="events">
          <div className="mb-3 space-y-2">
            <Input value={q} onChange={(e) => setQ(e.target.value)} leading={<Search />} aria-label="Search the log" placeholder="Ask, e.g. who viewed KE-GR-07 documents on 22 Sep 2026?" />
            <div className="flex flex-wrap gap-2">
              <Select value={actor} onChange={(e) => setActor(e.target.value)} aria-label="User" className="md:w-48">
                <option value="all">All users</option>
                {Array.from(new Set(auditEvents.map((e) => e.actorId))).map((a) => (
                  <option key={a} value={a}>
                    {person(a).name}
                  </option>
                ))}
              </Select>
              <Select value={type} onChange={(e) => setType(e.target.value)} aria-label="Event type" className="md:w-44">
                <option value="all">All events</option>
                <option value="viewed">Views</option>
                <option value="download">Downloads</option>
                <option value="rule">Rule evaluations</option>
                <option value="approved">Approvals</option>
              </Select>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Date" className="md:w-44" />
              <Button
                variant="ghost"
                onClick={() => {
                  setQ('')
                  setActor('all')
                  setType('all')
                  setDate('')
                }}
              >
                Clear
              </Button>
            </div>
          </div>
          <p className="mb-2 text-micro text-muted">{rows.length} events · answered in 0.18 s</p>
          <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-e1">
            {rows.length ? rows.map((e) => <AuditRow key={e.id} event={e} onOpen={() => (setOpen(e), setVerified(false))} />) : <EmptyState title="No events match" compact className="m-4" />}
          </div>
        </TabsContent>
        <TabsContent value="holds">
          <ul className="space-y-2">
            {legalHolds.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface p-4 shadow-e1">
                <Lock className="size-5 text-critical" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-meta font-semibold">{h.scope}</p>
                  <p className="text-micro text-muted">
                    {h.reason} · placed {fmtDate(h.placedOn)} by {person(h.placedById).name}
                  </p>
                </div>
                <Button size="sm" variant="secondary" icon={<Unlock />} onClick={() => toast('Release requires compliance (Sarah Mitchell) and is logged')}>
                  Release
                </Button>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)} title={open?.action ?? ''} description={open ? `${person(open.actorId).name} · ${fmtDateTime(open.at)}` : ''} size="lg">
        {open && (
          <div className="space-y-4">
            <pre className="overflow-x-auto rounded-sm border border-line bg-sunken/70 p-3 font-mono text-[12px] leading-5">
              {JSON.stringify({ id: open.id, at: open.at, actor: open.actorId, action: open.action, object: open.object, device: open.device }, null, 2)}
            </pre>
            <dl className="space-y-2 text-meta">
              <div>
                <dt className="text-micro text-muted">Previous hash</dt>
                <dd className="break-all font-mono text-[12px]">{open.prevHash}</dd>
              </div>
              <div>
                <dt className="text-micro text-muted">This event's hash</dt>
                <dd className="break-all font-mono text-[12px]">{open.hash}</dd>
              </div>
            </dl>
            <Button variant="secondary" icon={<Link2 />} onClick={() => setVerified(true)}>
              Verify chain
            </Button>
            {verified && (
              <p className="flex items-center gap-2 text-meta font-medium text-verified animate-fade-in">
                <CheckCheck className="size-4" aria-hidden /> Chain verified from genesis to {shortHash(open.hash)} · daily anchor matched (external store, 24 Sep 06:00)
              </p>
            )}
          </div>
        )}
      </Sheet>
      <Sheet
        open={exportOpen}
        onOpenChange={setExportOpen}
        title="Export matter"
        description="All events and documents for one asset, investor or introduction, with an integrity proof"
        size="md"
        footer={
          <Button block icon={<FileJson />} onClick={() => (setExportOpen(false), toast.success('Matter bundle ready: PDF + JSON + integrity certificate'))}>
            Build bundle
          </Button>
        }
      >
        <div className="space-y-3">
          <RadioGroup
            name="matter"
            value="asset"
            onValueChange={() => {}}
            variant="cards"
            options={[
              { value: 'asset', label: 'Asset · Kiboko Ridge Graphite (KE-GR-07)', description: '1,412 events · 86 documents' },
              { value: 'investor', label: 'Investor · Cedar Peak Minerals Fund', description: '322 events' },
              { value: 'intro', label: 'Introduction · KE-GR-07 × Cedar Peak', description: '188 events' },
            ]}
          />
        </div>
      </Sheet>
    </Page>
  )
}

