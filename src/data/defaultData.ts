import type { DeformationPoint, ElectricalBox, Niche, TunnelData } from '../types'

// ⚠️ Datos de DEMOSTRACIÓN. Reemplázalos por los reales (JSON externo, API o Excel).
// Supuestos: 137 módulos de 6 m. Ajusta `moduleLength` a la longitud real del módulo.

const MODULE_LENGTH = 6
const MODULES = 137
const TOTAL = MODULE_LENGTH * MODULES

const boxes: ElectricalBox[] = []
for (let z = 18, i = 0; z < TOTAL - 6; z += 48, i++)
  boxes.push({ id: `MH-${i + 1}`, kind: 'MH', side: i % 2 ? 'left' : 'right', z })
for (let z = 9, i = 0; z < TOTAL - 6; z += 24, i++)
  boxes.push({ id: `A1-${i + 1}`, kind: 'A1', side: i % 2 ? 'right' : 'left', z })
for (let z = 21, i = 0; z < TOTAL - 6; z += 36, i++)
  boxes.push({ id: `A2-${i + 1}`, kind: 'A2', side: i % 2 ? 'left' : 'right', z })

const niches: Niche[] = [17, 40, 63, 86, 109].map((m, i) => ({
  id: `N-${m}`,
  side: i % 2 ? 'right' : 'left',
  z: (m - 0.5) * MODULE_LENGTH,
  length: 4,
  height: 1.9,
  depth: 1.2,
  yBase: 0.6,
}))

const deformations: DeformationPoint[] = [
  { id: 'D1', z: 55, position: 'crown', deltaM: 0.35, note: 'Sobre-excavación en clave' },
  { id: 'D2', z: 70, position: 'left', deltaM: -0.28, note: 'Convergencia en hastial' },
  { id: 'D3', z: 84, position: 'right', deltaM: -0.22, note: 'Convergencia en hastial' },
  { id: 'D4', z: 100, position: 'crown', deltaM: 0.5, note: 'Sobre-excavación en clave' },
  { id: 'D5', z: 118, position: 'left', deltaM: 0.3, note: 'Sobre-excavación en hastial' },
  { id: 'D6', z: 135, position: 'right', deltaM: -0.35, note: 'Convergencia en hastial' },
  { id: 'D7', z: 150, position: 'crown', deltaM: 0.4, note: 'Sobre-excavación en clave' },
  { id: 'D8', z: 175, position: 'left', deltaM: -0.3, note: 'Convergencia en hastial' },
  { id: 'D9', z: 200, position: 'right', deltaM: 0.28, note: 'Sobre-excavación en hastial' },
  { id: 'D10', z: 230, position: 'crown', deltaM: 0.45, note: 'Sobre-excavación en clave' },
  { id: 'D11', z: 262, position: 'left', deltaM: -0.32, note: 'Convergencia en hastial' },
  { id: 'D12', z: 295, position: 'right', deltaM: 0.33, note: 'Sobre-excavación en hastial' },
]

export const DEFAULT_TUNNEL_DATA: TunnelData = {
  name: 'Túnel 0',
  moduleLength: MODULE_LENGTH,
  moduleCount: MODULES,
  section: { width: 9, wallHeight: 2.5, liningThickness: 0.4 },
  progress: {
    liningFront: 7 * MODULE_LENGTH,
    beamFront: TOTAL,
    drainFront: 7 * MODULE_LENGTH,
    boxesFront: 7 * MODULE_LENGTH,
  },
  inspectionSpacing: 30,
  lampSpacing: 12,
  boxes,
  niches,
  deformations,
  gallery: { z: 150, side: 'right', headingDeg: 62, gradePct: -8, length: 90, width: 5, height: 5 },
  seed: 7,
}
