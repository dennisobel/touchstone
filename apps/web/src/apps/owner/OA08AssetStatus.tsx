import { CalendarCheck, ChevronRight, CircleCheck, Clock, Eye, FileText, Hourglass, MessageCircleQuestion, ScrollText, Send, TriangleAlert, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { cn } from '@/lib/cn'
import { useDemoState } from '@/lib/demo-states'
import { fmtDate, fmtDay } from '@/lib/format'
import { asset, claimsFor, infoRequests, person, plans, WORKSTREAMS, type ClaimStatus, type WorkstreamId } from '@/data'
import { ClaimRow, StatusTimeline, TierBadge } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Avatar, Sheet } from '@/ds/ui'
import { ContactCard, OfflineBanner, SectionLabel } from './common'
import { useT, type OwnerKey } from './i18n'

const STATES = [
  { id: 'default', label: 'Request waiting' },
  { id: 'overdue', label: 'A check is overdue' },
  { id: 'offline', label: 'Offline' },
] as const

type OwnerStatus = 'done' | 'in_progress' | 'waiting' | 'not_started'
const ownerStatus = (s: ClaimStatus): OwnerStatus => (s === 'verified' ? 'done' : s === 'declared' ? 'not_started' : s === 'discrepancy' || s === 'disputed' ? 'waiting' : 'in_progress')

// Who is working on each check, and when it is expected (Nyanza Reef Gold and Kiboko Ridge Graphite).
const WHO: Record<string, Record<WorkstreamId, { who: string; date: string }>> = {
  nyanza: {
    title: { who: 'wanjiru', date: '2026-10-12' },
    ownership: { who: 'kevin', date: '2026-09-09' },
    integrity: { who: 'kevin', date: '2026-09-05' },
    geology: { who: 'amani', date: '2026-09-30' },
    technical: { who: 'kevin', date: '2026-09-12' },
    esg: { who: 'faith', date: '2026-10-09' },
    legal: { who: 'wanjiru', date: '2026-09-15' },
  },
  kiboko: {
    title: { who: 'wanjiru', date: '2026-09-10' },
    ownership: { who: 'kevin', date: '2026-09-05' },
    integrity: { who: 'kevin', date: '2026-09-24' },
    geology: { who: 'nomvula', date: '2026-10-07' },
    technical: { who: 'kevin', date: '2026-10-16' },
    esg: { who: 'faith', date: '2026-10-14' },
    legal: { who: 'kevin', date: '2026-10-02' },
  },
}

const STATUS_ICON: Record<OwnerStatus, { Icon: typeof CircleCheck; cls: string }> = {
  done: { Icon: CircleCheck, cls: 'text-verified bg-verified-fill border-verified-border' },
  in_progress: { Icon: Hourglass, cls: 'text-review bg-review-fill border-review-border' },
  waiting: { Icon: UserRound, cls: 'text-disputed bg-disputed-fill border-disputed-border' },
  not_started: { Icon: Clock, cls: 'text-declared border-declared-border border-dashed' },
}

