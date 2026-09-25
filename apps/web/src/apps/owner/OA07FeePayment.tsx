import { CircleCheck, CreditCard, Loader2, ShieldCheck, Smartphone, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { cn } from '@/lib/cn'
import { useDemoState } from '@/lib/demo-states'
import { fmtDateTime, money } from '@/lib/format'
import { asset } from '@/data'
import { TierBadge } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Button, Field, Input, Segmented, Sheet } from '@/ds/ui'
import { useT, type OwnerKey } from './i18n'

const STATES = [
  { id: 'default', label: 'Choose and pay' },
  { id: 'pending', label: 'Payment pending' },
  { id: 'failed', label: 'Payment failed' },
  { id: 'confirmed', label: 'Confirmed (receipt)' },
] as const

const TIERS = [
  { id: 'desk', key: 'fee.desk', desc: 'fee.desk_desc', kes: 38000 },
  { id: 'standard', key: 'fee.standard', desc: 'fee.standard_desc', kes: 145000 },
  { id: 'investor_ready', key: 'fee.investor', desc: 'fee.investor_desc', kes: 385000 },
] as const

export default function OA07FeePayment() {
  const { t } = useT()
  const navigate = useNavigate()
  const { id = 'nyanza' } = useParams()
  const a = asset(id)
  const [demo] = useDemoState('OA-07', STATES)
  const [tier, setTier] = useState<(typeof TIERS)[number]['id']>('standard')
  const [method, setMethod] = useState<'mpesa' | 'card'>('mpesa')
  const [phone, setPhone] = useState('712 000 227')
  const [phase, setPhase] = useState<'idle' | 'pending' | 'failed' | 'confirmed'>('idle')
  const [refundOpen, setRefundOpen] = useState(false)
  const chosen = TIERS.find((x) => x.id === tier)!
  const amount = money('KES', chosen.kes)

  useEffect(() => setPhase(demo === 'default' ? 'idle' : demo), [demo])

  const pay = () => {
    setPhase('pending')
    window.setTimeout(() => setPhase('confirmed'), 2600)
  }

  if (phase === 'confirmed') {
    return (
      <Page title={t('fee.confirmed')} focus hideHeaderOnDesktop contentClassName="max-w-lg">
        <div className="flex flex-col items-center py-6 text-center animate-rise-in">
          <span className="flex size-16 items-center justify-center rounded-full bg-verified-fill text-verified">
            <CircleCheck className="size-8" aria-hidden />
          </span>
          <h1 className="mt-4 text-h1 font-semibold">{t('fee.confirmed')}</h1>
          <p className="mt-1 text-[28px] font-semibold tabular-nums">{amount}</p>
        </div>
        <dl className="divide-y divide-line rounded-lg border border-line bg-surface text-meta">
          {[
            [t('fee.reference'), <span className="font-mono">SKD7H2K9QX</span>],
            [t(chosen.key), <TierBadge tier={chosen.id} size="sm" />],
            [a.name, a.licence.number],
            ['M-Pesa', `+254 ${phone}`],
            ['', fmtDateTime('2026-09-24T09:42')],
          ].map(([k, v], i) => (
            <div key={i} className="flex items-center justify-between gap-3 px-4 py-3">
              <dt className="text-muted">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <section className="mt-6">
          <h2 className="text-h3 font-semibold">{t('fee.next')}</h2>
          <ol className="mt-3 space-y-3">
            {(['fee.next1', 'fee.next2', 'fee.next3'] as const).map((k, i) => (
              <li key={k} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-tint text-micro font-semibold text-primary">{i + 1}</span>
                <span className="text-body">{t(k)}</span>
              </li>
            ))}
          </ol>
        </section>
        <Button size="xl" block className="mt-8" onClick={() => navigate(`/owner/assets/${a.id}`, { viewTransition: true })}>
          {t('fee.go_status')}
        </Button>
      </Page>
    )
  }

  return (
    <Page
      title={t('fee.title')}
      back={`/owner/assets/${a.id}`}
      focus
      footer={
        <Button size="xl" block onClick={pay} disabled={phase === 'pending'}>
          {t('fee.pay', { amount })}
        </Button>
      }
    >
      <p className="-mt-1 mb-4 text-meta text-muted md:hidden">
        {a.name} · {a.licence.number}
      </p>
      <div className="mb-4 flex items-start gap-3 rounded-lg border border-verified-border bg-verified-fill p-4">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-verified" aria-hidden />
        <div>
          <p className="text-body font-semibold">{t('fee.fixed')}</p>
          <button type="button" onClick={() => setRefundOpen(true)} className="mt-0.5 text-meta font-medium text-primary underline underline-offset-2">
            {t('fee.refund')}
          </button>
        </div>
      </div>

      <div role="radiogroup" aria-label={t('fee.title')} className="space-y-3">
        {TIERS.map((x) => {
          const active = x.id === tier
          return (
            <button
              key={x.id}
              role="radio"
              aria-checked={active}
              onClick={() => setTier(x.id)}
              className={cn('pressable relative block w-full rounded-lg border bg-surface p-4 text-left shadow-e1 transition-colors', active ? 'border-primary ring-2 ring-primary/30' : 'border-line')}
            >
              {x.id === 'standard' && <span className="absolute -top-2.5 right-3 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-on-primary">{t('fee.recommended')}</span>}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className={cn('flex size-5 shrink-0 items-center justify-center rounded-full border-2', active ? 'border-primary' : 'border-line-strong')}>
                    {active && <span className="size-2.5 rounded-full bg-primary" />}
                  </span>
                  <span className="text-h3 font-semibold">{t(x.key as OwnerKey)}</span>
                </div>
                <span className="text-body font-semibold tabular-nums">{money('KES', x.kes)}</span>
              </div>
              <p className="mt-2 pl-7.5 text-meta text-muted">{t(x.desc as OwnerKey)}</p>
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-micro text-muted">{t('fee.placeholder')}</p>

      <h2 className="mt-6 mb-2 text-h3 font-semibold">{t('fee.pay_with')}</h2>
      <Segmented
        ariaLabel={t('fee.pay_with')}
        value={method}
        onChange={setMethod}
        block
        options={[
          { value: 'mpesa', label: t('fee.mpesa'), icon: <Smartphone /> },
          { value: 'card', label: t('fee.card'), icon: <CreditCard /> },
        ]}
      />
      <div className="mt-4">
        {method === 'mpesa' ? (
          <Field label={t('fee.mpesa_phone')}>
            {(p) => (
              <div className="flex gap-2">
                <span className="inline-flex h-ctl items-center rounded-sm border border-line-strong bg-sunken px-3 font-mono">+254</span>
                <Input {...p} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" className="font-mono" />
              </div>
            )}
          </Field>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('fee.card_number')} className="col-span-2">
              {(p) => <Input {...p} inputMode="numeric" placeholder="4242 4242 4242 4242" autoComplete="cc-number" className="font-mono" />}
            </Field>
            <Field label={t('fee.card_expiry')}>{(p) => <Input {...p} placeholder="MM/YY" autoComplete="cc-exp" className="font-mono" />}</Field>
            <Field label={t('fee.card_cvc')}>{(p) => <Input {...p} placeholder="123" inputMode="numeric" autoComplete="cc-csc" className="font-mono" />}</Field>
          </div>
        )}
      </div>

      {phase === 'failed' && (
        <div role="alert" className="mt-4 flex items-start gap-3 rounded-lg border border-critical-border bg-critical-fill p-4">
          <XCircle className="mt-0.5 size-5 shrink-0 text-critical" aria-hidden />
          <div className="text-meta">
            <p className="font-semibold">{t('fee.failed')}</p>
            <Button size="sm" variant="secondary" className="mt-2" onClick={pay}>
              {t('common.retry')}
            </Button>
          </div>
        </div>
      )}

      <Sheet open={phase === 'pending'} onOpenChange={(o) => !o && setPhase('idle')} title={t('fee.check_phone')} desktop="center" size="sm">
        <div className="flex flex-col items-center py-6 text-center">
          <span className="relative flex size-20 items-center justify-center rounded-full bg-verified-fill text-verified">
            <Smartphone className="size-9" aria-hidden />
            <Loader2 className="absolute -right-1 -top-1 size-7 animate-spin text-primary" aria-hidden />
          </span>
          <p className="mt-4 text-body font-semibold tabular-nums">{amount}</p>
          <p className="mt-1 text-meta text-muted">+254 {phone}</p>
          <p className="mt-4 text-meta text-muted">{t('fee.waiting')}</p>
        </div>
      </Sheet>

      <Sheet open={refundOpen} onOpenChange={setRefundOpen} title={t('fee.refund')} desktop="center" size="sm">
        <p className="text-body">{t('fee.refund_text')}</p>
      </Sheet>
    </Page>
  )
}
