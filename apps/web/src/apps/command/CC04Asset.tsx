import { CalendarClock, FileText, Mail, MessageCircle, Phone, Pin } from 'lucide-react'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router'
import { daysUntil, fmtDate, fmtDateTime, fileSize } from '@/lib/format'
import { asset, auditEvents, docsFor, flagsFor, person, plans, tasks, WORKSTREAMS, type Asset } from '@/data'
import { assetFlagCounts, AuditRow, FlagCounts, PassportHeader, QueueRow, RedFlagCard, StatusTimeline, TierBadge, useOpenEvidence, WorkstreamCard } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Avatar, Button, Chip, DataTable, IconButton, TabNav, toast } from '@/ds/ui'
import { EmptyState } from '@/ds/components'
import { Panel } from './common'

export function useAsset(): Asset {
  const { id = 'kiboko' } = useParams()
  return asset(id)
}

/** Layout for /command/assets/:id — header + tabs. The full Passport Header shows on the Overview tab. */
export default function AssetLayout() {
  const a = useAsset()
  const { pathname } = useLocation()
  const base = `/command/assets/${a.id}`
  const isOverview = pathname === base || pathname === `${base}/`
  const counts = assetFlagCounts(a.id)
  const tab = pathname.slice(base.length + 1) || 'overview'
  const tabLabel = { overview: 'Overview', workbench: 'Workbench', map: 'Map', flags: 'Flags', tasks: 'Tasks', documents: 'Documents', people: 'People', activity: 'Activity', findings: 'Findings', release: 'Release' }[tab] ?? 'Overview'
  return (
    <Page
      title={a.name}
      shortTitle={`${a.name.split(' ')[0]} · ${tabLabel}`}
      back="/command/assets"
      breadcrumbs={[{ label: 'Assets', to: '/command/assets' }, { label: a.name, to: base }, ...(isOverview ? [] : [{ label: tabLabel }])]}
      hideHeaderOnDesktop
    >
      {isOverview ? (
        <PassportHeader asset={a} view="internal" />
      ) : (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-line bg-surface px-4 py-2.5 shadow-e1">
          <p className="font-serif text-h3 font-semibold">{a.name}</p>
          <span className="font-mono text-micro text-muted">{a.code}</span>
          <TierBadge tier={a.tier} size="sm" />
          <FlagCounts counts={counts} compact showZero={false} />
          <span className="text-micro text-muted">{a.passport.version ? `v${a.passport.version} released` : `Draft v${a.passport.draftVersion ?? 1}`}</span>
        </div>
      )}
      <TabNav
        className="-mx-4 mt-3 mb-4 px-4 md:mx-0 md:px-0"
        items={[
          { to: base, label: 'Overview', end: true },
          { to: `${base}/workbench`, label: 'Workbench' },
          { to: `${base}/map`, label: 'Map' },
          { to: `${base}/flags`, label: 'Flags', count: counts.critical + counts.high + counts.medium + counts.low },
          { to: `${base}/tasks`, label: 'Tasks' },
          { to: `${base}/documents`, label: 'Documents' },
          { to: `${base}/people`, label: 'People' },
          { to: `${base}/activity`, label: 'Activity' },
          { to: `${base}/findings`, label: 'Findings' },
          { to: `${base}/release`, label: 'Release' },
        ]}
      />
      <Outlet />
    </Page>
  )
}

