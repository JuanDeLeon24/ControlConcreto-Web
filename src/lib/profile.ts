import type { DeformationPosition, SectionParams, Side } from '../types'

/** Mirando hacia +Z, la izquierda es +X y la derecha es -X. */
export const sideSign = (side: Side): number => (side === 'left' ? 1 : -1)

export interface ProfileShape {
  width: number
  wallHeight: number
}

export interface ProfilePoint {
  x: number
  y: number
  /** Normal saliente (hacia la roca). */
  nx: number
  ny: number
}

export function sectionLength(sec: ProfileShape): number {
  return 2 * sec.wallHeight + Math.PI * (sec.width / 2)
}

/**
 * Perfil en herradura: hastial vertical, bóveda semicircular, hastial vertical.
 * `s` es la longitud de arco desde la base del hastial con x negativo hasta la base del x positivo.
 */
export function profileAt(sec: ProfileShape, s: number): ProfilePoint {
  const R = sec.width / 2
  const h = sec.wallHeight
  const arc = Math.PI * R
  if (s <= h) return { x: -R, y: s, nx: -1, ny: 0 }
  if (s <= h + arc) {
    const phi = Math.PI - (s - h) / R
    const c = Math.cos(phi)
    const si = Math.sin(phi)
    return { x: R * c, y: h + R * si, nx: c, ny: si }
  }
  return { x: R, y: h - (s - h - arc), nx: 1, ny: 0 }
}

/** Convierte "izquierda/clave/derecha" en la coordenada de arco `s`. */
export function positionToS(sec: SectionParams, pos: DeformationPosition): number {
  const L = sectionLength(sec)
  if (pos === 'crown') return L / 2
  // izquierda (x positivo) está al final del recorrido de arco; derecha (x negativo) al inicio
  return pos === 'left' ? L - sec.wallHeight / 2 : sec.wallHeight / 2
}
