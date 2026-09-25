import type { SVGProps } from 'react'
import { cn } from '@/lib/cn'
import type { Severity } from '@/data'

// Custom icon set (UI PRD §5): beacon, drill core, assay flask, stamp, satellite — Lucide-style 1.5 px outline.
type P = SVGProps<SVGSVGElement>
const base = (p: P) => ({
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  width: 24,
  height: 24,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...p,
})

export const BeaconIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3v11" />
    <path d="M9 14h6l1.5 4h-9L9 14Z" />
    <path d="M5 21h14" />
    <path d="M12 3l5 2.5L12 8" />
  </svg>
)

export const DrillCoreIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="1.5" />
    <path d="M3 9.7h18M3 14.3h18" />
    <path d="M8 5v4.7M14 9.7v4.6M10 14.3V19M17 5v4.7" />
  </svg>
)

export const AssayFlaskIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M9.5 3h5" />
    <path d="M10 3v5.5L5.2 17.3A2.4 2.4 0 0 0 7.3 21h9.4a2.4 2.4 0 0 0 2.1-3.7L14 8.5V3" />
    <path d="M7.5 14.5h9" />
    <circle cx="10.5" cy="17.5" r=".6" fill="currentColor" />
    <circle cx="13.5" cy="16.8" r=".6" fill="currentColor" />
  </svg>
)

export const StampIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 11.5V9a3 3 0 1 1 6 0v2.5" />
    <path d="M7.5 11.5h9a2 2 0 0 1 2 2V16h-13v-2.5a2 2 0 0 1 2-2Z" />
    <path d="M5 19.5h14" />
  </svg>
)

export const SatelliteIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="9.2" y="9.2" width="5.6" height="5.6" rx="1" transform="rotate(45 12 12)" />
    <path d="m6.5 6.5-2.8-2.8M4.4 8.6 2.3 6.5 6.5 2.3l2.1 2.1" />
    <path d="m17.5 17.5 2.8 2.8M19.6 15.4l2.1 2.1-4.2 4.2-2.1-2.1" />
    <path d="M15.5 19.5a4 4 0 0 1-3-1" />
  </svg>
)

/** Brand mark: a graphite touchstone with a gold streak on a laterite tile. */
export function Logo({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={cn('shrink-0', className)} aria-hidden>
      <rect width="32" height="32" rx="8" fill="var(--brand)" />
      <ellipse cx="16" cy="17" rx="10" ry="7.5" transform="rotate(-18 16 17)" fill="#0F1419" />
      <path d="M10.5 19.5 21.5 14" stroke="#F2C063" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Red-flag severity uses shape as well as colour (UI PRD §5): Critical is a solid garnet octagon,
 * High a garnet triangle, Medium an ochre diamond, Low a graphite circle.
 */
export function SeverityShape({ severity, size = 16, className }: { severity: Severity; size?: number; className?: string }) {
  const s = size
  if (severity === 'critical')
    return (
      <svg width={s} height={s} viewBox="0 0 16 16" className={cn('shrink-0 text-garnet', className)} aria-hidden>
        <path d="M5 1h6l4 4v6l-4 4H5l-4-4V5z" fill="currentColor" />
        <path d="M8 4.5v4.2M8 10.8v.3" stroke="var(--surface)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  if (severity === 'high')
    return (
      <svg width={s} height={s} viewBox="0 0 16 16" className={cn('shrink-0 text-garnet', className)} aria-hidden>
        <path d="M8 1.5 15 14.5H1z" fill="currentColor" />
        <path d="M8 6.2v3.8M8 12v.2" stroke="var(--surface)" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  if (severity === 'medium')
    return (
      <svg width={s} height={s} viewBox="0 0 16 16" className={cn('shrink-0 text-ochre', className)} aria-hidden>
        <path d="M8 1 15 8 8 15 1 8z" fill="currentColor" />
      </svg>
    )
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" className={cn('shrink-0 text-graphite', className)} aria-hidden>
      <circle cx="8" cy="8" r="6" fill="currentColor" />
    </svg>
  )
}
