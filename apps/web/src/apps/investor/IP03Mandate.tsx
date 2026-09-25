import { Check, Info, Save } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/cn'
import { useDemoState } from '@/lib/demo-states'
import { investor } from '@/data'
import { Panel } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Button, Field, Input, toast } from '@/ds/ui'

function ChipGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <fieldset>
      <legend className="mb-2 text-meta font-medium">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o)
          return (
            <button
              key={o}
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => onChange(on ? value.filter((x) => x !== o) : [...value, o])}
              className={cn('pressable inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-meta font-medium max-md:h-11', on ? 'border-primary bg-primary text-on-primary' : 'border-line-strong/50 bg-surface text-fg hover:border-line-strong')}
            >
              {on && <Check className="size-3.5" aria-hidden />}
              {o}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

/** IP-03 · Investment mandate (Brightwater Anode Co.) */
export default function IP03Mandate() {
  useDemoState('IP-03', [{ id: 'default', label: 'Default' }] as const)
  const m = investor('brightwater').mandate
  const [commodities, setCommodities] = useState(m.commodities)
  const [countries, setCountries] = useState(m.countries)
  const [stages, setStages] = useState(m.stages)
  const [licences, setLicences] = useState(m.licenceTypes)
  const [structures, setStructures] = useState(m.structures)
  const [esg, setEsg] = useState(m.esg)
  const graphite = commodities.includes('Graphite')

  return (
    <Page
      title="Investment mandate"
      subtitle="Brightwater Anode Co. · Rachel Kim"
      back="/investor"
      footer={
        <div className="flex justify-end">
          <Button size="lg" icon={<Save />} onClick={() => toast.success('Mandate saved · SSD notified')} className="max-md:w-full">
            Save mandate
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6 rounded-lg border border-line bg-surface p-4 shadow-e1 md:p-6">
          <ChipGroup label="Commodities" options={['Graphite', 'Gold', 'Copper', 'Cobalt', 'Rare earths', 'Lithium', 'Heavy mineral sands']} value={commodities} onChange={setCommodities} />
          <ChipGroup label="Countries" options={['Kenya', 'Tanzania', 'Uganda', 'Zambia']} value={countries} onChange={setCountries} />
          <ChipGroup label="Stages" options={['Early exploration', 'Exploration', 'Advanced exploration', 'Pre-feasibility', 'Feasibility', 'Production']} value={stages} onChange={setStages} />
          <ChipGroup label="Licence types" options={['Prospecting licence', 'Retention licence', 'Mining licence', 'Mining permit']} value={licences} onChange={setLicences} />
          <fieldset>
            <legend className="mb-2 text-meta font-medium">Ticket size (USD millions)</legend>
            <div className="flex items-center gap-2">
              <Input defaultValue={m.ticket[0]} inputMode="numeric" aria-label="Minimum" className="w-28 font-mono" />
              <span className="text-muted">to</span>
              <Input defaultValue={m.ticket[1]} inputMode="numeric" aria-label="Maximum" className="w-28 font-mono" />
            </div>
          </fieldset>
          <ChipGroup label="Structures" options={['Equity', 'Offtake', 'Joint venture', 'Royalty or stream', 'Debt']} value={structures} onChange={setStructures} />
          <ChipGroup label="ESG requirements" options={['IFC Performance Standards', 'No artisanal child labour', 'Community agreement required', 'No protected-area overlap']} value={esg} onChange={setEsg} />
          {graphite && (
            <fieldset className="rounded-lg border border-primary/25 bg-primary-tint/40 p-4 animate-fade-in">
              <legend className="px-1 text-meta font-semibold">Graphite specifications</legend>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Flake size distribution" hint="Share of concentrate at +80 mesh">
                  {(p) => <Input {...p} defaultValue="At least 40%" />}
                </Field>
                <Field label="Concentrate purity" hint="Graphitic carbon">
                  {(p) => <Input {...p} defaultValue="94% Cg or higher" />}
                </Field>
              </div>
            </fieldset>
          )}
        </div>
        <Panel title="How SSD uses this" className="h-fit lg:sticky lg:top-24">
          <ul className="space-y-3 text-meta">
            <li className="flex gap-2">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              To decide which opportunities with released passports to show you.
            </li>
            <li className="flex gap-2">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              It is never shared with owners, and never used to rank or recommend assets to you.
            </li>
            <li className="flex gap-2">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              Update it at any time; James Whitfield reviews changes.
            </li>
          </ul>
        </Panel>
      </div>
    </Page>
  )
}
