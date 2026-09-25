import { Ban, MessageSquareReply } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { cn } from '@/lib/cn'
import { useDemoState } from '@/lib/demo-states'
import { asset, person, tasks, TASK_STATUS_LABEL, workstreamName, type Task, type TaskStatus } from '@/data'
import { DeadlineChip } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Avatar, Chip, Select } from '@/ds/ui'
import { SectionTabs, verificationTabs } from './common'

const STATES = [
  { id: 'default', label: 'Default' },
  { id: 'mine', label: 'Filtered: my tasks' },
] as const

const COLS: { id: TaskStatus; tone: string }[] = [
  { id: 'todo', tone: 'bg-line-strong' },
  { id: 'in_progress', tone: 'bg-review' },
  { id: 'blocked', tone: 'bg-critical' },
  { id: 'done', tone: 'bg-verified' },
]

export default function CC08Board() {
  const navigate = useNavigate()
  const [state] = useDemoState('CC-08', STATES)
  const [assetF, setAssetF] = useState('all')
  const [kind, setKind] = useState('all')
  const list = useMemo(
    () =>
      tasks.filter(
        (t) => (assetF === 'all' || t.assetId === assetF) && (kind === 'all' || (kind === 'rfi' ? t.kind === 'rfi' : t.kind !== 'rfi')) && (state !== 'mine' || t.assigneeId === 'kevin'),
      ),
    [assetF, kind, state],
  )

  return (
    <Page title="Tasks and requests" large headerExtra={<SectionTabs items={verificationTabs} />}>
      <div className="mb-3 flex flex-wrap gap-2">
        <Select value={assetF} onChange={(e) => setAssetF(e.target.value)} aria-label="Asset" className="md:w-56">
          <option value="all">All assets</option>
          {Array.from(new Set(tasks.map((t) => t.assetId))).map((id) => (
            <option key={id} value={id}>
              {asset(id).name}
            </option>
          ))}
        </Select>
        <Select value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Type" className="md:w-48">
          <option value="all">Tasks and requests</option>
          <option value="task">Tasks only</option>
          <option value="rfi">Requests for information</option>
        </Select>
      </div>
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 xl:grid-cols-4">
        {COLS.map((c) => {
          const items = list.filter((t) => t.status === c.id)
          return (
            <section key={c.id} className="w-[85vw] shrink-0 snap-start rounded-lg border border-line bg-sunken/50 md:w-auto" aria-label={TASK_STATUS_LABEL[c.id]}>
              <header className="flex items-center gap-2 px-3 py-2.5">
                <span className={cn('size-2 rounded-full', c.tone)} aria-hidden />
                <h2 className="text-meta font-semibold">{TASK_STATUS_LABEL[c.id]}</h2>
                <span className="rounded-full bg-surface px-1.5 text-micro tabular-nums text-muted">{items.length}</span>
              </header>
              <ul className="space-y-2 px-2 pb-2">
                {items.map((t) => (
                  <li key={t.id}>
                    <TaskCard task={t} onOpen={() => navigate(`/command/assets/${t.assetId}/${t.workstream === 'intake' ? 'triage' : 'workbench'}`, { viewTransition: true })} />
                  </li>
                ))}
                {items.length === 0 && <li className="rounded-sm border border-dashed border-line px-3 py-6 text-center text-micro text-muted">Nothing here</li>}
              </ul>
            </section>
          )
        })}
      </div>
    </Page>
  )
}

function TaskCard({ task: t, onOpen }: { task: Task; onOpen: () => void }) {
  const a = asset(t.assetId)
  return (
    <button type="button" onClick={onOpen} className="pressable block w-full rounded-lg border border-line bg-surface p-3 text-left shadow-e1 hover:shadow-e2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-meta font-semibold">{t.title}</p>
        {t.kind === 'rfi' && <MessageSquareReply className="size-4 shrink-0 text-disputed" aria-label="Request for information" />}
      </div>
      <p className="mt-0.5 text-micro text-muted">
        {a.name} · {t.workstream === 'intake' ? 'Intake' : t.workstream === 'deal' ? 'Deal flow' : workstreamName(t.workstream)}
      </p>
      {t.blockedBy && (
        <Chip tone="critical" icon={<Ban />} className="mt-2 max-w-full">
          <span className="truncate">{t.blockedBy}</span>
        </Chip>
      )}
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="inline-flex min-w-0 items-center gap-1.5 text-micro text-muted">
          <Avatar id={t.assigneeId} size={20} />
          <span className="truncate">{person(t.assigneeId).name}</span>
        </span>
        <DeadlineChip due={t.due} status={t.status} />
      </div>
    </button>
  )
}
