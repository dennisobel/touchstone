import { Camera, Download, ImagePlus, Ruler, Satellite, TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { useDemoState } from '@/lib/demo-states'
import { fmtDate } from '@/lib/format'
import { useDemo } from '@/lib/store'
import { flagsFor } from '@/data'
import { Banner, DEFAULT_LAYERS, IMAGERY_DATE, LAYER_LABELS, MapPanel, RedFlagCard, type LayerState } from '@/ds/components'
import { Button, Checkbox, Chip, Sheet, Switch, toast } from '@/ds/ui'
import { useAsset } from './CC04Asset'

const STATES = [
  { id: 'default', label: 'Default' },
  { id: 'old', label: 'Imagery older than 90 days' },
  { id: 'lowdata', label: 'Low-data mode' },
] as const

const SWATCH: Partial<Record<keyof LayerState, string>> = {
  imagery: 'bg-[linear-gradient(135deg,#627c48,#b09c70)]',
  protectedAreas: 'bg-[#2f7d4a]',
  settlements: 'bg-muted',
  water: 'bg-[#6fa8d6]',
  roads: 'bg-[#8a96a3]',
  rail: 'bg-muted',
  power: 'bg-ochre',
  otherLicences: 'border border-dashed border-muted',
  artisanal: 'bg-ochre/60',
  changes: 'bg-[#eda100]',
  captures: 'bg-primary rounded-full',
  claimed: 'border-2 border-dashed border-brand',
}

const CHANGES = [
  { id: 'chg-1', area: '1.4 ha', where: 'North-east corner, adjoining artisanal workings', since: '14 Aug → 14 Sep 2026' },
  { id: 'chg-2', area: '1.1 ha', where: '400 m east of the registered boundary', since: '14 Aug → 14 Sep 2026' },
]

export default function CC06Map() {
  const a = useAsset()
  const [state] = useDemoState('CC-06', STATES)
  const setLowData = useDemo((s) => s.setLowData)
  const lowData = useDemo((s) => s.lowData)
  const [layers, setLayers] = useState<LayerState>({ ...DEFAULT_LAYERS, otherLicences: true, changes: true, captures: true })
  const [review, setReview] = useState<string | null>(null)
  const critical = flagsFor(a.id).find((f) => f.severity === 'critical' && f.status === 'open')
  const imageryDate = state === 'old' ? '2026-05-30' : IMAGERY_DATE

  useEffect(() => {
    setLowData(state === 'lowdata')
    return () => setLowData(false)
  }, [state, setLowData])

  const distances = [
    { label: 'Port', value: `${a.distances.port} km`, note: a.region === 'Coast region' ? 'Mombasa' : 'Mombasa (road)' },
    { label: 'Rail', value: `${a.distances.rail} km`, note: 'Standard gauge railway' },
    { label: 'Power line', value: `${a.distances.power} km`, note: 'Grid, 33 kV' },
    { label: 'Paved road', value: `${a.distances.road} km`, note: 'Nearest junction' },
  ]

  return (
    <div className="space-y-3">
      {state === 'old' && (
        <Banner tone="warning" icon={<TriangleAlert />} title={`Imagery is from ${fmtDate(imageryDate)}, older than 90 days`} action={<Button size="sm" variant="secondary">Order new image</Button>}>
          Change detection may miss recent disturbance. High-resolution imagery needs cost approval.
        </Banner>
      )}
      <div className="grid gap-3 lg:grid-cols-[240px_minmax(0,1fr)_280px]">
        {/* Layers tree */}
        <aside className="order-2 rounded-lg border border-line bg-surface shadow-e1 lg:order-none">
          <p className="border-b border-line px-4 py-3 text-micro font-semibold uppercase tracking-wide text-muted">Layers</p>
          <ul className="space-y-0.5 p-2">
            {(Object.keys(LAYER_LABELS) as (keyof LayerState)[]).map((k) => (
              <li key={k} className="flex items-center gap-2 rounded-sm px-1.5 hover:bg-sunken/60">
                <Checkbox checked={layers[k]} onCheckedChange={(v) => setLayers({ ...layers, [k]: v })} label={<span className="text-meta">{LAYER_LABELS[k]}</span>} className="min-h-8 flex-1 py-0" />
                <span className={cn('size-3 shrink-0 rounded-[3px]', SWATCH[k])} aria-hidden />
              </li>
            ))}
          </ul>
          <div className="border-t border-line p-3">
            <Switch label={<span className="text-meta">Low-data mode</span>} description="Vectors only" checked={lowData} onCheckedChange={setLowData} className="min-h-8" />
          </div>
        </aside>

        {/* Map */}
        <div className="order-1 space-y-2 lg:order-none">
          <MapPanel
            asset={a}
            layers={layers}
            onLayersChange={setLayers}
            className="h-[58dvh] min-h-80 lg:h-[calc(100dvh-280px)]"
            highlightOverlap={!!critical}
            imageryDate={imageryDate}
            onChangeClick={(id) => setReview(id)}
            onCaptureClick={(id) => toast(`Field capture ${id} · stamped with time, GPS and fingerprint`)}
          />
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-micro text-muted">
            <span>Area difference, drawn vs registered: {a.id === 'nyanza' ? '+41%' : a.id === 'kiboko' ? '+2.1%' : '0%'}</span>
            <span className="inline-flex items-center gap-1">
              <Satellite className="size-3" aria-hidden /> Sentinel-2 (simulated) · {fmtDate(imageryDate)}
            </span>
          </p>
        </div>

        {/* Properties */}
        <aside className="order-3 space-y-3">
          {critical && <RedFlagCard flag={critical} showWorkstream={false} />}
          <section className="rounded-lg border border-line bg-surface shadow-e1">
            <p className="border-b border-line px-4 py-3 text-micro font-semibold uppercase tracking-wide text-muted">Distances</p>
            <dl className="grid grid-cols-2 gap-px bg-line">
              {distances.map((d) => (
                <div key={d.label} className="bg-surface px-4 py-3">
                  <dt className="text-micro text-muted">{d.label}</dt>
                  <dd className="text-h3 font-semibold tabular-nums">{d.value}</dd>
                  <dd className="text-[11px] text-muted">{d.note}</dd>
                </div>
              ))}
            </dl>
          </section>
          {layers.changes && a.id === 'kiboko' && (
            <section className="rounded-lg border border-line bg-surface shadow-e1">
              <p className="border-b border-line px-4 py-3 text-micro font-semibold uppercase tracking-wide text-muted">Change detection · since last month</p>
              <ul className="divide-y divide-line">
                {CHANGES.map((c) => (
                  <li key={c.id} className="flex items-start gap-3 px-4 py-3">
                    <span className="mt-1 size-3 shrink-0 rounded-[3px] bg-[#eda100]" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="text-meta font-medium">New disturbance · {c.area}</p>
                      <p className="text-micro text-muted">{c.where}</p>
                    </div>
                    <Button size="xs" variant="tint" onClick={() => setReview(c.id)}>
                      Review
                    </Button>
                  </li>
                ))}
              </ul>
              <p className="px-4 pb-3 text-[11px] text-muted">Over 1 ha goes to an analyst; never straight to a red flag (M10-4).</p>
            </section>
          )}
          {layers.captures && a.id === 'kiboko' && (
            <section className="rounded-lg border border-line bg-surface p-4 shadow-e1">
              <p className="mb-2 text-micro font-semibold uppercase tracking-wide text-muted">Field captures · 2 Sep 2026</p>
              <div className="grid grid-cols-5 gap-1.5">
                {['Beacon NW-1', 'Beacon NE-2', 'Artisanal pits', 'Core shed', 'Borehole B2'].map((c, i) => (
                  <button key={c} type="button" title={c} onClick={() => toast(c)} className="flex aspect-square items-center justify-center rounded-sm bg-[radial-gradient(ellipse_at_30%_40%,#7b8a5a,#3a4430)] text-white/90">
                    <Camera className="size-3.5" aria-label={c} />
                    <span className="sr-only">{i}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" icon={<Download />} onClick={() => toast.success(`${a.code}.kml downloaded`)}>
              KML
            </Button>
            <Button variant="secondary" icon={<Download />} onClick={() => toast.success(`${a.code}.geojson downloaded`)}>
              GeoJSON
            </Button>
            <Button variant="tint" className="col-span-2" icon={<ImagePlus />} onClick={() => toast.success('Dated map snapshot added to the passport draft')}>
              Add snapshot to passport
            </Button>
          </div>
          <p className="flex items-center gap-1 text-[11px] text-muted">
            <Ruler className="size-3" aria-hidden /> Measure tool: shift-drag on the map (demo)
          </p>
        </aside>
      </div>

      <Sheet
        open={!!review}
        onOpenChange={(o) => !o && setReview(null)}
        title="Review change"
        description={CHANGES.find((c) => c.id === review)?.where}
        desktop="center"
        size="sm"
        footer={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => (toast('Dismissed with reason: seasonal cultivation'), setReview(null))}>
              Dismiss
            </Button>
            <Button variant="secondary" onClick={() => (toast.success('Field check task created for Brian Kiptoo'), setReview(null))}>
              Request field check
            </Button>
            <Button onClick={() => (toast.success('Linked to existing Medium flag: artisanal digging'), setReview(null))}>Link to flag</Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="aspect-square rounded-sm bg-[radial-gradient(ellipse_at_40%_50%,#6f8a52,#3e4a32)]" />
            <div className="relative aspect-square rounded-sm bg-[radial-gradient(ellipse_at_40%_50%,#b09c70,#6f8a52_60%,#3e4a32)]">
              <span className="absolute inset-[30%] rounded-sm border-2 border-[#eda100]" />
            </div>
          </div>
          <p className="text-micro text-muted">Before 14 Aug · After 14 Sep · {CHANGES.find((c) => c.id === review)?.area}</p>
          <Chip tone="review">Analyst decision required</Chip>
        </div>
      </Sheet>
    </div>
  )
}
