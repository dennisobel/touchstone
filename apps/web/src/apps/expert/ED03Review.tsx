import { Bot, ChevronRight, CircleCheck, FileText, Folder, Loader2, MessageSquareMore, PenLine, Save, SendHorizontal, TimerOff, TriangleAlert } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useNavigate, useParams } from 'react-router'
import { cn } from '@/lib/cn'
import { useChartTheme } from '@/lib/chart'
import { useDemoState } from '@/lib/demo-states'
import { fmtDate, fmtDay } from '@/lib/format'
import { asset, assignments, claim, doc, docsFor, person } from '@/data'
import { Banner, DocumentViewer, MapPanel, StatusStamp } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Avatar, Button, ButtonLink, Chip, Progress, RadioGroup, Segmented, Sheet, Textarea, toast } from '@/ds/ui'
import { EXPERT_ID } from './ExpertShell'
import { useReview, type Finding } from './store'

const STATES = [
  { id: 'default', label: 'Default' },
  { id: 'processing', label: 'File still processing' },
  { id: 'missing', label: 'Missing data flagged' },
  { id: 'saved', label: 'Partial review saved' },
  { id: 'checks', label: 'Automated data checks tab' },
] as const

const GEOLOGY_DOCS = ['kb-d10', 'kb-d11', 'kb-d12', 'kb-d13', 'kb-d14']

