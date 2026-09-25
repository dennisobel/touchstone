import { Bot, FileCheck, Globe, Handshake, Layers, ShieldCheck, Signal, UserCheck, type LucideIcon } from 'lucide-react'
import { useDocumentTitle } from '@/lib/hooks'
import { person } from '@/data'
import { Avatar } from '@/ds/ui'
import { CtaBand, Hero, HeroLink, Section, SectionHeading } from './SiteLayout'
import { DisciplineGrid, DoesDoesNot, RoundStamp, TeamGrid } from './parts'

const PRINCIPLES: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: FileCheck, title: 'Verify facts; never rate investments', body: 'No investment score, valuation or return projection is ever shown. The passport reports evidence quality, not merit.' },
  { icon: Layers, title: 'Every claim carries its proof', body: 'No claim reaches a passport without a source, evidence level, verifier, date and expiry.' },
  { icon: ShieldCheck, title: 'Compliance by construction', body: 'Gates live in the workflow and are enforced by the core; a screen cannot show what the core refuses to send.' },
  { icon: Handshake, title: 'Owners are customers too', body: 'Fixed, disclosed fees; visible status and deadlines; a right of reply before release; a log of who viewed their files.' },
  { icon: UserCheck, title: 'Independence is designed in', body: 'Verifiers are never paid by the party they verify, declare conflicts per assignment, and a sample of visits is repeated.' },
  { icon: Signal, title: 'Design for the weakest connection', body: 'Owner and field tools work on a mid-range Android over 3G, or offline.' },
  { icon: Bot, title: 'AI drafts; people decide', body: 'AI can propose, extract and summarise, but only a named person can verify a claim or release a passport.' },
  { icon: Globe, title: 'Country rules are configuration', body: "Licence types, consents and checklists live in versioned country packs, so a new country is a review, not a rebuild." },
]

const OFFICES = [
  { city: 'Nairobi', role: 'Verification, owner support and the expert network', contact: 'kevin' },
  { city: 'Houston', role: 'Investor relationships', contact: 'james' },
  { city: 'Washington DC', role: 'Compliance, privacy and counsel liaison', contact: 'sarah' },
]

export default function About() {
  useDocumentTitle('About SSD')
  return (
    <>
      <Hero
        eyebrow="About SSD"
        title="An assay office for mining evidence."
        sub="Assayers once tested gold by drawing it across a dark stone, a touchstone, and reading the streak it left. SSD built Touchstone to do the same for the facts behind a mine: test each one, and show the mark."
        actions={
          <>
            <HeroLink to="/contact">Contact SSD</HeroLink>
            <HeroLink to="/methodology" variant="outline">
              Read the methodology
            </HeroLink>
          </>
        }
        aside={
          <div className="relative mx-auto flex aspect-square w-full max-w-[360px] items-center justify-center lg:mr-0">
            <div className="absolute inset-8 rounded-full bg-[radial-gradient(circle,rgba(143,179,232,0.25),transparent_65%)]" aria-hidden />
            <RoundStamp className="relative size-full rotate-[-10deg] text-[#8FB3E8]/85" label="EVIDENCE • VERIFIER • DATE • EXPIRY • " />
          </div>
        }
      />

      <Section labelledBy="vision-title">
        <p className="text-micro font-semibold uppercase tracking-[0.16em] text-brand">Vision</p>
        <p id="vision-title" className="mt-4 max-w-5xl font-serif text-[28px] leading-[36px] font-semibold tracking-tight text-balance text-fg md:text-[40px] md:leading-[50px]">
          Every East African mining asset that deserves capital can prove it, and every US investor can check the proof.
        </p>
      </Section>

      <Section tone="surface" labelledBy="principles-title">
        <SectionHeading id="principles-title" eyebrow="Principles" title="Eight principles that settle arguments before they start" />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map((p, i) => (
            <li key={p.title} className="rounded-2xl border border-line bg-canvas p-5 dark:bg-raised">
              <div className="flex items-center justify-between">
                <p.icon className="size-6 text-primary" aria-hidden />
                <span className="font-mono text-micro text-muted">{i + 1}</span>
              </div>
              <p className="mt-3 text-body font-semibold text-fg">{p.title}</p>
              <p className="mt-1 text-meta text-muted">{p.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section labelledBy="team-title">
        <SectionHeading id="team-title" eyebrow="The people behind it" title="Named people you can reach" sub="SSD is a US company. Its partners, analysts and compliance team work alongside an independent network of registered professionals, with outside US securities counsel reviewing every template and gate." />
        <TeamGrid className="mt-10" />
        <DisciplineGrid className="mt-4" />
      </Section>

      <Section tone="surface" labelledBy="lines-title">
        <SectionHeading id="lines-title" eyebrow="How SSD is paid" title="Subscriptions and fixed fees. Never a success fee." sub="Investors pay subscriptions; verification carries fixed, disclosed fees. Any fee tied to a deal closing is blocked by the platform's rules." />
        <DoesDoesNot className="mt-10" />
      </Section>

      <Section labelledBy="offices-title">
        <SectionHeading id="offices-title" eyebrow="Offices" title="Nairobi, Houston and Washington DC" />
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {OFFICES.map((o) => {
            const p = person(o.contact)
            return (
              <li key={o.city} className="rounded-2xl border border-line bg-surface p-6 shadow-e1">
                <p className="font-serif text-[24px] leading-[30px] font-semibold text-fg">{o.city}</p>
                <p className="mt-1 text-meta text-muted">{o.role}</p>
                <p className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                  <Avatar id={o.contact} size={36} />
                  <span>
                    <span className="block text-meta font-semibold text-fg">{p.name}</span>
                    <span className="block text-micro text-muted">{p.email}</span>
                  </span>
                </p>
              </li>
            )
          })}
        </ul>
      </Section>

      <CtaBand title="Kenya first. East Africa next." sub="The pilot runs in Kenya, with Tanzania, Zambia and Uganda to follow. Tell us where you fit.">
        <HeroLink to="/owner/sign-up">Verify my licence</HeroLink>
        <HeroLink to="/for/investors#talk" variant="outline">
          Talk to SSD
        </HeroLink>
        <HeroLink to="/for/experts#apply" variant="outline">
          Join the network
        </HeroLink>
      </CtaBand>
    </>
  )
}
