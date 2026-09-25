import { useState } from 'react'
import { useDemoState } from '@/lib/demo-states'
import { fmtDate } from '@/lib/format'
import { Page } from '@/ds/shell'
import { Chip } from '@/ds/ui'
import { AssignmentTool, type AssignTask } from './AssignmentTool'
import { SectionTabs, verificationTabs } from './common'

const STATES = [{ id: 'default', label: 'Default' }] as const

const OPEN: AssignTask[] = [
  { id: 'a1', title: 'Resource review, historical estimate', assetName: 'Nyanza Reef Gold', jurisdiction: 'Kenya', commodity: 'Gold', kind: 'resource_geologist', deadline: '2026-10-20' },
  { id: 'a2', title: 'Title opinion', assetName: 'Mutomo Iron Ridge', jurisdiction: 'Kenya', commodity: 'Iron ore', kind: 'mining_lawyer', deadline: '2026-10-12' },
  { id: 'a3', title: 'One-day site visit', assetName: 'Tsavo East Garnet', jurisdiction: 'Kenya', commodity: 'Garnet', kind: 'field', deadline: '2026-10-06' },
  { id: 'a4', title: 'ESG desk review', assetName: 'Lodwar Basin Copper', jurisdiction: 'Kenya', commodity: 'Copper', kind: 'esg', deadline: '2026-10-09' },
]

export default function CC09Assignments() {
  useDemoState('CC-09', STATES)
  const [taskId, setTaskId] = useState(OPEN[0].id)
  const task = OPEN.find((t) => t.id === taskId)!
  return (
    <Page title="Assignments" large headerExtra={<SectionTabs items={verificationTabs} />}>
      <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <section aria-label="Unassigned tasks">
          <p className="mb-2 text-micro font-semibold uppercase tracking-wide text-muted">Unassigned tasks</p>
          <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:block lg:space-y-2 lg:px-0">
            {OPEN.map((t) => (
              <li key={t.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setTaskId(t.id)}
                  aria-pressed={t.id === taskId}
                  className={`pressable block w-60 rounded-lg border p-3 text-left lg:w-full ${t.id === taskId ? 'border-primary bg-primary-tint' : 'border-line bg-surface'}`}
                >
                  <p className="text-meta font-semibold">{t.title}</p>
                  <p className="text-micro text-muted">{t.assetName}</p>
                  <Chip size="sm" className="mt-2">
                    Due {fmtDate(t.deadline)}
                  </Chip>
                </button>
              </li>
            ))}
          </ul>
        </section>
        <section aria-label="Ranked people">
          <div className="mb-3">
            <h2 className="text-h2 font-semibold">{task.title}</h2>
            <p className="text-meta text-muted">
              {task.assetName} · {task.commodity} · {task.jurisdiction} · deadline {fmtDate(task.deadline)}
            </p>
          </div>
          <AssignmentTool key={task.id} task={task} />
        </section>
      </div>
    </Page>
  )
}
