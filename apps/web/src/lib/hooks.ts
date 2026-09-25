import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', cb)
      return () => mql.removeEventListener('change', cb)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** md and up (768 px): desktop density and side sheets apply. */
export const useIsDesktop = () => useMediaQuery('(min-width: 768px)')
export const useIsWide = () => useMediaQuery('(min-width: 1280px)')

export function useOnline() {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener('online', cb)
      window.addEventListener('offline', cb)
      return () => {
        window.removeEventListener('online', cb)
        window.removeEventListener('offline', cb)
      }
    },
    () => navigator.onLine,
    () => true,
  )
}

type HotkeyMap = Record<string, (e: KeyboardEvent) => void>

function isTyping(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
}

/**
 * Keyboard shortcuts. Keys: "j", "shift+?", "mod+k" (Ctrl on Windows/Linux, Cmd on macOS).
 * Plain-letter shortcuts are ignored while the user is typing in a field.
 */
export function useHotkeys(map: HotkeyMap, enabled = true) {
  const ref = useRef(map)
  ref.current = map
  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      const key = e.key.toLowerCase()
      for (const combo of Object.keys(ref.current)) {
        const parts = combo.toLowerCase().split('+')
        const k = parts[parts.length - 1]
        const wantsMod = parts.includes('mod')
        const wantsShift = parts.includes('shift')
        if (k !== key) continue
        if (wantsMod !== mod) continue
        if (wantsShift && !e.shiftKey) continue
        if (!wantsMod && isTyping(e.target)) continue
        e.preventDefault()
        ref.current[combo](e)
        return
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled])
}

/** Simulated async work for demo interactions (sending codes, payments…). */
export function useFakeRequest<T = void>(ms = 1100) {
  const [pending, setPending] = useState(false)
  const run = (fn?: () => T) =>
    new Promise<T | undefined>((resolve) => {
      setPending(true)
      window.setTimeout(() => {
        setPending(false)
        resolve(fn?.())
      }, ms)
    })
  return { pending, run }
}

export function useCountdown(seconds: number, running = true) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => {
    if (!running) return
    setLeft(seconds)
    const id = window.setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => window.clearInterval(id)
  }, [seconds, running])
  return [left, setLeft] as const
}

export function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    if (!title) return
    const prev = document.title
    document.title = title ? `${title} · Touchstone` : 'Touchstone'
    return () => {
      document.title = prev
    }
  }, [title])
}

/** Investor Portal, Expert Desk and Command Center must never be indexed (M01, UI PRD §2). */
export function useNoIndex() {
  useEffect(() => {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    const created = !meta
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'robots'
      document.head.appendChild(meta)
    }
    meta.content = 'noindex, nofollow'
    return () => {
      if (created) meta?.remove()
    }
  }, [])
}
