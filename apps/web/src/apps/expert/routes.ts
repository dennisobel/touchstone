import type { RouteObject } from 'react-router'
import { named, screen } from '@/lib/route'

const auth = () => import('./ExpertAuth')

// Expert Desk (ED-01 … ED-07). Sign-in, sign-up (invitation) and invitation acceptance sit outside the desk shell.
export const expertRoutes: RouteObject[] = [
  {
    lazy: screen(auth),
    children: [
      { path: 'expert/sign-in', lazy: named(auth, 'ExpertSignIn') },
      { path: 'expert/sign-up', lazy: named(auth, 'ExpertSignUp') },
      { path: 'expert/invite', lazy: named(auth, 'ExpertInvite') },
    ],
  },
  {
    path: 'expert',
    lazy: screen(() => import('./ExpertShell')),
    children: [
      { index: true, lazy: screen(() => import('./ED01Inbox')) },
      { path: 'offers/:id', lazy: screen(() => import('./ED02Offer')) },
      { path: 'reviews', lazy: screen(() => import('./EDReviews')) },
      { path: 'reviews/:id', lazy: screen(() => import('./ED03Review')) },
      { path: 'reviews/:id/sign', lazy: screen(() => import('./ED05SignOff')) },
      { path: 'profile', lazy: screen(() => import('./ED07Profile')) },
      { path: 'payouts', lazy: named(() => import('./ED07Profile'), 'ED07Payouts') },
    ],
  },
]
