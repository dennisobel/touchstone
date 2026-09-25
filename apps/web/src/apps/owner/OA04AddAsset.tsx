import { Camera, Check, CircleCheck, CloudOff, FileUp, Info, MapPinned, PencilLine, Search, TriangleAlert, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { cn } from '@/lib/cn'
import { useDemoState } from '@/lib/demo-states'
import { fmtDate, fmtDateTime } from '@/lib/format'
import { asset, type LngLat } from '@/data'
import { Banner, ConsentCapture, MapPanel } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Button, Chip, Field, Input, Progress, RadioGroup, Sheet, Stepper, Textarea, toast } from '@/ds/ui'
import { ContactCard } from './common'
import { useT, type OwnerKey } from './i18n'

const STATES = [
  { id: 'default', label: 'Step 1 · Licence found' },
  { id: 'not_found', label: 'Step 1 · Ministry unreachable' },
  { id: 'docs', label: 'Step 2 · Documents' },
  { id: 'offline', label: 'Step 2 · Offline mid-upload' },
  { id: 'decl', label: 'Step 3 · Declarations' },
  { id: 'validation', label: 'Step 3 · Validation errors' },
  { id: 'duplicate', label: 'Duplicate licence' },
  { id: 'submitted', label: 'Submitted' },
] as const

type DocState = { status: 'empty' | 'uploading' | 'paused' | 'done' | 'blurry' | 'missing'; progress: number; reason?: string }
const DOCS: { id: string; key: OwnerKey; why: OwnerKey; need: 'required' | 'optional' | 'where' }[] = [
  { id: 'licence', key: 'doc.licence', why: 'doc.licence_why', need: 'required' },
  { id: 'company', key: 'doc.company', why: 'doc.company_why', need: 'required' },
  { id: 'ids', key: 'doc.ids', why: 'doc.ids_why', need: 'required' },
  { id: 'env', key: 'doc.env', why: 'doc.env_why', need: 'where' },
  { id: 'survey', key: 'doc.survey', why: 'doc.survey_why', need: 'optional' },
  { id: 'reports', key: 'doc.reports', why: 'doc.reports_why', need: 'optional' },
]

