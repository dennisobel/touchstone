import { Bell, ChevronsUpDown, CircleHelp, Grid2x2, LogOut, Monitor, Moon, PanelLeftClose, PanelLeftOpen, Search, Sun } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { cn } from '@/lib/cn'
import { useHotkeys, useNoIndex } from '@/lib/hooks'
import { useDemo } from '@/lib/store'
import { person } from '@/data'
import { Logo } from '../icons'
import { Avatar, IconButton, Kbd, Menu, Popover, toast } from '../ui'
import { EvidenceViewerProvider } from '../components/evidence'
import { ShellProvider, useShell, type AppKey, type NavItem } from './context'
import { CommandPalette, StatesControl, type Command } from './palette'
import { AllAppsLink, MobileTabBar, SignOutLink, ThemeSwitch } from './tabbar'

export function EnvBadge({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex h-6 items-center whitespace-nowrap rounded-full border border-dashed border-brand/50 px-2 text-[11px] font-medium text-brand', className)} title="Not production: fictional sample data">
      Prototype · sample data
    </span>
  )
}

export function UserMenu({ personId, org, extra }: { personId: string; org: string; extra?: { label: string; onSelect: () => void; icon?: ReactNode }[] }) {
  const setTheme = useDemo((s) => s.setTheme)
  const { app } = useShell()
  const navigate = useNavigate()
  const p = person(personId)
  return (
    <Menu
      label="Account"
      trigger={
        <button type="button" className="pressable flex items-center gap-2 rounded-full p-0.5 pr-2 hover:bg-sunken" aria-label={`Account: ${p.name}`}>
          <Avatar id={personId} size={32} />
          <span className="hidden whitespace-nowrap text-left xl:block">
            <span className="block text-micro font-semibold leading-tight text-fg">{p.name}</span>
            <span className="block text-[11px] leading-tight text-muted">{org}</span>
          </span>
        </button>
      }
      items={[
        ...(extra ?? []).map((e) => ({ label: e.label, onSelect: e.onSelect, icon: e.icon })),
        { label: 'Light theme', icon: <Sun />, onSelect: () => setTheme('light'), separatorBefore: !!extra?.length },
        { label: 'Dark theme', icon: <Moon />, onSelect: () => setTheme('dark') },
        { label: 'Match system', icon: <Monitor />, onSelect: () => setTheme('system') },
        { label: 'All Touchstone apps', icon: <Grid2x2 />, onSelect: () => navigate('/apps', { viewTransition: true }), separatorBefore: true },
        { label: 'Sign out', icon: <LogOut />, onSelect: () => (toast('Signed out'), navigate(`/${app}/sign-in`, { viewTransition: true })) },
      ]}
    />
  )
}

export function NotificationsButton({ items }: { items: { title: string; body: string; when: string }[] }) {
  return (
    <Popover
      align="end"
      className="w-[340px] p-0"
      trigger={
        <IconButton label="Notifications" badge={items.length > 0}>
          <Bell />
        </IconButton>
      }
    >
      <div className="border-b border-line px-4 py-3">
        <p className="text-h3 font-semibold">Notifications</p>
      </div>
      <ul className="max-h-80 divide-y divide-line overflow-y-auto">
        {items.map((n, i) => (
          <li key={i} className="px-4 py-3">
            <p className="text-meta font-medium text-fg">{n.title}</p>
            <p className="text-micro text-muted">{n.body}</p>
            <p className="mt-1 text-[11px] text-muted">{n.when}</p>
          </li>
        ))}
      </ul>
    </Popover>
  )
}

interface SidebarShellProps {
  app: AppKey
  appName: string
  density: 'compact' | 'comfortable'
  nav: NavItem[]
  footerNav?: NavItem[]
  mobileTabs: NavItem[]
  mobileMore?: NavItem[]
  userId: string
  org: string
  commands?: Command[]
  notifications?: { title: string; body: string; when: string }[]
  viewer: { name: string; org: string; email?: string }
  topbarExtra?: ReactNode
  children?: ReactNode
}

/** Sidebar shell (Command Center, Expert Desk): floating sidebar on desktop, rail on tablet, tabs on phones. */
export function SidebarShell(props: SidebarShellProps) {
  const [paletteOpen, setPaletteOpen] = useState(false)
  return (
    <ShellProvider
      app={props.app}
      width="full"
      appBarExtras={
        <>
          {props.commands && (
            <IconButton label="Search" onClick={() => setPaletteOpen(true)}>
              <Search />
            </IconButton>
          )}
          <NotificationsButton items={props.notifications ?? []} />
        </>
      }
    >
      <SidebarShellInner {...props} paletteOpen={paletteOpen} setPaletteOpen={setPaletteOpen} />
    </ShellProvider>
  )
}

