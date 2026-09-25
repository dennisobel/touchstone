import { Check, CircleCheck, CircleX, EyeOff, HelpCircle, Send, Star, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { cn } from '@/lib/cn'
import { useDemoState } from '@/lib/demo-states'
import { fmtDate } from '@/lib/format'
import { useIsDesktop } from '@/lib/hooks'
import { assets, flagsFor, INTRO_STATUS_LABEL, introFor, investors, TIER_LABEL, type Asset, type Investor } from '@/data'
import { Banner, RuleGateBanner, TierBadge } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Button, Chip, Select, Sheet, Textarea, toast } from '@/ds/ui'

const STATES = [
  { id: 'default', label: 'Default' },
  { id: 'failing', label: 'Pre-check failing' },
] as const

type Mark = 'yes' | 'no' | 'maybe'
function fit(a: Asset, i: Investor): { field: string; mark: Mark; why: string }[] {
  const commodity = i.mandate.commodities.some((c) => a.commodity.toLowerCase().includes(c.toLowerCase().split(' ')[0]))
  const stage = i.mandate.stages.some((s) => a.stage.toLowerCase().includes(s.toLowerCase()))
  const m = a.capitalSought?.match(/(\d+)–(\d+)/)
  const [lo, hi] = m ? [Number(m[1]), Number(m[2])] : [0, 0]
  const ticket = m ? lo <= i.mandate.ticket[1] && hi >= i.mandate.ticket[0] : false
  const country = i.mandate.countries.includes(a.country)
  const artisanal = flagsFor(a.id).some((f) => f.workstream === 'esg' && f.status !== 'resolved')
  const esgStrict = i.mandate.esg.length > 0
  return [
    { field: 'Commodity', mark: commodity ? 'yes' : 'no', why: commodity ? `${a.commodity} is in the mandate` : `${a.commodity} is not in the mandate` },
    { field: 'Stage', mark: stage ? 'yes' : 'maybe', why: stage ? `${a.stage} matches` : `${a.stage} is adjacent to the mandate's stages` },
    { field: 'Ticket', mark: ticket ? 'yes' : 'no', why: m ? `Capital sought USD ${lo}–${hi}m vs ticket USD ${i.mandate.ticket[0]}–${i.mandate.ticket[1]}m` : 'No capital sought stated' },
    { field: 'Country', mark: country ? 'yes' : 'no', why: country ? `${a.country} is in the mandate` : `${a.country} is outside the mandate` },
    { field: 'ESG', mark: artisanal && esgStrict ? 'maybe' : 'yes', why: artisanal && esgStrict ? 'Open ESG flag to check against the ESG limits' : 'No conflict with ESG limits' },
  ]
}

const MarkIcon = ({ m }: { m: Mark }) =>
  m === 'yes' ? <Check className="size-3.5 text-verified" aria-label="matches" /> : m === 'no' ? <X className="size-3.5 text-critical" aria-label="does not match" /> : <HelpCircle className="size-3.5 text-review" aria-label="check" />

