import { Clock, Forward, Send, ShieldOff, Sparkles, Stamp, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { useDemoState } from '@/lib/demo-states'
import { daysUntil, fmtDate } from '@/lib/format'
import { useChartTheme } from '@/lib/chart'
import { asset, dealRooms, investor, person, questions, type DealRoom, type Question } from '@/data'
import { EvidenceChip, Panel, RuleGateBanner } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Avatar, Button, Chip, DataTable, Sheet, Switch, Textarea, toast } from '@/ds/ui'
import { dealsTabs, SectionTabs } from './common'

const STATES = [
  { id: 'default', label: 'Default' },
  { id: 'overdue', label: 'Question overdue' },
  { id: 'flagged', label: 'Answer flagged by screening' },
] as const

function Sparkline({ data }: { data: number[] }) {
  const t = useChartTheme()
  const max = Math.max(...data, 1)
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 80},${22 - (v / max) * 20}`).join(' ')
  return (
    <svg width="80" height="24" viewBox="0 0 80 24" role="img" aria-label={`Views over 14 days, peak ${max}`}>
      <polyline points={pts} fill="none" stroke={t.series[0]} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export default function CC16Deals() {
  const [state] = useDemoState('CC-16', STATES)
  const [room, setRoom] = useState<DealRoom | null>(null)
  const [q, setQ] = useState<Question | null>(null)
  const [revokeOpen, setRevokeOpen] = useState(false)
  const queue = questions.filter((x) => x.status !== 'answered')

  return (
    <Page title="Deal rooms" large headerExtra={<SectionTabs items={dealsTabs} />}>
      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section>
          <DataTable
            caption="Deal rooms"
            rows={dealRooms}
            getId={(r) => r.id}
            onRowClick={setRoom}
            columns={[
              { key: 'asset', header: 'Asset', cell: (r) => <div><p className="font-medium">{asset(r.assetId).name}</p><p className="font-mono text-[11px] text-muted">{asset(r.assetId).code}</p></div> },
              { key: 'inv', header: 'Investor', cell: (r) => investor(r.investorId).name },
              { key: 'nda', header: 'NDA', cell: (r) => fmtDate(r.ndaOn), hideBelow: 'xl' },
              { key: 'exp', header: 'Expires', sortValue: (r) => r.expires, cell: (r) => <span className={daysUntil(r.expires) < 10 ? 'text-review font-medium' : ''}>{fmtDate(r.expires)}</span> },
              { key: 'act', header: 'Activity (14 d)', cell: (r) => <Sparkline data={r.activity} />, hideBelow: 'lg' },
              { key: 'q', header: 'Open questions', align: 'right', cell: (r) => r.openQuestions },
              { key: 'st', header: 'Status', cell: (r) => <Chip tone={r.status === 'open' ? 'verified' : 'review'}>{r.status === 'open' ? 'Open' : 'Closing'}</Chip> },
            ]}
            mobileCard={(r) => (
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{asset(r.assetId).name}</p>
                  <p className="text-micro text-muted">
                    {investor(r.investorId).name} · expires {fmtDate(r.expires)} · {r.openQuestions} open
                  </p>
                </div>
                <Sparkline data={r.activity} />
              </div>
            )}
          />
        </section>

        <Panel title="Question moderation" subtitle="SSD forwards to the owner, checks answers, then publishes" bodyClassName="p-0">
          <ul className="divide-y divide-line">
            {queue.map((x) => {
              const overdue = daysUntil(x.due) < 0 || (state === 'overdue' && x.id === 'q1')
              return (
                <li key={x.id}>
                  <button type="button" onClick={() => setQ(x)} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-sunken/60">
                    <Avatar id={x.askedById} size={28} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Chip tone="outline" size="sm">
                          {x.category}
                        </Chip>
                        {overdue ? (
                          <Chip tone="critical" size="sm" icon={<Clock />}>
                            Overdue
                          </Chip>
                        ) : (
                          <Chip size="sm">Due {fmtDate(x.due)}</Chip>
                        )}
                        {x.status === 'follow_up' && (
                          <Chip tone="disputed" size="sm">
                            Follow-up
                          </Chip>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-meta">{x.text}</p>
                      <p className="text-micro text-muted">
                        {asset(dealRooms.find((r) => r.id === x.roomId)!.assetId).code} · {investor(dealRooms.find((r) => r.id === x.roomId)!.investorId).name} · suggested route: owner's technical team
                      </p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </Panel>
      </div>

      {/* Room admin */}
      <Sheet
        open={!!room}
        onOpenChange={(o) => !o && setRoom(null)}
        title={room ? `${asset(room.assetId).name} × ${investor(room.investorId).name}` : ''}
        description={room ? `NDA ${fmtDate(room.ndaOn)} · ${room.documents} documents` : ''}
        size="lg"
        footer={
          <div className="flex flex-wrap justify-between gap-2">
            <Button variant="danger" icon={<ShieldOff />} onClick={() => setRevokeOpen(true)}>
              Revoke all access
            </Button>
            <Button onClick={() => (toast.success('Room settings saved'), setRoom(null))}>Save</Button>
          </div>
        }
      >
        {room && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 text-meta">
              <div className="rounded-sm border border-line p-3">
                <p className="text-micro text-muted">Expiry</p>
                <input type="date" defaultValue={room.expires} className="mt-1 w-full bg-transparent font-medium" aria-label="Expiry date" />
              </div>
              <div className="rounded-sm border border-line p-3">
                <p className="text-micro text-muted">Watermark</p>
                <p className="mt-1 inline-flex items-center gap-1.5 font-medium">
                  <Stamp className="size-4 text-muted" aria-hidden /> On every page (always)
                </p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-micro font-semibold uppercase tracking-wide text-muted">Folder permissions</p>
              <div className="overflow-x-auto rounded-sm border border-line">
                <table className="w-full text-meta">
                  <thead>
                    <tr className="border-b border-line text-left text-micro text-muted">
                      <th className="px-3 py-2 font-medium">Member</th>
                      {['Title', 'Geology', 'ESG', 'Technical'].map((f) => (
                        <th key={f} className="px-2 py-2 text-center font-medium">
                          {f}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: 'marcus', role: 'Admin' },
                      { id: 'priya', role: 'Member' },
                      { id: 'tom', role: 'Adviser · until 16 Dec' },
                    ].map((m) => (
                      <tr key={m.id} className="border-b border-line/70 last:border-0">
                        <td className="px-3 py-2">
                          <span className="flex items-center gap-2">
                            <Avatar id={m.id} size={22} />
                            <span>
                              <span className="block font-medium">{person(m.id).name}</span>
                              <span className="block text-[11px] text-muted">{m.role}</span>
                            </span>
                          </span>
                        </td>
                        {['Title', 'Geology', 'ESG', 'Technical'].map((f) => (
                          <td key={f} className="px-2 py-2 text-center">
                            <select defaultValue={m.id === 'tom' && f !== 'Geology' ? 'none' : f === 'ESG' ? 'view' : 'download'} className="rounded-sm border border-line bg-surface px-1 py-1 text-micro" aria-label={`${person(m.id).name} ${f}`}>
                              <option value="none">None</option>
                              <option value="view">View</option>
                              <option value="download">Download</option>
                            </select>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Switch checked label="Notify SSD when an adviser downloads" onCheckedChange={() => {}} />
          </div>
        )}
      </Sheet>

      <Sheet
        open={revokeOpen}
        onOpenChange={setRevokeOpen}
        title="Revoke all access?"
        desktop="center"
        size="sm"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setRevokeOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" className="flex-1" onClick={() => (setRevokeOpen(false), setRoom(null), toast('Access revoked; room archived under retention rules'))}>
              Revoke
            </Button>
          </div>
        }
      >
        <p className="text-body">Everyone in this room loses access immediately. The room is archived under retention rules and the owner is told.</p>
      </Sheet>

      {/* Question moderation */}
      <Sheet
        open={!!q}
        onOpenChange={(o) => !o && setQ(null)}
        title="Moderate question"
        description={q ? `${q.category} · asked by ${person(q.askedById).name} · due ${fmtDate(q.due)}` : ''}
        size="lg"
        footer={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon={<Forward />} onClick={() => toast.success('Forwarded to Grace Wanjiku')}>
              Forward to owner
            </Button>
            <Button icon={<Send />} disabled={state === 'flagged'} onClick={() => (toast.success('Answer published to the investor'), setQ(null))}>
              Approve and publish
            </Button>
          </div>
        }
      >
        {q && (
          <div className="space-y-4">
            <p className="rounded-sm bg-sunken/70 p-3 text-body">{q.text}</p>
            <div>
              <p className="mb-1.5 text-micro font-semibold uppercase tracking-wide text-muted">Owner's draft answer</p>
              <Textarea
                rows={4}
                defaultValue={
                  state === 'flagged'
                    ? // banned-words-ignore-next-line: the owner's draft that R05 flags in this demo state
                      'Yes, flotation achieved 95.2% Cg, a guaranteed premium product for battery makers.'
                    : 'Bench flotation on the 2025 composite achieved 95.2% Cg concentrate at 91% recovery. The report is in Geology / Metallurgy, pages 7–9.'
                }
                aria-label="Draft answer"
              />
            </div>
            {/* banned-words-ignore-next-line: the rule explanation quotes the flagged words */}
            {state === 'flagged' && <RuleGateBanner level="warning" rule="R05 Promotional language" reason={'"guaranteed" and "premium" read as promotional. Ask the owner to state results and cite the report.'} />}
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-micro font-semibold text-muted">
                <Sparkles className="size-3.5 text-primary" aria-hidden /> Suggested source documents (AI, check before citing)
              </p>
              <div className="flex flex-wrap gap-1.5">
                <EvidenceChip ev={{ docId: 'kb-d14', page: 7 }} />
                <EvidenceChip ev={{ docId: 'kb-d10', page: 88 }} />
              </div>
            </div>
            {daysUntil(q.due) < 0 && (
              <p className="flex items-center gap-1.5 text-meta text-critical">
                <TriangleAlert className="size-4" aria-hidden /> Overdue since {fmtDate(q.due)}; the investor sees “Answer expected soon”.
              </p>
            )}
            <p className="text-micro text-muted">Every step is logged to the audit trail (M22).</p>
          </div>
        )}
      </Sheet>
    </Page>
  )
}
