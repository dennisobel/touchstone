import { Check, CircleCheck, EyeOff, Info, MessageSquarePlus, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { cn } from '@/lib/cn'
import { useDemoState } from '@/lib/demo-states'
import { asset } from '@/data'
import { assetFlagCounts, EmptyState, FlagCounts, TierBadge } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Button, Textarea, toast } from '@/ds/ui'
import { useT } from './i18n'

const STATES = [
  { id: 'default', label: 'Waiting for approval' },
  { id: 'suggest', label: 'Suggesting changes' },
  { id: 'approved', label: 'Approved' },
  { id: 'none', label: 'Nothing waiting' },
] as const

export default function OA12Teaser() {
  const { t } = useT()
  const { id = 'kiboko' } = useParams()
  const a = asset(id)
  const [state] = useDemoState('OA-12', STATES)
  const [mode, setMode] = useState<'view' | 'suggest' | 'approved' | 'sent'>('view')
  const [comments, setComments] = useState<Record<string, string>>({})
  const [editing, setEditing] = useState<string | null>(null)

  useEffect(() => {
    setMode(state === 'approved' ? 'approved' : state === 'suggest' ? 'suggest' : 'view')
    setComments(state === 'suggest' ? { structure: 'Please say "offtake, with a minority equity stake considered".' } : {})
  }, [state])

  if (state === 'none') {
    return (
      <Page title={t('teaser.title')} back={`/owner/assets/${a.id}`}>
        <EmptyState icon={<Send />} title={t('teaser.none')} contactId="kevin" />
      </Page>
    )
  }

  const lines: { key: string; label: string; value: string }[] = [
    { key: 'code', label: 'Code name', value: a.code },
    { key: 'region', label: 'Region', value: `${a.region}, ${a.country}` },
    { key: 'commodity', label: 'Commodity', value: a.commodity },
    { key: 'stage', label: 'Stage', value: a.stage },
    { key: 'capital', label: 'Capital sought', value: a.capitalSought ?? '' },
    { key: 'structure', label: 'Preferred structure', value: a.structure ?? '' },
    ...(a.highlights ?? []).map((h, i) => ({ key: `h${i}`, label: `Highlight ${i + 1}`, value: h.text })),
  ]

  const done = mode === 'approved' || mode === 'sent'

  return (
    <Page
      title={t('teaser.title')}
      back={`/owner/assets/${a.id}`}
      subtitle={t('teaser.for')}
      focus={!done}
      footer={
        done ? undefined : mode === 'suggest' ? (
          <div className="flex gap-2">
            <Button size="lg" variant="secondary" onClick={() => setMode('view')}>
              {t('common.cancel')}
            </Button>
            <Button
              size="lg"
              className="flex-1"
              icon={<Send />}
              disabled={Object.keys(comments).length === 0}
              onClick={() => {
                setMode('sent')
                toast(t('teaser.changes_sent'))
              }}
            >
              {t('teaser.send_suggestions')}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 md:flex-row-reverse md:justify-start">
            <Button size="lg" icon={<Check />} onClick={() => setMode('approved')} className="md:min-w-40">
              {t('teaser.approve')}
            </Button>
            <Button variant="ghost" icon={<MessageSquarePlus />} onClick={() => setMode('suggest')}>
              {t('teaser.suggest')}
            </Button>
          </div>
        )
      }
    >
      {done && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-verified-border bg-verified-fill p-4 animate-rise-in">
          <CircleCheck className="mt-0.5 size-5 text-verified" aria-hidden />
          <p className="text-body font-medium">{mode === 'approved' ? t('teaser.approved') : t('teaser.changes_sent')}</p>
        </div>
      )}

      <p className="mb-2 text-micro font-semibold uppercase tracking-wide text-muted">{t('teaser.preview')}</p>
      <article className="overflow-hidden rounded-xl border border-line bg-surface shadow-e2">
        <div className="border-b border-line bg-sunken/60 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <TierBadge tier={a.tier} size="sm" />
            <FlagCounts counts={assetFlagCounts(a.id)} compact showZero={false} />
          </div>
          <p className="mt-2 font-serif text-h1 font-semibold">{a.code}</p>
          <p className="text-meta text-muted">
            {a.commodity} · {a.region}, {a.country}
          </p>
        </div>
        <ul>
          {lines.map((l) => (
            <li key={l.key} className={cn('border-b border-line px-4 py-3 last:border-0', comments[l.key] && 'bg-disputed-fill/60')}>
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-micro text-muted">{l.label}</p>
                  <p className="text-body">{l.value}</p>
                </div>
                {mode === 'suggest' && (
                  <button
                    type="button"
                    onClick={() => setEditing(editing === l.key ? null : l.key)}
                    aria-label={`${t('teaser.comment_line')}: ${l.label}`}
                    className={cn('flex size-10 shrink-0 items-center justify-center rounded-full', comments[l.key] ? 'bg-disputed text-white' : 'bg-sunken text-muted')}
                  >
                    <MessageSquarePlus className="size-4.5" />
                  </button>
                )}
              </div>
              {comments[l.key] && editing !== l.key && <p className="mt-2 rounded-sm bg-surface px-3 py-2 text-meta text-disputed">“{comments[l.key]}”</p>}
              {editing === l.key && (
                <div className="mt-2 space-y-2">
                  <Textarea
                    autoFocus
                    defaultValue={comments[l.key]}
                    placeholder={t('teaser.comment_line')}
                    aria-label={t('teaser.comment_line')}
                    onBlur={(e) => {
                      const v = e.target.value.trim()
                      setComments((c) => {
                        const n = { ...c }
                        if (v) n[l.key] = v
                        else delete n[l.key]
                        return n
                      })
                    }}
                  />
                  <Button size="sm" variant="tint" onClick={() => setEditing(null)}>
                    {t('common.done')}
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </article>

      <section className="mt-4 rounded-lg border border-line bg-surface p-4">
        <p className="flex items-center gap-2 text-h3 font-semibold">
          <EyeOff className="size-4.5 text-muted" aria-hidden />
          {t('teaser.hidden')}
        </p>
        <ul className="mt-2 space-y-1.5 text-meta">
          {(['teaser.hidden1', 'teaser.hidden2', 'teaser.hidden3'] as const).map((k) => (
            <li key={k} className="flex items-center gap-2">
              <Check className="size-4 text-verified" aria-hidden />
              {t(k)}
            </li>
          ))}
        </ul>
      </section>
      <p className="mt-4 flex items-start gap-2 text-meta text-muted">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        {t('teaser.explain')}
      </p>
    </Page>
  )
}
