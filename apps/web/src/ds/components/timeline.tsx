import { Ban, Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import { daysUntil, fmtDate, fmtDay, relativeDays, type Lang } from '@/lib/format'
import { asset, person, workstreamName, type Task } from '@/data'
import { Avatar, Checkbox, Chip } from '../ui'

export interface TimelineStep {
  label: string
  date: string
  who: string
  state: 'done' | 'current' | 'next'
  note?: string
}

/** Status Timeline: steps with dates and responsible people; current step highlighted with countdown. */
export function StatusTimeline({ steps, lang = 'en', variant = 'vertical', className }: { steps: TimelineStep[]; lang?: Lang; variant?: 'vertical' | 'compact'; className?: string }) {
  if (variant === 'compact') {
    const current = steps.findIndex((s) => s.state === 'current')
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center gap-1" aria-hidden>
          {steps.map((s, i) => (
            <span
              key={i}
              className={cn('h-1.5 flex-1 rounded-full', s.state === 'done' ? 'bg-primary' : s.state === 'current' ? 'bg-primary/40 animate-pulse-dot' : 'bg-sunken')}
            />
          ))}
        </div>
        {current >= 0 && (
          <p className="text-micro text-muted">
            <span className="font-medium text-fg">{steps[current].label}</span> · {person(steps[current].who).name} · {fmtDay(steps[current].date, lang)}
          </p>
        )}
      </div>
    )
  }
  return (
    <ol className={cn('relative', className)}>
      {steps.map((s, i) => {
        const left = daysUntil(s.date)
        return (
          <li key={i} className="relative flex gap-3 pb-5 last:pb-0" aria-current={s.state === 'current' ? 'step' : undefined}>
            {i < steps.length - 1 && <span className={cn('absolute left-[11px] top-6 bottom-0 w-0.5', s.state === 'done' ? 'bg-primary' : 'bg-line')} aria-hidden />}
            <span
              className={cn(
                'relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2',
                s.state === 'done' && 'border-primary bg-primary text-on-primary',
                s.state === 'current' && 'border-primary bg-surface',
                s.state === 'next' && 'border-line bg-surface',
              )}
            >
              {s.state === 'done' ? <Check className="size-3.5" strokeWidth={3} /> : s.state === 'current' ? <span className="size-2 rounded-full bg-primary animate-pulse-dot" /> : null}
            </span>
            <div className={cn('min-w-0 flex-1 -mt-0.5', s.state === 'current' && 'rounded-lg bg-primary-tint/60 p-3 -m-1.5 ml-0')}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className={cn('text-meta', s.state === 'next' ? 'text-muted' : 'font-semibold text-fg')}>{s.label}</p>
                <p className="text-micro tabular-nums text-muted">
                  {fmtDate(s.date, lang)}
                  {s.state === 'current' && <span className={cn('ml-1.5 font-semibold', left < 0 ? 'text-critical' : 'text-primary')}>({relativeDays(s.date, lang)})</span>}
                </p>
              </div>
              <p className="mt-0.5 flex items-center gap-1.5 text-micro text-muted">
                <Avatar id={s.who} size={16} />
                {person(s.who).name}
              </p>
              {s.note && <p className="mt-1 text-micro text-fg">{s.note}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function deadlineState(due: string, status?: Task['status']): 'on_track' | 'due_today' | 'overdue' | 'done' {
  if (status === 'done') return 'done'
  const d = daysUntil(due)
  if (d < 0) return 'overdue'
  if (d === 0) return 'due_today'
  return 'on_track'
}

export function DeadlineChip({ due, status, calm }: { due: string; status?: Task['status']; calm?: boolean }) {
  const s = deadlineState(due, status)
  if (s === 'done') return <Chip tone="verified">Done</Chip>
  if (s === 'overdue') return <Chip tone={calm ? 'review' : 'critical'}>Overdue {Math.abs(daysUntil(due))} d</Chip>
  if (s === 'due_today') return <Chip tone="review">Due today</Chip>
  return <Chip tone="neutral">On track · {fmtDay(due)}</Chip>
}

/** Queue Row: task, asset, workstream, assignee, due date, blocked-by chip, deadline state. */
export function QueueRow({
  task,
  active,
  selected,
  onSelect,
  onOpen,
  className,
}: {
  task: Task
  active?: boolean
  selected?: boolean
  onSelect?: (v: boolean) => void
  onOpen?: () => void
  className?: string
}) {
  const a = asset(task.assetId)
  const ws = task.workstream === 'intake' ? 'Intake' : task.workstream === 'deal' ? 'Deal flow' : workstreamName(task.workstream)
  return (
    <div
      role="row"
      aria-selected={active}
      onClick={onOpen}
      className={cn(
        'group flex cursor-pointer items-start gap-3 border-b border-line/70 px-3 py-3 transition-colors last:border-0 hover:bg-sunken/60 md:items-center md:py-0 md:h-row md:min-h-11',
        active && 'bg-primary-tint shadow-[inset_3px_0_0_var(--primary)]',
        className,
      )}
    >
      {onSelect && (
        <span onClick={(e) => e.stopPropagation()} className="max-md:mt-0.5">
          <Checkbox checked={!!selected} onCheckedChange={onSelect} />
        </span>
      )}
      <div className="min-w-0 flex-1 md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,1.9fr)] md:items-center md:gap-3">
        <p className="truncate text-body font-medium text-fg">{task.title}</p>
        <p className="truncate text-meta text-muted md:text-body md:text-fg">
          {a.name}
          <span className="md:hidden"> · {ws}</span>
        </p>
        <p className="hidden truncate text-meta text-muted md:block">{ws}</p>
        <p className="mt-1 flex min-w-0 items-center gap-1.5 text-meta text-muted md:mt-0">
          <Avatar id={task.assigneeId} size={20} />
          <span className="truncate">{person(task.assigneeId).name}</span>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 md:mt-0 md:justify-end">
          {task.blockedBy && (
            <Chip tone="critical" icon={<Ban />} className="max-w-64 truncate">
              <span className="truncate">Blocked by: {task.blockedBy}</span>
            </Chip>
          )}
          <DeadlineChip due={task.due} status={task.status} />
        </div>
      </div>
    </div>
  )
}
