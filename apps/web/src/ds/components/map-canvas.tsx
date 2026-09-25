import type { LayerSpecification, MapLayerMouseEvent, StyleSpecification } from 'maplibre-gl'
import { maplibregl } from './maplibre'
import { useEffect, useRef, useState } from 'react'
import type { Asset, LngLat } from '@/data'
import { geoFor, type AssetGeo, type LayerState } from './map-data'

export interface MapCanvasProps {
  asset: Asset
  layers: LayerState
  lowData?: boolean
  adjust?: boolean
  onClaimedChange?: (corners: LngLat[]) => void
  onChangeClick?: (id: string) => void
  onCaptureClick?: (id: string) => void
  interactive?: boolean
  className?: string
  highlightOverlap?: boolean
}

function css(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888'
}

function palette() {
  const dark = document.documentElement.classList.contains('dark')
  return {
    dark,
    land: css('--map-land'),
    water: css('--map-water'),
    primary: css('--primary'),
    brand: css('--brand'),
    garnet: css('--sev-garnet'),
    ochre: css('--sev-ochre'),
    muted: css('--text-muted'),
    border: css('--border-strong'),
    forest: dark ? '#3f8a5a' : '#2f7d4a',
    road: dark ? '#8b98a6' : '#8a96a3',
    amber: dark ? '#f2c063' : '#eda100',
  }
}

// Simulated medium-resolution imagery, generated locally (no external images).
const imageryCache = new Map<string, string>()
function makeImagery(seed: string, dark: boolean) {
  const key = seed + dark
  if (imageryCache.has(key)) return imageryCache.get(key)!
  const N = 256
  const c = document.createElement('canvas')
  c.width = c.height = N
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(N, N)
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  const grid = (g: number) => {
    const vals: number[] = []
    for (let i = 0; i < (g + 1) * (g + 1); i++) {
      h = Math.imul(h ^ (h >>> 15), 2246822507) ^ i
      vals.push(((h >>> 0) % 1000) / 1000)
    }
    return (x: number, y: number) => {
      const gx = (x / N) * g
      const gy = (y / N) * g
      const x0 = Math.floor(gx)
      const y0 = Math.floor(gy)
      const tx = gx - x0
      const ty = gy - y0
      const sx = tx * tx * (3 - 2 * tx)
      const sy = ty * ty * (3 - 2 * ty)
      const v = (i: number, j: number) => vals[j * (g + 1) + i]
      const a = v(x0, y0) * (1 - sx) + v(x0 + 1, y0) * sx
      const b = v(x0, y0 + 1) * (1 - sx) + v(x0 + 1, y0 + 1) * sx
      return a * (1 - sy) + b * sy
    }
  }
  const o1 = grid(6)
  const o2 = grid(18)
  const o3 = grid(60)
  const dry = dark ? [74, 66, 50] : [176, 156, 112]
  const green = dark ? [44, 64, 40] : [98, 124, 72]
  const deep = dark ? [30, 42, 30] : [62, 82, 50]
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const n = o1(x, y) * 0.55 + o2(x, y) * 0.3 + o3(x, y) * 0.15
      const t = Math.max(0, Math.min(1, (n - 0.3) / 0.45))
      const mix = t < 0.5 ? [dry, green, t * 2] : [green, deep, (t - 0.5) * 2]
      const [A, B, k] = mix as [number[], number[], number]
      const i = (y * N + x) * 4
      img.data[i] = A[0] + (B[0] - A[0]) * k
      img.data[i + 1] = A[1] + (B[1] - A[1]) * k
      img.data[i + 2] = A[2] + (B[2] - A[2]) * k
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  const url = c.toDataURL('image/jpeg', 0.82)
  imageryCache.set(key, url)
  return url
}

