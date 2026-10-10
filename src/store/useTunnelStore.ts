import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_PROJECT_ID } from '../data/projects'
import type { Layers, NavMode } from '../types'

export const DEFAULT_LAYERS: Layers = {
  excavation: true,
  lining: true,
  elements: true,
  labels: true,
  gallery: true,
  elementsFollow: true,
}

export interface TunnelUiState {
  /** Frente seleccionado en la app. */
  activeProjectId: string
  /**
   * Avance que se está previsualizando en el 3D (m).
   * null = mostrar el avance real que viene de los datos. No se persiste.
   */
  front: number | null
  layers: Layers
  mode: NavMode
  /** Posición de la cámara a lo largo del túnel (m). null = automática (cerca del frente). */
  focusZ: number | null

  setActiveProject: (id: string) => void
  setFront: (front: number | null) => void
  setLayers: (layers: Layers) => void
  toggleLayer: (key: keyof Layers) => void
  setMode: (mode: NavMode) => void
  setFocusZ: (z: number | null) => void
  /** Vuelve la vista 3D a su estado inicial (no cambia el proyecto). */
  resetView: () => void
}

type PersistedState = Pick<TunnelUiState, 'activeProjectId' | 'layers' | 'mode' | 'focusZ'>

export const TUNNEL_STORE_KEY = 'cc-tunnel-ui'
const STORE_VERSION = 1

/** Estado de interfaz del visor 3D. Los datos del túnel NO van aquí: los maneja React Query. */
export const useTunnelStore = create<TunnelUiState>()(
  persist(
    (set) => ({
      activeProjectId: DEFAULT_PROJECT_ID,
      front: null,
      layers: DEFAULT_LAYERS,
      mode: 'walk',
      focusZ: null,

      setActiveProject: (id) =>
        set((s) => (s.activeProjectId === id ? s : { activeProjectId: id, front: null, focusZ: null })),
      setFront: (front) => set({ front: front === null ? null : Math.max(0, front) }),
      setLayers: (layers) => set({ layers }),
      toggleLayer: (key) => set((s) => ({ layers: { ...s.layers, [key]: !s.layers[key] } })),
      setMode: (mode) => set({ mode }),
      setFocusZ: (focusZ) => set({ focusZ }),
      resetView: () => set({ front: null, focusZ: null, layers: DEFAULT_LAYERS, mode: 'walk' }),
    }),
    {
      name: TUNNEL_STORE_KEY,
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (s): PersistedState => ({
        activeProjectId: s.activeProjectId,
        layers: s.layers,
        mode: s.mode,
        focusZ: s.focusZ,
      }),
      // Si se agrega una capa nueva, los usuarios con datos viejos la reciben con su valor por defecto.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PersistedState>
        return { ...current, ...p, layers: { ...DEFAULT_LAYERS, ...p.layers } }
      },
      migrate: (persisted) => persisted as PersistedState,
    },
  ),
)
