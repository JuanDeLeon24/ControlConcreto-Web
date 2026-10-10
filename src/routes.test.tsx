import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { loginAs, renderRoutes } from './test/utils'
import { routes } from './routes'

// Las páginas se reemplazan por stubs: aquí se prueba el enrutamiento y los permisos, no su contenido.
vi.mock('./components/Dashboard', () => ({ Dashboard: () => <h1>Stub Dashboard</h1> }))
vi.mock('./components/Monitoreo', () => ({ Monitoreo: () => <h1>Stub Monitoreo</h1> }))
vi.mock('./components/Registro', () => ({ Registro: () => <h1>Stub Registro</h1> }))
vi.mock('./components/Importar', () => ({ Importar: () => <h1>Stub Importar</h1> }))
vi.mock('./components/Projects', () => ({ Projects: () => <h1>Stub Proyectos</h1> }))
vi.mock('./components/TunnelView', () => ({ TunnelView: () => <h1>Stub Túnel</h1> }))
vi.mock('./components/Tunel3D', () => ({ Tunel3D: () => <h1>Stub Túnel 3D</h1> }))


describe('rutas', () => {
  it('sin sesión redirige al login', async () => {
    await loginAs(null)
    const { router } = renderRoutes(routes, '/dashboard')
    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
  })

  it('la raíz lleva al dashboard', async () => {
    await loginAs('gerencia')
    const { router } = renderRoutes(routes, '/')
    expect(await screen.findByRole('heading', { name: 'Stub Dashboard' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/dashboard')
  })

  it('un inspector no puede importar (403)', async () => {
    await loginAs('inspector')
    renderRoutes(routes, '/importar')
    expect(await screen.findByText('403')).toBeInTheDocument()
    expect(screen.queryByText('Stub Importar')).not.toBeInTheDocument()
  })

  it('un jefe de obra sí puede importar', async () => {
    await loginAs('jefe_obra')
    renderRoutes(routes, '/importar')
    expect(await screen.findByRole('heading', { name: 'Stub Importar' })).toBeInTheDocument()
  })

  it('el menú solo muestra lo que el rol puede usar', async () => {
    await loginAs('gerencia')
    renderRoutes(routes, '/dashboard')
    await screen.findByRole('heading', { name: 'Stub Dashboard' })
    expect(screen.queryAllByRole('link', { name: /Registro/ })).toHaveLength(0)
    expect(screen.getAllByRole('link', { name: /Túnel 3D/ }).length).toBeGreaterThan(0)
  })

  it('la vista 3D se carga de forma diferida', async () => {
    await loginAs('inspector')
    renderRoutes(routes, '/tunnel')
    expect(await screen.findByRole('heading', { name: 'Stub Túnel' })).toBeInTheDocument()
  })

  it('una ruta inexistente muestra 404', async () => {
    await loginAs('admin')
    renderRoutes(routes, '/reports')
    expect(await screen.findByText('Esta página no existe')).toBeInTheDocument()
  })
})
