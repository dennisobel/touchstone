import { TabNav } from '@/ds/ui'
export { Panel, StatTile } from '@/ds/components/panel'

export const verificationTabs = [
  { to: '/command/verification', label: 'Tasks and requests', end: true },
  { to: '/command/verification/flags', label: 'Red flags' },
  { to: '/command/verification/assignments', label: 'Assignments' },
]
export const dealsTabs = [
  { to: '/command/deals', label: 'Deal rooms and questions', end: true },
  { to: '/command/deals/pipeline', label: 'Pipeline boards' },
]
export const complianceTabs = [
  { to: '/command/compliance', label: 'Escalations', end: true },
  { to: '/command/compliance/rules', label: 'Rules catalogue' },
  { to: '/command/compliance/audit', label: 'Audit explorer' },
]
export const intelligenceTabs = [
  { to: '/command/intelligence', label: 'Analytics', end: true },
  { to: '/command/intelligence/packs', label: 'Jurisdiction packs' },
]

export function SectionTabs({ items }: { items: { to: string; label: string; end?: boolean }[] }) {
  return <TabNav items={items} className="-mx-4 px-4 md:mx-0 md:px-0" />
}
