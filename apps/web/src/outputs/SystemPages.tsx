import { ArrowLeft, CloudOff, Compass, Hammer, KeyRound, RefreshCw, ServerCrash, TimerOff } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { cn } from '@/lib/cn'
import { useDocumentTitle } from '@/lib/hooks'
import { Logo } from '@/ds/icons'
import { Avatar, Button, Segmented, toast } from '@/ds/ui'

type App = 'owner' | 'expert' | 'command' | 'investor'
type Kind = 'server-error' | 'offline' | 'maintenance' | 'access-expired' | 'permission-denied' | 'not-found'

const APPS: Record<App, { name: string; density: string; contact: string; home: string }> = {
  owner: { name: 'Owner App', density: 'touch', contact: 'kevin', home: '/owner' },
  expert: { name: 'Expert Desk', density: 'comfortable', contact: 'kevin', home: '/expert' },
  command: { name: 'Command Center', density: 'compact', contact: 'aisha', home: '/command' },
  investor: { name: 'Investor Portal', density: 'comfortable', contact: 'james', home: '/investor' },
}

const KINDS: { id: Kind; label: string }[] = [
  { id: 'server-error', label: 'Server error' },
  { id: 'offline', label: 'Offline' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'access-expired', label: 'Access expired' },
  { id: 'permission-denied', label: 'Permission denied' },
  { id: 'not-found', label: 'Not found' },
]

function content(kind: Kind, app: App): { icon: ReactNode; title: string; body: ReactNode; actions: ReactNode } {
  const home = APPS[app].home
  switch (kind) {
    case 'server-error':
      return {
        icon: <ServerCrash />,
        title: 'Something went wrong on our side',
        body: (
          <>
            We couldn't load this page. Your work is saved. Try again in a moment; if it keeps happening, contact support with this reference: <span className="font-mono font-semibold text-fg">ERR-7F3K2Q</span>
          </>
        ),
        actions: (
          <Button icon={<RefreshCw />} onClick={() => toast('Retrying…')}>
            Try again
          </Button>
        ),
      }
    case 'offline':
      return {
        icon: <CloudOff />,
        title: app === 'owner' ? "You're offline. Your changes are saved on this phone." : "You're offline",
        body: (
          <ul className="mx-auto mt-1 max-w-sm space-y-1.5 text-left">
            {(app === 'owner'
              ? ['Your drafts and photos stay on this phone', 'Answers and uploads send when you reconnect', 'You can still read your status and messages']
              : ['Pages you opened recently stay readable', 'Nothing you typed is lost', 'We reconnect automatically']
            ).map((x) => (
              <li key={x} className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-verified" aria-hidden />
                {x}
              </li>
            ))}
          </ul>
        ),
        actions: <Button variant="secondary" icon={<RefreshCw />} onClick={() => toast('Checking connection…')}>Check again</Button>,
      }
    case 'maintenance':
      return {
        icon: <Hammer />,
        title: 'Touchstone is being updated',
        body: <>We expect to be back by 22:00 EAT (15:00 ET) today. Nothing you saved is affected.</>,
        actions: (
          <Button variant="secondary" onClick={() => toast('Status page (demo)')}>
            See the status page
          </Button>
        ),
      }
    case 'access-expired':
      if (app === 'investor')
        return {
          icon: <TimerOff />,
          title: 'Your access to this deal room ended on 20 Sep 2026',
          body: <>Access for advisers is time-limited. Marcus Bell, your organisation admin, can extend it.</>,
          actions: <Button onClick={() => toast.success('Request sent to Marcus Bell')}>Ask Marcus Bell to extend</Button>,
        }
      if (app === 'expert')
        return {
          icon: <TimerOff />,
          title: 'Your access to this assignment has ended',
          body: <>Access ends 7 days after the deadline. Your signed opinion and your payout are not affected. Kevin Omondi can reopen access if SSD asks for a clarification.</>,
          actions: <Button onClick={() => toast.success('Request sent to Kevin Omondi')}>Ask Kevin Omondi</Button>,
        }
      return {
        icon: <TimerOff />,
        title: app === 'owner' ? 'You were signed out' : 'You were signed out after 30 minutes idle',
        body: app === 'owner' ? <>For your safety, sign-in codes expire. Your drafts and photos are still on this phone.</> : <>Your work was saved. Sign in to continue where you left off.</>,
        actions: (
          <Link to={`/${app}/sign-in`} className="inline-flex h-ctl items-center rounded-lg bg-primary px-4 font-medium text-on-primary">
            Sign in again
          </Link>
        ),
      }
    case 'permission-denied':
      return {
        icon: <KeyRound />,
        title: "This page needs a different role",
        body: <>Releasing passports needs the Compliance role. Aisha Hassan (Platform operations) grants roles; your request includes this page's address.</>,
        actions: <Button onClick={() => toast.success('Access request sent to Aisha Hassan')}>Request access</Button>,
      }
    default:
      return {
        icon: <Compass />,
        title: "We can't find that page",
        body: <>The link may be old, or the page may have moved.</>,
        actions: (
          <Link to={home} className="inline-flex h-ctl items-center rounded-lg bg-primary px-4 font-medium text-on-primary">
            Go to {APPS[app].name}
          </Link>
        ),
      }
  }
}

