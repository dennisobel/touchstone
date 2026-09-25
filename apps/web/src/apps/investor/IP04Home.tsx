import { Bell, Clock, FileText, Hourglass, MessageSquareText, Star } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useDemoState } from '@/lib/demo-states'
import { fmtDay } from '@/lib/format'
import { useDemo } from '@/lib/store'
import { asset } from '@/data'
import { AsOf, EmptyState, TeaserCard } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Avatar, Button, ButtonLink, Sheet, Textarea, toast } from '@/ds/ui'
import { NotNowSheet, useInvestorCtx } from './common'

const STATES = [
  { id: 'default', label: 'Default' },
  { id: 'none', label: 'No teasers yet' },
  { id: 'pending', label: 'Qualification pending' },
] as const

export default function IP04Home() {
  const navigate = useNavigate()
  const [state] = useDemoState('IP-04', STATES)
  const { me, org, intros, waiting, rooms, orgId, zone } = useInvestorCtx()
  const respond = useDemo((s) => s.respondTeaser)
  const [notNow, setNotNow] = useState<string | null>(null)
  const [ask, setAsk] = useState<string | null>(null)
  const showTeasers = state === 'default'
  const earlier = intros.filter((i) => i.status === 'not_now')

  if (state === 'pending') {
    return (
      <Page title={`Welcome, ${me.name.split(' ')[0]}`} large>
        <EmptyState icon={<Hourglass />} title="Your qualification is in progress" body="This usually takes 3 working days. You will see opportunities here once SSD has qualified your organisation." contactId="james" action={<ButtonLink to="/investor/qualification?state=status" variant="secondary">View status</ButtonLink>} />
      </Page>
    )
  }

  return (
    <Page title={`Welcome, ${me.name.split(' ')[0]}`} large subtitle={org.name}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <section aria-labelledby="waiting">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <h2 id="waiting" className="text-h2 font-semibold">
              Waiting for your response
            </h2>
            <AsOf zone={zone} />
          </div>
          {showTeasers && (waiting.length > 0 || earlier.length > 0) ? (
            <div className="space-y-3">
              {waiting.map((i) => (
                <TeaserCard
                  key={i.id}
                  asset={asset(i.assetId)}
                  status="waiting"
                  sentOn={i.teaserSentOn}
                  onOpen={() => navigate(`/investor/teasers/${i.assetId}`, { viewTransition: true })}
                  onInterested={() => {
                    respond(`${orgId}:${i.assetId}`, 'interested')
                    navigate(`/investor/teasers/${i.assetId}/nda`, { viewTransition: true })
                  }}
                  onNotNow={() => setNotNow(i.assetId)}
                  onAsk={() => setAsk(i.assetId)}
                />
              ))}
              {earlier.map((i) => (
                <TeaserCard key={i.id} asset={asset(i.assetId)} status="not_now" sentOn={i.teaserSentOn} onOpen={() => navigate(`/investor/teasers/${i.assetId}`, { viewTransition: true })} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Clock />}
              title="No teasers yet"
              body="SSD sends only opportunities with released passports that match your mandate. Nothing is ranked or recommended."
              contactId="james"
              action={<ButtonLink to="/investor/mandate" variant="secondary">Review your mandate</ButtonLink>}
            />
          )}
        </section>

        <div className="space-y-6">
          <section aria-labelledby="activity">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <h2 id="activity" className="text-h2 font-semibold">
                Deal-room activity
              </h2>
              <AsOf zone={zone} />
            </div>
            {rooms.length ? (
              <ul className="overflow-hidden rounded-lg border border-line bg-surface shadow-e1">
                {[
                  { icon: <MessageSquareText />, text: 'New answer: status of the licence renewal application', room: rooms[0], when: '20 Sep' },
                  { icon: <FileText />, text: 'New document: QA/QC summary 2025 (v2)', room: rooms[0], when: '22 Sep' },
                  { icon: <Clock />, text: `Room access ends ${fmtDay(rooms[rooms.length - 1].expires)}`, room: rooms[rooms.length - 1], when: 'Deadline' },
                ].map((x, i) => (
                  <li key={i}>
                    <Link to={`/investor/rooms/${x.room.assetId}`} viewTransition className="flex items-start gap-3 border-b border-line px-4 py-3 last:border-0 hover:bg-sunken/60">
                      <span className="mt-0.5 text-muted [&_svg]:size-4">{x.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-meta">{x.text}</span>
                        <span className="block text-micro text-muted">
                          {asset(x.room.assetId).name} · {x.when}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No deal rooms yet" body="A deal room opens when you sign an NDA for an opportunity." compact />
            )}
          </section>

          <section aria-labelledby="follow">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <h2 id="follow" className="text-h2 font-semibold">
                Changes to assets you follow
              </h2>
              <AsOf zone={zone} />
            </div>
            <ul className="overflow-hidden rounded-lg border border-line bg-surface shadow-e1">
              {[
                { code: 'KE-GR-07', text: 'QA/QC data received 22 Sep; Medium flag under review' },
                { code: 'KE-GR-07', text: 'Licence status re-checked 10 Sep; still active until 14 Mar 2027' },
              ].map((c, i) => (
                <li key={i} className="flex items-start gap-3 border-b border-line px-4 py-3 last:border-0">
                  <Star className="mt-0.5 size-4 text-muted" aria-hidden />
                  <span className="text-meta">
                    <span className="font-mono text-micro font-semibold">{c.code}</span> · {c.text}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 inline-flex items-center gap-1.5 text-micro text-muted">
              <Bell className="size-3.5" aria-hidden /> Daily email digest carries counts only, never deal details.
            </p>
          </section>

          <div className="flex items-center gap-3 rounded-lg border border-line bg-surface p-4">
            <Avatar id="james" size={40} />
            <div className="min-w-0 flex-1">
              <p className="text-micro text-muted">Your SSD contact</p>
              <p className="text-meta font-semibold">James Whitfield</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => setAsk('general')}>
              Ask SSD
            </Button>
          </div>
        </div>
      </div>

      <NotNowSheet
        open={!!notNow}
        onOpenChange={(o) => !o && setNotNow(null)}
        onDone={() => {
          if (notNow) respond(`${orgId}:${notNow}`, 'not_now')
          setNotNow(null)
        }}
      />
      <Sheet
        open={!!ask}
        onOpenChange={(o) => !o && setAsk(null)}
        title="Ask SSD"
        description="James Whitfield replies in the portal"
        desktop="center"
        size="sm"
        footer={
          <Button block onClick={() => (toast.success('Question sent to James Whitfield'), setAsk(null))}>
            Send
          </Button>
        }
      >
        <Textarea placeholder="Your question" aria-label="Your question" rows={4} />
      </Sheet>
    </Page>
  )
}
