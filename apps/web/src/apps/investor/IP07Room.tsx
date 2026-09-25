import { Download, Eye, FileText, Folder, FolderOpen, Link2, Lock, MessageCircle, MessageSquarePlus, NotebookPen, Plus, Star, StarOff } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, Outlet, useLocation, useParams } from 'react-router'
import { cn } from '@/lib/cn'
import { useDemoState } from '@/lib/demo-states'
import { daysUntil, fileSize, fmtDate } from '@/lib/format'
import { useIsDesktop } from '@/lib/hooks'
import { useDemo } from '@/lib/store'
import { asset, claimsFor, docsFor, flagsFor, person, questions, WORKSTREAMS, type DocumentItem, type Question } from '@/data'
import { Banner, ClaimRow, DisclosureLock, DocumentViewer, EmptyState, ExplainThis, MapPanel, PassportHeader, RedFlagCard, useOpenEvidence, WorkstreamCard } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Button, ButtonLink, Checkbox, Chip, Select, Sheet, TabNav, Textarea, toast } from '@/ds/ui'
import { useInvestorCtx } from './common'
import { Disclaimer } from './IP05Teaser'

export function useRoomAsset() {
  const { id = 'kiboko' } = useParams()
  return asset(id)
}

/** Deal-room layout: only after the NDA; the investor never lands in a bare folder tree (Flow C). */
export default function RoomLayout() {
  const a = useRoomAsset()
  const { hasNda, rooms } = useInvestorCtx()
  const { pathname } = useLocation()
  const base = `/investor/rooms/${a.id}`
  const onPassport = pathname === base || pathname === `${base}/`
  if (!hasNda(a.id)) {
    return (
      <Page title={a.code} back="/investor/rooms">
        <DisclosureLock variant="nda" title="Deal room" contains="Full passport, 86 documents and questions to the owner" action={<ButtonLink to={`/investor/teasers/${a.id}`}>Open the teaser</ButtonLink>} />
      </Page>
    )
  }
  const room = rooms.find((r) => r.assetId === a.id)
  const expiring = room && daysUntil(room.expires) <= 10
  return (
    <Page
      title={a.name}
      shortTitle={a.code}
      back="/investor/rooms"
      breadcrumbs={[{ label: 'Deal rooms', to: '/investor/rooms' }, { label: a.name }]}
      subtitle={room ? `NDA signed ${fmtDate(room.ndaOn)} · access until ${fmtDate(room.expires)}` : undefined}
      hideHeaderOnDesktop={onPassport}
    >
      {expiring && room && (
        <Banner tone="warning" className="mb-3" title={`Your access to this deal room ends on ${fmtDate(room.expires)}`}>
          Ask James Whitfield to extend it if you need more time.
        </Banner>
      )}
      <TabNav
        className="-mx-4 mb-4 px-4 md:mx-0 md:px-0"
        items={[
          { to: base, label: 'Passport', end: true },
          { to: `${base}/documents`, label: 'Documents', count: 86 },
          { to: `${base}/questions`, label: 'Questions', count: questions.filter((q) => q.roomId === room?.id).length },
          { to: `${base}/diligence`, label: 'Diligence' },
        ]}
      />
      <Outlet />
    </Page>
  )
}

const PASSPORT_STATES = [
  { id: 'default', label: 'Passport' },
  { id: 'stale', label: 'Show a stale claim' },
  { id: 'disputed', label: 'Show a disputed claim' },
] as const

