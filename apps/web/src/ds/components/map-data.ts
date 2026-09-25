import type { Asset, LngLat } from '@/data'

// Procedurally generated reference layers around each asset (sample data only; see PLAN.md D7).

type Feature = GeoJSON.Feature<GeoJSON.Geometry, Record<string, unknown>>
const fc = (features: Feature[]): GeoJSON.FeatureCollection => ({ type: 'FeatureCollection', features })
const poly = (coords: LngLat[], props: Record<string, unknown> = {}): Feature => ({ type: 'Feature', properties: props, geometry: { type: 'Polygon', coordinates: [coords] } })
const line = (coords: LngLat[], props: Record<string, unknown> = {}): Feature => ({ type: 'Feature', properties: props, geometry: { type: 'LineString', coordinates: coords } })

function rng(seed: string) {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

export function blob(cx: number, cy: number, rx: number, ry: number, seed: string, n = 28): LngLat[] {
  const r = rng(seed)
  const pts: LngLat[] = []
  const phase = r() * Math.PI * 2
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2
    const k = 0.82 + 0.18 * Math.sin(3 * t + phase) + (r() - 0.5) * 0.12
    pts.push([cx + Math.cos(t) * rx * k, cy + Math.sin(t) * ry * k])
  }
  pts.push(pts[0])
  return pts
}

function meander(from: LngLat, to: LngLat, seed: string, amp = 0.01, steps = 40): LngLat[] {
  const r = rng(seed)
  const pts: LngLat[] = []
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const len = Math.hypot(dx, dy)
  const nx = -dy / len
  const ny = dx / len
  const f1 = 2 + r() * 2
  const f2 = 5 + r() * 3
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const off = amp * (Math.sin(t * Math.PI * f1) * 0.7 + Math.sin(t * Math.PI * f2 + 1.3) * 0.3)
    pts.push([from[0] + dx * t + nx * off, from[1] + dy * t + ny * off])
  }
  return pts
}

export interface AssetGeo {
  registered: GeoJSON.FeatureCollection
  claimed: GeoJSON.FeatureCollection
  protectedAreas: GeoJSON.FeatureCollection
  forestOverlap: GeoJSON.FeatureCollection
  water: GeoJSON.FeatureCollection
  ocean: GeoJSON.FeatureCollection
  roads: GeoJSON.FeatureCollection
  rail: GeoJSON.FeatureCollection
  power: GeoJSON.FeatureCollection
  otherLicences: GeoJSON.FeatureCollection
  artisanal: GeoJSON.FeatureCollection
  changes: GeoJSON.FeatureCollection
  settlements: { name: string; at: LngLat }[]
  captures: { id: string; at: LngLat; label: string }[]
  ports: { name: string; at: LngLat }[]
  bounds: [LngLat, LngLat]
  imageryBounds: [LngLat, LngLat, LngLat, LngLat]
}

