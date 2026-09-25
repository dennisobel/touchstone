import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import type { Lang } from './format'

export type Theme = 'system' | 'light' | 'dark'
export type OwnerPersona = 'peter' | 'grace'
export type InvestorPersona = 'rachel' | 'marcus'
export type CommandPersona = 'kevin' | 'sarah' | 'james' | 'aisha'

// Browser storage can be missing or throw (private windows, blocked site data); never let that break a render.
const safeStorage: StateStorage = {
  getItem: (k) => {
    try {
      return localStorage.getItem(k)
    } catch {
      return null
    }
  },
  setItem: (k, v) => {
    try {
      localStorage.setItem(k, v)
    } catch {
      /* ignore */
    }
  },
  removeItem: (k) => {
    try {
      localStorage.removeItem(k)
    } catch {
      /* ignore */
    }
  },
}

interface DemoState {
  theme: Theme
  lang: Lang
  showDemoControls: boolean
  ownerPersona: OwnerPersona
  investorPersona: InvestorPersona
  /** Who is signed in to the Command Center: analyst, compliance, partner or operations */
  commandPersona: CommandPersona
  /** Asset ids whose passport release was approved in this demo session */
  released: string[]
  /** The posture switch (M15/M28): the verified library is off in gatekeeper mode. */
  libraryOn: boolean
  /** `${investorOrgId}:${assetId}` → signed */
  ndas: Record<string, boolean>
  /** `${investorOrgId}:${assetId}` → response */
  teaserResponses: Record<string, 'interested' | 'not_now'>
  follows: string[]
  lowData: boolean
  setTheme: (t: Theme) => void
  setLang: (l: Lang) => void
  setShowDemoControls: (v: boolean) => void
  setOwnerPersona: (p: OwnerPersona) => void
  setInvestorPersona: (p: InvestorPersona) => void
  setCommandPersona: (p: CommandPersona) => void
  markReleased: (assetId: string) => void
  setLibraryOn: (v: boolean) => void
  signNda: (key: string) => void
  respondTeaser: (key: string, r: 'interested' | 'not_now') => void
  toggleFollow: (assetId: string) => void
  setLowData: (v: boolean) => void
  reset: () => void
}

const initial = {
  theme: 'system' as Theme,
  lang: 'en' as Lang,
  showDemoControls: true,
  ownerPersona: 'peter' as OwnerPersona,
  investorPersona: 'rachel' as InvestorPersona,
  commandPersona: 'kevin' as CommandPersona,
  released: [] as string[],
  libraryOn: false,
  ndas: { 'cedar-peak:kiboko': true, 'cedar-peak:pwani': true, 'cedar-peak:galana': true, 'brightwater:galana': true, 'hargrove:pwani': true } as Record<string, boolean>,
  teaserResponses: {} as Record<string, 'interested' | 'not_now'>,
  follows: ['kiboko'],
  lowData: false,
}

export const useDemo = create<DemoState>()(
  persist(
    (set) => ({
      ...initial,
      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },
      setLang: (lang) => set({ lang }),
      setShowDemoControls: (showDemoControls) => set({ showDemoControls }),
      setOwnerPersona: (ownerPersona) => set({ ownerPersona }),
      setInvestorPersona: (investorPersona) => set({ investorPersona }),
      setCommandPersona: (commandPersona) => set({ commandPersona }),
      markReleased: (assetId) => set((s) => ({ released: s.released.includes(assetId) ? s.released : [...s.released, assetId] })),
      setLibraryOn: (libraryOn) => set({ libraryOn }),
      signNda: (key) => set((s) => ({ ndas: { ...s.ndas, [key]: true } })),
      respondTeaser: (key, r) => set((s) => ({ teaserResponses: { ...s.teaserResponses, [key]: r } })),
      toggleFollow: (assetId) =>
        set((s) => ({ follows: s.follows.includes(assetId) ? s.follows.filter((a) => a !== assetId) : [...s.follows, assetId] })),
      setLowData: (lowData) => set({ lowData }),
      reset: () => set({ ...initial }),
    }),
    {
      name: 'ts-demo',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
    },
  ),
)

export function applyTheme(theme: Theme) {
  const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
  try {
    localStorage.setItem('ts-theme', theme)
  } catch {
    /* ignore */
  }
  const meta = document.querySelectorAll('meta[name="theme-color"]')
  meta.forEach((m) => m.setAttribute('content', dark ? '#0F1419' : '#F5F7F9'))
}
