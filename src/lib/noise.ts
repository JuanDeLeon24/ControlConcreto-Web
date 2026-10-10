function hash(ix: number, iy: number, seed: number): number {
  let h = Math.imul(ix | 0, 374761393) ^ Math.imul(iy | 0, 668265263) ^ Math.imul(seed | 0, 1442695041)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}

const fade = (t: number) => t * t * (3 - 2 * t)
const mod = (n: number, m: number) => ((n % m) + m) % m

/** Ruido de valor 2D en [0,1]. Con `period > 0` el resultado es teselable. */
export function vnoise(x: number, y: number, seed = 0, period = 0): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const fx = fade(x - xi)
  const fy = fade(y - yi)
  let x0 = xi
  let x1 = xi + 1
  let y0 = yi
  let y1 = yi + 1
  if (period > 0) {
    x0 = mod(x0, period)
    x1 = mod(x1, period)
    y0 = mod(y0, period)
    y1 = mod(y1, period)
  }
  const a = hash(x0, y0, seed)
  const b = hash(x1, y0, seed)
  const c = hash(x0, y1, seed)
  const d = hash(x1, y1, seed)
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy
}

/** Ruido fractal (fBm) normalizado a ~[0,1]. */
export function fbm(x: number, y: number, octaves = 5, seed = 0, period = 0): number {
  let amp = 0.5
  let f = 1
  let sum = 0
  let norm = 0
  for (let o = 0; o < octaves; o++) {
    sum += amp * vnoise(x * f, y * f, seed + o * 17, period > 0 ? period * f : 0)
    norm += amp
    amp *= 0.5
    f *= 2
  }
  return sum / norm
}
