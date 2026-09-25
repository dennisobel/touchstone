import { TrendingDown, TrendingUp } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function StatTile({
  label,
  value,
  sub,
  trend,
  tone = 'neutral',
  active,
  onClick,
  icon,
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
  trend?: { dir: 'up' | 'down'; text: string; good?: boolean }
  tone?: 'neutral' | 'critical' | 'review' | 'primary' | 'disputed'
  active?: boolean
  onClick?: () => void
  icon?: ReactNode
}) {
  const bar = { neutral: 'bg-line-strong', critical: 'bg-critical', review: 'bg-review', primary: 'bg-primary', disputed: 'bg-disputed' }[tone]
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      onClick={onClick}
      aria-pressed={onClick ? active : undefined}
      className={cn(
        'relative flex min-w-0 flex-col rounded-lg border bg-surface p-3.5 text-left shadow-e1 transition-colors md:p-4',
        active ? 'border-primary ring-2 ring-primary/25' : 'border-line',
        onClick && 'pressable hover:border-line-strong/60',
      )}
    >
      <span className={cn('absolute left-3.5 top-0 h-1 w-8 rounded-b-full md:left-4', bar)} aria-hidden />
      <span className="flex items-center justify-between gap-2 text-micro font-medium text-muted [&_svg]:size-4">
        {label}
        {icon}
      </span>
      <span className="mt-1.5 text-[26px] leading-8 font-semibold tabular-nums text-fg">{value}</span>
      {(sub || trend) && (
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-micro text-muted">
          {trend && (
            <span className={cn('inline-flex items-center gap-0.5 font-medium', trend.good ? 'text-verified' : 'text-critical')}>
              {trend.dir === 'up' ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              {trend.text}
            </span>
          )}
          {sub}
        </span>
      )}
    </Comp>
  )
}

export function Panel({ title, action, children, className, bodyClassName, subtitle }: { title: ReactNode; action?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string; subtitle?: ReactNode }) {
  return (
    <section className={cn('rounded-lg border border-line bg-surface shadow-e1', className)}>
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-h3 font-semibold text-fg">{title}</h2>
          {subtitle && <p className="text-micro text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className={cn('p-4', bodyClassName)}>{children}</div>
    </section>
  )
}
