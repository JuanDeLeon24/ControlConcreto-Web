import * as THREE from 'three'
import { profileAt, sectionLength, type ProfileShape } from './profile'

export interface SurfaceOptions {
  section: ProfileShape
  z0: number
  z1: number
  zStep: number
  segments: number
  uTile: number
  vTile: number
  /** Si se entrega, genera la superficie de roca y el atributo `aTheo` (posición teórica). */
  offsetFn?: (z: number, s: number) => number
}

/** Malla de la superficie interior del túnel, con normales apuntando hacia el interior. */
export function buildTunnelSurface(o: SurfaceOptions): THREE.BufferGeometry {
  const L = sectionLength(o.section)
  const rings = Math.max(1, Math.round((o.z1 - o.z0) / o.zStep))
  const cols = o.segments
  const nV = (rings + 1) * (cols + 1)
  const pos = new Float32Array(nV * 3)
  const theo = new Float32Array(nV * 3)
  const nor = new Float32Array(nV * 3)
  const uv = new Float32Array(nV * 2)
  for (let i = 0; i <= rings; i++) {
    const z = o.z0 + ((o.z1 - o.z0) * i) / rings
    for (let j = 0; j <= cols; j++) {
      const s = (L * j) / cols
      const p = profileAt(o.section, s)
      const d = o.offsetFn ? o.offsetFn(z, s) : 0
      const k = i * (cols + 1) + j
      pos.set([p.x + p.nx * d, p.y + p.ny * d, z], k * 3)
      theo.set([p.x, p.y, z], k * 3)
      nor.set([-p.nx, -p.ny, 0], k * 3)
      uv.set([s / o.uTile, z / o.vTile], k * 2)
    }
  }
  const index = new Uint32Array(rings * cols * 6)
  let w = 0
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < cols; j++) {
      const a = i * (cols + 1) + j
      const b = a + 1
      const c = a + cols + 1
      const d = c + 1
      index.set([a, b, c, b, d, c], w)
      w += 6
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  g.setIndex(new THREE.BufferAttribute(index, 1))
  if (o.offsetFn) {
    g.setAttribute('aTheo', new THREE.BufferAttribute(theo, 3))
    g.computeVertexNormals()
  } else {
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3))
  }
  return g
}

/** Banda delgada que sigue el perfil en z = 0 (marcador del frente de revestimiento). */
export function buildRingBand(section: ProfileShape, offIn: number, offOut: number, cols = 96): THREE.BufferGeometry {
  const L = sectionLength(section)
  const pos = new Float32Array((cols + 1) * 2 * 3)
  const index: number[] = []
  for (let j = 0; j <= cols; j++) {
    const p = profileAt(section, (L * j) / cols)
    pos.set([p.x + p.nx * offIn, p.y + p.ny * offIn, 0], j * 6)
    pos.set([p.x + p.nx * offOut, p.y + p.ny * offOut, 0], j * 6 + 3)
    if (j < cols) {
      const a = j * 2
      index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setIndex(index)
  return g
}

/** Aristas de baja resolución (aros + generatrices + eje) para la galería fantasma. */
export function buildSectionLines(
  section: ProfileShape,
  length: number,
  ringEvery: number,
  segs: number,
  zStart = 0,
): THREE.BufferGeometry {
  const L = sectionLength(section)
  const pts: number[] = []
  for (let z = zStart; z <= zStart + length + 1e-6; z += ringEvery) {
    for (let j = 0; j < segs; j++) {
      const a = profileAt(section, (L * j) / segs)
      const b = profileAt(section, (L * (j + 1)) / segs)
      pts.push(a.x, a.y, z, b.x, b.y, z)
    }
  }
  for (let j = 0; j <= segs; j++) {
    const a = profileAt(section, (L * j) / segs)
    pts.push(a.x, a.y, zStart, a.x, a.y, zStart + length)
  }
  pts.push(0, 0.2, zStart, 0, 0.2, zStart + length) // eje
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
  return g
}

/** Escala las UV de una geometría (para repetir texturas por tamaño real). */
export function scaleUV(g: THREE.BufferGeometry, sx: number, sy: number): THREE.BufferGeometry {
  const uv = g.getAttribute('uv') as THREE.BufferAttribute
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * sx, uv.getY(i) * sy)
  uv.needsUpdate = true
  return g
}
