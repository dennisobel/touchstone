import { Check, CircleCheck, CircleX, Clock, FingerprintPattern, KeyRound, Lock, Mail, QrCode, ShieldCheck, TimerOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router'
import { cn } from '@/lib/cn'
import { useDemoState } from '@/lib/demo-states'
import { useNoIndex } from '@/lib/hooks'
import { Banner, EmptyState } from '@/ds/components'
import { Logo } from '@/ds/icons'
import { ShellProvider, StatesControl } from '@/ds/shell'
import { Avatar, Button, Checkbox, Field, Input, Progress, RadioGroup, Select, Textarea, toast } from '@/ds/ui'
import { useDocumentTitle } from '@/lib/hooks'

/** Onboarding layout (qualification after the account is created): invitation-only, never indexed, no navigation. */
export default function InvestorAuthLayout() {
  useNoIndex()
  return (
    <ShellProvider app="investor" hasTabBar={false}>
      <div data-density="comfortable" className="min-h-dvh bg-canvas text-body">
        <header className="border-b border-line/70 bg-surface pt-safe">
          <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4">
            <Logo size={30} />
            <div className="min-w-0 flex-1">
              <p className="text-meta font-semibold leading-tight">Touchstone Investor Portal</p>
              <p className="text-[11px] leading-tight text-muted">Private · by invitation from SSD</p>
            </div>
            <Lock className="size-4 text-muted" aria-label="Private" />
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-6 pb-[calc(var(--safe-bottom)+32px)] md:py-10">
          <Outlet />
        </main>
        <StatesControl />
      </div>
    </ShellProvider>
  )
}

const INVITE_STATES = [
  { id: 'default', label: 'Invitation' },
  { id: 'secure', label: 'Secure account' },
  { id: 'mfa', label: 'Authenticator set-up' },
  { id: 'expired', label: 'Invitation expired' },
] as const

/** IP-01 · Invitation and registration */
export function IP01Invite() {
  useDocumentTitle('Invitation')
  const navigate = useNavigate()
  const [state] = useDemoState('IP-01', INVITE_STATES)
  const [step, setStep] = useState<'invite' | 'secure' | 'mfa'>('invite')
  const [code, setCode] = useState('')
  const [usePassword, setUsePassword] = useState(false)
  useEffect(() => setStep(state === 'secure' ? 'secure' : state === 'mfa' ? 'mfa' : 'invite'), [state])

  if (state === 'expired') {
    return (
      <EmptyState
        icon={<TimerOff />}
        title="This invitation has expired"
        body="Invitation links work once and expire after 7 days. Ask for a new one; James Whitfield will send it."
        contactId="james"
        action={<Button onClick={() => toast.success('Request sent to James Whitfield')}>Request a new invitation</Button>}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Progress value={step === 'invite' ? 33 : step === 'secure' ? 66 : 95} label="Account set-up" />
      {step === 'invite' && (
        <div className="space-y-6 animate-rise-in">
          <div className="flex items-center gap-3">
            <Avatar id="james" size={52} />
            <div>
              <p className="text-micro text-muted">Invitation from SSD</p>
              <h1 className="text-h1 font-semibold">James Whitfield invited you after your call on 28 Aug 2026.</h1>
            </div>
          </div>
          <div className="grid gap-3">
            <Card title="What SSD does" tone="verified" items={['Verifies facts about East African mining assets and publishes evidence quality', 'Introduces qualified investors, with a documented relationship and a log', 'Hosts NDAs, data rooms and moderated questions']} />
            <Card title="What SSD does not do" tone="neutral" items={['Give investment advice, rate or value assets', 'Negotiate terms for either party', 'Hold or handle investor money or securities']} />
          </div>
          <Field label="Work email" hint="From your invitation; you can't change it here">
            {(p) => <Input {...p} value="marcus.bell@cedarpeak.example" readOnly leading={<Mail />} />}
          </Field>
          <Button size="lg" block onClick={() => setStep('secure')}>
            Accept invitation
          </Button>
          <p className="text-center text-micro text-muted">Single-use link · expires 30 Sep 2026 · never shared or indexed</p>
          <p className="text-center text-meta text-muted">
            Already have an account?{' '}
            <Link to="/investor/sign-in" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      )}
      {step === 'secure' && (
        <div className="space-y-5 animate-rise-in">
          <h1 className="text-h1 font-semibold">Secure your account</h1>
          <p className="text-body text-muted">A passkey signs you in with your device's fingerprint, face or PIN. It can't be phished.</p>
          {!usePassword ? (
            <>
              <Button size="lg" block icon={<FingerprintPattern />} onClick={() => (toast.success('Passkey created on this device'), setStep('mfa'))}>
                Create a passkey
              </Button>
              <Button variant="ghost" block onClick={() => setUsePassword(true)}>
                Use a password instead
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <Field label="Password" hint="At least 14 characters">
                {(p) => <Input {...p} type="password" autoComplete="new-password" leading={<KeyRound />} />}
              </Field>
              <Button size="lg" block onClick={() => setStep('mfa')}>
                Continue
              </Button>
            </div>
          )}
        </div>
      )}
      {step === 'mfa' && (
        <div className="space-y-5 animate-rise-in">
          <h1 className="text-h1 font-semibold">Set up your authenticator</h1>
          <p className="text-body text-muted">Multi-factor sign-in is required for every investor account.</p>
          <div className="flex flex-col items-center gap-4 rounded-lg border border-line bg-surface p-6 md:flex-row">
            <div className="flex size-36 items-center justify-center rounded-lg bg-white p-3 shadow-e1">
              <QrCode className="size-full text-[#0f1419]" aria-label="QR code for your authenticator app" />
            </div>
            <div className="space-y-2 text-meta">
              <p>Scan with your authenticator app, then enter the 6-digit code.</p>
              <p className="font-mono text-micro text-muted">Setup key: TSTN-7K2Q-94XM-PL3R</p>
            </div>
          </div>
          <Field label="6-digit code">{(p) => <Input {...p} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" className="font-mono tracking-[0.3em]" placeholder="000000" />}</Field>
          <Button size="lg" block disabled={code.length !== 6} icon={<ShieldCheck />} onClick={() => navigate('/investor/qualification', { viewTransition: true })}>
            Finish and start qualification
          </Button>
        </div>
      )}
    </div>
  )
}

function Card({ title, items, tone }: { title: string; items: string[]; tone: 'verified' | 'neutral' }) {
  return (
    <section className={cn('rounded-lg border p-4', tone === 'verified' ? 'border-verified-border bg-verified-fill/60' : 'border-line bg-surface')}>
      <h2 className="text-h3 font-semibold">{title}</h2>
      <ul className="mt-2 space-y-1.5 text-meta">
        {items.map((i) => (
          <li key={i} className="flex gap-2">
            {tone === 'verified' ? <Check className="mt-0.5 size-4 shrink-0 text-verified" aria-hidden /> : <CircleX className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />}
            {i}
          </li>
        ))}
      </ul>
    </section>
  )
}

const QUAL_STATES = [
  { id: 'default', label: 'Questionnaire' },
  { id: 'status', label: 'In qualification (status)' },
  { id: 'hold', label: 'On hold' },
] as const

const STEPS = ['Organisation', 'Type and experience', 'Accreditation', 'Mandate']

/** IP-02 · Qualification */
export function IP02Qualification() {
  useDocumentTitle('Qualification')
  const navigate = useNavigate()
  const [state] = useDemoState('IP-02', QUAL_STATES)
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [reps, setReps] = useState({ entity: false, min: false, financing: false, true: false })
  const [type, setType] = useState('fund')
  useEffect(() => setSubmitted(state !== 'default'), [state])

  if (submitted) {
    const hold = state === 'hold'
    return (
      <div className="space-y-5 animate-rise-in">
        <div className="flex flex-col items-center py-6 text-center">
          <span className={cn('flex size-16 items-center justify-center rounded-full', hold ? 'bg-sunken text-muted' : 'bg-review-fill text-review')}>
            <Clock className="size-8" aria-hidden />
          </span>
          <h1 className="mt-4 text-h1 font-semibold">{hold ? 'Your qualification is on hold' : 'In qualification'}</h1>
          <p className="mt-2 max-w-md text-body text-muted">
            {hold ? 'We need a little more information to finish. Your contact will be in touch this week.' : 'This usually takes 3 working days. You will get an email that something is waiting in the portal.'}
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-line bg-surface p-4">
          <Avatar id="james" size={44} />
          <div className="min-w-0 flex-1">
            <p className="text-micro text-muted">Your contact</p>
            <p className="text-body font-semibold">James Whitfield</p>
            <p className="text-meta text-muted">Managing partner, SSD · Houston</p>
          </div>
          <Button variant="secondary" onClick={() => toast('Message sent to James Whitfield')}>
            Message
          </Button>
        </div>
        <Link to="/investor/mandate" viewTransition className="block text-center text-meta font-medium text-primary hover:underline">
          Review your investment mandate
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-micro font-medium text-muted">
          Step {step + 1} of 4 · {STEPS[step]}
        </p>
        <Progress value={((step + 1) / 4) * 100} className="mt-2" label="Qualification progress" />
      </div>
      <h1 className="text-h1 font-semibold">{STEPS[step]}</h1>
      {step === 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Legal name">{(p) => <Input {...p} defaultValue="Cedar Peak Minerals Fund II, L.P." />}</Field>
          <Field label="Jurisdiction of formation">{(p) => <Input {...p} defaultValue="Delaware, United States" />}</Field>
          <Field label="Registered address" className="md:col-span-2">
            {(p) => <Input {...p} defaultValue="1700 Lincoln Street, Denver, CO 80203" />}
          </Field>
          <Field label="Signatory">{(p) => <Input {...p} defaultValue="Marcus Bell, Vice president" />}</Field>
          <Field label="Beneficial owners over 25%">{(p) => <Input {...p} defaultValue="Cedar Peak GP LLC (general partner)" />}</Field>
        </div>
      )}
      {step === 1 && (
        <div className="space-y-4">
          <RadioGroup
            name="type"
            value={type}
            onValueChange={setType}
            variant="cards"
            options={[
              { value: 'fund', label: 'Private-equity or venture fund' },
              { value: 'strategic', label: 'Strategic corporate buyer' },
              { value: 'family', label: 'Family office' },
              { value: 'other', label: 'Other institution' },
            ]}
          />
          <Field label="Relevant experience">{(p) => <Textarea {...p} defaultValue="11 private mining investments since 2017, including 3 in Africa (Tanzania, Zambia)." />}</Field>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-2">
          <p className="text-meta text-muted">Tick every statement that is true. Issuers relying on Rule 506(c) may use these representations; SSD records them and files nothing on anyone's behalf.</p>
          <Checkbox checked={reps.entity} onCheckedChange={(v) => setReps((r) => ({ ...r, entity: v }))} label="We are an accredited investor: an entity with total assets over USD 5 million, not formed to make this investment" />
          <Checkbox checked={reps.min} onCheckedChange={(v) => setReps((r) => ({ ...r, min: v }))} label="Any commitment we make will be at least USD 1 million" description="Minimum-investment representation (SEC staff guidance, March 2025)" />
          <Checkbox checked={reps.financing} onCheckedChange={(v) => setReps((r) => ({ ...r, financing: v }))} label="No third party is financing the commitment" />
          <Checkbox checked={reps.true} onCheckedChange={(v) => setReps((r) => ({ ...r, true: v }))} label={<span className="font-medium">These statements are true and complete</span>} description="Answers lock when you submit" />
        </div>
      )}
      {step === 3 && (
        <div className="space-y-3">
          <Banner tone="info">Your mandate tells SSD which verified opportunities to show you. It is never shared with owners.</Banner>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Commodities">{(p) => <Input {...p} defaultValue="Gold, copper, graphite, rare earths" />}</Field>
            <Field label="Ticket size (USD)">{(p) => <Select {...p} defaultValue="10-50"><option value="10-50">10–50 million</option><option value="5-10">5–10 million</option></Select>}</Field>
          </div>
          <Link to="/investor/mandate" viewTransition className="text-meta font-medium text-primary hover:underline">
            Open the full mandate form
          </Link>
        </div>
      )}
      <div className="flex gap-2 pt-2">
        {step > 0 && (
          <Button size="lg" variant="secondary" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        )}
        {step < 3 ? (
          <Button size="lg" className="flex-1" disabled={step === 2 && !reps.true} onClick={() => setStep((s) => s + 1)}>
            Continue
          </Button>
        ) : (
          <Button size="lg" className="flex-1" icon={<CircleCheck />} onClick={() => (setSubmitted(true), navigate('/investor/qualification?state=status', { replace: true }))}>
            Submit for qualification
          </Button>
        )}
      </div>
    </div>
  )
}