/** IP-07 · Full Mine Passport */
export function RoomPassport() {
  const a = useRoomAsset()
  const [state] = useDemoState('IP-07', PASSPORT_STATES)
  const follows = useDemo((s) => s.follows)
  const toggleFollow = useDemo((s) => s.toggleFollow)
  const [ws, setWs] = useState<string>(state === 'stale' ? 'legal' : state === 'disputed' ? 'technical' : 'title')
  const [expanded, setExpanded] = useState<string | null>(state === 'stale' ? 'kb-l4' : state === 'disputed' ? 'kb-x4' : null)
  const following = follows.includes(a.id)
  const claims = claimsFor(a.id)
  const wsKey = state === 'stale' ? 'legal' : state === 'disputed' ? 'technical' : ws

  const rail = (
    <div className="space-y-2">
      <Button block variant={following ? 'tint' : 'secondary'} icon={following ? <StarOff /> : <Star />} onClick={() => (toggleFollow(a.id), toast(following ? 'Unfollowed' : 'Following: you will be alerted when a claim changes or expires'))}>
        {following ? 'Following' : 'Follow'}
      </Button>
      <ButtonLink to={`/print/passport/${a.id}?level=full`} block variant="secondary" icon={<Download />}>
        Export PDF
      </ButtonLink>
      <ButtonLink to={`/investor/rooms/${a.id}/questions`} block variant="secondary" icon={<MessageCircle />}>
        Ask a question
      </ButtonLink>
      <div className="rounded-lg border border-line bg-surface p-3 text-micro">
        <p className="text-muted">Who paid for verification</p>
        <p className="mt-0.5 font-medium text-fg">{a.paidBy === 'owner' ? 'The owner, fixed fee' : 'An investor, fixed fee'}</p>
      </div>
      <div className="rounded-lg border border-line bg-surface p-3 text-micro">
        <p className="text-muted">Version</p>
        <p className="mt-0.5 font-medium text-fg">
          v{a.passport.version} · released {fmtDate(a.passport.releasedOn!)}
        </p>
        <button type="button" className="mt-1 font-medium text-primary hover:underline" onClick={() => toast('Changes since v1: title opinion, site visit, ESG and geology desk reviews added')}>
          Changes since v1
        </button>
      </div>
    </div>
  )

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
      <div className="min-w-0 space-y-5">
        <PassportHeader asset={a} view="full" />
        <div className="xl:hidden">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
            <Button variant={following ? 'tint' : 'secondary'} icon={<Star />} onClick={() => toggleFollow(a.id)}>
              {following ? 'Following' : 'Follow'}
            </Button>
            <ButtonLink to={`/print/passport/${a.id}?level=full`} variant="secondary" icon={<Download />}>
              Export PDF
            </ButtonLink>
            <ButtonLink to={`/investor/rooms/${a.id}/questions`} variant="secondary" icon={<MessageCircle />}>
              Ask
            </ButtonLink>
          </div>
          <p className="mt-2 text-micro text-muted">Who paid for verification: {a.paidBy === 'owner' ? 'the owner, fixed fee' : 'an investor, fixed fee'}</p>
        </div>

        <section>
          <h2 className="mb-2 text-h2 font-semibold">Workstreams</h2>
          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
            {WORKSTREAMS.map((w) => (
              <WorkstreamCard key={w.id} asset={a} ws={w.id} onClick={() => (setWs(w.id), document.getElementById('ledger')?.scrollIntoView({ behavior: 'smooth' }))} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-h2 font-semibold">Red-flag register</h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {flagsFor(a.id)
              .filter((f) => f.status !== 'resolved')
              .map((f) => (
                <RedFlagCard key={f.id} flag={f} />
              ))}
          </div>
        </section>

        <section className="rounded-lg border border-line bg-surface p-4 shadow-e1">
          <h2 className="text-h2 font-semibold">Geology and resources, in brief</h2>
          <ExplainThis
            className="mt-2"
            technical={
              <p className="text-body">
                JORC (2012) Inferred Mineral Resource of 12.4 Mt at 8.1% Cg (4% Cg cut-off), effective 30 Jun 2025, signed by the owner's Competent Person. Independent Qualified Person review in progress. Field duplicates at 2.8% against a 5% target; blanks missing for batches 31–38.
              </p>
            }
            plain={<p>There is an early, low-confidence estimate of about 12 million tonnes of rock containing about 8% graphite. Some quality-control samples are missing, so an independent geologist is checking the estimate now; her report is due 7 Oct.</p>}
          />
        </section>

        <section id="ledger" className="scroll-mt-24">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-h2 font-semibold">Claims ledger</h2>
            <Select value={wsKey} onChange={(e) => setWs(e.target.value)} aria-label="Workstream" className="sm:w-72">
              {WORKSTREAMS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({claims.filter((c) => c.workstream === w.id).length})
                </option>
              ))}
            </Select>
          </div>
          <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-e1">
            {claims
              .filter((c) => c.workstream === wsKey)
              .map((c) => (
                <ClaimRow key={c.id} claim={c} expanded={expanded === c.id} onToggle={() => setExpanded(expanded === c.id ? null : c.id)} />
              ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-h2 font-semibold">Map</h2>
          <MapPanel asset={a} className="h-80 md:h-96" layers={{ artisanal: true, changes: false, captures: false }} />
          <dl className="mt-2 grid grid-cols-2 gap-2 text-meta sm:grid-cols-4">
            {[
              ['Port', a.distances.port],
              ['Rail', a.distances.rail],
              ['Power', a.distances.power],
              ['Paved road', a.distances.road],
            ].map(([k, v]) => (
              <div key={k as string} className="rounded-sm bg-surface px-3 py-2">
                <dt className="text-micro text-muted">{k}</dt>
                <dd className="font-semibold tabular-nums">{v} km</dd>
              </div>
            ))}
          </dl>
        </section>
        <Disclaimer />
      </div>
      <aside className="hidden xl:block">
        <div className="sticky top-24">{rail}</div>
      </aside>
    </div>
  )
}

const FOLDERS: DocumentItem['folder'][] = ['Title', 'Corporate', 'Geology', 'ESG', 'Technical', 'Legal and fiscal']

/** IP-08 · Deal-room documents */
export function RoomDocuments() {
  const a = useRoomAsset()
  const isDesktop = useIsDesktop()
  const open = useOpenEvidence()
  const { me, org, zone } = useInvestorCtx()
  const [folder, setFolder] = useState<DocumentItem['folder']>('Geology')
  const docs = docsFor(a.id).filter((d) => d.level !== 'L4')
  const inFolder = docs.filter((d) => d.folder === folder)
  const [sel, setSel] = useState<string | null>(null)
  const current = inFolder.find((d) => d.id === sel) ?? inFolder[0]
  const counts = useMemo(() => Object.fromEntries(FOLDERS.map((f) => [f, docs.filter((d) => d.folder === f).length])), [docs])

  return (
    <div className="grid gap-4 lg:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[200px_340px_minmax(0,1fr)]">
      <nav aria-label="Folders" className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 lg:mx-0 lg:block lg:space-y-0.5 lg:px-0">
        {FOLDERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => (setFolder(f), setSel(null))}
            aria-current={f === folder}
            className={cn('flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-meta lg:w-full lg:rounded-sm', f === folder ? 'bg-primary-tint font-medium text-primary' : 'text-muted hover:bg-sunken hover:text-fg')}
          >
            {f === folder ? <FolderOpen className="size-4" aria-hidden /> : <Folder className="size-4" aria-hidden />}
            <span className="flex-1 text-left">{f}</span>
            <span className="text-micro tabular-nums">{counts[f]}</span>
          </button>
        ))}
        <Button variant="secondary" size="sm" block className="mt-3 hidden h-auto min-h-9 whitespace-normal py-2 lg:flex" icon={<Download />} onClick={() => toast.success(`Watermarked bundle for ${me.name}: ${docs.filter((d) => d.download).length} permitted files`)}>
          Download permitted files
        </Button>
      </nav>

      <ul className="space-y-2 lg:max-h-[calc(100dvh-240px)] lg:overflow-y-auto" aria-label={`${folder} documents`}>
        {inFolder.length === 0 && <EmptyState title="Nothing in this folder yet" compact />}
        {inFolder.map((d) => (
          <li key={d.id}>
            <button
              type="button"
              onClick={() => (isDesktop ? setSel(d.id) : open({ docId: d.id, page: 1 }))}
              className={cn('pressable flex w-full items-start gap-3 rounded-lg border bg-surface p-3.5 text-left shadow-e1', current?.id === d.id && isDesktop ? 'border-primary ring-2 ring-primary/20' : 'border-line')}
            >
              <FileText className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-meta font-medium">{d.name}</span>
                <span className="mt-0.5 block text-micro text-muted">
                  {d.type} · {fmtDate(d.uploadedOn)} · {fileSize(d.sizeBytes)} · {d.pages} p
                </span>
                <span className="mt-1.5 flex flex-wrap gap-1.5">
                  <Chip size="sm" tone="outline" icon={<Link2 />}>
                    {d.linkedClaims} linked claims
                  </Chip>
                  {!d.download && (
                    <Chip size="sm" icon={<Eye />}>
                      View only
                    </Chip>
                  )}
                </span>
              </span>
            </button>
          </li>
        ))}
        <li className="lg:hidden">
          <Button variant="secondary" block icon={<Download />} onClick={() => toast.success('Watermarked bundle prepared')}>
            Download permitted files
          </Button>
        </li>
      </ul>

      {isDesktop && current && (
        <section className="hidden min-w-0 overflow-hidden rounded-lg border border-line bg-surface shadow-e1 xl:block">
          <DocumentViewer key={current.id} document={current} page={1} viewer={{ name: me.name, org: org.name, email: me.email, zone }} showFields={false} />
        </section>
      )}
      {isDesktop && current && (
        <div className="lg:col-start-2 xl:hidden">
          <Button variant="tint" icon={<Eye />} onClick={() => open({ docId: current.id, page: 1 })}>
            Open {current.name}
          </Button>
        </div>
      )}
    </div>
  )
}

