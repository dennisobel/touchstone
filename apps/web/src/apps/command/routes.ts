import type { RouteObject } from 'react-router'
import { named, screen } from '@/lib/route'

const auth = () => import('./CommandAuth')
const asset = () => import('./CC04Asset')
const inv = () => import('./CC12Investors')
const comp = () => import('./CC18Compliance')

// Command Center (CC-01 … CC-24). Staff sign-in, the invitation gate and account activation sit outside the shell.
export const commandRoutes: RouteObject[] = [
  {
    lazy: screen(auth),
    children: [
      { path: 'command/sign-in', lazy: named(auth, 'CommandSignIn') },
      { path: 'command/sign-up', lazy: named(auth, 'CommandSignUp') },
      { path: 'command/invite', lazy: named(auth, 'CommandInvite') },
    ],
  },
  {
    path: 'command',
    lazy: screen(() => import('./CommandShell')),
    children: [
      { index: true, lazy: screen(() => import('./CC01Home')) },
      { path: 'assets', lazy: screen(() => import('./CC02Assets')) },
      { path: 'assets/:id/triage', lazy: screen(() => import('./CC03Triage')) },
      {
        path: 'assets/:id',
        lazy: screen(asset),
        children: [
          { index: true, lazy: named(asset, 'AssetOverview') },
          { path: 'workbench', lazy: screen(() => import('./CC05Workbench')) },
          { path: 'map', lazy: screen(() => import('./CC06Map')) },
          { path: 'flags', lazy: named(asset, 'AssetFlags') },
          { path: 'tasks', lazy: named(asset, 'AssetTasks') },
          { path: 'documents', lazy: named(asset, 'AssetDocuments') },
          { path: 'people', lazy: named(asset, 'AssetPeople') },
          { path: 'activity', lazy: named(asset, 'AssetActivity') },
          { path: 'findings', lazy: screen(() => import('./CC10Findings')) },
          { path: 'release', lazy: screen(() => import('./CC11Release')) },
        ],
      },
      { path: 'verification', lazy: screen(() => import('./CC08Board')) },
      { path: 'verification/flags', lazy: screen(() => import('./CC07Flags')) },
      { path: 'verification/assignments', lazy: screen(() => import('./CC09Assignments')) },
      { path: 'investors', lazy: screen(inv) },
      { path: 'investors/:id', lazy: named(inv, 'InvestorWorkspace') },
      { path: 'investors/:id/qualification', lazy: named(inv, 'QualificationReview') },
      { path: 'matching', lazy: screen(() => import('./CC14Matching')) },
      { path: 'matching/teaser/:id', lazy: screen(() => import('./CC15Teaser')) },
      { path: 'deals', lazy: screen(() => import('./CC16Deals')) },
      { path: 'deals/pipeline', lazy: screen(() => import('./CC17Pipeline')) },
      { path: 'compliance', lazy: screen(comp) },
      { path: 'compliance/rules', lazy: named(comp, 'CC19Rules') },
      { path: 'compliance/audit', lazy: named(comp, 'CC20Audit') },
      { path: 'network', lazy: screen(() => import('./CC21Network')) },
      { path: 'intelligence', lazy: screen(() => import('./CC23Analytics')) },
      { path: 'intelligence/packs', lazy: screen(() => import('./CC22Packs')) },
      { path: 'admin', lazy: screen(() => import('./CC24Admin')) },
    ],
  },
]
