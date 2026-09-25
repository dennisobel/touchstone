import { ArrowLeft, BadgeCheck, Eye, Receipt, RefreshCw, ShieldCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { cn } from '@/lib/cn'
import { useDemoState } from '@/lib/demo-states'
import { useCountdown, useDocumentTitle } from '@/lib/hooks'
import { Banner } from '@/ds/components'
import { Logo } from '@/ds/icons'
import { Button, Checkbox, Field, Input } from '@/ds/ui'
import { ContactCard } from './common'
import { useT } from './i18n'

const STATES = [
  { id: 'default', label: 'Welcome' },
  { id: 'phone', label: 'Phone number' },
  { id: 'sending', label: 'Sending code' },
  { id: 'invalid', label: 'Invalid number' },
  { id: 'code', label: 'Enter code' },
  { id: 'expired', label: 'Code expired' },
  { id: 'offline', label: 'Offline (number kept)' },
] as const

type Step = 'welcome' | 'phone' | 'code'

/** OA-01 · Owner sign-up: welcome → phone → code, then the identity check (OA-02). Rendered in the Owner auth layout. */
export default function OA01Welcome() {
  const { t } = useT()
  const navigate = useNavigate()
  const [demo] = useDemoState('OA-01', STATES)
  const [step, setStep] = useState<Step>('welcome')
  const [phone, setPhone] = useState('')
  const [consent, setConsent] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  // Demo states drive the step and conditions.
  useEffect(() => {
    setError(null)
    setSending(false)
    if (demo === 'default') setStep('welcome')
    if (demo === 'phone' || demo === 'sending' || demo === 'invalid' || demo === 'offline') {
      setStep('phone')
      setPhone(demo === 'invalid' ? '71 234' : '712 345 678')
    }
    if (demo === 'sending') setSending(true)
    if (demo === 'invalid') setError(t('phone.invalid'))
    if (demo === 'code' || demo === 'expired') {
      setStep('code')
      setPhone('712 345 678')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo])

  const digits = phone.replace(/\D/g, '')
  const send = () => {
    if (digits.length !== 9) return setError(t('phone.invalid'))
    if (!consent) return setError(t('phone.consent_needed'))
    setError(null)
    setSending(true)
    window.setTimeout(() => {
      setSending(false)
      setStep('code')
    }, 1200)
  }

  const stepIndex = step === 'welcome' ? 1 : step === 'phone' ? 2 : 3

  useDocumentTitle(step === 'welcome' ? t('auth.signup_eyebrow') : step === 'phone' ? t('phone.title') : t('code.title'))

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        {step !== 'welcome' && (
          <button type="button" onClick={() => setStep(step === 'code' ? 'phone' : 'welcome')} className="-ml-2 rounded-full p-2 text-muted hover:bg-sunken hover:text-fg" aria-label={t('common.back')}>
            <ArrowLeft className="size-5" />
          </button>
        )}
        <p className="text-micro font-medium text-muted">{t('common.step_of', { n: stepIndex, total: 3 })}</p>
        <div className="ml-auto flex gap-1" aria-hidden>
          {[1, 2, 3].map((n) => (
            <span key={n} className={cn('h-1.5 w-6 rounded-full', n <= stepIndex ? 'bg-primary' : 'bg-line')} />
          ))}
        </div>
      </div>

      {step === 'welcome' && (
        <div className="space-y-6 animate-rise-in">
          <div className="flex items-center gap-3">
            <Logo size={48} />
            <div>
              <p className="text-h3 font-semibold">Touchstone</p>
              <p className="text-meta text-muted">by SSD</p>
            </div>
          </div>
          <h1 className="text-[26px] leading-[34px] font-semibold tracking-tight text-balance">{t('welcome.promise')}</h1>
          <ul className="space-y-3">
            {[
              { icon: <Receipt />, text: t('welcome.trust1') },
              { icon: <BadgeCheck />, text: t('welcome.trust2') },
              { icon: <Eye />, text: t('welcome.trust3') },
            ].map((x) => (
              <li key={x.text} className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary [&_svg]:size-5">{x.icon}</span>
                <span className="text-body font-medium">{x.text}</span>
              </li>
            ))}
          </ul>
          <ContactCard compact title={null} />
          <div className="space-y-3">
            <Button size="xl" block onClick={() => setStep('phone')}>
              {t('welcome.start')}
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-center text-meta text-muted">
              <ShieldCheck className="size-4" aria-hidden />
              {t('welcome.no_money')}
            </p>
            <p className="text-center text-meta text-muted">
              {t('auth.have_account')}{' '}
              <Link to="/owner/sign-in" className="font-semibold text-primary hover:underline">
                {t('auth.sign_in')}
              </Link>
            </p>
          </div>
        </div>
      )}

      {step === 'phone' && (
        <div className="space-y-5 animate-rise-in">
          <div>
            <h1 className="text-h1 font-semibold">{t('phone.title')}</h1>
            <p className="mt-1 text-body text-muted">{t('phone.hint')}</p>
          </div>
          {demo === 'offline' && (
            <Banner tone="offline" icon={<RefreshCw className="animate-spin" />} title={t('phone.offline')} />
          )}
          <Field label={t('phone.label')} error={error ?? undefined}>
            {(p) => (
              <div className="flex gap-2">
                <span className="inline-flex h-ctl items-center rounded-sm border border-line-strong bg-sunken px-3 font-mono text-body text-fg">+254</span>
                <Input
                  {...p}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="712 345 678"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    setError(null)
                  }}
                  className="font-mono tracking-wide"
                />
              </div>
            )}
          </Field>
          <Checkbox checked={consent} onCheckedChange={setConsent} label={t('phone.sms_consent')} />
          <Button size="xl" block onClick={send} loading={sending} disabled={demo === 'offline'}>
            {t('phone.send')}
          </Button>
        </div>
      )}

      {step === 'code' && (
        <CodeStep
          phone={`+254 ${phone}`}
          expired={demo === 'expired'}
          onWrongNumber={() => setStep('phone')}
          onDone={() => navigate('/owner/verify-id', { viewTransition: true })}
        />
      )}
    </div>
  )
}