const LAYER_GROUPS: Record<keyof LayerState, string[]> = {
  imagery: ['imagery'],
  protectedAreas: ['protected-fill', 'protected-line'],
  settlements: [],
  water: ['water', 'ocean'],
  roads: ['roads-paved', 'roads-track'],
  rail: ['rail'],
  power: ['power'],
  otherLicences: ['other-fill', 'other-line'],
  artisanal: ['artisanal-fill', 'artisanal-line'],
  changes: ['changes-fill', 'changes-line'],
  captures: [],
  claimed: ['claimed-line'],
}

function buildStyle(asset: Asset, geo: AssetGeo, layers: LayerState, lowData: boolean, highlightOverlap: boolean): StyleSpecification {
  const p = palette()
  const vis = (k: keyof LayerState) => (layers[k] && !(k === 'imagery' && lowData) ? 'visible' : 'none') as 'visible' | 'none'
  const L: LayerSpecification[] = [
    { id: 'bg', type: 'background', paint: { 'background-color': p.land } },
    { id: 'imagery', type: 'raster', source: 'imagery', layout: { visibility: vis('imagery') }, paint: { 'raster-opacity': 0.9 } },
    { id: 'ocean', type: 'fill', source: 'ocean', layout: { visibility: vis('water') }, paint: { 'fill-color': p.water } },
    { id: 'protected-fill', type: 'fill', source: 'protected', layout: { visibility: vis('protectedAreas') }, paint: { 'fill-color': p.forest, 'fill-opacity': 0.22 } },
    { id: 'protected-line', type: 'line', source: 'protected', layout: { visibility: vis('protectedAreas') }, paint: { 'line-color': p.forest, 'line-width': 1.5, 'line-dasharray': [3, 2] } },
    { id: 'water', type: 'line', source: 'water', layout: { visibility: vis('water'), 'line-cap': 'round' }, paint: { 'line-color': p.water, 'line-width': 3 } },
    { id: 'other-fill', type: 'fill', source: 'other', layout: { visibility: vis('otherLicences') }, paint: { 'fill-color': p.muted, 'fill-opacity': 0.08 } },
    { id: 'other-line', type: 'line', source: 'other', layout: { visibility: vis('otherLicences') }, paint: { 'line-color': p.muted, 'line-width': 1.2, 'line-dasharray': [4, 2] } },
    { id: 'roads-paved', type: 'line', source: 'roads', filter: ['==', ['get', 'kind'], 'paved'], layout: { visibility: vis('roads'), 'line-cap': 'round' }, paint: { 'line-color': p.road, 'line-width': 3.5 } },
    { id: 'roads-track', type: 'line', source: 'roads', filter: ['==', ['get', 'kind'], 'track'], layout: { visibility: vis('roads') }, paint: { 'line-color': p.road, 'line-width': 1.6, 'line-dasharray': [2, 1.5] } },
    { id: 'rail', type: 'line', source: 'rail', layout: { visibility: vis('rail') }, paint: { 'line-color': p.muted, 'line-width': 2, 'line-dasharray': [1, 1] } },
    { id: 'power', type: 'line', source: 'power', layout: { visibility: vis('power') }, paint: { 'line-color': p.ochre, 'line-width': 1.6, 'line-dasharray': [6, 3] } },
    { id: 'registered-fill', type: 'fill', source: 'registered', paint: { 'fill-color': p.primary, 'fill-opacity': 0.1 } },
    { id: 'registered-line', type: 'line', source: 'registered', paint: { 'line-color': p.primary, 'line-width': 2.5 } },
    { id: 'claimed-line', type: 'line', source: 'claimed', layout: { visibility: vis('claimed') }, paint: { 'line-color': p.brand, 'line-width': 2.2, 'line-dasharray': [2.5, 1.5] } },
    { id: 'artisanal-fill', type: 'fill', source: 'artisanal', layout: { visibility: vis('artisanal') }, paint: { 'fill-color': p.ochre, 'fill-opacity': 0.35 } },
    { id: 'artisanal-line', type: 'line', source: 'artisanal', layout: { visibility: vis('artisanal') }, paint: { 'line-color': p.ochre, 'line-width': 1.5 } },
    { id: 'changes-fill', type: 'fill', source: 'changes', layout: { visibility: vis('changes') }, paint: { 'fill-color': p.amber, 'fill-opacity': 0.45 } },
    { id: 'changes-line', type: 'line', source: 'changes', layout: { visibility: vis('changes') }, paint: { 'line-color': p.amber, 'line-width': 2 } },
    { id: 'overlap-fill', type: 'fill', source: 'overlap', layout: { visibility: highlightOverlap ? 'visible' : 'none' }, paint: { 'fill-color': p.garnet, 'fill-opacity': 0.35 } },
    { id: 'overlap-line', type: 'line', source: 'overlap', layout: { visibility: highlightOverlap ? 'visible' : 'none' }, paint: { 'line-color': p.garnet, 'line-width': 2 } },
  ]
  return {
    version: 8,
    sources: {
      imagery: { type: 'image', url: makeImagery(asset.id, p.dark), coordinates: geo.imageryBounds },
      ocean: { type: 'geojson', data: geo.ocean },
      protected: { type: 'geojson', data: geo.protectedAreas },
      water: { type: 'geojson', data: geo.water },
      other: { type: 'geojson', data: geo.otherLicences },
      roads: { type: 'geojson', data: geo.roads },
      rail: { type: 'geojson', data: geo.rail },
      power: { type: 'geojson', data: geo.power },
      registered: { type: 'geojson', data: geo.registered },
      claimed: { type: 'geojson', data: geo.claimed },
      artisanal: { type: 'geojson', data: geo.artisanal },
      changes: { type: 'geojson', data: geo.changes },
      overlap: { type: 'geojson', data: geo.forestOverlap },
    },
    layers: L,
  }
}

