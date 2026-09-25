import { ChevronRight, FileSearch, TimerOff } from 'lucide-react'
import { Link } from 'react-router'
import { fmtDay, money } from '@/lib/format'
import { asset, assignments } from '@/data'
import { EmptyState } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Chip } from '@/ds/ui'
import { DaysLeftChip } from './ED01Inbox'
import { EXPERT_ID } from './ExpertShell'

/** "Reviews" tab: active review workspaces. */
export default function EDReviews() {
  const active = assignments.filter((a) => a.expertId === EXPERT_ID && (a.status === 'active' || a.status === 'overdue'))
  return (
    <Page title="Reviews" large>
      {active.length === 0 ? (
        <EmptyState icon={<FileSearch />} title="No active reviews" contactId="kevin" />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {active.map((a) => (
            <li key={a.id}>
              <Link to={`/expert/reviews/${a.id}`} viewTransition className="pressable flex h-full flex-col rounded-lg border border-line bg-surface p-4 shadow-e1 hover:shadow-e2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-h3 font-semibold">{asset(a.assetId).name}</p>
                  <ChevronRight className="size-4 text-muted" aria-hidden />
                </div>
                <p className="text-meta text-muted">{a.taskType}</p>
                <p className="mt-2 line-clamp-2 text-meta">{a.scope}</p>
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                  <DaysLeftChip a={a} />
                  {a.accessEnds && (
                    <Chip tone="outline" icon={<TimerOff />}>
                      Access ends {fmtDay(a.accessEnds)}
                    </Chip>
                  )}
                  <span className="ml-auto text-micro tabular-nums text-muted">{money('USD', a.feeUsd)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Page>
  )
}