export default function CC14Matching() {
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()
  const [state] = useDemoState('CC-14', STATES)
  const [commodity, setCommodity] = useState('all')
  const [tier, setTier] = useState('all')
  const [cell, setCell] = useState<{ a: Asset; i: Investor } | null>(null)
  const [shortlist, setShortlist] = useState<string[]>([])
  const [notFitOpen, setNotFitOpen] = useState(false)
  const rows = useMemo(() => assets.filter((a) => (a.passport.status === 'released' || a.id === 'kakamega') && (commodity === 'all' || a.commodityKey === commodity) && (tier === 'all' || a.tier === tier)), [commodity, tier])
  const cols = investors.filter((i) => i.status === 'qualified' || i.status === 'on_hold')

  const precheck = (a: Asset, i: Investor) => {
    const failing = state === 'failing' && i.id === 'hargrove'
    return [
      { label: 'Investor qualified', ok: i.status === 'qualified', detail: i.qualifiedOn ? `Since ${fmtDate(i.qualifiedOn)}` : 'On hold' },
      { label: 'Relationship record predates teaser', ok: !failing, detail: failing ? 'Latest review 21 Jul; re-qualification due (12 months)' : `First review ${fmtDate(i.reviews[0].date)}` },
      { label: 'Owner consent to teaser wording', ok: a.id !== 'kakamega', detail: a.id === 'kakamega' ? 'Passport not released' : 'Approved wording on file' },
      { label: 'Disclosure level L2 ready', ok: a.passport.status === 'released', detail: a.passport.status === 'released' ? `v${a.passport.version} released` : 'Draft' },
      { label: 'No conflict of interest', ok: true, detail: 'None declared by SSD staff' },
    ]
  }

  const Cell = ({ a, i }: { a: Asset; i: Investor }) => {
    const f = fit(a, i)
    const intro = introFor(a.id, i.id)
    const hold = i.status === 'on_hold'
    return (
      <button
        type="button"
        onClick={() => setCell({ a, i })}
        className={cn('pressable w-full rounded-sm border p-2 text-left hover:border-primary', shortlist.includes(`${a.id}:${i.id}`) ? 'border-primary bg-primary-tint/60' : 'border-line bg-surface', hold && 'opacity-50')}
      >
        <ul className="grid grid-cols-1 gap-0.5 text-[11px]">
          {f.map((x) => (
            <li key={x.field} className="flex items-center justify-between gap-1">
              <span className="text-muted">{x.field}</span>
              <MarkIcon m={x.mark} />
            </li>
          ))}
        </ul>
        {intro && (
          <Chip size="sm" tone={intro.status === 'not_now' || intro.status === 'expired' ? 'neutral' : 'primary'} className="mt-1.5">
            {INTRO_STATUS_LABEL[intro.status]}
          </Chip>
        )}
        {hold && <Chip size="sm" className="mt-1.5">Investor on hold</Chip>}
      </button>
    )
  }

  return (
    <Page title="Matching board" large>
      <Banner tone="neutral" icon={<EyeOff />} className="mb-4" title="Internal: never shown to investors">
        Fit is shown as matching fields, never a score. Investors see only teasers SSD sends.
      </Banner>
      <div className="mb-3 flex flex-wrap gap-2">
        <Select value={commodity} onChange={(e) => setCommodity(e.target.value)} aria-label="Commodity" className="md:w-44">
          <option value="all">All commodities</option>
          <option value="graphite">Graphite</option>
          <option value="gold">Gold</option>
          <option value="heavy_sands">Heavy mineral sands</option>
        </Select>
        <Select aria-label="Country" className="md:w-36" defaultValue="KE">
          <option value="KE">Kenya</option>
        </Select>
        <Select value={tier} onChange={(e) => setTier(e.target.value)} aria-label="Tier" className="md:w-44">
          <option value="all">All tiers</option>
          {(['standard', 'investor_ready'] as const).map((t) => (
            <option key={t} value={t}>
              {TIER_LABEL[t]}
            </option>
          ))}
        </Select>
      </div>

      {isDesktop ? (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface shadow-e1">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line">
                <th className="sticky left-0 z-10 w-64 bg-surface px-3 py-2 text-micro font-medium uppercase tracking-wide text-muted">Asset</th>
                {cols.map((i) => (
                  <th key={i.id} className="min-w-44 px-2 py-2 text-micro font-medium text-muted">
                    <span className="block text-meta font-semibold text-fg">{i.name}</span>
                    <span className="block">USD {i.mandate.ticket[0]}–{i.mandate.ticket[1]}m · {i.mandate.commodities.slice(0, 2).join(', ')}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-line/70 align-top last:border-0">
                  <th scope="row" className="sticky left-0 z-10 bg-surface px-3 py-3 text-left font-normal">
                    <span className="block text-meta font-semibold">{a.name}</span>
                    <span className="mt-0.5 block font-mono text-[11px] text-muted">{a.code}</span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <TierBadge tier={a.tier} size="sm" />
                      <span className="text-[11px] text-muted">{a.capitalSought ?? 'Not released'}</span>
                    </span>
                  </th>
                  {cols.map((i) => (
                    <td key={i.id} className="px-2 py-2">
                      <Cell a={a} i={i} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((a) => (
            <li key={a.id} className="rounded-lg border border-line bg-surface p-3 shadow-e1">
              <p className="text-meta font-semibold">{a.name}</p>
              <p className="text-micro text-muted">
                {a.code} · {a.capitalSought ?? 'Not released'}
              </p>
              <div className="no-scrollbar -mx-3 mt-2 flex snap-x gap-2 overflow-x-auto px-3">
                {cols.map((i) => (
                  <div key={i.id} className="w-40 shrink-0 snap-start">
                    <p className="mb-1 truncate text-micro font-medium">{i.name}</p>
                    <Cell a={a} i={i} />
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Sheet
        open={!!cell}
        onOpenChange={(o) => !o && setCell(null)}
        title={cell ? `${cell.a.name} × ${cell.i.name}` : ''}
        description="Fit reasons, conflicts and compliance pre-check"
        footer={
          cell && (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" icon={<Star />} onClick={() => (setShortlist((s) => [...s, `${cell.a.id}:${cell.i.id}`]), toast.success('Shortlisted'))}>
                Shortlist
              </Button>
              <Button
                icon={<Send />}
                disabled={precheck(cell.a, cell.i).some((p) => !p.ok)}
                onClick={() => {
                  toast.success('Proposed to James Whitfield for partner approval')
                  navigate(`/command/matching/teaser/${cell.a.id}`, { viewTransition: true })
                }}
              >
                Propose introduction
              </Button>
              <Button variant="ghost" onClick={() => setNotFitOpen(true)}>
                Not a fit
              </Button>
            </div>
          )
        }
      >
        {cell && (
          <div className="space-y-5">
            <section>
              <p className="mb-2 text-micro font-semibold uppercase tracking-wide text-muted">Matching fields</p>
              <ul className="space-y-2">
                {fit(cell.a, cell.i).map((x) => (
                  <li key={x.field} className="flex items-start gap-2 text-meta">
                    <span className="mt-1">
                      <MarkIcon m={x.mark} />
                    </span>
                    <span>
                      <span className="font-medium">{x.field}: </span>
                      {x.why}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <p className="mb-2 text-micro font-semibold uppercase tracking-wide text-muted">Compliance pre-check</p>
              {precheck(cell.a, cell.i).some((p) => !p.ok) && (
                <RuleGateBanner
                  level="hard_stop"
                  rule={cell.i.id === 'hargrove' && state === 'failing' ? 'R01 Relationship first' : 'R07 Owner consent'}
                  reason="A pre-check item fails. Fix it before proposing an introduction."
                  className="mb-3"
                  compact
                />
              )}
              <ul className="space-y-2">
                {precheck(cell.a, cell.i).map((p) => (
                  <li key={p.label} className="flex items-start gap-2 text-meta">
                    {p.ok ? <CircleCheck className="mt-0.5 size-4 text-verified" aria-label="Pass" /> : <CircleX className="mt-0.5 size-4 text-critical" aria-label="Fail" />}
                    <span>
                      <span className="font-medium">{p.label}</span>
                      <span className="block text-micro text-muted">{p.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <p className="mb-2 text-micro font-semibold uppercase tracking-wide text-muted">Conflicts</p>
              <p className="text-meta text-muted">None declared. James Whitfield owns this relationship.</p>
            </section>
          </div>
        )}
      </Sheet>
      <Sheet open={notFitOpen} onOpenChange={setNotFitOpen} title="Not a fit" desktop="center" size="sm" footer={<Button block onClick={() => (setNotFitOpen(false), setCell(null), toast('Recorded; refines matching rules'))}>Save</Button>}>
        <Textarea placeholder="Reason (refines matching rules)" aria-label="Reason" />
      </Sheet>
    </Page>
  )
}
