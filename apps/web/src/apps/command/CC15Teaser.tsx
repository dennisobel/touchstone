import { Check, CircleCheck, CircleX, MessageSquareQuote, Send } from 'lucide-react'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { cn } from '@/lib/cn'
import { useDemoState } from '@/lib/demo-states'
import { asset, BANNED_PHRASES, claimsFor, investor, person } from '@/data'
import { assetFlagCounts, Banner, FlagCounts, Panel, RuleGateBanner, TeaserCard, TierBadge } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Avatar, Button, Chip, Field, Input, Select, toast } from '@/ds/ui'

const STATES = [
  { id: 'default', label: 'Draft' },
  { id: 'changes', label: 'Owner requested changes' },
  { id: 'gate', label: 'Gate failure for one recipient' },
] as const

const STEPS = ['Draft', 'Owner approval', 'Partner approval', 'Compliance gate', 'Ready to send']

function screen(text: string) {
  const hits: { start: number; end: number; phrase: string }[] = []
  const lower = text.toLowerCase()
  for (const p of [...BANNED_PHRASES].sort((a, b) => b.length - a.length)) {
    const re = new RegExp(`\\b${p.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'g')
    let m: RegExpExecArray | null
    while ((m = re.exec(lower))) {
      if (!hits.some((h) => m!.index < h.end && m!.index + p.length > h.start)) hits.push({ start: m.index, end: m.index + p.length, phrase: p })
    }
  }
  return hits.sort((a, b) => a.start - b.start)
}

/** Textarea with live R05 screening: banned phrases get a wavy underline as you type. */
function ScreenedField({ value, onChange, label, rows = 2 }: { value: string; onChange: (v: string) => void; label: string; rows?: number }) {
  const hits = screen(value)
  let last = 0
  const parts: React.ReactNode[] = []
  hits.forEach((h, i) => {
    parts.push(<Fragment key={`t${i}`}>{value.slice(last, h.start)}</Fragment>)
    parts.push(
      <mark key={`m${i}`} className="bg-transparent text-transparent underline decoration-garnet decoration-wavy decoration-2 underline-offset-4">
        {value.slice(h.start, h.end)}
      </mark>,
    )
    last = h.end
  })
  parts.push(<Fragment key="end">{value.slice(last)}</Fragment>)
  return (
    <div>
      <label className="mb-1.5 block text-meta font-medium">{label}</label>
      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words rounded-sm border border-transparent px-3 py-2 text-body leading-relaxed text-transparent">
          {parts}
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          aria-label={label}
          aria-invalid={hits.length > 0 || undefined}
          className={cn('relative w-full resize-y rounded-sm border bg-transparent px-3 py-2 text-body leading-relaxed outline-none focus-visible:outline-2 focus-visible:outline-primary', hits.length ? 'border-critical' : 'border-line-strong')}
        />
      </div>
      {hits.length > 0 && (
        <p role="alert" className="mt-1 text-micro text-critical">
          Rule R05 Promotional language: “{hits.map((h) => h.phrase).join('”, “')}”. Quote grades from the signed report instead.
        </p>
      )}
    </div>
  )
}

export default function CC15Teaser() {
  const { id = 'kiboko' } = useParams()
  const a = asset(id)
  const [state] = useDemoState('CC-15', STATES)
  const [capital, setCapital] = useState(a.capitalSought ?? '')
  const [structure, setStructure] = useState(a.structure ?? '')
  const [highlights, setHighlights] = useState(a.highlights?.map((h) => h.text) ?? ['', '', ''])
  const [links, setLinks] = useState(a.highlights?.map((h) => h.claimId) ?? ['', '', ''])
  const [step, setStep] = useState(0)

  useEffect(() => {
    setStep(state === 'changes' ? 1 : state === 'gate' ? 3 : 0)
    if (state === 'default') setHighlights([...(a.highlights?.map((h) => h.text) ?? [])])
    // banned-words-ignore-next-line: demo state "changes" shows R05 flagging a promotional highlight
    if (state === 'changes') setHighlights((h) => [h[0], h[1], 'Exceptional access: 186 km by paved road to the port of Mombasa; grid power 11 km away'])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  const allHits = useMemo(() => [capital, structure, ...highlights].flatMap((t) => screen(t)), [capital, structure, ...highlights])
  const preview = { ...a, capitalSought: capital, structure }
  const recipients = [
    { inv: investor('brightwater'), ok: true, note: 'Qualified 15 Jul · first review 24 Jun · owner consent v3' },
    { inv: investor('hargrove'), ok: state !== 'gate', note: state === 'gate' ? 'R01: relationship record older than 12 months requires re-qualification' : 'Qualified 2 Aug · first review 21 Jul' },
    { inv: investor('lakeshore'), ok: false, note: 'R02: not qualified (invited 21 Sep)' },
  ]

  return (
    <Page title={`Teaser builder · ${a.code}`} shortTitle="Teaser builder" back="/command/matching" breadcrumbs={[{ label: 'Matching', to: '/command/matching' }, { label: `Teaser ${a.code}` }]}>
      {/* Workflow bar */}
      <ol className="no-scrollbar -mx-4 mb-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:px-0" aria-label="Teaser workflow">
        {STEPS.map((s, i) => (
          <li key={s} className={cn('flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-micro font-medium', i < step ? 'border-verified-border bg-verified-fill text-verified' : i === step ? 'border-primary bg-primary-tint text-primary' : 'border-line bg-surface text-muted')} aria-current={i === step ? 'step' : undefined}>
            {i < step ? <Check className="size-3.5" aria-hidden /> : <span className="tabular-nums">{i + 1}</span>}
            {s}
            {s === 'Owner approval' && <Avatar id="grace" size={16} />}
            {s === 'Partner approval' && <Avatar id="james" size={16} />}
          </li>
        ))}
      </ol>

      {state === 'changes' && (
        <Banner tone="info" icon={<MessageSquareQuote />} className="mb-4" title="Grace Wanjiku suggested changes (23 Sep)">
          “Please say ‘offtake, with a minority equity stake considered’.” · on Preferred structure
        </Banner>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Editor" subtitle="Fields pull from the released passport; owner name removed, location reduced to region">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Code name">{(p) => <Input {...p} value={a.code} readOnly className="font-mono" />}</Field>
              <Field label="Region">{(p) => <Input {...p} value={`${a.region}, ${a.country}`} readOnly />}</Field>
              <Field label="Commodity">{(p) => <Input {...p} value={a.commodity} readOnly />}</Field>
              <Field label="Stage">{(p) => <Input {...p} value={a.stage} readOnly />}</Field>
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-sm bg-sunken/60 p-3 text-meta">
              <TierBadge tier={a.tier} size="sm" />
              <FlagCounts counts={assetFlagCounts(a.id)} />
              <span className="text-micro text-muted">Auto from passport</span>
            </div>
            <div className={cn(state === 'changes' && 'rounded-sm ring-2 ring-disputed/40 ring-offset-4 ring-offset-surface')}>
              <ScreenedField label="Preferred structure" value={structure} onChange={setStructure} rows={1} />
            </div>
            <ScreenedField label="Capital sought" value={capital} onChange={setCapital} rows={1} />
            {highlights.map((h, i) => (
              <div key={i} className="space-y-2">
                <ScreenedField label={`Highlight ${i + 1}`} value={h} onChange={(v) => setHighlights((x) => x.map((y, j) => (j === i ? v : y)))} />
                <Select value={links[i]} onChange={(e) => setLinks((x) => x.map((y, j) => (j === i ? e.target.value : y)))} aria-label={`Claim for highlight ${i + 1}`}>
                  {claimsFor(a.id)
                    .filter((c) => c.status === 'verified' || c.status === 'in_review')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        Linked claim: {c.statement.slice(0, 70)}
                      </option>
                    ))}
                </Select>
              </div>
            ))}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Live preview" subtitle="Exactly as the investor will see it">
            <TeaserCard asset={preview} status="waiting" onInterested={() => {}} onNotNow={() => {}} onAsk={() => {}} sentOn="2026-09-24" />
            <ul className="mt-3 space-y-1.5 text-meta">
              {highlights.map((h, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  {h}
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Recipients" subtitle="Compliance gate per investor; a failure blocks only that recipient">
            <ul className="space-y-2">
              {recipients.map((r) => (
                <li key={r.inv.id} className="flex items-start gap-3 rounded-sm border border-line p-3">
                  {r.ok ? <CircleCheck className="mt-0.5 size-4.5 text-verified" aria-label="Pass" /> : <CircleX className="mt-0.5 size-4.5 text-critical" aria-label="Blocked" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-meta font-medium">{r.inv.name}</p>
                    <p className="text-micro text-muted">
                      {person(r.inv.contactId).name} · {r.note}
                    </p>
                  </div>
                  <Chip tone={r.ok ? 'verified' : 'critical'}>{r.ok ? 'Pass' : 'Blocked'}</Chip>
                </li>
              ))}
            </ul>
            {allHits.length > 0 && <RuleGateBanner level="warning" rule="R05 Promotional language" reason={`${allHits.length} phrase(s) to fix before owner approval.`} className="mt-3" compact />}
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              {step === 0 && (
                <Button icon={<Send />} disabled={allHits.length > 0} onClick={() => (setStep(1), toast.success('Sent to Grace Wanjiku for approval'))}>
                  Send for owner approval
                </Button>
              )}
              {step === 1 && (
                <Button icon={<Send />} disabled={allHits.length > 0} onClick={() => (setStep(2), toast.success('Resubmitted; owner approved v4 (demo)'))}>
                  Resubmit to owner
                </Button>
              )}
              {step >= 2 && step < 4 && (
                <Button onClick={() => setStep((s) => s + 1)} disabled={allHits.length > 0}>
                  {step === 2 ? 'Record partner approval' : 'Run compliance gate'}
                </Button>
              )}
              {step === 4 && (
                <Button icon={<Send />} onClick={() => toast.success(`Teaser sent to ${recipients.filter((r) => r.ok).length} investors · notices carry no deal details`)}>
                  Send to passing recipients
                </Button>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </Page>
  )
}