function SidebarShellInner({
  app,
  appName,
  density,
  nav,
  footerNav,
  mobileTabs,
  mobileMore,
  userId,
  org,
  commands,
  notifications = [],
  viewer,
  topbarExtra,
  children,
  paletteOpen,
  setPaletteOpen,
}: SidebarShellProps & { paletteOpen: boolean; setPaletteOpen: (v: boolean) => void }) {
  useNoIndex()
  const [collapsed, setCollapsed] = useState(false)
  useHotkeys({ 'mod+k': () => setPaletteOpen(true) }, !!commands)
  const sections = nav.reduce<{ section?: string; items: NavItem[] }[]>((acc, item) => {
    const last = acc[acc.length - 1]
    if (last && last.section === item.section) last.items.push(item)
    else acc.push({ section: item.section, items: [item] })
    return acc
  }, [])

  return (
    <EvidenceViewerProvider viewer={viewer} editable={app === 'command'}>
      <div data-density={density} data-app={app} className="min-h-dvh bg-canvas text-body">
        {/* Sidebar */}
        <aside
          className={cn('fixed inset-y-0 left-0 z-30 hidden p-3 pr-0 md:block', collapsed ? 'w-[84px]' : 'w-[84px] lg:w-[260px]')}
          style={{ viewTransitionName: 'sidebar' }}
          aria-label={`${appName} navigation`}
        >
          <div className="flex h-full flex-col rounded-xl border border-line bg-surface shadow-e1">
            <div className={cn('flex items-center gap-2.5 px-4 pt-4 pb-3', collapsed ? 'justify-center px-0' : 'max-lg:justify-center max-lg:px-0')}>
              <Link to={`/${app}`} className="flex min-w-0 items-center gap-2.5" aria-label={`${appName} home`}>
                <Logo size={32} />
                <span className={cn('min-w-0', collapsed ? 'hidden' : 'hidden lg:block')}>
                  <span className="block text-meta font-semibold leading-tight text-fg">Touchstone</span>
                  <span className="block truncate text-[11px] leading-tight text-muted">{appName}</span>
                </span>
              </Link>
            </div>
            <nav className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pb-3">
              {sections.map((s, i) => (
                <div key={i} className="mt-3 first:mt-1">
                  {s.section && <p className={cn('mb-1 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted', collapsed ? 'sr-only' : 'max-lg:sr-only')}>{s.section}</p>}
                  <ul className="space-y-0.5">
                    {s.items.map((item) => (
                      <li key={item.to}>
                        <SideLink item={item} collapsed={collapsed} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
            <div className="border-t border-line px-3 py-3">
              <ul className="space-y-0.5">
                {footerNav?.map((item) => (
                  <li key={item.to}>
                    <SideLink item={item} collapsed={collapsed} />
                  </li>
                ))}
                <li className="hidden lg:block">
                  <button
                    type="button"
                    onClick={() => setCollapsed((c) => !c)}
                    className={cn('flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-meta text-muted hover:bg-sunken hover:text-fg', collapsed && 'justify-center px-0')}
                  >
                    {collapsed ? <PanelLeftOpen className="size-[18px]" /> : <PanelLeftClose className="size-[18px]" />}
                    <span className={cn(collapsed && 'sr-only')}>{collapsed ? 'Expand sidebar' : 'Collapse sidebar'}</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className={cn('md:pl-[84px]', !collapsed && 'lg:pl-[260px]')}>
          <div className="glass sticky top-0 z-20 hidden h-16 items-center gap-3 border-b border-line/60 px-6 md:flex xl:px-8">
            {commands ? (
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                className="pressable flex h-10 w-full max-w-md items-center gap-2 rounded-full border border-line bg-surface px-4 text-meta text-muted shadow-e1 hover:border-line-strong"
              >
                <Search className="size-4" aria-hidden />
                <span className="flex-1 text-left">Search assets, investors, screens…</span>
                <Kbd>Ctrl K</Kbd>
              </button>
            ) : (
              <span className="flex-1" />
            )}
            <div className="ml-auto flex items-center gap-1.5">
              {topbarExtra}
              <EnvBadge className="hidden lg:inline-flex" />
              <NotificationsButton items={notifications} />
              <IconButton label="Help" onClick={() => toast('Help centre opens here (demo)')}>
                <CircleHelp />
              </IconButton>
              <UserMenu personId={userId} org={org} />
            </div>
          </div>
          <main id="main">{children ?? <Outlet />}</main>
        </div>

        <MobileTabBar
          tabs={mobileTabs}
          more={mobileMore}
          moreExtras={
            <>
              {commands && (
                <button type="button" onClick={() => setPaletteOpen(true)} className="pressable flex w-full items-center gap-3 rounded-lg border border-line bg-surface p-3 text-meta text-muted">
                  <Search className="size-5" aria-hidden /> Search assets, investors, screens…
                </button>
              )}
              <div className="flex items-center justify-between gap-3">
                <span className="text-meta text-muted">Theme</span>
                <ThemeSwitch />
              </div>
              <AllAppsLink />
              <SignOutLink />
            </>
          }
        />
        {commands && <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} commands={commands} />}
        <StatesControl />
      </div>
    </EvidenceViewerProvider>
  )
}

function SideLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const { pathname } = useLocation()
  const matchExtra = item.match?.some((m) => pathname.startsWith(m))
  return (
    <NavLink
      to={item.to}
      end={item.end}
      viewTransition
      title={item.label}
      className={({ isActive }) =>
        cn(
          'relative flex h-10 items-center gap-3 rounded-lg px-2.5 text-meta font-medium transition-colors lg:h-9',
          isActive || matchExtra ? 'bg-primary-tint text-primary' : 'text-muted hover:bg-sunken hover:text-fg',
          collapsed ? 'justify-center px-0' : 'max-lg:justify-center max-lg:px-0',
        )
      }
    >
      <item.icon className="size-[18px] shrink-0" aria-hidden />
      <span className={cn('flex-1 truncate', collapsed ? 'sr-only' : 'max-lg:sr-only')}>{item.label}</span>
      {item.badge ? (
        <span
          className={cn(
            'min-w-5 rounded-full bg-sunken px-1.5 text-center text-[11px] font-semibold tabular-nums text-fg',
            collapsed ? 'absolute right-1 top-0.5 bg-critical text-white' : 'max-lg:absolute max-lg:right-1 max-lg:top-0.5 max-lg:bg-critical max-lg:text-white',
          )}
        >
          {item.badge}
        </span>
      ) : null}
    </NavLink>
  )
}

/** Investor Portal shell: top bar navigation on desktop, bottom tabs on phones. */
export function TopNavShell({
  nav,
  mobileTabs,
  mobileMore,
  userId,
  org,
  notifications = [],
  viewer,
  userMenuExtra,
  children,
}: {
  nav: NavItem[]
  mobileTabs: NavItem[]
  mobileMore?: NavItem[]
  userId: string
  org: string
  notifications?: { title: string; body: string; when: string }[]
  viewer: { name: string; org: string; email?: string; zone?: string }
  userMenuExtra?: { label: string; onSelect: () => void; icon?: ReactNode }[]
  children?: ReactNode
}) {
  return (
    <ShellProvider app="investor" width="wide" appBarExtras={<NotificationsButton items={notifications} />}>
      <TopNavInner nav={nav} mobileTabs={mobileTabs} mobileMore={mobileMore} userId={userId} org={org} notifications={notifications} viewer={viewer} userMenuExtra={userMenuExtra}>
        {children}
      </TopNavInner>
    </ShellProvider>
  )
}

function TopNavInner({
  nav,
  mobileTabs,
  mobileMore,
  userId,
  org,
  notifications = [],
  viewer,
  userMenuExtra,
  children,
}: {
  nav: NavItem[]
  mobileTabs: NavItem[]
  mobileMore?: NavItem[]
  userId: string
  org: string
  notifications?: { title: string; body: string; when: string }[]
  viewer: { name: string; org: string; email?: string; zone?: string }
  userMenuExtra?: { label: string; onSelect: () => void; icon?: ReactNode }[]
  children?: ReactNode
}) {
  useNoIndex()
  useShell()
  return (
    <EvidenceViewerProvider viewer={viewer}>
      <div data-density="comfortable" data-app="investor" className="min-h-dvh bg-canvas text-body">
        <header className="glass sticky top-0 z-30 hidden border-b border-line/70 md:block" style={{ viewTransitionName: 'sidebar' }}>
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6 xl:px-8">
            <Link to="/investor" className="flex items-center gap-2.5" aria-label="Investor Portal home">
              <Logo size={30} />
              <span className="hidden lg:block">
                <span className="block text-meta font-semibold leading-tight">Touchstone</span>
                <span className="block text-[11px] leading-tight text-muted">Investor Portal</span>
              </span>
            </Link>
            <nav aria-label="Main" className="flex items-center gap-1">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  viewTransition
                  className={({ isActive }) =>
                    cn('inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-meta font-medium transition-colors', isActive ? 'bg-fg text-canvas' : 'text-muted hover:bg-sunken hover:text-fg')
                  }
                >
                  {n.label}
                  {n.badge ? <span className="rounded-full bg-primary px-1.5 text-[11px] font-semibold text-on-primary">{n.badge}</span> : null}
                </NavLink>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-1.5">
              <EnvBadge className="hidden xl:inline-flex" />
              <NotificationsButton items={notifications} />
              <UserMenu personId={userId} org={org} extra={userMenuExtra} />
            </div>
          </div>
        </header>
        <main id="main">{children ?? <Outlet />}</main>
        <MobileTabBar
          tabs={mobileTabs}
          more={mobileMore}
          moreExtras={
            <>
              {userMenuExtra?.map((e) => (
                <button key={e.label} type="button" onClick={e.onSelect} className="pressable flex w-full items-center gap-3 rounded-lg border border-line bg-surface p-3 text-meta font-medium text-fg">
                  <ChevronsUpDown className="size-5 text-muted" aria-hidden />
                  {e.label}
                </button>
              ))}
              <div className="flex items-center justify-between gap-3">
                <span className="text-meta text-muted">Theme</span>
                <ThemeSwitch />
              </div>
              <AllAppsLink />
              <SignOutLink />
            </>
          }
        />
        <StatesControl />
      </div>
    </EvidenceViewerProvider>
  )
}
