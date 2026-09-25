import { BadgeCheck, FingerprintPattern, Laptop, ShieldCheck, TimerOff } from 'lucide-react'
import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { useDemoState } from '@/lib/demo-states'
import { useDocumentTitle } from '@/lib/hooks'
import { AuthHeading, AuthLayout } from '@/auth/AuthLayout'
import { CredentialSignIn, InvitationGate } from '@/auth/flows'
import { Banner, EmptyState } from '@/ds/components'
import { Avatar, Button, Checkbox, Field, Input, Progress, toast } from '@/ds/ui'

export default function CommandAuthRoutes() {
  return (
    <AuthLayout app="command">
      <Outlet />
    </AuthLayout>
  )
}

export function CommandSignIn() {
  return (
    <CredentialSignIn
      screenId="CC-SIGNIN"
      home="/command"
      eyebrow="Command Center · SSD staff"
      title="Sign in"
      sub="Use SSD single sign-on. Outside counsel use the link in their counsel invitation."
      emailDefault="kevin.omondi@ssd.example"
      sso={{ label: 'Continue with SSD single sign-on', primary: true, hint: 'Passkey and authenticator required' }}
      notFound={<>Staff accounts are created by Platform operations. Ask Aisha Hassan if you should have access.</>}
      signUpHref="/command/sign-up"
      signUpLabel="New to SSD?"
      idleNote="The Command Center signs you out after 30 minutes idle. Every sign-in is logged."
    />
  )
}

export function CommandSignUp() {
  return (
    <InvitationGate
      eyebrow="Command Center · SSD staff"
      title="Staff accounts are set up by Platform operations"
      sub="There is no public sign-up. When you join SSD, Aisha Hassan sends an invitation with your role."
      codePlaceholder="SSD-4M2P-7XQA"
      continueTo="/command/invite"
      request={{
        title: 'Need access?',
        body: <>Ask Platform operations. Access is role-based and reviewed every quarter.</>,
        cta: 'Contact Platform operations',
        to: '/contact?topic=staff',
      }}
      signInHref="/command/sign-in"
    />
  )
}

const INVITE_STATES = [
  { id: 'default', label: 'Activation' },
  { id: 'expired', label: 'Invitation expired' },
] as const

/** Command Center · activate a staff account from an invitation. */
export function CommandInvite() {
  useDocumentTitle('Activate your staff account')
  const navigate = useNavigate()
  const [state] = useDemoState('CC-INVITE', INVITE_STATES)
  const [step, setStep] = useState(0)
  const [passkey, setPasskey] = useState(false)
  const [code, setCode] = useState('')
  const [acks, setAcks] = useState({ offplatform: false, confidential: false, logged: false })

  if (state === 'expired') {
    return <EmptyState icon={<TimerOff />} title="This invitation has expired" body="Staff invitations expire after 7 days. Aisha Hassan can send a new one." contactId="aisha" action={<Button onClick={() => toast.success('Request sent to Aisha Hassan')}>Ask for a new invitation</Button>} />
  }

  return (
    <div className="animate-rise-in">
      <div className="mb-5 flex items-center gap-3">
        <Avatar id="aisha" size={40} />
        <p className="text-meta text-muted">
          <span className="font-semibold text-fg">Aisha Hassan</span> invited you to the Command Center as a <span className="font-semibold text-fg">Verification analyst</span>.
        </p>
      </div>
      <Progress value={((step + 1) / 3) * 100} className="mb-5" label="Activation progress" />
      {step === 0 && (
        <div className="space-y-4">
          <AuthHeading eyebrow="Step 1 of 3" title="Confirm your account" />
          <Field label="Name">{(p) => <Input {...p} value="Mercy Achieng" readOnly />}</Field>
          <Field label="SSD email">{(p) => <Input {...p} value="mercy.achieng@ssd.example" readOnly />}</Field>
          <Field label="Role" hint="Roles are granted by Platform operations and reviewed quarterly">
            {(p) => <Input {...p} value="Verification analyst · Nairobi" readOnly />}
          </Field>
        </div>
      )}
      {step === 1 && (
        <div className="space-y-4">
          <AuthHeading eyebrow="Step 2 of 3" title="Secure your account" sub="Staff sign in with a passkey and an authenticator. SMS codes are not accepted for staff." />
          <Button size="lg" block variant={passkey ? 'success' : 'primary'} icon={passkey ? <BadgeCheck /> : <FingerprintPattern />} onClick={() => setPasskey(true)}>
            {passkey ? 'Passkey created on this device' : 'Create a passkey'}
          </Button>
          <Banner tone="neutral" icon={<Laptop />}>
            This device will be registered to you. New devices need approval from Platform operations.
          </Banner>
          <Field label="Authenticator code">
            {(p) => <Input {...p} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="000000" className="font-mono tracking-[0.3em]" leading={<ShieldCheck />} />}
          </Field>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-3">
          <AuthHeading eyebrow="Step 3 of 3" title="Before you start" sub="These keep SSD on the right side of US securities law and Kenya's data protection rules." />
          <Checkbox checked={acks.offplatform} onCheckedChange={(v) => setAcks((a) => ({ ...a, offplatform: v }))} label="I will not discuss deals with owners or investors off-platform" description="You will confirm this in a monthly attestation" />
          <Checkbox checked={acks.confidential} onCheckedChange={(v) => setAcks((a) => ({ ...a, confidential: v }))} label="I will keep owner, investor and community data confidential" />
          <Checkbox checked={acks.logged} onCheckedChange={(v) => setAcks((a) => ({ ...a, logged: v }))} label="I understand every view, download and approval I make is logged" />
        </div>
      )}
      <div className="mt-6 flex gap-2">
        {step > 0 && (
          <Button size="lg" variant="secondary" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        )}
        {step < 2 ? (
          <Button size="lg" className="flex-1" disabled={step === 1 && (!passkey || code.length !== 6)} onClick={() => setStep((s) => s + 1)}>
            Continue
          </Button>
        ) : (
          <Button size="lg" className="flex-1" disabled={!(acks.offplatform && acks.confidential && acks.logged)} onClick={() => (toast.success('Account activated'), navigate('/command', { viewTransition: true }))}>
            Activate and open the Command Center
          </Button>
        )}
      </div>
    </div>
  )
}