const Q_STATES = [
  { id: 'default', label: 'Threads' },
  { id: 'overdue', label: 'Question overdue' },
] as const

/** IP-09 · Questions */
export function RoomQuestions() {
  const a = useRoomAsset()
  const [state] = useDemoState('IP-09', Q_STATES)
  const { rooms } = useInvestorCtx()
  const room = rooms.find((r) => r.assetId === a.id)
  const [list, setList] = useState<Question[]>(() => questions.filter((q) => q.roomId === room?.id))
  const [askOpen, setAskOpen] = useState(false)
  const [text, setText] = useState('')
  const [category, setCategory] = useState('Geology')
  const tone = { open: 'review', answered: 'verified', follow_up: 'disputed' } as const
  const label = { open: 'Open', answered: 'Answered', follow_up: 'Follow-up' } as const
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-meta text-muted">Questions go to the owner through SSD. Answers cite documents.</p>
        <Button icon={<MessageSquarePlus />} onClick={() => setAskOpen(true)}>
          Ask a question
        </Button>
      </div>
      {list.length === 0 ? (
        <EmptyState icon={<MessageCircle />} title="No questions yet" body="Ask the owner's team anything about the data room. SSD moderates every thread." compact />
      ) : (
        <ul className="space-y-3">
          {list.map((q) => {
            const overdue = q.status === 'open' && (daysUntil(q.due) < 0 || (state === 'overdue' && q.id === 'q1'))
            return (
              <li key={q.id} className="rounded-lg border border-line bg-surface p-4 shadow-e1">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tone="outline">{q.category}</Chip>
                  <Chip tone={tone[q.status]}>{label[q.status]}</Chip>
                  <span className={cn('ml-auto text-micro', overdue ? 'font-medium text-review' : 'text-muted')}>{overdue ? `Answer expected soon (was due ${fmtDate(q.due)})` : `Due ${fmtDate(q.due)}`}</span>
                </div>
                <p className="mt-2 text-body font-medium">{q.text}</p>
                <p className="text-micro text-muted">
                  {person(q.askedById).name} · {fmtDate(q.askedOn)}
                </p>
                {q.answer && (
                  <div className="mt-3 rounded-sm border-l-4 border-primary bg-primary-tint/50 p-3">
                    <p className="text-micro font-semibold text-primary">Answer · via SSD · {q.answeredOn && fmtDate(q.answeredOn)}</p>
                    <p className="mt-1 text-meta">{q.answer}</p>
                    {q.citations && <p className="mt-1.5 text-micro text-muted">Cites: {q.citations.length} documents</p>}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
      <Sheet
        open={askOpen}
        onOpenChange={setAskOpen}
        title="Ask a question"
        description="SSD forwards it to the owner's team and checks the answer."
        footer={
          <Button
            block
            disabled={!text}
            onClick={() => {
              setList((l) => [{ id: `n${l.length}`, roomId: room?.id ?? '', category, text, askedById: 'marcus', askedOn: '2026-09-24', due: '2026-10-01', status: 'open' }, ...l])
              setText('')
              setAskOpen(false)
              toast.success('Question sent · answer due 1 Oct')
            }}
          >
            Send
          </Button>
        }
      >
        <div className="space-y-3">
          <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
            {['Title', 'Corporate', 'Geology', 'Environment and social', 'Technical', 'Legal and fiscal'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
          <Textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Your question" aria-label="Your question" />
          <Select aria-label="Link a document page (optional)" defaultValue="">
            <option value="">Link a document page (optional)</option>
            {docsFor(a.id).slice(0, 8).map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </div>
      </Sheet>
    </div>
  )
}

type CheckItem = { item: string; claim: string; status: 'done' | 'in_progress' | 'waiting' | 'todo' }
const CHECKLIST: CheckItem[] = [
  { item: 'Licence valid and renewable', claim: 'kb-t1', status: 'done' },
  { item: 'Ownership traced to natural persons', claim: 'kb-o2', status: 'done' },
  { item: 'Sanctions and PEP clear', claim: 'kb-i1', status: 'done' },
  { item: 'Resource estimate independently reviewed', claim: 'kb-g1', status: 'waiting' },
  { item: 'Flake size fits our anode spec (≥40% +80 mesh)', claim: 'kb-g5', status: 'in_progress' },
  { item: 'Artisanal arrangement documented', claim: 'kb-e2', status: 'in_progress' },
  { item: 'Access road passable in the long rains', claim: 'kb-x4', status: 'todo' },
  { item: 'Export rules for concentrate confirmed', claim: 'kb-l3', status: 'done' },
]

/** IP-10 · Diligence workspace (private to the investor's team) */
export function RoomDiligence() {
  const a = useRoomAsset()
  const [notes, setNotes] = useState('Flake size looks borderline for our spec; ask for the full distribution by size fraction.\nSite visit request: combine with the Investor-ready ESG visit in October.')
  const [items, setItems] = useState<CheckItem[]>(CHECKLIST.map((c) => ({ ...c })))
  const statusLabel = { done: 'Done', in_progress: 'In progress', waiting: 'Waiting on SSD', todo: 'To do' } as const
  const statusTone = { done: 'verified', in_progress: 'review', waiting: 'primary', todo: 'neutral' } as const
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="rounded-lg border border-line bg-surface shadow-e1">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
          <div>
            <h2 className="text-h3 font-semibold">Diligence checklist</h2>
            <p className="text-micro text-muted">Template: Strategic offtake, exploration stage</p>
          </div>
          <Chip tone="outline" icon={<Lock />}>
            Visible only to your team
          </Chip>
        </div>
        <ul className="divide-y divide-line">
          {items.map((it, i) => (
            <li key={it.item} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <Checkbox checked={it.status === 'done'} onCheckedChange={(v) => setItems((x) => x.map((y, j) => (j === i ? { ...y, status: v ? 'done' : 'in_progress' } : y)))} />
              <span className="min-w-0 flex-1 text-meta">{it.item}</span>
              <Link to={`/investor/rooms/${a.id}`} viewTransition className="inline-flex items-center gap-1 text-micro font-medium text-primary hover:underline">
                <Link2 className="size-3" aria-hidden /> {it.claim.toUpperCase()}
              </Link>
              <Chip tone={statusTone[it.status]}>{statusLabel[it.status]}</Chip>
            </li>
          ))}
        </ul>
        <div className="border-t border-line p-3">
          <Button size="sm" variant="ghost" icon={<Plus />} onClick={() => toast('Add a checklist item (demo)')}>
            Add item
          </Button>
        </div>
      </section>
      <section className="h-fit rounded-lg border border-line bg-surface p-4 shadow-e1">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-h3 font-semibold">
            <NotebookPen className="size-4.5 text-muted" aria-hidden /> Private notes
          </h2>
          <Chip size="sm" tone="outline" icon={<Lock />}>
            Team only
          </Chip>
        </div>
        <Textarea className="mt-3" rows={8} value={notes} onChange={(e) => setNotes(e.target.value)} aria-label="Private notes" />
        <p className="mt-2 text-micro text-muted">Encrypted for your organisation. Never visible to SSD or the owner unless you share it.</p>
      </section>
    </div>
  )
}
