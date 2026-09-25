import { CircleCheck, Mic, Plus, ShieldCheck, Star, UserRoundCheck, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { cn } from '@/lib/cn'
import { useDemoState } from '@/lib/demo-states'
import { fmtDate, NOW } from '@/lib/format'
import { useDemo } from '@/lib/store'
import { asset, dealRooms, INTRO_STATUS_LABEL, introductions, INVESTOR_STATUS_LABEL, investors, person, type Investor } from '@/data'
import { EmptyState, Panel, RuleGateBanner } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Avatar, Button, ButtonLink, Chip, DataTable, Field, Input, RadioGroup, Select, Sheet, Tabs, TabsContent, TabsList, TabsTrigger, Textarea, toast } from '@/ds/ui'

const statusTone = { invited: 'neutral', in_qualification: 'review', qualified: 'verified', on_hold: 'disputed', declined: 'critical' } as const

/** Investors list */
export default function InvestorsList() {
  const navigate = useNavigate()
  return (
    <Page title="Investors" large asOf actions={<Button icon={<Plus />} onClick={() => toast('Invitation form: single-use link, expires in 7 days (demo)')}>Invite investor</Button>}>
      <DataTable
        caption="Investors"
        rows={investors}
        getId={(i) => i.id}
        onRowClick={(i) => navigate(i.status === 'in_qualification' ? `/command/investors/${i.id}/qualification` : `/command/investors/${i.id}`, { viewTransition: true })}
        columns={[
          { key: 'name', header: 'Investor', sortValue: (i) => i.name, cell: (i) => <div><p className="font-medium">{i.name}</p><p className="text-micro text-muted">{i.type}</p></div> },
          { key: 'contact', header: 'Contact', cell: (i) => person(i.contactId).name, hideBelow: 'lg' },
          { key: 'status', header: 'Status', cell: (i) => <Chip tone={statusTone[i.status]}>{INVESTOR_STATUS_LABEL[i.status]}</Chip> },
          { key: 'since', header: 'Qualified', cell: (i) => (i.qualifiedOn ? fmtDate(i.qualifiedOn) : '—') },
          { key: 'first', header: 'First review', cell: (i) => (i.reviews[0] ? fmtDate(i.reviews[0].date) : '—'), hideBelow: 'xl' },
          { key: 'mandate', header: 'Mandate', cell: (i) => <span className="text-muted">{i.mandate.commodities.join(', ')}</span>, hideBelow: 'lg' },
          { key: 'ticket', header: 'Ticket', align: 'right', cell: (i) => `USD ${i.mandate.ticket[0]}–${i.mandate.ticket[1]}m` },
          { key: 'risk', header: 'Risk', cell: (i) => (i.risk === 'high' ? <Chip tone="critical">High</Chip> : <Chip>Standard</Chip>) },
          { key: 'owner', header: 'Relationship', cell: (i) => <Avatar id={i.relationshipOwnerId} size={24} />, align: 'center' },
        ]}
        mobileCard={(i) => (
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold">{i.name}</p>
              <Chip tone={statusTone[i.status]}>{INVESTOR_STATUS_LABEL[i.status]}</Chip>
            </div>
            <p className="text-micro text-muted">
              {person(i.contactId).name} · {i.mandate.commodities.join(', ')} · USD {i.mandate.ticket[0]}–{i.mandate.ticket[1]}m
            </p>
          </div>
        )}
      />
    </Page>
  )
}

function useInvestor(): Investor {
  const { id = 'cedar-peak' } = useParams()
  return investors.find((i) => i.id === id) ?? investors[0]
}

const WS_STATES = [
  { id: 'default', label: 'Default' },
  { id: 'reviews', label: 'Relationship reviews tab' },
  { id: 'mandate', label: 'Mandate tab' },
] as const

