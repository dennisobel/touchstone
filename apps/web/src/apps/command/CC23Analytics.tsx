import { ChartColumn, Table2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useChartTheme } from '@/lib/chart'
import { useDemoState } from '@/lib/demo-states'
import { analytics } from '@/data'
import { AsOf, StatTile } from '@/ds/components'
import { Page } from '@/ds/shell'
import { Chip, Segmented, Tabs, TabsContent, TabsList, TabsTrigger } from '@/ds/ui'
import { intelligenceTabs, SectionTabs } from './common'

const STATES = [{ id: 'default', label: 'Default' }] as const

type Row = Record<string, string | number>

/** Chart card: title, definition, as-of, and a table view for every chart (UI PRD §5 chart palette note). */
function ChartCard({
  title,
  definition,
  children,
  table,
  legend,
}: {
  title: string
  definition: string
  children: ReactNode
  table: { cols: { key: string; label: string; fmt?: (v: number | string) => string }[]; rows: Row[] }
  legend?: { label: string; color: string }[]
}) {
  const [view, setView] = useState<'chart' | 'table'>('chart')
  return (
    <section className="flex flex-col rounded-lg border border-line bg-surface p-4 shadow-e1">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-h3 font-semibold">{title}</h3>
          <p className="text-micro text-muted">{definition}</p>
        </div>
        <Segmented
          ariaLabel={`${title} view`}
          size="sm"
          value={view}
          onChange={setView}
          options={[
            { value: 'chart', label: <span className="sr-only md:not-sr-only">Chart</span>, icon: <ChartColumn /> },
            { value: 'table', label: <span className="sr-only md:not-sr-only">Table</span>, icon: <Table2 /> },
          ]}
        />
      </div>
      {legend && legend.length > 1 && view === 'chart' && (
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-micro text-muted">
          {legend.map((l) => (
            <li key={l.label} className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded-full" style={{ background: l.color }} aria-hidden />
              {l.label}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex-1">
        {view === 'chart' ? (
          <div className="h-56">{children}</div>
        ) : (
          <div className="max-h-56 overflow-auto">
            <table className="w-full text-meta">
              <thead>
                <tr className="border-b border-line text-left text-micro text-muted">
                  {table.cols.map((c) => (
                    <th key={c.key} className="py-1.5 pr-3 font-medium">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {table.rows.map((r, i) => (
                  <tr key={i} className="border-b border-line/60 last:border-0">
                    {table.cols.map((c) => (
                      <td key={c.key} className="py-1.5 pr-3">
                        {c.fmt ? c.fmt(r[c.key]) : r[c.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <AsOf className="mt-2" />
    </section>
  )
}

function useAxes() {
  const t = useChartTheme()
  const tick = { fill: t.axis, fontSize: 11 }
  const tooltip = {
    contentStyle: { background: t.tooltipBg, border: `1px solid ${t.grid}`, borderRadius: 8, fontSize: 12, color: t.text },
    labelStyle: { color: t.text, fontWeight: 600 },
    cursor: { stroke: t.grid, strokeWidth: 1 },
  }
  return { t, tick, tooltip }
}

export default function CC23Analytics() {
  useDemoState('CC-23', STATES)
  const { t, tick, tooltip } = useAxes()
  const ring = t.tooltipBg
  const endDot = (color: string) => (p: { cx?: number; cy?: number; index?: number }) =>
    p.index === analytics.medianDays.length - 1 ? <circle key={p.index} cx={p.cx} cy={p.cy} r={4.5} fill={color} stroke={ring} strokeWidth={2} /> : <g key={p.index} />

  return (
    <Page title="Analytics" large headerExtra={<SectionTabs items={intelligenceTabs} />}>
      <Tabs defaultValue="ops">
        <TabsList className="-mx-4 mb-4 px-4 md:mx-0 md:px-0">
          <TabsTrigger value="ops">Operations</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="sat">Satisfaction</TabsTrigger>
          <TabsTrigger value="comp">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="ops" className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile label="Median days to Standard passport" value="31" trend={{ dir: 'down', text: '−3 vs Aug', good: true }} sub="target 30" />
            <StatTile label="Passports released" value="21" sub="since April" />
            <StatTile label="Missed deadlines (Sep)" value="3" trend={{ dir: 'down', text: '−1 vs Aug', good: true }} />
            <StatTile label="Cost per Standard passport" value="USD 2,840" sub="38% below Phase 0 baseline" />
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard
              title="Median days to passport"
              definition="Median days from accepted submission to release, by tier and month"
              legend={[
                { label: 'Standard', color: t.series[0] },
                { label: 'Desk screen', color: t.series[1] },
              ]}
              table={{ cols: [{ key: 'month', label: 'Month' }, { key: 'standard', label: 'Standard (d)' }, { key: 'desk', label: 'Desk screen (d)' }], rows: analytics.medianDays }}
            >
              <ResponsiveContainer>
                <LineChart data={analytics.medianDays} margin={{ top: 12, right: 44, left: -16, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={t.grid} />
                  <XAxis dataKey="month" tick={tick} tickLine={false} axisLine={{ stroke: t.grid }} />
                  <YAxis tick={tick} tickLine={false} axisLine={false} domain={[0, 50]} />
                  <Tooltip {...tooltip} formatter={(v, n) => [`${v} days`, n === 'standard' ? 'Standard' : 'Desk screen']} />
                  <Line type="monotone" dataKey="standard" stroke={t.series[0]} strokeWidth={2} dot={endDot(t.series[0])} activeDot={{ r: 5, stroke: ring, strokeWidth: 2 }} isAnimationActive={false}>
                    <LabelList dataKey="standard" content={(p) => (p.index === 5 ? <text x={Number(p.x) + 10} y={Number(p.y) + 4} fill={t.text} fontSize={11} fontWeight={600}>{p.value} d</text> : null)} />
                  </Line>
                  <Line type="monotone" dataKey="desk" stroke={t.series[1]} strokeWidth={2} dot={endDot(t.series[1])} activeDot={{ r: 5, stroke: ring, strokeWidth: 2 }} isAnimationActive={false}>
                    <LabelList dataKey="desk" content={(p) => (p.index === 5 ? <text x={Number(p.x) + 10} y={Number(p.y) + 4} fill={t.text} fontSize={11} fontWeight={600}>{p.value} d</text> : null)} />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard
              title="Cycle time by workstream"
              definition="Median working days per workstream, Standard tier, last 90 days"
              table={{ cols: [{ key: 'workstream', label: 'Workstream' }, { key: 'days', label: 'Days' }], rows: analytics.cycleByWorkstream }}
            >
              <ResponsiveContainer>
                <BarChart data={analytics.cycleByWorkstream} layout="vertical" margin={{ top: 0, right: 36, left: 8, bottom: 0 }}>
                  <CartesianGrid horizontal={false} stroke={t.grid} />
                  <XAxis type="number" tick={tick} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="workstream" tick={tick} tickLine={false} axisLine={false} width={86} interval={0} />
                  <Tooltip {...tooltip} cursor={{ fill: 'transparent' }} formatter={(v) => [`${v} days`, 'Median']} />
                  <Bar dataKey="days" fill={t.series[0]} radius={[0, 4, 4, 0]} maxBarSize={18} isAnimationActive={false}>
                    <LabelList dataKey="days" position="right" fill={t.text} fontSize={11} formatter={(v) => `${v} d`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard
              title="Missed task deadlines"
              definition="Tasks more than 2 working days late, by month"
              table={{ cols: [{ key: 'month', label: 'Month' }, { key: 'missed', label: 'Missed' }], rows: analytics.missedDeadlines }}
            >
              <ResponsiveContainer>
                <BarChart data={analytics.missedDeadlines} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={t.grid} />
                  <XAxis dataKey="month" tick={tick} tickLine={false} axisLine={{ stroke: t.grid }} />
                  <YAxis tick={tick} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip {...tooltip} cursor={{ fill: 'transparent' }} formatter={(v) => [v, 'Missed']} />
                  <Bar dataKey="missed" fill={t.series[0]} radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false}>
                    <LabelList dataKey="missed" position="top" fill={t.text} fontSize={11} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>

        <TabsContent value="funnel">
          <ChartCard
            title="Funnel"
            definition="Counts since April 2026. Teasers can exceed releases: one passport goes to several investors."
            table={{ cols: [{ key: 'stage', label: 'Stage' }, { key: 'value', label: 'Count' }], rows: analytics.funnel }}
          >
            <ResponsiveContainer>
              <BarChart data={analytics.funnel} layout="vertical" margin={{ top: 0, right: 40, left: 8, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke={t.grid} />
                <XAxis type="number" tick={tick} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="stage" tick={tick} tickLine={false} axisLine={false} width={110} interval={0} />
                <Tooltip {...tooltip} cursor={{ fill: 'transparent' }} formatter={(v) => [v, 'Count']} />
                <Bar dataKey="value" fill={t.series[0]} radius={[0, 4, 4, 0]} maxBarSize={22} isAnimationActive={false}>
                  <LabelList dataKey="value" position="right" fill={t.text} fontSize={11} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <p className="mt-3 text-meta text-muted">
            North Star: <span className="font-semibold text-fg">qualified NDAs per month on verified assets</span> · September: 3 (target by month 15: 40 cumulative)
          </p>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <StatTile label="Critical discoveries after release" value="0" sub="target 0 · since launch" />
            <StatTile label="Material claims at E2 or above" value="84%" sub="target 80%" />
            <StatTile label="Material claims fresh" value="93%" sub="target 95%" trend={{ dir: 'down', text: '−1 pt', good: false }} />
          </div>
          <ChartCard
            title="Claim reversals and expert rework"
            definition="Claims later disputed or overturned, and expert deliverables returned for rework, per month"
            legend={[
              { label: 'Claim reversals', color: t.series[0] },
              { label: 'Expert rework', color: t.series[1] },
            ]}
            table={{ cols: [{ key: 'month', label: 'Month' }, { key: 'reversals', label: 'Reversals' }, { key: 'rework', label: 'Rework' }], rows: analytics.quality }}
          >
            <ResponsiveContainer>
              <LineChart data={analytics.quality} margin={{ top: 12, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={t.grid} />
                <XAxis dataKey="month" tick={tick} tickLine={false} axisLine={{ stroke: t.grid }} />
                <YAxis tick={tick} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip {...tooltip} formatter={(v, n) => [v, n === 'reversals' ? 'Claim reversals' : 'Expert rework']} />
                <Line dataKey="reversals" stroke={t.series[0]} strokeWidth={2} dot={false} activeDot={{ r: 5, stroke: ring, strokeWidth: 2 }} isAnimationActive={false} />
                <Line dataKey="rework" stroke={t.series[1]} strokeWidth={2} dot={false} activeDot={{ r: 5, stroke: ring, strokeWidth: 2 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="sat" className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <StatTile label="Owner effort (1–7)" value="5.8" sub="“Submitting was easy” · target 5.5" />
            <StatTile label="Owner satisfaction (1–5)" value="4.4" sub="after release · target 4.3" />
            <StatTile label="Investor NPS" value="41" trend={{ dir: 'up', text: '+3', good: true }} sub="target 40" />
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard title="Investor NPS" definition="Quarterly survey, rolling monthly" table={{ cols: [{ key: 'month', label: 'Month' }, { key: 'nps', label: 'NPS' }], rows: analytics.satisfaction }}>
              <ResponsiveContainer>
                <LineChart data={analytics.satisfaction} margin={{ top: 16, right: 40, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={t.grid} />
                  <XAxis dataKey="month" tick={tick} tickLine={false} axisLine={{ stroke: t.grid }} />
                  <YAxis tick={tick} tickLine={false} axisLine={false} domain={[0, 60]} />
                  <Tooltip {...tooltip} formatter={(v) => [v, 'NPS']} />
                  <Line dataKey="nps" stroke={t.series[0]} strokeWidth={2} dot={endDot(t.series[0])} isAnimationActive={false}>
                    <LabelList dataKey="nps" content={(p) => (p.index === 5 ? <text x={Number(p.x) + 10} y={Number(p.y) + 4} fill={t.text} fontSize={11} fontWeight={600}>{p.value}</text> : null)} />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <section className="rounded-lg border border-line bg-surface p-4 shadow-e1">
              <h3 className="text-h3 font-semibold">Recent comments</h3>
              <ul className="mt-3 space-y-3">
                {analytics.comments.map((c) => (
                  <li key={c.text} className="rounded-sm border border-line p-3">
                    <div className="flex items-center justify-between gap-2 text-micro text-muted">
                      <span>{c.who}</span>
                      <Chip tone={c.score <= 2 ? 'critical' : 'neutral'} size="sm">
                        Score {c.score}
                      </Chip>
                    </div>
                    <p className="mt-1 text-meta">“{c.text}”</p>
                    {c.followUp && <p className="mt-1 text-micro text-primary">{c.followUp} (scores of 2 or below get a named follow-up within 2 working days)</p>}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="comp" className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile label="Relationship-first introductions" value="100%" sub="target 100%" />
            <StatTile label="Escalations within deadline" value="95%" sub="last 6 months · target 95%" />
            <StatTile label="Fees tied to a closing" value="0" sub="R03 hard stops: 0" />
            <StatTile label="Staff attestations (Sep)" value="6 of 6" sub="no off-platform deal talk" />
          </div>
          <ChartCard title="Rule hits" definition="All rule evaluations that fired, any level, per month" table={{ cols: [{ key: 'month', label: 'Month' }, { key: 'hits', label: 'Hits' }, { key: 'escalations', label: 'Escalations' }], rows: analytics.compliance }}>
            <ResponsiveContainer>
              <BarChart data={analytics.compliance} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={t.grid} />
                <XAxis dataKey="month" tick={tick} tickLine={false} axisLine={{ stroke: t.grid }} />
                <YAxis tick={tick} tickLine={false} axisLine={false} />
                <Tooltip {...tooltip} cursor={{ fill: 'transparent' }} formatter={(v) => [v, 'Rule hits']} />
                <Bar dataKey="hits" fill={t.series[0]} radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false}>
                  <LabelList dataKey="hits" position="top" fill={t.text} fontSize={11} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </Page>
  )
}
