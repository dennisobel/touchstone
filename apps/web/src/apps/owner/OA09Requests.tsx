import { Camera, ChevronRight, CircleCheck, CornerDownRight, FileUp, Inbox, Paperclip, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { cn } from '@/lib/cn'
import { useDemoState } from '@/lib/demo-states'
import { daysUntil, fmtDay } from '@/lib/format'
import { infoRequests, person, type InfoRequest } from '@/data'
import { EmptyState } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Avatar, Button, Chip, Segmented, Textarea } from '@/ds/ui'
import { useT } from './i18n'

const STATES = [
  { id: 'default', label: 'List' },
  { id: 'detail', label: 'Detail' },
  { id: 'overdue', label: 'Overdue (gentle)' },
  { id: 'sent', label: 'Sent' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'follow_up', label: 'Follow-up question' },
  { id: 'none', label: 'No requests' },
] as const

export default function OA09Requests() {
  const { rid } = useParams()
  const [state] = useDemoState('OA-09', STATES)
  const navigate = useNavigate()
  useEffect(() => {
    const map: Record<string, string> = { detail: 'rfi-1', overdue: 'rfi-1', sent: 'rfi-4', accepted: 'rfi-5', follow_up: 'rfi-3' }
    if (map[state] && rid !== map[state]) navigate(`/owner/requests/${map[state]}?state=${state}`, { replace: true })
    if (state === 'none' && rid) navigate('/owner/requests?state=none', { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])
  return rid ? <RequestDetail rid={rid} overdue={state === 'overdue'} /> : <RequestList empty={state === 'none'} />
}

function statusChip(r: InfoRequest, t: ReturnType<typeof useT>['t'], lang: 'en' | 'sw', overdue = false) {
  if (r.status === 'accepted') return <Chip tone="verified">{t('rfi.st_accepted')}</Chip>
  if (r.status === 'sent') return <Chip tone="primary">{t('rfi.st_sent')}</Chip>
  if (r.status === 'follow_up') return <Chip tone="disputed">{t('rfi.st_follow_up')}</Chip>
  const left = daysUntil(r.due)
  // Overdue stays gentle: amber, never alarm red (OA-09 prompt).
  return <Chip tone={overdue || left < 0 ? 'review' : 'neutral'}>{t('common.due', { date: fmtDay(r.due, lang) })}</Chip>
}

function RequestList({ empty }: { empty: boolean }) {
  const { t, lang } = useT()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'open' | 'answered'>('open')
  const mine = empty ? [] : infoRequests.filter((r) => r.assetId === 'nyanza')
  const open = mine.filter((r) => r.status === 'open' || r.status === 'follow_up')
  const answered = mine.filter((r) => r.status === 'sent' || r.status === 'accepted')
  const list = tab === 'open' ? open : answered

  return (
    <Page title={t('rfi.title')} back="/owner" large>
      <Segmented
        ariaLabel={t('rfi.title')}
        value={tab}
        onChange={setTab}
        block
        options={[
          { value: 'open', label: t('rfi.open'), count: open.length },
          { value: 'answered', label: t('rfi.answered'), count: answered.length },
        ]}
      />
      {list.length === 0 ? (
        <EmptyState icon={<Inbox />} title={t('rfi.none')} contactId="kevin" className="mt-4" compact />
      ) : (
        <ul className="mt-4 space-y-2.5">
          {list.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => navigate(`/owner/requests/${r.id}`, { viewTransition: true })}
                className="pressable flex w-full items-start gap-3 rounded-lg border border-line bg-surface p-4 text-left shadow-e1"
              >
                <Avatar id={r.askedById} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="text-body font-semibold">{lang === 'sw' ? r.titleSw : r.title}</p>
                  <p className="text-meta text-muted">{t('rfi.from', { name: person(r.askedById).name })}</p>
                  <div className="mt-2">{statusChip(r, t, lang)}</div>
                </div>
                <ChevronRight className="mt-2 size-4 text-muted" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Page>
  )
}

function RequestDetail({ rid, overdue }: { rid: string; overdue: boolean }) {
  const { t, lang } = useT()
  const navigate = useNavigate()
  const r = infoRequests.find((x) => x.id === rid) ?? infoRequests[0]
  const [answer, setAnswer] = useState('')
  const [files, setFiles] = useState<string[]>([])
  const [missing, setMissing] = useState(false)
  const [sent, setSent] = useState(false)
  const asker = person(r.askedById)
  const canAnswer = r.status === 'open' || r.status === 'follow_up'

  if (sent) {
    return (
      <Page title={t('rfi.title')} back="/owner/requests" focus>
        <div className="flex flex-col items-center py-10 text-center animate-rise-in">
          <span className="flex size-16 items-center justify-center rounded-full bg-verified-fill text-verified">
            <CircleCheck className="size-8" aria-hidden />
          </span>
          <h1 className="mt-5 text-h1 font-semibold">{t('rfi.sent_title', { name: asker.name })}</h1>
          <p className="mt-2 max-w-sm text-body text-muted">{t('rfi.sent_body')}</p>
          <Button size="lg" className="mt-8" onClick={() => navigate('/owner/requests', { viewTransition: true })}>
            {t('rfi.title')}
          </Button>
        </div>
      </Page>
    )
  }

  return (
    <Page
      title={lang === 'sw' ? r.titleSw : r.title}
      shortTitle={t('rfi.title')}
      back="/owner/requests"
      focus={canAnswer}
      footer={
        canAnswer ? (
          <Button size="xl" block disabled={!answer && files.length === 0 && !missing} onClick={() => setSent(true)}>
            {t('rfi.send')}
          </Button>
        ) : undefined
      }
    >
      <div className="flex items-center gap-3">
        <Avatar id={r.askedById} size={40} />
        <div>
          <p className="text-meta font-semibold">{asker.name}</p>
          <p className="text-micro text-muted">{asker.role}</p>
        </div>
        <div className="ml-auto">{statusChip(r, t, lang, overdue)}</div>
      </div>

      {overdue && <p className="mt-4 rounded-lg bg-review-fill px-4 py-3 text-meta text-fg">{t('rfi.overdue_gentle', { date: fmtDay('2026-09-22', lang) })}</p>}

      {r.status === 'follow_up' && r.answer && (
        <div className="mt-4 rounded-lg border border-line bg-sunken/70 p-3.5">
          <p className="text-micro font-semibold text-muted">{t('rfi.your_earlier')}</p>
          <p className="mt-1 text-meta">{r.answer}</p>
        </div>
      )}

      <div className="mt-4 rounded-lg border border-line bg-surface p-4 shadow-e1">
        {r.status === 'follow_up' && r.followUp ? (
          <>
            <p className="flex items-center gap-1.5 text-micro font-semibold text-disputed">
              <CornerDownRight className="size-3.5" aria-hidden />
              {t('rfi.follow_up_label', { name: asker.name })}
            </p>
            <p className="mt-1 text-[18px] leading-7 font-medium">{r.followUp}</p>
          </>
        ) : (
          <p className="text-[18px] leading-7 font-medium">{lang === 'sw' ? r.questionSw : r.question}</p>
        )}
        <div className="mt-4 rounded-sm bg-primary-tint/70 p-3">
          <p className="text-micro font-semibold uppercase tracking-wide text-primary">{t('rfi.why')}</p>
          <p className="mt-1 text-meta">{r.why[lang]}</p>
        </div>
        <p className="mt-3 text-meta text-muted">{t('rfi.formats', { formats: r.formats })}</p>
      </div>

      {canAnswer ? (
        <section className="mt-6 space-y-3">
          <h2 className="text-h3 font-semibold">{t('rfi.answer')}</h2>
          <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder={t('rfi.write')} aria-label={t('rfi.write')} rows={4} />
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" icon={<Camera />} onClick={() => setFiles((f) => [...f, `photo-${f.length + 1}.jpg`])}>
              {t('rfi.add_photo')}
            </Button>
            <Button variant="secondary" icon={<FileUp />} onClick={() => setFiles((f) => [...f, `survey-plan-${f.length + 1}.pdf`])}>
              {t('rfi.add_file')}
            </Button>
          </div>
          {files.length > 0 && (
            <ul className="space-y-1.5">
              {files.map((f) => (
                <li key={f} className="flex items-center gap-2 rounded-sm border border-line bg-surface px-3 py-2 text-meta">
                  <Paperclip className="size-4 text-muted" aria-hidden />
                  <span className="flex-1 truncate">{f}</span>
                  <button type="button" aria-label="Remove" onClick={() => setFiles((x) => x.filter((y) => y !== f))} className="rounded-full p-1.5 text-muted hover:bg-sunken">
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => setMissing((m) => !m)}
            className={cn('min-h-target w-full rounded-lg border px-4 text-left text-meta font-medium', missing ? 'border-primary bg-primary-tint text-primary' : 'border-line text-muted')}
          >
            {t('rfi.dont_have')}
          </button>
        </section>
      ) : (
        r.answer && (
          <section className="mt-6 rounded-lg border border-line bg-surface p-4">
            <p className="text-micro font-semibold uppercase tracking-wide text-muted">{t('rfi.answer')}</p>
            <p className="mt-1 text-body">{r.answer}</p>
          </section>
        )
      )}
    </Page>
  )
}
