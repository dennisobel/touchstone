import {
  BarChart3,
  Building2,
  ClipboardCheck,
  FileSearch,
  Flag,
  Handshake,
  House,
  Kanban,
  Landmark,
  Layers,
  ListChecks,
  Pickaxe,
  Scale,
  Settings2,
  ShieldCheck,
  UserRoundCog,
  Users,
  Workflow,
} from 'lucide-react'
import { useMemo } from 'react'
import { Outlet } from 'react-router'
import { useDemo, type CommandPersona } from '@/lib/store'
import { assets, escalations, investors, person, tasks } from '@/data'
import { ShortcutsOverlay, SidebarShell, type Command, type NavItem } from '@/ds/shell'

export const PERSONA_ORG: Record<CommandPersona, string> = {
  kevin: 'SSD · Analyst',
  sarah: 'SSD · Compliance',
  james: 'SSD · Managing partner',
  aisha: 'SSD · Operations',
}

export default function CommandShell() {
  const persona = useDemo((s) => s.commandPersona)
  const setPersona = useDemo((s) => s.setCommandPersona)
  const blocked = tasks.filter((t) => t.group === 'blocked').length
  const openEsc = escalations.filter((e) => e.status === 'open').length

  const nav: NavItem[] = [
    { to: '/command', label: 'Home', icon: House, end: true },
    { to: '/command/assets', label: 'Assets', icon: Pickaxe, section: 'Operate' },
    { to: '/command/verification', label: 'Verification', icon: ListChecks, section: 'Operate', badge: blocked },
    { to: '/command/investors', label: 'Investors', icon: Building2, section: 'Demand' },
    { to: '/command/matching', label: 'Matching', icon: Workflow, section: 'Demand' },
    { to: '/command/deals', label: 'Deals', icon: Handshake, section: 'Demand' },
    { to: '/command/compliance', label: 'Compliance', icon: Scale, section: 'Control', badge: openEsc },
    { to: '/command/network', label: 'Network', icon: Users, section: 'Control' },
    { to: '/command/intelligence', label: 'Intelligence', icon: BarChart3, section: 'Control' },
    { to: '/command/admin', label: 'Admin', icon: Settings2, section: 'Control' },
  ]

  const commands: Command[] = useMemo(
    () => [
      ...nav.map((n) => ({ id: `nav-${n.to}`, label: n.label, group: 'Go to', icon: <n.icon />, to: n.to })),
      { id: 'flags', label: 'Red-flag register', group: 'Go to', icon: <Flag />, to: '/command/verification/flags' },
      { id: 'assign', label: 'Assignments', group: 'Go to', icon: <ClipboardCheck />, to: '/command/verification/assignments' },
      { id: 'pipeline', label: 'Pipeline boards', group: 'Go to', icon: <Kanban />, to: '/command/deals/pipeline' },
      { id: 'rules', label: 'Rules catalogue', group: 'Go to', icon: <ShieldCheck />, to: '/command/compliance/rules' },
      { id: 'audit', label: 'Audit explorer', group: 'Go to', icon: <FileSearch />, to: '/command/compliance/audit' },
      { id: 'packs', label: 'Jurisdiction pack editor', group: 'Go to', icon: <Landmark />, to: '/command/intelligence/packs' },
      ...assets.map((a) => ({ id: `a-${a.id}`, label: a.name, hint: a.code, group: 'Assets', icon: <Layers />, to: `/command/assets/${a.id}`, keywords: `${a.commodity} ${a.county}` })),
      ...investors.map((i) => ({ id: `i-${i.id}`, label: i.name, hint: person(i.contactId).name, group: 'Investors', icon: <Building2 />, to: `/command/investors/${i.id}` })),
      { id: 'x-release', label: 'Release passport · Mawe Mekundu', group: 'Actions', icon: <ShieldCheck />, to: '/command/assets/mawe/release' },
      { id: 'x-triage', label: 'Triage new submission · Mutomo Iron Ridge', group: 'Actions', icon: <ClipboardCheck />, to: '/command/assets/mutomo/triage' },
      { id: 'x-teaser', label: 'Build teaser · KE-GR-07', group: 'Actions', icon: <Workflow />, to: '/command/matching/teaser/kiboko' },
      ...(['kevin', 'sarah', 'james', 'aisha'] as CommandPersona[]).map((p) => ({
        id: `p-${p}`,
        label: `Act as ${person(p).name}`,
        hint: PERSONA_ORG[p],
        group: 'Demo',
        icon: <UserRoundCog />,
        run: () => setPersona(p),
      })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return (
    <SidebarShell
      app="command"
      appName="Command Center"
      density="compact"
      nav={nav}
      mobileTabs={[nav[0], nav[1], nav[2], nav[6]]}
      mobileMore={[
        nav[3],
        nav[4],
        nav[5],
        nav[7],
        nav[8],
        nav[9],
        { to: '/command/verification/flags', label: 'Red flags', icon: Flag },
        { to: '/command/deals/pipeline', label: 'Pipeline', icon: Kanban },
        { to: '/command/compliance/audit', label: 'Audit', icon: FileSearch },
      ]}
      userId={persona}
      org={PERSONA_ORG[persona]}
      commands={commands}
      viewer={{ name: person(persona).name, org: 'SSD', email: person(persona).email }}
      notifications={[
        { title: 'Owner replies received', body: 'Kakamega Shear Gold · 2 disputed findings', when: 'Today 08:55' },
        { title: 'Escalation due tomorrow', body: 'R04 · Engagement letter EL-2026-031', when: 'Yesterday 17:20' },
        { title: 'QA/QC data uploaded', body: 'Kiboko Ridge Graphite · v2 of the QA/QC summary', when: '22 Sep 10:03' },
      ]}
      topbarExtra={
        <select
          aria-label="Act as (demo)"
          value={persona}
          onChange={(e) => setPersona(e.target.value as CommandPersona)}
          className="hidden h-9 rounded-full border border-dashed border-brand/50 bg-surface px-3 text-micro font-medium text-fg lg:block"
        >
          {(['kevin', 'sarah', 'james', 'aisha'] as CommandPersona[]).map((p) => (
            <option key={p} value={p}>
              Act as {person(p).name} ({PERSONA_ORG[p].replace('SSD · ', '')})
            </option>
          ))}
        </select>
      }
    >
      <Outlet />
      <ShortcutsOverlay
        shortcuts={[
          { keys: ['Ctrl', 'K'], label: 'Search or jump to anything' },
          { keys: ['J'], label: 'Next row or claim' },
          { keys: ['K'], label: 'Previous row or claim' },
          { keys: ['Enter'], label: 'Open the selected row' },
          { keys: ['A'], label: 'Assign (queue)' },
          { keys: ['S'], label: 'Snooze with a reason (queue)' },
          { keys: ['V'], label: 'Verify claim (workbench)' },
          { keys: ['D'], label: 'Mark discrepancy (workbench)' },
          { keys: ['R'], label: 'Request information (workbench)' },
          { keys: ['F'], label: 'Raise flag (workbench)' },
          { keys: ['E'], label: 'Assign expert (workbench)' },
          { keys: ['?'], label: 'Show this overlay' },
        ]}
      />
    </SidebarShell>
  )
}
