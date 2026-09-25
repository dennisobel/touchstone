import { ChevronRight, FolderLock, Inbox, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useDemoState } from '@/lib/demo-states'
import { daysUntil, fmtDate } from '@/lib/format'
import { useDemo } from '@/lib/store'
import { asset, INTRO_STATUS_LABEL } from '@/data'
import { EmptyState, TeaserCard, TierBadge } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Chip, Segmented } from '@/ds/ui'
import { NotNowSheet, useInvestorCtx } from './common'

/** Opportunities: every teaser SSD has sent, with its status. No ranking, no urgency. */
export default function Opportunities() {
  const navigate = useNavigate()
  const [state] = useDemoState('IP-OPP', [
    { id: 'default', label: 'Default' },
    { id: 'none', label: 'No teasers yet' },
  ] as const)
  const { intros, orgId } = useInvestorCtx()
  const respond = useDemo((s) => s.respondTeaser)
  const [tab, setTab] = useState<'waiting' | 'all'>('waiting')
  const [notNow, setNotNow] = useState<string | null>(null)
  const list = state === 'none' ? [] : tab === 'waiting' ? intros.filter((i) => i.status === 'teaser_sent' || i.status === 'opened') : intros

  return (
    <Page title="Opportunities" large subtitle="Teasers SSD has sent you. Sorted by date received; nothing is ranked.">
      <Segmented
        ariaLabel="Filter"
        value={tab}
        onChange={setTab}
        className="mb-4"
        options={[
          { value: 'waiting', label: 'Waiting for you' },
          { value: 'all', label: 'All teasers', count: intros.length },
        ]}
      />
      {list.length === 0 ? (
        <EmptyState icon={<Inbox />} title="Nothing waiting" body="SSD sends only opportunities with released passports that match your mandate." contactId="james" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((i) => {
            const waiting = i.status === 'teaser_sent' || i.status === 'opened'
            return (
              <div key={i.id} className="space-y-1.5">
                <TeaserCard
                  asset={asset(i.assetId)}
                  status={waiting ? 'waiting' : i.status === 'not_now' ? 'not_now' : 'interested'}
                  sentOn={i.teaserSentOn}
                  onOpen={() => navigate(`/investor/teasers/${i.assetId}`, { viewTransition: true })}
                  onInterested={waiting ? () => (respond(`${orgId}:${i.assetId}`, 'interested'), navigate(`/investor/teasers/${i.assetId}/nda`, { viewTransition: true })) : undefined}
                  onNotNow={waiting ? () => setNotNow(i.assetId) : undefined}
                />
                {!waiting && <p className="px-1 text-micro text-muted">Status: {INTRO_STATUS_LABEL[i.status]}</p>}
              </div>
            )
          })}
        </div>
      )}
      <NotNowSheet open={!!notNow} onOpenChange={(o) => !o && setNotNow(null)} onDone={() => (notNow && respond(`${orgId}:${notNow}`, 'not_now'), setNotNow(null))} />
    </Page>
  )
}

/** Deal rooms list */
export function DealRoomsList() {
  const { rooms } = useInvestorCtx()
  return (
    <Page title="Deal rooms" large subtitle="Rooms open after you sign an NDA. Every page is watermarked with your name.">
      {rooms.length === 0 ? (
        <EmptyState icon={<FolderLock />} title="No deal rooms yet" body="Express interest in a teaser and sign the NDA to open a room." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rooms.map((r) => {
            const a = asset(r.assetId)
            const left = daysUntil(r.expires)
            return (
              <li key={r.id}>
                <Link to={`/investor/rooms/${a.id}`} viewTransition className="pressable flex h-full flex-col rounded-lg border border-line bg-surface p-4 shadow-e1 hover:shadow-e2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-serif text-h3 font-semibold">{a.name}</p>
                      <p className="font-mono text-micro text-muted">{a.code}</p>
                    </div>
                    <ChevronRight className="size-4 text-muted" aria-hidden />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <TierBadge tier={a.tier} size="sm" />
                    <Chip tone={left <= 10 ? 'review' : 'neutral'}>{left <= 10 ? `Access ends in ${left} days` : `Until ${fmtDate(r.expires)}`}</Chip>
                  </div>
                  <p className="mt-auto flex items-center gap-3 pt-4 text-micro text-muted">
                    <span>NDA {fmtDate(r.ndaOn)}</span>
                    <span>{r.documents} documents</span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="size-3.5" aria-hidden /> {r.openQuestions} open
                    </span>
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Page>
  )
}
