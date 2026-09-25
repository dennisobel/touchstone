import { BadgeCheck, CircleAlert, FilePenLine, KeyRound, Lock, PenLine } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { cn } from '@/lib/cn'
import { useDemoState } from '@/lib/demo-states'
import { fmtDate, fmtDateTime, NOW } from '@/lib/format'
import { asset, assignments, claim, person } from '@/data'
import { Banner, Panel, StatusStamp } from '@/ds/components'
import { StampIcon } from '@/ds/icons'
import { Page } from '@/ds/shell'
import { Button, Chip, Field, Input, RadioGroup, Textarea, toast } from '@/ds/ui'
import { EXPERT_ID } from './ExpertShell'
import { useReview } from './store'

const STATES = [
  { id: 'default', label: 'Ready to sign' },
  { id: 'expired', label: 'Credential expired' },
  { id: 'signed', label: 'Signed (locked)' },
  { id: 'amended', label: 'Opinion amended (v2)' },
] as const

export default function ED05SignOff() {
  const { id = 'as-1' } = useParams()
  const a = assignments.find((x) => x.id === id) ?? assignments[0]
  const ast = asset(a.assetId)
  const me = person(EXPERT_ID)
  const [state] = useDemoState('ED-05', STATES)
  const { findings, signed, version, sign, amend } = useReview()
  const [assumptions, setAssumptions] = useState('Relied on the drillhole database and certificates supplied by the holder as of 22 Sep 2026; no independent re-sampling.')
  const [quals, setQuals] = useState('Inferred classification only; QA/QC for batches 36–38 pending. Metallurgical flake-size results are from one composite and may not be representative.')
  const [effective, setEffective] = useState('2026-09-24')
  const [visit, setVisit] = useState<'visited' | 'not_visited'>('not_visited')
  const [typed, setTyped] = useState('')
  const [code, setCode] = useState('')
  const [changeNote, setChangeNote] = useState('')
  const expired = state === 'expired'
  const isSigned = signed || state === 'signed' || state === 'amended'
  const v = state === 'amended' ? 2 : version

  useEffect(() => {
    if (state === 'default' && signed) amend()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  const claimIds = a.claimIds.length ? a.claimIds : ['kb-g1', 'kb-g3', 'kb-g4', 'kb-g5', 'kb-g6']
  const count = (f: string) => claimIds.filter((c) => (findings[c]?.finding ?? 'none') === f).length
  const canSign = !expired && typed.trim() === me.name && code.length === 6 && assumptions && quals

  return (
    <Page title="Sign-off" subtitle={`${a.taskType} · ${ast.name}`} back={`/expert/reviews/${a.id}`} breadcrumbs={[{ label: 'Reviews', to: '/expert/reviews' }, { label: ast.name, to: `/expert/reviews/${a.id}` }, { label: 'Sign-off' }]}>
      {expired && (
        <Banner tone="critical" icon={<CircleAlert />} title="Your SACNASP registration shows as expired (30 Jun 2026)" className="mb-4">
          Signing is blocked until your credential is current. Upload your renewal certificate in Profile; SSD verifies it within 1 working day.
        </Banner>
      )}
      {isSigned && (
        <div className="mb-4 flex flex-wrap items-center gap-4 rounded-lg border border-verified-border bg-verified-fill p-4 animate-rise-in">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary text-on-primary">
            <StampIcon className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-h3 font-semibold">Opinion v{v} signed and locked</p>
            <p className="text-meta text-muted">
              {me.name} · {me.credentialBody} {me.credential} · {fmtDateTime(NOW)}
            </p>
            {state === 'amended' && <p className="mt-1 text-micro">Change note: Added blanks for batches 36–38; QA/QC claim now supported with qualifications.</p>}
          </div>
          <Chip tone="verified" icon={<Lock />}>
            Locked
          </Chip>
          {!expired && (
            <Button variant="secondary" icon={<FilePenLine />} onClick={() => (amend(), toast('Opened v2 for amendment; v1 stays on record'))}>
              Amend (creates v{v + 1})
            </Button>
          )}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <Panel title="Findings summary" subtitle={`${claimIds.length} claims in scope`}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ['Supported', count('supported'), 'text-verified'],
                ['With qualifications', count('qualified'), 'text-review'],
                ['Not supported', count('not_supported'), 'text-critical'],
                ['Not reviewed', count('none'), 'text-muted'],
              ].map(([k, n, cls]) => (
                <div key={k as string} className="rounded-sm bg-sunken/70 p-3">
                  <p className={cn('text-h2 font-semibold tabular-nums', cls as string)}>{n}</p>
                  <p className="text-micro text-muted">{k}</p>
                </div>
              ))}
            </div>
            <ul className="mt-4 divide-y divide-line">
              {claimIds.map((cid) => {
                const c = claim(cid)!
                const f = findings[cid]?.finding
                return (
                  <li key={cid} className="flex items-start gap-3 py-2.5">
                    <span className="font-mono text-[11px] text-muted">{cid.toUpperCase()}</span>
                    <span className="min-w-0 flex-1 text-meta">{c.statement}</span>
                    {f ? (
                      <Chip tone={f === 'supported' ? 'verified' : f === 'qualified' ? 'review' : 'critical'}>{f === 'supported' ? 'Supported' : f === 'qualified' ? 'Qualified' : 'Not supported'}</Chip>
                    ) : (
                      <StatusStamp status="declared" size="sm" label="Not reviewed" />
                    )}
                  </li>
                )
              })}
            </ul>
          </Panel>
          <Panel title="Opinion details">
            <fieldset disabled={isSigned} className="space-y-4">
              <Field label="Assumptions" error={!assumptions ? 'Required' : undefined}>
                {(p) => <Textarea {...p} value={assumptions} onChange={(e) => setAssumptions(e.target.value)} rows={3} />}
              </Field>
              <Field label="Qualifications and limitations" error={!quals ? 'Required' : undefined}>
                {(p) => <Textarea {...p} value={quals} onChange={(e) => setQuals(e.target.value)} rows={3} />}
              </Field>
              <Field label="Effective date">{(p) => <Input {...p} type="date" value={effective} onChange={(e) => setEffective(e.target.value)} className="md:w-56" />}</Field>
              <div>
                <p className="mb-2 text-meta font-medium">Site-visit status</p>
                <RadioGroup
                  name="visit"
                  value={visit}
                  onValueChange={setVisit}
                  options={[
                    { value: 'not_visited', label: 'Not visited: relied on the SSD field visit of 2 Sep 2026 (Brian Kiptoo)' },
                    { value: 'visited', label: 'Visited the site personally' },
                  ]}
                />
              </div>
            </fieldset>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Credentials" subtitle="Pre-filled from your verified profile">
            <dl className="space-y-2.5 text-meta">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Name</dt>
                <dd className="font-medium">{me.name}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Professional body</dt>
                <dd>{me.credentialBody}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Membership number</dt>
                <dd className="font-mono">{me.credential}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Expires</dt>
                <dd>{expired ? '30 Jun 2026' : fmtDate(me.credentialExpiry ?? '2027-06-30')}</dd>
              </div>
            </dl>
            <div className="mt-3">{expired ? <Chip tone="critical">Expired</Chip> : <Chip tone="verified" icon={<BadgeCheck />}>Verified by SSD on 2 Jan 2026</Chip>}</div>
          </Panel>

          {!isSigned ? (
            <Panel title="Sign">
              <div className="space-y-3">
                <Field label="Type your full name to sign" hint={`Must match: ${me.name}`}>
                  {(p) => <Input {...p} value={typed} onChange={(e) => setTyped(e.target.value)} disabled={expired} className="font-serif text-[18px]" />}
                </Field>
                <Field label="Authenticator code" hint="From your authenticator app">
                  {(p) => (
                    <Input
                      {...p}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      inputMode="numeric"
                      placeholder="000000"
                      disabled={expired}
                      className="font-mono tracking-[0.3em]"
                      leading={<KeyRound />}
                    />
                  )}
                </Field>
                {version > 1 && (
                  <Field label="Change note (required for amendments)">{(p) => <Textarea {...p} value={changeNote} onChange={(e) => setChangeNote(e.target.value)} rows={2} />}</Field>
                )}
                <Button
                  block
                  size="lg"
                  icon={<PenLine />}
                  disabled={!canSign || (version > 1 && !changeNote)}
                  onClick={() => {
                    sign()
                    toast.success(`Opinion v${version} signed and locked`)
                  }}
                >
                  Sign opinion v{version}
                </Button>
                <p className="text-micro text-muted">Once signed, the opinion is locked. Amendments create a new version with a change note; both stay on record.</p>
              </div>
            </Panel>
          ) : null}
        </div>
      </div>
    </Page>
  )
}
