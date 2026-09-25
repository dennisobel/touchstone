import { ArrowLeft, Download, Eye, Plus, Search, Send, Star } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import {
  AuditRow,
  Banner,
  CaptureFrame,
  ClaimRow,
  ConsentCapture,
  DisclosureLock,
  DocumentViewer,
  EmptyState,
  EvidenceBadge,
  EvidenceChip,
  EvidenceViewerProvider,
  ExplainThis,
  FlagCounts,
  FreshnessMeter,
  MapPanel,
  PassportHeader,
  QueueRow,
  RedFlagCard,
  RuleGateBanner,
  StatusStamp,
  StatusTimeline,
  SyncIndicator,
  TeaserCard,
  TierBadge,
  VerificationStamp,
  WorkstreamCard,
} from '@/ds/components'
import { AssayFlaskIcon, BeaconIcon, DrillCoreIcon, Logo, SatelliteIcon, SeverityShape, StampIcon } from '@/ds/icons'
import { ShellProvider, ThemeSwitch } from '@/ds/shell'
import { Button, Card, Checkbox, Chip, Field, IconButton, Input, Progress, RadioGroup, Segmented, Select, Skeleton, Stepper, Switch, Textarea, toast } from '@/ds/ui'
import { asset, auditEvents, claim, doc, flags, plans, tasks, WORKSTREAMS, type Claim, type ClaimStatus, type EvidenceLevel } from '@/data'
import { useDocumentTitle } from '@/lib/hooks'
import { cn } from '@/lib/cn'

const SECTIONS = [
  ['foundations', 'Foundations'],
  ['primitives', 'Primitives'],
  ['stamp', 'Verification Stamp'],
  ['levels', 'Evidence levels'],
  ['claim', 'Claim Row'],
  ['chip', 'Evidence Chip'],
  ['passport', 'Passport Header'],
  ['workstream', 'Workstream Card'],
  ['flags', 'Red-Flag Card'],
  ['locks', 'Disclosure Lock'],
  ['gates', 'Rule-Gate Banner'],
  ['map', 'Map Panel'],
  ['viewer', 'Document Viewer'],
  ['capture', 'Capture Frame'],
  ['timeline', 'Status Timeline'],
  ['queue', 'Queue Row'],
  ['freshness', 'Freshness Meter'],
  ['sync', 'Sync Indicator'],
  ['explain', 'Explain-This'],
  ['consent', 'Consent Capture'],
  ['teaser', 'Teaser Card'],
  ['audit', 'Audit Row'],
  ['empty', 'Empty State'],
] as const

function Section({ id, title, note, children }: { id: string; title: string; note?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-b border-line py-10 first:pt-2">
      <h2 className="text-h2 font-semibold">{title}</h2>
      {note && <p className="mt-1 max-w-3xl text-meta text-muted">{note}</p>}
      <div className="mt-5">{children}</div>
    </section>
  )
}

