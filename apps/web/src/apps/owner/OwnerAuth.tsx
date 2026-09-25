import { CircleCheck, LifeBuoy, RefreshCw, Smartphone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router'
import { useDemoState } from '@/lib/demo-states'
import { useDocumentTitle } from '@/lib/hooks'
import { AuthHeading, AuthLayout } from '@/auth/AuthLayout'
import { Banner } from '@/ds/components'
import { Button, Field, Input } from '@/ds/ui'
import { LangToggle } from './common'
import { useT } from './i18n'
import { CodeStep } from './OA01Welcome'

/** Owner App sign-in and sign-up share this layout (language toggle always visible). */
export default function OwnerAuthLayout() {
  return (
    <AuthLayout app="owner" headerExtra={<LangToggle />}>
      <Outlet />
    </AuthLayout>
  )
}

const STATES = [
  { id: 'default', label: 'Phone number' },
  { id: 'invalid', label: 'Invalid number' },
  { id: 'not_found', label: 'No account for this number' },
  { id: 'code', label: 'Enter code' },
  { id: 'expired', label: 'Code expired' },
  { id: 'offline', label: 'Offline' },
] as const

/** Owner App · Sign in (phone number → SMS code). */
export function OwnerSignIn() {
  const { t, lang } = useT()
  useDocumentTitle(lang === 'sw' ? 'Ingia' : 'Sign in')
  const navigate = useNavigate()
  const [state] = useDemoState('OA-SIGNIN', STATES)
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [phone, setPhone] = useState('712 000 227')
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    setError(state === 'invalid' ? t('phone.invalid') : null)
    setNotFound(state === 'not_found')
    setStep(state === 'code' || state === 'expired' ? 'code' : 'phone')
    if (state === 'invalid') setPhone('71 20')
    if (state === 'not_found') setPhone('799 555 104')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  const send = () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 9) return setError(t('phone.invalid'))
    setError(null)
    setSending(true)
    window.setTimeout(() => {
      setSending(false)
      if (digits === '799555104') setNotFound(true)
      else setStep('code')
    }, 900)
  }

  return (
    <div className="animate-rise-in">
      {step === 'phone' ? (
        <>
          <AuthHeading eyebrow={t('auth.signin_eyebrow')} title={t('auth.signin_title')} sub={t('auth.signin_sub')} />
          {state === 'offline' && <Banner tone="offline" icon={<RefreshCw className="animate-spin" />} title={t('phone.offline')} className="mb-4" />}
          {notFound && (
            <Banner tone="warning" className="mb-4" title={t('auth.not_found', { phone: `+254 ${phone}` })} action={<Link to="/owner/sign-up" className="text-meta font-semibold text-primary">{t('auth.create')}</Link>} />
          )}
          <div className="space-y-4">
            <Field label={t('phone.label')} error={error ?? undefined}>
              {(p) => (
                <div className="flex gap-2">
                  <span className="inline-flex h-ctl items-center rounded-sm border border-line-strong bg-sunken px-3 font-mono">+254</span>
                  <Input
                    {...p}
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value)
                      setError(null)
                      setNotFound(false)
                    }}
                    className="font-mono tracking-wide"
                    leading={<Smartphone />}
                  />
                </div>
              )}
            </Field>
            <Button size="xl" block onClick={send} loading={sending} disabled={state === 'offline'}>
              {t('phone.send')}
            </Button>
          </div>
          <p className="mt-6 text-center text-meta text-muted">
            {t('auth.no_account')}{' '}
            <Link to="/owner/sign-up" className="font-semibold text-primary hover:underline">
              {t('auth.create')}
            </Link>
          </p>
          <div className="mt-8 space-y-3 rounded-lg border border-line bg-surface p-4 text-meta text-muted">
            <p className="flex gap-2">
              <LifeBuoy className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              {t('auth.lost_phone')}
            </p>
            <p className="flex gap-2">
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              {t('auth.for_someone')}
            </p>
          </div>
        </>
      ) : (
        <CodeStep phone={`+254 ${phone}`} expired={state === 'expired'} onWrongNumber={() => setStep('phone')} onDone={() => navigate('/owner', { viewTransition: true })} />
      )}
    </div>
  )
}