/** CC-04 Overview tab */
export function AssetOverview() {
  const a = useAsset()
  const navigate = useNavigate()
  const pinned = flagsFor(a.id).filter((f) => f.status === 'open' && (f.severity === 'high' || f.severity === 'critical'))
  const expiryDays = daysUntil(a.licence.expires)
  const people = [
    { id: a.ownerId, role: 'Owner' },
    ...(a.representativeId ? [{ id: a.representativeId, role: 'Representative' }] : []),
    { id: a.analystId, role: 'Analyst' },
    ...(a.id === 'kiboko'
      ? [
          { id: 'nomvula', role: 'Resource geologist (QP)' },
          { id: 'wanjiru', role: 'Mining lawyer' },
          { id: 'faith', role: 'ESG specialist' },
          { id: 'brian', role: 'Field verifier' },
        ]
      : [
          { id: 'wanjiru', role: 'Mining lawyer' },
          { id: 'brian', role: 'Field verifier' },
        ]),
  ]
  return (
    <div className="space-y-4">
      {pinned.map((f) => (
        <div key={f.id} className="relative">
          <span className="absolute -top-2 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-fg px-2 py-0.5 text-[11px] font-semibold text-canvas">
            <Pin className="size-3" aria-hidden /> Pinned
          </span>
          <RedFlagCard flag={f} onClick={() => navigate(`/command/assets/${a.id}/flags`, { viewTransition: true })} />
        </div>
      ))}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {WORKSTREAMS.map((w) => (
          <WorkstreamCard key={w.id} asset={a} ws={w.id} onClick={() => navigate(`/command/assets/${a.id}/workbench?ws=${w.id}`, { viewTransition: true })} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel title="Verification plan" subtitle={`${a.tierInProgress ? 'Investor-ready (v3)' : 'Current tier'} · template KE-${a.commodityKey}-${a.tierInProgress ?? a.tier}`}>
          <StatusTimeline steps={plans[a.id] ?? plans.nyanza} />
        </Panel>
        <div className="space-y-4">
          <Panel title="Key dates">
            <ul className="space-y-3 text-meta">
              <li className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <CalendarClock className="size-4 text-muted" aria-hidden /> Licence expiry
                </span>
                <span className="text-right">
                  {fmtDate(a.licence.expires)} <Chip tone={expiryDays < 183 ? 'critical' : 'neutral'}>{expiryDays} d</Chip>
                </span>
              </li>
              {a.siteVisit && (
                <li className="flex items-center justify-between gap-3">
                  <span>Site visit · {person(a.siteVisit.verifierId).name}</span>
                  <span>{fmtDate(a.siteVisit.date)}</span>
                </li>
              )}
              <li className="flex items-center justify-between gap-3">
                <span>Findings review</span>
                <span>{fmtDate(a.findingsDue ?? '2026-10-21')}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span>Submitted</span>
                <span>{fmtDate(a.submittedOn)}</span>
              </li>
            </ul>
          </Panel>
          <Panel title="People" bodyClassName="p-0">
            <ul className="divide-y divide-line">
              {people.map((p) => (
                <li key={p.id + p.role} className="flex items-center gap-3 px-4 py-2.5">
                  <Avatar id={p.id} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-meta font-medium">{person(p.id).name}</p>
                    <p className="truncate text-micro text-muted">{p.role}</p>
                  </div>
                  <IconButton label={`Message ${person(p.id).name}`} size="sm" variant="quiet" onClick={() => toast(`Message ${person(p.id).name} (logged to M27)`)}>
                    <MessageCircle />
                  </IconButton>
                  <IconButton label={`Call ${person(p.id).name}`} size="sm" variant="quiet" onClick={() => toast(`Calling ${person(p.id).name}`)}>
                    <Phone />
                  </IconButton>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  )
}

export function AssetFlags() {
  const a = useAsset()
  const list = flagsFor(a.id)
  if (!list.length) return <EmptyState title="No flags on this asset" body="Flags raised during verification appear here." compact />
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {list.map((f) => (
        <RedFlagCard key={f.id} flag={f} />
      ))}
    </div>
  )
}

export function AssetTasks() {
  const a = useAsset()
  const navigate = useNavigate()
  const list = tasks.filter((t) => t.assetId === a.id)
  if (!list.length) return <EmptyState title="No tasks" body="Tasks are generated from the verification plan." compact />
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-e1" role="table">
      {list.map((t) => (
        <QueueRow key={t.id} task={t} onOpen={() => navigate(`/command/assets/${a.id}/workbench`, { viewTransition: true })} />
      ))}
    </div>
  )
}

export function AssetDocuments() {
  const a = useAsset()
  const open = useOpenEvidence()
  return (
    <DataTable
      caption="Documents"
      rows={docsFor(a.id)}
      getId={(d) => d.id}
      onRowClick={(d) => open({ docId: d.id, page: 1 })}
      empty={<EmptyState title="No documents yet" compact />}
      columns={[
        {
          key: 'name',
          header: 'Document',
          sortValue: (d) => d.name,
          cell: (d) => (
            <span className="flex min-w-0 items-center gap-2">
              <FileText className="size-4 shrink-0 text-muted" aria-hidden />
              <span className="truncate">{d.name}</span>
            </span>
          ),
        },
        { key: 'type', header: 'Type', cell: (d) => <span className="text-muted">{d.type}</span>, hideBelow: 'lg' },
        { key: 'folder', header: 'Folder', cell: (d) => d.folder },
        { key: 'level', header: 'Level', cell: (d) => <Chip tone="outline">{d.level}</Chip> },
        { key: 'claims', header: 'Linked claims', align: 'right', sortValue: (d) => d.linkedClaims, cell: (d) => d.linkedClaims },
        { key: 'pages', header: 'Pages', align: 'right', cell: (d) => d.pages, hideBelow: 'xl' },
        { key: 'size', header: 'Size', align: 'right', cell: (d) => fileSize(d.sizeBytes), hideBelow: 'xl' },
        { key: 'up', header: 'Uploaded', sortValue: (d) => d.uploadedOn, cell: (d) => <span className="text-muted">{fmtDate(d.uploadedOn)}</span> },
      ]}
      mobileCard={(d) => (
        <div>
          <p className="truncate font-medium">{d.name}</p>
          <p className="text-micro text-muted">
            {d.type} · {d.pages} p · {d.linkedClaims} linked claims
          </p>
        </div>
      )}
    />
  )
}

export function AssetPeople() {
  const a = useAsset()
  const ids = Array.from(new Set([a.ownerId, a.representativeId, a.analystId, 'wanjiru', 'brian', 'faith', 'nomvula', 'sarah'].filter(Boolean) as string[]))
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {ids.map((id) => (
        <div key={id} className="flex items-center gap-3 rounded-lg border border-line bg-surface p-4 shadow-e1">
          <Avatar id={id} size={40} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-meta font-semibold">{person(id).name}</p>
            <p className="truncate text-micro text-muted">{person(id).role}</p>
          </div>
          <Button size="xs" variant="ghost" icon={<Mail />} onClick={() => toast('Message logged to M27')}>
            Message
          </Button>
        </div>
      ))}
    </div>
  )
}

export function AssetActivity() {
  const a = useAsset()
  const list = auditEvents.filter((e) => e.assetId === a.id)
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-e1">
      {list.length ? list.map((e) => <AuditRow key={e.id} event={e} onOpen={() => toast(`Event ${e.id} · ${fmtDateTime(e.at)}`)} />) : <p className="p-4 text-meta text-muted">No recent activity.</p>}
    </div>
  )
}