/** CC-12 · Investor workspace */
export function InvestorWorkspace() {
  const inv = useInvestor()
  const [state] = useDemoState('CC-12', WS_STATES)
  const [tab, setTab] = useState('profile')
  const [logOpen, setLogOpen] = useState(false)
  const [reviews, setReviews] = useState(inv.reviews)
  useEffect(() => setTab(state === 'reviews' ? 'reviews' : state === 'mandate' ? 'mandate' : 'profile'), [state])
  useEffect(() => setReviews(inv.reviews), [inv])
  const intros = introductions.filter((i) => i.investorId === inv.id)
  const rooms = dealRooms.filter((r) => r.investorId === inv.id)

  return (
    <Page
      title={inv.name}
      back="/command/investors"
      breadcrumbs={[{ label: 'Investors', to: '/command/investors' }, { label: inv.name }]}
      subtitle={
        <span className="flex flex-wrap items-center gap-2">
          <Chip tone={statusTone[inv.status]} icon={inv.status === 'qualified' ? <UserRoundCheck /> : undefined}>
            {INVESTOR_STATUS_LABEL[inv.status]}
            {inv.qualifiedOn && ` since ${fmtDate(inv.qualifiedOn)}`}
          </Chip>
          <span className="inline-flex items-center gap-1.5">
            <Avatar id={inv.relationshipOwnerId} size={18} /> Relationship owner {person(inv.relationshipOwnerId).name}
          </span>
        </span>
      }
      actions={
        <>
          <Button variant="secondary" icon={<Mic />} onClick={() => setLogOpen(true)}>
            Log review
          </Button>
          <ButtonLink to={`/command/investors/${inv.id}/qualification`} variant="secondary" icon={<ShieldCheck />}>
            Qualification
          </ButtonLink>
        </>
      }
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="-mx-4 mb-4 px-4 md:mx-0 md:px-0">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="kyc">KYC and screening</TabsTrigger>
          <TabsTrigger value="reviews" count={reviews.length}>
            Relationship reviews
          </TabsTrigger>
          <TabsTrigger value="mandate">Mandate</TabsTrigger>
          <TabsTrigger value="intros" count={intros.length}>
            Introductions
          </TabsTrigger>
          <TabsTrigger value="rooms" count={rooms.length}>
            Deal rooms
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="grid gap-4 lg:grid-cols-2">
          <Panel title="Organisation">
            <dl className="grid grid-cols-2 gap-3 text-meta">
              <Kv k="Type" v={inv.type} />
              <Kv k="City" v={inv.city} />
              <Kv k="Accreditation basis" v="Entity: total assets over USD 5 million" />
              <Kv k="Risk rating" v={inv.risk === 'high' ? 'High' : 'Standard'} />
            </dl>
          </Panel>
          <Panel title="Team">
            <ul className="space-y-2">
              {[inv.contactId, ...(inv.id === 'cedar-peak' ? ['priya', 'tom'] : [])].map((p) => (
                <li key={p} className="flex items-center gap-3">
                  <Avatar id={p} size={32} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-meta font-medium">{person(p).name}</span>
                    <span className="block text-micro text-muted">{p === 'tom' ? 'Adviser (guest) · expires 16 Dec 2026' : person(p).role}</span>
                  </span>
                  {p === inv.contactId && <Chip tone="primary">Admin</Chip>}
                </li>
              ))}
            </ul>
          </Panel>
        </TabsContent>

        <TabsContent value="kyc" className="grid gap-4 lg:grid-cols-2">
          <Panel title="Identity and company">
            <ul className="space-y-2 text-meta">
              {['Company registry: Delaware LP, good standing', 'Beneficial owners: 2 natural persons over 25% (general partner)', `Signatory identity: ${person(inv.contactId).name}, passport and liveness`].map((x) => (
                <li key={x} className="flex gap-2">
                  <CircleCheck className="mt-0.5 size-4 shrink-0 text-verified" aria-hidden />
                  {x}
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Screening" subtitle="Re-screened daily">
            <p className="flex items-center gap-2 text-meta">
              <CircleCheck className="size-4 text-verified" aria-hidden /> US, UN, EU, UK sanctions · PEP · adverse media: 0 hits
            </p>
            <p className="mt-2 text-micro text-muted">Last run {fmtDate(NOW)} 06:00 EAT</p>
          </Panel>
        </TabsContent>

        <TabsContent value="reviews">
          <Panel title="Relationship reviews" subtitle="R01 checks that the first review predates any teaser" action={<Button size="sm" variant="tint" icon={<Plus />} onClick={() => setLogOpen(true)}>Log review</Button>}>
            <ol className="space-y-3">
              {reviews.map((r, i) => (
                <li key={i} className={cn('rounded-lg border p-4', i === 0 ? 'border-primary bg-primary-tint/50' : 'border-line')}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-meta font-semibold">{fmtDate(r.date)}</span>
                    {i === 0 && (
                      <Chip tone="primary" icon={<Star />}>
                        First review · R01 anchor
                      </Chip>
                    )}
                    <Chip tone="outline">{r.channel}</Chip>
                    <span className="ml-auto inline-flex items-center gap-1.5 text-micro text-muted">
                      <Avatar id={r.whoId} size={18} /> {person(r.whoId).name} with {r.with}
                    </span>
                  </div>
                  <p className="mt-2 text-meta">
                    <span className="font-medium">Topics: </span>
                    {r.topics}
                  </p>
                  <p className="mt-1 text-meta text-muted">
                    <span className="font-medium text-fg">Assessment: </span>
                    {r.assessment}
                  </p>
                </li>
              ))}
            </ol>
          </Panel>
        </TabsContent>

        <TabsContent value="mandate">
          <Panel title="Investment mandate" subtitle="Used by SSD to decide which released passports to show; never shared with owners">
            <dl className="grid gap-4 md:grid-cols-2">
              <ChipList k="Commodities" v={inv.mandate.commodities} />
              <ChipList k="Countries" v={inv.mandate.countries} />
              <ChipList k="Stages" v={inv.mandate.stages} />
              <ChipList k="Licence types" v={inv.mandate.licenceTypes} />
              <Kv k="Ticket size" v={`USD ${inv.mandate.ticket[0]}–${inv.mandate.ticket[1]} million`} />
              <ChipList k="Structures" v={inv.mandate.structures} />
              <ChipList k="ESG limits" v={inv.mandate.esg.length ? inv.mandate.esg : ['None stated']} />
              {inv.mandate.specs && <ChipList k="Product specifications" v={inv.mandate.specs} />}
            </dl>
          </Panel>
        </TabsContent>

        <TabsContent value="intros">
          {intros.length ? (
            <ul className="space-y-2">
              {intros.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface p-3.5 shadow-e1">
                  <span className="font-mono text-micro text-muted">{asset(i.assetId).code}</span>
                  <span className="flex-1 text-meta font-medium">{asset(i.assetId).name}</span>
                  <Chip tone={i.status === 'not_now' || i.status === 'expired' ? 'neutral' : 'primary'}>{INTRO_STATUS_LABEL[i.status]}</Chip>
                  <span className="text-micro text-muted">Teaser {i.teaserSentOn ? fmtDate(i.teaserSentOn) : '—'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No introductions yet" compact />
          )}
        </TabsContent>

        <TabsContent value="rooms">
          {rooms.length ? (
            <ul className="grid gap-2 md:grid-cols-2">
              {rooms.map((r) => (
                <li key={r.id}>
                  <Link to="/command/deals" viewTransition className="block rounded-lg border border-line bg-surface p-4 shadow-e1 hover:shadow-e2">
                    <p className="text-meta font-semibold">{asset(r.assetId).name}</p>
                    <p className="text-micro text-muted">
                      NDA {fmtDate(r.ndaOn)} · expires {fmtDate(r.expires)} · {r.openQuestions} open questions
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No deal rooms" compact />
          )}
        </TabsContent>

        <TabsContent value="activity">
          <Panel title="Activity">
            <ul className="space-y-2 text-meta">
              <li>22 Sep · Marcus Bell viewed 14 documents in KE-GR-07</li>
              <li>18 Sep · Relationship review logged by James Whitfield</li>
              <li>16 Sep · NDA signed for KE-GR-07</li>
              <li>3 Sep · Qualified by Sarah Mitchell</li>
            </ul>
          </Panel>
        </TabsContent>
      </Tabs>

      <LogReviewSheet
        open={logOpen}
        onOpenChange={setLogOpen}
        onSave={(r) => {
          setReviews((x) => [...x, r])
          setTab('reviews')
          toast.success('Relationship review logged')
        }}
      />
    </Page>
  )
}

function Kv({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div>
      <dt className="text-micro text-muted">{k}</dt>
      <dd className="mt-0.5 font-medium">{v}</dd>
    </div>
  )
}
function ChipList({ k, v }: { k: string; v: string[] }) {
  return (
    <div>
      <dt className="text-micro text-muted">{k}</dt>
      <dd className="mt-1 flex flex-wrap gap-1.5">
        {v.map((x) => (
          <Chip key={x} tone="outline">
            {x}
          </Chip>
        ))}
      </dd>
    </div>
  )
}

function LogReviewSheet({ open, onOpenChange, onSave }: { open: boolean; onOpenChange: (v: boolean) => void; onSave: (r: Investor['reviews'][number]) => void }) {
  const persona = useDemo((s) => s.commandPersona)
  const [recording, setRecording] = useState(false)
  const [channel, setChannel] = useState('Phone')
  const [topics, setTopics] = useState('')
  const [assessment, setAssessment] = useState('')
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Log a relationship review"
      description="Who, when, how, and what you learned. Required before qualification; dated before any teaser."
      footer={
        <Button
          block
          disabled={!topics || !assessment}
          onClick={() => {
            onSave({ date: '2026-09-24', channel, whoId: persona, with: 'Marcus Bell', topics, assessment })
            onOpenChange(false)
            setTopics('')
            setAssessment('')
          }}
        >
          Save review
        </Button>
      }
    >
      <div className="space-y-4">
        <Button
          variant={recording ? 'danger' : 'secondary'}
          block
          icon={<Mic />}
          onClick={() => {
            if (recording) {
              setRecording(false)
              setTopics('Graphite pipeline in Kenya; appetite for a second asset; timing of the investment committee')
              setAssessment('Engaged and informed; prefers raw data; no change in circumstances.')
              toast('Voice note transcribed. Edit before saving.')
            } else setRecording(true)
          }}
        >
          {recording ? 'Stop and transcribe (0:42)' : 'Record a voice note'}
        </Button>
        <Field label="Channel">
          {(p) => (
            <Select {...p} value={channel} onChange={(e) => setChannel(e.target.value)}>
              {['Phone', 'Video call', 'In person', 'Conference'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Date">{(p) => <Input {...p} type="date" defaultValue="2026-09-24" />}</Field>
        <Field label="Topics">{(p) => <Textarea {...p} value={topics} onChange={(e) => setTopics(e.target.value)} rows={2} />}</Field>
        <Field label="Assessment of sophistication and circumstances">{(p) => <Textarea {...p} value={assessment} onChange={(e) => setAssessment(e.target.value)} rows={3} />}</Field>
      </div>
    </Sheet>
  )
}

const QUAL_STATES = [
  { id: 'default', label: 'High-risk: two approvals' },
  { id: 'first', label: 'First approval recorded' },
] as const

/** CC-13 · Qualification review */
export function QualificationReview() {
  const inv = useInvestor()
  const navigate = useNavigate()
  const [state] = useDemoState('CC-13', QUAL_STATES)
  const persona = useDemo((s) => s.commandPersona)
  const [decision, setDecision] = useState<'approve' | 'hold' | 'decline'>('approve')
  const [reason, setReason] = useState('')
  const [approvals, setApprovals] = useState<string[]>([])
  useEffect(() => setApprovals(state === 'first' ? ['james'] : []), [state])
  const highRisk = inv.risk === 'high'
  const needed = highRisk ? 2 : 1
  const already = approvals.includes(persona)

  const answers = [
    ['Investor type', inv.type],
    ['Jurisdiction', 'United States (Illinois); feeder fund in the Cayman Islands'],
    ['Experience', '6 private resource deals since 2019; 2 in Africa'],
    ['Accreditation basis', 'Entity with total assets over USD 5 million'],
    ['506(c) representations', 'Minimum investment of USD 1 million or more; no third-party financing of the commitment'],
    ['Intended exemption', 'Issuers decide; SSD records only'],
  ]

  return (
    <Page title={`Qualification · ${inv.name}`} shortTitle="Qualification" back={`/command/investors/${inv.id}`} breadcrumbs={[{ label: 'Investors', to: '/command/investors' }, { label: inv.name, to: `/command/investors/${inv.id}` }, { label: 'Qualification' }]}>
      {highRisk && (
        <RuleGateBanner
          className="mb-4"
          level="hard_stop"
          rule="R10 High-risk party"
          reason={`A limited partner of the feeder fund is a politically exposed person. Approval needs two people; ${approvals.length} of 2 recorded.`}
          triggering="Screening hit dispositioned 19 Sep 2026 · risk rating High"
        />
      )}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <Panel title="Questionnaire" subtitle="Version 3 · answers locked on submission (12 Sep 2026)">
            <dl className="divide-y divide-line">
              {answers.map(([k, v]) => (
                <div key={k} className="grid gap-1 py-2.5 md:grid-cols-[200px_1fr]">
                  <dt className="text-micro text-muted">{k}</dt>
                  <dd className="text-meta">{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>
          <Panel title="Screening">
            <ul className="space-y-2 text-meta">
              <li className="flex gap-2">
                <CircleCheck className="mt-0.5 size-4 text-verified" aria-hidden /> Sanctions (US, UN, EU, UK): no hits
              </li>
              <li className="flex gap-2">
                <Users className="mt-0.5 size-4 text-review" aria-hidden /> PEP: 1 limited partner is a former deputy minister (Country X). Dispositioned: relevant, high risk.
              </li>
              <li className="flex gap-2">
                <CircleCheck className="mt-0.5 size-4 text-verified" aria-hidden /> Adverse media: 2 items, both unrelated (name match)
              </li>
            </ul>
          </Panel>
          <Panel title="Relationship record">
            {inv.reviews.map((r, i) => (
              <p key={i} className="text-meta">
                <span className="font-semibold">{fmtDate(r.date)}</span> · {r.channel} · {person(r.whoId).name} with {r.with}: {r.assessment}
              </p>
            ))}
          </Panel>
        </div>
        <div className="space-y-4">
          <Panel title="Decision">
            <RadioGroup
              name="qual"
              value={decision}
              onValueChange={setDecision}
              variant="cards"
              options={[
                { value: 'approve', label: 'Approve' },
                { value: 'hold', label: 'Hold', description: 'Ask for more information; investor sees a neutral message' },
                { value: 'decline', label: 'Decline' },
              ]}
            />
            <Textarea className="mt-3" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (internal, required)" aria-label="Reason" />
            <div className="mt-3 flex items-center gap-2 text-micro text-muted">
              Approvals {approvals.length}/{needed}:
              {approvals.map((a) => (
                <span key={a} className="inline-flex items-center gap-1">
                  <Avatar id={a} size={18} /> {person(a).name}
                </span>
              ))}
            </div>
            <Button
              block
              className="mt-3"
              disabled={!reason || already}
              onClick={() => {
                const next = [...approvals, persona]
                setApprovals(next)
                if (decision !== 'approve' || next.length >= needed) {
                  toast.success(decision === 'approve' ? `${inv.name} qualified` : decision === 'hold' ? 'Placed on hold' : 'Declined')
                  navigate(`/command/investors/${inv.id}`, { viewTransition: true })
                } else toast(`First approval recorded. A second approver is required (R10).`)
              }}
            >
              {already ? 'You already approved; a different person must approve' : decision === 'approve' ? `Record approval (${approvals.length + 1} of ${needed})` : decision === 'hold' ? 'Place on hold' : 'Decline'}
            </Button>
          </Panel>
          <Panel title="Investor sees" subtitle="Never shows internal notes">
            <p className="rounded-sm bg-sunken/70 p-3 text-meta">
              {decision === 'approve'
                ? `Your organisation is now qualified with SSD. James Whitfield will be in touch about opportunities that match your mandate.`
                : decision === 'hold'
                  ? 'We need a little more information to complete your qualification. James Whitfield will contact you this week.'
                  : 'Thank you for your interest. We are not able to proceed with your qualification at this time. James Whitfield can answer any questions.'}
            </p>
          </Panel>
        </div>
      </div>
    </Page>
  )
}
