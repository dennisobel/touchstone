import { Building2, FileUp, Info, Plus, UserRoundCheck, UserX } from 'lucide-react'
import { useState } from 'react'
import { useDemoState } from '@/lib/demo-states'
import { fmtDate } from '@/lib/format'
import { EmptyState } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Avatar, Button, Chip, toast } from '@/ds/ui'
import { SectionLabel, useOwner } from './common'
import { useT } from './i18n'

const STATES = [
  { id: 'default', label: 'Default' },
  { id: 'none', label: 'No representatives' },
] as const

export default function OA16Company() {
  const { t, lang } = useT()
  const [state] = useDemoState('OA-16', STATES)
  const { isGrace, person: me } = useOwner()
  const initial = isGrace
    ? [
        { id: 'joseph', name: 'Joseph Mwangi', role: 'Site manager', scope: 'answer requests, upload documents', until: '2026-12-31' },
        { id: 'kevin', name: 'Kevin Omondi', role: 'SSD agent (assisted intake)', scope: 'fill forms with you present', until: '2026-10-31' },
      ]
    : [{ id: 'collins', name: 'Collins Otieno', role: 'SSD agent (assisted intake)', scope: 'fill forms with you present', until: '2026-10-05' }]
  const [delegates, setDelegates] = useState(initial)
  const list = state === 'none' ? [] : delegates

  const company = isGrace
    ? [
        ['Name', 'Kiboko Minerals Ltd'],
        ['Registration number', 'PVT-7XK2L9Q'],
        ['Registered office', 'Westlands, Nairobi'],
        ['Beneficial owners', 'Grace Wanjiku 72% · Ndege Capital Ltd 28%'],
      ]
    : [
        ['Holder', 'Peter Ouma (individual)'],
        ['ID number', '•••• 4417'],
        ['Address', 'Macalder, Migori County'],
      ]
  const directors = isGrace ? ['Grace Wanjiku', 'Paul Mwangi', 'Lucy Chebet'] : [me.name]

  return (
    <Page title={t('co.title')} back="/owner/account">
      <SectionLabel className="mt-0">{t('co.details')}</SectionLabel>
      <dl className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface shadow-e1">
        {company.map(([k, v]) => (
          <div key={k} className="flex items-start justify-between gap-3 px-4 py-3 text-meta">
            <dt className="text-muted">{k}</dt>
            <dd className="text-right font-medium">{v}</dd>
          </div>
        ))}
      </dl>

      <SectionLabel>{t('co.directors')}</SectionLabel>
      <ul className="flex flex-wrap gap-2">
        {directors.map((d) => (
          <li key={d}>
            <Chip tone="outline" icon={<Building2 />}>
              {d}
            </Chip>
          </li>
        ))}
      </ul>

      <SectionLabel>{t('co.delegates')}</SectionLabel>
      <p className="mb-3 flex items-start gap-2 text-meta text-muted">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        {t('co.you_see_all')}
      </p>
      {list.length === 0 ? (
        <EmptyState icon={<UserRoundCheck />} title={t('co.none')} compact />
      ) : (
        <ul className="space-y-2.5">
          {list.map((d) => (
            <li key={d.id} className="rounded-lg border border-line bg-surface p-4 shadow-e1">
              <div className="flex items-center gap-3">
                <Avatar id={d.id} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="text-body font-semibold">{d.name}</p>
                  <p className="text-meta text-muted">{d.role}</p>
                </div>
              </div>
              <p className="mt-3 text-meta">{t('co.scope', { scope: d.scope })}</p>
              <p className="text-meta text-muted">{t('co.until', { date: fmtDate(d.until, lang) })}</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3 text-critical"
                icon={<UserX />}
                onClick={() => {
                  setDelegates((x) => x.filter((y) => y.id !== d.id))
                  toast.success(t('co.revoked'))
                }}
              >
                {t('co.revoke')}
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="secondary" icon={<Plus />} onClick={() => toast('Invite by phone number; confirmed with your one-time code (demo)')}>
          {t('co.add')}
        </Button>
        <Button variant="secondary" icon={<FileUp />} onClick={() => toast('Mandate uploaded (demo)')}>
          {t('co.mandate_upload')}
        </Button>
      </div>
    </Page>
  )
}
