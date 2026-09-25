import { AlarmClockOff, ArrowRight, Ban, BellRing, CalendarClock, CircleCheck, Gavel, MessageSquareReply, PartyPopper, UserPlus } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { cn } from '@/lib/cn'
import { useDemoState } from '@/lib/demo-states'
import { fmtDate, fmtDay, NOW } from '@/lib/format'
import { useCountdown, useHotkeys } from '@/lib/hooks'
import { useDemo } from '@/lib/store'
import { asset, escalations, person, tasks as allTasks, workstreamName, type Task } from '@/data'
import { DeadlineChip, EmptyState, QueueRow } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Avatar, Button, Chip, Kbd, Segmented, Sheet, Skeleton, Textarea, toast } from '@/ds/ui'
import { Panel, StatTile } from './common'

const STATES = [
  { id: 'default', label: 'Default' },
  { id: 'filtered', label: 'Filtered: blocked only' },
  { id: 'loading', label: 'Loading' },
  { id: 'empty', label: 'Empty queue' },
  { id: 'timeout', label: 'Session timeout' },
] as const

type Filter = 'all' | 'blocked' | 'today' | 'week' | 'owner'
const GROUPS: { id: Task['group']; label: string }[] = [
  { id: 'blocked', label: 'Blocked' },
  { id: 'today', label: 'Due today' },
  { id: 'week', label: 'This week' },
]

