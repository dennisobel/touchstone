import { ArrowRight, BadgeCheck, CircleCheck, FileSignature, KeyRound, MessageCircle, ScrollText, ThumbsDown, UserX, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useDemoState } from '@/lib/demo-states'
import { fmtDate, fmtDateTime, NOW } from '@/lib/format'
import { useDemo } from '@/lib/store'
import { asset, claim, flagsFor, WORKSTREAMS } from '@/data'
import { Banner, DisclosureLock, PassportHeader, RedFlagCard, StatusStamp } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Button, Checkbox, Field, Input, Sheet, Textarea, toast } from '@/ds/ui'
import { NotNowSheet, useInvestorCtx } from './common'

export function Disclaimer() {
  return (
    <p className="mt-8 border-t border-line pt-4 text-micro text-muted">
      Not investment advice. SSD verifies facts and reports evidence quality; it does not rate, value or recommend investments, negotiate terms or handle investor funds. Verification has limits of scope and time; see the methodology. As of {fmtDate(NOW)}. Who paid for verification is stated on each passport. Reliance terms approved by counsel apply.
    </p>
  )
}

const STATES = [{ id: 'default', label: 'Teaser' }] as const

/** IP-05 · Teaser: red flags and verification status before any description of the opportunity. */
export default function IP05Teaser() {
  const navigate = useNavigate()
  const { id = 'kiboko' } = useParams()
  const a = asset(id)
  useDemoState('IP-05', STATES)
  const { orgId, hasNda } = useInvestorCtx()
  const respond = useDemo((s) => s.respondTeaser)
  const [notNow, setNotNow] = useState(false)
  const [askOpen, setAskOpen] = useState(false)
  const flags = flagsFor(a.id).filter((f) => f.status !== 'resolved')
  const signed = hasNda(a.id)

  return (
    <Page title={a.code} shortTitle={`Teaser ${a.code}`} back="/investor/opportunities" breadcrumbs={[{ label: 'Opportunities', to: '/investor/opportunities' }, { label: a.code }]} hideHeaderOnDesktop>
      <div className="space-y-5">
        {/* 1. Header and red flags first */}
        <PassportHeader asset={a} view="teaser" />
        {signed && (
          <Banner tone="success" icon={<CircleCheck />} title="Your organisation has signed the NDA" action={<Button size="sm" onClick={() => navigate(`/investor/rooms/${a.id}`, { viewTransition: true })}>Open deal room</Button>} />
        )}
        <section>
          <h2 className="mb-2 text-h2 font-semibold">Red flags</h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {flags.map((f) => (
              <RedFlagCard key={f.id} flag={{ ...f, evidence: [] }} showWorkstream />
            ))}
          </div>
        </section>

        {/* 2. Verification status by workstream */}
        <section>
          <h2 className="mb-2 text-h2 font-semibold">Verification status</h2>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {WORKSTREAMS.map((w) => (
              <li key={w.id} className="flex items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3.5 py-3">
                <span className="text-meta font-medium">{w.name}</span>
                <StatusStamp status={a.workstreamStatus[w.id]} size="sm" />
              </li>
            ))}
          </ul>
        </section>

        {/* 3. Factual summary */}
        <section className="rounded-lg border border-line bg-surface p-4 shadow-e1 md:p-5">
          <h2 className="text-h2 font-semibold">Summary</h2>
          <ul className="mt-3 space-y-2.5 text-body">
            {(a.highlights ?? []).map((h) => (
              <li key={h.claimId} className="flex gap-2.5">
                <BadgeCheck className="mt-1 size-4 shrink-0 text-primary" aria-hidden />
                <span>
                  {h.text}
                  <span className="ml-1.5 text-micro text-muted">({claim(h.claimId)?.status === 'verified' ? 'verified' : 'in review'})</span>
                </span>
              </li>
            ))}
            <li className="flex gap-2.5">
              <ScrollText className="mt-1 size-4 shrink-0 text-primary" aria-hidden />
              {a.licence.type}, active until {fmtDate(a.licence.expires)}
            </li>
          </ul>
        </section>

        {/* 4. Capital sought and structure */}
        <section className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-line bg-surface p-4">
            <p className="text-micro text-muted">Capital sought</p>
            <p className="mt-1 text-h3 font-semibold">{a.capitalSought}</p>
          </div>
          <div className="rounded-lg border border-line bg-surface p-4">
            <p className="text-micro text-muted">Preferred structure</p>
            <p className="mt-1 text-h3 font-semibold">{a.structure}</p>
          </div>
        </section>

        {!signed && (
          <div className="grid gap-3 lg:grid-cols-3">
            <DisclosureLock variant="nda" title="Full passport" contains={`${a.fresh.total} material claims across 7 workstreams, with evidence`} />
            <DisclosureLock variant="nda" title="Documents" contains="86 documents in the deal room" />
            <DisclosureLock variant="nda" title="Owner identity" contains="Company, directors and exact location" />
          </div>
        )}

        {!signed && (
          <div className="glass sticky bottom-[calc(var(--tabbar-h)+var(--safe-bottom)+8px)] z-20 flex gap-2 rounded-xl border border-line p-2.5 shadow-e2 md:bottom-4 md:p-3">
            <Button
              size="lg"
              className="flex-1 md:flex-none"
              iconRight={<ArrowRight />}
              onClick={() => {
                respond(`${orgId}:${a.id}`, 'interested')
                navigate(`/investor/teasers/${a.id}/nda`, { viewTransition: true })
              }}
            >
              Express interest
            </Button>
            <Button size="lg" variant="secondary" icon={<ThumbsDown />} onClick={() => setNotNow(true)} className="max-md:px-3.5">
              <span className="max-md:sr-only">Not now</span>
            </Button>
            <Button size="lg" variant="ghost" icon={<MessageCircle />} onClick={() => setAskOpen(true)} className="max-md:px-3.5">
              <span className="max-md:sr-only">Ask SSD a question</span>
            </Button>
          </div>
        )}
        <Disclaimer />
      </div>

      <NotNowSheet
        open={notNow}
        onOpenChange={setNotNow}
        onDone={() => {
          respond(`${orgId}:${a.id}`, 'not_now')
          setNotNow(false)
          navigate('/investor', { viewTransition: true })
        }}
      />
      <Sheet open={askOpen} onOpenChange={setAskOpen} title="Ask SSD a question" description={`About ${a.code}. James Whitfield replies in the portal.`} desktop="center" size="sm" footer={<Button block onClick={() => (setAskOpen(false), toast.success('Question sent'))}>Send</Button>}>
        <Textarea rows={4} placeholder="Your question" aria-label="Your question" />
      </Sheet>
    </Page>
  )
}

