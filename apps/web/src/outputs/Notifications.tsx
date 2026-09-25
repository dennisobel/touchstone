import { ArrowLeft, BadgeCheck, Mail, MessageCircle, MessageSquare, ShieldCheck } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from '@/lib/cn'
import { useDocumentTitle } from '@/lib/hooks'
import { Logo } from '@/ds/icons'
import { ThemeSwitch } from '@/ds/shell'
import { Chip, Segmented } from '@/ds/ui'

type Lang = 'en' | 'sw'
interface Template {
  id: string
  name: string
  audience: 'owner' | 'investor' | 'expert'
  channels: ('sms' | 'whatsapp' | 'email')[]
  contact: string
  sms?: Record<Lang, string>
  email?: { subject: string; body: string[]; button: string }
  compliance?: boolean
}

const TEMPLATES: Template[] = [
  {
    id: 'OWN-01 v3',
    name: 'Sign-up code',
    audience: 'owner',
    channels: ['sms'],
    contact: 'SSD',
    sms: {
      en: 'Touchstone: your code is 482 915. It expires in 10 minutes. SSD will never ask you for this code.',
      sw: 'Touchstone: msimbo wako ni 482 915. Unaisha baada ya dakika 10. SSD haitakuuliza msimbo huu kamwe.',
    },
  },
  {
    id: 'OWN-05 v2',
    name: 'Questions waiting',
    audience: 'owner',
    channels: ['sms', 'whatsapp'],
    contact: 'Kevin Omondi',
    sms: {
      en: 'Touchstone: Wanjiru Kamau has 2 questions about your licence, due 27 Sep. Open the app or reply here. Kevin, SSD',
      sw: 'Touchstone: Wanjiru Kamau ana maswali 2 kuhusu leseni yako, mwisho 27 Sep. Fungua programu au jibu hapa. Kevin, SSD',
    },
  },
  {
    id: 'OWN-09 v2',
    name: 'Findings ready',
    audience: 'owner',
    channels: ['sms', 'whatsapp'],
    contact: 'Kevin Omondi',
    sms: {
      en: 'Touchstone: your findings are ready. You can reply until 23 Oct, before anything is released. Kevin, SSD',
      sw: 'Touchstone: matokeo yako yako tayari. Unaweza kujibu hadi 23 Okt, kabla ya chochote kutolewa. Kevin, SSD',
    },
  },
  {
    id: 'OWN-11 v1',
    name: 'Site visit',
    audience: 'owner',
    channels: ['sms', 'whatsapp'],
    contact: 'Kevin Omondi',
    sms: {
      en: 'Touchstone: Brian Kiptoo visits your site on 2 Oct. Please have someone show him the beacons. SSD pays him, not you. Kevin, SSD',
      sw: 'Touchstone: Brian Kiptoo atatembelea eneo lako 2 Okt. Tafadhali mtu awepo kumwonyesha alama. SSD inamlipa, si wewe. Kevin, SSD',
    },
  },
  {
    id: 'OWN-14 v1',
    name: 'Payment received',
    audience: 'owner',
    channels: ['sms'],
    contact: 'Kevin Omondi',
    sms: {
      en: 'Touchstone: payment of KES 145,000 received, ref SKD7H2K9QX. Kevin will confirm your plan within 2 working days.',
      sw: 'Touchstone: malipo ya KES 145,000 yamepokelewa, kumb SKD7H2K9QX. Kevin atathibitisha mpango wako ndani ya siku 2 za kazi.',
    },
  },
  {
    id: 'INV-04 v2',
    name: 'Something is waiting',
    audience: 'investor',
    channels: ['email'],
    contact: 'James Whitfield',
    compliance: true,
    email: {
      subject: 'Something is waiting for you in the portal',
      body: ['Hello Marcus,', 'There is something new for you in the Touchstone Investor Portal. Sign in to see it.', 'For your security, we never put details of opportunities in email.', 'James Whitfield, SSD'],
      button: 'Open the portal',
    },
  },
  {
    id: 'INV-07 v1',
    name: 'Daily digest',
    audience: 'investor',
    channels: ['email'],
    contact: 'James Whitfield',
    compliance: true,
    email: {
      subject: 'Your Touchstone digest',
      body: ['Hello Marcus,', 'Since yesterday: 1 new item for you, 2 answers to your questions, 1 change to an asset you follow.', 'Sign in to see them. Details stay in the portal.', 'James Whitfield, SSD'],
      button: 'Open the portal',
    },
  },
  {
    id: 'EXP-02 v2',
    name: 'Assignment offer',
    audience: 'expert',
    channels: ['email', 'sms'],
    contact: 'Kevin Omondi',
    sms: { en: 'Touchstone: new assignment offer, resource review, due 20 Oct. Review the scope and declare conflicts before accepting. Kevin, SSD', sw: '' },
    email: {
      subject: 'New assignment offer: resource review, due 20 Oct',
      body: ['Hello Nomvula,', 'You have a new offer on the Expert Desk: a resource review for a gold asset in Kenya, USD 3,200, due 20 Oct.', 'Please review the scope and declare any conflicts before you accept.', 'Kevin Omondi, SSD'],
      button: 'Review the offer',
    },
  },
  {
    id: 'EXP-05 v1',
    name: 'Access expiring',
    audience: 'expert',
    channels: ['email'],
    contact: 'Kevin Omondi',
    email: {
      subject: 'Your data access ends on 27 Sep',
      body: ['Hello Nomvula,', 'Your access to the assignment files ends on 27 Sep, 7 days after the deadline.', 'If you need more time, reply to this email and I will ask for an extension.', 'Kevin Omondi, SSD'],
      button: 'Open the Expert Desk',
    },
  },
  {
    id: 'FLD-08 v1',
    name: 'Payout sent',
    audience: 'expert',
    channels: ['sms'],
    contact: 'SSD finance',
    sms: { en: 'Touchstone: KES 54,000 sent to your M-Pesa for the 2 Sep site visit, ref QK81TZ3M. Thank you. SSD finance', sw: 'Touchstone: KES 54,000 zimetumwa kwa M-Pesa yako kwa ziara ya 2 Sep, kumb QK81TZ3M. Asante. SSD fedha' },
  },
]

