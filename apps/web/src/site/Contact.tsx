import { BookOpen, Building2, KeyRound, Lock, Mail, MessageCircle, Newspaper, Phone, Smartphone, type LucideIcon } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { cn } from '@/lib/cn'
import { useDocumentTitle } from '@/lib/hooks'
import { person } from '@/data'
import { Avatar, ButtonLink } from '@/ds/ui'
import { Hero, Section } from './SiteLayout'
import { CallbackForm, ExpertApplyForm, GeneralForm, TalkToSsdForm } from './forms'

type Topic = 'owner' | 'investor' | 'network' | 'press' | 'privacy' | 'staff'

const TOPICS: { id: Topic; icon: LucideIcon; label: string; sub: string; contact: string }[] = [
  { id: 'owner', icon: Smartphone, label: 'I hold a mining licence', sub: 'Or represent someone who does', contact: 'kevin' },
  { id: 'investor', icon: Building2, label: 'I invest in mining', sub: 'Or advise investors', contact: 'james' },
  { id: 'network', icon: BookOpen, label: 'I want to join the network', sub: 'Geologists, lawyers, ESG, field', contact: 'kevin' },
  { id: 'press', icon: Newspaper, label: 'Press and partners', sub: 'Media, registries, lenders', contact: 'james' },
  { id: 'privacy', icon: Lock, label: 'Privacy and my data', sub: 'Access, correction, deletion', contact: 'sarah' },
  { id: 'staff', icon: KeyRound, label: 'SSD staff access', sub: 'Command Center accounts', contact: 'aisha' },
]

export default function Contact() {
  useDocumentTitle('Contact')
  const [params, setParams] = useSearchParams()
  const topic = (TOPICS.find((t) => t.id === params.get('topic'))?.id ?? 'owner') as Topic
  const current = TOPICS.find((t) => t.id === topic)!
  const contact = person(current.contact)

  return (
    <>
      <Hero eyebrow="Contact" title="Talk to a named person." sub="Tell us who you are and we'll route you to the right person at SSD. We never ask for money, codes or documents by phone." />

      <Section labelledBy="topic-title" className="pt-10 md:pt-14">
        <h2 id="topic-title" className="text-h2 font-semibold text-fg">
          How can we help?
        </h2>
        <div role="radiogroup" aria-labelledby="topic-title" className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={t.id === topic}
              onClick={() => setParams({ topic: t.id }, { replace: true, preventScrollReset: true })}
              className={cn(
                'pressable flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-colors',
                t.id === topic ? 'border-primary bg-primary-tint' : 'border-line bg-surface hover:border-line-strong',
              )}
            >
              <t.icon className={cn('size-5', t.id === topic ? 'text-primary' : 'text-muted')} aria-hidden />
              <span>
                <span className="block text-meta font-semibold text-fg">{t.label}</span>
                <span className="block text-micro text-muted">{t.sub}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:items-start">
          <div key={topic} className="animate-rise-in space-y-4">
            {topic === 'owner' && (
              <>
                <div className="flex flex-col gap-4 rounded-2xl border border-primary/30 bg-primary-tint p-5 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <p className="text-h3 font-semibold text-fg">The fastest way to start is the Owner App</p>
                    <p className="text-meta text-muted">Sign up with your phone number, in English or Swahili. Your fee is quoted before you pay.</p>
                  </div>
                  <ButtonLink to="/owner/sign-up" size="lg">
                    Start with your phone number
                  </ButtonLink>
                </div>
                <p className="pt-2 text-h3 font-semibold text-fg">Or ask for a call back</p>
                <CallbackForm />
              </>
            )}
            {topic === 'investor' && <TalkToSsdForm />}
            {topic === 'network' && <ExpertApplyForm />}
            {(topic === 'press' || topic === 'privacy' || topic === 'staff') && <GeneralForm topic={topic} />}
          </div>

          <aside className="space-y-4" aria-label="Your contact">
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-e1">
              <p className="text-micro font-semibold uppercase tracking-wider text-muted">You'll hear from</p>
              <div className="mt-3 flex items-center gap-3">
                <Avatar id={current.contact} size={52} />
                <div className="min-w-0">
                  <p className="text-h3 font-semibold text-fg">{contact.name}</p>
                  <p className="text-meta text-muted">
                    {contact.role} · {contact.location}
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 border-t border-line pt-4 text-meta">
                {contact.email && (
                  <li className="flex items-center gap-2 text-fg">
                    <Mail className="size-4 text-muted" aria-hidden /> {contact.email}
                  </li>
                )}
                {contact.phone && (
                  <li className="flex items-center gap-2 text-fg">
                    <MessageCircle className="size-4 text-muted" aria-hidden /> WhatsApp {contact.phone}
                  </li>
                )}
              </ul>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-e1">
              <p className="text-micro font-semibold uppercase tracking-wider text-muted">Offices</p>
              <ul className="mt-3 space-y-3 text-meta">
                <li>
                  <span className="block font-semibold text-fg">Nairobi</span>
                  <span className="text-muted">Verification, owner support, expert network</span>
                </li>
                <li>
                  <span className="block font-semibold text-fg">Houston</span>
                  <span className="text-muted">Investor relationships</span>
                </li>
                <li>
                  <span className="block font-semibold text-fg">Washington DC</span>
                  <span className="text-muted">Compliance and privacy</span>
                </li>
              </ul>
            </div>
            <p className="flex items-start gap-2 rounded-xl border border-review-border bg-review-fill p-4 text-meta text-fg">
              <Phone className="mt-0.5 size-4 shrink-0 text-review" aria-hidden />
              SSD never asks for money, sign-in codes or passwords by phone, SMS or WhatsApp. If someone does, don't pay; tell us.
            </p>
          </aside>
        </div>
      </Section>
    </>
  )
}
