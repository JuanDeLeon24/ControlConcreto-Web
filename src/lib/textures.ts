import * as THREE from 'three'
import { fbm, vnoise } from './noise'

export interface PBRSet {
  map: THREE.DataTexture
  normalMap: THREE.DataTexture
  roughnessMap: THREE.DataTexture
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function finish(t: THREE.DataTexture, srgb: boolean): THREE.DataTexture {
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
  t.minFilter = THREE.LinearMipmapLinearFilter
  t.magFilter = THREE.LinearFilter
  t.generateMipmaps = true
  t.anisotropy = 8
  t.needsUpdate = true
  return t
}

type Pixel = { h: number; r: number; g: number; b: number; rough: number }

function buildSet(size: number, normalStrength: number, pixel: (u: number, v: number, y: number) => Pixel): PBRSet {
  const n = size * size
  const h = new Float32Array(n)
  const col = new Uint8Array(n * 4)
  const rgh = new Uint8Array(n * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x
      const p = pixel(x / size, y / size, y)
      h[i] = p.h
      col.set([p.r, p.g, p.b, 255], i * 4)
      const r = Math.round(p.rough * 255)
      rgh.set([r, r, r, 255], i * 4)
    }
  }
  const nor = new Uint8Array(n * 4)
  const at = (x: number, y: number) => h[((y + size) % size) * size + ((x + size) % size)]
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * normalStrength
      const dy = (at(x, y + 1) - at(x, y - 1)) * normalStrength
      const len = Math.hypot(dx, dy, 1)
      nor.set(
        [((-dx / len) * 0.5 + 0.5) * 255, ((-dy / len) * 0.5 + 0.5) * 255, ((1 / len) * 0.5 + 0.5) * 255, 255],
        (y * size + x) * 4,
      )
    }
  }
  const mk = (d: Uint8Array) => new THREE.DataTexture(d, size, size, THREE.RGBAFormat, THREE.UnsignedByteType)
  return {
    map: finish(mk(col), true),
    normalMap: finish(mk(nor), false),
    roughnessMap: finish(mk(rgh), false),
  }
}

/** Roca excavada: gris pardo, fracturas oscuras y manchas de óxido. Teselable. */
export function makeRockTextures(size = 512): PBRSet {
  return buildSet(size, 5, (u, v) => {
    const base = fbm(u * 6, v * 6, 6, 11, 6)
    const ridge = 1 - Math.abs(vnoise(u * 10, v * 10, 5, 10) * 2 - 1)
    const crack = smooth(0.9, 0.97, ridge)
    const rust = smooth(0.62, 0.8, fbm(u * 4, v * 4, 3, 31, 4))
    const h = base * 0.7 + ridge * 0.3 - crack * 0.3
    const dark = 1 - crack * 0.55
    const r = lerp(lerp(52, 128, base), 150, rust * 0.45) * dark
    const g = lerp(lerp(47, 118, base), 104, rust * 0.45) * dark
    const b = lerp(lerp(42, 104, base), 74, rust * 0.45) * dark
    return { h, r, g, b, rough: 0.78 + 0.2 * base }
  })
}

/** Concreto fundido: gris con poros finos. Con `seams` marca una junta en el borde (v = 0). */
export function makeConcreteTextures(size = 512, seams = false): PBRSet {
  return buildSet(size, 2.5, (u, v, y) => {
    const base = fbm(u * 8, v * 8, 5, 41, 8)
    const fine = fbm(u * 40, v * 40, 2, 43, 40)
    const pore = smooth(0.86, 0.95, vnoise(u * 64, v * 64, 47, 64))
    let h = base * 0.5 + fine * 0.5 - pore * 0.4
    let gray = 0.62 + (base - 0.5) * 0.22 + (fine - 0.5) * 0.08 - pore * 0.25
    if (seams && (y < 2 || y >= size - 2)) {
      gray *= 0.55
      h -= 0.3
    }
    const g = gray * 255
    return { h, r: g, g: g * 0.99, b: g * 0.96, rough: 0.82 + 0.12 * fine }
  })
}

/** Malla electrosoldada: alambres sobre fondo transparente (usar con alphaTest). */
export function makeWireMeshTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, 64, 64)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(30, 0, 4, 64)
  ctx.fillRect(0, 30, 64, 4)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

let rock: PBRSet | null = null
let concrete: PBRSet | null = null
let concretePlain: PBRSet | null = null

export const getRock = () => (rock ??= makeRockTextures(512))
/** Concreto del revestimiento (con juntas por módulo). */
export const getConcrete = () => (concrete ??= makeConcreteTextures(512, true))
/** Concreto para elementos pequeños (sin juntas). */
export const getConcretePlain = () => (concretePlain ??= makeConcreteTextures(256, false))
