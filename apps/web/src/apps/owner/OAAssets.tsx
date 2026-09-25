import { ChevronRight, MessageCircleQuestion, Plus } from 'lucide-react'
import { Link } from 'react-router'
import { infoRequests } from '@/data'
import { StatusTimeline, TierBadge } from '@/ds/components'
import { Page } from '@/ds/shell'
import { ButtonLink, Chip } from '@/ds/ui'
import { plans } from '@/data'
import { useOwner } from './common'
import { useT } from './i18n'

/** "My assets" tab destination (P2.18). */
export default function OAAssets() {
  const { t, lang } = useT()
  const { asset: a } = useOwner()
  const released = a.passport.status === 'released'
  const open = infoRequests.filter((r) => r.assetId === a.id && r.status === 'open').length
  return (
    <Page title={t('assets.title')} large>
      <Link to={`/owner/assets/${a.id}`} viewTransition className="pressable block rounded-lg border border-line bg-surface p-4 shadow-e1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-h3 font-semibold">{a.name}</p>
            <p className="text-meta text-muted">
              {a.commodity} · {a.licence.number}
            </p>
          </div>
          <ChevronRight className="mt-1 size-5 text-muted" aria-hidden />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <TierBadge tier={a.tier} size="sm" />
          {released ? <Chip tone="verified">{t('home.released_badge')}</Chip> : <Chip tone="review">{t('home.being_verified', { done: a.checks.done, total: a.checks.total })}</Chip>}
        </div>
        {!released && <StatusTimeline steps={plans[a.id] ?? []} variant="compact" lang={lang} className="mt-3" />}
      </Link>
      {open > 0 && (
        <Link to="/owner/requests" viewTransition className="pressable mt-3 flex items-center gap-3 rounded-lg border border-disputed-border bg-disputed-fill p-4">
          <MessageCircleQuestion className="size-5 text-disputed" aria-hidden />
          <span className="flex-1 text-body font-medium">
            {t('rfi.title')} · {open}
          </span>
          <ChevronRight className="size-4 text-muted" aria-hidden />
        </Link>
      )}
      <ButtonLink to="/owner/assets/new" variant="secondary" size="lg" block className="mt-6" icon={<Plus />}>
        {t('home.add_licence')}
      </ButtonLink>
    </Page>
  )
}