export default function ED03Review() {
  const navigate = useNavigate()
  const { id = 'as-1' } = useParams()
  const a = assignments.find((x) => x.id === id) ?? assignments[0]
  const ast = asset(a.assetId)
  const [state] = useDemoState('ED-03', STATES)
  const [tab, setTab] = useState<'review' | 'checks'>('review')
  const [docId, setDocId] = useState('kb-d10')
  const [page, setPage] = useState<{ page?: number; region?: string }>({ page: 47, region: 'Table 14.3' })
  const [askOpen, setAskOpen] = useState(false)
  const findings = useReview((s) => s.findings)
  const setFinding = useReview((s) => s.setFinding)
  const setComment = useReview((s) => s.setComment)
  useEffect(() => setTab(state === 'checks' ? 'checks' : 'review'), [state])

  const claimIds = a.claimIds.length ? a.claimIds : ['kb-g1', 'kb-g3', 'kb-g4', 'kb-g5', 'kb-g6']
  const done = claimIds.filter((c) => findings[c]?.finding).length
  const files = useMemo(() => (ast.id === 'kiboko' ? GEOLOGY_DOCS.map((d) => doc(d)!).filter(Boolean) : docsFor(ast.id).slice(0, 5)), [ast.id])
  const current = doc(docId) ?? files[0]
  const me = person(EXPERT_ID)

  const cite = (d: string, p?: number, region?: string) => {
    setDocId(d)
    setPage({ page: p, region })
    setTab('review')
  }

  return (
    <Page
      title={a.taskType}
      shortTitle="Review"
      subtitle={`${ast.name} · ${done} of ${claimIds.length} claims reviewed`}
      back="/expert/reviews"
      breadcrumbs={[{ label: 'Reviews', to: '/expert/reviews' }, { label: ast.name }]}
      actions={
        <>
          <Chip tone="review" icon={<TimerOff />}>
            Access ends {fmtDay(a.accessEnds ?? '2026-10-14')}
          </Chip>
          <Button variant="secondary" icon={<MessageSquareMore />} onClick={() => setAskOpen(true)}>
            Ask SSD
          </Button>
          <ButtonLink to={`/expert/reviews/${a.id}/sign`} icon={<PenLine />}>
            Sign-off
          </ButtonLink>
        </>
      }
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          ariaLabel="Workspace"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'review', label: 'Review' },
            { value: 'checks', label: 'Automated data checks', icon: <Bot /> },
          ]}
        />
        <div className="flex w-48 items-center gap-2">
          <Progress value={(done / claimIds.length) * 100} tone="verified" label="Review progress" />
          <span className="text-micro tabular-nums text-muted">
            {done}/{claimIds.length}
          </span>
        </div>
      </div>
      {state === 'saved' && (
        <Banner tone="success" icon={<Save />} title="Partial review saved 09:12 EAT" className="mb-3">
          Your findings are saved as you go. You can close this page and come back before {fmtDate(a.deadline)}.
        </Banner>
      )}
      {state === 'missing' && (
        <Banner tone="warning" icon={<TriangleAlert />} title="Missing data flagged: blank results for batches 31–38" className="mb-3" action={<Button size="sm" variant="secondary" onClick={() => setAskOpen(true)}>Ask SSD</Button>}>
          You flagged this on 23 Sep. SSD has asked the owner; due 29 Sep.
        </Banner>
      )}

      {tab === 'review' ? (
        <div className="grid gap-3 xl:grid-cols-[220px_minmax(0,1fr)_380px]">
          {/* File tree */}
          <nav aria-label="Assignment files" className="rounded-lg border border-line bg-surface shadow-e1">
            <p className="flex items-center gap-2 border-b border-line px-3 py-2.5 text-micro font-semibold uppercase tracking-wide text-muted">
              <Folder className="size-3.5" aria-hidden /> Geology · this task only
            </p>
            <ul className="no-scrollbar flex gap-1 overflow-x-auto p-2 xl:block xl:space-y-0.5">
              {files.map((f) => (
                <li key={f.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => cite(f.id, 1)}
                    aria-current={f.id === current.id}
                    className={cn('flex w-56 items-start gap-2 rounded-sm px-2 py-2 text-left text-meta xl:w-full', f.id === current.id ? 'bg-primary-tint text-primary' : 'hover:bg-sunken')}
                  >
                    <FileText className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <span className="min-w-0">
                      <span className="line-clamp-2">{f.name}</span>
                      <span className="block text-[11px] text-muted">
                        {f.pages} p · v{f.version}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Viewer */}
          <section className="min-w-0 overflow-hidden rounded-lg border border-line bg-surface shadow-e1" aria-label="Document">
            {state === 'processing' && current.id === 'kb-d11' ? (
              <div className="flex min-h-80 flex-col items-center justify-center gap-3 p-8 text-center">
                <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
                <p className="text-h3 font-semibold">Still processing this file</p>
                <p className="max-w-sm text-meta text-muted">The drillhole database is being validated and indexed. It usually takes a few minutes; you can review other files meanwhile.</p>
              </div>
            ) : (
              <DocumentViewer key={`${current.id}-${page.page}`} document={current} page={page.page} region={page.region} viewer={{ name: me.name, org: 'Expert Desk' }} showFields={false} />
            )}
          </section>

          {/* Review template */}
          <section aria-label="Review template" className="space-y-3">
            {claimIds.map((cid) => {
              const c = claim(cid)
              if (!c) return null
              const f = findings[cid]
              return (
                <article key={cid} className={cn('rounded-lg border bg-surface p-4 shadow-e1', f?.finding ? 'border-verified-border' : 'border-line')}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[11px] text-muted">{cid.toUpperCase()}</span>
                    <StatusStamp status={c.status} size="sm" />
                  </div>
                  <p className="mt-1 text-meta font-medium">{c.statement}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.evidence.map((e, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => cite(e.docId, e.page, e.region)}
                        className="inline-flex h-7 items-center gap-1 rounded-sm border border-line px-2 text-micro hover:border-primary hover:text-primary max-md:h-9"
                      >
                        <FileText className="size-3.5 text-muted" aria-hidden />
                        {doc(e.docId)?.type} p. {e.page ?? 1}
                        <ChevronRight className="size-3" aria-hidden />
                      </button>
                    ))}
                  </div>
                  <RadioGroup<Finding>
                    name={`f-${cid}`}
                    className="mt-3"
                    value={f?.finding ?? ('' as Finding)}
                    onValueChange={(v) => setFinding(cid, v)}
                    options={[
                      { value: 'supported', label: 'Supported' },
                      { value: 'qualified', label: 'Supported with qualifications' },
                      { value: 'not_supported', label: 'Not supported' },
                    ]}
                  />
                  <Textarea className="mt-2" rows={2} value={f?.comment ?? ''} onChange={(e) => setComment(cid, e.target.value)} placeholder="Comment (cite pages)" aria-label={`Comment on ${cid}`} />
                </article>
              )
            })}
            <Button block variant="secondary" icon={<Save />} onClick={() => toast.success('Review saved')}>
              Save progress
            </Button>
          </section>
        </div>
      ) : (
        <DataChecks />
      )}

      <AskSsd open={askOpen} onOpenChange={setAskOpen} />
      <div className="mt-4 flex justify-end md:hidden">
        <Button onClick={() => navigate(`/expert/reviews/${a.id}/sign`)} icon={<PenLine />}>
          Go to sign-off
        </Button>
      </div>
    </Page>
  )
}

