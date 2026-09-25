import { CalendarDays, Clock, Inbox, TimerOff } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { cn } from '@/lib/cn'
import { useDemoState } from '@/lib/demo-states'
import { addDays, daysUntil, fmtDate, fmtDay, money, toIso } from '@/lib/format'
import { asset, assignments, type ExpertAssignment } from '@/data'
import { Banner, EmptyState } from '@/ds/components'
import { Page } from '@/ds/shell'
import { ButtonLink, Chip, DataTable, Segmented } from '@/ds/ui'
import { EXPERT_ID } from './ExpertShell'

const STATES = [
  { id: 'default', label: 'Default' },
  { id: 'no_offers', label: 'No offers' },
  { id: 'expiring', label: 'Access about to expire' },
] as const

type Tab = 'offers' | 'active' | 'completed'

export function DaysLeftChip({ a }: { a: ExpertAssignment }) {
  const left = daysUntil(a.deadline)
  if (a.status === 'paid' || a.status === 'accepted' || a.status === 'submitted') return <Chip tone="verified">{a.status === 'paid' ? 'Paid' : a.status === 'accepted' ? 'Accepted' : 'Submitted'}</Chip>
  // Overdue stays calm: amber, not red (ED-01 prompt).
  if (left < 0) return <Chip tone="review">Overdue {Math.abs(left)} d</Chip>
  return <Chip tone={left <= 3 ? 'review' : 'neutral'}>{left} days left</Chip>
}

export default function ED01Inbox() {
  const navigate = useNavigate()
  const [state] = useDemoState('ED-01', STATES)
  const mine = assignments.filter((a) => a.expertId === EXPERT_ID)
  const offers = state === 'no_offers' ? [] : mine.filter((a) => a.status === 'offer')
  const active = mine.filter((a) => a.status === 'active' || a.status === 'overdue')
  const completed = mine.filter((a) => ['submitted', 'accepted', 'paid'].includes(a.status))
  const [tab, setTab] = useState<Tab>(offers.length ? 'offers' : 'active')
  const rows = tab === 'offers' ? offers : tab === 'active' ? active : completed
  const pending = [...active, ...mine.filter((a) => a.status === 'accepted')].reduce((s, a) => s + a.feeUsd, 0)

  // This week (Mon 21 – Sun 27 Sep) plus the next, with deadlines marked.
  const days = Array.from({ length: 14 }, (_, i) => toIso(addDays('2026-09-21', i)))
  const deadlines = mine.filter((a) => a.status === 'active' || a.status === 'overdue' || a.status === 'offer')

  return (
    <Page title="Assignments" large subtitle="Dr Nomvula Dlamini · Qualified Person">
      {state === 'expiring' && (
        <Banner tone="warning" icon={<TimerOff />} title="Access to Tsavo East Garnet data ends 27 Sep" className="mb-4">
          Access ends 7 days after the deadline. Ask Kevin Omondi for an extension if you need more time.
        </Banner>
      )}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0">
          <Segmented<Tab>
            ariaLabel="Assignments"
            value={tab}
            onChange={setTab}
            className="mb-3"
            options={[
              { value: 'offers', label: 'Offers', count: offers.length },
              { value: 'active', label: 'Active', count: active.length },
              { value: 'completed', label: 'Completed' },
            ]}
          />
          <DataTable
            caption="Assignments"
            rows={rows}
            getId={(a) => a.id}
            onRowClick={(a) => navigate(a.status === 'offer' ? `/expert/offers/${a.id}` : `/expert/reviews/${a.id}`, { viewTransition: true })}
            empty={
              <EmptyState
                icon={<Inbox />}
                title={tab === 'offers' ? 'No offers right now' : 'Nothing here'}
                body={tab === 'offers' ? 'SSD matches assignments on jurisdiction, commodity, availability and declared conflicts. Keep your availability current in Profile to receive offers.' : undefined}
                contactId="kevin"
              />
            }
            columns={[
              {
                key: 'asset',
                header: 'Asset',
                cell: (a) => (
                  <div>
                    <p className="font-medium">{asset(a.assetId).name}</p>
                    <p className="text-micro text-muted">{a.taskType}</p>
                  </div>
                ),
              },
              { key: 'scope', header: 'Scope', cell: (a) => <p className="line-clamp-2 max-w-md text-meta text-muted">{a.scope}</p>, hideBelow: 'xl' },
              { key: 'fee', header: 'Fee', align: 'right', sortValue: (a) => a.feeUsd, cell: (a) => money('USD', a.feeUsd) },
              { key: 'deadline', header: 'Deadline', sortValue: (a) => a.deadline, cell: (a) => fmtDate(a.deadline) },
              { key: 'left', header: 'Status', cell: (a) => <DaysLeftChip a={a} /> },
            ]}
            mobileCard={(a) => (
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{asset(a.assetId).name}</p>
                  <DaysLeftChip a={a} />
                </div>
                <p className="text-meta text-muted">{a.taskType}</p>
                <p className="text-micro text-muted">
                  {money('USD', a.feeUsd)} · due {fmtDate(a.deadline)}
                </p>
              </div>
            )}
          />
          {tab === 'offers' && offers.length > 0 && (
            <div className="mt-3 flex justify-end">
              <ButtonLink to={`/expert/offers/${offers[0].id}`} variant="tint">
                Review first offer
              </ButtonLink>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-line bg-surface p-4 shadow-e1" aria-label="Your week">
            <p className="flex items-center gap-2 text-h3 font-semibold">
              <CalendarDays className="size-4.5 text-muted" aria-hidden /> Your week
            </p>
            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] text-muted">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <span key={i}>{d}</span>
              ))}
              {days.map((d) => {
                const due = deadlines.filter((a) => a.deadline === d)
                const today = d === '2026-09-24'
                return (
                  <span
                    key={d}
                    title={due.map((a) => `${asset(a.assetId).name}: ${a.taskType}`).join('\n') || undefined}
                    className={cn('relative flex aspect-square items-center justify-center rounded-sm text-meta tabular-nums', today ? 'bg-primary font-semibold text-on-primary' : 'text-fg', due.length && !today && 'bg-review-fill font-semibold')}
                  >
                    {Number(d.slice(8))}
                    {due.length > 0 && <span className="absolute bottom-1 size-1 rounded-full bg-review" />}
                  </span>
                )
              })}
            </div>
            <ul className="mt-3 space-y-2">
              {deadlines
                .slice()
                .sort((x, y) => x.deadline.localeCompare(y.deadline))
                .map((a) => (
                  <li key={a.id} className="flex items-start gap-2 text-micro">
                    <Clock className="mt-0.5 size-3.5 shrink-0 text-muted" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="font-medium text-fg">{fmtDay(a.deadline)}</span> · {asset(a.assetId).name}
                    </span>
                  </li>
                ))}
            </ul>
          </section>
          <section className="rounded-lg border border-line bg-surface p-4 shadow-e1">
            <p className="text-micro font-medium text-muted">Fees pending</p>
            <p className="mt-1 text-[26px] leading-8 font-semibold tabular-nums">{money('USD', pending)}</p>
            <p className="text-micro text-muted">Paid after SSD accepts the work (M12-7)</p>
          </section>
        </aside>
      </div>
    </Page>
  )
}
