import type { Project } from '../shared/types'

/**
 * Frentes del contrato CC-167 (Vías de acceso al Túnel del Toyo, Contrato 958 de 2021).
 * Abscisas según el control de avance. Datos de referencia mientras no exista backend.
 */
export const PROJECTS: Project[] = [
  { id: 'cc167-t0', code: 'T0', name: 'Túnel 0', contract: 'CC-167', pkStart: 6178, pkEnd: 7173, status: 'activo', has3D: true },
  { id: 'cc167-ge-t0', code: 'GE-T0', name: 'Galería de emergencia T0', contract: 'CC-167', pkStart: 310, pkEnd: 753, status: 'activo', has3D: false },
  { id: 'cc167-t1', code: 'T1', name: 'Túnel 1', contract: 'CC-167', pkStart: 7999, pkEnd: 8231, status: 'activo', has3D: false },
  { id: 'cc167-t2', code: 'T2', name: 'Túnel 2', contract: 'CC-167', pkStart: 8724, pkEnd: 9079, status: 'activo', has3D: false },
  { id: 'cc167-t3', code: 'T3', name: 'Túnel 3', contract: 'CC-167', pkStart: 9803, pkEnd: 10119, status: 'activo', has3D: false },
  { id: 'cc167-t4', code: 'T4', name: 'Túnel 4', contract: 'CC-167', pkStart: 10341, pkEnd: 11624, status: 'activo', has3D: false },
]

export const DEFAULT_PROJECT_ID = 'cc167-t0'
