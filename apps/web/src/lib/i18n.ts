import { useDemo } from './store'
import type { Lang } from './format'

export type Dict = Record<string, string>
type Vars = Record<string, string | number>

export function interpolate(template: string, vars?: Vars) {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => (vars && k in vars ? String(vars[k]) : `{${k}}`))
}

/**
 * Builds a `useT` hook over per-language dictionaries. Messages use `{name}` placeholders;
 * plurals use `key_one` / `key_other` variants selected by `tn(key, count)`.
 */
export function makeUseT<D extends Dict>(dicts: Record<Lang, Partial<D>> & { en: D }) {
  return function useT() {
    const lang = useDemo((s) => s.lang)
    const get = (key: string) => (dicts[lang] as Dict)[key] ?? (dicts.en as Dict)[key] ?? key
    const t = (key: keyof D & string, vars?: Vars) => interpolate(get(key), vars)
    const tn = (key: string, count: number, vars?: Vars) =>
      interpolate(get(`${key}_${count === 1 ? 'one' : 'other'}`), { count, ...vars })
    return { t, tn, lang }
  }
}
