import { Check, Download, Eye, FileSpreadsheet, FileText, Link2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { useDemoState } from '@/lib/demo-states'
import { fmtDate, NOW } from '@/lib/format'
import { asset, type EvidenceRef } from '@/data'
import { assetFlagCounts, EmptyState, FlagCounts, StatusStamp, TierBadge, useOpenEvidence } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Button, ButtonLink, Checkbox, Switch, toast } from '@/ds/ui'
import { useInvestorCtx } from './common'

type Cell = { text: string; ev?: EvidenceRef }
const FACTS: Record<string, Record<string, Cell>> = {
  kiboko: {
    licence: { text: 'Prospecting licence · active until 14 Mar 2027', ev: { docId: 'kb-d02', page: 1 } },
    code: { text: 'JORC (2012) · Inferred', ev: { docId: 'kb-d10', page: 3 } },
    resource: { text: '12.4 Mt at 8.1% Cg', ev: { docId: 'kb-d10', page: 47, region: 'Table 14.3' } },
    port: { text: '186 km', ev: { docId: 'kb-d19', page: 3 } },
  },
  galana: {
    licence: { text: 'Prospecting licence · active until 31 Dec 2026' },
    code: { text: 'JORC (2012) · Indicated' },
    resource: { text: '18.2 Mt at 9.4% Cg' },
    port: { text: '132 km' },
  },
  pwani: {
    licence: { text: 'Retention licence · until 30 Sep 2026, conversion filed' },
    code: { text: 'JORC (2012) · Indicated' },
    resource: { text: '64 Mt at 3.1% heavy minerals' },
    port: { text: '48 km' },
  },
}

const ROWS = [
  { key: 'tier', label: 'Tier' },
  { key: 'licence', label: 'Licence status and expiry' },
  { key: 'code', label: 'Reporting code and classification' },
  { key: 'resource', label: 'Tonnage and grade' },
  { key: 'flags', label: 'Red flags by severity' },
  { key: 'port', label: 'Distance to port' },
  { key: 'esg', label: 'Environment and social status' },
] as const

