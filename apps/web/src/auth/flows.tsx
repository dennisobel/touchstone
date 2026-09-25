import { ArrowLeft, ArrowRight, Building2, FingerprintPattern, KeyRound, Loader2, Lock, Mail, ShieldAlert, ShieldCheck, TicketCheck, TimerReset } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import { useDemoState } from '@/lib/demo-states'
import { useDocumentTitle } from '@/lib/hooks'
import { Banner } from '@/ds/components'
import { Button, ButtonLink, Field, Input } from '@/ds/ui'
import { AuthHeading, OrDivider } from './AuthLayout'

const SIGNIN_STATES = [
  { id: 'default', label: 'Email' },
  { id: 'password', label: 'Password step' },
  { id: 'wrong_password', label: 'Wrong password' },
  { id: 'mfa', label: 'Authenticator step' },
  { id: 'locked', label: 'Locked after attempts' },
  { id: 'session', label: 'Session expired' },
  { id: 'not_found', label: 'No account for this email' },
] as const

type Step = 'email' | 'password' | 'passkey' | 'mfa' | 'sso'

/**
 * Sign-in for the invitation-only apps: email → passkey (preferred) or password → authenticator code.
 * Multi-factor sign-in is mandatory for staff, investors and experts (M01-3).
 */
export function CredentialSignIn({
  screenId,
  home,
  eyebrow,
  title,
  sub,
  emailDefault,
  sso,
  notFound,
  signUpHref,
  signUpLabel,
  idleNote,
}: {
  screenId: string
  home: string
  eyebrow: string
  title: string
  sub: ReactNode
  emailDefault: string
  sso?: { label: string; primary?: boolean; hint?: string }
  notFound: ReactNode
  signUpHref: string
  signUpLabel: ReactNode
  idleNote?: string
}) {
  useDocumentTitle(`${eyebrow} · Sign in`)
  const navigate = useNavigate()
  const [state] = useDemoState(screenId, SIGNIN_STATES)
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState(emailDefault)
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [wrong, setWrong] = useState(false)

  useEffect(() => {
    setWrong(state === 'wrong_password')
    setStep(state === 'password' || state === 'wrong_password' ? 'password' : state === 'mfa' ? 'mfa' : 'email')
  }, [state])

  const locked = state === 'locked'
  const unknown = state === 'not_found'
  const wait = (fn: () => void, ms = 900) => {
    setBusy(true)
    window.setTimeout(() => {
      setBusy(false)
      fn()
    }, ms)
  }
  const done = () => navigate(home, { viewTransition: true })

  const back =
    step !== 'email' ? (
      <button type="button" onClick={() => setStep('email')} className="-ml-2 mb-3 inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-micro font-medium text-muted hover:bg-sunken hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden /> {email}
      </button>
    ) : null

  return (
    <div className="animate-rise-in">
      {back}
      <AuthHeading eyebrow={eyebrow} title={step === 'mfa' ? 'Check your authenticator' : step === 'password' ? 'Enter your password' : title} sub={step === 'mfa' ? 'Enter the 6-digit code from your authenticator app.' : step === 'password' ? undefined : sub} />

      {state === 'session' && step === 'email' && (
        <Banner tone="info" icon={<TimerReset />} className="mb-4" title="You were signed out after 30 minutes idle">
          Your work was saved. Sign in to continue where you left off.
        </Banner>
      )}
      {locked && (
        <Banner tone="critical" icon={<Lock />} className="mb-4" title="Sign-in is paused for 15 minutes">
          There were several unsuccessful attempts on this account. If this wasn't you, contact SSD; nothing was changed.
        </Banner>
      )}
      {unknown && step === 'email' && (
        <Banner tone="warning" icon={<ShieldAlert />} className="mb-4" title="We couldn't find an account for this email">
          {notFound}
        </Banner>
      )}

      {step === 'email' && (
        <div className="space-y-4">
          {sso?.primary && (
            <>
              <Button size="lg" block icon={<Building2 />} loading={busy} disabled={locked} onClick={() => wait(() => setStep('mfa'), 1300)}>
                {sso.label}
              </Button>
              {sso.hint && <p className="-mt-2 text-center text-micro text-muted">{sso.hint}</p>}
              <OrDivider />
            </>
          )}
          <Field label="Work email">
            {(p) => <Input {...p} type="email" autoComplete="username webauthn" value={email} onChange={(e) => setEmail(e.target.value)} leading={<Mail />} disabled={locked} />}
          </Field>
          <Button size="lg" block variant={sso?.primary ? 'secondary' : 'primary'} disabled={!email || locked} loading={busy && step === 'email' && !sso?.primary} iconRight={<ArrowRight />} onClick={() => wait(() => setStep('passkey'), 600)}>
            Continue
          </Button>
          {!sso?.primary && (
            <>
              <OrDivider />
              <Button size="lg" block variant="secondary" icon={<FingerprintPattern />} disabled={locked} onClick={() => wait(done, 1100)}>
                Sign in with a passkey
              </Button>
              {sso && (
                <Button size="lg" block variant="ghost" icon={<Building2 />} disabled={locked} onClick={() => wait(() => setStep('mfa'), 1300)}>
                  {sso.label}
                </Button>
              )}
            </>
          )}
        </div>
      )}

      {step === 'passkey' && (
        <div className="space-y-4 text-center">
          <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary-tint text-primary">
            <FingerprintPattern className="size-9" aria-hidden />
          </span>
          <p className="text-body">Use your device's fingerprint, face or PIN to sign in as {email}.</p>
          <Button size="lg" block loading={busy} icon={<FingerprintPattern />} onClick={() => wait(done, 1100)}>
            Use my passkey
          </Button>
          <Button variant="ghost" block onClick={() => setStep('password')}>
            Use a password instead
          </Button>
        </div>
      )}

      {step === 'password' && (
        <div className="space-y-4">
          <Field label="Password" error={wrong ? "That password doesn't match. Check it and try again." : undefined}>
            {(p) => (
              <Input
                {...p}
                type="password"
                autoComplete="current-password"
                autoFocus
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setWrong(false)
                }}
                leading={<KeyRound />}
              />
            )}
          </Field>
          <Button size="lg" block loading={busy} disabled={!password && !wrong} onClick={() => wait(() => setStep('mfa'))}>
            Continue
          </Button>
          <button type="button" className="w-full text-center text-meta font-medium text-primary hover:underline" onClick={() => setStep('email')}>
            Forgot your password?
          </button>
        </div>
      )}

      {step === 'mfa' && (
        <div className="space-y-4">
          <Field label="6-digit code">
            {(p) => (
              <Input
                {...p}
                value={code}
                autoFocus
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                className="font-mono text-[20px] tracking-[0.4em]"
                leading={<ShieldCheck />}
              />
            )}
          </Field>
          <Button size="lg" block loading={busy} disabled={code.length !== 6} onClick={() => wait(done)}>
            Verify and sign in
          </Button>
          <p className="text-center text-micro text-muted">Lost your authenticator? Contact SSD; we verify your identity before resetting it.</p>
        </div>
      )}

      {step === 'email' && (
        <p className="mt-6 text-center text-meta text-muted">
          {signUpLabel}{' '}
          <Link to={signUpHref} className="font-semibold text-primary hover:underline">
            Learn how to get access
          </Link>
        </p>
      )}
      <p className="mt-6 flex items-start justify-center gap-1.5 text-center text-micro text-muted">
        <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {idleNote ?? 'SSD never asks for your password or codes by email or phone.'}
      </p>
      {busy && step === 'email' && sso?.primary && (
        <p className="mt-3 flex items-center justify-center gap-2 text-micro text-muted" role="status">
          <Loader2 className="size-3.5 animate-spin" aria-hidden /> Redirecting to single sign-on…
        </p>
      )}
    </div>
  )
}

