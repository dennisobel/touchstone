import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import { cn } from '@/lib/cn'
import { useDocumentTitle } from '@/lib/hooks'
import { AsOf } from '../components/misc'
import { IconButton } from '../ui'
import { useHideTabBar, useShell } from './context'

export interface Crumb {
  label: string
  to?: string
}

interface PageProps {
  title: string
  /** Shown instead of `title` in the phone app bar when the title is long */
  shortTitle?: string
  subtitle?: ReactNode
  back?: string | true
  /** Custom back behaviour (e.g. previous step in a flow); shows the back button */
  onBack?: () => void
  breadcrumbs?: Crumb[]
  actions?: ReactNode
  /** Phone app-bar actions (icon buttons). Defaults to none; desktop actions stay in the header. */
  mobileActions?: ReactNode
  /** iOS-style large title on phones for tab-root pages */
  large?: boolean
  asOf?: boolean
  width?: 'full' | 'wide' | 'narrow' | 'form'
  /** Sticky bottom action bar (phones) / inline footer (desktop) */
  footer?: ReactNode
  /** Hide the phone tab bar (focused flows) */
  focus?: boolean
  headerExtra?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  /** Remove default content padding (full-bleed maps) */
  bleed?: boolean
  hideHeaderOnDesktop?: boolean
}

const widths = { full: 'max-w-none', wide: 'max-w-7xl', narrow: 'max-w-3xl', form: 'max-w-2xl' }

export function Page({
  title,
  shortTitle,
  subtitle,
  back,
  onBack,
  breadcrumbs,
  actions,
  mobileActions,
  large,
  asOf,
  width,
  footer,
  focus,
  headerExtra,
  children,
  className,
  contentClassName,
  bleed,
  hideHeaderOnDesktop,
}: PageProps) {
  useDocumentTitle(title)
  useHideTabBar(!!focus)
  const shell = useShell()
  const navigate = useNavigate()
  const sentinel = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(!large)
  const w = width ?? (shell.width === 'full' ? 'full' : shell.width)

  useEffect(() => {
    if (!large || !sentinel.current) return
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting), { rootMargin: '-56px 0px 0px 0px' })
    io.observe(sentinel.current)
    return () => io.disconnect()
  }, [large])

  const goBack = () => {
    if (onBack) onBack()
    else if (back === true) navigate(-1)
    else if (back) navigate(back, { viewTransition: true })
  }
  const bottomPad = shell.hasTabBar && !shell.tabBarHidden ? 'max-md:pb-[calc(var(--tabbar-h)+var(--safe-bottom)+24px)]' : 'max-md:pb-[calc(var(--safe-bottom)+24px)]'

  return (
    <div className={cn('min-h-dvh md:min-h-0', className)}>
      {/* Phone app bar */}
      <div className="glass sticky top-0 z-30 border-b border-line/70 pt-safe md:hidden" style={{ viewTransitionName: 'appbar' }}>
        <div className="flex h-[var(--appbar-h)] items-center gap-1 px-2">
          {back || onBack ? (
            <IconButton label="Back" onClick={goBack} className="-ml-0.5">
              <ChevronLeft className="!size-6" />
            </IconButton>
          ) : (
            <span className="w-2" />
          )}
          <h1
            className={cn('min-w-0 flex-1 truncate text-[17px] font-semibold text-fg transition-opacity duration-150', large && !scrolled && 'opacity-0')}
            aria-hidden={large && !scrolled}
          >
            {shortTitle ?? title}
          </h1>
          <div className="flex shrink-0 items-center gap-0.5">
            {mobileActions}
            {shell.appBarExtras}
          </div>
        </div>
      </div>

      <div className={cn('mx-auto w-full', widths[w], !bleed && 'px-4 pt-4 md:px-6 md:pt-6 xl:px-8', bottomPad, 'md:pb-10', contentClassName)}>
        {/* Phone large title */}
        {large && (
          <div className={cn('md:hidden', bleed && 'px-4 pt-4')}>
            <h1 className="text-[28px] leading-[34px] font-semibold tracking-tight text-fg">{title}</h1>
            {subtitle && <div className="mt-1 text-meta text-muted">{subtitle}</div>}
            <div ref={sentinel} className="h-px" />
          </div>
        )}
        {!large && subtitle && <div className={cn('text-meta text-muted md:hidden', bleed && 'px-4 pt-3')}>{subtitle}</div>}

        {/* Desktop header */}
        {!hideHeaderOnDesktop && (
          <header className={cn('mb-5 hidden md:block', bleed && 'px-6 pt-6')}>
            {breadcrumbs && breadcrumbs.length > 0 ? (
              <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-micro text-muted">
                {breadcrumbs.map((c, i) => (
                  <span key={i} className="inline-flex items-center gap-1">
                    {c.to ? (
                      <Link to={c.to} viewTransition className="hover:text-fg hover:underline">
                        {c.label}
                      </Link>
                    ) : (
                      <span className="text-fg">{c.label}</span>
                    )}
                    {i < breadcrumbs.length - 1 && <ChevronRight className="size-3" aria-hidden />}
                  </span>
                ))}
              </nav>
            ) : back && typeof back === 'string' ? (
              <Link to={back} viewTransition className="mb-2 inline-flex items-center gap-1 text-micro text-muted hover:text-fg">
                <ChevronLeft className="size-3.5" aria-hidden /> Back
              </Link>
            ) : null}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-h1 font-semibold tracking-tight text-fg">{title}</h1>
                {subtitle && <div className="mt-1 text-meta text-muted">{subtitle}</div>}
                {asOf && <AsOf className="mt-1" />}
              </div>
              {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </div>
            {headerExtra && <div className="mt-4">{headerExtra}</div>}
          </header>
        )}
        {/* Phone: actions and header extras below the title */}
        {(asOf || headerExtra || (actions && !mobileActions)) && (
          <div className={cn('mb-4 space-y-3 md:hidden', large ? 'mt-2' : 'mt-0', bleed && 'px-4')}>
            {asOf && <AsOf />}
            {actions && !mobileActions && <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">{actions}</div>}
            {headerExtra}
          </div>
        )}

        {children}

        {footer && (
          <>
            <div className="h-20 md:hidden" aria-hidden />
            <div
              className={cn(
                'glass fixed inset-x-0 z-30 border-t border-line px-4 pt-3 md:static md:mt-6 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none',
                shell.hasTabBar && !shell.tabBarHidden ? 'bottom-[calc(var(--tabbar-h)+var(--safe-bottom))] pb-3' : 'bottom-0 pb-[calc(12px+var(--safe-bottom))]',
              )}
            >
              {footer}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
