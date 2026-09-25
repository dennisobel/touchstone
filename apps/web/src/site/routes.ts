import type { RouteObject } from 'react-router'
import { screen } from '@/lib/route'

// X-03 · Public site (L0). The landing page lives at "/"; the prototype launcher moved to "/apps".
export const siteRoutes: RouteObject = {
  lazy: screen(() => import('./SiteLayout')),
  children: [
    { index: true, lazy: screen(() => import('./Landing')) },
    { path: 'for/licence-holders', lazy: screen(() => import('./ForLicenceHolders')) },
    { path: 'for/investors', lazy: screen(() => import('./ForInvestors')) },
    { path: 'for/experts', lazy: screen(() => import('./ForExperts')) },
    { path: 'methodology', lazy: screen(() => import('./Methodology')) },
    { path: 'about', lazy: screen(() => import('./About')) },
    { path: 'contact', lazy: screen(() => import('./Contact')) },
  ],
}
