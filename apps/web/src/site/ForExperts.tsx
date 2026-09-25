import { BadgeCheck, Ban, Banknote, BookOpen, Camera, ClipboardCheck, Database, FileSignature, KeyRound, Mail, MapPinCheck, Repeat, Scale, ScanSearch, ShieldCheck, Tablet, Timer, UserCheck, WifiOff, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useDocumentTitle } from '@/lib/hooks'
import { StatusStamp } from '@/ds/components'
import { CtaBand, Faq, Hero, HeroLink, Section, SectionHeading } from './SiteLayout'
import { DisciplineGrid } from './parts'
import { ExpertApplyForm } from './forms'

export default function ForExperts() {
  useDocumentTitle('For experts and field verifiers')
  return (
    <>
      <Hero
        eyebrow="For experts and field verifiers"
        title="Your signature, scoped and respected."
        sub="Join SSD's independent network of resource geologists, mining lawyers, ESG specialists and field verifiers. A clear scope, complete data and a fixed fee, and you are never paid by the party you verify."
        actions={
          <>
            <HeroLink to="/for/experts#apply">Apply to join the network</HeroLink>
            <HeroLink to="/expert/sign-in" variant="outline">
              Already in the network? Sign in
            </HeroLink>
          </>
        }
        note="Kenya first, then Tanzania, Zambia and Uganda · Remote reviews welcome"
        aside={<OfferArt />}
      />

      <Section labelledBy="why-title">
        <SectionHeading id="why-title" eyebrow="Why work with SSD" title="Send the drillhole database, not a slide deck" sub="Everything is set up so you can give an opinion you are comfortable signing." />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card icon={ClipboardCheck} title="A tight, written scope">
            You see exactly which claims your signature covers before you accept.
          </Card>
          <Card icon={Database} title="Complete data in one place">
            Drillhole databases, assay certificates, QA/QC and certified searches, not files chased by email.
          </Card>
          <Card icon={Scale} title="Clear reliance and liability">
            Engagement terms name who may rely on your opinion, and on what terms.
          </Card>
          <Card icon={Banknote} title="A fixed fee, paid by SSD">
            Agreed before you accept. Field visits are paid by M-Pesa, with a target of seven days.
          </Card>
        </ul>
      </Section>

      <Section tone="surface" labelledBy="independence-title">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
          <SectionHeading id="independence-title" eyebrow="Independence" title="The network is only as credible as its independence" sub="These rules are enforced by the platform, not left to good intentions." />
          <ul className="space-y-3">
            <Rule icon={Ban}>Never paid by owners, representatives or investors</Rule>
            <Rule icon={UserCheck}>Conflicts declared for every assignment, before any access</Rule>
            <Rule icon={KeyRound}>Access to one asset and one task, ending 7 days after the deadline</Rule>
            <Rule icon={Repeat}>A random sample of site visits is repeated by a second verifier</Rule>
            <Rule icon={ShieldCheck}>AI can draft and extract; only a named professional can mark a claim verified</Rule>
          </ul>
        </div>
      </Section>

      <Section labelledBy="disciplines-title">
        <SectionHeading id="disciplines-title" eyebrow="Disciplines" title="Who we work with" />
        <DisciplineGrid className="mt-10" />
      </Section>

      <Section tone="surface" labelledBy="tools-title">
        <SectionHeading id="tools-title" eyebrow="Your tools" title="Built for the desk and the field" />
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <ToolCard
            icon={BookOpen}
            name="Expert Desk"
            where="Laptop · works on phones"
            items={[
              { icon: FileSignature, text: 'Review templates aligned to JORC, SAMREC and S-K 1300' },
              { icon: Scale, text: 'Title-opinion template with assumptions, qualifications and an as-of date' },
              { icon: ScanSearch, text: 'Automated data checks to review, and claim-by-claim comments' },
              { icon: BadgeCheck, text: 'Structured sign-off with your credential on every stamp' },
            ]}
          />
          <ToolCard
            icon={Tablet}
            name="Field App"
            where="Android · coming with the field network"
            items={[
              { icon: WifiOff, text: 'Works offline for 14 days; the site pack downloads before you lose signal' },
              { icon: Camera, text: 'Tamper-evident photos stamped with time, GPS and a digital fingerprint' },
              { icon: MapPinCheck, text: 'Sample custody with seal numbers, and consent recorded before any interview' },
              { icon: Timer, text: 'Safety check-in timer and SOS, with a supervisor who answers' },
            ]}
          />
        </div>
      </Section>

      <Section id="apply" labelledBy="apply-title">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div>
            <SectionHeading id="apply-title" eyebrow="Apply" title="Join the verification network" sub="SSD checks your registration on the public register before sending an invitation to the Expert Desk." />
            <ol className="mt-8 space-y-4">
              {[
                ['Apply', 'Your discipline, registration and the commodities you know.'],
                ['Credential check', 'SSD confirms your registration on the public register, usually within five working days.'],
                ['Invitation', 'An email invitation to the Expert Desk. Set up a passkey and an authenticator.'],
                ['Offers', 'Assignments that match your discipline, jurisdictions and commodities. Accept or decline each one.'],
              ].map(([t, b], i) => (
                <li key={t} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-meta font-semibold text-on-primary">{i + 1}</span>
                  <span>
                    <span className="block text-body font-semibold text-fg">{t}</span>
                    <span className="block text-meta text-muted">{b}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-8 flex items-center gap-2 text-meta text-muted">
              <Mail className="size-4" aria-hidden /> Questions first? network@ssd.example
            </p>
          </div>
          <ExpertApplyForm />
        </div>
      </Section>

      <Section tone="surface" labelledBy="faq-title">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <SectionHeading id="faq-title" eyebrow="Questions" title="What experts ask first" />
          <Faq items={FAQ} />
        </div>
      </Section>

      <CtaBand title="Put your name on evidence that holds." sub="Tight scope, complete data, clear terms. Apply once; offers follow your discipline and availability.">
        <HeroLink to="/for/experts#apply">Apply to join the network</HeroLink>
        <HeroLink to="/methodology" variant="outline">
          Read the methodology
        </HeroLink>
      </CtaBand>
    </>
  )
}

const FAQ: { q: string; a: ReactNode }[] = [
  { q: 'How are fees set?', a: 'Each offer states a fixed fee and a written scope before you accept. Fees never depend on your conclusion.' },
  { q: 'What if the data is too thin to sign?', a: 'Say so. You can mark claims Unverifiable or request more data through SSD; a documented gap is better than a weak stamp.' },
  { q: 'Who relies on my opinion?', a: 'Your engagement terms name who may rely on the opinion and on what terms, as approved by counsel. The passport shows exactly which claims your signature covers.' },
  { q: 'Can I decline an assignment?', a: 'Always. Declining never affects future offers. Conflicts must be declared before any access is granted.' },
]

/** An assignment offer as it appears on the Expert Desk (generic, illustrative). */
function OfferArt() {
  const rows: [string, string][] = [
    ['Task', 'Resource review · Geology and resources'],
    ['Your signature covers', '6 claims, listed before you accept'],
    ['Access', "This asset's technical folder only"],
    ['Access ends', '7 days after the deadline'],
    ['Fee', 'Fixed, agreed before you accept'],
    ['Deadline', '10 working days'],
  ]
  return (
    <div className="dark mx-auto w-full max-w-[440px] rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur lg:mr-0">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E08A62]">Assignment offer · example</p>
        <StatusStamp status="in_review" size="sm" label="Awaiting your reply" />
      </div>
      <dl className="mt-4 divide-y divide-white/10 rounded-lg bg-black/20">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[132px_minmax(0,1fr)] gap-3 px-3 py-2.5 text-[12.5px]">
            <dt className="text-white/50">{k}</dt>
            <dd className="text-white/90">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <span className="flex h-10 items-center justify-center rounded-lg border border-white/20 text-[13px] font-medium text-white/85">Declare conflicts</span>
        <span className="flex h-10 items-center justify-center rounded-lg bg-white text-[13px] font-semibold text-[#0F1419]">Accept</span>
      </div>
      <p className="mt-3 text-[10.5px] text-white/45">Paid by SSD. Never by the owner, their representative or an investor.</p>
    </div>
  )
}

function Card({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <li className="rounded-2xl border border-line bg-surface p-5 shadow-e1">
      <span className="flex size-10 items-center justify-center rounded-xl bg-primary-tint text-primary">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="mt-4 text-body font-semibold text-fg">{title}</p>
      <p className="mt-1 text-meta text-muted">{children}</p>
    </li>
  )
}

function Rule({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <li className="flex items-center gap-4 rounded-xl border border-line bg-canvas p-4 dark:bg-raised">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-tint text-primary">
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="text-body text-fg">{children}</span>
    </li>
  )
}

function ToolCard({ icon: Icon, name, where, items }: { icon: LucideIcon; name: string; where: string; items: { icon: LucideIcon; text: string }[] }) {
  return (
    <article className="rounded-2xl border border-line bg-canvas p-6 dark:bg-raised">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-on-primary">
          <Icon className="size-5" aria-hidden />
        </span>
        <span>
          <span className="block text-h2 font-semibold text-fg">{name}</span>
          <span className="block text-micro text-muted">{where}</span>
        </span>
      </div>
      <ul className="mt-5 space-y-3">
        {items.map((it) => (
          <li key={it.text} className="flex items-start gap-3 text-body text-fg">
            <it.icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            {it.text}
          </li>
        ))}
      </ul>
    </article>
  )
}
