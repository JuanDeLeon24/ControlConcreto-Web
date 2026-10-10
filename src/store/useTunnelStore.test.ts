import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_LAYERS, TUNNEL_STORE_KEY, useTunnelStore } from './useTunnelStore'

const initial = useTunnelStore.getInitialState()

describe('useTunnelStore', () => {
  beforeEach(() => useTunnelStore.setState(initial, true))

  it('arranca con el proyecto T0, todas las capas y avance automático', () => {
    const s = useTunnelStore.getState()
    expect(s.activeProjectId).toBe('cc167-t0')
    expect(s.layers).toEqual(DEFAULT_LAYERS)
    expect(s.front).toBeNull()
    expect(s.focusZ).toBeNull()
  })

  it('toggleLayer invierte solo la capa indicada', () => {
    useTunnelStore.getState().toggleLayer('labels')
    const { layers } = useTunnelStore.getState()
    expect(layers.labels).toBe(false)
    expect(layers.lining).toBe(true)
  })

  it('no acepta avances negativos', () => {
    useTunnelStore.getState().setFront(-5)
    expect(useTunnelStore.getState().front).toBe(0)
  })

  it('al cambiar de proyecto reinicia avance y cámara', () => {
    useTunnelStore.setState({ front: 120, focusZ: 80 })
    useTunnelStore.getState().setActiveProject('cc167-t4')
    const s = useTunnelStore.getState()
    expect(s.activeProjectId).toBe('cc167-t4')
    expect(s.front).toBeNull()
    expect(s.focusZ).toBeNull()
  })

  it('persiste capas, modo y cámara, pero no el avance previsualizado', () => {
    useTunnelStore.getState().setMode('orbit')
    useTunnelStore.getState().setFocusZ(42)
    useTunnelStore.getState().setFront(300)
    const saved = JSON.parse(localStorage.getItem(TUNNEL_STORE_KEY) ?? '{}') as { state: Record<string, unknown> }
    expect(saved.state.mode).toBe('orbit')
    expect(saved.state.focusZ).toBe(42)
    expect(saved.state).not.toHaveProperty('front')
  })
})
