import { useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { create } from 'zustand'

/**
 * Every screen designs its empty, loading, error and offline states (UI PRD §7).
 * `useDemoState` registers a screen's states so the floating States control can list them.
 * The `?state=<id>` URL parameter is the single source of truth for the selected state.
 */
export interface DemoOption {
  id: string
  label: string
}

interface DemoStatesStore {
  screen: string | null
  options: DemoOption[]
  register: (screen: string, options: DemoOption[]) => void
  unregister: (screen: string) => void
}

export const useDemoStatesStore = create<DemoStatesStore>((set) => ({
  screen: null,
  options: [],
  register: (screen, options) => set({ screen, options }),
  unregister: (screen) => set((s) => (s.screen === screen ? { screen: null, options: [] } : s)),
}))

export function useStateParam() {
  const [params, setParams] = useSearchParams()
  const set = (id: string | null) => {
    const next = new URLSearchParams(params)
    if (!id) next.delete('state')
    else next.set('state', id)
    setParams(next, { replace: true, preventScrollReset: true })
  }
  return [params.get('state'), set] as const
}

export function useDemoState<T extends string>(screen: string, options: readonly { id: T; label: string }[]): [T, (id: T) => void] {
  const [raw, setRaw] = useStateParam()
  const register = useDemoStatesStore((s) => s.register)
  const unregister = useDemoStatesStore((s) => s.unregister)

  useEffect(() => {
    register(screen, options as readonly DemoOption[] as DemoOption[])
    return () => unregister(screen)
    // Options are static per screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen])

  const current = options.some((o) => o.id === raw) ? (raw as T) : options[0].id
  const setState = (id: T) => setRaw(id === options[0].id ? null : id)
  return [current, setState]
}
