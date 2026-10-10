import type { TunnelData } from '../types'
import { sideSign } from './profile'

export interface Opening {
  z0: number
  z1: number
  y0: number
  y1: number
  sign: number
}

/** Huecos que se recortan en el revestimiento: nichos + boca de la galería de emergencia. */
export function buildOpenings(data: TunnelData): Opening[] {
  const out: Opening[] = data.niches.map((n) => ({
    z0: n.z - n.length / 2,
    z1: n.z + n.length / 2,
    y0: n.yBase,
    y1: n.yBase + n.height,
    sign: sideSign(n.side),
  }))
  const g = data.gallery
  const sinA = Math.max(0.2, Math.sin((g.headingDeg * Math.PI) / 180))
  const half = g.width / (2 * sinA)
  out.push({ z0: g.z - half, z1: g.z + half, y0: 0, y1: g.height, sign: sideSign(g.side) })
  return out
}
