import { BellPlus, BellRing, Hourglass, LayoutList, LibraryBig, Map as MapIcon, Search, Send, SlidersHorizontal, StarOff } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useDemoState } from '@/lib/demo-states'
import { useDemo } from '@/lib/store'
import { asset, releasedAssets, TIER_LABEL, WORKSTREAMS, type Asset } from '@/data'
import { assetFlagCounts, EmptyState, FlagCounts, PointsMap, StatusStamp, TierBadge, workstreamProgress } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Button, Chip, Input, Segmented, Select, Sheet, Switch, Textarea, toast } from '@/ds/ui'
import { useInvestorCtx } from './common'

const LIB_STATES = [
  { id: 'default', label: 'Default' },
  { id: 'none', label: 'No results' },
  { id: 'pending', label: 'Request pending with SSD' },
] as const

/** IP-12 · Verified library (only when switched on): L1 facts only, investor-defined searches, no recommendations. */
export default function IP12Library() {
  const libraryOn = useDemo((s) => s.libraryOn)
  const [state] = useDemoState('IP-12', LIB_STATES)
  const [view, setView] = useState<'list' | 'map'>('list')
  const [q, setQ] = useState('')
  const [commodity, setCommodity] = useState('all')
  const [tier, setTier] = useState('all')
  const [noHigh, setNoHigh] = useState(false)
  const [requestFor, setRequestFor] = useState<Asset | null>(null)
  const [pending, setPending] = useState<string[]>([])
  const [saved, setSaved] = useState(['New graphite in Kenya or Tanzania'])

  const results = useMemo(() => {
    if (state === 'none') return []
    return releasedAssets().filter(
      (a) =>
        (commodity === 'all' || a.commodityKey === commodity) &&
        (tier === 'all' || a.tier === tier) &&
        (!noHigh || assetFlagCounts(a.id).high + assetFlagCounts(a.id).critical === 0) &&
        (!q || `${a.code} ${a.commodity} ${a.region}`.toLowerCase().includes(q.toLowerCase())),
    )
  }, [commodity, tier, noHigh, q, state])
  const isPending = (id: string) => pending.includes(id) || (state === 'pending' && id === 'galana')

  if (!libraryOn) {
    return (
      <Page title="Library" large>
        <EmptyState icon={<LibraryBig />} title="The verified library isn't available" body="SSD introduces opportunities through teasers. The library opens only after SSD's counsel approves it." contactId="james" action={<Link to="/investor/opportunities" className="text-meta font-medium text-primary hover:underline">See your opportunities</Link>} />
      </Page>
    )
  }

  return (
    <Page title="Verified library" large subtitle="Released passports at library level: facts and verification status only. Never terms, capital sought or valuations.">
      <div className="mb-4 space-y-3 rounded-lg border border-line bg-surface p-3 shadow-e1">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by commodity, region or code" aria-label="Search" leading={<Search />} className="md:flex-1" />
          <Segmented
            ariaLabel="View"
            value={view}
            onChange={setView}
            options={[
              { value: 'list', label: 'List', icon: <LayoutList /> },
              { value: 'map', label: 'Map', icon: <MapIcon /> },
            ]}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="size-4 text-muted" aria-hidden />
          <Select value={commodity} onChange={(e) => setCommodity(e.target.value)} aria-label="Commodity" className="w-44">
            <option value="all">All commodities</option>
            <option value="graphite">Graphite</option>
            <option value="heavy_sands">Heavy mineral sands</option>
            <option value="gold">Gold</option>
          </Select>
          <Select aria-label="Country" className="w-36" defaultValue="KE">
            <option value="KE">Kenya</option>
          </Select>
          <Select value={tier} onChange={(e) => setTier(e.target.value)} aria-label="Tier" className="w-44">
            <option value="all">All tiers</option>
            {(['standard', 'investor_ready'] as const).map((t) => (
              <option key={t} value={t}>
                {TIER_LABEL[t]}
              </option>
            ))}
          </Select>
          <Switch checked={noHigh} onCheckedChange={setNoHigh} label={<span className="text-meta">No High or Critical flags</span>} />
          <Button size="sm" variant="tint" icon={<BellPlus />} className="ml-auto" onClick={() => (setSaved((s) => [...s, q || 'All graphite, any tier']), toast.success('Search saved; alerts on your own criteria'))}>
            Save search
          </Button>
        </div>
        {saved.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-micro text-muted">
            Your saved searches:
            {saved.map((s) => (
              <Chip key={s} tone="primary" icon={<BellRing />}>
                Alert me: {s}
              </Chip>
            ))}
          </div>
        )}
      </div>

      {results.length === 0 ? (
        <EmptyState icon={<Search />} title="No released passports match" body="Try widening your filters: another tier, commodity or region." action={<Button variant="secondary" onClick={() => (setQ(''), setCommodity('all'), setTier('all'), setNoHigh(false))}>Clear filters</Button>} />
      ) : view === 'map' ? (
        <PointsMap points={results.map((a) => ({ id: a.id, lng: a.center[0], lat: a.center[1], label: a.code }))} onSelect={(id) => setRequestFor(asset(id))} className="h-[60dvh] min-h-80" />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {results.map((a) => (
            <li key={a.id} className="flex flex-col rounded-lg border border-line bg-surface p-4 shadow-e1">
              <div className="flex items-start justify-between gap-2">
                <p className="font-mono text-meta font-medium text-muted">{a.code}</p>
                <TierBadge tier={a.tier} size="sm" />
              </div>
              <p className="mt-1 font-serif text-h2 font-semibold">
                {a.commodity}, {a.region}
              </p>
              <p className="text-meta text-muted">
                {a.country} · {a.stage} · {a.licence.type}, active
              </p>
              <ul className="mt-3 space-y-1">
                {WORKSTREAMS.map((w) => {
                  const p = workstreamProgress(a, w.id)
                  return (
                    <li key={w.id} className="flex items-center justify-between gap-2 text-micro">
                      <span className="truncate text-muted">{w.short}</span>
                      <span className="flex items-center gap-2">
                        <span className="tabular-nums text-muted">
                          {p.proven}/{p.total}
                        </span>
                        <StatusStamp status={a.workstreamStatus[w.id]} size="sm" />
                      </span>
                    </li>
                  )
                })}
              </ul>
              <FlagCounts counts={assetFlagCounts(a.id)} className="mt-3" compact />
              <div className="mt-auto pt-4">
                {isPending(a.id) ? (
                  <Chip tone="review" icon={<Hourglass />}>
                    Request with SSD
                  </Chip>
                ) : (
                  <Button block variant="secondary" icon={<Send />} onClick={() => setRequestFor(a)}>
                    Request an introduction
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Sheet
        open={!!requestFor}
        onOpenChange={(o) => !o && setRequestFor(null)}
        title={requestFor ? `Request an introduction · ${requestFor.code}` : ''}
        description="SSD reviews every request, and the owner must agree before you receive a teaser."
        desktop="center"
        size="sm"
        footer={
          <Button
            block
            onClick={() => {
              if (requestFor) setPending((p) => [...p, requestFor.id])
              setRequestFor(null)
              toast.success('Request sent to SSD')
            }}
          >
            Send request
          </Button>
        }
      >
        <Textarea rows={4} placeholder="Why this fits your mandate (optional)" aria-label="Reason" />
      </Sheet>
    </Page>
  )
}

/** IP-13 · Watchlist and alerts */
export function IP13Watchlist() {
  useDemoState('IP-13', [{ id: 'default', label: 'Default' }] as const)
  const follows = useDemo((s) => s.follows)
  const toggle = useDemo((s) => s.toggleFollow)
  const { hasNda } = useInvestorCtx()
  const [inApp, setInApp] = useState(true)
  const [digest, setDigest] = useState(true)
  const changes: Record<string, { text: string; flag: string }> = {
    kiboko: { text: 'QA/QC data received 22 Sep; Medium flag under review', flag: 'Medium flag under review' },
    galana: { text: 'County permit renewed 20 Aug; Low flag resolved', flag: 'Low flag resolved' },
    pwani: { text: 'Conversion to mining licence still in review', flag: 'No change' },
  }
  return (
    <Page title="Watchlist" large subtitle="Alerts only for assets you're entitled to see at this level of detail.">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <ul className="space-y-3">
          {follows.length === 0 && <EmptyState icon={<StarOff />} title="You're not following any assets" body="Follow an asset from its passport to get alerts when a claim changes or expires." />}
          {follows.map((id) => {
            const a = asset(id)
            const c = changes[id] ?? { text: 'No changes this week', flag: 'No change' }
            return (
              <li key={id} className="rounded-lg border border-line bg-surface p-4 shadow-e1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-serif text-h3 font-semibold">{hasNda(id) ? a.name : `${a.commodity}, ${a.region}`}</p>
                    <p className="font-mono text-micro text-muted">{a.code}</p>
                  </div>
                  <Button size="sm" variant="ghost" icon={<StarOff />} onClick={() => toggle(id)}>
                    Unfollow
                  </Button>
                </div>
                <p className="mt-2 text-meta">{c.text}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-micro text-muted">
                  <Chip size="sm">
                    {a.fresh.fresh} of {a.fresh.total} material claims fresh
                  </Chip>
                  <Chip size="sm" tone={c.flag === 'No change' ? 'neutral' : 'review'}>
                    {c.flag}
                  </Chip>
                  {hasNda(id) && (
                    <Link to={`/investor/rooms/${id}`} viewTransition className="font-medium text-primary hover:underline">
                      Open passport
                    </Link>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
        <section className="h-fit rounded-lg border border-line bg-surface p-4 shadow-e1">
          <h2 className="text-h3 font-semibold">Alert preferences</h2>
          <div className="mt-2 divide-y divide-line">
            <Switch checked={inApp} onCheckedChange={setInApp} label="In the portal" className="py-1" />
            <Switch checked={digest} onCheckedChange={setDigest} label="Daily email digest" description="Counts and a link only; never deal details" className="py-1" />
          </div>
        </section>
      </div>
    </Page>
  )
}
