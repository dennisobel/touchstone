import { Avatar as RAvatar, Tabs as RTabs, ToggleGroup } from 'radix-ui'
import { Check } from 'lucide-react'
import type { HTMLAttributes, ReactNode } from 'react'
import { NavLink } from 'react-router'
import { cn } from '@/lib/cn'
import { initials } from '@/lib/format'
import { person } from '@/data'

export function Card({ className, interactive, ...props }: HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-lg border border-line bg-surface shadow-e1',
        interactive && 'pressable cursor-pointer transition-shadow hover:shadow-e2 hover:border-line-strong/50',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ title, subtitle, actions, className, icon }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; className?: string; icon?: ReactNode }) {
  return (
    <div className={cn('flex items-start gap-3 px-4 pt-4 pb-3', className)}>
      {icon && <div className="mt-0.5 text-muted [&_svg]:size-5">{icon}</div>}
      <div className="min-w-0 flex-1">
        <h3 className="text-h3 font-semibold text-fg">{title}</h3>
        {subtitle && <p className="text-meta text-muted mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
    </div>
  )
}

const chipTones = {
  neutral: 'bg-sunken text-fg border-line',
  outline: 'bg-transparent text-fg border-line-strong/60',
  primary: 'bg-primary-tint text-primary border-transparent',
  verified: 'bg-verified-fill text-verified border-verified-border',
  review: 'bg-review-fill text-review border-review-border',
  critical: 'bg-critical-fill text-critical border-critical-border',
  disputed: 'bg-disputed-fill text-disputed border-disputed-border',
  stale: 'bg-stale-fill text-stale border-stale-border',
  brand: 'bg-transparent text-brand border-brand/40',
  solid: 'bg-fg text-canvas border-transparent',
} as const

export type ChipTone = keyof typeof chipTones

export function Chip({ tone = 'neutral', className, icon, children, size = 'md' }: { tone?: ChipTone; className?: string; icon?: ReactNode; children: ReactNode; size?: 'sm' | 'md' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-sm border font-medium [&_svg]:size-3.5 [&_svg]:shrink-0',
        size === 'sm' ? 'h-5 px-1.5 text-[11px]' : 'h-6 px-2 text-micro',
        chipTones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}

/** Pill-shaped segmented control (single choice). */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  size = 'md',
  ariaLabel,
  block,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: ReactNode; icon?: ReactNode; count?: number }[]
  className?: string
  size?: 'sm' | 'md'
  ariaLabel: string
  block?: boolean
}) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v as T)}
      aria-label={ariaLabel}
      className={cn('inline-flex items-center gap-0.5 rounded-full bg-sunken p-1 border border-line', block && 'flex w-full', className)}
    >
      {options.map((o) => (
        <ToggleGroup.Item
          key={o.value}
          value={o.value}
          className={cn(
            'pressable inline-flex items-center justify-center gap-1.5 rounded-full font-medium text-muted transition-colors hover:text-fg data-[state=on]:bg-surface data-[state=on]:text-fg data-[state=on]:shadow-e1 [&_svg]:size-4',
            size === 'sm' ? 'h-7 px-3 text-micro max-md:h-9' : 'h-8 px-3.5 text-meta max-md:h-10',
            block && 'flex-1',
          )}
        >
          {o.icon}
          {o.label}
          {o.count !== undefined && <span className="rounded-full bg-line/70 px-1.5 text-[11px] tabular-nums text-fg">{o.count}</span>}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  )
}

export const Tabs = RTabs.Root
export function TabsList({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <RTabs.List className={cn('no-scrollbar flex gap-1 overflow-x-auto border-b border-line -mb-px', className)}>{children}</RTabs.List>
  )
}
export function TabsTrigger({ value, children, count, className }: { value: string; children: ReactNode; count?: number; className?: string }) {
  return (
    <RTabs.Trigger
      value={value}
      className={cn(
        'relative inline-flex h-11 shrink-0 items-center gap-1.5 px-3 text-meta font-medium text-muted transition-colors hover:text-fg data-[state=active]:text-fg md:h-10',
        'after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary after:opacity-0 data-[state=active]:after:opacity-100',
        className,
      )}
    >
      {children}
      {count !== undefined && <span className="rounded-full bg-sunken px-1.5 text-[11px] tabular-nums">{count}</span>}
    </RTabs.Trigger>
  )
}
export const TabsContent = RTabs.Content

/** Route-driven tabs (e.g. CC-04 asset tabs). */
export function TabNav({ items, className }: { items: { to: string; label: ReactNode; end?: boolean; count?: number }[]; className?: string }) {
  return (
    <nav className={cn('no-scrollbar flex gap-1 overflow-x-auto border-b border-line', className)}>
      {items.map((i) => (
        <NavLink
          key={i.to}
          to={i.to}
          end={i.end}
          viewTransition
          className={({ isActive }) =>
            cn(
              'relative inline-flex h-11 shrink-0 items-center gap-1.5 px-3 text-meta font-medium transition-colors md:h-10',
              'after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary',
              isActive ? 'text-fg after:opacity-100' : 'text-muted hover:text-fg after:opacity-0',
            )
          }
        >
          {i.label}
          {i.count !== undefined && <span className="rounded-full bg-sunken px-1.5 text-[11px] tabular-nums">{i.count}</span>}
        </NavLink>
      ))}
    </nav>
  )
}

export function Progress({ value, className, tone = 'primary', label }: { value: number; className?: string; tone?: 'primary' | 'verified' | 'review' | 'critical' | 'muted'; label?: string }) {
  const tones = { primary: 'bg-primary', verified: 'bg-verified', review: 'bg-review', critical: 'bg-critical', muted: 'bg-muted' }
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-sunken', className)}
    >
      <div className={cn('h-full rounded-full transition-[width] duration-500 ease-out', tones[tone])} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-sm bg-sunken', className)} aria-hidden>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/5" />
    </div>
  )
}