function labelEl(text: string, kind: 'settlement' | 'capture' | 'port') {
  const el = document.createElement('div')
  if (kind === 'capture') {
    el.className = 'ts-capture-pin'
    el.innerHTML = `<span style="display:flex;width:26px;height:26px;border-radius:999px;background:var(--primary);color:var(--on-primary);align-items:center;justify-content:center;box-shadow:var(--e2);border:2px solid var(--surface);font:600 11px Inter Variable,sans-serif">●</span>`
    el.title = text
    el.style.cursor = 'pointer'
    return el
  }
  el.style.cssText =
    'font:600 11px/1.2 Inter Variable,system-ui,sans-serif;color:var(--text);background:color-mix(in srgb,var(--surface) 85%,transparent);padding:2px 6px;border-radius:4px;box-shadow:var(--e1);white-space:nowrap;pointer-events:none'
  el.textContent = (kind === 'port' ? '⚓ ' : '') + text
  return el
}

export default function MapCanvas({
  asset,
  layers,
  lowData = false,
  adjust,
  onClaimedChange,
  onChangeClick,
  onCaptureClick,
  interactive = true,
  className,
  highlightOverlap,
}: MapCanvasProps) {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const geoRef = useRef<AssetGeo | null>(null)
  const markers = useRef<{ settlements: maplibregl.Marker[]; captures: maplibregl.Marker[]; corners: maplibregl.Marker[] }>({ settlements: [], captures: [], corners: [] })
  const [ready, setReady] = useState(false)
  const [themeTick, setThemeTick] = useState(0)
  const layersRef = useRef(layers)
  layersRef.current = layers

  // Create the map once per asset.
  useEffect(() => {
    if (!ref.current) return
    const geo = geoFor(asset)
    geoRef.current = geo
    const map = new maplibregl.Map({
      container: ref.current,
      style: buildStyle(asset, geo, layersRef.current, lowData, !!highlightOverlap),
      bounds: geo.bounds as maplibregl.LngLatBoundsLike,
      fitBoundsOptions: { padding: 48 },
      attributionControl: false,
      interactive,
      dragRotate: false,
      pitchWithRotate: false,
      cooperativeGestures: false,
    })
    map.touchZoomRotate.disableRotation()
    if (interactive) map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric', maxWidth: 90 }), 'bottom-right')
    map.addControl(new maplibregl.AttributionControl({ compact: true, customAttribution: 'Reference layers: simulated sample data' }))
    map.on('load', () => setReady(true))
    map.on('click', 'changes-fill', (e: MapLayerMouseEvent) => {
      const id = e.features?.[0]?.properties?.id
      if (id) onChangeClick?.(String(id))
    })
    map.on('mouseenter', 'changes-fill', () => (map.getCanvas().style.cursor = 'pointer'))
    map.on('mouseleave', 'changes-fill', () => (map.getCanvas().style.cursor = ''))
    mapRef.current = map

    const obs = new MutationObserver(() => setThemeTick((t) => t + 1))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => {
      obs.disconnect()
      map.remove()
      mapRef.current = null
      setReady(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset.id])

  // Theme change: rebuild style colours, keep camera.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !geoRef.current || themeTick === 0) return
    map.setStyle(buildStyle(asset, geoRef.current, layersRef.current, lowData, !!highlightOverlap), { diff: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeTick])

  // Layer visibility.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    for (const k of Object.keys(LAYER_GROUPS) as (keyof LayerState)[]) {
      const on = layers[k] && !(k === 'imagery' && lowData)
      for (const id of LAYER_GROUPS[k]) if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none')
    }
    for (const id of ['overlap-fill', 'overlap-line']) if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', highlightOverlap ? 'visible' : 'none')
  }, [layers, lowData, ready, highlightOverlap, themeTick])

  // HTML markers: settlements, ports and field captures.
  useEffect(() => {
    const map = mapRef.current
    const geo = geoRef.current
    if (!map || !geo || !ready) return
    markers.current.settlements.forEach((m) => m.remove())
    markers.current.captures.forEach((m) => m.remove())
    markers.current.settlements = []
    markers.current.captures = []
    if (layers.settlements) {
      for (const s of geo.settlements) markers.current.settlements.push(new maplibregl.Marker({ element: labelEl(s.name, 'settlement') }).setLngLat(s.at).addTo(map))
      for (const s of geo.ports) markers.current.settlements.push(new maplibregl.Marker({ element: labelEl(s.name, 'port') }).setLngLat(s.at).addTo(map))
    }
    if (layers.captures) {
      for (const c of geo.captures) {
        const el = labelEl(c.label, 'capture')
        el.addEventListener('click', () => onCaptureClick?.(c.id))
        markers.current.captures.push(new maplibregl.Marker({ element: el }).setLngLat(c.at).addTo(map))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers.settlements, layers.captures, ready])

  // Owner "Adjust my boundary" mode: draggable corners update the dashed claimed boundary.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    markers.current.corners.forEach((m) => m.remove())
    markers.current.corners = []
    if (!adjust) return
    const corners = asset.claimed.slice(0, -1).map((c) => [...c] as LngLat)
    const update = () => {
      const ring = [...corners, corners[0]]
      const src = map.getSource('claimed') as maplibregl.GeoJSONSource | undefined
      src?.setData({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } }] })
      onClaimedChange?.(corners.map((c) => [Number(c[0].toFixed(5)), Number(c[1].toFixed(5))] as LngLat))
    }
    corners.forEach((c, i) => {
      const el = document.createElement('div')
      el.style.cssText = 'width:22px;height:22px;border-radius:999px;background:var(--surface);border:3px solid var(--brand);box-shadow:var(--e2);touch-action:none'
      el.setAttribute('aria-label', `Corner ${i + 1}`)
      const m = new maplibregl.Marker({ element: el, draggable: true }).setLngLat(c).addTo(map)
      m.on('drag', () => {
        const ll = m.getLngLat()
        corners[i] = [ll.lng, ll.lat]
        update()
      })
      markers.current.corners.push(m)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adjust, ready])

  // MapLibre's unlayered CSS sets position:relative on the map container, so size it via an outer wrapper.
  return (
    <div className={className ?? 'relative h-full w-full'}>
      <div ref={ref} className="h-full w-full" role="region" aria-label={`Map of ${asset.name}`} />
    </div>
  )
}
