// Single entry point for MapLibre: imported only from lazily loaded map modules.
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
// MapLibre v6 resolves its worker relative to its own file; bundle it explicitly so dev pre-bundling and builds both work.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

maplibregl.setWorkerUrl(workerUrl)

export { maplibregl }

export function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888'
}
