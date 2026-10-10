import type { TunnelData } from '../types'
import { DEFAULT_TUNNEL_DATA } from './defaultData'

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/** Valida y completa un JSON externo con los valores por defecto. Lanza Error si es inválido. */
export function parseTunnelData(text: string): TunnelData {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('El archivo no es un JSON válido.')
  }
  if (!isObj(raw)) throw new Error('El JSON debe ser un objeto.')
  const d = DEFAULT_TUNNEL_DATA
  const merged: TunnelData = {
    ...d,
    ...(raw as Partial<TunnelData>),
    section: { ...d.section, ...((isObj(raw.section) ? raw.section : {}) as Partial<TunnelData['section']>) },
    progress: { ...d.progress, ...((isObj(raw.progress) ? raw.progress : {}) as Partial<TunnelData['progress']>) },
    gallery: { ...d.gallery, ...((isObj(raw.gallery) ? raw.gallery : {}) as Partial<TunnelData['gallery']>) },
    boxes: Array.isArray(raw.boxes) ? (raw.boxes as TunnelData['boxes']) : d.boxes,
    niches: Array.isArray(raw.niches) ? (raw.niches as TunnelData['niches']) : d.niches,
    deformations: Array.isArray(raw.deformations) ? (raw.deformations as TunnelData['deformations']) : d.deformations,
  }
  const positive = [
    merged.moduleLength,
    merged.moduleCount,
    merged.section.width,
    merged.section.wallHeight,
    merged.section.liningThickness,
    merged.lampSpacing,
    merged.gallery.length,
    merged.gallery.width,
    merged.gallery.height,
  ]
  if (positive.some((n) => typeof n !== 'number' || !Number.isFinite(n) || n <= 0))
    throw new Error('Hay dimensiones inválidas (deben ser números mayores que 0).')
  if (merged.moduleCount > 400) throw new Error('moduleCount máximo: 400.')
  const total = merged.moduleLength * merged.moduleCount
  merged.progress.liningFront = Math.min(Math.max(0, Number(merged.progress.liningFront) || 0), total)
  merged.niches = merged.niches.map((n) => ({
    ...n,
    yBase: Math.min(n.yBase, Math.max(0, merged.section.wallHeight - n.height)),
  }))
  return merged
}
