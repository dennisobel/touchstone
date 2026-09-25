import type { RouteObject } from 'react-router'
import { named, screen } from '@/lib/route'

const auth = () => import('./OwnerAuth')
const signUp = screen(() => import('./OA01Welcome'))

// Owner App (OA-01 … OA-17). Sign-in and sign-up sit outside the app shell, in the shared auth layout.
export const ownerRoutes: RouteObject[] = [
  {
    lazy: screen(auth),
    children: [
      { path: 'owner/sign-in', lazy: named(auth, 'OwnerSignIn') },
      { path: 'owner/sign-up', lazy: signUp },
      { path: 'owner/welcome', lazy: signUp },
    ],
  },
  {
    path: 'owner',
    lazy: screen(() => import('./OwnerShell')),
    children: [
      { index: true, lazy: screen(() => import('./OA03Home')) },
      { path: 'verify-id', lazy: screen(() => import('./OA02IdentityCheck')) },
      { path: 'assets', lazy: screen(() => import('./OAAssets')) },
      { path: 'assets/new', lazy: screen(() => import('./OA04AddAsset')) },
      { path: 'assets/:id', lazy: screen(() => import('./OA08AssetStatus')) },
      { path: 'assets/:id/pay', lazy: screen(() => import('./OA07FeePayment')) },
      { path: 'assets/:id/findings', lazy: screen(() => import('./OA10Findings')) },
      { path: 'assets/:id/passport', lazy: screen(() => import('./OA11Passport')) },
      { path: 'assets/:id/teaser', lazy: screen(() => import('./OA12Teaser')) },
      { path: 'assets/:id/questions', lazy: screen(() => import('./OA13Questions')) },
      { path: 'assets/:id/views', lazy: screen(() => import('./OA14Views')) },
      { path: 'requests/:rid?', lazy: screen(() => import('./OA09Requests')) },
      { path: 'messages', lazy: screen(() => import('./OA15Messages')) },
      { path: 'account', lazy: screen(() => import('./OA17Account')) },
      { path: 'account/company', lazy: screen(() => import('./OA16Company')) },
    ],
  },
]
