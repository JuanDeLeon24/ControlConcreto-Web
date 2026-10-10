import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'
import { RequireAuth } from './auth/RequireAuth'
import type { Permission } from './auth/permissions'
import { AppLayout } from './components/layout/AppLayout'
import { Dashboard } from './components/Dashboard'
import { Importar } from './components/Importar'
import { Monitoreo } from './components/Monitoreo'
import { Projects } from './components/Projects'
import { Registro } from './components/Registro'
import { LoginPage } from './pages/LoginPage'
import { PageLoader } from './pages/PageLoader'
import { RouteErrorPage } from './pages/RouteErrorPage'

// Las vistas 3D (three + fiber + drei) se descargan solo al entrar a ellas: fuera del bundle inicial.
const TunnelView = lazy(() => import('./components/TunnelView').then((m) => ({ default: m.TunnelView })))
const Tunel3D = lazy(() => import('./components/Tunel3D').then((m) => ({ default: m.Tunel3D })))

const guard = (element: ReactNode, permission?: Permission) => (
  <RequireAuth permission={permission}>{element}</RequireAuth>
)
const lazy3D = (element: ReactNode) => <Suspense fallback={<PageLoader label="Cargando visor 3D…" />}>{element}</Suspense>

export const routes: RouteObject[] = [
  { path: '/login', element: <LoginPage />, errorElement: <RouteErrorPage /> },
  {
    path: '/',
    element: guard(<AppLayout />),
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: guard(<Dashboard />, 'dashboard:view') },
      { path: 'monitoreo', element: guard(<Monitoreo />, 'monitoring:view') },
      { path: 'registro', element: guard(<Registro />, 'registro:create') },
      { path: 'importar', element: guard(<Importar />, 'import:run') },
      { path: 'projects', element: guard(<Projects />, 'projects:view') },
      { path: 'tunnel', element: guard(lazy3D(<TunnelView />), 'tunnel:view') },
      { path: 'tunel3d', element: guard(lazy3D(<Tunel3D />), 'tunnel:view') },
    ],
  },
]

export const router = createBrowserRouter(routes)
