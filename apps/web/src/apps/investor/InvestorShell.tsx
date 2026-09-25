import { ArrowLeftRight, Building2, FileOutput, FolderLock, House, LibraryBig, ListChecks, Mailbox, Star, UsersRound } from 'lucide-react'
import { Outlet } from 'react-router'
import { useDemo } from '@/lib/store'
import { TopNavShell, type NavItem } from '@/ds/shell'
import { useInvestorCtx } from './common'

export default function InvestorShell() {
  const libraryOn = useDemo((s) => s.libraryOn)
  const setPersona = useDemo((s) => s.setInvestorPersona)
  const { persona, org, me, waiting, zone } = useInvestorCtx()
  const home: NavItem = { to: '/investor', label: 'Home', icon: House, end: true }
  const opps: NavItem = { to: '/investor/opportunities', label: 'Opportunities', icon: Mailbox, badge: waiting.length || undefined, match: ['/investor/teasers'] }
  const library: NavItem = { to: '/investor/library', label: 'Library', icon: LibraryBig }
  const rooms: NavItem = { to: '/investor/rooms', label: 'Deal rooms', icon: FolderLock }
  const watch: NavItem = { to: '/investor/watchlist', label: 'Watchlist', icon: Star }
  const team: NavItem = { to: '/investor/team', label: 'Team', icon: UsersRound }
  // The Library item is absent (not disabled) while the library is switched off (UI PRD §7).
  const nav = [home, opps, ...(libraryOn ? [library] : []), rooms, watch, team]
  return (
    <TopNavShell
      nav={nav}
      mobileTabs={[home, opps, rooms, watch]}
      mobileMore={[
        team,
        ...(libraryOn ? [library] : []),
        { to: '/investor/mandate', label: 'Mandate', icon: ListChecks },
        { to: '/investor/compare', label: 'Compare', icon: ArrowLeftRight },
        { to: '/investor/exports', label: 'Exports', icon: FileOutput },
        { to: '/investor/qualification', label: 'Qualification', icon: Building2 },
      ]}
      userId={persona}
      org={org.name}
      viewer={{ name: me.name, org: org.name, email: me.email, zone }}
      userMenuExtra={[{ label: persona === 'rachel' ? 'Switch to Marcus Bell (demo)' : 'Switch to Rachel Kim (demo)', onSelect: () => setPersona(persona === 'rachel' ? 'marcus' : 'rachel') }]}
      notifications={[
        { title: 'Something is waiting for you in the portal', body: 'Sign in to see it. Messages outside the portal never include deal details.', when: 'Today 08:00' },
        { title: 'Daily digest', body: '1 teaser · 2 new answers · 1 change to an asset you follow', when: 'Today 06:00' },
      ]}
    >
      <Outlet />
    </TopNavShell>
  )
}
