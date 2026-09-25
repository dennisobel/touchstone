import { CircleCheck, CircleSlash, Send, Star, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/cn'
import { money } from '@/lib/format'
import { KIND_LABEL, network, person, type NetworkMember } from '@/data'
import { Avatar, Button, Chip, toast } from '@/ds/ui'

export interface AssignTask {
  id: string
  title: string
  assetName: string
  jurisdiction: string
  commodity: string
  kind: NetworkMember['kind']
  deadline: string
}

// Conflicts declared in the network's conflicts register (sample).
const CONFLICTS: Record<string, string> = { amani: 'Prior paid work for the holder (2024 soil sampling)' }

/** Ranked available people with reasons and conflicts; send an offer (CC-09, reused in CC-21). */
export function AssignmentTool({ task }: { task: AssignTask }) {
  const [sent, setSent] = useState<string | null>(null)
  const ranked = network
    .filter((n) => n.kind === task.kind || (task.kind === 'resource_geologist' && n.kind === 'resource_geologist'))
    .map((n) => {
      const reasons: { ok: boolean; text: string }[] = [
        { ok: n.jurisdictions.includes(task.jurisdiction), text: n.jurisdictions.includes(task.jurisdiction) ? `Works in ${task.jurisdiction}` : `Not registered for ${task.jurisdiction}` },
        { ok: n.commodities.includes('All') || n.commodities.includes(task.commodity), text: n.commodities.includes('All') || n.commodities.includes(task.commodity) ? `${task.commodity} experience` : `No ${task.commodity} experience` },
        { ok: n.availability !== 'unavailable', text: n.availability === 'available' ? 'Available' : n.availability === 'limited' ? `Limited: ${n.active} active` : 'Unavailable' },
        { ok: n.credentialStatus === 'verified', text: n.credentialStatus === 'verified' ? 'Credentials verified' : 'Credential expired' },
      ]
      const conflict = CONFLICTS[n.personId]
      const score = reasons.filter((r) => r.ok).length * 10 + n.rating - n.reworkRate * 10 - (conflict ? 25 : 0)
      return { n, reasons, conflict, score }
    })
    .sort((x, y) => y.score - x.score)

  return (
    <ol className="space-y-2.5">
      {ranked.map(({ n, reasons, conflict }, i) => {
        const p = person(n.personId)
        const blocked = n.credentialStatus !== 'verified' || n.availability === 'unavailable'
        return (
          <li key={n.personId} className={cn('rounded-lg border bg-surface p-4 shadow-e1', i === 0 && !blocked && !conflict ? 'border-primary/50' : 'border-line', blocked && 'opacity-70')}>
            <div className="flex flex-wrap items-start gap-3">
              <span className="mt-1 w-5 text-center text-micro font-semibold tabular-nums text-muted">{i + 1}</span>
              <Avatar id={n.personId} size={40} />
              <div className="min-w-0 flex-1">
                <p className="text-meta font-semibold">
                  {p.name}
                  {i === 0 && !blocked && !conflict && (
                    <Chip tone="primary" size="sm" className="ml-2">
                      Best fit
                    </Chip>
                  )}
                </p>
                <p className="text-micro text-muted">
                  {KIND_LABEL[n.kind]} · {p.credentialBody} {p.credential} · {money('USD', n.rateUsd)} per {n.rateUnit}
                </p>
                <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  {reasons.map((r) => (
                    <li key={r.text} className={cn('inline-flex items-center gap-1 text-micro', r.ok ? 'text-fg' : 'text-critical')}>
                      {r.ok ? <CircleCheck className="size-3.5 text-verified" aria-hidden /> : <CircleSlash className="size-3.5" aria-hidden />}
                      {r.text}
                    </li>
                  ))}
                  <li className="inline-flex items-center gap-1 text-micro text-muted">
                    <Star className="size-3.5" aria-hidden /> {n.rating.toFixed(1)} · {n.turnaroundDays} d turnaround · {Math.round(n.reworkRate * 100)}% rework
                  </li>
                </ul>
                {conflict && (
                  <p className="mt-2 inline-flex items-start gap-1.5 rounded-sm bg-review-fill px-2 py-1 text-micro text-fg">
                    <TriangleAlert className="mt-px size-3.5 shrink-0 text-review" aria-hidden />
                    Declared conflict: {conflict}. Compliance must clear it in writing (R12).
                  </p>
                )}
              </div>
              <Button
                size="sm"
                variant={i === 0 && !conflict ? 'primary' : 'secondary'}
                icon={<Send />}
                disabled={blocked || !!conflict || !!sent}
                onClick={() => {
                  setSent(n.personId)
                  toast.success(`Offer sent to ${p.name} · scope, fee and deadline ${task.deadline}`)
                }}
              >
                {sent === n.personId ? 'Offer sent' : 'Send offer'}
              </Button>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
