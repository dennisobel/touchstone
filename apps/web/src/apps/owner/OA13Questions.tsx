import { CircleCheck, FileUp, Info, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router'
import { useDemoState } from '@/lib/demo-states'
import { fmtDay } from '@/lib/format'
import { asset, questions } from '@/data'
import { EmptyState, EvidenceChip } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Button, Chip, Textarea, toast } from '@/ds/ui'
import { useT } from './i18n'

const STATES = [
  { id: 'default', label: 'Questions waiting' },
  { id: 'none', label: 'No questions' },
] as const

// Owners see the question category and text only; never who asked (information barrier until SSD forwards).
const SUGGESTED: Record<string, string[]> = { q1: ['kb-d11', 'kb-d10'], q3: ['kb-d14'], q4: ['kb-d17'] }

export default function OA13Questions() {
  const { t, lang } = useT()
  const { id = 'kiboko' } = useParams()
  const a = asset(id)
  const [state] = useDemoState('OA-13', STATES)
  const [sent, setSent] = useState<Record<string, boolean>>({})
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const list = state === 'none' ? [] : questions.filter((q) => q.roomId === 'dr-kiboko-cedar')

  return (
    <Page title={t('q.title')} back={`/owner/assets/${a.id}`} subtitle={a.name}>
      <p className="mb-4 flex items-start gap-2 rounded-lg bg-primary-tint/70 p-3.5 text-meta">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        {t('q.routed')}
      </p>
      {list.length === 0 ? (
        <EmptyState icon={<Info />} title={t('rfi.none')} contactId="kevin" compact />
      ) : (
        <ul className="space-y-3">
          {list.map((q) => {
            const answered = q.status === 'answered' || sent[q.id]
            return (
              <li key={q.id} className="rounded-lg border border-line bg-surface p-4 shadow-e1">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tone="outline">{q.category}</Chip>
                  {answered ? <Chip tone="verified">{t('q.answered')}</Chip> : <Chip tone="review">{t('q.open')}</Chip>}
                  <span className="ml-auto text-micro text-muted">{t('common.due', { date: fmtDay(q.due, lang) })}</span>
                </div>
                <p className="mt-2 text-body font-medium">{q.text}</p>
                {q.answer && !sent[q.id] && q.status !== 'open' && <p className="mt-2 rounded-sm bg-sunken/70 p-3 text-meta">{q.answer}</p>}
                {sent[q.id] && (
                  <p className="mt-2 flex items-start gap-2 rounded-sm bg-verified-fill p-3 text-meta">
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-verified" aria-hidden />
                    {t('q.sent')}
                  </p>
                )}
                {!answered && (
                  <div className="mt-3 space-y-2">
                    {SUGGESTED[q.id] && (
                      <div>
                        <p className="mb-1.5 flex items-center gap-1 text-micro font-semibold text-muted">
                          <Sparkles className="size-3.5 text-primary" aria-hidden />
                          {t('q.suggested')}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {SUGGESTED[q.id].map((d) => (
                            <EvidenceChip key={d} ev={{ docId: d }} />
                          ))}
                        </div>
                      </div>
                    )}
                    <Textarea
                      value={drafts[q.id] ?? ''}
                      onChange={(e) => setDrafts((x) => ({ ...x, [q.id]: e.target.value }))}
                      placeholder={t('q.answer')}
                      aria-label={t('q.answer')}
                    />
                    <div className="flex gap-2">
                      <Button variant="secondary" icon={<FileUp />} onClick={() => toast('File attached (demo)')}>
                        {t('rfi.add_file')}
                      </Button>
                      <Button className="flex-1" disabled={!drafts[q.id]} onClick={() => setSent((x) => ({ ...x, [q.id]: true }))}>
                        {t('q.send')}
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Page>
  )
}
