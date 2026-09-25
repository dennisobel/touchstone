import { Check, ChevronLeft, ChevronRight, FileImage, FileSpreadsheet, FileText, Info, Pencil, Sparkles, ZoomIn, ZoomOut } from 'lucide-react'
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { fileSize, fmtDate, fmtDateTime, NOW } from '@/lib/format'
import { doc, person, shortHash, type DocumentItem, type EvidenceRef } from '@/data'
import { Button, Chip, IconButton, Input, Segmented, Sheet, toast } from '../ui'

// ---------------------------------------------------------------------------
// Evidence viewer context: any Evidence Chip opens the cited page, highlighted.
// ---------------------------------------------------------------------------

interface Viewer {
  name: string
  org: string
  email?: string
  zone?: string
}

const Ctx = createContext<{ open: (ref: EvidenceRef) => void; viewer: Viewer } | null>(null)

export function EvidenceViewerProvider({ children, viewer, editable }: { children: ReactNode; viewer: Viewer; editable?: boolean }) {
  const [current, setCurrent] = useState<EvidenceRef | null>(null)
  const value = useMemo(() => ({ open: (ref: EvidenceRef) => setCurrent(ref), viewer }), [viewer])
  const d = current ? doc(current.docId) : undefined
  return (
    <Ctx.Provider value={value}>
      {children}
      <Sheet
        open={!!current}
        onOpenChange={(o) => !o && setCurrent(null)}
        title={d?.name ?? 'Document'}
        description={d ? `${d.type} · ${d.pages} pages · version ${d.version}` : undefined}
        size="xl"
        bodyClassName="p-0 md:p-0"
      >
        {d && current && <DocumentViewer document={d} page={current.page} region={current.region} viewer={viewer} editable={editable} />}
      </Sheet>
    </Ctx.Provider>
  )
}

export function useOpenEvidence() {
  return useContext(Ctx)?.open ?? (() => toast('Evidence viewer is not available here'))
}

const typeIcon = (d?: DocumentItem) => {
  if (!d) return FileText
  if (/\.(jpg|png)$/i.test(d.name)) return FileImage
  if (/\.(xlsx|csv)$/i.test(d.name)) return FileSpreadsheet
  return FileText
}

/** Evidence Chip: document type, name and page; opens the viewer at the cited region. */
export function EvidenceChip({ ev, className }: { ev: EvidenceRef; className?: string }) {
  const open = useOpenEvidence()
  const d = doc(ev.docId)
  const Icon = typeIcon(d)
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        open(ev)
      }}
      className={cn(
        'pressable inline-flex h-7 max-w-full items-center gap-1.5 rounded-sm border border-line bg-surface px-2 text-micro text-fg transition-colors hover:border-primary hover:text-primary max-md:h-9',
        className,
      )}
      aria-label={`Open ${d?.name ?? 'document'}${ev.page ? `, page ${ev.page}` : ''}`}
    >
      <Icon className="size-3.5 shrink-0 text-muted" aria-hidden />
      <span className="truncate">{d?.type ?? 'Document'}</span>
      {ev.page && <span className="shrink-0 tabular-nums text-muted">p. {ev.page}</span>}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Document Viewer
// ---------------------------------------------------------------------------

type Extracted = { field: string; value: string; confidence: number }

const EXTRACTED: Record<string, Extracted[]> = {
  'Licence certificate': [
    { field: 'Licence number', value: 'PL/2024/0117', confidence: 0.99 },
    { field: 'Licence type', value: 'Prospecting licence', confidence: 0.98 },
    { field: 'Holder', value: 'Kiboko Minerals Ltd', confidence: 0.97 },
    { field: 'Grant date', value: '15 Mar 2024', confidence: 0.95 },
    { field: 'Expiry date', value: '14 Mar 2027', confidence: 0.96 },
    { field: 'Area', value: '1,860 ha', confidence: 0.72 },
  ],
  'Resource report': [
    { field: 'Reporting code', value: 'JORC (2012)', confidence: 0.99 },
    { field: 'Classification', value: 'Inferred', confidence: 0.94 },
    { field: 'Tonnage', value: '12.4 Mt', confidence: 0.91 },
    { field: 'Grade', value: '8.1% Cg', confidence: 0.9 },
    { field: 'Cut-off', value: '4% Cg', confidence: 0.63 },
    { field: 'Effective date', value: '30 Jun 2025', confidence: 0.88 },
  ],
  'Portal capture': [
    { field: 'Licence status', value: 'Active', confidence: 0.99 },
    { field: 'Holder', value: 'Kiboko Minerals Ltd', confidence: 0.98 },
    { field: 'Expiry date', value: '14/03/2027', confidence: 0.97 },
  ],
  'Registry extract': [
    { field: 'Company number', value: 'PVT-7XK2L9Q', confidence: 0.96 },
    { field: 'Shareholder 1', value: 'Grace Wanjiku, 72%', confidence: 0.93 },
    { field: 'Shareholder 2', value: 'Ndege Capital Ltd, 28%', confidence: 0.92 },
  ],
}

