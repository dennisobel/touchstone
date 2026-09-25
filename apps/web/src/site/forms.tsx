import { CircleCheck, FileUp, Mail, Phone, Send } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { useFakeRequest } from '@/lib/hooks'
import { person } from '@/data'
import { Avatar, Button, ButtonLink, Checkbox, Field, Input, RadioGroup, Segmented, Select, Textarea } from '@/ds/ui'

// Public-site forms. They collect contact details only: never anything about a specific asset or deal (L0).

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const COMMODITIES = ['Graphite', 'Gold', 'Copper', 'Rare earths', 'Lithium', 'Nickel', 'Heavy mineral sands', 'Gemstones', 'Other']

type Errors = Record<string, string | undefined>

function useForm(validate: () => Errors) {
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)
  const { pending, run } = useFakeRequest(1100)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.values(next).some(Boolean)) {
      const first = Object.keys(next).find((k) => next[k])
      if (first) document.getElementById(`f-${first}`)?.focus()
      return
    }
    void run(() => setSent(true))
  }
  return { errors, setErrors, sent, pending, submit }
}

function FormCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-2xl border border-line bg-surface p-5 shadow-e2 md:p-8', className)}>{children}</div>
}

function Sent({ title, children, contactId, action }: { title: string; children: ReactNode; contactId: string; action?: ReactNode }) {
  const p = person(contactId)
  return (
    <div role="status" className="animate-rise-in text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-verified-fill text-verified">
        <CircleCheck className="size-7" aria-hidden />
      </span>
      <p className="mt-4 text-h2 font-semibold text-fg">{title}</p>
      <div className="mx-auto mt-2 max-w-md text-body text-muted">{children}</div>
      <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1.5 text-meta text-fg">
        <Avatar id={contactId} size={24} /> {p.name} · {p.role}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

function ChipSelect({ options, value, onChange, label }: { options: string[]; value: string[]; onChange: (v: string[]) => void; label: string }) {
  return (
    <fieldset>
      <legend className="text-meta font-medium text-fg">
        {label} <span className="font-normal text-muted">(optional)</span>
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o)
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? value.filter((v) => v !== o) : [...value, o])}
              className={cn('pressable h-9 rounded-full border px-3.5 text-meta font-medium transition-colors', on ? 'border-primary bg-primary-tint text-primary' : 'border-line bg-surface text-fg hover:border-line-strong')}
            >
              {o}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

const firstName = (full: string) => full.trim().replace(/^(dr|mr|mrs|ms)\.?\s+/i, '').split(/\s+/)[0] ?? ''

/** "Talk to SSD": the only public route towards the Investor Portal. There is no investor sign-up. */
export function TalkToSsdForm({ className }: { className?: string }) {
  const [v, setV] = useState({ name: '', email: '', org: '', role: '', kind: 'strategic', note: '' })
  const [commodities, setCommodities] = useState<string[]>([])
  const [consent, setConsent] = useState(false)
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((s) => ({ ...s, [k]: e.target.value }))
  const { errors, sent, pending, submit } = useForm(() => ({
    name: v.name.trim() ? undefined : 'Enter your name.',
    email: EMAIL.test(v.email) ? undefined : 'Enter a work email, like name@company.com.',
    org: v.org.trim() ? undefined : 'Enter your organisation.',
    consent: consent ? undefined : 'Tick the box so SSD can reply to you.',
  }))

  if (sent)
    return (
      <FormCard className={className}>
        <Sent title={`Thank you, ${firstName(v.name)}.`} contactId="james" action={<ButtonLink to="/methodology" variant="secondary">Read the methodology</ButtonLink>}>
          James Whitfield's team will reply by email within two working days to arrange a call. Qualification follows that conversation; opportunities are never sent by email.
        </Sent>
      </FormCard>
    )

  return (
    <FormCard className={className}>
      <form noValidate onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name" error={errors.name}>
            {(p) => <Input {...p} id="f-name" autoComplete="name" value={v.name} onChange={set('name')} invalid={p.invalid} />}
          </Field>
          <Field label="Work email" error={errors.email}>
            {(p) => <Input {...p} id="f-email" type="email" autoComplete="email" value={v.email} onChange={set('email')} invalid={p.invalid} />}
          </Field>
          <Field label="Organisation" error={errors.org}>
            {(p) => <Input {...p} id="f-org" autoComplete="organization" value={v.org} onChange={set('org')} invalid={p.invalid} />}
          </Field>
          <Field label="Your role" optional>
            {(p) => <Input {...p} autoComplete="organization-title" value={v.role} onChange={set('role')} />}
          </Field>
        </div>
        <fieldset>
          <legend className="text-meta font-medium text-fg">Which describes you best?</legend>
          <RadioGroup
            name="kind"
            variant="cards"
            className="mt-2 sm:grid-cols-2"
            value={v.kind}
            onValueChange={(kind) => setV((s) => ({ ...s, kind }))}
            options={[
              { value: 'strategic', label: 'Strategic buyer or offtaker', description: 'Sourcing supply for your own products' },
              { value: 'fund', label: 'Mining fund or private equity', description: 'Investing through a fund' },
              { value: 'family', label: 'Family office', description: 'Investing family capital' },
              { value: 'adviser', label: 'Adviser to an investor', description: 'Consultant, lawyer or banker' },
            ]}
          />
        </fieldset>
        <ChipSelect label="Commodities of interest" options={COMMODITIES} value={commodities} onChange={setCommodities} />
        <Field label="Anything we should know before the call?" optional hint="Please don't include confidential deal information.">
          {(p) => <Textarea {...p} rows={3} value={v.note} onChange={set('note')} />}
        </Field>
        <div>
          <Checkbox
            id="f-consent"
            checked={consent}
            onCheckedChange={setConsent}
            label="SSD may contact me about this request"
            description="Handled under SSD's privacy notice. You can ask us to delete your details at any time."
          />
          {errors.consent && (
            <p role="alert" className="mt-1 text-meta font-medium text-critical">
              {errors.consent}
            </p>
          )}
        </div>
        <Button type="submit" size="lg" block loading={pending} icon={<Send />}>
          Send to SSD
        </Button>
        <p className="text-center text-micro text-muted">No sign-up and no listings: the Investor Portal is by invitation, after a conversation.</p>
      </form>
    </FormCard>
  )
}

/** Apply to join the verification network (becomes an Expert Desk invitation once credentials are checked). */
export function ExpertApplyForm({ className }: { className?: string }) {
  const [v, setV] = useState({ name: '', email: '', discipline: '', body: '', number: '', country: 'Kenya', years: '' })
  const [commodities, setCommodities] = useState<string[]>([])
  const [cv, setCv] = useState(false)
  const [consent, setConsent] = useState(false)
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((s) => ({ ...s, [k]: e.target.value }))
  const { errors, sent, pending, submit } = useForm(() => ({
    name: v.name.trim() ? undefined : 'Enter your name.',
    email: EMAIL.test(v.email) ? undefined : 'Enter an email address, like name@example.com.',
    discipline: v.discipline ? undefined : 'Choose your discipline.',
    body: v.body.trim() ? undefined : 'Enter the professional body you are registered with.',
    number: v.number.trim() ? undefined : 'Enter your membership or registration number.',
    consent: consent ? undefined : 'Tick the box so SSD can check your registration.',
  }))

  if (sent)
    return (
      <FormCard className={className}>
        <Sent title="Application received" contactId="kevin">
          SSD checks your registration on the public register, usually within five working days. Once it's confirmed, you'll receive an invitation to the Expert Desk by email.
        </Sent>
      </FormCard>
    )

  return (
    <FormCard className={className}>
      <form noValidate onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name" error={errors.name}>
            {(p) => <Input {...p} id="f-name" autoComplete="name" value={v.name} onChange={set('name')} invalid={p.invalid} />}
          </Field>
          <Field label="Email" error={errors.email}>
            {(p) => <Input {...p} id="f-email" type="email" autoComplete="email" value={v.email} onChange={set('email')} invalid={p.invalid} />}
          </Field>
          <Field label="Discipline" error={errors.discipline}>
            {(p) => (
              <Select {...p} id="f-discipline" value={v.discipline} onChange={set('discipline')} invalid={p.invalid}>
                <option value="">Choose…</option>
                <option>Resource geologist (Qualified Person)</option>
                <option>Mining lawyer</option>
                <option>ESG and community specialist</option>
                <option>Field geologist or site verifier</option>
                <option>Technical or infrastructure engineer</option>
              </Select>
            )}
          </Field>
          <Field label="Based in">
            {(p) => (
              <Select {...p} value={v.country} onChange={set('country')}>
                {['Kenya', 'Tanzania', 'Uganda', 'Zambia', 'South Africa', 'Other'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Professional body" error={errors.body} hint="For example SACNASP, AusIMM, Law Society of Kenya, NEMA">
            {(p) => <Input {...p} id="f-body" value={v.body} onChange={set('body')} invalid={p.invalid} />}
          </Field>
          <Field label="Membership or registration number" error={errors.number}>
            {(p) => <Input {...p} id="f-number" value={v.number} onChange={set('number')} className="font-mono" invalid={p.invalid} />}
          </Field>
          <Field label="Years of relevant experience" optional>
            {(p) => <Input {...p} inputMode="numeric" value={v.years} onChange={(e) => setV((s) => ({ ...s, years: e.target.value.replace(/\D/g, '').slice(0, 2) }))} />}
          </Field>
          <div className="flex items-end">
            <Button variant="secondary" block icon={cv ? <CircleCheck /> : <FileUp />} onClick={() => setCv((x) => !x)} className={cn(cv && 'border-verified-border text-verified')}>
              {cv ? 'CV attached · cv-2026.pdf' : 'Attach your CV (PDF)'}
            </Button>
          </div>
        </div>
        <ChipSelect label="Commodities you have worked on" options={COMMODITIES} value={commodities} onChange={setCommodities} />
        <div>
          <Checkbox
            id="f-consent"
            checked={consent}
            onCheckedChange={setConsent}
            label="SSD may check my registration on public registers"
            description="And contact me about joining the network. Conflicts of interest are declared per assignment, later."
          />
          {errors.consent && (
            <p role="alert" className="mt-1 text-meta font-medium text-critical">
              {errors.consent}
            </p>
          )}
        </div>
        <Button type="submit" size="lg" block loading={pending} icon={<Send />}>
          Send my application
        </Button>
      </form>
    </FormCard>
  )
}

/** Owners who would rather talk first: a call back from their named contact. */
export function CallbackForm({ className }: { className?: string }) {
  const [v, setV] = useState({ name: '', phone: '', county: '', time: 'morning' })
  const [lang, setLang] = useState<'en' | 'sw'>('en')
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((s) => ({ ...s, [k]: e.target.value }))
  const { errors, sent, pending, submit } = useForm(() => ({
    name: v.name.trim() ? undefined : 'Enter your name.',
    phone: v.phone.replace(/\D/g, '').length >= 9 ? undefined : 'Enter your phone number, like 712 345 678.',
  }))

  if (sent)
    return (
      <FormCard className={className}>
        <Sent title="We'll call you" contactId="kevin">
          Kevin Omondi will call you within one working day, in {lang === 'sw' ? 'Swahili' : 'English'}. SSD will never ask you for money by phone.
        </Sent>
      </FormCard>
    )

  return (
    <FormCard className={className}>
      <form noValidate onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Your name" error={errors.name}>
            {(p) => <Input {...p} id="f-name" autoComplete="name" value={v.name} onChange={set('name')} invalid={p.invalid} />}
          </Field>
          <Field label="Phone number" error={errors.phone}>
            {(p) => (
              <Input
                {...p}
                id="f-phone"
                type="tel"
                autoComplete="tel-national"
                inputMode="tel"
                value={v.phone}
                onChange={set('phone')}
                invalid={p.invalid}
                leading={<span className="text-meta font-medium text-muted">+254</span>}
                className="[&_input]:pl-14"
              />
            )}
          </Field>
          <Field label="County" optional>
            {(p) => (
              <Select {...p} value={v.county} onChange={set('county')}>
                <option value="">Choose…</option>
                {['Migori', 'Kakamega', 'Taita Taveta', 'Kwale', 'Kilifi', 'Kitui', 'Turkana', 'Other'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            )}
          </Field>
          <div className="space-y-1.5">
            <p className="text-meta font-medium text-fg">Language</p>
            <Segmented
              ariaLabel="Language"
              value={lang}
              onChange={setLang}
              block
              options={[
                { value: 'en', label: 'English' },
                { value: 'sw', label: 'Kiswahili' },
              ]}
            />
          </div>
        </div>
        <fieldset>
          <legend className="text-meta font-medium text-fg">Best time to call</legend>
          <Segmented
            ariaLabel="Best time to call"
            className="mt-2"
            value={v.time}
            onChange={(time) => setV((s) => ({ ...s, time }))}
            options={[
              { value: 'morning', label: 'Morning' },
              { value: 'afternoon', label: 'Afternoon' },
              { value: 'evening', label: 'Evening' },
            ]}
          />
        </fieldset>
        <Button type="submit" size="lg" block loading={pending} icon={<Phone />}>
          Request a call
        </Button>
      </form>
    </FormCard>
  )
}

/** General enquiries (press, partners, privacy, staff access). */
export function GeneralForm({ topic, className }: { topic: 'press' | 'privacy' | 'staff' | 'other'; className?: string }) {
  const contact = topic === 'staff' ? 'aisha' : topic === 'privacy' ? 'sarah' : 'james'
  const [v, setV] = useState({ name: '', email: '', org: '', message: '' })
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((s) => ({ ...s, [k]: e.target.value }))
  const { errors, sent, pending, submit } = useForm(() => ({
    name: v.name.trim() ? undefined : 'Enter your name.',
    email: EMAIL.test(v.email) ? undefined : topic === 'staff' ? 'Enter your SSD email address.' : 'Enter an email address, like name@example.com.',
    message: v.message.trim().length >= 10 ? undefined : 'Tell us a little more, in a sentence or two.',
  }))
  const copy = {
    press: { org: 'Publication or organisation', message: 'How can we help?', sent: 'A named person at SSD replies within two working days.' },
    privacy: { org: 'Organisation', message: 'Your request', sent: 'Sarah Mitchell, SSD compliance, replies within the time the Data Protection Act allows, usually much sooner.' },
    staff: { org: 'Team and manager', message: 'Which role do you need, and why?', sent: 'Aisha Hassan, Platform operations, reviews every access request. Roles are granted per person and reviewed every quarter.' },
    other: { org: 'Organisation', message: 'How can we help?', sent: 'A named person at SSD replies within two working days.' },
  }[topic]

  if (sent)
    return (
      <FormCard className={className}>
        <Sent title="Message sent" contactId={contact}>
          {copy.sent}
        </Sent>
      </FormCard>
    )

  return (
    <FormCard className={className}>
      <form noValidate onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name" error={errors.name}>
            {(p) => <Input {...p} id="f-name" autoComplete="name" value={v.name} onChange={set('name')} invalid={p.invalid} />}
          </Field>
          <Field label={topic === 'staff' ? 'SSD email' : 'Email'} error={errors.email}>
            {(p) => <Input {...p} id="f-email" type="email" autoComplete="email" value={v.email} onChange={set('email')} invalid={p.invalid} leading={<Mail />} />}
          </Field>
        </div>
        <Field label={copy.org} optional>
          {(p) => <Input {...p} value={v.org} onChange={set('org')} />}
        </Field>
        <Field label={copy.message} error={errors.message} hint="Please don't include confidential documents.">
          {(p) => <Textarea {...p} id="f-message" rows={4} value={v.message} onChange={set('message')} invalid={p.invalid} />}
        </Field>
        <Button type="submit" size="lg" block loading={pending} icon={<Send />}>
          Send
        </Button>
      </form>
    </FormCard>
  )
}
