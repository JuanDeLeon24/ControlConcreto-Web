import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthProvider'
import { createMockAdapter } from '../auth/mockAdapter'
import type { Role } from '../shared/types'

export const testQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } })

/** Inicia sesión de demostración antes de renderizar (o deja sin sesión si role es null). */
export async function loginAs(role: Role | null) {
  const adapter = createMockAdapter(localStorage)
  if (role) await adapter.signIn({ email: 'prueba@elcondor.com', demoRole: role })
  return adapter
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={testQueryClient()}>
      <AuthProvider adapter={createMockAdapter(localStorage)}>{children}</AuthProvider>
    </QueryClientProvider>
  )
}

export function renderRoutes(routes: RouteObject[], path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return { router, ...render(<RouterProvider router={router} />, { wrapper: Providers }) }
}
