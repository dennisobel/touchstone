import { CircleCheck, FilePlus2, Flag, Lock, MessageSquareMore, OctagonAlert, UserPlus } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { cn } from '@/lib/cn'
import { useDemoState } from '@/lib/demo-states'
import { fmtDateTime, NOW } from '@/lib/format'
import { useHotkeys, useIsDesktop } from '@/lib/hooks'
import { useDemo } from '@/lib/store'
import { claimsFor, doc, EVIDENCE_LEVELS, person, WORKSTREAMS, type Claim, type ClaimStatus, type EvidenceLevel, type WorkstreamId } from '@/data'
import { Banner, ClaimRow, DocumentViewer, EmptyState, EvidenceBadge } from '@/ds/components'
import { Button, Checkbox, Kbd, RadioGroup, Select, Sheet, Textarea, toast } from '@/ds/ui'
import { useAsset } from './CC04Asset'

const STATES = [
  { id: 'default', label: 'Default' },
  { id: 'missing', label: 'Evidence missing' },
  { id: 'low', label: 'AI extraction low confidence' },
  { id: 'locked', label: 'Locked: in findings review' },
] as const

export default function CC05Workbench() {
  const a = useAsset()
  const [params, setParams] = useSearchParams()
  const [state] = useDemoState('CC-05', STATES)
  const persona = useDemo((s) => s.commandPersona)
  const isDesktop = useIsDesktop()
  const all = claimsFor(a.id)
  const wsParam = (params.get('ws') as WorkstreamId | null) ?? (all[0]?.workstream ?? 'title')
  const [overrides, setOverrides] = useState<Record<string, { status: ClaimStatus; level?: EvidenceLevel; by?: string; at?: string }>>({})
  const claims = useMemo(() => all.filter((c) => c.workstream === wsParam).map((c) => (overrides[c.id] ? { ...c, ...overrides[c.id], verifierId: overrides[c.id].by ?? c.verifierId, verifiedOn: overrides[c.id].at ?? c.verifiedOn } : c)), [all, wsParam, overrides])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [actionOpen, setActionOpen] = useState<null | 'discrepancy' | 'request' | 'flag' | 'expert'>(null)
  const refs = useRef<Record<string, HTMLDivElement | null>>({})
  const locked = state === 'locked'

  // Demo states pick an illustrative claim.
  useEffect(() => {
    if (state === 'missing') {
      setParams((p) => (p.set('ws', 'title'), p), { replace: true })
      setActiveId('kb-t6')
    } else if (state === 'low') {
      setParams((p) => (p.set('ws', 'title'), p), { replace: true })
      setActiveId('kb-t1')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  useEffect(() => {
    if (!claims.find((c) => c.id === activeId)) setActiveId(claims[0]?.id ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsParam])

  const active = claims.find((c) => c.id === activeId) ?? claims[0]
  const idx = active ? claims.indexOf(active) : -1
  const ev = state === 'low' ? { docId: 'kb-d01', page: 1, region: 'Licence particulars' } : active?.evidence[0]
  const document = ev ? doc(ev.docId) : undefined

  const move = (d: number) => {
    const next = claims[Math.max(0, Math.min(claims.length - 1, idx + d))]
    if (next) {
      setActiveId(next.id)
      refs.current[next.id]?.scrollIntoView({ block: 'nearest' })
    }
  }
  const act = (fn: () => void) => () => {
    if (locked) return toast('Claim is locked while the owner reviews findings')
    fn()
  }
  useHotkeys(
    {
      j: () => move(1),
      k: () => move(-1),
      v: act(() => setVerifyOpen(true)),
      d: act(() => setActionOpen('discrepancy')),
      r: act(() => setActionOpen('request')),
      f: act(() => setActionOpen('flag')),
      e: act(() => setActionOpen('expert')),
    },
    !verifyOpen && !actionOpen,
  )

  const counts = (ws: WorkstreamId) => all.filter((c) => c.workstream === ws).length

  const actions = active && (
    <div className="flex flex-wrap gap-1.5">
      <Button size="sm" variant="success" icon={<CircleCheck />} disabled={locked} onClick={() => setVerifyOpen(true)}>
        Verify <Kbd className="ml-1 hidden border-white/30 bg-white/15 text-white md:inline-flex">V</Kbd>
      </Button>
      <Button size="sm" variant="secondary" icon={<OctagonAlert />} disabled={locked} onClick={() => setActionOpen('discrepancy')}>
        Discrepancy <Kbd className="ml-1 hidden md:inline-flex">D</Kbd>
      </Button>
      <Button size="sm" variant="secondary" icon={<MessageSquareMore />} disabled={locked} onClick={() => setActionOpen('request')}>
        Request info <Kbd className="ml-1 hidden md:inline-flex">R</Kbd>
      </Button>
      <Button size="sm" variant="secondary" icon={<Flag />} disabled={locked} onClick={() => setActionOpen('flag')}>
        Raise flag <Kbd className="ml-1 hidden md:inline-flex">F</Kbd>
      </Button>
      <Button size="sm" variant="secondary" icon={<UserPlus />} disabled={locked} onClick={() => setActionOpen('expert')}>
        Assign expert <Kbd className="ml-1 hidden md:inline-flex">E</Kbd>
      </Button>
    </div>
  )

  const viewer = (
    <div className="flex h-full min-h-0 flex-col">
      {!ev || !document ? (
        <EmptyState
          icon={<FilePlus2 />}
          title="Evidence missing"
          body="This claim has no supporting document yet. Request it from the owner, or attach a registry capture."
          action={
            <Button variant="secondary" icon={<MessageSquareMore />} onClick={() => setActionOpen('request')}>
              Request from owner
            </Button>
          }
          className="m-4"
        />
      ) : (
        <DocumentViewer key={`${active?.id}-${state}`} document={document} page={ev.page} region={ev.region} viewer={{ name: person(persona).name, org: 'SSD', email: person(persona).email }} editable={!locked} />
      )}
    </div>
  )

  return (
    <div className="space-y-3">
      {locked && (
        <Banner tone="neutral" icon={<Lock />} title="In findings review until 23 Oct 2026">
          Claims are locked while the owner reviews draft findings. Replies appear under Findings.
        </Banner>
      )}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,45fr)_minmax(0,55fr)]">
        {/* Claims ledger */}
        <section className="min-w-0 overflow-hidden rounded-lg border border-line bg-surface shadow-e1" aria-label="Claims ledger">
          <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
            <Select value={wsParam} onChange={(e) => setParams((p) => (p.set('ws', e.target.value), p), { replace: true })} aria-label="Workstream" className="md:w-64">
              {WORKSTREAMS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({counts(w.id)})
                </option>
              ))}
            </Select>
            <span className="ml-auto hidden text-micro text-muted xl:inline">
              <Kbd>J</Kbd> <Kbd>K</Kbd> move
            </span>
          </div>
          <div className="max-h-[calc(100dvh-300px)] min-h-64 overflow-y-auto" role="list">
            {claims.length === 0 && <p className="p-4 text-meta text-muted">No claims in this workstream yet.</p>}
            {claims.map((c) => (
              <div key={c.id} role="listitem">
                <ClaimRow
                  ref={(el) => void (refs.current[c.id] = el)}
                  claim={c}
                  active={c.id === active?.id}
                  expanded={c.id === active?.id}
                  onToggle={() => {
                    setActiveId(c.id)
                    if (!isDesktop) setMobileOpen(true)
                  }}
                  actions={isDesktop ? actions : undefined}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Evidence viewer (desktop) */}
        {isDesktop && <section className="min-w-0 overflow-hidden rounded-lg border border-line bg-surface shadow-e1 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-100px)]">{viewer}</section>}
      </div>

      {/* Phones: claim + evidence in a bottom sheet */}
      {!isDesktop && active && (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen} title={active.statement} description={`${EVIDENCE_LEVELS[active.level].code} ${EVIDENCE_LEVELS[active.level].name}`} bodyClassName="px-0" footer={actions}>
          {viewer}
        </Sheet>
      )}

      <VerifySheet
        open={verifyOpen}
        claim={active}
        onClose={() => setVerifyOpen(false)}
        onVerify={(level) => {
          if (!active) return
          setOverrides((o) => ({ ...o, [active.id]: { status: 'verified', level, by: persona, at: '2026-09-24' } }))
          setVerifyOpen(false)
          toast.success(`Verified by ${person(persona).name} · ${fmtDateTime(NOW)}`)
          move(1)
        }}
      />
      <ActionSheet
        kind={actionOpen}
        claim={active}
        onClose={() => setActionOpen(null)}
        onDone={(kind) => {
          if (active && kind === 'discrepancy') setOverrides((o) => ({ ...o, [active.id]: { status: 'discrepancy' } }))
          setActionOpen(null)
        }}
      />
    </div>
  )
}

function VerifySheet({ open, claim, onClose, onVerify }: { open: boolean; claim?: Claim; onClose: () => void; onVerify: (level: EvidenceLevel) => void }) {
  const [method, setMethod] = useState<'2' | '3' | '4'>('2')
  const [chosen, setChosen] = useState<string[]>([])
  useEffect(() => {
    if (open && claim) {
      setChosen(claim.evidence.map((e) => e.docId))
      setMethod(String(Math.max(2, Math.min(4, claim.level))) as '2' | '3' | '4')
    }
  }, [open, claim])
  if (!claim) return null
  return (
    <Sheet
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title="Verify claim"
      description={claim.statement}
      desktop="center"
      size="md"
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-micro text-muted">Records your name and time. AI cannot verify claims.</p>
          <Button variant="success" icon={<CircleCheck />} disabled={chosen.length === 0} onClick={() => onVerify(Number(method) as EvidenceLevel)}>
            Verify
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-meta font-semibold">Method</p>
          <RadioGroup
            name="method"
            value={method}
            onValueChange={setMethod}
            variant="cards"
            options={[
              { value: '2', label: <span className="inline-flex items-center gap-2"><EvidenceBadge level={2} /> Cross-checked against an independent source</span> },
              { value: '3', label: <span className="inline-flex items-center gap-2"><EvidenceBadge level={3} /> Expert-verified (signed opinion on file)</span> },
              { value: '4', label: <span className="inline-flex items-center gap-2"><EvidenceBadge level={4} /> Field-verified (tamper-evident capture)</span> },
            ]}
          />
        </div>
        <div>
          <p className="mb-2 text-meta font-semibold">Evidence relied on</p>
          {claim.evidence.length === 0 && <p className="text-meta text-critical">No evidence attached. Add evidence before verifying.</p>}
          {claim.evidence.map((e) => {
            const d = doc(e.docId)
            return (
              <Checkbox
                key={e.docId}
                checked={chosen.includes(e.docId)}
                onCheckedChange={(v) => setChosen((c) => (v ? [...c, e.docId] : c.filter((x) => x !== e.docId)))}
                label={d?.name ?? e.docId}
                description={`${d?.type} · page ${e.page ?? 1}${e.region ? ` · ${e.region}` : ''}`}
              />
            )
          })}
        </div>
      </div>
    </Sheet>
  )
}

function ActionSheet({ kind, claim, onClose, onDone }: { kind: null | 'discrepancy' | 'request' | 'flag' | 'expert'; claim?: Claim; onClose: () => void; onDone: (k: string) => void }) {
  const [text, setText] = useState('')
  const [sev, setSev] = useState('medium')
  useEffect(() => setText(''), [kind])
  if (!claim || !kind) return null
  const titles = { discrepancy: 'Mark discrepancy', request: 'Request information from the owner', flag: 'Raise a red flag', expert: 'Assign an expert' }
  return (
    <Sheet
      open={!!kind}
      onOpenChange={(o) => !o && onClose()}
      title={titles[kind]}
      description={claim.statement}
      desktop="center"
      footer={
        <Button
          block
          disabled={kind !== 'expert' && !text}
          onClick={() => {
            toast.success(
              { discrepancy: 'Marked as Discrepancy · owner sees it in findings', request: 'Request sent · reminders at 3 days and 1 day', flag: 'Flag raised · compliance notified', expert: 'Offer sent to Dr Nomvula Dlamini' }[kind],
            )
            onDone(kind)
          }}
        >
          {kind === 'expert' ? 'Send offer' : 'Save'}
        </Button>
      }
    >
      <div className="space-y-3">
        {kind === 'flag' && (
          <RadioGroup
            name="sev"
            value={sev}
            onValueChange={setSev}
            options={[
              { value: 'critical', label: 'Critical', description: 'Could void title or create legal liability. Blocks release.' },
              { value: 'high', label: 'High', description: 'Material risk to value or timeline. Shown at the top of the passport.' },
              { value: 'medium', label: 'Medium', description: 'Needs attention during diligence.' },
              { value: 'low', label: 'Low', description: 'Housekeeping.' },
            ]}
          />
        )}
        {kind === 'expert' ? (
          <div className="space-y-2">
            {['nomvula', 'amani', 'wanjiru', 'faith'].map((p) => (
              <label key={p} className="flex items-center gap-3 rounded-sm border border-line p-3">
                <input type="radio" name="expert" defaultChecked={p === 'nomvula'} className="size-4 accent-[var(--primary)]" />
                <span className="flex-1">
                  <span className="block text-meta font-medium">{person(p).name}</span>
                  <span className="block text-micro text-muted">{person(p).role} · no declared conflicts</span>
                </span>
              </label>
            ))}
          </div>
        ) : (
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder={kind === 'request' ? 'Question, why it matters, accepted formats and due date' : kind === 'discrepancy' ? 'What conflicts, and with which source' : 'Plain-English description investors will read'}
            aria-label="Details"
            className={cn(kind === 'request' && 'font-normal')}
          />
        )}
      </div>
    </Sheet>
  )
}
