import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'
import { renderRoutes } from '../test/utils'
import { LoginPage } from './LoginPage'

const routes = [
  { path: '/login', element: <LoginPage /> },
  { path: '/dashboard', element: <h1>Inicio</h1> },
]

describe('LoginPage', () => {
  it('no tiene violaciones de accesibilidad detectables (axe)', async () => {
    const { container } = renderRoutes(routes, '/login')
    await screen.findByRole('heading', { name: 'Iniciar sesión' })
    // color-contrast se desactiva: jsdom no calcula estilos; se revisa en el navegador con Lighthouse.
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
  })

  it('los campos tienen etiqueta accesible', () => {
    renderRoutes(routes, '/login')
    expect(screen.getByLabelText('Correo corporativo')).toBeInTheDocument()
    expect(screen.getByLabelText('Rol (solo demostración)')).toBeInTheDocument()
  })

  it('rechaza correos fuera del dominio y anuncia el error', async () => {
    renderRoutes(routes, '/login')
    await userEvent.type(screen.getByLabelText('Correo corporativo'), 'alguien@gmail.com')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('@elcondor.com')
  })

  it('con correo válido entra y redirige', async () => {
    const { router } = renderRoutes(routes, '/login')
    await userEvent.type(screen.getByLabelText('Correo corporativo'), 'juan.deleon@elcondor.com')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByRole('heading', { name: 'Inicio' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/dashboard')
  })
})
