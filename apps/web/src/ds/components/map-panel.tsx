import { Layers, Satellite } from 'lucide-react'
import { lazy, Suspense, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { daysUntil, fmtDate } from '@/lib/format'
import { useDemo } from '@/lib/store'
import type { Asset, LngLat } from '@/data'
import { Popover, Skeleton, Switch } from '../ui'
import { DEFAULT_LAYERS, IMAGERY_DATE, LAYER_LABELS, type LayerState } from './map-data'

// MapLibre is loaded only when a map is opened (UI PRD §8: maps load only when opened).
const MapCanvas = lazy(() => import('./map-canvas'))

export interface MapPanelProps {
  asset: Asset
  layers?: Partial<LayerState>
  onLayersChange?: (l: LayerState) => void
  /** Built-in legend, imagery date and layer menu. Turn off when the page supplies its own. */
  chrome?: boolean
  adjust?: boolean
  onClaimedChange?: (corners: LngLat[]) => void
  onChangeClick?: (id: string) => void
  onCaptureClick?: (id: string) => void
  highlightOverlap?: boolean
  interactive?: boolean
  className?: string
  imageryDate?: string
  children?: ReactNode
  showClaimed?: boolean
}

export function MapPanel({
  asset,
  layers: layersProp,
  onLayersChange,
  chrome = true,
  adjust,
  onClaimedChange,
  onChangeClick,
  onCaptureClick,
  highlightOverlap,
  interactive = true,
  className,
  imageryDate = IMAGERY_DATE,
  children,
  showClaimed = true,
}: MapPanelProps) {
  const [local, setLocal] = useState<LayerState>({ ...DEFAULT_LAYERS, claimed: showClaimed, ...layersProp })
  const layers = layersProp && onLayersChange ? { ...DEFAULT_LAYERS, ...layersProp } : local
  const setLayers = (l: LayerState) => (onLayersChange ? onLayersChange(l) : setLocal(l))
  const lowData = useDemo((s) => s.lowData)
  const setLowData = useDemo((s) => s.setLowData)
  const oldImagery = -daysUntil(imageryDate) > 90

  return (
    <div className={cn('relative isolate overflow-hidden rounded-lg border border-line bg-sunken', className ?? 'h-80')}>
      <Suspense fallback={<Skeleton className="absolute inset-0 rounded-none" />}>
        <MapCanvas
          asset={asset}
          layers={layers}
          lowData={lowData}
          adjust={adjust}
          onClaimedChange={onClaimedChange}
          onChangeClick={onChangeClick}
          onCaptureClick={onCaptureClick}
          interactive={interactive}
          highlightOverlap={highlightOverlap}
          className="absolute inset-0"
        />
      </Suspense>
      {chrome && (
        <>
          <div className="pointer-events-none absolute left-2 top-2 z-10 flex flex-col gap-1.5">
            <div className="pointer-events-auto rounded-sm bg-surface/92 px-2.5 py-1.5 text-[11px] shadow-e2 backdrop-blur">
              <p className="flex items-center gap-2 text-fg">
                <span className="h-0.5 w-5 rounded-full bg-primary" aria-hidden /> Registered (Ministry)
              </p>
              {layers.claimed && (
                <p className="mt-1 flex items-center gap-2 text-fg">
                  <span className="h-0 w-5 border-t-2 border-dashed border-brand" aria-hidden /> Drawn by owner
                </p>
              )}
              {highlightOverlap && (
                <p className="mt-1 flex items-center gap-2 text-fg">
                  <span className="size-3 rounded-[2px] bg-garnet/60" aria-hidden /> Forest reserve overlap
                </p>
              )}
            </div>
          </div>
          <div className="absolute bottom-2 left-2 z-10 flex flex-wrap items-center gap-1.5">
            <span className={cn('inline-flex items-center gap-1 rounded-sm bg-surface/92 px-2 py-1 text-[11px] shadow-e2 backdrop-blur', oldImagery ? 'text-review' : 'text-muted')}>
              <Satellite className="size-3" aria-hidden />
              {lowData ? 'Low-data mode: imagery off' : `Imagery ${fmtDate(imageryDate)} (simulated)`}
            </span>
          </div>
          <div className="absolute right-2 top-[84px] z-10 md:top-[80px]">
            <Popover
              align="end"
              side="left"
              className="w-64 p-3"
              trigger={
                <button type="button" className="pressable flex size-[29px] items-center justify-center rounded-lg bg-surface text-fg shadow-e2 max-md:size-10" aria-label="Map layers">
                  <Layers className="size-4" />
                </button>
              }
            >
              <p className="mb-2 text-micro font-semibold uppercase tracking-wide text-muted">Layers</p>
              <div className="space-y-0.5">
                {(Object.keys(LAYER_LABELS) as (keyof LayerState)[]).map((k) => (
                  <Switch key={k} label={<span className="text-meta">{LAYER_LABELS[k]}</span>} checked={layers[k]} onCheckedChange={(v) => setLayers({ ...layers, [k]: v })} className="min-h-9" />
                ))}
                <div className="my-2 h-px bg-line" />
                <Switch label={<span className="text-meta">Low-data mode</span>} description="Vectors only, no imagery" checked={lowData} onCheckedChange={setLowData} className="min-h-9" />
              </div>
            </Popover>
          </div>
        </>
      )}
      {children}
    </div>
  )
}

const PointsCanvas = lazy(() => import('./points-canvas'))

/** Several assets on one lazily loaded map (library search). */
export function PointsMap({ points, onSelect, className }: { points: { id: string; lng: number; lat: number; label: string }[]; onSelect?: (id: string) => void; className?: string }) {
  return (
    <div className={cn('relative isolate overflow-hidden rounded-lg border border-line bg-sunken', className ?? 'h-96')}>
      <Suspense fallback={<Skeleton className="absolute inset-0 rounded-none" />}>
        <PointsCanvas points={points} onSelect={onSelect} className="absolute inset-0" />
      </Suspense>
    </div>
  )
}
