import { Home, MessageSquare, Pickaxe, UserRound } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'
import { cn } from '@/lib/cn'
import { useOnline } from '@/lib/hooks'
import { useDemo } from '@/lib/store'
import { EvidenceViewerProvider, SyncIndicator } from '@/ds/components'
import { Logo } from '@/ds/icons'
import { MobileTabBar, ShellProvider, StatesControl, type NavItem } from '@/ds/shell'
import { LangToggle, useOwner } from './common'
import { useT } from './i18n'

export default function OwnerShell() {
  const { t } = useT()
  const { person, isGrace } = useOwner()
  const online = useOnline()
  const lang = useDemo((s) => s.lang)
  const tabs: NavItem[] = [
    { to: '/owner', label: t('tab.home'), icon: Home, end: true },
    { to: '/owner/assets', label: t('tab.assets'), icon: Pickaxe, match: ['/owner/requests'] },
    { to: '/owner/messages', label: t('tab.messages'), icon: MessageSquare, badge: isGrace ? 0 : 1 },
    { to: '/owner/account', label: t('tab.account'), icon: UserRound },
  ]

  return (
    <ShellProvider
      app="owner"
      width="full"
      appBarExtras={
        <>
          <SyncIndicator state={online ? 'online' : 'offline'} variant="dot" />
          <LangToggle />
        </>
      }
    >
      <EvidenceViewerProvider viewer={{ name: person.name, org: isGrace ? 'Kiboko Minerals Ltd' : 'Licence holder' }}>
        <div data-density="touch" data-app="owner" lang={lang} className="min-h-dvh bg-canvas text-body">
          {/* Desktop: the Owner App stays a centred single column (UI PRD §8) */}
          <header className="glass sticky top-0 z-30 hidden border-b border-line/70 md:block">
            <div className="mx-auto flex h-16 max-w-[640px] items-center gap-4 px-4">
              <Logo size={30} />
              <nav className="flex flex-1 items-center gap-1" aria-label="Main">
                {tabs.map((tab) => (
                  <NavLink
                    key={tab.to}
                    to={tab.to}
                    end={tab.end}
                    viewTransition
                    className={({ isActive }) => cn('inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-meta font-medium', isActive ? 'bg-fg text-canvas' : 'text-muted hover:bg-sunken')}
                  >
                    <tab.icon className="size-4" aria-hidden />
                    {tab.label}
                  </NavLink>
                ))}
              </nav>
              <LangToggle />
            </div>
          </header>
          <div className="mx-auto max-w-[640px] md:min-h-[calc(100dvh-64px)]">
            <Outlet />
          </div>
          <MobileTabBar tabs={tabs} />
          <StatesControl />
        </div>
      </EvidenceViewerProvider>
    </ShellProvider>
  )
}
