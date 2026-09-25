import { useState } from 'react'
import { Button, Sheet, toast } from '@/ds/ui'
import { useDemo } from '@/lib/store'
import { dealRooms, introductions, investor, person, type DealRoom, type Introduction } from '@/data'

const ORG = { rachel: 'brightwater', marcus: 'cedar-peak' } as const
const ZONE = { rachel: 'ET', marcus: 'MT' } as const

/** The signed-in investor persona, their organisation, teasers and deal rooms (demo state aware). */
export function useInvestorCtx() {
  const persona = useDemo((s) => s.investorPersona)
  const ndas = useDemo((s) => s.ndas)
  const responses = useDemo((s) => s.teaserResponses)
  const follows = useDemo((s) => s.follows)
  const orgId = ORG[persona]
  const org = investor(orgId)
  const me = person(persona)
  const hasNda = (assetId: string) => !!ndas[`${orgId}:${assetId}`]
  const intros: Introduction[] = introductions
    .filter((i) => i.investorId === orgId)
    .map((i) => {
      const r = responses[`${orgId}:${i.assetId}`]
      if (hasNda(i.assetId) && ['teaser_sent', 'opened', 'interested'].includes(i.status)) return { ...i, status: 'nda_signed' as const }
      if (r === 'not_now') return { ...i, status: 'not_now' as const }
      if (r === 'interested' && ['teaser_sent', 'opened'].includes(i.status)) return { ...i, status: 'interested' as const }
      return i
    })
  const waiting = intros.filter((i) => i.status === 'teaser_sent' || i.status === 'opened')
  const rooms: DealRoom[] = [
    ...dealRooms.filter((r) => r.investorId === orgId),
    ...Object.keys(ndas)
      .filter((k) => k.startsWith(`${orgId}:`) && ndas[k])
      .map((k) => k.split(':')[1])
      .filter((assetId) => !dealRooms.some((r) => r.investorId === orgId && r.assetId === assetId))
      .map((assetId) => ({ id: `dr-${assetId}-${orgId}`, assetId, investorId: orgId, ndaOn: '2026-09-24', expires: '2026-12-24', documents: 86, openQuestions: 0, activity: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], status: 'open' as const })),
  ]
  return { persona, orgId, org, me, zone: ZONE[persona], hasNda, intros, waiting, rooms, follows }
}

const REASONS = ['Outside our commodity focus', 'Stage too early', 'Ticket size does not fit', 'Jurisdiction', 'ESG concerns', 'Timing']

/** "Not now" with an optional reason list; one click, no pressure (UI PRD §4 Flow C). */
export function NotNowSheet({ open, onOpenChange, onDone }: { open: boolean; onOpenChange: (v: boolean) => void; onDone: (reason?: string) => void }) {
  const [reason, setReason] = useState<string | undefined>()
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Not now"
      description="Tell us why (optional). It helps SSD send better teasers."
      desktop="center"
      size="sm"
      footer={
        <Button
          block
          onClick={() => {
            onDone(reason)
            toast('Marked Not now · the teaser is archived')
          }}
        >
          Done
        </Button>
      }
    >
      <div className="flex flex-wrap gap-2">
        {REASONS.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={reason === r}
            onClick={() => setReason(reason === r ? undefined : r)}
            className={`pressable h-10 rounded-full border px-3.5 text-meta ${reason === r ? 'border-primary bg-primary-tint text-primary' : 'border-line bg-surface'}`}
          >
            {r}
          </button>
        ))}
      </div>
    </Sheet>
  )
}
