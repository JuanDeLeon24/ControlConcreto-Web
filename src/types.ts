// Tipos de datos del modelo. Unidades: metros. El eje Z es el eje longitudinal del túnel
// (z = 0 es el portal y el avance crece hacia +Z). "left"/"right" se miden mirando hacia +Z.

export type Side = 'left' | 'right'
export type ElectricalKind = 'MH' | 'A1' | 'A2'
export type DeformationPosition = 'left' | 'crown' | 'right'

export interface SectionParams {
  /** Ancho interior teórico (m). */
  width: number
  /** Altura de los hastiales verticales antes de iniciar la bóveda (m). */
  wallHeight: number
  /** Espesor del revestimiento (m). */
  liningThickness: number
}

export interface ElectricalBox {
  id: string
  kind: ElectricalKind
  side: Side
  /** Abscisa longitudinal (m desde el portal). */
  z: number
  /** Altura de la base de la caja (m). Opcional. */
  y?: number
}

export interface Niche {
  id: string
  side: Side
  /** Centro del nicho (m). */
  z: number
  length: number
  height: number
  depth: number
  /** Cota inferior del nicho sobre la losa (m). */
  yBase: number
}

export interface DeformationPoint {
  id: string
  z: number
  position: DeformationPosition
  /** Delta en metros: positivo = sobre-excavación, negativo = convergencia. */
  deltaM: number
  note?: string
}

export interface GalleryParams {
  /** Abscisa del cruce con el Túnel 0 (m). */
  z: number
  side: Side
  /** Rumbo en grados respecto al eje del túnel (90 = perpendicular). */
  headingDeg: number
  /** Pendiente en % (negativa = descendente). */
  gradePct: number
  length: number
  width: number
  height: number
}

export interface ProgressParams {
  /** Avance del revestimiento de concreto (m). */
  liningFront: number
  beamFront: number
  drainFront: number
  boxesFront: number
  /** Avance planeado (m). Los módulos planeados y no terminados se marcan como retrasados. */
  plannedFront?: number
}

export interface TunnelData {
  name: string
  moduleLength: number
  moduleCount: number
  section: SectionParams
  progress: ProgressParams
  /** Separación de las cajas de inspección (m). 0 = sin cajas. */
  inspectionSpacing: number
  /** Separación de las luminarias de la corona (m). */
  lampSpacing: number
  boxes: ElectricalBox[]
  niches: Niche[]
  deformations: DeformationPoint[]
  gallery: GalleryParams
  seed: number
}

export interface Layers {
  excavation: boolean
  lining: boolean
  elements: boolean
  labels: boolean
  gallery: boolean
  /** Si es true, los elementos aparecen hasta donde llegue el revestimiento. */
  elementsFollow: boolean
}

export type NavMode = 'walk' | 'orbit'

export interface FlyTo {
  z: number
  key: number
}

export interface MoveInput {
  fwd: number
  strafe: number
  turn: number
}
