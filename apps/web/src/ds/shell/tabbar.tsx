import { Grid2x2, LayoutGrid, LogOut, Monitor, Moon, Sun } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { cn } from '@/lib/cn'
import { useDemo, type Theme } from '@/lib/store'
import { Segmented, Sheet } from '../ui'
import { useShell, type NavItem } from './context'

function isActive(pathname: string, item: NavItem) {
  if (item.end) return pathname === item.to
  if (pathname === item.to || pathname.startsWith(item.to + '/')) return true
  return !!item.match?.some((m) => pathname.startsWith(m))
}

/** Phone bottom tab bar with a "More" sheet for the rest of the navigation. */
export function MobileTabBar({ tabs, more, moreExtras, moreLabel = 'More' }: { tabs: NavItem[]; more?: NavItem[]; moreExtras?: ReactNode; moreLabel?: string }) {
  const { tabBarHidden } = useShell()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const moreActive = !!more?.some((m) => isActive(pathname, m)) && !tabs.some((t) => isActive(pathname, t))
  if (tabBarHidden) return null
  return (
    <>
      <nav
        aria-label="Main"
        className="glass fixed inset-x-0 bottom-0 z-40 border-t border-line/80 pb-safe md:hidden"
        style={{ viewTransitionName: 'tabbar' }}
      >
        <ul className="mx-auto flex h-[var(--tabbar-h)] max-w-lg items-stretch justify-around px-1">
          {tabs.map((t) => {
            const active = isActive(pathname, t)
            return (
              <li key={t.to} className="flex-1">
                <NavLink
                  to={t.to}
                  end={t.end}
                  viewTransition
                  aria-current={active ? 'page' : undefined}
                  className="pressable flex h-full flex-col items-center justify-center gap-1"
                >
                  <TabIcon icon={<t.icon />} active={active} badge={t.badge} />
                  <span className={cn('text-[11px] leading-none font-medium', active ? 'text-primary' : 'text-muted')}>{t.label}</span>
                </NavLink>
              </li>
            )
          })}
          {more && more.length > 0 && (
            <li className="flex-1">
              <button type="button" onClick={() => setOpen(true)} className="pressable flex h-full w-full flex-col items-center justify-center gap-1" aria-haspopup="dialog">
                <TabIcon icon={<LayoutGrid />} active={moreActive} />
                <span className={cn('text-[11px] leading-none font-medium', moreActive ? 'text-primary' : 'text-muted')}>{moreLabel}</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
      {more && (
        <Sheet open={open} onOpenChange={setOpen} title={moreLabel}>
          <div className="grid grid-cols-3 gap-2">
            {more.map((m) => (
              <Link
                key={m.to}
                to={m.to}
                viewTransition
                onClick={() => setOpen(false)}
                className={cn(
                  'pressable flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border p-2 text-center',
                  isActive(pathname, m) ? 'border-primary bg-primary-tint text-primary' : 'border-line bg-surface text-fg',
                )}
              >
                <m.icon className="size-6" aria-hidden />
                <span className="text-micro font-medium leading-tight">{m.label}</span>
              </Link>
            ))}
          </div>
          {moreExtras && <div className="mt-5 space-y-3">{moreExtras}</div>}
        </Sheet>
      )}
    </>
  )
}

function TabIcon({ icon, active, badge }: { icon: ReactNode; active: boolean; badge?: number }) {
  return (
    <span className={cn('relative flex h-7 w-14 items-center justify-center rounded-full transition-colors [&_svg]:size-[22px]', active ? 'bg-primary-tint text-primary' : 'text-muted')}>
      {icon}
      {badge ? (
        <span className="absolute -top-0.5 right-2.5 min-w-4 rounded-full bg-critical px-1 text-center text-[10px] font-semibold leading-4 text-white ring-2 ring-surface dark:text-[#0f1419]">{badge}</span>
      ) : null}
    </span>
  )
}

export function ThemeSwitch({ className }: { className?: string }) {
  const theme = useDemo((s) => s.theme)
  const setTheme = useDemo((s) => s.setTheme)
  return (
    <Segmented<Theme>
      ariaLabel="Theme"
      value={theme}
      onChange={setTheme}
      className={className}
      size="sm"
      options={[
        { value: 'light', label: 'Light', icon: <Sun /> },
        { value: 'dark', label: 'Dark', icon: <Moon /> },
        { value: 'system', label: 'Auto', icon: <Monitor /> },
      ]}
    />
  )
}

export function AllAppsLink({ onClick }: { onClick?: () => void }) {
  return (
    <Link to="/apps" onClick={onClick} className="pressable flex items-center gap-3 rounded-lg border border-line bg-surface p-3 text-meta font-medium text-fg">
      <Grid2x2 className="size-5 text-muted" aria-hidden />
      All Touchstone apps
    </Link>
  )
}

/** Signs out of the current app and lands on its sign-in page. */
export function SignOutLink({ label = 'Sign out' }: { label?: string }) {
  const { app } = useShell()
  return (
    <Link to={`/${app}/sign-in`} viewTransition className="pressable flex items-center gap-3 rounded-lg border border-line bg-surface p-3 text-meta font-medium text-critical">
      <LogOut className="size-5" aria-hidden />
      {label}
    </Link>
  )
}
