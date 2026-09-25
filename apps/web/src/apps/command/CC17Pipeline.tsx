import { GripVertical, MoveRight } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/cn'
import { useDemoState } from '@/lib/demo-states'
import { assets, INTRO_STATUS_LABEL, introductions, investor, asset as getAsset, STAGE_LABEL, type AssetStage, type IntroStatus } from '@/data'
import { Page } from '@/ds/shell'
import { Avatar, Button, Menu, Segmented, Sheet, Textarea, toast } from '@/ds/ui'
import { dealsTabs, SectionTabs } from './common'

const STATES = [{ id: 'default', label: 'Default' }] as const

const ASSET_STAGES: AssetStage[] = ['submitted', 'triage', 'verifying', 'findings_review', 'released', 'introduced', 'in_deal_room', 'closed']
const INTRO_STAGES: IntroStatus[] = ['teaser_sent', 'opened', 'interested', 'nda_signed', 'in_diligence', 'loi', 'closed', 'lost']

type Card = { id: string; title: string; sub: string; days: number; stage: string; who: string }

export default function CC17Pipeline() {
  useDemoState('CC-17', STATES)
  const [board, setBoard] = useState<'assets' | 'intros'>('assets')
  const [assetCards, setAssetCards] = useState<Card[]>(assets.map((a) => ({ id: a.id, title: a.name, sub: `${a.code} · ${a.commodity}`, days: a.daysInStage, stage: a.pipeline, who: a.analystId })))
  const [introCards, setIntroCards] = useState<Card[]>(
    introductions.map((i) => ({
      id: i.id,
      title: `${getAsset(i.assetId).code} × ${investor(i.investorId).name}`,
      sub: getAsset(i.assetId).name,
      days: i.daysInStage,
      stage: i.status === 'not_now' || i.status === 'expired' ? 'lost' : i.status,
      who: investor(i.investorId).relationshipOwnerId,
    })),
  )
  const [pending, setPending] = useState<{ id: string; to: string } | null>(null)
  const [reason, setReason] = useState('')
  const [dragging, setDragging] = useState<string | null>(null)

  const stages = board === 'assets' ? ASSET_STAGES : INTRO_STAGES
  const label = (s: string) => (board === 'assets' ? STAGE_LABEL[s as AssetStage] : s === 'lost' ? 'Lost / Not now' : INTRO_STATUS_LABEL[s as IntroStatus])
  const cards = board === 'assets' ? assetCards : introCards
  const setCards = board === 'assets' ? setAssetCards : setIntroCards

  const confirmMove = () => {
    if (!pending) return
    setCards((cs) => cs.map((c) => (c.id === pending.id ? { ...c, stage: pending.to, days: 0 } : c)))
    toast.success(`Moved to ${label(pending.to)} · reason logged`)
    setPending(null)
    setReason('')
  }

  return (
    <Page title="Pipeline boards" large headerExtra={<SectionTabs items={dealsTabs} />}>
      <Segmented
        ariaLabel="Board"
        value={board}
        onChange={setBoard}
        className="mb-3"
        options={[
          { value: 'assets', label: 'Assets' },
          { value: 'intros', label: 'Introductions' },
        ]}
      />
      {board === 'intros' && <p className="mb-3 text-micro text-muted">SSD records outcomes but does not negotiate. Not now and Expired end early.</p>}
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 md:mx-0 md:px-0">
        {stages.map((s) => {
          const list = cards.filter((c) => c.stage === s)
          return (
            <section
              key={s}
              aria-label={label(s)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => dragging && setPending({ id: dragging, to: s })}
              className={cn('w-[78vw] shrink-0 snap-start rounded-lg border border-line bg-sunken/50 md:w-64', dragging && 'border-dashed border-primary/50')}
            >
              <header className="flex items-center justify-between gap-2 px-3 py-2.5">
                <h2 className="text-meta font-semibold">{label(s)}</h2>
                <span className="rounded-full bg-surface px-1.5 text-micro tabular-nums text-muted">{list.length}</span>
              </header>
              <ul className="min-h-24 space-y-2 px-2 pb-2">
                {list.map((c) => (
                  <li
                    key={c.id}
                    draggable
                    onDragStart={() => setDragging(c.id)}
                    onDragEnd={() => setDragging(null)}
                    className="group rounded-lg border border-line bg-surface p-3 shadow-e1 hover:shadow-e2"
                  >
                    <div className="flex items-start gap-1.5">
                      <GripVertical className="mt-0.5 hidden size-4 shrink-0 cursor-grab text-muted md:block" aria-hidden />
                      <div className="min-w-0 flex-1">
                        <p className="text-meta font-semibold">{c.title}</p>
                        <p className="truncate text-micro text-muted">{c.sub}</p>
                      </div>
                      <Menu
                        label="Move to"
                        trigger={
                          <button type="button" className="rounded-full p-1.5 text-muted hover:bg-sunken" aria-label={`Move ${c.title}`}>
                            <MoveRight className="size-4" />
                          </button>
                        }
                        items={stages.filter((x) => x !== s).map((x) => ({ label: label(x), onSelect: () => setPending({ id: c.id, to: x }) }))}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-micro text-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <Avatar id={c.who} size={18} />
                      </span>
                      <span className={cn('tabular-nums', c.days > 30 && 'font-medium text-review')}>{c.days} d in stage</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>

      <Sheet
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        title={pending ? `Move to ${label(pending.to)}` : ''}
        description="A reason is required and logged"
        desktop="center"
        size="sm"
        footer={
          <Button block disabled={!reason} onClick={confirmMove}>
            Move
          </Button>
        }
      >
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" aria-label="Reason" />
      </Sheet>
    </Page>
  )
}