export function Avatar({ id, name, size = 32, className, ring }: { id?: string; name?: string; size?: number; className?: string; ring?: boolean }) {
  const p = id ? person(id) : undefined
  const label = name ?? p?.name ?? '?'
  const hue = p?.hue ?? 210
  return (
    <RAvatar.Root
      className={cn('inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-semibold', ring && 'ring-2 ring-surface', className)}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.round(size * 0.38)),
        background: `light-dark(hsl(${hue} 45% 90%), hsl(${hue} 30% 26%))`,
        color: `light-dark(hsl(${hue} 45% 28%), hsl(${hue} 55% 82%))`,
      }}
      aria-hidden
    >
      <RAvatar.Fallback>{initials(label)}</RAvatar.Fallback>
    </RAvatar.Root>
  )
}

export function PersonChip({ id, sub, size = 28 }: { id: string; sub?: ReactNode; size?: number }) {
  const p = person(id)
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <Avatar id={id} size={size} />
      <span className="min-w-0">
        <span className="block truncate text-meta font-medium text-fg">{p.name}</span>
        {sub !== undefined ? sub && <span className="block truncate text-micro text-muted">{sub}</span> : <span className="block truncate text-micro text-muted">{p.role}</span>}
      </span>
    </span>
  )
}

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd className={cn('inline-flex h-5 min-w-5 items-center justify-center rounded-sm border border-line bg-sunken px-1 font-mono text-[11px] font-medium text-muted', className)}>
      {children}
    </kbd>
  )
}

export function Stepper({ steps, current, className }: { steps: string[]; current: number; className?: string }) {
  return (
    <ol className={cn('flex items-center gap-2', className)} aria-label="Progress">
      {steps.map((s, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={s} className="flex min-w-0 flex-1 items-center gap-2" aria-current={active ? 'step' : undefined}>
            <span
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-full text-micro font-semibold transition-colors',
                done ? 'bg-primary text-on-primary' : active ? 'bg-primary-tint text-primary ring-2 ring-primary' : 'bg-sunken text-muted',
              )}
            >
              {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <span className={cn('truncate text-micro font-medium', active ? 'text-fg' : 'text-muted', !active && 'max-sm:hidden')}>{s}</span>
            {i < steps.length - 1 && <span className={cn('h-px flex-1 min-w-3', done ? 'bg-primary' : 'bg-line')} />}
          </li>
        )
      })}
    </ol>
  )
}

export function Divider({ className, label }: { className?: string; label?: ReactNode }) {
  if (!label) return <hr className={cn('border-line', className)} />
  return (
    <div className={cn('flex items-center gap-3 text-micro text-muted', className)}>
      <span className="h-px flex-1 bg-line" />
      {label}
      <span className="h-px flex-1 bg-line" />
    </div>
  )
}

export function SectionTitle({ children, action, className, id }: { children: ReactNode; action?: ReactNode; className?: string; id?: string }) {
  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <h2 id={id} className="text-h3 font-semibold text-fg">
        {children}
      </h2>
      {action}
    </div>
  )
}

export function Meta({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-meta text-muted', className)}>{children}</p>
}

export function Mono({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('font-mono text-[13px] leading-[18px]', className)}>{children}</span>
}

/** Key/value rows used on detail panels. */
export function DescList({ items, className, cols = 1 }: { items: { term: ReactNode; value: ReactNode }[]; className?: string; cols?: 1 | 2 }) {
  return (
    <dl className={cn('grid gap-x-6 gap-y-3', cols === 2 && 'sm:grid-cols-2', className)}>
      {items.map((it, i) => (
        <div key={i} className="min-w-0">
          <dt className="text-micro font-medium uppercase tracking-wide text-muted">{it.term}</dt>
          <dd className="mt-0.5 text-meta text-fg">{it.value}</dd>
        </div>
      ))}
    </dl>
  )
}
