export type ProjectStatus = 'activo' | 'terminado' | 'planificado' | 'archivado'

/** Un frente de obra (túnel o galería) dentro de un contrato. */
export interface Project {
  id: string
  /** Código corto del frente, p. ej. "T0". */
  code: string
  name: string
  /** Contrato o centro de costos al que pertenece. */
  contract: string
  /** Abscisas en metros (K6+178 = 6178). */
  pkStart: number
  pkEnd: number
  status: ProjectStatus
  /** true si el frente tiene modelo 3D cargado. */
  has3D: boolean
}