export function DocumentViewer({
  document: d,
  page: initialPage = 1,
  region,
  viewer,
  editable,
  className,
  showFields = true,
}: {
  document: DocumentItem
  page?: number
  region?: string
  viewer: Viewer
  editable?: boolean
  className?: string
  showFields?: boolean
}) {
  const [page, setPage] = useState(initialPage)
  const [zoom, setZoom] = useState(1)
  const [panel, setPanel] = useState<'fields' | 'info'>(EXTRACTED[d.type] && showFields ? 'fields' : 'info')
  const [version, setVersion] = useState(String(d.version))
  const pages = Math.max(1, d.pages)
  const thumbs = Array.from({ length: Math.min(pages, 12) }, (_, i) => i + 1)
  const stamp = `${viewer.name} · ${viewer.org}${viewer.email ? ` · ${viewer.email}` : ''} · ${fmtDateTime(NOW, viewer.zone ?? 'EAT')}`

  return (
    <div className={cn('@container h-full', className)}>
    <div className="flex h-full min-h-[60dvh] flex-col @4xl:flex-row">
      {/* Thumbnails */}
      <div className="no-scrollbar order-2 flex gap-2 overflow-x-auto border-t border-line bg-sunken/60 p-2 @4xl:order-none @4xl:w-24 @4xl:flex-col @4xl:overflow-y-auto @4xl:border-t-0 @4xl:border-r">
        {thumbs.map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
            className={cn('relative h-20 w-14 shrink-0 rounded-sm border bg-white p-1.5 shadow-e1 @4xl:mx-auto', p === page ? 'border-primary ring-2 ring-primary' : 'border-line')}
          >
            <PageSketch seed={d.id + p} small />
            <span className="absolute bottom-0.5 right-1 text-[9px] text-[#52606f]">{p}</span>
          </button>
        ))}
      </div>

      {/* Page */}
      <div className="relative order-1 min-w-0 flex-1 @4xl:order-none">
        <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
          <div className="flex items-center gap-1">
            <IconButton label="Previous page" size="sm" variant="quiet" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft />
            </IconButton>
            <span className="text-micro tabular-nums text-muted">
              Page {page} of {pages}
            </span>
            <IconButton label="Next page" size="sm" variant="quiet" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight />
            </IconButton>
          </div>
          <div className="flex items-center gap-1">
            <IconButton label="Zoom out" size="sm" variant="quiet" onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}>
              <ZoomOut />
            </IconButton>
            <IconButton label="Zoom in" size="sm" variant="quiet" onClick={() => setZoom((z) => Math.min(1.8, z + 0.2))}>
              <ZoomIn />
            </IconButton>
            {d.version > 1 && (
              <select
                aria-label="Version"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="h-8 rounded-sm border border-line bg-surface px-2 text-micro"
              >
                {Array.from({ length: d.version }, (_, i) => d.version - i).map((v) => (
                  <option key={v} value={v}>
                    v{v}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
        <div className="scroll-touch max-h-[62dvh] overflow-auto bg-sunken p-3 @lg:p-6 @4xl:max-h-[calc(100dvh-180px)]">
          <div
            className="relative mx-auto aspect-[1/1.414] w-full max-w-[640px] origin-top overflow-hidden rounded-sm bg-white p-[7%] text-[#0f1419] shadow-e2 transition-transform"
            style={{ transform: `scale(${zoom})` }}
          >
            <PageContent d={d} page={page} />
            {region && page === initialPage && (
              <div className="absolute inset-x-[6%] top-[38%] h-[22%] rounded-sm border-2 border-[#1f4e8c] bg-[#1f4e8c]/10">
                <span className="absolute -top-6 left-0 rounded-sm bg-[#1f4e8c] px-1.5 py-0.5 text-[11px] font-semibold text-white">Cited: {region}</span>
              </div>
            )}
            {/* Watermark on every view (M04-5) */}
            <div className="pointer-events-none absolute inset-0 flex select-none flex-col justify-around overflow-hidden opacity-[0.13]" aria-hidden>
              {Array.from({ length: 6 }).map((_, i) => (
                <p key={i} className="-rotate-[24deg] whitespace-nowrap text-center text-[13px] font-semibold text-[#0f1419]">
                  {stamp}
                </p>
              ))}
            </div>
          </div>
        </div>
        <p className="sr-only">Watermarked for {stamp}</p>
      </div>

      {/* Side panel */}
      <aside className="order-3 border-t border-line @4xl:w-80 @4xl:border-t-0 @4xl:border-l">
        <div className="border-b border-line p-2">
          <Segmented
            ariaLabel="Panel"
            value={panel}
            onChange={setPanel}
            block
            size="sm"
            options={[
              ...(EXTRACTED[d.type] && showFields ? [{ value: 'fields' as const, label: 'Extracted fields', icon: <Sparkles /> }] : []),
              { value: 'info' as const, label: 'Info', icon: <Info /> },
            ]}
          />
        </div>
        <div className="max-h-[50dvh] overflow-y-auto p-4 @4xl:max-h-[calc(100dvh-180px)]">
          {panel === 'fields' && EXTRACTED[d.type] ? <ExtractedFields fields={EXTRACTED[d.type]} editable={editable} /> : <DocInfo d={d} />}
        </div>
      </aside>
    </div>
    </div>
  )
}

function ExtractedFields({ fields, editable }: { fields: Extracted[]; editable?: boolean }) {
  const [state, setState] = useState<Record<string, 'confirmed' | 'corrected' | undefined>>({})
  const [editing, setEditing] = useState<string | null>(null)
  const [values, setValues] = useState<Record<string, string>>({})
  return (
    <div className="space-y-3">
      <p className="flex items-start gap-2 rounded-sm bg-primary-tint p-2.5 text-micro text-primary">
        <Sparkles className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        AI suggestions with page citations. A person confirms each field before it becomes a claim.
      </p>
      <ul className="space-y-2">
        {fields.map((f) => {
          const low = f.confidence < 0.8
          const s = state[f.field]
          return (
            <li key={f.field} className={cn('rounded-sm border p-2.5', low && !s ? 'border-review-border bg-review-fill/50' : 'border-line')}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-micro text-muted">{f.field}</span>
                <span className={cn('text-[11px] font-semibold tabular-nums', low ? 'text-review' : 'text-muted')}>{Math.round(f.confidence * 100)}%{low && ' · low'}</span>
              </div>
              {editing === f.field ? (
                <div className="mt-1.5 flex gap-1.5">
                  <Input
                    autoFocus
                    defaultValue={values[f.field] ?? f.value}
                    aria-label={f.field}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setValues((v) => ({ ...v, [f.field]: (e.target as HTMLInputElement).value }))
                        setState((st) => ({ ...st, [f.field]: 'corrected' }))
                        setEditing(null)
                      }
                    }}
                  />
                  <Button size="sm" onClick={() => setEditing(null)} variant="secondary">
                    Cancel
                  </Button>
                </div>
              ) : (
                <p className="mt-0.5 text-meta font-medium text-fg">{values[f.field] ?? f.value}</p>
              )}
              {s ? (
                <Chip tone={s === 'confirmed' ? 'verified' : 'disputed'} size="sm" className="mt-2" icon={s === 'confirmed' ? <Check /> : <Pencil />}>
                  {s === 'confirmed' ? 'Confirmed by you' : 'Corrected by you'}
                </Chip>
              ) : (
                editable &&
                editing !== f.field && (
                  <div className="mt-2 flex gap-1.5">
                    <Button size="xs" variant="tint" icon={<Check />} onClick={() => setState((st) => ({ ...st, [f.field]: 'confirmed' }))}>
                      Confirm
                    </Button>
                    <Button size="xs" variant="ghost" icon={<Pencil />} onClick={() => setEditing(f.field)}>
                      Correct
                    </Button>
                  </div>
                )
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function DocInfo({ d }: { d: DocumentItem }) {
  return (
    <dl className="space-y-3 text-micro">
      {[
        ['Type', d.type],
        ['Folder', d.folder],
        ['Uploaded', `${fmtDate(d.uploadedOn)} by ${person(d.uploadedBy).name}`],
        ['Pages', String(d.pages)],
        ['Size', fileSize(d.sizeBytes)],
        ['Version', `v${d.version}`],
        ['Disclosure level', d.level],
        ['Download', d.download ? 'Permitted, watermarked' : 'View only'],
      ].map(([k, v]) => (
        <div key={k}>
          <dt className="text-muted">{k}</dt>
          <dd className="text-meta text-fg">{v}</dd>
        </div>
      ))}
      <div>
        <dt className="text-muted">SHA-256 fingerprint (taken at upload)</dt>
        <dd className="mt-0.5 break-all font-mono text-[12px] leading-4 text-fg" title={d.sha256}>
          {d.sha256}
        </dd>
        <dd className="mt-1 text-muted">Short: {shortHash(d.sha256)}</dd>
      </div>
    </dl>
  )
}

// Simulated page renderings: grey text bars plus a few recognisable layouts.
function rand(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

function PageSketch({ seed, small }: { seed: string; small?: boolean }) {
  const r = rand(seed)
  const lines = small ? 9 : 18
  return (
    <div className="space-y-[6%]">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="rounded-full bg-[#d5dce2]" style={{ height: small ? 2 : 6, width: `${55 + r() * 45}%` }} />
      ))}
    </div>
  )
}

function PageContent({ d, page }: { d: DocumentItem; page: number }) {
  if (d.type === 'Resource report' && page === 47) {
    return (
      <div className="space-y-3 text-[11px] leading-snug sm:text-[12px]">
        <p className="text-[13px] font-semibold">14.3 Mineral Resource statement</p>
        <PageSketch seed={d.id + 'intro'} small />
        <table className="mt-6 w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[#7d8a98]">
              {['Classification', 'Tonnes (Mt)', 'Cg (%)', 'Contained graphite (kt)'].map((h) => (
                <th key={h} className="py-1 pr-2 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="tabular-nums">
            <tr className="border-b border-[#d5dce2]">
              <td className="py-1">Inferred</td>
              <td>12.4</td>
              <td>8.1</td>
              <td>1,004</td>
            </tr>
            <tr>
              <td className="py-1 font-semibold">Total</td>
              <td className="font-semibold">12.4</td>
              <td className="font-semibold">8.1</td>
              <td className="font-semibold">1,004</td>
            </tr>
          </tbody>
        </table>
        <p className="text-[10px] text-[#52606f]">Reported at a 4% Cg cut-off. Effective date 30 June 2025. Competent Person: S. Otieno, MAusIMM.</p>
        <PageSketch seed={d.id + 'outro'} small />
      </div>
    )
  }
  if (d.type === 'Portal capture') {
    return (
      <div className="space-y-3 text-[11px] sm:text-[12px]">
        <div className="flex items-center justify-between rounded-sm bg-[#1f4e8c] px-3 py-2 text-white">
          <span className="font-semibold">Mining Cadastre Portal · Licence details</span>
          <span>Captured {d.uploadedOn}</span>
        </div>
        <dl className="grid grid-cols-2 gap-2">
          {[
            ['Licence number', d.assetId === 'kiboko' ? 'PL/2024/0117' : d.assetId === 'mawe' ? 'PL/2025/0206' : 'MP/2023/0442'],
            ['Type', d.assetId === 'nyanza' ? 'Mining permit' : 'Prospecting licence'],
            ['Holder', d.assetId === 'kiboko' ? 'Kiboko Minerals Ltd' : d.assetId === 'mawe' ? 'Mawe Mekundu Resources Ltd' : 'Peter Ouma'],
            ['Status', 'Active'],
            ['Expiry', d.assetId === 'kiboko' ? '14/03/2027' : d.assetId === 'mawe' ? '09/06/2028' : '01/05/2028'],
            ['Area', d.assetId === 'kiboko' ? '1,860 ha' : d.assetId === 'mawe' ? '2,090 ha' : '46 ha'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-sm border border-[#d5dce2] p-2">
              <dt className="text-[#52606f]">{k}</dt>
              <dd className="font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="h-32 rounded-sm bg-[#e9ede6]" />
        <p className="text-[10px] text-[#52606f]">Source URL, retrieval time and capture image stored with the evidence record.</p>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <p className="text-[13px] font-semibold">
        {d.name.replace(/\.(pdf|jpg|png|xlsx|geojson)$/i, '')}
        {pages(d) > 1 && <span className="font-normal text-[#52606f]"> · page {page}</span>}
      </p>
      <PageSketch seed={d.id + page} />
    </div>
  )
}
const pages = (d: DocumentItem) => d.pages
