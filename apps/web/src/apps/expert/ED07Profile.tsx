import { BadgeCheck, CalendarDays, Clock, FileUp, ShieldAlert, Wallet } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/cn'
import { useDemoState } from '@/lib/demo-states'
import { addDays, fmtDate, money, toIso } from '@/lib/format'
import { asset, assignments, network, person } from '@/data'
import { Banner, EmptyState, Panel } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Button, Chip, DataTable, Input, toast } from '@/ds/ui'
import { EXPERT_ID } from './ExpertShell'

const PROFILE_STATES = [
  { id: 'default', label: 'Default' },
  { id: 'pending', label: 'Credential awaiting verification' },
] as const
const PAYOUT_STATES = [
  { id: 'default', label: 'Default' },
  { id: 'pending', label: 'Payout pending acceptance' },
  { id: 'empty', label: 'No payouts yet' },
] as const

/** ED-07 · Profile */
export default function ED07Profile() {
  const [state] = useDemoState('ED-07-profile', PROFILE_STATES)
  const me = person(EXPERT_ID)
  const n = network.find((x) => x.personId === EXPERT_ID)!
  const [rate, setRate] = useState(String(n.rateUsd))
  const [away, setAway] = useState<string[]>(['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16'])
  const days = Array.from({ length: 35 }, (_, i) => toIso(addDays('2026-09-28', i)))

  return (
    <Page title="Profile" large subtitle={`${me.name} · ${me.location}`}>
      {state === 'pending' && (
        <Banner tone="info" icon={<Clock />} title="New credential awaiting verification" className="mb-4">
          AusIMM membership MAusIMM 331904 uploaded 23 Sep. SSD checks it on the public register within 1 working day.
        </Banner>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Credentials" action={<Button size="sm" variant="secondary" icon={<FileUp />} onClick={() => toast('Upload certificate (demo)')}>Add</Button>}>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 rounded-sm border border-line p-3">
              <BadgeCheck className="mt-0.5 size-5 text-verified" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-meta font-semibold">
                  {me.credentialBody} · <span className="font-mono">{me.credential}</span>
                </p>
                <p className="text-micro text-muted">Professional Natural Scientist · Qualified Person under JORC, SAMREC and S-K 1300</p>
                <p className="mt-1 text-micro">Expires {fmtDate(me.credentialExpiry!)} · reminder 60 days before</p>
              </div>
              <Chip tone="verified">Verified</Chip>
            </li>
            {state === 'pending' && (
              <li className="flex items-start gap-3 rounded-sm border border-dashed border-line-strong p-3">
                <Clock className="mt-0.5 size-5 text-review" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-meta font-semibold">
                    AusIMM · <span className="font-mono">MAusIMM 331904</span>
                  </p>
                  <p className="text-micro text-muted">Uploaded 23 Sep 2026</p>
                </div>
                <Chip tone="review">Awaiting verification</Chip>
              </li>
            )}
          </ul>
        </Panel>
        <Panel title="Scope and rate">
          <dl className="space-y-3 text-meta">
            <div>
              <dt className="text-micro text-muted">Jurisdictions</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {n.jurisdictions.map((j) => (
                  <Chip key={j} tone="outline">
                    {j}
                  </Chip>
                ))}
              </dd>
            </div>
            <div>
              <dt className="text-micro text-muted">Commodities</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {n.commodities.map((j) => (
                  <Chip key={j} tone="outline">
                    {j}
                  </Chip>
                ))}
              </dd>
            </div>
            <div>
              <dt className="text-micro text-muted">Day rate (USD)</dt>
              <dd className="mt-1 flex items-center gap-2">
                <Input value={rate} onChange={(e) => setRate(e.target.value)} inputMode="numeric" className="w-32 font-mono" aria-label="Day rate" />
                <Button size="sm" variant="tint" onClick={() => toast.success('Rate saved')}>
                  Save
                </Button>
              </dd>
            </div>
          </dl>
        </Panel>
        <Panel title="Availability" subtitle="Tap days you are away" action={<CalendarDays className="size-4 text-muted" aria-hidden />}>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <span key={i}>{d}</span>
            ))}
            {days.map((d) => {
              const off = away.includes(d)
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={off}
                  aria-label={`${fmtDate(d)} ${off ? 'away' : 'available'}`}
                  onClick={() => setAway((a) => (off ? a.filter((x) => x !== d) : [...a, d]))}
                  className={cn('aspect-square rounded-sm text-meta tabular-nums transition-colors', off ? 'stale-stripes bg-stale-fill text-muted line-through' : 'bg-verified-fill/60 text-fg hover:bg-verified-fill')}
                >
                  {Number(d.slice(8))}
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-micro text-muted">Away 12–16 Oct (conference). SSD won't send offers due on those days.</p>
        </Panel>
        <Panel title="Conflicts register" subtitle="Declared once; checked on every offer">
          <ul className="space-y-2 text-meta">
            <li className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-review" aria-hidden />
              <span>2021–2022: consulting for Kilima Graphite (Tanzania). Not a Kenyan holder.</span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-review" aria-hidden />
              <span>Holds shares in an ASX-listed graphite developer (under 1%).</span>
            </li>
          </ul>
          <Button size="sm" variant="secondary" className="mt-3" onClick={() => toast('Add a declaration (demo)')}>
            Add declaration
          </Button>
        </Panel>
      </div>
    </Page>
  )
}

/** ED-07 · Payouts */
export function ED07Payouts() {
  const [state] = useDemoState('ED-07-payouts', PAYOUT_STATES)
  const rows = state === 'empty' ? [] : assignments.filter((a) => a.expertId === EXPERT_ID && ['accepted', 'paid'].includes(a.status))
  const withPending = state === 'pending' ? rows.map((r) => (r.id === 'as-8' ? { ...r, status: 'submitted' as const, reference: 'Awaiting SSD acceptance' } : r)) : rows
  const total = rows.filter((r) => r.status === 'paid').reduce((s, r) => s + r.feeUsd, 0)
  return (
    <Page title="Payouts" large>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-surface p-4 shadow-e1">
          <p className="text-micro text-muted">Paid this year</p>
          <p className="mt-1 text-h1 font-semibold tabular-nums">{money('USD', total)}</p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4 shadow-e1">
          <p className="text-micro text-muted">Pending</p>
          <p className="mt-1 text-h1 font-semibold tabular-nums">{money('USD', 1800)}</p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4 shadow-e1">
          <p className="flex items-center gap-1.5 text-micro text-muted">
            <Wallet className="size-3.5" aria-hidden /> Paid to
          </p>
          <p className="mt-1 text-meta font-medium">Bank transfer · Standard Bank ••• 4471</p>
        </div>
      </div>
      <DataTable
        caption="Payouts"
        rows={withPending}
        getId={(r) => r.id}
        empty={<EmptyState icon={<Wallet />} title="No payouts yet" body="Payouts are released after SSD accepts your work (M12-7)." compact />}
        columns={[
          { key: 'asset', header: 'Assignment', cell: (r) => <div><p className="font-medium">{asset(r.assetId).name}</p><p className="text-micro text-muted">{r.taskType}</p></div> },
          { key: 'fee', header: 'Fee', align: 'right', cell: (r) => money('USD', r.feeUsd) },
          { key: 'status', header: 'Status', cell: (r) => <Chip tone={r.status === 'paid' ? 'verified' : r.status === 'accepted' ? 'primary' : 'review'}>{r.status === 'paid' ? 'Paid' : r.status === 'accepted' ? 'Accepted' : 'Pending acceptance'}</Chip> },
          { key: 'date', header: 'Payment date', cell: (r) => (r.paidOn ? fmtDate(r.paidOn) : '—') },
          { key: 'ref', header: 'Reference', cell: (r) => <span className="font-mono text-[12px]">{r.reference ?? '—'}</span> },
        ]}
        mobileCard={(r) => (
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium">{asset(r.assetId).name}</p>
              <p className="text-micro text-muted">
                {money('USD', r.feeUsd)} · {r.paidOn ? fmtDate(r.paidOn) : 'not paid yet'}
              </p>
            </div>
            <Chip tone={r.status === 'paid' ? 'verified' : 'review'}>{r.status === 'paid' ? 'Paid' : 'Pending'}</Chip>
          </div>
        )}
      />
    </Page>
  )
}