/** X-04 · System pages, in each app's density */
export default function SystemPages() {
  const { kind = 'server-error' } = useParams()
  const [params, setParams] = useSearchParams()
  const app = (params.get('app') as App) || 'owner'
  const k = (KINDS.find((x) => x.id === kind)?.id ?? 'not-found') as Kind
  const c = content(k, app)
  const meta = APPS[app]
  useDocumentTitle(KINDS.find((x) => x.id === k)?.label ?? 'System page')
  return (
    <div className="min-h-dvh bg-canvas">
      <div className="no-print glass sticky top-0 z-20 border-b border-line/70 pt-safe">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-2.5">
          <Link to="/apps" className="rounded-full p-2 hover:bg-sunken" aria-label="All apps">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
            {KINDS.map((x) => (
              <Link key={x.id} to={`/system/${x.id}?app=${app}`} className={cn('shrink-0 rounded-full border px-3 py-1.5 text-micro font-medium', x.id === k ? 'border-primary bg-primary-tint text-primary' : 'border-line bg-surface text-muted')}>
                {x.label}
              </Link>
            ))}
          </div>
          <Segmented
            ariaLabel="App"
            size="sm"
            value={app}
            onChange={(v) => setParams({ app: v }, { replace: true })}
            className="ml-auto"
            options={(Object.keys(APPS) as App[]).map((a) => ({ value: a, label: APPS[a].name.replace(' App', '').replace('Investor Portal', 'Investor') }))}
          />
        </div>
      </div>
      <main data-density={meta.density} className="flex min-h-[calc(100dvh-64px)] flex-col items-center justify-center px-6 py-12 text-center text-body">
        <div className="flex items-center gap-2 text-micro text-muted">
          <Logo size={22} /> Touchstone {meta.name}
        </div>
        <span className="mt-6 flex size-16 items-center justify-center rounded-full bg-primary-tint text-primary [&_svg]:size-8">{c.icon}</span>
        <h1 className="mt-5 max-w-lg text-h1 font-semibold text-balance">{c.title}</h1>
        <div className="mt-2 max-w-md text-muted">{c.body}</div>
        <div className="mt-6">{c.actions}</div>
        <p className="mt-8 inline-flex items-center gap-2 text-micro text-muted">
          <Avatar id={meta.contact} size={22} /> Need a person? {app === 'command' ? 'Aisha Hassan, Platform operations' : app === 'investor' ? 'James Whitfield, SSD' : 'Kevin Omondi, SSD Nairobi'}
        </p>
      </main>
    </div>
  )
}
