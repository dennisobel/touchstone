import { CircleCheck, ExternalLink, FileText, ShieldAlert, Wallet, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useDemoState } from '@/lib/demo-states'
import { fmtDate, money } from '@/lib/format'
import { asset, assignments, claim } from '@/data'
import { Banner, Panel, RuleGateBanner, StatusStamp } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Button, Checkbox, Chip, Sheet, Textarea, toast } from '@/ds/ui'

const STATES = [
  { id: 'default', label: 'Offer' },
  { id: 'conflict', label: 'Declared conflict' },
] as const

export default function ED02Offer() {
  const navigate = useNavigate()
  const { id = 'as-4' } = useParams()
  const a = assignments.find((x) => x.id === id) ?? assignments[3]
  const ast = asset(a.assetId)
  const [state] = useDemoState('ED-02', STATES)
  const [conf, setConf] = useState({ prior: false, financial: false, relationship: false })
  const [other, setOther] = useState('')
  const [declared, setDeclared] = useState(false)
  const [declineOpen, setDeclineOpen] = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    if (state === 'conflict') {
      setConf({ prior: true, financial: false, relationship: false })
      setOther('2019: short site visit for the holder, paid by the holder.')
      setDeclared(true)
    } else {
      setConf({ prior: false, financial: false, relationship: false })
      setOther('')
      setDeclared(false)
    }
  }, [state])

  const hasConflict = conf.prior || conf.financial || conf.relationship || other.trim().length > 0
  const files = a.data
    .split(';')
    .map((f) => f.trim())
    .filter(Boolean)

  if (accepted) {
    return (
      <Page title="Assignment accepted" back="/expert" focus>
        <div className="mx-auto flex max-w-md flex-col items-center py-10 text-center animate-rise-in">
          <span className="flex size-16 items-center justify-center rounded-full bg-verified-fill text-verified">
            <CircleCheck className="size-8" aria-hidden />
          </span>
          <h1 className="mt-5 text-h1 font-semibold">You have access to {ast.name}</h1>
          <p className="mt-2 text-body text-muted">Access covers only the folders for this task and ends 7 days after the deadline ({fmtDate(a.deadline)}).</p>
          <Button size="lg" className="mt-6" onClick={() => navigate('/expert/reviews/as-1', { viewTransition: true })}>
            Open review workspace
          </Button>
        </div>
      </Page>
    )
  }

  return (
    <Page
      title={a.taskType}
      subtitle={`${ast.name} · ${ast.commodity} · ${ast.county}`}
      back="/expert"
      breadcrumbs={[{ label: 'Assignments', to: '/expert' }, { label: 'Offer' }]}
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="ghost" icon={<X />} onClick={() => setDeclineOpen(true)}>
            Decline
          </Button>
          <Button size="lg" disabled={!declared || hasConflict} onClick={() => setAccepted(true)}>
            Accept assignment
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <Panel title="Scope">
            <p className="text-body">{a.scope}</p>
            {a.claimIds.length > 0 && (
              <ul className="mt-3 divide-y divide-line rounded-sm border border-line">
                {a.claimIds.map((cid) => {
                  const c = claim(cid)
                  return c ? (
                    <li key={cid} className="flex items-center gap-3 px-3 py-2">
                      <span className="font-mono text-micro text-muted">{cid.toUpperCase()}</span>
                      <span className="min-w-0 flex-1 text-meta">{c.statement}</span>
                      <StatusStamp status={c.status} size="sm" />
                    </li>
                  ) : null
                })}
              </ul>
            )}
          </Panel>
          <Panel title="Deliverable">
            <p className="text-body">A structured opinion using the resource-review template: per claim, supported, supported with qualifications, or not supported, with comments and page citations. Signed with your credentials.</p>
          </Panel>
          <Panel title="Data provided">
            <ul className="space-y-2">
              {files.map((f, i) => (
                <li key={f} className="flex items-center gap-2 text-meta">
                  <FileText className="size-4 text-muted" aria-hidden />
                  <span className="flex-1">{f}</span>
                  <span className="text-micro text-muted">{[26, 4.1, 9.8, 18.4][i % 4]} MB</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-micro text-muted">Access is limited to these folders and ends 7 days after the deadline. All access is logged.</p>
          </Panel>
        </div>
        <div className="space-y-4">
          <Panel title="Fee and deadline">
            <dl className="space-y-3 text-meta">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Fee</dt>
                <dd className="text-h3 font-semibold tabular-nums">{money('USD', a.feeUsd)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Payout</dt>
                <dd className="inline-flex items-center gap-1">
                  <Wallet className="size-4 text-muted" aria-hidden /> Bank transfer ••• 4471
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Deadline</dt>
                <dd className="font-medium">{fmtDate(a.deadline)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Paid by</dt>
                <dd>SSD (never the owner)</dd>
              </div>
            </dl>
          </Panel>
          <Panel title="Reliance and liability">
            <p className="text-meta">
              Your opinion may be relied on by SSD and by qualified investors who sign an NDA for this asset, for their diligence only. Liability is capped under the engagement terms.
            </p>
            <Button variant="link" className="mt-2" iconRight={<ExternalLink />} onClick={() => toast('Engagement terms v3.2 (demo)')}>
              Read the liability terms
            </Button>
          </Panel>
          <Panel title="Conflict declaration" subtitle="Required before accepting">
            <div className="space-y-1">
              <Checkbox checked={conf.prior} onCheckedChange={(v) => setConf((c) => ({ ...c, prior: v }))} label="I have done prior work for the holder" />
              <Checkbox checked={conf.financial} onCheckedChange={(v) => setConf((c) => ({ ...c, financial: v }))} label="I have a financial interest in the holder or asset" />
              <Checkbox checked={conf.relationship} onCheckedChange={(v) => setConf((c) => ({ ...c, relationship: v }))} label="I have a relationship with a director or owner" />
              <Textarea value={other} onChange={(e) => setOther(e.target.value)} placeholder="Anything else SSD should know (optional)" aria-label="Other conflicts" className="mt-2" />
              <Checkbox checked={declared} onCheckedChange={setDeclared} label={<span className="font-medium">I declare this is complete and accurate</span>} className="mt-2" />
            </div>
          </Panel>
          {declared && hasConflict && (
            <RuleGateBanner
              level="hard_stop"
              rule="R12 Verifier independence"
              reason="You declared a possible conflict. SSD compliance will review it: they can reassign the task, or clear an immaterial conflict in writing."
              onRequestReview={() => toast.success('Sent to Sarah Mitchell, compliance')}
            />
          )}
          {!declared && (
            <Banner tone="neutral" icon={<ShieldAlert />}>
              Accept is enabled once you complete the declaration.
            </Banner>
          )}
          {declared && !hasConflict && <Chip tone="verified" icon={<CircleCheck />}>No conflicts declared</Chip>}
        </div>
      </div>

      <Sheet
        open={declineOpen}
        onOpenChange={setDeclineOpen}
        title="Decline this offer"
        desktop="center"
        size="sm"
        footer={
          <Button block variant="secondary" onClick={() => (toast('Offer declined'), navigate('/expert', { viewTransition: true }))}>
            Decline
          </Button>
        }
      >
        <Textarea placeholder="Reason (optional): availability, scope, fee…" aria-label="Reason" />
      </Sheet>
    </Page>
  )
}
