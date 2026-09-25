import { useEffect } from 'react'
import { isRouteErrorResponse, Link, Outlet, ScrollRestoration, useRouteError } from 'react-router'
import { Logo } from '@/ds/icons'
import { Toaster, TooltipProvider } from '@/ds/ui'
import { applyTheme, useDemo } from '@/lib/store'

export function Root() {
  const theme = useDemo((s) => s.theme)
  useEffect(() => {
    applyTheme(theme)
    if (theme !== 'system') return
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const on = () => applyTheme('system')
    mql.addEventListener('change', on)
    return () => mql.removeEventListener('change', on)
  }, [theme])

  return (
    <TooltipProvider delayDuration={250}>
      <Outlet />
      <Toaster />
      <ScrollRestoration />
    </TooltipProvider>
  )
}

export function RootFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas" aria-busy>
      <Logo size={44} className="animate-pulse-dot" />
    </div>
  )
}

export function RootError() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404
  const ref = `ERR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas p-6 text-center">
      <Logo size={44} />
      <h1 className="text-h1 font-semibold">{notFound ? 'We can’t find that page' : 'Something went wrong on our side'}</h1>
      <p className="max-w-md text-meta text-muted">
        {notFound ? 'The link may be old, or the page may have moved.' : 'Your work is saved. Try again, and if it keeps happening, contact support with this reference.'}
      </p>
      {!notFound && <p className="font-mono text-meta text-fg">Reference {ref}</p>}
      <div className="flex gap-2">
        <button onClick={() => window.location.reload()} className="h-10 rounded-lg bg-primary px-4 text-meta font-medium text-on-primary">
          Try again
        </button>
        <Link to="/apps" className="inline-flex h-10 items-center rounded-lg border border-line-strong px-4 text-meta font-medium">
          All apps
        </Link>
      </div>
    </div>
  )
}
