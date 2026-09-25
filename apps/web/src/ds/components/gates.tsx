import { AlertTriangle, Gavel, Lock, OctagonX, Scale } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Button } from '../ui'

/**
 * Disclosure Lock: shows that locked content exists and how to unlock it.
 * The locked content itself is never rendered or sent to the page (UI PRD §1 principle 3).
 */
export function DisclosureLock({
  title,
  contains,
  variant,
  action,
  className,
}: {
  title: string
  contains: string
  variant: 'nda' | 'introduction' | 'consent'
  action?: ReactNode
  className?: string
}) {
  const how = {
    nda: 'Sign the NDA to view',
    introduction: 'Available after an SSD introduction',
    consent: 'Owner consent required',
  }[variant]
  return (
    <section className={cn('relative overflow-hidden rounded-lg border border-dashed border-line-strong bg-sunken/60 p-4', className)} aria-label={`${title}: locked`}>
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-muted shadow-e1">
          <Lock className="size-4.5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-h3 font-semibold text-fg">{title}</h3>
          <p className="text-meta text-muted">{contains}</p>
          <p className="mt-1 text-meta font-medium text-fg">{how}</p>
        </div>
        {action && <div className="hidden shrink-0 sm:block">{action}</div>}
      </div>
      {action && <div className="mt-3 sm:hidden">{action}</div>}
    </section>
  )
}

const LEVELS = {
  hard_stop: { label: 'Hard stop', Icon: OctagonX, className: 'border-critical-border bg-critical-fill', text: 'text-critical' },
  counsel_review: { label: 'Counsel review', Icon: Scale, className: 'border-disputed-border bg-disputed-fill', text: 'text-disputed' },
  warning: { label: 'Warning', Icon: AlertTriangle, className: 'border-review-border bg-review-fill', text: 'text-review' },
} as const

/** Rule-Gate Banner: rule name, reason, triggering data and the compliant route (UI PRD §6). */
export function RuleGateBanner({
  level,
  rule,
  reason,
  triggering,
  alternatives,
  onRequestReview,
  className,
  compact,
}: {
  level: keyof typeof LEVELS
  rule: string
  reason: ReactNode
  triggering?: ReactNode
  alternatives?: ReactNode
  onRequestReview?: () => void
  className?: string
  compact?: boolean
}) {
  const l = LEVELS[level]
  return (
    <div role="alert" className={cn('rounded-lg border p-3.5', l.className, className)}>
      <div className="flex items-start gap-3">
        <l.Icon className={cn('mt-0.5 size-5 shrink-0', l.text)} aria-hidden />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-meta">
            <span className={cn('font-semibold', l.text)}>
              {l.label} · {rule}
            </span>
          </p>
          <p className="text-meta text-fg">{reason}</p>
          {!compact && triggering && <p className="text-micro text-muted">Triggered by: {triggering}</p>}
          {!compact && alternatives && <div className="text-meta text-fg">{alternatives}</div>}
          {onRequestReview && level !== 'warning' && (
            <div className="pt-1.5">
              <Button size="sm" variant="secondary" icon={<Gavel />} onClick={onRequestReview}>
                Request counsel review
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
