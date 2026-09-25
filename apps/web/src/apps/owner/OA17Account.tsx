import { Building2, ChevronRight, Download, LogOut, Smartphone, UserRoundCog } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { fmtDate } from '@/lib/format'
import { useDemo } from '@/lib/store'
import { ThemeSwitch } from '@/ds/shell'
import { Page } from '@/ds/shell'
import { Avatar, Button, Chip, Sheet, Switch, toast } from '@/ds/ui'
import { LangToggle, SectionLabel, useOwner } from './common'
import { useT } from './i18n'

export default function OA17Account() {
  const { t, lang } = useT()
  const { person: me, isGrace } = useOwner()
  const setPersona = useDemo((s) => s.setOwnerPersona)
  const navigate = useNavigate()
  const [channels, setChannels] = useState({ sms: true, whatsapp: true, email: isGrace })
  const [quiet, setQuiet] = useState(true)
  const [twoStep, setTwoStep] = useState(false)
  const [consents, setConsents] = useState([
    { id: 'verif', name: 'Verification and data processing', version: 'v2.1', given: '2026-09-02', active: true },
    { id: 'sms', name: 'SMS about my account', version: 'v1.0', given: '2026-09-01', active: true },
  ])
  const [withdrawing, setWithdrawing] = useState<string | null>(null)

  return (
    <Page title={t('acct.title')} large>
      <div className="flex items-center gap-3 rounded-lg border border-line bg-surface p-4 shadow-e1">
        <Avatar id={me.id} size={52} />
        <div className="min-w-0 flex-1">
          <p className="text-h3 font-semibold">{me.name}</p>
          <p className="text-meta text-muted">{me.phone}</p>
        </div>
        <Button size="sm" variant="ghost" icon={<UserRoundCog />} onClick={() => setPersona(isGrace ? 'peter' : 'grace')}>
          {isGrace ? 'Peter' : 'Grace'}
        </Button>
      </div>

      <SectionLabel>{t('common.language')}</SectionLabel>
      <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface p-4">
        <span className="text-body">{lang === 'sw' ? 'Kiswahili' : 'English'}</span>
        <LangToggle />
      </div>

      <Link to="/owner/account/company" viewTransition className="pressable mt-3 flex items-center gap-3 rounded-lg border border-line bg-surface p-4">
        <Building2 className="size-5 text-muted" aria-hidden />
        <span className="flex-1 text-body font-medium">{t('acct.company')}</span>
        <ChevronRight className="size-4 text-muted" aria-hidden />
      </Link>

      <SectionLabel>{t('acct.notifications')}</SectionLabel>
      <div className="divide-y divide-line rounded-lg border border-line bg-surface px-4">
        <p className="py-3 text-micro font-semibold uppercase tracking-wide text-muted">{t('acct.channels')}</p>
        <Switch label="SMS" checked={channels.sms} onCheckedChange={(v) => setChannels((c) => ({ ...c, sms: v }))} className="py-1" />
        <Switch label="WhatsApp" checked={channels.whatsapp} onCheckedChange={(v) => setChannels((c) => ({ ...c, whatsapp: v }))} className="py-1" />
        <Switch label="Email" checked={channels.email} onCheckedChange={(v) => setChannels((c) => ({ ...c, email: v }))} className="py-1" />
        <Switch label={t('acct.quiet')} description={t('acct.quiet_desc', { from: '21:00', to: '07:00' })} checked={quiet} onCheckedChange={setQuiet} className="py-2" />
      </div>

      <SectionLabel>{t('acct.security')}</SectionLabel>
      <div className="divide-y divide-line rounded-lg border border-line bg-surface px-4">
        <Switch label={t('acct.two_step')} checked={twoStep} onCheckedChange={setTwoStep} className="py-2" />
        <div className="py-3">
          <p className="text-micro font-semibold uppercase tracking-wide text-muted">{t('acct.devices')}</p>
          <p className="mt-2 flex items-center gap-2 text-meta">
            <Smartphone className="size-4 text-muted" aria-hidden />
            Tecno Spark 20 · Migori
            <Chip tone="verified" size="sm">
              {t('acct.this_device')}
            </Chip>
          </p>
        </div>
      </div>

      <SectionLabel>{t('acct.data')}</SectionLabel>
      <ul className="space-y-2">
        {consents.map((c) => (
          <li key={c.id} className="flex items-center gap-3 rounded-lg border border-line bg-surface p-4">
            <div className="min-w-0 flex-1">
              <p className="text-meta font-medium">
                {c.name} <span className="font-mono text-micro text-muted">{c.version}</span>
              </p>
              <p className="text-micro text-muted">{c.active ? t('acct.given', { date: fmtDate(c.given, lang) }) : t('acct.withdrawn')}</p>
            </div>
            {c.active && (
              <Button size="sm" variant="quiet" onClick={() => setWithdrawing(c.id)}>
                {t('acct.withdraw')}
              </Button>
            )}
          </li>
        ))}
      </ul>
      <Button variant="secondary" block className="mt-3" icon={<Download />} onClick={() => toast('Your data export will be ready within 24 hours (demo)')}>
        {t('acct.download_data')}
      </Button>

      <div className="mt-6 flex items-center justify-between gap-3">
        <span className="text-meta text-muted">Theme</span>
        <ThemeSwitch />
      </div>
      <Button variant="ghost" block className="mt-4 text-critical" icon={<LogOut />} onClick={() => navigate('/owner/sign-in', { viewTransition: true })}>
        {t('acct.sign_out')}
      </Button>

      <Sheet
        open={!!withdrawing}
        onOpenChange={(o) => !o && setWithdrawing(null)}
        title={t('acct.withdraw')}
        desktop="center"
        size="sm"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setWithdrawing(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => {
                setConsents((cs) => cs.map((c) => (c.id === withdrawing ? { ...c, active: false } : c)))
                setWithdrawing(null)
                toast(t('acct.withdrawn'))
              }}
            >
              {t('acct.withdraw')}
            </Button>
          </div>
        }
      >
        <p className="text-body">{t('acct.withdraw_confirm')}</p>
      </Sheet>
    </Page>
  )
}