export default function OA08AssetStatus() {
  const { t, lang } = useT()
  const { id = 'nyanza' } = useParams()
  const a = asset(id)
  const [state] = useDemoState('OA-08', STATES)
  const [open, setOpen] = useState<WorkstreamId | null>(null)
  const released = a.passport.status === 'released'
  const waiting = infoRequests.filter((r) => r.assetId === a.id && r.status === 'open')
  const who = WHO[a.id] ?? WHO.nyanza

  return (
    <Page title={a.name} back="/owner/assets" subtitle={`${a.licence.number} · ${a.county}`}>
      {state === 'offline' && <OfflineBanner queued={1} />}

      <div className="flex flex-wrap items-center gap-2">
        <TierBadge tier={a.tier} />
        {a.tierInProgress && <TierBadge tier={a.tierInProgress} className="opacity-70" />}
        <span className="text-meta text-muted">{t('home.being_verified', { done: a.checks.done, total: a.checks.total })}</span>
      </div>

      {waiting.length > 0 && (
        <Link
          to="/owner/requests"
          viewTransition
          className="pressable mt-4 flex items-center gap-3 rounded-lg border border-disputed-border bg-disputed-fill p-4"
        >
          <MessageCircleQuestion className="size-6 shrink-0 text-disputed" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-body font-semibold">{t('status.waiting_you', { what: lang === 'sw' ? waiting[0].titleSw : waiting[0].title })}</p>
            <p className="text-meta text-muted">
              {waiting.length > 1 ? `+${waiting.length - 1} · ` : ''}
              {t('common.due', { date: fmtDay(waiting[0].due, lang) })}
            </p>
          </div>
          <ChevronRight className="size-5 text-muted" aria-hidden />
        </Link>
      )}

      <SectionLabel>{t('status.checks')}</SectionLabel>
      <ul className="overflow-hidden rounded-lg border border-line bg-surface shadow-e1">
        {WORKSTREAMS.map((w) => {
          const st = ownerStatus(a.workstreamStatus[w.id])
          const overdue = state === 'overdue' && w.id === 'title' && a.id === 'nyanza'
          const { Icon, cls } = STATUS_ICON[st]
          const info = who[w.id]
          return (
            <li key={w.id} className="border-b border-line last:border-0">
              <button type="button" onClick={() => setOpen(w.id)} className="flex w-full items-start gap-3 p-4 text-left active:bg-sunken">
                <span className={cn('mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border', cls)}>
                  <Icon className="size-4.5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-body font-semibold">{w.plain[lang]}</p>
                  <p className="text-meta text-muted">
                    <span className="font-medium text-fg">{t(`status.${st}` as OwnerKey)}</span> · {person(info.who).name}
                  </p>
                  <p className={cn('mt-0.5 text-micro', overdue ? 'font-medium text-review' : 'text-muted')}>
                    {overdue ? (
                      <span className="inline-flex items-start gap-1">
                        <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
                        {t('status.overdue', { reason: lang === 'sw' ? 'tunasubiri utafutaji rasmi kutoka Wizara' : 'waiting for a certified search from the Ministry', date: fmtDay('2026-10-14', lang) })}
                      </span>
                    ) : st === 'done' ? (
                      `${t('status.done')} ${fmtDate(info.date, lang)}`
                    ) : (
                      t('status.expected', { date: fmtDate(info.date, lang) })
                    )}
                  </p>
                </div>
                <ChevronRight className="mt-2 size-4 shrink-0 text-muted" aria-hidden />
              </button>
            </li>
          )
        })}
      </ul>

      {a.siteVisit && !released && (
        <>
          <SectionLabel>{t('status.site_visit', { name: person(a.siteVisit.verifierId).name, date: fmtDay(a.siteVisit.date, lang) })}</SectionLabel>
          <div className="rounded-lg border border-line bg-surface p-4 shadow-e1">
            <div className="flex items-center gap-3">
              <Avatar id={a.siteVisit.verifierId} size={44} />
              <div className="min-w-0 flex-1">
                <p className="text-body font-semibold">{person(a.siteVisit.verifierId).name}</p>
                <p className="text-meta text-muted">{person(a.siteVisit.verifierId).role}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-tint px-2.5 py-1 text-micro font-semibold text-primary">
                <CalendarCheck className="size-3.5" aria-hidden />
                {fmtDay(a.siteVisit.date, lang)}
              </span>
            </div>
            <p className="mt-4 text-micro font-semibold uppercase tracking-wide text-muted">{t('status.prepare')}</p>
            <ul className="mt-2 space-y-2 text-meta">
              {(['status.prep1', 'status.prep2', 'status.prep3'] as const).map((k) => (
                <li key={k} className="flex gap-2">
                  <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  {t(k)}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-micro text-muted">{t('status.reach')}</p>
          </div>
        </>
      )}

      {released && (
        <>
          <SectionLabel>{t('pp.title')}</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {[
              { to: 'passport', icon: <ScrollText />, label: t('pp.title') },
              { to: 'teaser', icon: <Send />, label: t('teaser.title') },
              { to: 'questions', icon: <MessageCircleQuestion />, label: t('q.title') },
              { to: 'views', icon: <Eye />, label: t('views.title') },
            ].map((l) => (
              <Link key={l.to} to={`/owner/assets/${a.id}/${l.to}`} viewTransition className="pressable flex min-h-20 flex-col justify-between gap-2 rounded-lg border border-line bg-surface p-3.5 shadow-e1 [&_svg]:size-5 [&_svg]:text-primary">
                {l.icon}
                <span className="text-meta font-semibold">{l.label}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      {!released && (
        <Link to={`/owner/assets/${a.id}/findings`} viewTransition className="pressable mt-3 flex items-center gap-3 rounded-lg border border-line bg-surface p-4 shadow-e1">
          <FileText className="size-5 text-primary" aria-hidden />
          <span className="flex-1">
            <span className="block text-body font-semibold">{t('find.title')}</span>
            <span className="block text-meta text-muted">{t('status.expected', { date: fmtDate(a.findingsDue ?? '2026-10-16', lang) })}</span>
          </span>
          <ChevronRight className="size-4 text-muted" aria-hidden />
        </Link>
      )}

      <SectionLabel>{t('status.plan')}</SectionLabel>
      <div className="rounded-lg border border-line bg-surface p-4 shadow-e1">
        <StatusTimeline steps={plans[a.id] ?? []} lang={lang} />
      </div>

      <ContactCard className="mt-6" />

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)} title={open ? WORKSTREAMS.find((w) => w.id === open)!.plain[lang] : ''} description={open ? WORKSTREAMS.find((w) => w.id === open)!.name : undefined}>
        {open && (
          <div className="-mx-4 md:-mx-5">
            {claimsFor(a.id)
              .filter((c) => c.workstream === open)
              .map((c) => (
                <ClaimRow key={c.id} claim={c} lang={lang} plain expanded />
              ))}
            {claimsFor(a.id).filter((c) => c.workstream === open).length === 0 && <p className="px-4 text-meta text-muted">{t('status.not_started')}</p>}
          </div>
        )}
      </Sheet>
    </Page>
  )
}