/** ED-04 · Automated data checks: support for the Qualified Person, never a verdict. */
function DataChecks() {
  const theme = useChartTheme()
  const qaqc = [
    { name: 'Certified standards', actual: 3.4, target: 3 },
    { name: 'Blanks', actual: 2.1, target: 3 },
    { name: 'Field duplicates', actual: 2.8, target: 5 },
  ]
  const hist = [
    { bin: '0–2', n: 412 },
    { bin: '2–4', n: 698 },
    { bin: '4–6', n: 911 },
    { bin: '6–8', n: 1204 },
    { bin: '8–10', n: 1033 },
    { bin: '10–12', n: 648 },
    { bin: '12–14', n: 301 },
    { bin: '14–16', n: 122 },
    { bin: '16–18', n: 41 },
    { bin: '18–20', n: 12 },
    { bin: '>22', n: 3, outlier: true },
  ]
  const Note = () => <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-sunken px-2.5 py-1 text-[11px] text-muted"><Bot className="size-3" aria-hidden /> Automated; your judgement prevails</p>
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-lg border border-line bg-surface p-4 shadow-e1">
        <h2 className="text-h3 font-semibold">QA/QC insertion rates</h2>
        <p className="text-micro text-muted">Share of assay samples, 2025 programme, against targets</p>
        <ul className="mt-4 space-y-4">
          {qaqc.map((q) => {
            const below = q.actual < q.target
            return (
              <li key={q.name}>
                <div className="flex items-baseline justify-between text-meta">
                  <span>{q.name}</span>
                  <span className="tabular-nums">
                    <span className={cn('font-semibold', below && 'text-review')}>{q.actual}%</span> <span className="text-muted">/ target {q.target}%</span>
                  </span>
                </div>
                <div className="relative mt-1.5 h-2.5 rounded-full bg-sunken" role="img" aria-label={`${q.name}: ${q.actual}% against a ${q.target}% target`}>
                  <div className="h-full rounded-full" style={{ width: `${(q.actual / 6) * 100}%`, background: theme.series[0] }} />
                  <span className="absolute -top-1 h-4.5 w-0.5 rounded-full bg-fg" style={{ left: `${(q.target / 6) * 100}%` }} title={`Target ${q.target}%`} />
                </div>
                {below && <p className="mt-1 text-micro text-review">Below target</p>}
              </li>
            )
          })}
        </ul>
        <Note />
      </section>

      <section className="rounded-lg border border-line bg-surface p-4 shadow-e1">
        <h2 className="text-h3 font-semibold">Grade distribution</h2>
        <p className="text-micro text-muted">5,385 assays · % graphitic carbon · outliers marked</p>
        <div className="mt-3 h-56" role="img" aria-label="Histogram of graphitic carbon grades; three outlier samples above 22 percent">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hist} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={theme.grid} />
              <XAxis dataKey="bin" tick={{ fill: theme.axis, fontSize: 11 }} tickLine={false} axisLine={{ stroke: theme.grid }} />
              <YAxis tick={{ fill: theme.axis, fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: theme.tooltipBg, border: `1px solid ${theme.grid}`, borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v} assays`, 'Count']} />
              <Bar dataKey="n" radius={[4, 4, 0, 0]} maxBarSize={24}>
                {hist.map((h) => (
                  <Cell key={h.bin} fill={h.outlier ? theme.series[1] : theme.series[0]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-micro text-muted">
          <span className="mr-1 inline-block size-2.5 rounded-[2px] align-middle" style={{ background: theme.series[1] }} /> 3 outliers above 22% Cg: KR-25-014 (24.1%), KR-25-017 (26.8%), KR-25-022 (23.3%)
        </p>
        <Note />
      </section>

      <section className="rounded-lg border border-line bg-surface p-4 shadow-e1">
        <h2 className="text-h3 font-semibold">Duplicate records</h2>
        <table className="mt-3 w-full text-meta">
          <thead>
            <tr className="text-left text-micro text-muted">
              <th className="py-1 font-medium">Sample ID</th>
              <th className="font-medium">Hole</th>
              <th className="font-medium">From–to (m)</th>
              <th className="text-right font-medium">Rows</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[12px]">
            {[
              ['S-25-04410', 'KR-25-009', '42.0–43.0', 2],
              ['S-25-04411', 'KR-25-009', '43.0–44.0', 2],
              ['S-25-05102', 'KR-25-021', '11.5–12.5', 2],
            ].map((r) => (
              <tr key={r[0] as string} className="border-t border-line">
                <td className="py-1.5">{r[0]}</td>
                <td>{r[1]}</td>
                <td>{r[2]}</td>
                <td className="text-right">{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Note />
      </section>

      <section className="rounded-lg border border-line bg-surface p-4 shadow-e1">
        <h2 className="text-h3 font-semibold">Collars outside the licence boundary</h2>
        <p className="text-micro text-muted">2 of 412 collars · KR-25-031 (38 m north-east) · KR-24-007 (12 m south)</p>
        <MapPanel asset={asset('kiboko')} className="mt-3 h-48" chrome={false} interactive={false} layers={{ imagery: false, settlements: false, roads: false, rail: false, power: false, claimed: false }} />
        <Note />
      </section>
    </div>
  )
}

/** ED-06 · Ask SSD for missing data (threaded, with due dates). */
function AskSsd({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [thread, setThread] = useState([
    { id: 1, from: 'nomvula', text: 'Are the blank results for batches 31–38 available? The QA/QC summary v1 lists none.', at: '2026-09-23T10:02', due: '2026-09-29', status: 'answered' },
    { id: 2, from: 'kevin', text: 'Grace uploaded QA/QC summary v2 on 22 Sep with the blanks for batches 31–35. Batches 36–38 are with the laboratory; expected 29 Sep.', at: '2026-09-23T14:40' },
    { id: 3, from: 'nomvula', text: 'Please share core photos for KR-25-014 to KR-25-022 so I can check the high-grade intercepts.', at: '2026-09-24T08:15', due: '2026-09-30', status: 'open' },
  ])
  const [text, setText] = useState('')
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Ask SSD"
      description="Questions about missing or unclear data. Kevin Omondi replies; everything is logged."
      size="md"
      footer={
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (!text) return
            setThread((t) => [...t, { id: t.length + 1, from: 'nomvula', text, at: '2026-09-24T09:40', due: '2026-10-01', status: 'open' }])
            setText('')
            toast.success('Question sent · due 1 Oct')
          }}
        >
          <Textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about missing data…" aria-label="Question" className="min-h-11" />
          <Button type="submit" icon={<SendHorizontal />} disabled={!text}>
            Send
          </Button>
        </form>
      }
    >
      <ol className="space-y-3">
        {thread.map((m) => (
          <li key={m.id} className={cn('flex gap-2.5', m.from === 'kevin' && 'pl-6')}>
            <Avatar id={m.from} size={28} />
            <div className={cn('min-w-0 flex-1 rounded-lg border p-3', m.from === 'kevin' ? 'border-primary/25 bg-primary-tint/50' : 'border-line bg-surface')}>
              <p className="flex flex-wrap items-center gap-2 text-micro">
                <span className="font-semibold">{person(m.from).name}</span>
                <span className="text-muted">{fmtDay(m.at)}</span>
                {m.due && <Chip size="sm" tone={m.status === 'open' ? 'review' : 'verified'} icon={m.status === 'open' ? undefined : <CircleCheck />}>{m.status === 'open' ? `Due ${fmtDay(m.due)}` : 'Answered'}</Chip>}
              </p>
              <p className="mt-1 text-meta">{m.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Sheet>
  )
}