const NDA_STATES = [
  { id: 'default', label: 'Ready to sign' },
  { id: 'no_authority', label: 'Signer lacks authority' },
  { id: 'colleague', label: 'Already signed by a colleague' },
  { id: 'signed', label: 'Signed: deal room open' },
] as const

/** IP-06 · NDA signing */
export function IP06Nda() {
  const navigate = useNavigate()
  const { id = 'kiboko' } = useParams()
  const a = asset(id)
  const [state] = useDemoState('IP-06', NDA_STATES)
  const { me, org, orgId } = useInvestorCtx()
  const signNda = useDemo((s) => s.signNda)
  const [authority, setAuthority] = useState(false)
  const [code, setCode] = useState('')
  const [signed, setSigned] = useState(false)
  useEffect(() => setSigned(state === 'signed'), [state])

  if (signed) {
    return (
      <Page title="Your deal room is open" back="/investor" focus>
        <div className="mx-auto max-w-lg py-6 text-center animate-rise-in">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-verified-fill text-verified">
            <FileSignature className="size-8" aria-hidden />
          </span>
          <h1 className="mt-4 text-h1 font-semibold">Your deal room is open</h1>
          <p className="mt-2 text-body text-muted">
            NDA signed {fmtDateTime(NOW, 'ET')} by {me.name} for {org.name}. A copy is in your deal room.
          </p>
          <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-body">
            {['The full passport, named: ' + a.name, '86 documents, watermarked', 'Questions to the owner, moderated by SSD'].map((x) => (
              <li key={x} className="flex gap-2">
                <CircleCheck className="mt-1 size-4 shrink-0 text-verified" aria-hidden />
                {x}
              </li>
            ))}
          </ul>
          <Button size="xl" className="mt-8" iconRight={<ArrowRight />} onClick={() => navigate(`/investor/rooms/${a.id}`, { viewTransition: true })}>
            Open the passport
          </Button>
        </div>
      </Page>
    )
  }

  return (
    <Page title="Sign the NDA" subtitle={`${a.code} · ${org.name}`} back={`/investor/teasers/${a.id}`} breadcrumbs={[{ label: 'Opportunities', to: '/investor/opportunities' }, { label: a.code, to: `/investor/teasers/${a.id}` }, { label: 'NDA' }]}>
      {state === 'colleague' && (
        <Banner tone="success" icon={<Users />} className="mb-4" title="Priya Raman already signed this NDA for your organisation on 16 Sep 2026" action={<Button size="sm" onClick={() => navigate(`/investor/rooms/${a.id}`)}>Open deal room</Button>}>
          You don't need to sign again; you have access as a member of {org.name}.
        </Banner>
      )}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <section className="rounded-lg border border-primary/25 bg-primary-tint/50 p-4">
            <h2 className="text-h3 font-semibold">In plain English</h2>
            <ul className="mt-2 space-y-1.5 text-meta">
              <li>Covers everything in the {a.code} deal room and the owner's identity.</li>
              <li>Lasts 2 years from signing; information stays confidential after that if it is not public.</li>
              <li>You may share it with advisers you invite (lawyers, consultants, financiers) who accept these terms.</li>
              <li>No obligation to invest; SSD takes no fee tied to any deal.</li>
            </ul>
          </section>
          <article className="max-h-[55dvh] overflow-y-auto rounded-lg border border-line bg-white p-6 text-[13px] leading-6 text-[#0f1419] shadow-e1">
            <h3 className="font-serif text-[18px] font-semibold">Mutual Non-Disclosure Agreement</h3>
            <p className="mt-1 text-[11px] text-[#52606f]">Template NDA-INV v2.3 · approved by counsel 1 Sep 2026</p>
            {['1. Confidential Information. All information made available in the deal room for the opportunity coded ' + a.code + ', including the identity of the holder…', '2. Permitted use. The Recipient shall use Confidential Information solely to evaluate a possible transaction with the holder…', '3. Representatives. The Recipient may disclose Confidential Information to its advisers who are bound by obligations no less protective…', '4. Term. This Agreement continues for two (2) years from the Effective Date…', '5. No obligation. Nothing in this Agreement obliges either party to enter into any transaction. SSD is not a party to any transaction and receives no transaction-based compensation…', '6. Governing law. The laws of the State of New York…'].map((p) => (
              <p key={p} className="mt-3">
                {p}
              </p>
            ))}
          </article>
        </div>
        <section className="h-fit rounded-lg border border-line bg-surface p-4 shadow-e1 lg:sticky lg:top-24">
          <h2 className="text-h3 font-semibold">Signer</h2>
          <dl className="mt-3 space-y-2 text-meta">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Name</dt>
              <dd className="font-medium">{me.name}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Organisation</dt>
              <dd>{org.name}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Role</dt>
              <dd>{me.role}</dd>
            </div>
          </dl>
          {state === 'no_authority' ? (
            <div className="mt-4 space-y-3">
              <Banner tone="warning" icon={<UserX />} title="Your role can't sign for the organisation">
                Ask your organisation admin to sign, or to give you signing authority.
              </Banner>
              <Button block variant="secondary" onClick={() => toast.success('Request sent to your organisation admin')}>
                Ask the admin to sign
              </Button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <Checkbox checked={authority} onCheckedChange={setAuthority} label="I have authority to sign for my organisation" />
              <Field label="Authenticator code">
                {(p) => <Input {...p} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="000000" leading={<KeyRound />} className="font-mono tracking-[0.3em]" />}
              </Field>
              <Button
                block
                size="lg"
                icon={<FileSignature />}
                disabled={!authority || code.length !== 6 || state === 'colleague'}
                onClick={() => {
                  signNda(`${orgId}:${a.id}`)
                  setSigned(true)
                }}
              >
                Sign NDA
              </Button>
            </div>
          )}
        </section>
      </div>
    </Page>
  )
}
