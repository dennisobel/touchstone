import { CircleDot, GitCompareArrows, Link2, Scale, Send, Upload } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/cn'
import { useDemoState } from '@/lib/demo-states'
import { fmtDate } from '@/lib/format'
import { kenyaPack } from '@/data'
import { Banner, Panel } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Button, Chip, Input, Select, Sheet, toast } from '@/ds/ui'
import { intelligenceTabs, SectionTabs } from './common'

const STATES = [
  { id: 'default', label: 'Draft' },
  { id: 'review', label: 'In counsel review' },
  { id: 'signed', label: 'Counsel signed' },
] as const

export default function CC22Packs() {
  const [state] = useDemoState('CC-22', STATES)
  const [section, setSection] = useState('Licence types')
  const [diffOpen, setDiffOpen] = useState(false)
  const status = state === 'review' ? 'In counsel review' : state === 'signed' ? 'Counsel signed' : 'Draft'
  const canPublish = state === 'signed'
  return (
    <Page
      title={`Kenya ${kenyaPack.version} (draft)`}
      shortTitle="Jurisdiction pack"
      large
      headerExtra={<SectionTabs items={intelligenceTabs} />}
      actions={
        <>
          <Button variant="secondary" icon={<GitCompareArrows />} onClick={() => setDiffOpen(true)}>
            Diff vs {kenyaPack.previous}
          </Button>
          <Button variant="secondary" icon={<Send />} disabled={state !== 'default'} onClick={() => toast.success('Sent to Wanjiru Kamau (Kenyan counsel) for sign-off')}>
            Send to counsel
          </Button>
          <Button icon={<Upload />} disabled={!canPublish} onClick={() => toast.success(`Kenya ${kenyaPack.version} published · effective ${fmtDate(kenyaPack.effective)}`)}>
            Publish
          </Button>
        </>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2 text-meta">
        <Chip tone={state === 'signed' ? 'verified' : state === 'review' ? 'disputed' : 'review'} icon={<CircleDot />}>
          {status}
        </Chip>
        <span className="text-muted">Effective {fmtDate(kenyaPack.effective)} · version {kenyaPack.version}</span>
        {!canPublish && <span className="text-micro text-muted">· Publish is enabled after Kenyan counsel signs</span>}
      </div>
      <Banner tone="info" icon={<Scale />} className="mb-4" title={`Publishing changes ${kenyaPack.impact.checklistItems} checklist items across ${kenyaPack.impact.assets} active assets`}>
        Each claim is judged against the pack version in force on the claim's date (M25-2). Affected owners receive new requests only for new required items.
      </Banner>
      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Pack sections" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:block lg:space-y-0.5 lg:px-0">
          {kenyaPack.sections.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSection(s)}
              aria-current={s === section}
              className={cn('shrink-0 rounded-full px-3 py-2 text-left text-meta lg:w-full lg:rounded-sm', s === section ? 'bg-primary-tint font-medium text-primary' : 'text-muted hover:bg-sunken hover:text-fg')}
            >
              {s}
              {kenyaPack.diff.some((d) => d.section === s) && <span className="ml-1.5 inline-block size-1.5 rounded-full bg-review align-middle" aria-label="changed" />}
            </button>
          ))}
        </nav>
        <div className="min-w-0 space-y-3">
          {section === 'Licence types' ? (
            kenyaPack.licenceTypes.map((lt) => (
              <Panel key={lt.code} title={`${lt.name} (${lt.code})`} action={lt.changed ? <Chip tone="review">Changed in v1.3</Chip> : undefined}>
                <div className="grid gap-3 md:grid-cols-2">
                  <Row label="Maximum term" value={lt.maxTerm} />
                  <Row label="Holder eligibility" value={lt.eligibility} />
                  <Row label="Transfer consent needed" value={lt.consent} />
                  <Row label="Required documents" value={lt.documents} />
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-sm bg-sunken/60 px-3 py-2">
                  <Link2 className="size-3.5 text-muted" aria-hidden />
                  <span className="text-micro text-muted">Citation</span>
                  <Input defaultValue={lt.citation} aria-label="Citation" className="h-8 flex-1" />
                </div>
              </Panel>
            ))
          ) : (
            <Panel title={section}>
              <div className="grid gap-3 md:grid-cols-2">
                <Row label="Rule" value={section === 'State participation' ? '10% free carried interest in large-scale mining' : section === 'Community' ? 'Community development agreement for large-scale operations' : 'See Mining Act 2016'} />
                <Row label="Applies to" value={<Select defaultValue="ml" aria-label="Applies to"><option value="ml">Mining licence</option><option value="all">All licence types</option></Select>} />
                <Row label="Citation" value="Mining Act 2016" />
                <Row label="Reviewed by" value="Wanjiru Kamau · 12 Aug 2026" />
              </div>
            </Panel>
          )}
        </div>
      </div>

      <Sheet open={diffOpen} onOpenChange={setDiffOpen} title={`Kenya ${kenyaPack.version} vs ${kenyaPack.previous}`} description="Changes waiting for counsel" size="lg">
        <ul className="space-y-2">
          {kenyaPack.diff.map((d, i) => (
            <li key={i} className={cn('rounded-sm border-l-4 bg-surface p-3', d.kind === 'added' ? 'border-verified bg-verified-fill/40' : 'border-review bg-review-fill/40')}>
              <p className="text-micro font-semibold uppercase tracking-wide text-muted">
                {d.kind === 'added' ? '+ Added' : '~ Changed'} · {d.section}
              </p>
              <p className="mt-0.5 text-meta">{d.change}</p>
            </li>
          ))}
        </ul>
      </Sheet>
    </Page>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-micro text-muted">{label}</p>
      <div className="mt-0.5 text-meta">{value}</div>
    </div>
  )
}
