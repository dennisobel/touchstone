import { ArrowRight, CheckCheck, ChevronRight, Eye, MessageCircleQuestion, PartyPopper, Plus, Pickaxe, ScrollText } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { cn } from '@/lib/cn'
import { useDemoState } from '@/lib/demo-states'
import { fmtDay, fmtTime } from '@/lib/format'
import { useDemo } from '@/lib/store'
import { infoRequests, person, plans } from '@/data'
import { EmptyState, StatusTimeline, TierBadge } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Avatar, Button, ButtonLink, Chip } from '@/ds/ui'
import { OfflineBanner, SectionLabel, useOwner } from './common'
import { useT } from './i18n'

const STATES = [
  { id: 'default', label: 'Default' },
  { id: 'empty', label: 'New user, no assets' },
  { id: 'offline', label: 'Offline' },
  { id: 'released', label: 'Passport released' },
] as const

export default function OA03Home() {
  const { t, lang } = useT()
  const navigate = useNavigate()
  const [state] = useDemoState('OA-03', STATES)
  const { firstName, asset, messages, isGrace } = useOwner()
  const released = isGrace || state === 'released'
  const openRequests = infoRequests.filter((r) => r.assetId === asset.id && r.status === 'open')

  return (
    <Page title={t('home.morning', { name: firstName })} shortTitle={t('tab.home')} large>
      {state === 'offline' && <OfflineBanner />}

      {state === 'empty' ? (
        <EmptyState
          icon={<Pickaxe />}
          title={t('home.empty_title')}
          body={t('home.empty_body')}
          contactId="kevin"
          action={
            <ButtonLink to="/owner/assets/new" size="lg" icon={<Plus />}>
              {t('home.empty_title')}
            </ButtonLink>
          }
          className="mt-2"
        />
      ) : (
        <>
          {/* Next-step card: the most prominent element */}
          {released ? (
            <NextStep
              label={t('home.next_step')}
              title={isGrace ? t('home.approve_teaser') : t('home.see_passport')}
              meta={isGrace ? `Kevin Omondi · ${t('common.due', { date: fmtDay('2026-09-26', lang) })}` : undefined}
              cta={isGrace ? t('home.review') : t('home.see_passport')}
              onClick={() => navigate(`/owner/assets/${asset.id}/${isGrace ? 'teaser' : 'passport'}`, { viewTransition: true })}
            />
          ) : (
            <NextStep
              label={t('home.next_step')}
              title={t('home.answer_q', { count: openRequests.length, name: person('wanjiru').name })}
              meta={t('common.due', { date: fmtDay('2026-09-27', lang) })}
              cta={t('home.answer_now')}
              onClick={() => navigate('/owner/requests', { viewTransition: true })}
            />
          )}

          {released && (
            <div className="mt-4 rounded-lg border border-verified-border bg-verified-fill p-4 animate-rise-in">
              <p className="flex items-center gap-2 text-body font-semibold text-fg">
                <PartyPopper className="size-5 text-verified" aria-hidden />
                {t('home.released_title')}
              </p>
              <p className="mt-1 text-meta text-muted">{t('home.released_body')}</p>
            </div>
          )}

          {/* Asset card */}
          <SectionLabel>{t('tab.assets')}</SectionLabel>
          <Link to={`/owner/assets/${asset.id}`} viewTransition className="pressable block rounded-lg border border-line bg-surface p-4 shadow-e1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-h3 font-semibold text-fg">{asset.name}</p>
                <p className="text-meta text-muted">
                  {asset.licence.number} · {asset.county}
                </p>
              </div>
              {released ? <Chip tone="verified" icon={<CheckCheck />}>{t('home.released_badge')}</Chip> : <TierBadge tier={asset.tier} size="sm" />}
            </div>
            {released ? (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <MiniStat icon={<Eye />} value="3" label={t('home.viewed_label')} />
                <MiniStat icon={<MessageCircleQuestion />} value="2" label={t('home.investor_questions')} />
              </div>
            ) : (
              <>
                <p className="mt-3 text-body font-medium text-fg">{t('home.being_verified', { done: asset.checks.done, total: asset.checks.total })}</p>
                <StatusTimeline steps={plans[asset.id] ?? []} variant="compact" lang={lang} className="mt-2" />
                <p className="mt-2 text-meta text-muted">{t('home.next_update', { date: fmtDay(asset.nextUpdate ?? '2026-09-30', lang) })}</p>
              </>
            )}
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3">
              <span className="inline-flex items-center gap-2 text-meta text-muted">
                <Avatar id="kevin" size={24} />
                Kevin Omondi
              </span>
              <ChevronRight className="size-5 text-muted" aria-hidden />
            </div>
          </Link>

          {isGrace && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <ButtonLink to="/owner/assets/kiboko/questions" variant="secondary" icon={<MessageCircleQuestion />}>
                {t('q.title')}
              </ButtonLink>
              <ButtonLink to="/owner/assets/kiboko/passport" variant="secondary" icon={<ScrollText />}>
                {t('pp.title')}
              </ButtonLink>
            </div>
          )}

          {/* Messages preview */}
          <SectionLabel
            action={
              <Link to="/owner/messages" viewTransition className="text-meta font-medium text-primary">
                {t('common.see_all')}
              </Link>
            }
          >
            {t('home.messages')}
          </SectionLabel>
          <ul className="overflow-hidden rounded-lg border border-line bg-surface shadow-e1">
            {messages.slice(-2).map((m) => (
              <li key={m.id}>
                <Link to="/owner/messages" viewTransition className="flex items-start gap-3 border-b border-line p-3.5 last:border-0 active:bg-sunken">
                  <Avatar id={m.authorId} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-meta font-semibold">{person(m.authorId).name}</p>
                      <span className="shrink-0 text-micro text-muted">
                        {fmtDay(m.at, lang)} {fmtTime(m.at)}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-meta text-muted">{m.text}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <ButtonLink to="/owner/assets/new" variant="secondary" size="lg" block className="mt-6" icon={<Plus />}>
            {t('home.add_licence')}
          </ButtonLink>
        </>
      )}
    </Page>
  )
}

function NextStep({ label, title, meta, cta, onClick }: { label: string; title: string; meta?: string; cta: string; onClick: () => void }) {
  const lang = useDemo((s) => s.lang)
  return (
    <section aria-label={label} className="relative overflow-hidden rounded-xl bg-primary p-5 text-on-primary shadow-e2">
      <div className="absolute -right-8 -top-10 size-36 rounded-full bg-white/10" aria-hidden />
      <p className="relative text-micro font-semibold uppercase tracking-wider opacity-80">{label}</p>
      <p className={cn('relative mt-1.5 font-semibold', lang === 'sw' ? 'text-[19px] leading-7' : 'text-[20px] leading-7')}>{title}</p>
      {meta && <p className="relative mt-1 text-meta opacity-85">{meta}</p>}
      <Button onClick={onClick} size="lg" className="relative mt-4 bg-white text-[#1f4e8c] hover:bg-white/90 dark:bg-[#0f1419] dark:text-[#8fb3e8]" iconRight={<ArrowRight />}>
        {cta}
      </Button>
    </section>
  )
}

function MiniStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-sm bg-sunken/70 p-3">
      <p className="flex items-center gap-1.5 text-h2 font-semibold text-fg [&_svg]:size-4 [&_svg]:text-muted">
        {icon}
        {value}
      </p>
      <p className="text-micro text-muted">{label}</p>
    </div>
  )
}
