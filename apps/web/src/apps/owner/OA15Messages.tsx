import { Check, CheckCheck, Clock, FileImage, Paperclip, SendHorizontal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { useDemoState } from '@/lib/demo-states'
import { fmtDay, fmtTime } from '@/lib/format'
import { person, type Message } from '@/data'
import { Page } from '@/ds/shell'
import { Avatar, IconButton, toast } from '@/ds/ui'
import { OfflineBanner, useOwner } from './common'
import { useT } from './i18n'

const STATES = [
  { id: 'default', label: 'Conversation' },
  { id: 'offline', label: 'Offline with queued message' },
] as const

export default function OA15Messages() {
  const { t, lang } = useT()
  const [state] = useDemoState('OA-15', STATES)
  const { messages, persona } = useOwner()
  const [list, setList] = useState<Message[]>(messages)
  const [text, setText] = useState('')
  const end = useRef<HTMLDivElement>(null)
  const offline = state === 'offline'

  useEffect(() => {
    setList(
      offline
        ? [...messages, { id: 'q', from: 'owner', authorId: persona, at: '2026-09-24T09:31', text: lang === 'sw' ? 'Nimepiga picha ya mpango wa upimaji.' : 'I have taken a photo of the survey plan.', status: 'queued', attachment: { name: 'survey-plan.jpg', size: '2.1 MB' } }]
        : messages,
    )
  }, [offline, messages, persona, lang])

  // Open at the latest message; wait a frame so route scroll restoration runs first.
  useEffect(() => {
    const id = window.setTimeout(() => window.scrollTo({ top: document.documentElement.scrollHeight }), 60)
    return () => window.clearTimeout(id)
  }, [list.length])

  const send = () => {
    if (!text.trim()) return
    setList((l) => [...l, { id: `n${l.length}`, from: 'owner', authorId: persona, at: '2026-09-24T09:32', text, status: offline ? 'queued' : 'sent' }])
    setText('')
    if (!offline) window.setTimeout(() => setList((l) => l.map((m, i) => (i === l.length - 1 ? { ...m, status: 'delivered' } : m))), 900)
  }

  let lastDay = ''
  return (
    <Page
      title="Kevin Omondi"
      subtitle={t('welcome.contact_role')}
      footer={
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
          className="flex items-end gap-2"
        >
          <IconButton label={t('msg.attach')} variant="outline" onClick={() => toast('Attach a photo or file (demo)')}>
            <Paperclip />
          </IconButton>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={1}
            placeholder={t('msg.placeholder')}
            aria-label={t('msg.placeholder')}
            className="max-h-32 min-h-11 flex-1 resize-none rounded-[22px] border border-line-strong bg-surface px-4 py-2.5 outline-none focus-visible:outline-2 focus-visible:outline-primary"
          />
          <IconButton label={t('common.send')} variant="primary" type="submit" disabled={!text.trim()}>
            <SendHorizontal />
          </IconButton>
        </form>
      }
    >
      {offline && <OfflineBanner queued={1} />}
      <div className="space-y-2 pb-2" role="log" aria-live="polite">
        {list.map((m) => {
          const day = m.at.slice(0, 10)
          const showDay = day !== lastDay
          lastDay = day
          const mine = m.from === 'owner'
          return (
            <div key={m.id}>
              {showDay && (
                <p className="my-4 text-center">
                  <span className="rounded-full bg-sunken px-3 py-1 text-micro text-muted">{day === '2026-09-24' ? t('msg.today') : fmtDay(day, lang)}</span>
                </p>
              )}
              <div className={cn('flex items-end gap-2', mine && 'justify-end')}>
                {!mine && <Avatar id={m.authorId} size={28} />}
                <div
                  className={cn(
                    'max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-e1 animate-fade-in',
                    mine ? 'rounded-br-md bg-primary text-on-primary' : 'rounded-bl-md border border-line bg-surface text-fg',
                    m.status === 'queued' && 'opacity-80',
                  )}
                >
                  {!mine && <p className="mb-0.5 text-micro font-semibold text-primary">{person(m.authorId).name}</p>}
                  {m.attachment && (
                    <div className={cn('mb-1.5 flex items-center gap-2 rounded-lg p-2', mine ? 'bg-white/15' : 'bg-sunken')}>
                      <FileImage className="size-5 shrink-0" aria-hidden />
                      <span className="min-w-0 flex-1 truncate text-meta">{m.attachment.name}</span>
                      <span className="text-micro opacity-75">{m.attachment.size}</span>
                    </div>
                  )}
                  <p className="text-body whitespace-pre-wrap">{m.text}</p>
                  <p className={cn('mt-1 flex items-center justify-end gap-1 text-[11px]', mine ? 'text-on-primary/75' : 'text-muted')}>
                    {fmtTime(m.at)}
                    {mine &&
                      (m.status === 'queued' ? (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3" aria-hidden /> {t('msg.queued')}
                        </span>
                      ) : m.status === 'sent' ? (
                        <Check className="size-3.5" aria-label="Sent" />
                      ) : (
                        <CheckCheck className={cn('size-3.5', m.status === 'read' && 'text-[#9fd0ff]')} aria-label={m.status === 'read' ? 'Read' : 'Delivered'} />
                      ))}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={end} />
      </div>
    </Page>
  )
}
