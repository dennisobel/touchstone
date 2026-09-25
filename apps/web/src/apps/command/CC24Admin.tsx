import { CircleCheck, FileCheck2, FileUp, Flag, KeyRound, LibraryBig, Power, RotateCcw, ShieldAlert, TriangleAlert, UserRoundCog } from 'lucide-react'
import { useState } from 'react'
import { useDemoState } from '@/lib/demo-states'
import { fmtDate } from '@/lib/format'
import { useDemo } from '@/lib/store'
import { featureFlags, integrations, person } from '@/data'
import { Banner, Panel } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Avatar, Button, Chip, DataTable, Sheet, Switch, Tabs, TabsContent, TabsList, TabsTrigger, toast } from '@/ds/ui'

const STATES = [{ id: 'default', label: 'Default' }] as const

const STAFF = [
  { id: 'kevin', role: 'Analyst', scope: 'Verification, matching (propose), deal rooms', lastReview: '2026-07-01' },
  { id: 'mercy', role: 'Analyst', scope: 'Verification', lastReview: '2026-07-01' },
  { id: 'sarah', role: 'Compliance', scope: 'Release, qualification, rules, escalations, legal holds', lastReview: '2026-07-01' },
  { id: 'james', role: 'Partner', scope: 'Investor invitations, match approval', lastReview: '2026-07-01' },
  { id: 'aisha', role: 'Operations (admin)', scope: 'Configuration, templates, integrations', lastReview: '2026-07-01' },
  { id: 'counsel', role: 'Outside counsel (read-only)', scope: 'Counsel queue and matter files only', lastReview: '2026-07-01' },
]

const TEMPLATES = [
  { name: 'Verification plan · Kenya · gold · Standard', kind: 'Workflow', version: 'v4', status: 'Published', updated: '2026-08-30' },
  { name: 'Document checklist · Prospecting licence', kind: 'Checklist', version: 'v7', status: 'Published', updated: '2026-09-02' },
  { name: 'OWN-12 Teaser approval request (EN/SW)', kind: 'Message', version: 'v3', status: 'Published', updated: '2026-09-10' },
  { name: 'INV-04 “Something is waiting in the portal”', kind: 'Message', version: 'v2', status: 'In review', updated: '2026-09-21' },
  { name: 'Verification plan · Kenya · graphite · Investor-ready', kind: 'Workflow', version: 'v2', status: 'Draft', updated: '2026-09-23' },
]

