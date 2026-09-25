import { BadgeCheck, CreditCard, Eye, FileLock2, FileText, Globe, IdCard, Lock, MessageCircle, Phone, ScrollText, Smartphone, Stamp, UserCheck, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from '@/lib/cn'
import type { Lang } from '@/lib/format'
import { useDocumentTitle } from '@/lib/hooks'
import { useDemo } from '@/lib/store'
import { Avatar } from '@/ds/ui'
import { CtaBand, Faq, Hero, HeroLink, Section, SectionHeading } from './SiteLayout'
import { TierCards } from './parts'

// X-03 · For licence holders, in English and Swahili.
// Swahili is a draft: it must be reviewed by a native speaker before launch (as in the Owner App).

type Item = { title: string; body: string }
type Copy = {
  metaTitle: string
  eyebrow: string
  title: string
  sub: string
  cta: string
  signIn: string
  help: string
  sms: string
  promisesTitle: string
  promises: Item[]
  getTitle: string
  getSub: string
  get: Item[]
  stepsTitle: string
  steps: Item[]
  protectTitle: string
  protectSub: string
  protect: Item[]
  feesTitle: string
  feesSub: string
  quote: string
  scam: string
  startTitle: string
  start: string[]
  assist: string
  contactLabel: string
  repTitle: string
  repBody: string
  faqTitle: string
  faq: { q: string; a: string }[]
  ctaTitle: string
  ctaSub: string
}

const en: Copy = {
  metaTitle: 'For licence holders',
  eyebrow: 'For licence holders in Kenya',
  title: 'Prove what you hold.',
  sub: 'Touchstone checks your licence and documents so serious investors can trust them. Fees are fixed and shown before you pay, and you see every finding before anyone else.',
  cta: 'Start with your phone number',
  signIn: 'Already signed up? Sign in',
  help: 'Prefer to talk first? Call or WhatsApp Kevin Omondi at SSD Nairobi.',
  sms: 'Touchstone: your code is 482913. SSD will never ask you for this code, or for money, by phone.',
  promisesTitle: 'Our promises to you',
  promises: [
    { title: 'No money before a written quote', body: 'And never by phone or WhatsApp. You pay inside the app, by M-Pesa, only after you accept the quote.' },
    { title: 'Fees never depend on the verdict', body: 'A good result cannot be bought, and a difficult one does not cost more.' },
    { title: 'You see every finding first', body: 'You get five working days to reply, with evidence, before anything is released.' },
    { title: 'You see who opens your documents', body: 'Every view and download is logged and shown to you.' },
  ],
  getTitle: 'What you get',
  getSub: 'A verified record of your asset that you can share with confidence, and a person who answers your questions.',
  get: [
    { title: 'A Mine Passport', body: 'Every fact about your licence and site, checked and stamped by named professionals.' },
    { title: 'Findings in plain language', body: 'What was checked, what was found and what to do next, in English or Swahili.' },
    { title: 'Introductions through SSD', body: 'SSD shares an anonymised summary with qualified investors. You approve every word, and your name stays private until you agree.' },
    { title: 'A named contact', body: 'One person at SSD who answers on WhatsApp and tells you what happens next.' },
  ],
  stepsTitle: 'How it works for you',
  steps: [
    { title: 'Sign up with your phone', body: 'We send a code by SMS. There is no password to remember.' },
    { title: 'Add your licence and documents', body: 'Mark your site on the map. The app tells you which documents matter, one at a time.' },
    { title: 'Accept the quote and pay', body: 'A fixed fee, by M-Pesa, inside the app.' },
    { title: 'Track every check', body: "See each check's status, its deadline and who is working on it." },
    { title: 'Review your findings', body: 'Reply within five working days. Only then is your passport released.' },
  ],
  protectTitle: 'How your documents are protected',
  protectSub: 'Your documents are yours. SSD shares them only with your consent, and you can see every step.',
  protect: [
    { title: 'Nothing public', body: 'Nothing about your asset appears on this website or in search engines.' },
    { title: 'NDA first', body: 'Investors see documents only after signing an NDA that the platform enforces, and only with your consent.' },
    { title: 'Watermarked copies', body: 'Every copy carries the name of the person who downloaded it.' },
    { title: 'Your data, your rights', body: "Handled under Kenya's Data Protection Act 2019. See your consent history and withdraw consent at any time." },
  ],
  feesTitle: 'Fixed fees, three depths of checking',
  feesSub: 'Choose the depth you need. Your SSD contact can help you choose; the fee is fixed and shown in the app before you pay.',
  quote: 'Get my quote',
  scam: 'If anyone asks you to pay SSD outside the app, do not pay. Tell us on WhatsApp.',
  startTitle: 'What you need to start',
  start: ['Your phone number', 'Your national ID card', 'Your licence number', 'Any documents you have. Photos are fine.'],
  assist: 'An SSD field agent can sit with you and complete the forms together.',
  contactLabel: 'Your contact in Nairobi',
  repTitle: 'Submitting for a client?',
  repBody: 'Representatives upload the signed mandate. SSD confirms it directly with the licence holder before any work starts, and the owner sees everything you do.',
  faqTitle: 'Questions owners ask',
  faq: [
    {
      q: 'How do I know this is not a scam?',
      a: "SSD's people are named on this site. We never ask for money before a written quote, never by phone, and fees are paid only inside the app. If anyone asks you to pay outside the app, do not pay; tell us.",
    },
    { q: 'Will you take my site or share my documents?', a: 'No. SSD does not buy assets or negotiate for anyone. Documents are shared only after an NDA and your consent, and you can see every view.' },
    { q: 'What if a finding is wrong?', a: 'You have five working days to reply with evidence. A finding you contest is marked Disputed and reviewed again; nothing is released while you are replying.' },
    { q: 'Will a passport find me an investor?', a: 'It makes your asset easier to trust, but nobody can promise a deal. SSD introduces you only to qualified investors whose mandate fits, and only with your approval.' },
  ],
  ctaTitle: 'Ready when you are.',
  ctaSub: 'Signing up takes about ten minutes, and your progress is saved on your phone.',
}

const sw: Copy = {
  metaTitle: 'Kwa wamiliki wa leseni',
  eyebrow: 'Kwa wamiliki wa leseni nchini Kenya',
  title: 'Thibitisha ulicho nacho.',
  sub: 'Touchstone hukagua leseni na nyaraka zako ili wawekezaji makini waweze kuziamini. Ada ni za kudumu na zinaonyeshwa kabla ya kulipa, na unaona kila matokeo kabla ya mtu mwingine yeyote.',
  cta: 'Anza na namba yako ya simu',
  signIn: 'Tayari umejisajili? Ingia',
  help: 'Ungependa kuongea kwanza? Piga simu au tuma WhatsApp kwa Kevin Omondi, SSD Nairobi.',
  sms: 'Touchstone: namba yako ya siri ni 482913. SSD haitakuuliza namba hii, wala pesa, kwa simu.',
  promisesTitle: 'Ahadi zetu kwako',
  promises: [
    { title: 'Hakuna pesa kabla ya makadirio ya maandishi', body: 'Na kamwe si kwa simu au WhatsApp. Unalipa ndani ya programu, kwa M-Pesa, baada tu ya kukubali makadirio.' },
    { title: 'Ada haitegemei matokeo', body: 'Matokeo mazuri hayanunuliwi, na magumu hayagharimu zaidi.' },
    { title: 'Unaona kila matokeo kwanza', body: 'Unapata siku tano za kazi kujibu, pamoja na ushahidi, kabla ya chochote kutolewa.' },
    { title: 'Unaona nani anafungua nyaraka zako', body: 'Kila utazamaji na upakuaji unarekodiwa na kuonyeshwa kwako.' },
  ],
  getTitle: 'Unachopata',
  getSub: 'Rekodi iliyothibitishwa ya mali yako unayoweza kushiriki kwa uhakika, na mtu anayejibu maswali yako.',
  get: [
    { title: 'Pasipoti ya Mgodi', body: 'Kila ukweli kuhusu leseni na eneo lako, umekaguliwa na kugongwa muhuri na wataalamu wanaojulikana kwa majina.' },
    { title: 'Matokeo kwa lugha rahisi', body: 'Kilichokaguliwa, kilichopatikana na hatua inayofuata, kwa Kiingereza au Kiswahili.' },
    { title: 'Utambulisho kupitia SSD', body: 'SSD hushiriki muhtasari usio na jina lako na wawekezaji waliohitimu. Unaidhinisha kila neno, na jina lako linabaki siri hadi ukubali.' },
    { title: 'Mtu wa kuwasiliana naye', body: 'Mtu mmoja wa SSD anayejibu kwenye WhatsApp na kukueleza kinachofuata.' },
  ],
  stepsTitle: 'Jinsi inavyofanya kazi kwako',
  steps: [
    { title: 'Jisajili kwa simu yako', body: 'Tunatuma namba ya siri kwa SMS. Hakuna nenosiri la kukumbuka.' },
    { title: 'Ongeza leseni na nyaraka zako', body: 'Weka alama ya eneo lako kwenye ramani. Programu inakueleza nyaraka zipi ni muhimu, moja baada ya nyingine.' },
    { title: 'Kubali makadirio na ulipe', body: 'Ada ya kudumu, kwa M-Pesa, ndani ya programu.' },
    { title: 'Fuatilia kila ukaguzi', body: 'Ona hali ya kila ukaguzi, tarehe yake ya mwisho na nani anaushughulikia.' },
    { title: 'Pitia matokeo yako', body: 'Jibu ndani ya siku tano za kazi. Baada ya hapo tu ndipo pasipoti yako inatolewa.' },
  ],
  protectTitle: 'Jinsi nyaraka zako zinavyolindwa',
  protectSub: 'Nyaraka zako ni zako. SSD huzishiriki tu kwa idhini yako, na unaweza kuona kila hatua.',
  protect: [
    { title: 'Hakuna kinachowekwa hadharani', body: 'Hakuna chochote kuhusu mali yako kinachoonekana kwenye tovuti hii au kwenye injini za utafutaji.' },
    { title: 'Mkataba wa usiri kwanza', body: 'Wawekezaji wanaona nyaraka tu baada ya kusaini mkataba wa usiri unaosimamiwa na mfumo, na kwa idhini yako tu.' },
    { title: 'Nakala zenye alama', body: 'Kila nakala ina jina la mtu aliyeipakua.' },
    { title: 'Data yako, haki zako', body: 'Inashughulikiwa chini ya Sheria ya Ulinzi wa Data ya Kenya ya 2019. Ona historia ya idhini zako na uiondoe wakati wowote.' },
  ],
  feesTitle: 'Ada za kudumu, viwango vitatu vya ukaguzi',
  feesSub: 'Chagua kiwango unachohitaji. Mtu wako wa SSD anaweza kukusaidia kuchagua; ada ni ya kudumu na inaonyeshwa kwenye programu kabla ya kulipa.',
  quote: 'Pata makadirio yangu',
  scam: 'Mtu yeyote akikuomba ulipe SSD nje ya programu, usilipe. Tuambie kwenye WhatsApp.',
  startTitle: 'Unachohitaji kuanza',
  start: ['Namba yako ya simu', 'Kitambulisho chako cha taifa', 'Namba ya leseni yako', 'Nyaraka zozote ulizo nazo. Picha zinatosha.'],
  assist: 'Wakala wa SSD anaweza kukaa nawe na kujaza fomu pamoja.',
  contactLabel: 'Mtu wako wa kuwasiliana naye Nairobi',
  repTitle: 'Unawasilisha kwa niaba ya mteja?',
  repBody: 'Wawakilishi hupakia mamlaka iliyosainiwa. SSD huithibitisha moja kwa moja na mwenye leseni kabla ya kazi yoyote kuanza, na mmiliki anaona kila unachofanya.',
  faqTitle: 'Maswali ya wamiliki',
  faq: [
    {
      q: 'Nitajuaje kwamba huu si utapeli?',
      a: 'Watu wa SSD wametajwa kwa majina kwenye tovuti hii. Hatuombi pesa kabla ya makadirio ya maandishi, kamwe kwa simu, na ada hulipwa ndani ya programu tu. Mtu yeyote akikuomba ulipe nje ya programu, usilipe; tuambie.',
    },
    { q: 'Mtachukua eneo langu au kushiriki nyaraka zangu?', a: 'Hapana. SSD hainunui mali wala kujadiliana kwa niaba ya mtu yeyote. Nyaraka hushirikiwa tu baada ya mkataba wa usiri na idhini yako, na unaweza kuona kila utazamaji.' },
    { q: 'Je, matokeo yakiwa si sahihi?', a: 'Una siku tano za kazi kujibu kwa ushahidi. Matokeo unayopinga yanawekwa alama "Inabishaniwa" na kukaguliwa upya; hakuna kinachotolewa wakati unajibu.' },
    { q: 'Je, pasipoti itanipatia mwekezaji?', a: 'Inafanya mali yako iaminike kwa urahisi, lakini hakuna anayeweza kuahidi mkataba. SSD inakutambulisha tu kwa wawekezaji waliohitimu wanaolingana na mahitaji yako, na kwa idhini yako tu.' },
  ],
  ctaTitle: 'Tuko tayari ukiwa tayari.',
  ctaSub: 'Kujisajili huchukua takriban dakika kumi, na maendeleo yako yanahifadhiwa kwenye simu yako.',
}

const COPY: Record<Lang, Copy> = { en, sw }

export default function ForLicenceHolders() {
  const lang = useDemo((s) => s.lang)
  const setLang = useDemo((s) => s.setLang)
  const c = COPY[lang]
  useDocumentTitle(c.metaTitle)
  const promiseIcons = [CreditCard, BadgeCheck, Eye, Users]
  const getIcons = [Stamp, FileText, UserCheck, MessageCircle]
  const protectIcons = [Globe, ScrollText, FileLock2, Lock]
  const startIcons = [Phone, IdCard, FileText, Smartphone]

  return (
    <div lang={lang}>
      <Hero
        top={
          <div role="radiogroup" aria-label="Language / Lugha" className="mb-6 flex w-fit rounded-full border border-white/20 bg-white/[0.06] p-1 text-micro font-semibold">
            {(['en', 'sw'] as const).map((l) => (
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={lang === l}
                lang={l}
                onClick={() => setLang(l)}
                className={cn('h-9 rounded-full px-4 transition-colors', lang === l ? 'bg-white text-[#0F1419]' : 'text-white/75 hover:text-white')}
              >
                {l === 'en' ? 'English' : 'Kiswahili'}
              </button>
            ))}
          </div>
        }
        eyebrow={c.eyebrow}
        title={c.title}
        sub={c.sub}
        actions={
          <>
            <HeroLink to="/owner/sign-up">{c.cta}</HeroLink>
            <HeroLink to="/owner/sign-in" variant="outline">
              {c.signIn}
            </HeroLink>
          </>
        }
        note={
          <p className="flex items-center gap-2">
            <Avatar id="kevin" size={24} />
            {c.help}
          </p>
        }
        aside={<SmsMock text={c.sms} />}
      />

      <Section labelledBy="promises-title">
        <SectionHeading id="promises-title" title={c.promisesTitle} />
        <IconGrid className="mt-8 lg:grid-cols-4" items={c.promises} icons={promiseIcons} />
      </Section>

      <Section tone="surface" labelledBy="get-title">
        <SectionHeading id="get-title" title={c.getTitle} sub={c.getSub} />
        <IconGrid className="mt-8 lg:grid-cols-4" items={c.get} icons={getIcons} />
      </Section>

      <Section labelledBy="steps-title">
        <SectionHeading id="steps-title" title={c.stepsTitle} />
        <ol className="mt-8 grid gap-3 md:grid-cols-5">
          {c.steps.map((s, i) => (
            <li key={s.title} className="flex gap-4 rounded-2xl border border-line bg-surface p-5 shadow-e1 md:flex-col md:gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-on-primary">{i + 1}</span>
              <span>
                <span className="block text-body font-semibold text-fg">{s.title}</span>
                <span className="mt-1 block text-meta text-muted">{s.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="surface" id="fees" labelledBy="fees-title">
        <SectionHeading id="fees-title" title={c.feesTitle} sub={c.feesSub} />
        <TierCards
          className="mt-8"
          lang={lang}
          cta={(t) => (
            <Link
              to="/owner/sign-up"
              viewTransition
              className={cn(
                'pressable flex h-12 w-full items-center justify-center rounded-xl text-[17px] font-semibold',
                t === 'standard' ? 'bg-primary text-on-primary' : 'border border-line-strong text-fg hover:bg-sunken',
              )}
            >
              {c.quote}
            </Link>
          )}
        />
        <p className="mt-6 flex items-start gap-2 rounded-xl border border-review-border bg-review-fill p-4 text-meta text-fg">
          <Lock className="mt-0.5 size-4 shrink-0 text-review" aria-hidden />
          {c.scam}
        </p>
      </Section>

      <Section labelledBy="protect-title">
        <SectionHeading id="protect-title" title={c.protectTitle} sub={c.protectSub} />
        <IconGrid className="mt-8 lg:grid-cols-4" items={c.protect} icons={protectIcons} />
      </Section>

      <Section tone="surface" labelledBy="start-title">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <SectionHeading id="start-title" title={c.startTitle} />
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {c.start.map((s, i) => {
                const Icon = startIcons[i]
                return (
                  <li key={s} className="flex items-center gap-3 rounded-xl border border-line bg-canvas p-4 dark:bg-raised">
                    <Icon className="size-5 shrink-0 text-primary" aria-hidden />
                    <span className="text-body text-fg">{s}</span>
                  </li>
                )
              })}
            </ul>
            <p className="mt-4 text-meta text-muted">{c.assist}</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-2xl border border-line bg-canvas p-5 dark:bg-raised">
              <Avatar id="kevin" size={56} />
              <div className="min-w-0">
                <p className="text-micro font-semibold uppercase tracking-wider text-muted">{c.contactLabel}</p>
                <p className="text-h3 font-semibold text-fg">Kevin Omondi</p>
                <p className="text-meta text-muted">SSD · WhatsApp +254 712 000 481</p>
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-canvas p-5 dark:bg-raised">
              <p className="text-h3 font-semibold text-fg">{c.repTitle}</p>
              <p className="mt-1 text-meta text-muted">{c.repBody}</p>
            </div>
          </div>
        </div>
      </Section>

      <Section labelledBy="faq-title">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <SectionHeading id="faq-title" title={c.faqTitle} />
          <Faq items={c.faq} />
        </div>
      </Section>

      <CtaBand title={c.ctaTitle} sub={c.ctaSub}>
        <HeroLink to="/owner/sign-up">{c.cta}</HeroLink>
      </CtaBand>
    </div>
  )
}

function IconGrid({ items, icons, className }: { items: Item[]; icons: typeof BadgeCheck[]; className?: string }) {
  return (
    <ul className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2', className)}>
      {items.map((it, i) => {
        const Icon = icons[i % icons.length]
        return (
          <li key={it.title} className="rounded-2xl border border-line bg-surface p-5 shadow-e1">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary-tint text-primary">
              <Icon className="size-5" aria-hidden />
            </span>
            <p className="mt-4 text-body font-semibold text-fg">{it.title}</p>
            <p className="mt-1 text-meta text-muted">{it.body}</p>
          </li>
        )
      })}
    </ul>
  )
}

/** The sign-up SMS as the owner sees it: the anti-scam promise is in the message itself. */
function SmsMock({ text }: { text: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[320px] rounded-[2.4rem] border-[7px] border-white/15 bg-[#11171d] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.5)] lg:mr-0">
      <div className="mx-auto h-1.5 w-16 rounded-full bg-white/15" aria-hidden />
      <div className="mt-5 flex items-center gap-3 border-b border-white/10 pb-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-[#B4532A] text-[13px] font-bold text-white">T</span>
        <span>
          <span className="block text-[14px] font-semibold text-white">TOUCHSTONE</span>
          <span className="block text-[11px] text-white/50">SMS · 09:30</span>
        </span>
      </div>
      <p className="mt-4 max-w-[92%] rounded-2xl rounded-tl-sm bg-white/10 px-3.5 py-2.5 text-[14px] leading-[20px] text-white/90">{text}</p>
      <div className="mt-6 grid grid-cols-6 gap-1.5" aria-hidden>
        {'482913'.split('').map((d, i) => (
          <span key={i} className="flex h-11 items-center justify-center rounded-lg border border-white/15 bg-white/5 font-mono text-[18px] font-semibold text-white">
            {d}
          </span>
        ))}
      </div>
      <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-white/45">
        <Lock className="size-3" aria-hidden /> Owner App · English / Kiswahili
      </p>
    </div>
  )
}
