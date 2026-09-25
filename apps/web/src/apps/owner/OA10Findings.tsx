import { Camera, Check, CircleCheck, Clock, FileUp, Lock, MessageSquareReply, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router'
import { useDemoState } from '@/lib/demo-states'
import { fmtDate, fmtDay } from '@/lib/format'
import { asset, claimsFor, flagsFor, person, WORKSTREAMS, type Claim, type RedFlag } from '@/data'
import { Banner, EvidenceChip, RedFlagCard, StatusStamp } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Button, Textarea, toast } from '@/ds/ui'
import { useT } from './i18n'

const STATES = [
  { id: 'default', label: 'Findings ready' },
  { id: 'nothing', label: 'Nothing to reply to' },
  { id: 'closed', label: 'Reply window closed' },
  { id: 'review', label: 'Replies under review' },
] as const

type Reply = { kind: 'agree' } | { kind: 'reply'; text: string; files: number }

export default function OA10Findings() {
  const { t, lang } = useT()
  const { id = 'nyanza' } = useParams()
  const a = asset(id)
  const [state] = useDemoState('OA-10', STATES)
  const [replies, setReplies] = useState<Record<string, Reply>>({})
  const [submitted, setSubmitted] = useState(false)
  const claims = claimsFor(a.id)
  const flags = flagsFor(a.id).filter((f) => f.status !== 'resolved')
  const nothing = state === 'nothing'
  const closed = state === 'closed'
  const underReview = state === 'review' || submitted
  const needs = nothing ? [] : [...claims.filter((c) => c.status === 'discrepancy').map((c) => c.id), ...flags.map((f) => f.id)]
  const verified = claims.filter((c) => c.status === 'verified').length
  const review = claims.filter((c) => c.status === 'in_review').length
  const count = Object.keys(replies).length
  const readOnly = closed || underReview

  return (
    <Page
      title={t('find.title')}
      back={`/owner/assets/${a.id}`}
      subtitle={a.name}
      focus={!readOnly}
      footer={
        !readOnly && !nothing ? (
          <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-micro text-muted">
              <ShieldCheck className="size-3.5" aria-hidden />
              {t('find.compliance')}
            </p>
            <Button
              size="xl"
              block
              disabled={count === 0}
              onClick={() => {
                setSubmitted(true)
                toast.success(t('find.submitted'))
              }}
            >
              {t('find.submit', { count })}
            </Button>
          </div>
        ) : undefined
      }
    >
      {closed ? (
        <Banner tone="neutral" icon={<Lock />} title={t('find.closed', { date: fmtDay('2026-10-23', lang) })} />
      ) : underReview ? (
        <Banner tone="info" icon={<Clock />} title={t('find.under_review', { date: fmtDay('2026-10-28', lang) })} />
      ) : (
        <div className="rounded-xl bg-primary p-5 text-on-primary shadow-e2">
          <p className="text-[19px] leading-7 font-semibold">{t('find.ready', { date: fmtDay(a.replyUntil ?? '2026-10-23', lang) })}</p>
          <p className="mt-2 text-meta opacity-90">{t('find.counts', { verified, review, issues: needs.length })}</p>
        </div>
      )}

      {nothing && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-verified-border bg-verified-fill p-4">
          <CircleCheck className="mt-0.5 size-5 text-verified" aria-hidden />
          <p className="text-body">{t('find.nothing')}</p>
        </div>
      )}

      {flags.length > 0 && !nothing && (
        <section className="mt-6">
          <h2 className="mb-2 text-micro font-semibold uppercase tracking-wide text-muted">{t('find.flags')}</h2>
          <div className="space-y-3">
            {flags.map((f) => (
              <FlagWithReply key={f.id} flag={f} reply={replies[f.id]} onReply={(r) => setReplies((x) => ({ ...x, [f.id]: r }))} readOnly={readOnly} />
            ))}
          </div>
        </section>
      )}

      {WORKSTREAMS.map((w) => {
        const items = claims.filter((c) => c.workstream === w.id).map((c) => (nothing && c.status === 'discrepancy' ? { ...c, status: 'verified' as const } : c))
        if (items.length === 0) return null
        return (
          <section key={w.id} className="mt-6">
            <h2 className="mb-2 text-h3 font-semibold">{w.plain[lang]}</h2>
            <div className="space-y-2.5">
              {items.map((c) => (
                <Finding key={c.id} claim={c} reply={replies[c.id]} onReply={(r) => setReplies((x) => ({ ...x, [c.id]: r }))} readOnly={readOnly} />
              ))}
            </div>
          </section>
        )
      })}
    </Page>
  )
}

