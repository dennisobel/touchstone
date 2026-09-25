import { useEffect, useRef } from 'react'
import { cssVar, maplibregl } from './maplibre'

export interface MapPoint {
  id: string
  lng: number
  lat: number
  label: string
}

// Rough, illustrative context shapes (no external tiles): the Indian Ocean coast and the Winam Gulf.
const OCEAN: [number, number][] = [
  [41.6, -1.7], [40.9, -2.3], [40.2, -2.8], [39.9, -3.4], [39.6, -4.1], [39.3, -4.6], [39.2, -5.4], [46, -5.4], [46, -1.7], [41.6, -1.7],
]
const LAKE: [number, number][] = [
  [33.9, -0.1], [34.3, -0.2], [34.6, -0.45], [34.3, -0.9], [33.9, -1.1], [33.6, -0.6], [33.9, -0.1],
]

export default function PointsCanvas({ points, onSelect, className }: { points: MapPoint[]; onSelect?: (id: string) => void; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    const water = cssVar('--map-water')
    const map = new maplibregl.Map({
      container: ref.current,
      attributionControl: false,
      dragRotate: false,
      bounds: [
        [33.8, -4.8],
        [41.9, 4.8],
      ],
      fitBoundsOptions: { padding: 24 },
      style: {
        version: 8,
        sources: {
          ocean: { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [OCEAN] } } },
          lake: { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [LAKE] } } },
        },
        layers: [
          { id: 'bg', type: 'background', paint: { 'background-color': cssVar('--map-land') } },
          { id: 'ocean', type: 'fill', source: 'ocean', paint: { 'fill-color': water } },
          { id: 'lake', type: 'fill', source: 'lake', paint: { 'fill-color': water } },
        ],
      },
    })
    map.touchZoomRotate.disableRotation()
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new maplibregl.AttributionControl({ compact: true, customAttribution: 'Illustrative base map · sample data' }))
    const markers = points.map((p) => {
      const el = document.createElement('button')
      el.type = 'button'
      el.setAttribute('aria-label', `Open ${p.label}`)
      el.style.cssText =
        'font:600 11px/1 IBM Plex Mono,ui-monospace,monospace;color:var(--on-primary);background:var(--primary);padding:6px 8px;border-radius:999px;border:2px solid var(--surface);box-shadow:var(--e2);cursor:pointer;white-space:nowrap'
      el.textContent = p.label
      el.addEventListener('click', () => onSelect?.(p.id))
      return new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map)
    })
    return () => {
      markers.forEach((m) => m.remove())
      map.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points.map((p) => p.id).join(',')])
  return (
    <div className={className ?? 'relative h-full w-full'}>
      <div ref={ref} className="h-full w-full" role="region" aria-label="Map of matching assets" />
    </div>
  )
}
