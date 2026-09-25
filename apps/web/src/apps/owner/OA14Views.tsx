import { Building2, Eye, FileText, Handshake, LockKeyhole, Stamp, UserX } from 'lucide-react'
import { useParams } from 'react-router'
import { useDemoState } from '@/lib/demo-states'
import { fmtDay } from '@/lib/format'
import { asset, docsFor } from '@/data'
import { Banner, EmptyState } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Chip } from '@/ds/ui'
import { SectionLabel } from './common'
import { useT } from './i18n'

const STATES = [
  { id: 'default', label: 'Views before and after NDA' },
  { id: 'none', label: 'No views yet' },
  { id: 'nda_just', label: 'NDA just signed' },
  { id: 'revoked', label: 'Access revoked' },
] as const

const VIEW_COUNTS: Record<string, number> = { 'kb-d10': 9, 'kb-d11': 6, 'kb-d04': 4, 'kb-d17': 3, 'kb-d13': 3, 'kb-d02': 2, 'kb-d07': 2, 'kb-d15': 1 }

export default function OA14Views() {
  const { t, lang } = useT()
  const { id = 'kiboko' } = useParams()
  const a = asset(id)
  const [state] = useDemoState('OA-14', STATES)
  const docs = docsFor(a.id)
    .filter((d) => VIEW_COUNTS[d.id])
    .sort((x, y) => (VIEW_COUNTS[y.id] ?? 0) - (VIEW_COUNTS[x.id] ?? 0))

  if (state === 'none') {
    return (
      <Page title={t('views.title')} back={`/owner/assets/${a.id}`}>
        <EmptyState icon={<Eye />} title={t('views.none')} contactId="kevin" />
      </Page>
    )
  }

  return (
    <Page title={t('views.title')} back={`/owner/assets/${a.id}`} subtitle={a.name}>
      {state === 'nda_just' && <Banner tone="info" icon={<Handshake />} title={t('views.nda_just')} className="mb-4" />}
      {state === 'revoked' && <Banner tone="neutral" icon={<UserX />} title={t('views.revoked', { org: 'Northgate Royalty Partners', date: fmtDay('2026-09-19', lang) })} className="mb-4" />}

      <SectionLabel className="mt-0">{t('views.before_nda')}</SectionLabel>
      <div className="rounded-lg border border-line bg-surface p-4 shadow-e1">
        <p className="flex items-center gap-3 text-body">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary-tint text-h2 font-semibold text-primary">3</span>
          <span>{t('views.opened_teaser', { count: 3 })}</span>
        </p>
        <p className="mt-3 flex items-center gap-1.5 text-micro text-muted">
          <LockKeyhole className="size-3.5" aria-hidden />
          {t('views.before')}
        </p>
      </div>

      <SectionLabel>{t('views.after_nda')}</SectionLabel>
      <ul className="space-y-2.5">
        <li className="rounded-lg border border-line bg-surface p-4 shadow-e1">
          <p className="flex items-start gap-3 text-body">
            <Building2 className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden />
            {t('views.org', { org: 'Cedar Peak Minerals Fund', count: 14, date: fmtDay('2026-09-22', lang) })}
          </p>
        </li>
        {state === 'nda_just' && (
          <li className="rounded-lg border border-dashed border-line-strong bg-surface/60 p-4">
            <p className="flex items-start gap-3 text-body text-muted">
              <Building2 className="mt-0.5 size-5 shrink-0" aria-hidden />
              Brightwater Anode Co. · 0 {t('views.documents').toLowerCase()}
            </p>
          </li>
        )}
      </ul>

      <SectionLabel>{t('views.documents')}</SectionLabel>
      <ul className="overflow-hidden rounded-lg border border-line bg-surface shadow-e1">
        {docs.map((d) => (
          <li key={d.id} className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-0">
            <FileText className="size-5 shrink-0 text-muted" aria-hidden />
            <span className="min-w-0 flex-1 truncate text-meta">{d.name}</span>
            <Chip tone="neutral">{t('views.count', { count: VIEW_COUNTS[d.id] })}</Chip>
          </li>
        ))}
      </ul>
      <p className="mt-3 flex items-start gap-2 text-meta text-muted">
        <Stamp className="mt-0.5 size-4 shrink-0" aria-hidden />
        {t('views.watermark')}
      </p>
    </Page>
  )
}
