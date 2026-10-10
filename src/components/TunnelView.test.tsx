import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTunnelStore } from '../store/useTunnelStore'
import { Providers } from '../test/utils'
import { TunnelView } from './TunnelView'

// jsdom no tiene WebGL: se reemplaza solo el <Canvas>. El resto de la vista (carga de datos,
// panel, barra de módulos) es el código real.
vi.mock('./TunnelScene', () => ({
  TunnelScene: (p: { front: number; focusZ: number }) => (
    <div data-testid="scene" data-front={p.front} data-focus={p.focusZ} />
  ),
}))


describe('TunnelView (montaje 3D)', () => {
  beforeEach(() => useTunnelStore.setState(useTunnelStore.getInitialState(), true))

  it('muestra carga y luego el visor con el avance real', async () => {
    render(<TunnelView />, { wrapper: Providers })
    expect(screen.getByRole('status')).toHaveTextContent('Cargando datos del túnel')
    const scene = await screen.findByTestId('scene')
    expect(Number(scene.dataset.front)).toBe(42) // 7 módulos × 6 m en los datos de demostración
    expect(Number(scene.dataset.focus)).toBe(30) // 12 m antes del frente
  })

  it('usa el avance previsualizado del store', async () => {
    useTunnelStore.setState({ front: 100 })
    render(<TunnelView />, { wrapper: Providers })
    expect(Number((await screen.findByTestId('scene')).dataset.front)).toBe(100)
  })

  it('explica cuando el frente no tiene modelo 3D', async () => {
    useTunnelStore.getState().setActiveProject('cc167-t4')
    render(<TunnelView />, { wrapper: Providers })
    expect(await screen.findByRole('alert')).toHaveTextContent('todavía no tiene modelo 3D')
  })
})
