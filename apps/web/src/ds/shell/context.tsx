import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  badge?: number
  section?: string
  /** Matches additional path prefixes for the active state */
  match?: string[]
}

export type AppKey = 'owner' | 'expert' | 'command' | 'investor'

interface ShellCtx {
  app: AppKey
  /** Extra controls shown in every phone app bar (e.g. the Owner App language toggle) */
  appBarExtras?: ReactNode
  tabBarHidden: boolean
  setTabBarHidden: (v: boolean) => void
  width: 'full' | 'wide' | 'narrow'
  hasTabBar: boolean
}

const Ctx = createContext<ShellCtx>({
  app: 'command',
  tabBarHidden: false,
  setTabBarHidden: () => {},
  width: 'full',
  hasTabBar: false,
})

export function ShellProvider({ children, app, appBarExtras, width = 'full', hasTabBar = true }: { children: ReactNode; app: AppKey; appBarExtras?: ReactNode; width?: 'full' | 'wide' | 'narrow'; hasTabBar?: boolean }) {
  const [tabBarHidden, setTabBarHidden] = useState(false)
  return <Ctx.Provider value={{ app, appBarExtras, tabBarHidden, setTabBarHidden, width, hasTabBar }}>{children}</Ctx.Provider>
}

export const useShell = () => useContext(Ctx)

/** Focused flows (sign-up, wizards) hide the phone tab bar while mounted, as native apps do. */
export function useHideTabBar(hide = true) {
  const { setTabBarHidden } = useShell()
  useEffect(() => {
    if (!hide) return
    setTabBarHidden(true)
    return () => setTabBarHidden(false)
  }, [hide, setTabBarHidden])
}