export default function CC01Home() {
  const navigate = useNavigate()
  const [state] = useDemoState('CC-01', STATES)
  const persona = useDemo((s) => s.commandPersona)
  const [filter, setFilter] = useState<Filter>('all')
  const [active, setActive] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [open, setOpen] = useState<Task | null>(null)
  const [assignFor, setAssignFor] = useState<Task | null>(null)
  const [snoozeFor, setSnoozeFor] = useState<Task | null>(null)
  const [done, setDone] = useState<string[]>([])
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => setFilter(state === 'filtered' ? 'blocked' : 'all'), [state])

  const list = useMemo(() => {
    if (state === 'empty') return []
    const base = allTasks.filter((t) => t.group !== 'later' && t.status !== 'done' && !done.includes(t.id))
    if (filter === 'owner') return base.filter((t) => t.awaitingOwner)
    if (filter === 'all') return base
    return base.filter((t) => t.group === filter)
  }, [filter, state, done])

  const ordered = GROUPS.flatMap((g) => list.filter((t) => t.group === g.id))
  const current = ordered[active]

  useHotkeys(
    {
      j: () => setActive((i) => Math.min(ordered.length - 1, i + 1)),
      k: () => setActive((i) => Math.max(0, i - 1)),
      enter: () => current && setOpen(current),
      a: () => current && setAssignFor(current),
      s: () => current && setSnoozeFor(current),
    },
    !open && !assignFor && !snoozeFor,
  )
  useEffect(() => {
    rowRefs.current[active]?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const counts = {
    blocked: allTasks.filter((t) => t.group === 'blocked').length,
    today: allTasks.filter((t) => t.group === 'today').length,
    owner: allTasks.filter((t) => t.awaitingOwner).length,
    esc: escalations.filter((e) => e.status === 'open').length,
  }

  return (
    <Page
      title="My queue"
      large
      subtitle={`Thursday ${fmtDate(NOW)} · ${person(persona).name}`}
      actions={
        <span className="hidden items-center gap-1.5 text-micro text-muted md:inline-flex">
          Press <Kbd>?</Kbd> for shortcuts
        </span>
      }
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Blocked" value={counts.blocked} tone="critical" icon={<Ban />} active={filter === 'blocked'} onClick={() => setFilter(filter === 'blocked' ? 'all' : 'blocked')} sub="2 since yesterday" />
        <StatTile label="Due today" value={counts.today} tone="review" icon={<CalendarClock />} active={filter === 'today'} onClick={() => setFilter(filter === 'today' ? 'all' : 'today')} sub="3 need approval" />
        <StatTile label="Awaiting owner" value={counts.owner} tone="disputed" icon={<MessageSquareReply />} active={filter === 'owner'} onClick={() => setFilter(filter === 'owner' ? 'all' : 'owner')} sub="Oldest: 3 days" />
        <StatTile label="Escalations" value={counts.esc} tone="primary" icon={<Gavel />} onClick={() => navigate('/command/compliance', { viewTransition: true })} sub="Next due 25 Sep" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="overflow-hidden rounded-lg border border-line bg-surface shadow-e1" aria-label="Queue">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
            <Segmented<Filter>
              ariaLabel="Filter queue"
              size="sm"
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: 'All' },
                { value: 'blocked', label: 'Blocked' },
                { value: 'today', label: 'Due today' },
                { value: 'week', label: 'This week' },
              ]}
            />
            {selected.length > 0 ? (
              <div className="flex items-center gap-2 animate-fade-in">
                <span className="text-micro text-muted">{selected.length} selected</span>
                <Button size="sm" variant="secondary" icon={<UserPlus />} onClick={() => setAssignFor(ordered.find((t) => t.id === selected[0]) ?? null)}>
                  Assign
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
                  Clear
                </Button>
              </div>
            ) : (
              <span className="hidden text-micro text-muted md:inline">
                <Kbd>J</Kbd> <Kbd>K</Kbd> move · <Kbd>Enter</Kbd> open · <Kbd>A</Kbd> assign · <Kbd>S</Kbd> snooze
              </span>
            )}
          </div>

          {state === 'loading' ? (
            <div className="space-y-3 p-4" aria-busy>
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
              <p className="text-micro text-muted">Loading your queue…</p>
            </div>
          ) : ordered.length === 0 ? (
            <EmptyState
              icon={<CircleCheck />}
              title="Nothing blocked. Good day."
              body={state === 'empty' ? 'Your queue is clear. New submissions and owner replies will appear here.' : 'No tasks match this filter.'}
              className="m-4 border-0"
              compact
            />
          ) : (
            <div role="table" aria-label="Tasks">
              <div role="row" className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,1.9fr)] gap-3 border-b border-line bg-sunken/50 px-3 py-2 pl-11 text-micro font-medium uppercase tracking-wide text-muted md:grid">
                <span>Task</span>
                <span>Asset</span>
                <span>Workstream</span>
                <span>Assignee</span>
                <span className="text-right">Status</span>
              </div>
              {GROUPS.map((g) => {
                const rows = list.filter((t) => t.group === g.id)
                if (!rows.length) return null
                return (
                  <div key={g.id} role="rowgroup">
                    <p className="flex items-center gap-2 border-b border-line bg-canvas/60 px-4 py-1.5 text-micro font-semibold text-muted">
                      {g.label}
                      <span className="rounded-full bg-sunken px-1.5 tabular-nums">{rows.length}</span>
                    </p>
                    {rows.map((t) => {
                      const idx = ordered.indexOf(t)
                      return (
                        <div key={t.id} ref={(el) => void (rowRefs.current[idx] = el)}>
                          <QueueRow
                            task={t}
                            active={idx === active}
                            selected={selected.includes(t.id)}
                            onSelect={(v) => setSelected((s) => (v ? [...s, t.id] : s.filter((x) => x !== t.id)))}
                            onOpen={() => {
                              setActive(idx)
                              setOpen(t)
                            }}
                          />
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Right rail */}
        <div className="space-y-4">
          <Panel title="Approvals waiting for you" action={<Chip tone="primary">3</Chip>} bodyClassName="p-0">
            <ul className="divide-y divide-line">
              {[
                { title: 'Accept geology desk review', meta: 'Kiboko Ridge Graphite · Dr Amani Mushi · payout USD 1,800', cta: 'Accept' },
                { title: 'Plan change: site visit moved to 2 Oct', meta: 'Nyanza Reef Gold · requested by Brian Kiptoo', cta: 'Approve' },
                { title: 'Request passport release', meta: 'Kakamega Shear Gold · reply window closes 30 Sep', cta: 'Review', to: '/command/assets/kakamega/release' },
              ].map((a) => (
                <li key={a.title} className="flex items-start gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-meta font-medium">{a.title}</p>
                    <p className="text-micro text-muted">{a.meta}</p>
                  </div>
                  <Button size="xs" variant="tint" onClick={() => (a.to ? navigate(a.to, { viewTransition: true }) : toast.success(`${a.cta}ed: ${a.title}`))}>
                    {a.cta}
                  </Button>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Recent owner replies" bodyClassName="p-0">
            <ul className="divide-y divide-line">
              {[
                { who: 'wekesa', text: 'Disputed 2 findings on community agreements', asset: 'Kakamega Shear Gold', when: '08:55', to: '/command/assets/kakamega/findings' },
                { who: 'grace', text: 'Uploaded QA/QC summary v2', asset: 'Kiboko Ridge Graphite', when: '22 Sep', to: '/command/assets/kiboko/workbench' },
                { who: 'peter', text: 'Will send the survey plan today', asset: 'Nyanza Reef Gold', when: '07:55', to: '/command/assets/nyanza' },
              ].map((r) => (
                <li key={r.text}>
                  <Link to={r.to} viewTransition className="flex items-start gap-3 px-4 py-3 hover:bg-sunken/60">
                    <Avatar id={r.who} size={28} />
                    <div className="min-w-0 flex-1">
                      <p className="text-meta">
                        <span className="font-medium">{person(r.who).name}</span> · {r.text}
                      </p>
                      <p className="text-micro text-muted">
                        {r.asset} · {r.when}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
          <div className="rounded-lg border border-line bg-surface p-4 shadow-e1">
            <p className="flex items-center gap-2 text-micro font-medium text-muted">
              <PartyPopper className="size-4" aria-hidden /> Passports released this month
            </p>
            <p className="mt-1 text-[26px] leading-8 font-semibold tabular-nums">2</p>
            <p className="text-micro text-muted">Kiboko Ridge Graphite v2 (20 Sep) · Galana Flake Graphite v3 (29 Aug)</p>
          </div>
        </div>
      </div>

      {/* Task detail */}
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        title={open?.title ?? ''}
        description={open ? `${asset(open.assetId).name} · ${open.workstream === 'intake' ? 'Intake' : open.workstream === 'deal' ? 'Deal flow' : workstreamName(open.workstream)}` : ''}
        footer={
          open && (
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() =>
                  navigate(open.workstream === 'intake' ? `/command/assets/${open.assetId}/triage` : open.workstream === 'deal' ? '/command/deals' : `/command/assets/${open.assetId}/workbench`, {
                    viewTransition: true,
                  })
                }
                iconRight={<ArrowRight />}
              >
                {open.workstream === 'intake' ? 'Open triage' : 'Open workbench'}
              </Button>
              <Button variant="secondary" icon={<UserPlus />} onClick={() => setAssignFor(open)}>
                Assign
              </Button>
              <Button variant="secondary" icon={<AlarmClockOff />} onClick={() => setSnoozeFor(open)}>
                Snooze
              </Button>
              <Button
                variant="ghost"
                icon={<CircleCheck />}
                onClick={() => {
                  setDone((d) => [...d, open.id])
                  setOpen(null)
                  toast.success('Marked done')
                }}
              >
                Done
              </Button>
            </div>
          )
        }
      >
        {open && (
          <dl className="grid grid-cols-2 gap-4 text-meta">
            <div>
              <dt className="text-micro text-muted">Assignee</dt>
              <dd className="mt-1 flex items-center gap-2">
                <Avatar id={open.assigneeId} size={24} /> {person(open.assigneeId).name}
              </dd>
            </div>
            <div>
              <dt className="text-micro text-muted">Due</dt>
              <dd className="mt-1 flex items-center gap-2">
                {fmtDay(open.due)} <DeadlineChip due={open.due} status={open.status} />
              </dd>
            </div>
            {open.blockedBy && (
              <div className="col-span-2 rounded-sm border border-critical-border bg-critical-fill p-3">
                <dt className="text-micro font-semibold text-critical">Blocked by (required reason)</dt>
                <dd className="mt-0.5">{open.blockedBy}</dd>
              </div>
            )}
            <div className="col-span-2">
              <dt className="text-micro text-muted">Escalation rule</dt>
              <dd className="mt-0.5 text-muted">2 working days late notifies the assignee; 5 escalates to the lead analyst (M05-2).</dd>
            </div>
          </dl>
        )}
      </Sheet>

      <Sheet open={!!assignFor} onOpenChange={(o) => !o && setAssignFor(null)} title="Assign" description={assignFor ? `${assignFor.title} · ${asset(assignFor.assetId).name}` : ''} size="sm">
        <ul className="space-y-1">
          {['kevin', 'mercy', 'wanjiru', 'esther', 'faith', 'amani'].map((p) => (
            <li key={p}>
              <button
                type="button"
                onClick={() => {
                  toast.success(`Assigned to ${person(p).name}`)
                  setAssignFor(null)
                  setSelected([])
                }}
                className="flex w-full items-center gap-3 rounded-sm px-2 py-2 text-left hover:bg-sunken"
              >
                <Avatar id={p} size={32} />
                <span className="min-w-0 flex-1">
                  <span className="block text-meta font-medium">{person(p).name}</span>
                  <span className="block text-micro text-muted">{person(p).role}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Sheet>

      <SnoozeSheet task={snoozeFor} onClose={() => setSnoozeFor(null)} />
      {state === 'timeout' && <SessionTimeout />}
    </Page>
  )
}

function SnoozeSheet({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const [days, setDays] = useState('1')
  const [reason, setReason] = useState('')
  return (
    <Sheet
      open={!!task}
      onOpenChange={(o) => !o && onClose()}
      title="Snooze with a reason"
      description={task ? task.title : ''}
      desktop="center"
      size="sm"
      footer={
        <Button
          block
          disabled={!reason}
          onClick={() => {
            toast(`Snoozed for ${days} day(s)`)
            onClose()
          }}
        >
          Snooze
        </Button>
      }
    >
      <div className="space-y-3">
        <Segmented
          ariaLabel="Snooze for"
          value={days}
          onChange={setDays}
          block
          options={[
            { value: '1', label: '1 day' },
            { value: '2', label: '2 days' },
            { value: '5', label: '5 days' },
          ]}
        />
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (required, logged)" aria-label="Reason" />
      </div>
    </Sheet>
  )
}

function SessionTimeout() {
  const [left] = useCountdown(120)
  const [open, setOpen] = useState(true)
  return (
    <Sheet open={open} onOpenChange={setOpen} title="Still there?" desktop="center" size="sm" footer={<Button block onClick={() => setOpen(false)}>Stay signed in</Button>}>
      <div className="flex items-start gap-3">
        <BellRing className="mt-0.5 size-5 text-review" aria-hidden />
        <p className="text-body">
          The Command Center signs out after 30 minutes idle. You will be signed out in{' '}
          <span className={cn('font-semibold tabular-nums')}>
            {Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}
          </span>
          . Unsaved work is kept.
        </p>
      </div>
    </Sheet>
  )
}