function Finding({ claim: c, reply, onReply, readOnly }: { claim: Claim; reply?: Reply; onReply: (r: Reply) => void; readOnly: boolean }) {
  const { lang } = useT()
  const actionable = c.status === 'discrepancy'
  return (
    <article className={`rounded-lg border bg-surface p-4 shadow-e1 ${actionable ? 'border-critical-border' : 'border-line'}`}>
      <StatusStamp status={c.status} lang={lang} />
      <p className="mt-2 text-body">{c.plain?.[lang] ?? c.statement}</p>
      {c.evidence.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {c.evidence.map((e, i) => (
            <EvidenceChip key={i} ev={e} />
          ))}
        </div>
      )}
      {c.verifierId && (
        <p className="mt-3 text-micro text-muted">
          {person(c.verifierId).name}
          {c.verifiedOn && ` · ${fmtDate(c.verifiedOn, lang)}`}
        </p>
      )}
      {actionable && <ReplyControls reply={reply} onReply={onReply} readOnly={readOnly} />}
    </article>
  )
}

function FlagWithReply({ flag, reply, onReply, readOnly }: { flag: RedFlag; reply?: Reply; onReply: (r: Reply) => void; readOnly: boolean }) {
  const { lang } = useT()
  return (
    <RedFlagCard
      flag={flag}
      plain
      lang={lang}
      showWorkstream
      actions={
        <div className="-mt-3 w-full">
          <ReplyControls reply={reply} onReply={onReply} readOnly={readOnly} />
        </div>
      }
    />
  )
}

function ReplyControls({ reply, onReply, readOnly }: { reply?: Reply; onReply: (r: Reply) => void; readOnly: boolean }) {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [files, setFiles] = useState(0)
  if (reply?.kind === 'agree')
    return (
      <p className="mt-3 inline-flex items-center gap-1.5 text-meta font-medium text-verified">
        <Check className="size-4" aria-hidden /> {t('find.agreed')}
      </p>
    )
  if (reply?.kind === 'reply')
    return (
      <div className="mt-3 rounded-sm border border-disputed-border bg-disputed-fill p-3 text-meta">
        <p className="font-semibold text-disputed">{t('find.your_reply')}</p>
        <p className="mt-1">{reply.text}</p>
        {reply.files > 0 && <p className="mt-1 text-micro text-muted">+{reply.files} files</p>}
      </div>
    )
  if (readOnly) return null
  return (
    <div className="mt-3 space-y-2">
      {!open ? (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" icon={<Check />} onClick={() => onReply({ kind: 'agree' })}>
            {t('find.agree')}
          </Button>
          <Button variant="tint" icon={<MessageSquareReply />} onClick={() => setOpen(true)}>
            {t('find.reply')}
          </Button>
        </div>
      ) : (
        <div className="space-y-2 animate-fade-in">
          <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t('find.your_reply')} aria-label={t('find.your_reply')} />
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" icon={<Camera />} onClick={() => setFiles((f) => f + 1)}>
              {t('rfi.add_photo')}
            </Button>
            <Button variant="secondary" icon={<FileUp />} onClick={() => setFiles((f) => f + 1)}>
              {t('find.add_evidence')}
            </Button>
          </div>
          {files > 0 && <p className="text-micro text-muted">{files} files attached</p>}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button className="flex-1" disabled={!text} onClick={() => onReply({ kind: 'reply', text, files })}>
              {t('common.done')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
