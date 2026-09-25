import { ClipboardList, FileSearch, UserRound, Wallet } from 'lucide-react'
import { Outlet } from 'react-router'
import { assignments, person } from '@/data'
import { SidebarShell, type NavItem } from '@/ds/shell'

export const EXPERT_ID = 'nomvula'

export default function ExpertShell() {
  const offers = assignments.filter((a) => a.expertId === EXPERT_ID && a.status === 'offer').length
  const nav: NavItem[] = [
    { to: '/expert', label: 'Assignments', icon: ClipboardList, end: true, badge: offers, match: ['/expert/offers'] },
    { to: '/expert/reviews', label: 'Reviews', icon: FileSearch },
    { to: '/expert/payouts', label: 'Payouts', icon: Wallet },
    { to: '/expert/profile', label: 'Profile', icon: UserRound },
  ]
  const me = person(EXPERT_ID)
  return (
    <SidebarShell
      app="expert"
      appName="Expert Desk"
      density="comfortable"
      nav={nav}
      mobileTabs={nav}
      userId={EXPERT_ID}
      org={me.credentialBody ?? 'Expert'}
      viewer={{ name: me.name, org: 'Expert Desk', email: 'n.dlamini@example.co.za' }}
      notifications={[
        { title: 'New offer', body: 'Nyanza Reef Gold · resource review, historical estimate · USD 3,200', when: 'Today 08:10' },
        { title: 'Access ends in 3 days', body: 'Tsavo East Garnet · data check', when: 'Yesterday' },
        { title: 'Payout sent', body: 'Galana Flake Graphite · USD 7,200 · PAY-2026-0412', when: '28 Aug' },
      ]}
    >
      <Outlet />
    </SidebarShell>
  )
}
