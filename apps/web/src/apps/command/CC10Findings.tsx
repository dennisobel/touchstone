import { Check, Clock, FileText, Lock, MessageSquareMore, PencilLine, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { useDemoState } from '@/lib/demo-states'
import { daysUntil, fmtDate } from '@/lib/format'
import { person } from '@/data'
import { Banner, EmptyState, EvidenceChip, StatusStamp } from '@/ds/components'
import { Button, Chip, Textarea, toast } from '@/ds/ui'
import { Panel } from './common'
import { useAsset } from './CC04Asset'

const STATES = [
  { id: 'default', label: 'Disputes to resolve' },
  { id: 'none', label: 'No disputes' },
  { id: 'closed', label: 'Reply window closed' },
  { id: 'pending', label: 'Compliance review pending' },
] as const

interface Dispute {
  id: string
  workstream: string
  finding: string
  reply: string
  replyOn: string
  evidence: { docId: string; page?: number }[]
  ownerId: string
}

const DISPUTES: Record<string, Dispute[]> = {
  kakamega: [
    {
      id: 'd1',
      workstream: 'Environment and social',
      finding: 'No community development agreement exists; the county records one open complaint about water use at the processing site.',
      reply: 'We signed a memorandum with the ward committee in June 2026. The complaint was withdrawn on 12 Sep after we moved the settling pond. Letter attached.',
      replyOn: '2026-09-23',
      evidence: [{ docId: 'kb-d18', page: 1 }],
      ownerId: 'wekesa',
    },
    {
      id: 'd2',
      workstream: 'Environment and social',
      finding: 'Artisanal miners work 120 m inside the eastern boundary with no written arrangement.',
      reply: 'They are members of our cooperative scheme; the register of 23 members is attached.',
      replyOn: '2026-09-23',
      evidence: [{ docId: 'kb-d17', page: 18 }],
      ownerId: 'wekesa',
    },
  ],
  kiboko: [
    {
      id: 'd3',
      workstream: 'Technical and infrastructure',
      finding: 'The access road from the C103 is impassable for trucks during the long rains (April–May). Site-visit photos show washouts at two river crossings.',
      reply: 'Two culverts were installed in August 2026 and both crossings are now graded. Photos and the contractor invoice are attached.',
      replyOn: '2026-09-16',
      evidence: [{ docId: 'kb-d21', page: 2 }, { docId: 'kb-d17', page: 9 }],
      ownerId: 'grace',
    },
  ],
}

type Outcome = 'upheld' | 'revised' | 'more'

export default function CC10Findings() {
  const a = useAsset()
  const [state] = useDemoState('CC-10', STATES)
  const disputes = state === 'none' ? [] : (DISPUTES[a.id] ?? [])
  const [outcomes, setOutcomes] = useState<Record<string, { o: Outcome; note: string }>>({})
  const [draft, setDraft] = useState<Record<string, string>>({})
  const closes = a.replyUntil ?? '2026-09-30'
  const left = daysUntil(closes)
  const closed = state === 'closed'
  const pending = state === 'pending'

  return (
    <div className="space-y-4">
      {closed ? (
        <Banner tone="neutral" icon={<Lock />} title={`Owner reply window closed on ${fmtDate(closes)}`}>
          No new replies can be added. Resolve the remaining disputes, then request release.
        </Banner>
      ) : pending ? (
        <Banner tone="info" icon={<ShieldAlert />} title="Compliance review pending">
          Sarah Mitchell is reviewing the dispute outcomes before release. Decisions are read-only until then.
        </Banner>
      ) : (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 shadow-e1">
          <Clock className="size-5 text-review" aria-hidden />
          <p className="text-meta">
            Owner reply window closes <span className="font-semibold">{fmtDate(closes)}</span>
          </p>
          <Chip tone={left <= 2 ? 'review' : 'neutral'}>{left} days left</Chip>
          <span className="ml-auto text-micro text-muted">5 working days · M13-2</span>
        </div>
      )}

      {disputes.length === 0 ? (
        <EmptyState icon={<Check />} title="No disputes" body="The owner agreed with every finding, or has not replied yet. You can request release once the window closes." compact />
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            {disputes.map((d) => {
              const out = outcomes[d.id]
              return (
                <article key={d.id} className="overflow-hidden rounded-lg border border-line bg-surface shadow-e1">
                  <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2.5">
                    <StatusStamp status="disputed" />
                    <span className="text-micro text-muted">{d.workstream}</span>
                    {out && <Chip tone={out.o === 'upheld' ? 'critical' : out.o === 'revised' ? 'verified' : 'review'}>{out.o === 'upheld' ? 'Finding upheld' : out.o === 'revised' ? 'Finding revised' : 'More information requested'}</Chip>}
                  </div>
                  <div className="grid md:grid-cols-2">
                    <div className="border-b border-line p-4 md:border-r md:border-b-0">
                      <p className="text-micro font-semibold uppercase tracking-wide text-muted">Original finding</p>
                      <p className="mt-1.5 text-body">{d.finding}</p>
                    </div>
                    <div className="bg-disputed-fill/60 p-4">
                      <p className="text-micro font-semibold uppercase tracking-wide text-disputed">
                        {person(d.ownerId).name} replied · {fmtDate(d.replyOn)}
                      </p>
                      <p className="mt-1.5 text-body">{d.reply}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {d.evidence.map((e, i) => (
                          <EvidenceChip key={i} ev={e} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {!out && !pending && (
                    <div className="space-y-2 border-t border-line p-4">
                      <Textarea value={draft[d.id] ?? ''} onChange={(e) => setDraft((x) => ({ ...x, [d.id]: e.target.value }))} placeholder="Note for the record (shown to compliance)" aria-label="Decision note" rows={2} />
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setOutcomes((o) => ({ ...o, [d.id]: { o: 'upheld', note: draft[d.id] ?? '' } }))}>
                          Uphold
                        </Button>
                        <Button size="sm" variant="secondary" icon={<PencilLine />} onClick={() => setOutcomes((o) => ({ ...o, [d.id]: { o: 'revised', note: draft[d.id] ?? '' } }))}>
                          Revise
                        </Button>
                        <Button size="sm" variant="secondary" icon={<MessageSquareMore />} disabled={closed} onClick={() => setOutcomes((o) => ({ ...o, [d.id]: { o: 'more', note: draft[d.id] ?? '' } }))}>
                          Request more information
                        </Button>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
          <Panel title="Changes before release">
            {Object.keys(outcomes).length === 0 ? (
              <p className="text-meta text-muted">Decide each dispute to build the change list.</p>
            ) : (
              <ul className="space-y-2 text-meta">
                {disputes
                  .filter((d) => outcomes[d.id])
                  .map((d) => (
                    <li key={d.id} className="flex gap-2">
                      <FileText className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
                      {outcomes[d.id].o === 'revised'
                        ? `Revise finding (${d.workstream}) and attach the owner's evidence`
                        : outcomes[d.id].o === 'upheld'
                          ? `Keep finding (${d.workstream}); show the owner's reply beside it`
                          : `Send follow-up request to ${person(d.ownerId).name}`}
                    </li>
                  ))}
              </ul>
            )}
            <Button block className="mt-4" disabled={Object.keys(outcomes).length < disputes.length} onClick={() => toast.success('Sent to compliance review')}>
              Send to compliance
            </Button>
          </Panel>
        </div>
      )}
    </div>
  )
}
