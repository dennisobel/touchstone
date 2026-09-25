import { createBrowserRouter } from 'react-router'
import { screen } from '@/lib/route'
import { Root, RootError, RootFallback } from './root'
import { siteRoutes } from './site/routes'
import { ownerRoutes } from './apps/owner/routes'
import { commandRoutes } from './apps/command/routes'
import { expertRoutes } from './apps/expert/routes'
import { investorRoutes } from './apps/investor/routes'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    HydrateFallback: RootFallback,
    ErrorBoundary: RootError,
    children: [
      siteRoutes,
      { path: 'apps', lazy: screen(() => import('./launcher/Launcher')) },
      { path: 'gallery', lazy: screen(() => import('./gallery/Gallery')) },
      // Cross-cutting outputs (X-01, X-02, X-04)
      { path: 'print/passport/:id', lazy: screen(() => import('./outputs/PassportPrint')) },
      { path: 'notifications', lazy: screen(() => import('./outputs/Notifications')) },
      { path: 'system/:kind?', lazy: screen(() => import('./outputs/SystemPages')) },
      ...ownerRoutes,
      ...commandRoutes,
      ...expertRoutes,
      ...investorRoutes,
      { path: '*', lazy: screen(() => import('./outputs/NotFound')) },
    ],
  },
])
