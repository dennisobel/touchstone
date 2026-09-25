import type { RouteObject } from 'react-router'
import { named, screen } from '@/lib/route'

const onboarding = () => import('./IP01Invite')
const signIn = () => import('./InvestorAuth')
const teaser = () => import('./IP05Teaser')
const lists = () => import('./IPLists')
const room = () => import('./IP07Room')
const compare = () => import('./IP11Compare')
const library = () => import('./IP12Library')

// Investor Portal (IP-01 … IP-15). Sign-in, sign-up (invitation) and onboarding sit outside the portal shell.
export const investorRoutes: RouteObject[] = [
  {
    lazy: screen(signIn),
    children: [
      { path: 'investor/sign-in', lazy: named(signIn, 'InvestorSignIn') },
      { path: 'investor/sign-up', lazy: named(signIn, 'InvestorSignUp') },
      { path: 'investor/invite', lazy: named(onboarding, 'IP01Invite') },
    ],
  },
  {
    lazy: screen(onboarding),
    children: [{ path: 'investor/qualification', lazy: named(onboarding, 'IP02Qualification') }],
  },
  {
    path: 'investor',
    lazy: screen(() => import('./InvestorShell')),
    children: [
      { index: true, lazy: screen(() => import('./IP04Home')) },
      { path: 'mandate', lazy: screen(() => import('./IP03Mandate')) },
      { path: 'opportunities', lazy: screen(lists) },
      { path: 'teasers/:id', lazy: screen(teaser) },
      { path: 'teasers/:id/nda', lazy: named(teaser, 'IP06Nda') },
      { path: 'rooms', lazy: named(lists, 'DealRoomsList') },
      {
        path: 'rooms/:id',
        lazy: screen(room),
        children: [
          { index: true, lazy: named(room, 'RoomPassport') },
          { path: 'documents', lazy: named(room, 'RoomDocuments') },
          { path: 'questions', lazy: named(room, 'RoomQuestions') },
          { path: 'diligence', lazy: named(room, 'RoomDiligence') },
        ],
      },
      { path: 'compare', lazy: screen(compare) },
      { path: 'exports', lazy: named(compare, 'IP15Exports') },
      { path: 'library', lazy: screen(library) },
      { path: 'watchlist', lazy: named(library, 'IP13Watchlist') },
      { path: 'team', lazy: screen(() => import('./IP14Team')) },
    ],
  },
]