/**
 * Sign-up for invitation-only apps: there is no public sign-up route (M01-2).
 * People with an invitation continue with their code; everyone else is sent to the right request channel.
 */
export function InvitationGate({
  eyebrow,
  title,
  sub,
  codePlaceholder,
  continueTo,
  request,
  signInHref,
  footnote,
}: {
  eyebrow: string
  title: string
  sub: ReactNode
  codePlaceholder: string
  continueTo: string
  request: { title: string; body: ReactNode; cta: string; to: string }
  signInHref: string
  footnote?: ReactNode
}) {
  useDocumentTitle(`${eyebrow} · Get access`)
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  return (
    <div className="animate-rise-in">
      <AuthHeading eyebrow={eyebrow} title={title} sub={sub} />
      <section className="rounded-xl border border-line bg-surface p-4 shadow-e1">
        <p className="flex items-center gap-2 text-h3 font-semibold">
          <TicketCheck className="size-5 text-primary" aria-hidden /> I have an invitation
        </p>
        <p className="mt-1 text-meta text-muted">Open the link in your invitation email, or enter the code it contains.</p>
        <div className="mt-3 flex gap-2">
          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              setError(null)
            }}
            placeholder={codePlaceholder}
            aria-label="Invitation code"
            invalid={!!error}
            className="font-mono uppercase tracking-wide"
          />
          <Button
            onClick={() => {
              if (code.replace(/[^A-Z0-9]/g, '').length < 6) return setError('Enter the full code from your invitation email.')
              navigate(continueTo, { viewTransition: true })
            }}
          >
            Continue
          </Button>
        </div>
        {error && (
          <p role="alert" className="mt-1.5 text-meta font-medium text-critical">
            {error}
          </p>
        )}
        <p className="mt-2 text-micro text-muted">Invitations work once and expire after 7 days.</p>
      </section>
      <section className="mt-3 rounded-xl border border-line bg-surface p-4 shadow-e1">
        <p className="text-h3 font-semibold">{request.title}</p>
        <div className="mt-1 text-meta text-muted">{request.body}</div>
        <ButtonLink to={request.to} variant="secondary" className="mt-3" iconRight={<ArrowRight />}>
          {request.cta}
        </ButtonLink>
      </section>
      <p className="mt-6 text-center text-meta text-muted">
        Already have an account?{' '}
        <Link to={signInHref} className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
      {footnote && <p className="mt-4 text-center text-micro text-muted">{footnote}</p>}
    </div>
  )
}
