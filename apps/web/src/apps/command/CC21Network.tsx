import { BadgeCheck, CircleAlert, Clock, Repeat, Star } from 'lucide-react'
import { useState } from 'react'
import { useDemoState } from '@/lib/demo-states'
import { fmtDate, money } from '@/lib/format'
import { KIND_LABEL, network, person, type NetworkMember } from '@/data'
import { Panel } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Avatar, Chip, DataTable, Sheet, Tabs, TabsContent, TabsList, TabsTrigger } from '@/ds/ui'
import { AssignmentTool } from './AssignmentTool'

const cred = { verified: { tone: 'verified', label: 'Verified', Icon: BadgeCheck }, pending: { tone: 'review', label: 'Pending', Icon: Clock }, expired: { tone: 'critical', label: 'Expired', Icon: CircleAlert } } as const
const avail = { available: { tone: 'verified', label: 'Available' }, limited: { tone: 'review', label: 'Limited' }, unavailable: { tone: 'neutral', label: 'Unavailable' } } as const

export default function CC21Network() {
  useDemoState('CC-21', [{ id: 'default', label: 'Default' }] as const)
  const [open, setOpen] = useState<NetworkMember | null>(null)
  return (
    <Page title="Experts and field network" shortTitle="Network" large>
      <Tabs defaultValue="dir">
        <TabsList className="-mx-4 mb-4 px-4 md:mx-0 md:px-0">
          <TabsTrigger value="dir" count={network.length}>
            Directory
          </TabsTrigger>
          <TabsTrigger value="assign">Assignment tool</TabsTrigger>
          <TabsTrigger value="repeat">Random repeat visits</TabsTrigger>
        </TabsList>
        <TabsContent value="dir">
          <DataTable
            caption="Network"
            rows={network}
            getId={(n) => n.personId}
            onRowClick={setOpen}
            columns={[
              { key: 'name', header: 'Name', sortValue: (n) => person(n.personId).name, cell: (n) => <span className="inline-flex items-center gap-2"><Avatar id={n.personId} size={26} /><span className="font-medium">{person(n.personId).name}</span></span> },
              { key: 'role', header: 'Role', cell: (n) => KIND_LABEL[n.kind] },
              { key: 'cred', header: 'Credentials', cell: (n) => { const c = cred[n.credentialStatus]; return <Chip tone={c.tone} icon={<c.Icon />}>{c.label}</Chip> } },
              { key: 'jur', header: 'Jurisdictions', cell: (n) => <span className="text-muted">{n.jurisdictions.join(', ')}</span>, hideBelow: 'xl' },
              { key: 'rate', header: 'Rate', align: 'right', sortValue: (n) => n.rateUsd, cell: (n) => `${money('USD', n.rateUsd)}/${n.rateUnit}`, hideBelow: 'lg' },
              { key: 'avail', header: 'Availability', cell: (n) => <Chip tone={avail[n.availability].tone}>{avail[n.availability].label}</Chip> },
              { key: 'active', header: 'Active', align: 'right', sortValue: (n) => n.active, cell: (n) => n.active },
              { key: 'tat', header: 'Turnaround', align: 'right', sortValue: (n) => n.turnaroundDays, cell: (n) => `${n.turnaroundDays} d`, hideBelow: 'xl' },
              { key: 'rework', header: 'Rework', align: 'right', sortValue: (n) => n.reworkRate, cell: (n) => `${Math.round(n.reworkRate * 100)}%`, hideBelow: 'xl' },
              { key: 'rating', header: 'Rating', align: 'right', sortValue: (n) => n.rating, cell: (n) => <span className="inline-flex items-center gap-1"><Star className="size-3.5 text-muted" aria-hidden />{n.rating.toFixed(1)}</span> },
            ]}
            mobileCard={(n) => (
              <div className="flex items-center gap-3">
                <Avatar id={n.personId} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{person(n.personId).name}</p>
                  <p className="text-micro text-muted">
                    {KIND_LABEL[n.kind]} · {n.active} active · ★ {n.rating.toFixed(1)}
                  </p>
                </div>
                <Chip tone={cred[n.credentialStatus].tone}>{cred[n.credentialStatus].label}</Chip>
              </div>
            )}
          />
        </TabsContent>
        <TabsContent value="assign">
          <p className="mb-3 text-meta text-muted">Task: One-day site visit · Tsavo East Garnet · Kenya · deadline 6 Oct 2026</p>
          <AssignmentTool task={{ id: 't', title: 'One-day site visit', assetName: 'Tsavo East Garnet', jurisdiction: 'Kenya', commodity: 'Garnet', kind: 'field', deadline: '2026-10-06' }} />
        </TabsContent>
        <TabsContent value="repeat">
          <Panel title="Selected for re-verification this month" subtitle="10% of visits, repeated by a different verifier (M11-9)">
            <ul className="divide-y divide-line">
              {[
                { asset: 'Galana Flake Graphite', original: 'brian', repeat: 'collins', date: '2026-09-11', outcome: 'Consistent', tone: 'verified' as const },
                { asset: 'Pwani Heavy Sands', original: 'halima', repeat: 'brian', date: '2026-09-18', outcome: 'Discrepancy: beacon NE-3 moved 60 m', tone: 'critical' as const },
                { asset: 'Kiboko Ridge Graphite', original: 'brian', repeat: 'collins', date: '2026-10-08', outcome: 'Scheduled', tone: 'neutral' as const },
              ].map((r) => (
                <li key={r.asset} className="flex flex-wrap items-center gap-3 py-3">
                  <Repeat className="size-4 text-muted" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-meta font-medium">{r.asset}</p>
                    <p className="text-micro text-muted">
                      Original {person(r.original).name} → repeat {person(r.repeat).name} · {fmtDate(r.date)}
                    </p>
                  </div>
                  <Chip tone={r.tone}>{r.outcome}</Chip>
                </li>
              ))}
            </ul>
          </Panel>
        </TabsContent>
      </Tabs>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)} title={open ? person(open.personId).name : ''} description={open ? `${KIND_LABEL[open.kind]} · ${person(open.personId).location}` : ''} size="md">
        {open && (
          <div className="space-y-5">
            <section>
              <p className="text-micro font-semibold uppercase tracking-wide text-muted">Credentials</p>
              <p className="mt-1 text-meta">
                {person(open.personId).credentialBody} · <span className="font-mono">{person(open.personId).credential}</span>
              </p>
              <p className="text-micro text-muted">Expires {fmtDate(person(open.personId).credentialExpiry ?? '2027-01-01')}</p>
            </section>
            <section>
              <p className="text-micro font-semibold uppercase tracking-wide text-muted">Conflicts register</p>
              <p className="mt-1 text-meta">{open.personId === 'amani' ? 'Prior paid work for Nyanza holder (2024 soil sampling)' : 'No declared conflicts'}</p>
            </section>
            <section>
              <p className="text-micro font-semibold uppercase tracking-wide text-muted">Recent assignments</p>
              <ul className="mt-1 space-y-1 text-meta">
                <li>Kiboko Ridge Graphite · accepted first time</li>
                <li>Galana Flake Graphite · accepted after 1 clarification</li>
              </ul>
            </section>
            <section>
              <p className="text-micro font-semibold uppercase tracking-wide text-muted">Payouts</p>
              <p className="mt-1 text-meta">
                {money('USD', open.rateUsd * 6)} paid in 2026 · M-Pesa / bank transfer
              </p>
            </section>
          </div>
        )}
      </Sheet>
    </Page>
  )
}
