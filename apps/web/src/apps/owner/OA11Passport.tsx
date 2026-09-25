import { Download, Info, ScrollText } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router'
import { fmtDate } from '@/lib/format'
import { asset, claimsFor, flagsFor, WORKSTREAMS, type WorkstreamId } from '@/data'
import { Banner, ClaimRow, EmptyState, ExplainThis, PassportHeader, RedFlagCard, WorkstreamCard } from '@/ds/components'
import { Page } from '@/ds/shell'
import { ButtonLink, Sheet } from '@/ds/ui'
import { SectionLabel } from './common'
import { useT } from './i18n'

export default function OA11Passport() {
  const { t, lang } = useT()
  const { id = 'kiboko' } = useParams()
  const a = asset(id)
  const [open, setOpen] = useState<WorkstreamId | null>(null)
  const released = a.passport.status === 'released'

  if (!released) {
    return (
      <Page title={t('pp.title')} back={`/owner/assets/${a.id}`}>
        <EmptyState icon={<ScrollText />} title={t('pp.title')} body={t('pp.not_released')} contactId="kevin" action={<ButtonLink to={`/owner/assets/${a.id}`}>{t('status.checks')}</ButtonLink>} />
      </Page>
    )
  }

  return (
    <Page
      title={t('pp.title')}
      back={`/owner/assets/${a.id}`}
      subtitle={t('pp.released', { date: fmtDate(a.passport.releasedOn!, lang), v: a.passport.version! })}
      actions={
        <ButtonLink to={`/print/passport/${a.id}`} variant="secondary" icon={<Download />}>
          {t('pp.download')}
        </ButtonLink>
      }
    >
      <Banner tone="info" icon={<Info />} className="mb-4">
        {t('pp.what_investors')}
      </Banner>
      <PassportHeader asset={a} view="full" compact />
      <p className="mt-2 text-meta text-muted">{t('pp.fresh', { fresh: a.fresh.fresh, total: a.fresh.total })}</p>

      <SectionLabel>{WORKSTREAMS.find((w) => w.id === 'geology')!.plain[lang]}</SectionLabel>
      <div className="rounded-lg border border-line bg-surface p-4 shadow-e1">
        <ExplainThis
          defaultOn
          technical={<p className="text-body">JORC (2012) Inferred Mineral Resource of 12.4 Mt at 8.1% Cg (4% Cg cut-off), effective 30 Jun 2025. Independent Qualified Person review in progress; QA/QC duplicate insertion 2.8% against a 5% target.</p>}
          plain={
            <p>
              {lang === 'sw'
                ? 'Kuna makadirio ya awali yenye uhakika mdogo ya takriban tani milioni 12 za mwamba wenye grafiti takriban 8%. Baadhi ya sampuli za udhibiti wa ubora hazipo, hivyo mwanajiolojia huru anayakagua sasa.'
                : 'There is an early, low-confidence estimate of about 12 million tonnes of rock containing about 8% graphite. Some quality-control samples are missing, so an independent geologist is checking it now.'}
            </p>
          }
        />
      </div>

      <SectionLabel>{t('find.flags')}</SectionLabel>
      <div className="space-y-3">
        {flagsFor(a.id)
          .filter((f) => f.status !== 'resolved')
          .map((f) => (
            <RedFlagCard key={f.id} flag={f} plain lang={lang} />
          ))}
      </div>

      <SectionLabel>{t('status.checks')}</SectionLabel>
      <div className="grid gap-3 sm:grid-cols-2">
        {WORKSTREAMS.map((w) => (
          <WorkstreamCard key={w.id} asset={a} ws={w.id} plain lang={lang} onClick={() => setOpen(w.id)} />
        ))}
      </div>

      <ButtonLink to={`/owner/assets/${a.id}/views`} variant="ghost" block className="mt-6">
        {t('views.title')}
      </ButtonLink>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)} title={open ? WORKSTREAMS.find((w) => w.id === open)!.plain[lang] : ''} description={open ? WORKSTREAMS.find((w) => w.id === open)!.name : undefined}>
        <div className="-mx-4 md:-mx-5">
          {open &&
            claimsFor(a.id)
              .filter((c) => c.workstream === open)
              .map((c) => <ClaimRow key={c.id} claim={c} lang={lang} plain expanded />)}
        </div>
      </Sheet>
    </Page>
  )
}
