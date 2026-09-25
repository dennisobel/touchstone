import { BadgeCheck, CircleCheck, Clock, FileUp, FingerprintPattern, ShieldCheck, TimerOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { useDemoState } from '@/lib/demo-states'
import { useDocumentTitle } from '@/lib/hooks'
import { AuthHeading, AuthLayout } from '@/auth/AuthLayout'
import { CredentialSignIn, InvitationGate } from '@/auth/flows'
import { Banner, EmptyState } from '@/ds/components'
import { Avatar, Button, Checkbox, Field, Input, Progress, Select, Textarea, toast } from '@/ds/ui'

export default function ExpertAuthRoutes() {
  return (
    <AuthLayout app="expert">
      <Outlet />
    </AuthLayout>
  )
}

export function ExpertSignIn() {
  return (
    <CredentialSignIn
      screenId="ED-SIGNIN"
      home="/expert"
      eyebrow="Expert Desk"
      title="Sign in"
      sub="For credentialed experts in the Touchstone verification network."
      emailDefault="n.dlamini@example.co.za"
      notFound={<>The Expert Desk is by invitation. If you applied to the network, SSD will email you an invitation once your credentials are checked.</>}
      signUpHref="/expert/sign-up"
      signUpLabel="Not in the network yet?"
    />
  )
}

export function ExpertSignUp() {
  return (
    <InvitationGate
      eyebrow="Expert Desk"
      title="Join the verification network"
      sub="Resource geologists, mining lawyers, ESG specialists and field verifiers join by invitation, after SSD checks their credentials and independence."
      codePlaceholder="EXP-3F8R-21QD"
      continueTo="/expert/invite"
      request={{
        title: 'Apply to join the network',
        body: <>Tell us your discipline, registrations, jurisdictions and commodities. SSD checks credentials on public registers before sending an invitation.</>,
        cta: 'Apply to join',
        to: '/for/experts#apply',
      }}
      signInHref="/expert/sign-in"
      footnote="You are paid by SSD for each accepted assignment, never by the party you verify."
    />
  )
}

const INVITE_STATES = [
  { id: 'default', label: 'Invitation' },
  { id: 'pending', label: 'Credential awaiting verification' },
  { id: 'expired', label: 'Invitation expired' },
] as const

const STEPS = ['Your details', 'Credentials', 'Independence', 'Secure your account']

/** Expert Desk · accept an invitation (the expert "sign-up"). */
export function ExpertInvite() {
  useDocumentTitle('Accept your invitation')
  const navigate = useNavigate()
  const [state] = useDemoState('ED-INVITE', INVITE_STATES)
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [acks, setAcks] = useState({ conflicts: false, payment: false, scope: false })
  const [code, setCode] = useState('')
  const [passkey, setPasskey] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  useEffect(() => setDone(state === 'pending'), [state])

  if (state === 'expired') {
    return <EmptyState icon={<TimerOff />} title="This invitation has expired" body="Invitations work once and expire after 7 days. Kevin Omondi can send a new one." contactId="kevin" action={<Button onClick={() => toast.success('Request sent to Kevin Omondi')}>Request a new invitation</Button>} />
  }

  if (done) {
    return (
      <div className="animate-rise-in text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-review-fill text-review">
          <Clock className="size-8" aria-hidden />
        </span>
        <h1 className="mt-4 text-h1 font-semibold">Welcome to the network</h1>
        <p className="mt-2 text-body text-muted">SSD is checking your SACNASP registration on the public register, usually within 1 working day. You can set up your profile now; offers start once your credential is verified.</p>
        <Button size="lg" className="mt-6" onClick={() => navigate('/expert/profile?state=pending', { viewTransition: true })}>
          Set up my profile
        </Button>
      </div>
    )
  }

  return (
    <div className="animate-rise-in">
      <div className="mb-5 flex items-center gap-3">
        <Avatar id="kevin" size={40} />
        <p className="text-meta text-muted">
          <span className="font-semibold text-fg">Kevin Omondi</span> invited you to join as a <span className="font-semibold text-fg">resource geologist (Qualified Person)</span>.
        </p>
      </div>
      <p className="text-micro font-medium text-muted">
        Step {step + 1} of 4 · {STEPS[step]}
      </p>
      <Progress value={((step + 1) / 4) * 100} className="mb-5 mt-2" label="Invitation progress" />

      {step === 0 && (
        <div className="space-y-4">
          <AuthHeading title="Confirm your details" />
          <Field label="Full name">{(p) => <Input {...p} defaultValue="Dr Nomvula Dlamini" />}</Field>
          <Field label="Email" hint="From your invitation">
            {(p) => <Input {...p} value="n.dlamini@example.co.za" readOnly />}
          </Field>
          <Field label="Based in">{(p) => <Input {...p} defaultValue="Johannesburg, South Africa" />}</Field>
        </div>
      )}
      {step === 1 && (
        <div className="space-y-4">
          <AuthHeading title="Your professional credentials" sub="Your signature on an opinion carries these. SSD verifies them on the public register." />
          <Field label="Professional body">
            {(p) => (
              <Select {...p} defaultValue="SACNASP">
                <option>SACNASP</option>
                <option>AusIMM</option>
                <option>Geological Society of Kenya</option>
                <option>Law Society of Kenya</option>
                <option>NEMA (EIA/Audit expert)</option>
              </Select>
            )}
          </Field>
          <Field label="Membership number">{(p) => <Input {...p} defaultValue="Pr.Sci.Nat. 400187/06" className="font-mono" />}</Field>
          <Field label="Registration expires">{(p) => <Input {...p} type="date" defaultValue="2027-06-30" />}</Field>
          <Button variant="secondary" block icon={uploaded ? <CircleCheck /> : <FileUp />} onClick={() => setUploaded(true)}>
            {uploaded ? 'Certificate uploaded' : 'Upload your registration certificate'}
          </Button>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-3">
          <AuthHeading title="Independence" sub="The network's credibility rests on these." />
          <Checkbox checked={acks.conflicts} onCheckedChange={(v) => setAcks((a) => ({ ...a, conflicts: v }))} label="I will declare conflicts of interest for every assignment before I get access" />
          <Checkbox checked={acks.payment} onCheckedChange={(v) => setAcks((a) => ({ ...a, payment: v }))} label="I will not accept payment or gifts from owners, representatives or investors" />
          <Checkbox checked={acks.scope} onCheckedChange={(v) => setAcks((a) => ({ ...a, scope: v }))} label="I understand my access covers one asset and one task, and ends 7 days after the deadline" />
          <Field label="Standing conflicts to register (optional)">{(p) => <Textarea {...p} rows={3} placeholder="Past clients, shareholdings, relationships" />}</Field>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-4">
          <AuthHeading title="Secure your account" sub="Multi-factor sign-in is required for every expert." />
          <Button size="lg" block variant={passkey ? 'success' : 'primary'} icon={passkey ? <BadgeCheck /> : <FingerprintPattern />} onClick={() => setPasskey(true)}>
            {passkey ? 'Passkey created on this device' : 'Create a passkey'}
          </Button>
          <Field label="Authenticator code" hint="Scan the QR code in your invitation email, then enter the 6-digit code">
            {(p) => <Input {...p} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="000000" className="font-mono tracking-[0.3em]" leading={<ShieldCheck />} />}
          </Field>
        </div>
      )}

      <div className="mt-6 flex gap-2">
        {step > 0 && (
          <Button size="lg" variant="secondary" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        )}
        {step < 3 ? (
          <Button size="lg" className="flex-1" disabled={(step === 2 && !(acks.conflicts && acks.payment && acks.scope)) || (step === 1 && !uploaded)} onClick={() => setStep((s) => s + 1)}>
            Continue
          </Button>
        ) : (
          <Button size="lg" className="flex-1" disabled={!passkey || code.length !== 6} onClick={() => setDone(true)}>
            Finish
          </Button>
        )}
      </div>
      {step === 1 && !uploaded && (
        <Banner tone="neutral" className="mt-4">
          Can't upload now? Continue later from Profile; offers start once your credential is verified.
        </Banner>
      )}
    </div>
  )
}