/** IP-11 · Compare up to four assets on standard fields */
export default function IP11Compare() {
  useDemoState('IP-11', [{ id: 'default', label: 'Default' }] as const)
  const open = useOpenEvidence()
  const { rooms } = useInvestorCtx()
  const available = rooms.map((r) => r.assetId).filter((id) => FACTS[id])
  const [chosen, setChosen] = useState<string[]>(available.slice(0, 4))
  const [onlyDiff, setOnlyDiff] = useState(false)
  const assets = chosen.map((id) => asset(id))

  const value = (id: string, key: (typeof ROWS)[number]['key']) => {
    const a = asset(id)
    if (key === 'tier') return a.tier
    if (key === 'flags') return JSON.stringify(assetFlagCounts(id))
    if (key === 'esg') return a.workstreamStatus.esg
    return FACTS[id][key].text
  }
  const differs = useMemo(() => Object.fromEntries(ROWS.map((r) => [r.key, new Set(chosen.map((id) => value(id, r.key))).size > 1])), [chosen])

  if (available.length < 2) {
    return (
      <Page title="Compare" large>
        <EmptyState title="Compare needs two deal rooms" body="You can compare assets you have signed an NDA for, up to four at a time." />
      </Page>
    )
  }

  return (
    <Page title="Compare" large subtitle="Up to four assets you have access to, side by side. Every cell links to its evidence." asOf>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {available.map((id) => (
          <Checkbox
            key={id}
            checked={chosen.includes(id)}
            onCheckedChange={(v) => setChosen((c) => (v ? (c.length < 4 ? [...c, id] : c) : c.filter((x) => x !== id)))}
            label={<span className="text-meta">{asset(id).name}</span>}
            className="min-h-9 rounded-full border border-line bg-surface px-3"
          />
        ))}
        <Switch checked={onlyDiff} onCheckedChange={setOnlyDiff} label={<span className="text-meta">Only rows that differ</span>} className="ml-auto" />
      </div>
      <div className="overflow-x-auto rounded-lg border border-line bg-surface shadow-e1">
        <table className="w-full min-w-[640px] border-collapse text-left text-meta">
          <thead>
            <tr className="border-b border-line">
              <th className="sticky left-0 z-10 w-48 bg-surface px-3 py-3 text-micro font-medium uppercase tracking-wide text-muted">Field</th>
              {assets.map((a) => (
                <th key={a.id} className="px-3 py-3 align-top">
                  <p className="font-serif text-h3 font-semibold">{a.name}</p>
                  <p className="font-mono text-micro font-normal text-muted">{a.code}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.filter((r) => !onlyDiff || differs[r.key]).map((r) => (
              <tr key={r.key} className="border-b border-line/70 last:border-0">
                <th scope="row" className="sticky left-0 z-10 bg-surface px-3 py-3 text-left font-medium">
                  {r.label}
                  {differs[r.key] && <span className="ml-1.5 inline-block size-1.5 rounded-full bg-primary align-middle" aria-label="values differ" />}
                </th>
                {assets.map((a) => {
                  const f = FACTS[a.id][r.key as 'licence']
                  return (
                    <td key={a.id} className={cn('px-3 py-3 align-top', differs[r.key] && 'bg-primary-tint/30')}>
                      {r.key === 'tier' ? (
                        <TierBadge tier={a.tier} size="sm" />
                      ) : r.key === 'flags' ? (
                        <FlagCounts counts={assetFlagCounts(a.id)} compact />
                      ) : r.key === 'esg' ? (
                        <StatusStamp status={a.workstreamStatus.esg} size="sm" />
                      ) : (
                        <button type="button" onClick={() => f.ev && open(f.ev)} className={cn('text-left', f.ev ? 'hover:text-primary' : 'cursor-default')}>
                          {f.text}
                          {f.ev && <Link2 className="ml-1 inline size-3 text-primary" aria-label="Open evidence" />}
                        </button>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-micro text-muted">SSD does not rank, score or value these assets. Differences are facts from each passport, as of the passport's release.</p>
    </Page>
  )
}

const SECTIONS = ['Cover and plain-English summary', 'Red-flag register', 'Workstream status', 'Claims ledger with evidence references', 'Map snapshot', 'Questions and answers log']

/** IP-15 · Investment-committee pack */
export function IP15Exports() {
  useDemoState('IP-15', [{ id: 'default', label: 'Default' }] as const)
  const { rooms, org } = useInvestorCtx()
  const [assetId, setAssetId] = useState(rooms[0]?.assetId ?? 'kiboko')
  const [sections, setSections] = useState(SECTIONS.slice(0, 4))
  const [notes, setNotes] = useState(true)
  const a = asset(assetId)
  const pages = sections.length + (notes ? 1 : 0)
  return (
    <Page title="Exports" large subtitle="Build an investment-committee pack. Every page carries the as-of date, version and your watermark.">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="space-y-4 rounded-lg border border-line bg-surface p-4 shadow-e1">
          <div>
            <p className="mb-1.5 text-meta font-medium">Asset</p>
            <div className="flex flex-wrap gap-2">
              {rooms.map((r) => (
                <button
                  key={r.assetId}
                  type="button"
                  aria-pressed={assetId === r.assetId}
                  onClick={() => setAssetId(r.assetId)}
                  className={cn('pressable h-9 rounded-full border px-3.5 text-meta', assetId === r.assetId ? 'border-primary bg-primary-tint text-primary' : 'border-line')}
                >
                  {asset(r.assetId).name}
                </button>
              ))}
            </div>
          </div>
          <fieldset>
            <legend className="mb-1 text-meta font-medium">Sections</legend>
            {SECTIONS.map((s) => (
              <Checkbox key={s} checked={sections.includes(s)} onCheckedChange={(v) => setSections((x) => (v ? [...x, s] : x.filter((y) => y !== s)))} label={s} className="min-h-9" />
            ))}
          </fieldset>
          <Switch checked={notes} onCheckedChange={setNotes} label="Include our private notes" description="Notes appear only in your export, never on the passport" />
          <div className="flex flex-wrap gap-2 border-t border-line pt-4">
            <ButtonLink to={`/print/passport/${a.id}?level=full`} icon={<FileText />}>
              Export PDF
            </ButtonLink>
            <Button variant="secondary" icon={<FileSpreadsheet />} onClick={() => toast.success(`${a.code}-claims.xlsx downloaded (structured data)`)}>
              Export Excel
            </Button>
          </div>
        </section>
        <section aria-label="Preview">
          <p className="mb-2 flex items-center gap-1.5 text-micro font-semibold uppercase tracking-wide text-muted">
            <Eye className="size-3.5" aria-hidden /> Preview · {pages} pages
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[...sections, ...(notes ? ['Our notes (private)'] : [])].map((s, i) => (
              <div key={s} className="relative aspect-[1/1.414] rounded-sm border border-line bg-white p-3 text-[#0f1419] shadow-e1">
                <p className="text-[10px] font-semibold leading-tight">{s}</p>
                <div className="mt-2 space-y-1.5">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <div key={j} className="h-1 rounded-full bg-[#d5dce2]" style={{ width: `${60 + ((i * 13 + j * 7) % 40)}%` }} />
                  ))}
                </div>
                <p className="absolute inset-x-2 bottom-2 text-[8px] leading-tight text-[#52606f]">
                  {a.code} · v{a.passport.version} · as of {fmtDate(NOW)} · {org.name}
                </p>
                {i === 0 && <Check className="absolute right-2 top-2 size-3 text-[#1e6b4a]" aria-hidden />}
              </div>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-micro text-muted">
            <Download className="size-3.5" aria-hidden /> Downloads are watermarked and logged.
          </p>
        </section>
      </div>
    </Page>
  )
}