function Phone({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="w-full max-w-[260px] rounded-[28px] border-[6px] border-[#1a2129] bg-[#e9edf1] p-3 shadow-e2" aria-label={label}>
      <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-[#b4bec8]" />
      {children}
    </div>
  )
}

function Sms({ text, whatsapp }: { text: string; whatsapp?: boolean }) {
  const over = text.length > 160
  return (
    <div>
      <div className={cn('rounded-2xl rounded-bl-md p-3 text-[13px] leading-5 text-[#0f1419] shadow-e1', whatsapp ? 'bg-[#e7f7e1]' : 'bg-white')}>{text}</div>
      <p className={cn('mt-1.5 text-[11px]', over ? 'text-critical' : 'text-[#52606f]')}>
        {text.length} / 160 characters{over && ' · sends as 2 SMS'}
      </p>
    </div>
  )
}

function Email({ t }: { t: NonNullable<Template['email']> }) {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-lg border border-line bg-white text-[#0f1419] shadow-e2">
      <div className="border-b border-[#e3e8ec] px-4 py-2 text-[12px] text-[#52606f]">
        <p>
          <span className="font-medium text-[#0f1419]">From:</span> Touchstone by SSD &lt;notices@touchstone.example&gt;
        </p>
        <p>
          <span className="font-medium text-[#0f1419]">Subject:</span> {t.subject}
        </p>
      </div>
      <div className="px-6 py-5">
        <div className="mb-4 flex items-center gap-2">
          <Logo size={22} />
          <span className="text-[13px] font-semibold">Touchstone</span>
        </div>
        {t.body.map((p, i) => (
          <p key={i} className="mb-3 text-[14px] leading-6">
            {p}
          </p>
        ))}
        <span className="mt-1 inline-block rounded-lg bg-[#1f4e8c] px-4 py-2.5 text-[14px] font-medium text-white">{t.button}</span>
      </div>
      <div className="border-t border-[#e3e8ec] bg-[#f5f7f9] px-6 py-3 text-[11px] leading-4 text-[#52606f]">
        SSD · Nairobi and Houston · Reply to reach a person. Manage preferences or quiet hours in your account. You get this because you have a Touchstone account.
      </div>
    </div>
  )
}

/** X-02 · Notification templates */
export default function Notifications() {
  useDocumentTitle('Notification templates')
  const [aud, setAud] = useState<Template['audience']>('owner')
  const [lang, setLang] = useState<Lang>('en')
  const list = TEMPLATES.filter((t) => t.audience === aud)
  return (
    <div className="min-h-dvh bg-canvas pb-[calc(var(--safe-bottom)+32px)]">
      <header className="glass sticky top-0 z-20 border-b border-line/70 pt-safe">
        <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center gap-3 px-4 py-2 md:px-8">
          <Link to="/apps" className="rounded-full p-2 hover:bg-sunken" aria-label="All apps">
            <ArrowLeft className="size-5" />
          </Link>
          <Logo size={28} />
          <div className="min-w-0 flex-1">
            <h1 className="text-meta font-semibold leading-tight">Notification templates</h1>
            <p className="text-[11px] leading-tight text-muted">Email, SMS and WhatsApp · versioned, multilingual</p>
          </div>
          <ThemeSwitch />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8">
        <div className="mb-5 rounded-lg border border-line bg-surface p-4 text-meta">
          <p className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="size-4 text-primary" aria-hidden /> Rules for every template
          </p>
          <ul className="mt-1.5 grid gap-1 text-muted md:grid-cols-3">
            <li>Investor messages never contain deal information, asset names or figures.</li>
            <li>Every message names a human contact.</li>
            <li>No urgency language. Owner SMS stays within 160 characters where possible.</li>
          </ul>
        </div>
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Segmented
            ariaLabel="Audience"
            value={aud}
            onChange={setAud}
            options={[
              { value: 'owner', label: 'Owners' },
              { value: 'investor', label: 'Investors' },
              { value: 'expert', label: 'Experts and field' },
            ]}
          />
          {aud === 'owner' && (
            <Segmented
              ariaLabel="Language"
              value={lang}
              onChange={setLang}
              size="sm"
              options={[
                { value: 'en', label: 'English' },
                { value: 'sw', label: 'Kiswahili' },
              ]}
            />
          )}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {list.map((t) => (
            <section key={t.id} className="rounded-xl border border-line bg-surface p-4 shadow-e1">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <h2 className="text-h3 font-semibold">{t.name}</h2>
                <span className="font-mono text-micro text-muted">{t.id}</span>
                <span className="ml-auto flex gap-1">
                  {t.channels.map((c) => (
                    <Chip key={c} size="sm" tone="outline" icon={c === 'email' ? <Mail /> : c === 'whatsapp' ? <MessageCircle /> : <MessageSquare />}>
                      {c === 'sms' ? 'SMS' : c === 'whatsapp' ? 'WhatsApp' : 'Email'}
                    </Chip>
                  ))}
                </span>
              </div>
              <div className="flex flex-wrap items-start gap-4">
                {t.sms && (t.channels.includes('sms') || t.channels.includes('whatsapp')) && (
                  <Phone label={`${t.name} on a phone`}>
                    <Sms text={t.sms[lang] || t.sms.en} whatsapp={!t.channels.includes('sms')} />
                    {t.channels.includes('whatsapp') && t.channels.includes('sms') && (
                      <div className="mt-3">
                        <p className="mb-1 text-[11px] font-medium text-[#52606f]">WhatsApp (falls back to SMS)</p>
                        <Sms text={t.sms[lang] || t.sms.en} whatsapp />
                      </div>
                    )}
                  </Phone>
                )}
                {t.email && <Email t={t.email} />}
              </div>
              <p className="mt-3 flex flex-wrap items-center gap-2 text-micro text-muted">
                Named contact: <span className="font-medium text-fg">{t.contact}</span>
                {t.compliance && (
                  <Chip size="sm" tone="verified" icon={<BadgeCheck />}>
                    Approved by compliance
                  </Chip>
                )}
              </p>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