export function CodeStep({ phone, expired: initialExpired, onWrongNumber, onDone }: { phone: string; expired: boolean; onWrongNumber: () => void; onDone: () => void }) {
  const { t } = useT()
  const [code, setCode] = useState<string[]>(Array(6).fill(''))
  const [expired, setExpired] = useState(initialExpired)
  const [invalid, setInvalid] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [left, setLeft] = useCountdown(60, !expired)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => setExpired(initialExpired), [initialExpired])

  const setAt = (i: number, v: string) => {
    const chars = v.replace(/\D/g, '').split('')
    if (chars.length > 1) {
      const next = [...code]
      chars.slice(0, 6 - i).forEach((c, k) => (next[i + k] = c))
      setCode(next)
      refs.current[Math.min(5, i + chars.length)]?.focus()
      return
    }
    const next = [...code]
    next[i] = chars[0] ?? ''
    setCode(next)
    setInvalid(false)
    if (chars[0] && i < 5) refs.current[i + 1]?.focus()
  }

  useEffect(() => {
    if (code.every(Boolean) && !expired) {
      setVerifying(true)
      const id = window.setTimeout(() => {
        setVerifying(false)
        if (code.join('') === '000000') setInvalid(true)
        else onDone()
      }, 900)
      return () => window.clearTimeout(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  return (
    <div className="space-y-5 animate-rise-in">
      <div>
        <h1 className="text-h1 font-semibold">{t('code.title')}</h1>
        <p className="mt-1 text-body text-muted">{t('code.sent_to', { phone })}</p>
      </div>
      {expired ? (
        <Banner tone="warning" title={t('code.expired')} />
      ) : (
        <div className="flex justify-between gap-2" role="group" aria-label={t('code.title')}>
          {code.map((c, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el
              }}
              value={c}
              onChange={(e) => setAt(i, e.target.value)}
              onKeyDown={(e) => e.key === 'Backspace' && !c && i > 0 && refs.current[i - 1]?.focus()}
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              maxLength={6}
              aria-label={`Digit ${i + 1}`}
              autoFocus={i === 0}
              className={cn(
                'h-14 w-full min-w-0 rounded-lg border bg-surface text-center font-mono text-[24px] font-semibold outline-none focus-visible:outline-2 focus-visible:outline-primary',
                invalid ? 'border-critical' : 'border-line-strong',
              )}
            />
          ))}
        </div>
      )}
      {invalid && (
        <p role="alert" className="text-meta font-medium text-critical">
          {t('code.invalid')}
        </p>
      )}
      {verifying && <p className="text-meta text-muted">{t('code.verify')}…</p>}
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={onWrongNumber} className="min-h-target text-meta font-medium text-primary">
          {t('code.wrong_number')}
        </button>
        {expired || left === 0 ? (
          <Button
            variant="secondary"
            onClick={() => {
              setExpired(false)
              setCode(Array(6).fill(''))
              setLeft(60)
            }}
          >
            {t('code.resend')}
          </Button>
        ) : (
          <span className="text-meta tabular-nums text-muted">{t('code.resend_in', { s: left })}</span>
        )}
      </div>
    </div>
  )
}