export function geoFor(a: Asset): AssetGeo {
  const [x, y] = a.center
  const seed = a.id
  const span = Math.max(...a.registered.map((p) => Math.abs(p[0] - x)), ...a.registered.map((p) => Math.abs(p[1] - y)), 0.01)
  const pad = span * 2.4

  const protectedAreas: Feature[] = []
  const forestOverlap: Feature[] = []
  const ocean: Feature[] = []
  let settlements: { name: string; at: LngLat }[] = []
  const artisanal: Feature[] = []
  const changes: Feature[] = []
  let captures: { id: string; at: LngLat; label: string }[] = []
  const ports: { name: string; at: LngLat }[] = []

  if (a.id === 'kiboko') {
    protectedAreas.push(poly(blob(x - 0.07, y + 0.045, 0.028, 0.02, 'kb-forest'), { name: 'Hill forest (protected)' }))
    artisanal.push(poly(blob(38.4485, -3.4565, 0.0011, 0.0009, 'kb-asm', 14), { name: 'Artisanal workings, ~3 ha' }))
    changes.push(poly(blob(38.4468, -3.4585, 0.0007, 0.0006, 'kb-c1', 12), { area: '1.4 ha', id: 'chg-1' }))
    changes.push(poly(blob(38.4602, -3.4712, 0.0006, 0.0005, 'kb-c2', 12), { area: '1.1 ha', id: 'chg-2' }))
    settlements = [
      { name: 'Mwatate', at: [x - 0.045, y - 0.03] },
      { name: 'Kiboko village', at: [x + 0.03, y + 0.028] },
      { name: 'Bura', at: [x + 0.06, y - 0.02] },
    ]
    captures = [
      { id: 'cap-1', at: [38.4119, -3.4508], label: 'Beacon NW-1' },
      { id: 'cap-2', at: [38.4516, -3.4527], label: 'Beacon NE-2' },
      { id: 'cap-3', at: [38.4484, -3.4561], label: 'Artisanal pits' },
      { id: 'cap-4', at: [38.432, -3.476], label: 'Core shed' },
      { id: 'cap-5', at: [38.4278, -3.4861], label: 'Borehole B2' },
    ]
  } else if (a.id === 'mawe') {
    forestOverlap.push(
      poly(
        [
          [39.2325, -4.434],
          [39.242, -4.4335],
          [39.2415, -4.4705],
          [39.233, -4.471],
          [39.2325, -4.434],
        ],
        { name: 'Overlap with gazetted forest reserve, ~410 ha' },
      ),
    )
    protectedAreas.push(poly(blob(x - 0.04, y - 0.002, 0.024, 0.034, 'mw-forest'), { name: 'Gazetted forest reserve' }))
    ocean.push(poly([[39.36, -4.3], [39.6, -4.3], [39.6, -4.6], [39.33, -4.6], [39.35, -4.45], [39.36, -4.3]]))
    settlements = [
      { name: 'Kwale', at: [x - 0.03, y + 0.05] },
      { name: 'Mwaluphamba', at: [x + 0.04, y + 0.03] },
    ]
  } else if (a.id === 'nyanza') {
    artisanal.push(poly(blob(34.3655, -1.0275, 0.0012, 0.001, 'ny-asm', 14), { name: 'Artisanal workings' }))
    settlements = [
      { name: 'Macalder', at: [x - 0.02, y + 0.018] },
      { name: 'Migori', at: [x + 0.05, y - 0.03] },
    ]
  } else if (a.id === 'pwani' || a.id === 'galana') {
    ocean.push(poly([[x + 0.08, y + 0.2], [x + 0.4, y + 0.2], [x + 0.4, y - 0.2], [x + 0.06, y - 0.2], [x + 0.08, y + 0.2]]))
    settlements = [{ name: 'Village', at: [x - 0.03, y + 0.02] }]
  } else {
    settlements = [{ name: 'Village', at: [x + 0.03, y + 0.02] }]
  }
  if (a.region === 'Coast region') ports.push({ name: 'Port of Mombasa', at: [39.66, -4.06] })

  const other = [
    poly(
      [
        [x + span * 1.15, y + span * 0.9],
        [x + span * 2.1, y + span * 0.9],
        [x + span * 2.1, y - span * 0.2],
        [x + span * 1.15, y - span * 0.2],
        [x + span * 1.15, y + span * 0.9],
      ],
      { number: 'PL/2023/0419' },
    ),
    poly(
      [
        [x - span * 2.2, y - span * 1.2],
        [x - span * 1.1, y - span * 1.2],
        [x - span * 1.1, y - span * 2.1],
        [x - span * 2.2, y - span * 2.1],
        [x - span * 2.2, y - span * 1.2],
      ],
      { number: 'ML/2021/0033' },
    ),
  ]

  return {
    registered: fc([poly(a.registered, { kind: 'registered' })]),
    claimed: fc([poly(a.claimed, { kind: 'claimed' })]),
    protectedAreas: fc(protectedAreas),
    forestOverlap: fc(forestOverlap),
    water: fc([line(meander([x - pad, y - span * 0.6], [x + pad, y - span * 0.9], seed + 'river', span * 0.35), { name: 'Seasonal river' })]),
    ocean: fc(ocean),
    roads: fc([
      line(meander([x - pad, y - pad * 0.7], [x + pad, y - span * 1.4], seed + 'road', span * 0.15, 20), { kind: 'paved' }),
      line(meander([x - span * 0.2, y - span * 1.2], [x + span * 0.1, y + span * 0.4], seed + 'track', span * 0.1, 12), { kind: 'track' }),
    ]),
    rail: fc([line([[x + pad * 0.8, y + pad], [x + pad * 1.2, y - pad]], { name: 'Standard gauge railway' })]),
    power: fc([line([[x - pad, y + pad * 0.72], [x + pad, y + pad * 0.62]], { name: 'Grid power line' })]),
    otherLicences: fc(other),
    artisanal: fc(artisanal),
    changes: fc(changes),
    settlements,
    captures,
    ports,
    bounds: [
      [Math.min(...a.claimed.map((p) => p[0]), ...a.registered.map((p) => p[0])), Math.min(...a.claimed.map((p) => p[1]), ...a.registered.map((p) => p[1]))],
      [Math.max(...a.claimed.map((p) => p[0]), ...a.registered.map((p) => p[0])), Math.max(...a.claimed.map((p) => p[1]), ...a.registered.map((p) => p[1]))],
    ],
    imageryBounds: [
      [x - pad * 1.6, y + pad * 1.6],
      [x + pad * 1.6, y + pad * 1.6],
      [x + pad * 1.6, y - pad * 1.6],
      [x - pad * 1.6, y - pad * 1.6],
    ],
  }
}

export interface LayerState {
  imagery: boolean
  protectedAreas: boolean
  settlements: boolean
  water: boolean
  roads: boolean
  rail: boolean
  power: boolean
  otherLicences: boolean
  artisanal: boolean
  changes: boolean
  captures: boolean
  claimed: boolean
}

export const DEFAULT_LAYERS: LayerState = {
  imagery: true,
  protectedAreas: true,
  settlements: true,
  water: true,
  roads: true,
  rail: true,
  power: true,
  otherLicences: false,
  artisanal: true,
  changes: false,
  captures: false,
  claimed: true,
}

export const LAYER_LABELS: Record<keyof LayerState, string> = {
  imagery: 'Satellite imagery',
  protectedAreas: 'Protected areas',
  settlements: 'Settlements',
  water: 'Water',
  roads: 'Roads',
  rail: 'Rail',
  power: 'Power lines',
  otherLicences: 'Other licences',
  artisanal: 'Artisanal workings',
  changes: 'Change detection',
  captures: 'Field captures',
  claimed: "Owner's boundary",
}

export const IMAGERY_DATE = '2026-09-14'
