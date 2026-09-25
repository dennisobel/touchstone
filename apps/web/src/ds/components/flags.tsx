import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { fmtDate, type Lang } from '@/lib/format'
import { FLAG_STATUS_LABEL, person, SEVERITY_LABEL, SEVERITY_LABEL_SW, workstreamName, WORKSTREAMS, type RedFlag, type Severity } from '@/data'
import { SeverityShape } from '../icons'
import { Chip } from '../ui'
import { EvidenceChip } from './evidence'

export function SeverityBadge({ severity, lang = 'en', className }: { severity: Severity; lang?: Lang; className?: string }) {
  const word = (lang === 'sw' ? SEVERITY_LABEL_SW : SEVERITY_LABEL)[severity]
  if (severity === 'critical') {
    return (
      <span className={cn('inline-flex h-6 items-center gap-1 rounded-sm bg-garnet px-2 text-micro font-semibold text-white dark:text-[#0f1419]', className)}>
        <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden>
          <path d="M5 1h6l4 4v6l-4 4H5l-4-4V5z" fill="currentColor" />
        </svg>
        {word}
      </span>
    )
  }
  const tone = severity === 'high' ? 'text-garnet border-garnet/50' : severity === 'medium' ? 'text-ochre border-ochre/50' : 'text-graphite border-graphite/50'
  return (
    <span className={cn('inline-flex h-6 items-center gap-1 rounded-sm border bg-surface px-2 text-micro font-semibold', tone, className)}>
      <SeverityShape severity={severity} size={12} />
      {word}
    </span>
  )
}

const statusTone = { open: 'neutral', mitigated: 'review', accepted: 'disputed', resolved: 'verified' } as const

/** Red-Flag Card: shape + colour + word, plain description, evidence, status, mitigation, owner, dates. */
export function RedFlagCard({
  flag,
  plain,
  lang = 'en',
  actions,
  onClick,
  className,
  showWorkstream = true,
}: {
  flag: RedFlag
  plain?: boolean
  lang?: Lang
  actions?: ReactNode
  onClick?: () => void
  className?: string
  showWorkstream?: boolean
}) {
  const accent = flag.severity === 'critical' || flag.severity === 'high' ? 'before:bg-garnet' : flag.severity === 'medium' ? 'before:bg-ochre' : 'before:bg-graphite'
  const text = plain && flag.plain[lang] ? flag.plain[lang] : flag.description
  const ws = WORKSTREAMS.find((w) => w.id === flag.workstream)
  return (
    <article
      className={cn(
        'relative block w-full overflow-hidden rounded-lg border border-line bg-surface p-4 pl-5 text-left shadow-e1',
        'before:absolute before:inset-y-0 before:left-0 before:w-1',
        accent,
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <SeverityBadge severity={flag.severity} lang={lang} />
        {!plain && <Chip tone={statusTone[flag.status]}>{FLAG_STATUS_LABEL[flag.status]}</Chip>}
        {showWorkstream && <span className="text-micro text-muted">{plain ? ws?.plain[lang] : workstreamName(flag.workstream)}</span>}
        {onClick && (
          <button type="button" onClick={onClick} className="ml-auto inline-flex h-8 items-center gap-1 rounded-full px-3 text-micro font-medium text-primary hover:bg-primary-tint">
            Open <ChevronRight className="size-3.5" aria-hidden />
          </button>
        )}
      </div>
      <h3 className="mt-2 text-h3 font-semibold text-fg">{flag.title}</h3>
      <p className="mt-1 text-meta text-muted">{text}</p>
      {flag.mitigation && !plain && (
        <p className="mt-2 text-meta text-fg">
          <span className="font-medium">Mitigation: </span>
          {flag.mitigation}
        </p>
      )}
      {flag.rationale && !plain && (
        <p className="mt-2 text-meta text-fg">
          <span className="font-medium">Accepted because: </span>
          {flag.rationale}
        </p>
      )}
      {flag.evidence.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {flag.evidence.map((e, i) => (
            <EvidenceChip key={i} ev={e} />
          ))}
        </div>
      )}
      <p className="mt-3 text-micro text-muted">
        {lang === 'sw' ? 'Ilitolewa' : 'Raised'} {fmtDate(flag.raisedOn, lang)} · {lang === 'sw' ? 'Imesasishwa' : 'Updated'} {fmtDate(flag.updatedOn, lang)} · {person(flag.ownerId).name}
      </p>
      {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
    </article>
  )
}
