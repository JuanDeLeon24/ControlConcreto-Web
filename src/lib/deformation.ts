import type { DeformationPoint, SectionParams } from '../types'
import { fbm } from './noise'
import { positionToS, sectionLength } from './profile'

export interface DeformationField {
  /**
   * Distancia (m) entre el perfil teórico interior y la superficie de roca en (z, s).
   * Positivo = hacia afuera (sobre-excavación). Un valor menor que el espesor del revestimiento
   * o negativo indica convergencia (la roca invade la sección teórica).
   */
  offsetAt: (z: number, s: number) => number
}

export function createDeformationField(
  section: SectionParams,
  points: DeformationPoint[],
  seed: number,
): DeformationField {
  const L = sectionLength(section)
  const bumps = points.map((p) => ({ z: p.z, s: positionToS(section, p.position), d: p.deltaM }))
  const sigZ = 3.5
  const sigS = 2.4
  return {
    offsetAt(z, s) {
      const low = fbm(z * 0.05, s * 0.18, 4, seed) - 0.5
      const high = fbm(z * 0.7, s * 1.1, 3, seed + 9) - 0.5
      const crown = Math.exp(-(((s - L / 2) / (L * 0.22)) ** 2))
      let d = section.liningThickness + 0.18 * crown + 0.55 * low + 0.28 * high
      for (const b of bumps) {
        const dz = (z - b.z) / sigZ
        if (Math.abs(dz) > 4) continue
        const ds = (s - b.s) / sigS
        d += b.d * Math.exp(-(dz * dz + ds * ds))
      }
      return Math.max(d, -0.6)
    },
  }
}