export default function CC24Admin() {
  useDemoState('CC-24', STATES)
  const persona = useDemo((s) => s.commandPersona)
  const libraryOn = useDemo((s) => s.libraryOn)
  const setLibraryOn = useDemo((s) => s.setLibraryOn)
  const [flags, setFlags] = useState(featureFlags)
  const [libOpen, setLibOpen] = useState(false)
  const [approvals, setApprovals] = useState<string[]>([])
  const [counselDoc, setCounselDoc] = useState(false)

  const approve = () => {
    if (approvals.includes(persona)) return toast('You already approved. A different person must give the second approval.')
    setApprovals((a) => [...a, persona])
  }
  const ready = approvals.length >= 2 && counselDoc

  return (
    <Page title="Admin" large subtitle="Configuration without code: drafts, diffs, approvals and rollback">
      <Tabs defaultValue="flags">
        <TabsList className="-mx-4 mb-4 px-4 md:mx-0 md:px-0">
          <TabsTrigger value="users">Users and roles</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="flags">Feature flags</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Panel title="SSD users" subtitle="Quarterly access review · last signed off 1 Jul 2026" action={<Button size="sm" variant="tint" icon={<UserRoundCog />} onClick={() => toast.success('Q3 access review signed off by Aisha Hassan')}>Sign off Q3 review</Button>} bodyClassName="p-0">
            <ul className="divide-y divide-line">
              {STAFF.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <Avatar id={s.id} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="text-meta font-medium">{person(s.id).name}</p>
                    <p className="text-micro text-muted">{s.scope}</p>
                  </div>
                  <Chip tone={s.role.startsWith('Compliance') ? 'disputed' : 'outline'}>{s.role}</Chip>
                  <span className="text-micro text-muted">MFA on · passkey</span>
                </li>
              ))}
            </ul>
          </Panel>
        </TabsContent>

        <TabsContent value="templates">
          <DataTable
            caption="Templates"
            rows={TEMPLATES}
            getId={(t) => t.name}
            columns={[
              { key: 'name', header: 'Template', cell: (t) => <span className="font-medium">{t.name}</span> },
              { key: 'kind', header: 'Type', cell: (t) => t.kind },
              { key: 'v', header: 'Version', cell: (t) => <span className="font-mono text-micro">{t.version}</span> },
              { key: 's', header: 'Status', cell: (t) => <Chip tone={t.status === 'Published' ? 'verified' : t.status === 'In review' ? 'disputed' : 'review'}>{t.status}</Chip> },
              { key: 'u', header: 'Updated', cell: (t) => fmtDate(t.updated), hideBelow: 'lg' },
              { key: 'a', header: '', align: 'right', cell: (t) => (t.status === 'Published' ? <Button size="xs" variant="ghost" icon={<RotateCcw />} onClick={() => toast(`Rolled back ${t.name} to previous version (logged)`)}>Rollback</Button> : null) },
            ]}
            mobileCard={(t) => (
              <div>
                <p className="font-medium">{t.name}</p>
                <p className="text-micro text-muted">
                  {t.kind} · {t.version} · {t.status}
                </p>
              </div>
            )}
          />
        </TabsContent>

        <TabsContent value="integrations">
          <DataTable
            caption="Integrations"
            rows={integrations}
            getId={(i) => i.name}
            columns={[
              { key: 'n', header: 'Integration', cell: (i) => <div><p className="font-medium">{i.name}</p><p className="text-micro text-muted">{i.vendor}</p></div> },
              { key: 'h', header: 'Health', cell: (i) => <Chip tone={i.health === 'ok' ? 'verified' : 'review'} icon={i.health === 'ok' ? <CircleCheck /> : <TriangleAlert />}>{i.health === 'ok' ? 'Healthy' : 'Degraded'}</Chip> },
              { key: 'c', header: 'Cost per call', cell: (i) => i.costPerCall },
              { key: 'l', header: 'Rate limit', cell: (i) => i.limit, hideBelow: 'lg' },
              { key: 'u', header: 'Calls (30 d)', align: 'right', cell: (i) => i.calls30d.toLocaleString() },
              { key: 'k', header: 'Credentials', cell: () => <span className="inline-flex items-center gap-1 text-micro text-muted"><KeyRound className="size-3.5" /> In secrets manager</span>, hideBelow: 'xl' },
            ]}
            mobileCard={(i) => (
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{i.name}</p>
                  <p className="text-micro text-muted">
                    {i.costPerCall} · {i.calls30d.toLocaleString()} calls
                  </p>
                </div>
                <Chip tone={i.health === 'ok' ? 'verified' : 'review'}>{i.health === 'ok' ? 'Healthy' : 'Degraded'}</Chip>
              </div>
            )}
          />
        </TabsContent>

        <TabsContent value="flags" className="space-y-3">
          {/* The posture switch */}
          <section className={`rounded-lg border-2 p-4 shadow-e1 ${libraryOn ? 'border-review-border bg-review-fill/50' : 'border-line bg-surface'}`}>
            <div className="flex flex-wrap items-start gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary-tint text-primary">
                <LibraryBig className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-h3 font-semibold">Verified library</p>
                  <Chip tone={libraryOn ? 'review' : 'solid'}>{libraryOn ? 'Hybrid mode: on' : 'Gatekeeper mode: off'}</Chip>
                </div>
                <p className="mt-1 text-meta text-muted">Lets qualified investors search released passports at L1 (facts only). Needs two approvers and counsel's written approval attached (M15-1, M28-3).</p>
              </div>
              {libraryOn ? (
                <Button variant="danger" icon={<Power />} onClick={() => (setLibraryOn(false), setApprovals([]), setCounselDoc(false), toast('Kill switch: library hidden for everyone within one minute'))}>
                  Kill switch
                </Button>
              ) : (
                <Button icon={<Flag />} onClick={() => setLibOpen(true)}>
                  Request to switch on
                </Button>
              )}
            </div>
          </section>

          <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-e1">
            {flags
              .filter((f) => !f.special)
              .map((f) => (
                <div key={f.key} className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-meta font-medium">{f.name}</p>
                    <p className="text-micro text-muted">{f.description}</p>
                  </div>
                  <Switch
                    checked={f.on}
                    disabled={f.key === 'broker_dealer_route'}
                    onCheckedChange={(v) => {
                      setFlags((all) => all.map((x) => (x.key === f.key ? { ...x, on: v } : x)))
                      toast(`${f.name} ${v ? 'on' : 'off'} (draft → review → publish, logged)`)
                    }}
                  />
                </div>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      <Sheet
        open={libOpen}
        onOpenChange={setLibOpen}
        title="Switch on the verified library"
        description="Hybrid mode: investors can also search released passports"
        size="md"
        footer={
          <Button
            block
            icon={<Power />}
            disabled={!ready}
            onClick={() => {
              setLibraryOn(true)
              setLibOpen(false)
              toast.success('Library switched on. Library appears in the Investor Portal navigation.')
            }}
          >
            Switch on
          </Button>
        }
      >
        <div className="space-y-4">
          <Banner tone="warning" icon={<ShieldAlert />} title="What investors will see">
            Qualified investors can search and map released passports at L1: commodity, region, stage, licence status, tier, verification status by workstream and flag counts. Never capital sought, terms or valuation; owners stay anonymous unless they opted in. "Request an introduction" goes to SSD's queue.
          </Banner>
          <section>
            <p className="mb-2 text-meta font-semibold">Approvals ({approvals.length} of 2)</p>
            <ul className="space-y-1.5">
              {approvals.map((a) => (
                <li key={a} className="flex items-center gap-2 text-meta">
                  <CircleCheck className="size-4 text-verified" aria-hidden />
                  <Avatar id={a} size={20} /> {person(a).name}
                </li>
              ))}
            </ul>
            <Button size="sm" variant="secondary" className="mt-2" disabled={approvals.length >= 2} onClick={approve}>
              Approve as {person(persona).name}
            </Button>
            <p className="mt-1 text-micro text-muted">Needs compliance and admin together. Switch “Act as” to give the second approval.</p>
          </section>
          <section>
            <p className="mb-2 text-meta font-semibold">Counsel's written approval</p>
            {counselDoc ? (
              <p className="flex items-center gap-2 text-meta">
                <FileCheck2 className="size-4 text-verified" aria-hidden /> Hale Rowan LLP · Library content policy approval · 24 Sep 2026.pdf
              </p>
            ) : (
              <Button size="sm" variant="secondary" icon={<FileUp />} onClick={() => setCounselDoc(true)}>
                Attach approval document
              </Button>
            )}
          </section>
        </div>
      </Sheet>
    </Page>
  )
}
