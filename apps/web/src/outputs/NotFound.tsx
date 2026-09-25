import { Compass } from 'lucide-react'
import { Link } from 'react-router'
import { Logo } from '@/ds/icons'
import { useDocumentTitle } from '@/lib/hooks'

export default function NotFound() {
  useDocumentTitle('Page not found')
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas p-6 text-center">
      <Logo size={40} />
      <span className="flex size-14 items-center justify-center rounded-full bg-primary-tint text-primary">
        <Compass className="size-7" aria-hidden />
      </span>
      <h1 className="text-h1 font-semibold">We can’t find that page</h1>
      <p className="max-w-sm text-meta text-muted">The link may be old, or the page may have moved. Nothing you did caused this.</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Link to="/" viewTransition className="inline-flex h-11 items-center rounded-lg bg-primary px-5 text-meta font-medium text-on-primary">
          Touchstone home
        </Link>
        <Link to="/apps" viewTransition className="inline-flex h-11 items-center rounded-lg border border-line-strong px-5 text-meta font-medium">
          All apps
        </Link>
      </div>
    </div>
  )
}