function Label({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-micro font-semibold uppercase tracking-wide text-muted">{children}</p>
}

const swatches = [
  ['canvas', 'bg-canvas'],
  ['surface', 'bg-surface'],
  ['surface-raised', 'bg-raised'],
  ['border', 'bg-line'],
  ['border-strong', 'bg-line-strong'],
  ['text', 'bg-fg'],
  ['text-muted', 'bg-muted'],
  ['primary (lapis)', 'bg-primary'],
  ['primary-hover', 'bg-primary-hover'],
  ['primary-tint', 'bg-primary-tint'],
  ['brand (laterite)', 'bg-brand'],
]

const STATUSES: ClaimStatus[] = ['declared', 'in_review', 'verified', 'discrepancy', 'disputed', 'unverifiable', 'stale']

function claimWithStatus(s: ClaimStatus): Claim {
  const base: Record<ClaimStatus, string> = {
    verified: 'kb-t1',
    in_review: 'kb-g1',
    discrepancy: 'kb-g3',
    disputed: 'kb-x4',
    stale: 'kb-l4',
    unverifiable: 'kb-t7',
    declared: 'kb-t6',
  }
  const c = claim(base[s])!
  return s === 'unverifiable' ? { ...c, status: 'unverifiable', method: 'No source reachable: cadastre offline and no receipts supplied' } : c
}

export default function Gallery() {
  useDocumentTitle('Component gallery')
  const [density, setDensity] = useState<'compact' | 'comfortable' | 'touch'>('comfortable')
  const [expanded, setExpanded] = useState(true)
  const [consent, setConsent] = useState(false)
  const [consentAudio, setConsentAudio] = useState(false)
  const [radio, setRadio] = useState('anonymous')
  const [seg, setSeg] = useState('live')
  const [sw, setSw] = useState(true)
  const [cb, setCb] = useState(true)
  const A = asset('kiboko')

  return (
    <ShellProvider app="command" hasTabBar={false}>
      <EvidenceViewerProvider viewer={{ name: 'Kevin Omondi', org: 'SSD', email: 'kevin.omondi@ssd.example' }} editable>
        <div className="min-h-dvh bg-canvas">
          <header className="glass z-30 border-b border-line/70 pt-safe md:sticky md:top-0">
            <div className="mx-auto flex min-h-16 max-w-[1400px] flex-wrap items-center gap-3 px-4 py-2 md:px-8">
              <Link to="/apps" className="rounded-full p-2 hover:bg-sunken" aria-label="All apps">
                <ArrowLeft className="size-5" />
              </Link>
              <Logo size={28} />
              <div className="min-w-0 flex-1">
                <h1 className="text-meta font-semibold leading-tight">Component gallery</h1>
                <p className="text-[11px] leading-tight text-muted">Touchstone design system · shared by all apps</p>
              </div>
              <Segmented
                ariaLabel="Density"
                value={density}
                onChange={setDensity}
                size="sm"
                options={[
                  { value: 'compact', label: 'Compact' },
                  { value: 'comfortable', label: 'Comfortable' },
                  { value: 'touch', label: 'Touch' },
                ]}
              />
              <ThemeSwitch />
            </div>
            <nav className="no-scrollbar mx-auto hidden max-w-[1400px] gap-1.5 overflow-x-auto px-4 pb-2 md:flex lg:hidden" aria-label="Sections">
              {SECTIONS.map(([id, label]) => (
                <a key={id} href={`#${id}`} className="shrink-0 rounded-full border border-line bg-surface px-3 py-1.5 text-micro font-medium text-muted">
                  {label}
                </a>
              ))}
            </nav>
          </header>

          <nav className="glass no-scrollbar sticky top-0 z-30 flex gap-1.5 overflow-x-auto border-b border-line/70 px-4 py-2 pt-[calc(8px+var(--safe-top))] md:hidden" aria-label="Sections">
            {SECTIONS.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="shrink-0 rounded-full border border-line bg-surface px-3 py-1.5 text-micro font-medium text-muted">
                {label}
              </a>
            ))}
          </nav>

          <div className="mx-auto flex max-w-[1400px] gap-10 px-4 md:px-8">
            <nav className="sticky top-20 hidden h-[calc(100dvh-96px)] w-52 shrink-0 overflow-y-auto py-6 lg:block" aria-label="Sections">
              <ul className="space-y-0.5">
                {SECTIONS.map(([id, label]) => (
                  <li key={id}>
                    <a href={`#${id}`} className="block rounded-sm px-2.5 py-1.5 text-meta text-muted hover:bg-sunken hover:text-fg">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <main data-density={density} className="min-w-0 flex-1 pb-24 text-body">
              <Section id="foundations" title="Foundations" note="Calm assay office: graphite neutrals, lapis action colour, laterite brand accent. Status always pairs colour with an icon and a word.">
                <div className="grid gap-6 xl:grid-cols-2">
                  <div>
                    <Label>Colour tokens</Label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {swatches.map(([name, cls]) => (
                        <div key={name} className="flex items-center gap-2.5 rounded-lg border border-line bg-surface p-2">
                          <span className={cn('size-9 shrink-0 rounded-sm border border-line', cls)} />
                          <span className="text-micro font-medium">{name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Status tokens</Label>
                    <div className="flex flex-wrap gap-2">
                      {STATUSES.map((s) => (
                        <StatusStamp key={s} status={s} size="lg" />
                      ))}
                    </div>
                    <Label>
                      <span className="mt-5 block">Red-flag severity (shape + colour + word)</span>
                    </Label>
                    <div className="flex flex-wrap items-center gap-4">
                      {(['critical', 'high', 'medium', 'low'] as const).map((s) => (
                        <span key={s} className="inline-flex items-center gap-1.5 text-meta capitalize">
                          <SeverityShape severity={s} size={18} /> {s}
                        </span>
                      ))}
                    </div>
                    <Label>
                      <span className="mt-5 block">Chart series (fixed order, never status colours)</span>
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <span key={n} className="flex h-8 w-12 items-end justify-center rounded-sm pb-0.5 text-[10px] font-semibold text-white" style={{ background: `var(--chart-${n})` }}>
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Typography</Label>
                    <div className="space-y-2 rounded-lg border border-line bg-surface p-4">
                      <p className="font-serif text-passport font-semibold">Kiboko Ridge Graphite</p>
                      <p className="text-h1 font-semibold">Heading 1 · Inter 24/32</p>
                      <p className="text-h2 font-semibold">Heading 2 · Inter 20/28</p>
                      <p className="text-h3 font-semibold">Heading 3 · Inter 16/24</p>
                      <p className="text-body">Body follows density: 14/20 compact, 16/24 comfortable, 17/26 touch.</p>
                      <p className="text-meta text-muted">Meta 12–13 · As of 24 Sep 2026, 09:30 EAT</p>
                      <p className="font-mono text-[13px]">PL/2024/0117 · −3.45612, 38.44803 · 9f3a2c1b…e41d07</p>
                      <p className="tabular-nums text-meta">Tabular figures: 12.4 Mt · 8.1% · KES 12,500 · USD 1,200</p>
                    </div>
                  </div>
                  <div>
                    <Label>Custom icons and brand</Label>
                    <div className="flex flex-wrap items-center gap-5 rounded-lg border border-line bg-surface p-4 text-fg">
                      <Logo size={40} />
                      {[
                        [BeaconIcon, 'Beacon'],
                        [DrillCoreIcon, 'Drill core'],
                        [AssayFlaskIcon, 'Assay flask'],
                        [StampIcon, 'Stamp'],
                        [SatelliteIcon, 'Satellite'],
                      ].map(([I, n]) => {
                        const Icon = I as typeof BeaconIcon
                        return (
                          <span key={n as string} className="flex flex-col items-center gap-1 text-micro text-muted">
                            <Icon className="size-7 text-fg" />
                            {n as string}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </Section>

              <Section id="primitives" title="Primitives" note="Buttons, fields and controls. Tab through to see the 2 px lapis focus ring.">
                <div className="grid gap-6 xl:grid-cols-2">
                  <Card className="space-y-4 p-4">
                    <Label>Buttons</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button icon={<Send />}>Express interest</Button>
                      <Button variant="secondary">Not now</Button>
                      <Button variant="tint" icon={<Plus />}>
                        Add licence
                      </Button>
                      <Button variant="ghost">Ask a question</Button>
                      <Button variant="danger">Revoke all access</Button>
                      <Button loading>Sending</Button>
                      <Button disabled>Release</Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="xs">Extra small</Button>
                      <Button size="sm">Small</Button>
                      <Button size="md">Medium</Button>
                      <Button size="lg">Large</Button>
                      <IconButton label="Search" variant="outline">
                        <Search />
                      </IconButton>
                      <IconButton label="Follow" variant="tint">
                        <Star />
                      </IconButton>
                      <IconButton label="Download" variant="primary">
                        <Download />
                      </IconButton>
                    </div>
                    <Segmented
                      ariaLabel="Example"
                      value={seg}
                      onChange={setSeg}
                      options={[
                        { value: 'live', label: 'Live', count: 3 },
                        { value: 'teasers', label: 'Teasers' },
                        { value: 'rooms', label: 'Deal rooms' },
                      ]}
                    />
                    <Stepper steps={['Licence', 'Documents', 'Declarations']} current={1} />
                    <Progress value={62} label="Upload progress" />
                    <div className="flex flex-wrap gap-2">
                      <Chip>Neutral</Chip>
                      <Chip tone="primary">Primary</Chip>
                      <Chip tone="verified">Verified</Chip>
                      <Chip tone="review">Due today</Chip>
                      <Chip tone="critical">Overdue 2 d</Chip>
                      <Chip tone="brand">Prototype</Chip>
                      <TierBadge tier="desk" />
                      <TierBadge tier="standard" />
                      <TierBadge tier="investor_ready" />
                    </div>
                  </Card>
                  <Card className="space-y-4 p-4">
                    <Label>Fields</Label>
                    <Field label="Licence number" hint="For example PL/2024/0117">
                      {(p) => <Input {...p} defaultValue="PL/2024/0117" className="font-mono" />}
                    </Field>
                    <Field label="Phone number" error="Enter a Kenyan number with 9 digits after +254">
                      {(p) => <Input {...p} defaultValue="+254 71 2" />}
                    </Field>
                    <Field label="Commodity">
                      {(p) => (
                        <Select {...p}>
                          <option>Graphite</option>
                          <option>Gold</option>
                        </Select>
                      )}
                    </Field>
                    <Field label="Reason" optional>
                      {(p) => <Textarea {...p} placeholder="Tell SSD why (optional)" />}
                    </Field>
                    <Checkbox checked={cb} onCheckedChange={setCb} label="I have authority to sign for my organisation" description="Required before signing the NDA" />
                    <Switch checked={sw} onCheckedChange={setSw} label="Download over Wi-Fi only" />
                    <RadioGroup
                      name="vis"
                      value={radio}
                      onValueChange={setRadio}
                      variant="cards"
                      options={[
                        { value: 'private', label: 'Private', description: 'Only SSD sees your asset.' },
                        { value: 'anonymous', label: 'Anonymous in the library', description: 'Default. Applies only if SSD switches the library on.' },
                        { value: 'named', label: 'Named', description: 'Investors see your company name.' },
                      ]}
                    />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </Card>
                </div>
              </Section>

              <Section id="stamp" title="Verification Stamp" note="One per claim status. Tap or hover to see verifier, credential, method, dates and evidence. Screen readers hear a full sentence.">
                <div className="flex flex-wrap gap-3">
                  {STATUSES.map((s) => (
                    <VerificationStamp key={s} claim={claimWithStatus(s)} />
                  ))}
                </div>
                <p className="mt-3 text-micro text-muted">Compact variant:</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <VerificationStamp key={s} claim={claimWithStatus(s)} compact />
                  ))}
                </div>
              </Section>

              <Section id="levels" title="Evidence-level badges" note="E3 and E4 are different methods, not a strict ladder; a claim can hold both.">
                <div className="flex flex-wrap gap-3">
                  {([0, 1, 2, 3, 4] as EvidenceLevel[]).map((l) => (
                    <EvidenceBadge key={l} level={l} showName />
                  ))}
                </div>
              </Section>

              <Section id="claim" title="Claim Row" note="Collapsed and expanded. J and K move between rows in the Command Center.">
                <Card className="overflow-hidden p-0">
                  <ClaimRow claim={claim('kb-t1')!} expanded={expanded} onToggle={() => setExpanded((e) => !e)} active />
                  <ClaimRow claim={claim('kb-x4')!} expanded />
                  <ClaimRow claim={claim('kb-l4')!} expanded={false} onToggle={() => toast('Expand')} />
                  <ClaimRow claim={claim('kb-t6')!} />
                </Card>
              </Section>

              <Section id="chip" title="Evidence Chip" note="Opens the viewer at the cited page with the region highlighted.">
                <div className="flex flex-wrap gap-2">
                  <EvidenceChip ev={{ docId: 'kb-d10', page: 47, region: 'Table 14.3 Mineral Resource statement' }} />
                  <EvidenceChip ev={{ docId: 'kb-d02', page: 1, region: 'Licence status panel' }} />
                  <EvidenceChip ev={{ docId: 'kb-d11', page: 1 }} />
                  <EvidenceChip ev={{ docId: 'ny-d01' }} />
                </div>
              </Section>

              <Section id="passport" title="Passport Header" note="Asset A. Actions change with disclosure level.">
                <div className="space-y-4">
                  <PassportHeader
                    asset={A}
                    view="full"
                    actions={
                      <>
                        <Button variant="secondary" icon={<Download />}>
                          Export PDF
                        </Button>
                        <Button variant="tint" icon={<Star />}>
                          Follow
                        </Button>
                      </>
                    }
                  />
                  <PassportHeader asset={A} view="teaser" actions={<Button>Express interest</Button>} />
                </div>
              </Section>

              <Section id="workstream" title="Workstream Card" note="Completeness is the share of material claims at E2 or above. Never a score out of 100.">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {WORKSTREAMS.map((w) => (
                    <WorkstreamCard key={w.id} asset={A} ws={w.id} onClick={() => toast(w.name)} />
                  ))}
                </div>
              </Section>

              <Section id="flags" title="Red-Flag Card" note="All four severities. Critical can only be resolved, never accepted.">
                <div className="grid gap-3 lg:grid-cols-2">
                  <RedFlagCard flag={flags.find((f) => f.id === 'mw-f1')!} />
                  <RedFlagCard flag={flags.find((f) => f.id === 'kb-f1')!} />
                  <RedFlagCard flag={flags.find((f) => f.id === 'kb-f2')!} />
                  <RedFlagCard flag={flags.find((f) => f.id === 'kk-f2')!} />
                </div>
              </Section>

              <Section id="locks" title="Disclosure Lock" note="Shows that content exists and how to unlock it. Locked content is never sent to the page.">
                <div className="grid gap-3 lg:grid-cols-3">
                  <DisclosureLock variant="nda" title="Full passport" contains="45 material claims across 7 workstreams" action={<Button size="sm">Sign NDA</Button>} />
                  <DisclosureLock variant="introduction" title="Asset profile" contains="Teaser, capital sought and structure" />
                  <DisclosureLock variant="consent" title="Owner identity" contains="Company name, directors and exact location" />
                </div>
              </Section>

              <Section id="gates" title="Rule-Gate Banner" note="Names the rule, the reason and the compliant route.">
                <div className="space-y-3">
                  <RuleGateBanner
                    level="hard_stop"
                    rule="R01 Relationship first"
                    reason="No relationship record for this investor. Add one, or request counsel review."
                    triggering="Summit Ridge Capital · relationship reviews: 0 dated before 24 Sep 2026"
                    onRequestReview={() => toast('Counsel review requested')}
                  />
                  <RuleGateBanner level="counsel_review" rule="R04 Investor-introduction milestones" reason="Milestone 3 is defined by introducing investors. Counsel decides this instance within 2 working days." />
                  {/* banned-words-ignore-next-line: the rule explanation quotes the flagged words */}
                  <RuleGateBanner level="warning" rule="R05 Promotional language" reason={'"Exceptional grades" reads as promotional. Quote grades from the signed report instead.'} />
                </div>
              </Section>

              <Section id="map" title="Map Panel" note="Registered boundary solid, owner's boundary dashed. Layers, imagery date and low-data mode. MapLibre loads only when a map is shown.">
                <MapPanel asset={A} className="h-[420px]" layers={{ captures: true, changes: true }} />
              </Section>

              <Section id="viewer" title="Document Viewer" note="Page, thumbnails, extracted fields with confidence, watermark on every view, version switcher and fingerprint.">
                <Card className="overflow-hidden p-0">
                  <DocumentViewer document={doc('kb-d10')!} page={47} region="Table 14.3" viewer={{ name: 'Kevin Omondi', org: 'SSD', email: 'kevin.omondi@ssd.example' }} editable />
                </Card>
              </Section>

              <Section id="capture" title="Capture Frame" note="Used by the Field App (Phase 9). In-app capture only, stamped with time, GPS, device and fingerprint.">
                <div className="grid max-w-3xl gap-4 sm:grid-cols-3">
                  <div>
                    <Label>Live</Label>
                    <CaptureFrame />
                  </div>
                  <div>
                    <Label>Captured</Label>
                    <CaptureFrame state="captured" />
                  </div>
                  <div>
                    <Label>No location</Label>
                    <CaptureFrame state="no_location" />
                  </div>
                </div>
              </Section>

              <Section id="timeline" title="Status Timeline">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="p-4">
                    <StatusTimeline steps={plans.nyanza} />
                  </Card>
                  <Card className="space-y-4 p-4">
                    <Label>Compact</Label>
                    <StatusTimeline steps={plans.nyanza} variant="compact" />
                    <StatusTimeline steps={plans.kiboko} variant="compact" />
                  </Card>
                </div>
              </Section>

              <Section id="queue" title="Queue Row" note="Deadline states: on track, due today, overdue; blocked-by chip; bulk select.">
                <Card className="overflow-hidden p-0" role="table">
                  {['t14', 't06', 't13', 't01'].map((id, i) => (
                    <QueueRow key={id} task={tasks.find((t) => t.id === id)!} active={i === 1} selected={i === 2} onSelect={() => {}} onOpen={() => toast('Open task')} />
                  ))}
                </Card>
              </Section>

              <Section id="freshness" title="Freshness Meter">
                <div className="flex flex-wrap gap-6">
                  <FreshnessMeter claim={claim('kb-e1')!} />
                  <FreshnessMeter claim={claim('kb-t1')!} />
                  <FreshnessMeter claim={claim('kb-i1')!} />
                  <FreshnessMeter claim={claim('kb-l4')!} />
                </div>
              </Section>

              <Section id="sync" title="Sync Indicator">
                <div className="flex flex-wrap gap-3">
                  <SyncIndicator state="online" />
                  <SyncIndicator state="offline" queued={12} />
                  <SyncIndicator state="syncing" queued={4} />
                  <SyncIndicator state="offline" variant="dot" />
                </div>
              </Section>

              <Section id="explain" title="Explain-This Toggle">
                <Card className="max-w-2xl p-4">
                  <ExplainThis
                    technical={<p className="text-body">JORC (2012) Inferred Mineral Resource of 12.4 Mt at 8.1% Cg (4% Cg cut-off), effective 30 Jun 2025; QA/QC duplicate insertion 2.8% against a 5% target.</p>}
                    plain={<p>There is an early, low-confidence estimate of about 12 million tonnes of rock containing about 8% graphite. Some quality-control samples are missing, so an independent geologist is checking it now.</p>}
                  />
                </Card>
              </Section>

              <Section id="consent" title="Consent Capture">
                <div className="grid max-w-4xl gap-4 md:grid-cols-2">
                  <ConsentCapture
                    title="Consent to verification and data processing"
                    version="v2.1"
                    consented={consent}
                    onChange={setConsent}
                    text="SSD will check your licence, company and documents with government registries and independent experts, and store them securely in Kenya and abroad under Kenya's Data Protection Act. You can withdraw consent at any time."
                  />
                  <ConsentCapture
                    title="Interview consent (read aloud)"
                    version="v1.3 · Kiswahili"
                    mode="audio"
                    consented={consentAudio}
                    onChange={setConsentAudio}
                    text="Tunaomba ruhusa kurekodi mazungumzo haya. Jina lako halitaonyeshwa kwa wawekezaji isipokuwa ukubali."
                  />
                </div>
              </Section>

              <Section id="teaser" title="Teaser Card" note="No urgency elements. Red flags and verification status first.">
                <div className="grid max-w-3xl gap-3 md:grid-cols-2">
                  <TeaserCard asset={A} status="waiting" onInterested={() => toast('Interested')} onNotNow={() => toast('Not now')} onAsk={() => toast('Ask SSD')} sentOn="2026-09-22" />
                  <TeaserCard asset={asset('pwani')} status="not_now" sentOn="2026-08-04" />
                </div>
              </Section>

              <Section id="audit" title="Audit Row">
                <Card className="overflow-hidden p-0">
                  {auditEvents.slice(0, 4).map((e) => (
                    <AuditRow key={e.id} event={e} onOpen={() => toast(e.hash)} />
                  ))}
                </Card>
              </Section>

              <Section id="empty" title="Empty State and banners" note="Never a blank panel; includes a named contact where relevant.">
                <div className="grid gap-4 lg:grid-cols-2">
                  <EmptyState
                    icon={<Eye />}
                    title="No teasers yet"
                    body="SSD sends only opportunities with released passports that match your mandate."
                    contactId="james"
                    action={<Button variant="secondary">Review your mandate</Button>}
                  />
                  <div className="space-y-3">
                    <Banner tone="offline" icon={<Eye />} title="You're offline. Your changes are saved on this phone.">
                      3 items will send when you reconnect.
                    </Banner>
                    <Banner tone="info" title="Library switched off">
                      Investors discover assets only through SSD teasers (gatekeeper mode).
                    </Banner>
                    <Banner tone="warning" title="Imagery older than 90 days">
                      Order a newer image before relying on change detection.
                    </Banner>
                    <Banner tone="success" title="Passport released">
                      v2 released 20 Sep 2026 by Sarah Mitchell.
                    </Banner>
                    <FlagCounts counts={{ critical: 0, high: 1, medium: 2, low: 0 }} />
                  </div>
                </div>
              </Section>
            </main>
          </div>
        </div>
      </EvidenceViewerProvider>
    </ShellProvider>
  )
}
