import { Check, CircleAlert, CircleCheck, Copy, FileCheck2, FileX2, Link2, RefreshCw, ScanFace, Search, ShieldCheck, TriangleAlert } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router'
import { cn } from '@/lib/cn'
import { useDemoState } from '@/lib/demo-states'
import { addDays, fmtDate, fmtDateTime, toIso } from '@/lib/format'
import { asset, person, TIER_LABEL, type Tier } from '@/data'
import { Banner, RuleGateBanner, StatusTimeline } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Avatar, Button, Chip, Segmented, Select, Textarea, toast } from '@/ds/ui'
import { Panel } from './common'

const STATES = [
  { id: 'default', label: 'Checks passed' },
  { id: 'failed', label: 'Automated check failed' },
  { id: 'duplicate', label: 'Duplicate licence found' },
] as const

type Decision = 'accept' | 'request' | 'reject'

export default function CC03Triage() {
  const navigate = useNavigate()
  const { id = 'mutomo' } = useParams()
  const a = asset(id)
  const [state] = useDemoState('CC-03', STATES)
  const [decision, setDecision] = useState<Decision>('accept')
  const [tier, setTier] = useState<Tier>('standard')
  const [reason, setReason] = useState('')
  const [retrying, setRetrying] = useState(false)
  const [cadastreOk, setCadastreOk] = useState(true)
  const failed = state === 'failed' && !cadastreOk
  useEffect(() => setCadastreOk(state !== 'failed'), [state])
  const duplicate = state === 'duplicate'

  const docs = [
    { name: 'Licence certificate', ok: true },
    { name: 'Company certificate and official search', ok: true },
    { name: "Directors' IDs (2)", ok: true },
    { name: 'Environmental licence or exemption', ok: false, note: 'Owner: "Applying; EIA study under way"' },
    { name: 'Survey plan or beacon coordinates', ok: true },
    { name: 'Past reports and assay certificates', ok: false, note: 'Optional; none supplied' },
  ]

  const durations: Record<Tier, number> = { desk: 14, standard: 30, investor_ready: 63 }
  const start = '2026-09-25'
  const plan = [
    { label: 'Automated registry and screening checks', date: start, who: 'kevin', state: 'current' as const },
    { label: 'Title desk check and cadastre capture', date: toIso(addDays(start, 6)), who: 'kevin', state: 'next' as const },
    ...(tier !== 'desk'
      ? [
          { label: 'Counsel title opinion', date: toIso(addDays(start, 16)), who: 'esther', state: 'next' as const },
          { label: 'One-day site visit', date: toIso(addDays(start, 14)), who: 'collins', state: 'next' as const },
        ]
      : []),
    ...(tier === 'investor_ready' ? [{ label: 'Qualified Person resource review', date: toIso(addDays(start, 40)), who: 'amani', state: 'next' as const }] : []),
    { label: 'Findings review (5 working days)', date: toIso(addDays(start, durations[tier] - 8)), who: a.ownerId, state: 'next' as const },
    { label: 'Release', date: toIso(addDays(start, durations[tier])), who: 'sarah', state: 'next' as const },
  ]

  return (
    <Page
      title={`Triage · ${a.name}`}
      shortTitle="Intake triage"
      back="/command/assets"
      breadcrumbs={[{ label: 'Assets', to: '/command/assets' }, { label: a.name }, { label: 'Intake triage' }]}
      subtitle={`Submitted ${fmtDate(a.submittedOn)} · ${a.licence.number} · ${a.commodity}`}
    >
      {duplicate && (
        <RuleGateBanner
          className="mb-4"
          level="hard_stop"
          rule="Duplicate licence (M03-6)"
          reason={
            <>
              {a.licence.number} is also in submission <span className="font-mono">SUB-2026-0188</span> by a different representative. Both records are on hold. The mandates conflict, so a Critical flag was raised.
            </>
          }
          alternatives={
            <div className="mt-1 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" icon={<Link2 />}>
                Open linked record
              </Button>
              <Button size="sm" variant="secondary">
                Call the licence holder
              </Button>
            </div>
          }
        />
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* Left: submission summary */}
        <Panel title="Submission">
          <div className="flex items-center gap-3">
            <Avatar id={a.ownerId} size={40} />
            <div>
              <p className="text-meta font-semibold">{person(a.ownerId).name}</p>
              <p className="text-micro text-muted">{person(a.ownerId).role} · self-submitted</p>
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-meta">
            <Row k="Licence" v={<span className="font-mono">{a.licence.number}</span>} />
            <Row k="Type" v={a.licence.type} />
            <Row k="Commodity" v={a.commodity} />
            <Row k="Stage" v={a.stage} />
            <Row k="County" v={a.county} />
            <Row k="Area" v={`${a.licence.areaHa.toLocaleString()} ha`} />
          </dl>
          <p className="mt-4 text-micro font-semibold uppercase tracking-wide text-muted">Documents · 4 of 5 required</p>
          <ul className="mt-2 space-y-1.5">
            {docs.map((d) => (
              <li key={d.name} className="flex items-start gap-2 text-meta">
                {d.ok ? <FileCheck2 className="mt-0.5 size-4 shrink-0 text-verified" aria-label="Received" /> : <FileX2 className="mt-0.5 size-4 shrink-0 text-muted" aria-label="Missing" />}
                <span className="min-w-0">
                  {d.name}
                  {d.note && <span className="block text-micro text-muted">{d.note}</span>}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        {/* Centre: automated checks */}
        <Panel title="Automated checks" subtitle={`Run ${fmtDateTime(a.licence.retrievedAt)}`}>
          <ul className="space-y-3">
            <CheckItem
              icon={<ScanFace />}
              title="Identity check"
              result="pass"
              detail="National ID and liveness matched · Ruth Musyoka"
              evidence="Provider report ID-88213"
            />
            <CheckItem icon={<ShieldCheck />} title="Sanctions and PEP screening" result="pass" detail="US, UN, EU, UK lists · 0 hits · company and 2 directors" evidence="Screening run SCR-51190" />
            {failed ? (
              <li className="rounded-lg border border-critical-border bg-critical-fill p-3">
                <div className="flex items-start gap-3">
                  <CircleAlert className="mt-0.5 size-5 shrink-0 text-critical" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-meta font-semibold">Cadastre lookup failed</p>
                    <p className="text-micro text-muted">Portal returned 503 after 3 attempts (M05-4). Retry later or capture it by hand.</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<RefreshCw className={cn(retrying && 'animate-spin')} />}
                        onClick={() => {
                          setRetrying(true)
                          window.setTimeout(() => {
                            setRetrying(false)
                            setCadastreOk(true)
                            toast.success('Cadastre record captured')
                          }, 1400)
                        }}
                      >
                        Retry
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => toast('Analyst capture form opened (demo)')}>
                        Manual capture
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            ) : (
              <CheckItem
                icon={<Search />}
                title="Cadastre lookup"
                result="pass"
                detail={`${a.licence.type} · ${a.licence.holder} · Active until ${fmtDate(a.licence.expires)} · holder and boundary match`}
                evidence="Portal capture with URL and timestamp"
              />
            )}
            <CheckItem
              icon={<Copy />}
              title="Duplicate check"
              result={duplicate ? 'fail' : 'pass'}
              detail={duplicate ? 'Same licence number in SUB-2026-0188 · conflicting mandates' : 'No other submission with this licence, boundary or documents'}
              evidence={duplicate ? 'Linked record' : 'Checked 12,408 documents by fingerprint'}
            />
          </ul>
        </Panel>

        {/* Right: decision */}
        <Panel title="Decision">
          <Segmented<Decision>
            ariaLabel="Decision"
            value={decision}
            onChange={setDecision}
            block
            size="sm"
            options={[
              { value: 'accept', label: 'Accept' },
              { value: 'request', label: 'Request info' },
              { value: 'reject', label: 'Reject' },
            ]}
          />
          {decision === 'accept' && (
            <div className="mt-4 space-y-3 animate-fade-in">
              <label className="block text-micro font-medium text-muted" htmlFor="tier">
                Verification tier
              </label>
              <Select id="tier" value={tier} onChange={(e) => setTier(e.target.value as Tier)}>
                {(['desk', 'standard', 'investor_ready'] as Tier[]).map((t) => (
                  <option key={t} value={t}>
                    {TIER_LABEL[t]}
                  </option>
                ))}
              </Select>
              <div className="rounded-sm bg-sunken/60 p-3">
                <p className="mb-2 text-micro font-semibold text-muted">Generated plan · Kenya pack v1.2 · template PL-iron-{tier}</p>
                <StatusTimeline steps={plan} />
              </div>
              <Button block icon={<Check />} disabled={duplicate || failed} onClick={() => (toast.success(`Accepted at ${TIER_LABEL[tier]} tier · owner notified`), navigate('/command/assets', { viewTransition: true }))}>
                Accept at {TIER_LABEL[tier]}
              </Button>
              {(duplicate || failed) && <p className="text-micro text-muted">Resolve the failing check first.</p>}
            </div>
          )}
          {decision === 'request' && (
            <div className="mt-4 space-y-3 animate-fade-in">
              <Select aria-label="Template" defaultValue="env">
                <option value="env">Template: Environmental licence or exemption</option>
                <option value="survey">Template: Survey plan with beacon coordinates</option>
                <option value="mandate">Template: Representative mandate</option>
              </Select>
              <Textarea
                rows={5}
                defaultValue={'Please send your environmental licence (EIA), or the exemption letter from NEMA.\n\nWhy this matters: prospecting without one can make the licence invalid.\n\nDue: 2 Oct 2026. Photo or PDF.'}
                aria-label="Request"
              />
              <p className="text-micro text-muted">Checked against R05 before sending · sent in English and Swahili</p>
              <Button block onClick={() => toast.success('Request sent to Ruth Musyoka')}>
                Send request
              </Button>
            </div>
          )}
          {decision === 'reject' && (
            <div className="mt-4 space-y-3 animate-fade-in">
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Internal reason (required)" aria-label="Reason" />
              <div className="rounded-sm border border-line bg-sunken/60 p-3 text-meta">
                <p className="text-micro font-semibold text-muted">Owner sees</p>
                <p className="mt-1">We can't take this licence forward at the moment. Kevin Omondi will call you within 2 working days to explain why and what could change that.</p>
              </div>
              <Button block variant="danger" disabled={!reason} onClick={() => toast('Submission rejected; owner will be called')}>
                Reject
              </Button>
            </div>
          )}
        </Panel>
      </div>
      {!duplicate && !failed && (
        <Banner tone="info" className="mt-4" icon={<TriangleAlert />} title="Environmental licence missing">
          Not a blocker at triage. The generated plan includes a request to the owner; a missing EIA where one is required becomes a Critical flag (M09-1).
        </Banner>
      )}
    </Page>
  )
}

function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div>
      <dt className="text-micro text-muted">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  )
}

function CheckItem({ icon, title, result, detail, evidence }: { icon: ReactNode; title: string; result: 'pass' | 'fail'; detail: string; evidence: string }) {
  return (
    <li className={cn('rounded-lg border p-3', result === 'pass' ? 'border-line' : 'border-critical-border bg-critical-fill')}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-muted [&_svg]:size-5">{icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-meta font-semibold">{title}</p>
            {result === 'pass' ? (
              <Chip tone="verified" icon={<CircleCheck />}>
                Passed
              </Chip>
            ) : (
              <Chip tone="critical" icon={<CircleAlert />}>
                Failed
              </Chip>
            )}
          </div>
          <p className="mt-0.5 text-micro text-muted">{detail}</p>
          <button type="button" className="mt-1 inline-flex items-center gap-1 text-micro font-medium text-primary hover:underline" onClick={() => toast(evidence)}>
            <Link2 className="size-3" aria-hidden /> {evidence}
          </button>
        </div>
      </div>
    </li>
  )
}
