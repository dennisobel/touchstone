import { Clock, MailCheck, Plus, ShieldCheck, UserMinus } from 'lucide-react'
import { useState } from 'react'
import { useDemoState } from '@/lib/demo-states'
import { fmtDate } from '@/lib/format'
import { person } from '@/data'
import { Banner } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Avatar, Button, Checkbox, Chip, Field, Input, Sheet, toast } from '@/ds/ui'
import { useInvestorCtx } from './common'

const STATES = [
  { id: 'default', label: 'Default' },
  { id: 'pending', label: 'Adviser pending acceptance' },
  { id: 'expiring', label: 'Access expiring in 5 days' },
] as const

/** IP-14 · Team and advisers */
export default function IP14Team() {
  const [state] = useDemoState('IP-14', STATES)
  const { org, orgId } = useInvestorCtx()
  const [open, setOpen] = useState(false)
  const [scope, setScope] = useState({ Geology: true, Technical: true, Title: false, ESG: false })
  const members = orgId === 'cedar-peak' ? ['marcus', 'priya'] : ['rachel']
  const advisers = [{ id: 'tom', until: state === 'expiring' ? '2026-09-29' : '2026-12-16', folders: 'Geology, Technical', status: state === 'pending' ? 'pending' : 'active' }]

  return (
    <Page title="Team and advisers" large subtitle={org.name} actions={<Button icon={<Plus />} onClick={() => setOpen(true)}>Add adviser</Button>}>
      {state === 'expiring' && (
        <Banner tone="warning" icon={<Clock />} className="mb-4" title="Tom Nguyen's access ends on 29 Sep 2026">
          Extend it before then if the review is still under way.
        </Banner>
      )}
      <section className="rounded-lg border border-line bg-surface shadow-e1">
        <h2 className="border-b border-line px-4 py-3 text-h3 font-semibold">Members</h2>
        <ul className="divide-y divide-line">
          {members.map((m, i) => (
            <li key={m} className="flex items-center gap-3 px-4 py-3">
              <Avatar id={m} size={36} />
              <div className="min-w-0 flex-1">
                <p className="text-meta font-medium">{person(m).name}</p>
                <p className="text-micro text-muted">{person(m).email}</p>
              </div>
              <Chip tone={i === 0 ? 'primary' : 'outline'}>{i === 0 ? 'Admin' : 'Member'}</Chip>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-4 rounded-lg border border-line bg-surface shadow-e1">
        <h2 className="border-b border-line px-4 py-3 text-h3 font-semibold">Advisers</h2>
        <ul className="divide-y divide-line">
          {advisers.map((ad) => (
            <li key={ad.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <Avatar id={ad.id} size={36} />
              <div className="min-w-0 flex-1">
                <p className="text-meta font-medium">{person(ad.id).name}</p>
                <p className="text-micro text-muted">
                  {person(ad.id).role} · folders: {ad.folders} · until {fmtDate(ad.until)}
                </p>
              </div>
              {ad.status === 'pending' ? (
                <Chip tone="review" icon={<MailCheck />}>
                  Waiting to accept NDA terms
                </Chip>
              ) : (
                <Chip tone="verified" icon={<ShieldCheck />}>
                  NDA terms accepted
                </Chip>
              )}
              <Button size="sm" variant="ghost" icon={<UserMinus />} onClick={() => toast('Access removed immediately (logged)')}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
        <p className="border-t border-line px-4 py-3 text-micro text-muted">
          Advisers see only the folders you choose, for a fixed period, under your NDA. Their findings stay in your private workspace, never on the passport.
        </p>
      </section>

      <Sheet
        open={open}
        onOpenChange={setOpen}
        title="Add an adviser"
        description="They must accept the NDA terms before any access. Onboarding takes under 5 minutes."
        footer={
          <Button block onClick={() => (setOpen(false), toast.success('Invitation sent to tom@nguyenmining.example'))}>
            Send invitation
          </Button>
        }
      >
        <div className="space-y-4">
          <Field label="Name">{(p) => <Input {...p} defaultValue="Tom Nguyen" />}</Field>
          <Field label="Email">{(p) => <Input {...p} type="email" defaultValue="tom@nguyenmining.example" />}</Field>
          <fieldset>
            <legend className="mb-1.5 text-meta font-medium">Folders</legend>
            {(Object.keys(scope) as (keyof typeof scope)[]).map((f) => (
              <Checkbox key={f} checked={scope[f]} onCheckedChange={(v) => setScope((s) => ({ ...s, [f]: v }))} label={f} className="min-h-9" />
            ))}
          </fieldset>
          <Field label="Access until" hint="Up to 90 days">
            {(p) => <Input {...p} type="date" defaultValue="2026-12-16" />}
          </Field>
        </div>
      </Sheet>
    </Page>
  )
}
