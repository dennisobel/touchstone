import { Outlet } from 'react-router'
import { AuthLayout } from '@/auth/AuthLayout'
import { CredentialSignIn, InvitationGate } from '@/auth/flows'

/** Investor Portal sign-in, sign-up (invitation) and invitation acceptance share this layout. */
export default function InvestorAuthRoutes() {
  return (
    <AuthLayout app="investor">
      <Outlet />
    </AuthLayout>
  )
}

export function InvestorSignIn() {
  return (
    <CredentialSignIn
      screenId="IP-SIGNIN"
      home="/investor"
      eyebrow="Investor Portal"
      title="Sign in"
      sub="For investors and advisers SSD has invited."
      emailDefault="marcus.bell@cedarpeak.example"
      sso={{ label: 'Use company single sign-on', hint: 'If your organisation has set it up with SSD' }}
      notFound={<>The Investor Portal is by invitation. If you expected access, contact James Whitfield at SSD.</>}
      signUpHref="/investor/sign-up"
      signUpLabel="New to the portal?"
    />
  )
}

export function InvestorSignUp() {
  return (
    <InvitationGate
      eyebrow="Investor Portal"
      title="The portal is by invitation"
      sub="SSD invites investors after a conversation with one of its partners. Opportunities are never listed publicly, and the portal is never indexed."
      codePlaceholder="INV-7K2Q-94XM"
      continueTo="/investor/invite"
      request={{
        title: "I'd like to talk to SSD",
        body: <>Tell us about your organisation and mandate. A partner will get in touch to arrange a call; qualification follows that conversation.</>,
        cta: 'Talk to SSD',
        to: '/contact?topic=investor',
      }}
      signInHref="/investor/sign-in"
      footnote="SSD verifies facts; it does not give investment advice, value assets or handle investor funds."
    />
  )
}
