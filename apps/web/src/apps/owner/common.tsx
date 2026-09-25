import { CloudOff, MessageCircle, Phone } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { useDemo } from '@/lib/store'
import { asset, graceMessages, ownerMessages, person } from '@/data'
import { Avatar, Button, toast } from '@/ds/ui'
import { useT } from './i18n'

export function LangToggle({ className }: { className?: string }) {
  const lang = useDemo((s) => s.lang)
  const setLang = useDemo((s) => s.setLang)
  return (
    <div role="radiogroup" aria-label="Language / Lugha" className={cn('inline-flex h-9 items-center rounded-full border border-line bg-surface p-0.5 text-micro font-semibold', className)}>
      {(['en', 'sw'] as const).map((l) => (
        <button
          key={l}
          role="radio"
          aria-checked={lang === l}
          onClick={() => setLang(l)}
          className={cn('h-8 min-w-10 rounded-full px-2.5 uppercase transition-colors', lang === l ? 'bg-fg text-canvas' : 'text-muted')}
          lang={l}
        >
          {l === 'en' ? 'EN' : 'SW'}
        </button>
      ))}
    </div>
  )
}

/** The signed-in owner persona and their asset (Peter: Nyanza Reef Gold, verifying; Grace: Kiboko Ridge Graphite, released). */
export function useOwner() {
  const persona = useDemo((s) => s.ownerPersona)
  const p = person(persona)
  const a = asset(persona === 'grace' ? 'kiboko' : 'nyanza')
  const firstName = p.name.split(' ')[0]
  return { persona, person: p, firstName, asset: a, messages: persona === 'grace' ? graceMessages : ownerMessages, isGrace: persona === 'grace' }
}

export function OfflineBanner({ queued = 3 }: { queued?: number }) {
  const { t } = useT()
  return (
    <div role="status" className="mb-4 flex items-start gap-3 rounded-lg bg-fg p-3.5 text-canvas animate-rise-in">
      <CloudOff className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="text-meta">
        <p className="font-semibold">{t('common.offline_title')}</p>
        <p className="text-canvas/75">{t('common.offline_queued', { count: queued })}</p>
      </div>
    </div>
  )
}

export function ContactCard({ id = 'kevin', title, className, compact }: { id?: string; title?: ReactNode; className?: string; compact?: boolean }) {
  const { t } = useT()
  const p = person(id)
  return (
    <div className={cn('rounded-lg border border-line bg-surface p-4 shadow-e1', className)}>
      {title !== null && <p className="mb-2 text-micro font-semibold uppercase tracking-wide text-muted">{title ?? t('common.contact')}</p>}
      <div className="flex items-center gap-3">
        <Avatar id={id} size={compact ? 40 : 48} />
        <div className="min-w-0 flex-1">
          <p className="text-body font-semibold text-fg">{p.name}</p>
          <p className="text-meta text-muted">{t('welcome.contact_role')}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="secondary" icon={<MessageCircle />} onClick={() => toast(`WhatsApp: ${p.phone ?? '+254 712 000 481'} (demo)`)}>
          {t('common.whatsapp')}
        </Button>
        <Button variant="secondary" icon={<Phone />} onClick={() => toast(`Calling ${p.name} (demo)`)}>
          {t('common.call')}
        </Button>
      </div>
    </div>
  )
}

export function SectionLabel({ children, action, className }: { children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-2 mt-6 flex items-center justify-between gap-2', className)}>
      <h2 className="text-micro font-semibold uppercase tracking-wide text-muted">{children}</h2>
      {action}
    </div>
  )
}