export default function OA04AddAsset() {
  const { t, lang } = useT()
  const navigate = useNavigate()
  const [demo] = useDemoState('OA-04', STATES)
  const nyanza = asset('nyanza')
  const [step, setStep] = useState(0)
  const [number, setNumber] = useState('MP/2023/0442')
  const [looked, setLooked] = useState(false)
  const [looking, setLooking] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [adjust, setAdjust] = useState(false)
  const [corners, setCorners] = useState<LngLat[]>(nyanza.claimed.slice(0, -1))
  const [wrongOpen, setWrongOpen] = useState(false)
  const [docs, setDocs] = useState<Record<string, DocState>>(() => Object.fromEntries(DOCS.map((d) => [d.id, { status: 'empty', progress: 0 }])))
  const [owner, setOwner] = useState<'' | 'me' | 'company' | 'represent'>('')
  const [conflict, setConflict] = useState<'' | 'no' | 'yes' | 'not_sure'>('')
  const [consent, setConsent] = useState(false)
  const [visibility, setVisibility] = useState<'private' | 'anonymous' | 'named'>('anonymous')
  const [showErrors, setShowErrors] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [duplicate, setDuplicate] = useState(false)
  const offline = demo === 'offline'

  useEffect(() => {
    setShowErrors(false)
    setSubmitted(demo === 'submitted')
    setDuplicate(demo === 'duplicate')
    if (demo === 'default') {
      setStep(0)
      setLooked(true)
      setNotFound(false)
    }
    if (demo === 'not_found') {
      setStep(0)
      setLooked(false)
      setNotFound(true)
    }
    if (demo === 'docs' || demo === 'offline') {
      setStep(1)
      setDocs((d) => ({
        ...d,
        licence: { status: 'blurry', progress: 100 },
        company: { status: 'done', progress: 100 },
        ids: demo === 'offline' ? { status: 'paused', progress: 46 } : { status: 'uploading', progress: 62 },
      }))
    }
    if (demo === 'decl' || demo === 'validation') setStep(2)
    if (demo === 'validation') setShowErrors(true)
  }, [demo])

  // Simulated resumable uploads.
  const timers = useRef<Record<string, number>>({})
  useEffect(() => {
    for (const [id, d] of Object.entries(docs)) {
      if (d.status === 'uploading' && !timers.current[id] && !offline) {
        timers.current[id] = window.setInterval(() => {
          setDocs((all) => {
            const cur = all[id]
            if (cur.status !== 'uploading') return all
            const p = Math.min(100, cur.progress + 9 + Math.random() * 12)
            return { ...all, [id]: { ...cur, progress: p, status: p >= 100 ? 'done' : 'uploading' } }
          })
        }, 260)
      }
      if (d.status !== 'uploading' && timers.current[id]) {
        window.clearInterval(timers.current[id])
        delete timers.current[id]
      }
    }
  }, [docs, offline])
  useEffect(() => () => Object.values(timers.current).forEach((x) => window.clearInterval(x)), [])

  const lookup = () => {
    setLooking(true)
    window.setTimeout(() => {
      setLooking(false)
      if (number.trim().toUpperCase() === 'MP/2023/0442') {
        setLooked(true)
        setNotFound(false)
      } else {
        setNotFound(true)
        setLooked(false)
      }
    }, 900)
  }

  const requiredIds = DOCS.filter((d) => d.need === 'required').map((d) => d.id)
  const requiredDone = requiredIds.filter((id) => docs[id].status === 'done' || docs[id].status === 'missing').length
  const savedLabel = offline ? t('common.saved_phone') : t('common.saved_ssd')

  const submit = () => {
    if (!owner || !conflict || !consent) {
      setShowErrors(true)
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <Page title={t('add.title')} focus hideHeaderOnDesktop contentClassName="max-w-lg">
        <div className="flex flex-col items-center py-8 text-center animate-rise-in">
          <span className="flex size-16 items-center justify-center rounded-full bg-verified-fill text-verified">
            <CircleCheck className="size-8" aria-hidden />
          </span>
          <h1 className="mt-5 text-h1 font-semibold">{t('decl.submitted_title')}</h1>
          <p className="mt-2 max-w-sm text-body text-muted">{t('decl.submitted_body', { name: 'Kevin Omondi' })}</p>
        </div>
        <ContactCard />
        <div className="mt-6 space-y-2">
          <Button size="xl" block onClick={() => navigate('/owner/assets/nyanza/pay', { viewTransition: true })}>
            {t('decl.see_quote')}
          </Button>
          <Button size="lg" block variant="ghost" onClick={() => navigate('/owner', { viewTransition: true })}>
            {t('tab.home')}
          </Button>
        </div>
      </Page>
    )
  }

  const footer = (
    <div className="flex gap-2">
      {step > 0 && (
        <Button size="lg" variant="secondary" onClick={() => setStep((s) => s - 1)}>
          {t('common.back')}
        </Button>
      )}
      {step === 0 && (looked || notFound) && (
        <Button size="lg" className="flex-1" onClick={() => setStep(1)} icon={looked ? <Check /> : undefined}>
          {looked ? t('lic.is_mine') : t('common.continue')}
        </Button>
      )}
      {step === 1 && (
        <Button size="lg" className="flex-1" onClick={() => setStep(2)}>
          {t('common.continue')}
        </Button>
      )}
      {step === 2 && (
        <Button size="lg" className="flex-1" onClick={submit}>
          {t('decl.submit')}
        </Button>
      )}
    </div>
  )

  return (
    <Page
      title={t('add.title')}
      focus
      onBack={() => (step > 0 ? setStep(step - 1) : navigate('/owner', { viewTransition: true }))}
      mobileActions={
        <button
          type="button"
          onClick={() => {
            toast(savedLabel)
            navigate('/owner', { viewTransition: true })
          }}
          className="h-9 rounded-full px-3 text-micro font-semibold text-primary"
        >
          {t('common.save_exit')}
        </button>
      }
      actions={
        <Button
          variant="secondary"
          onClick={() => {
            toast(savedLabel)
            navigate('/owner', { viewTransition: true })
          }}
        >
          {t('common.save_exit')}
        </Button>
      }
      footer={step === 0 && !looked && !notFound ? undefined : footer}
    >
      <div className="space-y-4">
        <Stepper steps={[t('add.step_licence'), t('add.step_docs'), t('add.step_decl')]} current={step} />
        <p className="flex items-center gap-1.5 text-micro text-muted">
          {offline ? <CloudOff className="size-3.5" aria-hidden /> : <Check className="size-3.5 text-verified" aria-hidden />}
          {savedLabel}
        </p>
        {duplicate && (
          <Banner tone="info" icon={<Info />} title={t('decl.duplicate')}>
            Kevin Omondi · SSD Nairobi
          </Banner>
        )}

        {/* ---------------- Step 1 · OA-04 ---------------- */}
        {step === 0 && (
          <div className="space-y-4 animate-fade-in">
            <Field label={t('lic.number')} hint={t('lic.hint')}>
              {(p) => (
                <div className="flex gap-2">
                  <Input {...p} value={number} onChange={(e) => setNumber(e.target.value)} className="font-mono uppercase" autoCapitalize="characters" />
                  <Button onClick={lookup} loading={looking} icon={<Search />} variant="secondary">
                    {t('lic.lookup')}
                  </Button>
                </div>
              )}
            </Field>

            {notFound && (
              <Banner tone="warning" icon={<TriangleAlert />} title={t('lic.not_found')}>
                Kevin Omondi · SSD Nairobi
              </Banner>
            )}

            {looked && (
              <>
                <div className="rounded-lg border border-line bg-surface p-4 shadow-e1 animate-rise-in">
                  <p className="flex items-center gap-1.5 text-micro font-semibold uppercase tracking-wide text-muted">
                    <MapPinned className="size-3.5" aria-hidden />
                    {t('lic.from_cadastre')}
                  </p>
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-meta">
                    <div>
                      <dt className="text-muted">{t('lic.holder')}</dt>
                      <dd className="font-semibold">{nyanza.licence.holder}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">{t('lic.type')}</dt>
                      <dd className="font-semibold">{nyanza.licence.type}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">{t('lic.status')}</dt>
                      <dd>
                        <Chip tone="verified">{t('lic.active')}</Chip>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted">{t('lic.expiry')}</dt>
                      <dd className="font-semibold">{fmtDate(nyanza.licence.expires, lang)}</dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-micro text-muted">{t('lic.retrieved', { time: fmtDateTime(nyanza.licence.retrievedAt, 'EAT', lang) })}</p>
                </div>

                <MapPanel asset={nyanza} className="h-72 md:h-80" adjust={adjust} onClaimedChange={setCorners} layers={{ imagery: true, otherLicences: false }} />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-meta text-muted">{adjust ? t('lic.adjust_hint') : t('lic.confirm_map')}</p>
                  <Button variant={adjust ? 'primary' : 'secondary'} icon={<PencilLine />} onClick={() => setAdjust((a) => !a)}>
                    {adjust ? t('lic.adjust_done') : t('lic.adjust')}
                  </Button>
                </div>
                {adjust && (
                  <div className="rounded-lg border border-line bg-surface p-3">
                    <p className="mb-2 text-micro font-semibold uppercase tracking-wide text-muted">{t('lic.corners')}</p>
                    <ol className="grid grid-cols-2 gap-1.5 font-mono text-[12px]">
                      {corners.map((c, i) => (
                        <li key={i} className="rounded-sm bg-sunken px-2 py-1">
                          {i + 1}. {c[1].toFixed(5)}, {c[0].toFixed(5)}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                <Button variant="ghost" block onClick={() => setWrongOpen(true)}>
                  {t('lic.wrong')}
                </Button>
              </>
            )}
          </div>
        )}

        {/* ---------------- Step 2 · OA-05 ---------------- */}
        {step === 1 && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-end justify-between gap-2">
              <h2 className="text-h2 font-semibold">{t('docs.checklist_for', { what: 'Prospecting licence · gold · exploration' })}</h2>
            </div>
            <div className="space-y-1.5">
              <Progress value={(requiredDone / requiredIds.length) * 100} tone="verified" label={t('docs.progress', { done: requiredDone, total: requiredIds.length })} />
              <p className="text-meta text-muted">{t('docs.progress', { done: requiredDone, total: requiredIds.length })}</p>
            </div>
            {offline && (
              <Banner tone="offline" icon={<CloudOff />} title={t('common.offline_title')}>
                {t('docs.paused')}
              </Banner>
            )}
            <ul className="space-y-3">
              {DOCS.map((d) => (
                <DocItem
                  key={d.id}
                  title={t(d.key)}
                  why={t(d.why)}
                  need={d.need}
                  state={docs[d.id]}
                  onChange={(s) => setDocs((all) => ({ ...all, [d.id]: s }))}
                />
              ))}
            </ul>
          </div>
        )}

        {/* ---------------- Step 3 · OA-06 ---------------- */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <fieldset>
              <legend className="mb-2 text-h3 font-semibold">{t('decl.who_owns')}</legend>
              <RadioGroup
                name="owner"
                variant="cards"
                value={owner}
                onValueChange={setOwner}
                options={[
                  { value: 'me', label: t('decl.me') },
                  { value: 'company', label: t('decl.company') },
                  { value: 'represent', label: t('decl.represent'), description: t('decl.mandate_hint') },
                ]}
              />
              {showErrors && !owner && (
                <p role="alert" className="mt-1.5 text-meta font-medium text-critical">
                  {t('decl.answer_error')}
                </p>
              )}
              {owner === 'represent' && (
                <Button variant="secondary" block className="mt-2" icon={<FileUp />} onClick={() => toast('Mandate uploaded (demo)')}>
                  {t('decl.mandate')}
                </Button>
              )}
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-h3 font-semibold">{t('decl.conflicts')}</legend>
              <RadioGroup
                name="conflict"
                value={conflict}
                onValueChange={setConflict}
                options={[
                  { value: 'no', label: t('decl.no') },
                  { value: 'yes', label: t('decl.yes') },
                  { value: 'not_sure', label: t('decl.not_sure') },
                ]}
              />
              {showErrors && !conflict && (
                <p role="alert" className="mt-1.5 text-meta font-medium text-critical">
                  {t('decl.answer_error')}
                </p>
              )}
            </fieldset>

            <div>
              <ConsentCapture
                title={t('decl.consent_title')}
                version="v2.1"
                text={
                  <>
                    {t('decl.consent_text')}{' '}
                    <a href="#consent" onClick={(e) => (e.preventDefault(), toast('Full consent text v2.1 (demo)'))} className="font-medium text-primary underline">
                      v2.1
                    </a>
                  </>
                }
                consented={consent}
                onChange={setConsent}
                agreeLabel={t('decl.consent_agree')}
                withdrawLabel={t('acct.withdraw')}
              />
              {showErrors && !consent && (
                <p role="alert" className="mt-1.5 text-meta font-medium text-critical">
                  {t('decl.consent_error')}
                </p>
              )}
            </div>

            <fieldset>
              <legend className="mb-2 text-h3 font-semibold">{t('decl.visibility')}</legend>
              <RadioGroup
                name="visibility"
                variant="cards"
                value={visibility}
                onValueChange={setVisibility}
                options={[
                  { value: 'private', label: t('decl.private'), description: t('decl.private_desc') },
                  { value: 'anonymous', label: t('decl.anonymous'), description: t('decl.anonymous_desc') },
                  { value: 'named', label: t('decl.named'), description: t('decl.named_desc') },
                ]}
              />
            </fieldset>

            <section className="rounded-lg border border-line bg-surface p-4">
              <h3 className="text-h3 font-semibold">{t('decl.review')}</h3>
              <dl className="mt-2 space-y-2 text-meta">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{t('lic.number')}</dt>
                  <dd className="font-mono">{number}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{t('add.step_docs')}</dt>
                  <dd>{t('docs.progress', { done: requiredDone, total: requiredIds.length })}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{t('decl.visibility')}</dt>
                  <dd className="text-right">{t(`decl.${visibility}` as OwnerKey)}</dd>
                </div>
              </dl>
            </section>
          </div>
        )}
      </div>

      <Sheet open={wrongOpen} onOpenChange={setWrongOpen} title={t('lic.wrong_title')}>
        <div className="space-y-2">
          {(['lic.wrong_holder', 'lic.wrong_boundary', 'lic.wrong_other'] as const).map((k) => (
            <Button
              key={k}
              variant="secondary"
              block
              size="lg"
              className="justify-start"
              onClick={() => {
                setWrongOpen(false)
                if (k === 'lic.wrong_boundary') setAdjust(true)
                toast(t('lic.wrong_note'))
              }}
            >
              {t(k)}
            </Button>
          ))}
          <p className="pt-2 text-meta text-muted">{t('lic.wrong_note')}</p>
        </div>
      </Sheet>
    </Page>
  )
}

function DocItem({ title, why, need, state, onChange }: { title: string; why: string; need: 'required' | 'optional' | 'where'; state: DocState; onChange: (s: DocState) => void }) {
  const { t } = useT()
  const [reasonOpen, setReasonOpen] = useState(false)
  const [reason, setReason] = useState('')
  const done = state.status === 'done'
  return (
    <li className={cn('rounded-lg border bg-surface p-4 shadow-e1', done ? 'border-verified-border' : 'border-line')}>
      <div className="flex items-start gap-3">
        <span className={cn('mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full', done ? 'bg-verified text-white dark:text-[#0f1419]' : 'bg-sunken text-muted')}>
          {done ? <Check className="size-4" strokeWidth={3} aria-hidden /> : <Upload className="size-3.5" aria-hidden />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-body font-semibold">{title}</p>
            <Chip tone={need === 'required' ? 'primary' : 'outline'} size="sm">
              {need === 'required' ? t('docs.required') : need === 'where' ? t('docs.required_where') : t('docs.optional')}
            </Chip>
          </div>
          <p className="mt-0.5 text-meta text-muted">
            <span className="font-medium text-fg">{t('docs.why')}: </span>
            {why}
          </p>
        </div>
      </div>

      {(state.status === 'uploading' || state.status === 'paused') && (
        <div className="mt-3 space-y-1">
          <Progress value={state.progress} tone={state.status === 'paused' ? 'muted' : 'primary'} label={title} />
          <p className={cn('text-micro', state.status === 'paused' ? 'text-muted' : 'text-primary')}>
            {state.status === 'paused' ? t('docs.paused') : t('docs.uploading', { pct: Math.round(state.progress) })}
          </p>
        </div>
      )}
      {state.status === 'blurry' && (
        <div role="alert" className="mt-3 flex items-start gap-2 rounded-sm border border-review-border bg-review-fill p-2.5 text-meta">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-review" aria-hidden />
          {t('docs.blur')}
        </div>
      )}
      {state.status === 'missing' && <p className="mt-3 text-meta text-muted">{t('docs.marked_missing')}{state.reason ? `: ${state.reason}` : ''}</p>}

      {state.status !== 'done' && state.status !== 'uploading' && state.status !== 'paused' && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="secondary" icon={<Camera />} onClick={() => onChange({ status: 'uploading', progress: 4 })}>
            {state.status === 'blurry' ? t('id.retake') : t('docs.take_photo')}
          </Button>
          <Button variant="secondary" icon={<FileUp />} onClick={() => onChange({ status: 'uploading', progress: 4 })}>
            {t('docs.upload')}
          </Button>
        </div>
      )}
      {state.status === 'empty' && (
        <>
          <button type="button" className="mt-2 min-h-target text-meta font-medium text-primary" onClick={() => setReasonOpen((o) => !o)}>
            {t('docs.dont_have')}
          </button>
          {reasonOpen && (
            <div className="mt-1 space-y-2">
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t('docs.reason')} aria-label={t('docs.reason')} />
              <Button size="sm" variant="tint" onClick={() => onChange({ status: 'missing', progress: 0, reason })}>
                {t('common.done')}
              </Button>
            </div>
          )}
        </>
      )}
      {done && <p className="mt-2 text-micro text-verified">{t('common.saved_ssd')}</p>}
    </li>
  )
}
