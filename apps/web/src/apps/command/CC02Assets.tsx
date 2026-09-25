import { Columns3, Download, Search, UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useDemoState } from '@/lib/demo-states'
import { daysAgo, fmtDay } from '@/lib/format'
import { assets, person, STAGE_LABEL, WORKSTREAMS, type Asset } from '@/data'
import { assetFlagCounts, EmptyState, FlagCounts, TierBadge } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Avatar, Button, Checkbox, Chip, DataTable, Input, Popover, Progress, Segmented, Skeleton, toast, type Column } from '@/ds/ui'

const STATES = [
  { id: 'default', label: 'Default' },
  { id: 'loading', label: 'Loading' },
  { id: 'empty', label: 'No results' },
] as const

type View = 'all' | 'mine' | 'findings' | 'released' | 'blocked'
const avg = (a: Asset) => Math.round(WORKSTREAMS.reduce((s, w) => s + a.completeness[w.id], 0) / WORKSTREAMS.length)
const stageTone = (s: Asset['pipeline']) =>
  s === 'released' || s === 'introduced' || s === 'in_deal_room' ? 'verified' : s === 'findings_review' ? 'disputed' : s === 'submitted' || s === 'triage' ? 'primary' : 'review'

export default function CC02Assets() {
  const navigate = useNavigate()
  const [state] = useDemoState('CC-02', STATES)
  const [view, setView] = useState<View>('all')
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [hidden, setHidden] = useState<string[]>(['country', 'activity'])

  const rows = useMemo(() => {
    if (state === 'empty') return []
    let r = assets
    if (view === 'mine') r = r.filter((a) => a.analystId === 'kevin')
    if (view === 'findings') r = r.filter((a) => a.pipeline === 'findings_review')
    if (view === 'released') r = r.filter((a) => a.passport.status === 'released')
    if (view === 'blocked') r = r.filter((a) => assetFlagCounts(a.id).critical > 0 || ['nyanza', 'kakamega', 'lodwar', 'tsavo', 'mawe'].includes(a.id))
    if (q) r = r.filter((a) => `${a.name} ${a.code} ${a.commodity} ${a.county}`.toLowerCase().includes(q.toLowerCase()))
    return r
  }, [view, q, state])

  const columns: Column<Asset>[] = [
    {
      key: 'asset',
      header: 'Asset',
      sortValue: (a) => a.name,
      cell: (a) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{a.name}</p>
          <p className="font-mono text-[11px] text-muted">{a.code}</p>
        </div>
      ),
    },
    { key: 'country', header: 'Country', cell: (a) => a.country },
    { key: 'commodity', header: 'Commodity', sortValue: (a) => a.commodity, cell: (a) => a.commodity },
    { key: 'stage', header: 'Stage', cell: (a) => <span className="text-muted">{a.stage}</span>, hideBelow: 'xl' },
    { key: 'tier', header: 'Tier', cell: (a) => <TierBadge tier={a.tier} size="sm" /> },
    { key: 'pipeline', header: 'Pipeline', sortValue: (a) => a.pipeline, cell: (a) => <Chip tone={stageTone(a.pipeline)}>{STAGE_LABEL[a.pipeline]}</Chip> },
    { key: 'flags', header: 'Open flags', cell: (a) => <FlagCounts counts={assetFlagCounts(a.id)} compact showZero={false} /> },
    {
      key: 'complete',
      header: 'Completeness',
      sortValue: avg,
      cell: (a) => (
        <div className="flex w-28 items-center gap-2">
          <Progress value={avg(a)} tone={avg(a) >= 80 ? 'verified' : 'primary'} label={`Average proven ${avg(a)}%`} />
        </div>
      ),
      hideBelow: 'lg',
    },
    { key: 'analyst', header: 'Analyst', cell: (a) => <Avatar id={a.analystId} size={24} />, align: 'center' },
    { key: 'days', header: 'Days in stage', align: 'right', sortValue: (a) => a.daysInStage, cell: (a) => a.daysInStage },
    { key: 'activity', header: 'Last activity', sortValue: (a) => a.lastActivity, cell: (a) => <span className="text-muted">{daysAgo(a.lastActivity) === 0 ? 'Today' : fmtDay(a.lastActivity)}</span> },
  ]

  const exportCsv = () => {
    const header = ['Asset', 'Code', 'Commodity', 'Tier', 'Pipeline', 'Analyst', 'Days in stage']
    const lines = rows.map((a) => [a.name, a.code, a.commodity, a.tier, STAGE_LABEL[a.pipeline], person(a.analystId).name, a.daysInStage].map((v) => `"${v}"`).join(','))
    const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const el = document.createElement('a')
    el.href = url
    el.download = 'touchstone-assets.csv'
    el.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${rows.length} assets`)
  }

  return (
    <Page
      title="Assets"
      large
      asOf
      actions={
        <>
          <Button variant="secondary" icon={<Download />} onClick={exportCsv}>
            CSV
          </Button>
          <Popover
            align="end"
            className="w-60"
            trigger={
              <Button variant="secondary" icon={<Columns3 />}>
                Columns
              </Button>
            }
          >
            <p className="mb-2 text-micro font-semibold uppercase tracking-wide text-muted">Show columns</p>
            {columns.map((c) => (
              <Checkbox
                key={c.key}
                checked={!hidden.includes(c.key)}
                onCheckedChange={(v) => setHidden((h) => (v ? h.filter((x) => x !== c.key) : [...h, c.key]))}
                label={<span className="text-meta">{c.header}</span>}
                className="min-h-8"
              />
            ))}
          </Popover>
        </>
      }
    >
      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <Segmented<View>
            ariaLabel="Saved views"
            value={view}
            onChange={setView}
            size="sm"
            options={[
              { value: 'all', label: 'All', count: assets.length },
              { value: 'mine', label: 'My assets' },
              { value: 'findings', label: 'In findings review' },
              { value: 'released', label: 'Released' },
              { value: 'blocked', label: 'Blocked' },
            ]}
          />
        </div>
        <div className="flex items-center gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search assets" aria-label="Search assets" leading={<Search />} className="lg:w-64" />
          {selected.length > 0 && (
            <Button variant="tint" icon={<UserPlus />} onClick={() => (toast.success(`${selected.length} assets assigned to Mercy Achieng`), setSelected([]))}>
              Assign {selected.length}
            </Button>
          )}
        </div>
      </div>

      {state === 'loading' ? (
        <div className="space-y-2 rounded-lg border border-line bg-surface p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-8" />
          ))}
        </div>
      ) : (
        <DataTable
          caption="Assets"
          rows={rows}
          columns={columns}
          hidden={hidden}
          getId={(a) => a.id}
          selectable
          selected={selected}
          onSelectedChange={setSelected}
          onRowClick={(a) => navigate(a.pipeline === 'submitted' || a.pipeline === 'triage' ? `/command/assets/${a.id}/triage` : `/command/assets/${a.id}`, { viewTransition: true })}
          empty={<EmptyState icon={<Search />} title="No assets match" body="Try another saved view or clear the search." action={<Button variant="secondary" onClick={() => (setQ(''), setView('all'))}>Clear filters</Button>} />}
          mobileCard={(a) => (
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{a.name}</p>
                  <p className="text-micro text-muted">
                    <span className="font-mono">{a.code}</span> · {a.commodity}
                  </p>
                </div>
                <TierBadge tier={a.tier} size="sm" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Chip tone={stageTone(a.pipeline)}>{STAGE_LABEL[a.pipeline]}</Chip>
                <FlagCounts counts={assetFlagCounts(a.id)} compact showZero={false} />
                <span className="ml-auto text-micro text-muted">{a.daysInStage} d in stage</span>
              </div>
            </div>
          )}
        />
      )}
    </Page>
  )
}
