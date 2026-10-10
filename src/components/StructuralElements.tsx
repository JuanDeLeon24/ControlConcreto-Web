import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { ElectricalKind, TunnelData } from '../types'
import { sideSign } from '../lib/profile'
import { getConcretePlain } from '../lib/textures'
import { countBuilt, InstancedBoxes, type BoxInstance } from './InstancedBoxes'

/** Dimensiones proporcionales (m): d = profundidad, h = alto, w = largo sobre Z, y0 = cota inferior. */
export const BOX_DIMS: Record<ElectricalKind, { d: number; h: number; w: number; y0: number; color: string }> = {
  MH: { d: 0.5, h: 1.2, w: 0.9, y0: 0.6, color: '#8b939b' },
  A1: { d: 0.2, h: 0.45, w: 0.45, y0: 1.2, color: '#d9a52b' },
  A2: { d: 0.25, h: 0.5, w: 0.75, y0: 1.2, color: '#3f7fc4' },
}

const BEAM_W = 0.55
const BEAM_H = 0.6
const DRAIN_W = 0.45
const DRAIN_H = 0.3

interface Props {
  data: TunnelData
  fronts: { beam: number; drain: number; boxes: number }
  visible: boolean
}

export function StructuralElements({ data, fronts, visible }: Props) {
  const { section, moduleLength: ML, moduleCount: N, inspectionSpacing } = data
  const R = section.width / 2
  const total = ML * N

  const mats = useMemo(() => {
    const t = getConcretePlain()
    const concrete = (color: string, rough = 1, metal = 0) =>
      new THREE.MeshStandardMaterial({
        map: t.map,
        normalMap: t.normalMap,
        roughnessMap: t.roughnessMap,
        color,
        roughness: rough,
        metalness: metal,
      })
    const solid = (color: string, rough: number, metal: number) =>
      new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal })
    return {
      beam: concrete('#b9b9b2'),
      drain: concrete('#6f757b'),
      link: concrete('#50565c'),
      insp: solid('#c9822b', 0.5, 0.6),
      MH: solid(BOX_DIMS.MH.color, 0.55, 0.5),
      A1: solid(BOX_DIMS.A1.color, 0.5, 0.2),
      A2: solid(BOX_DIMS.A2.color, 0.5, 0.2),
    }
  }, [])
  useEffect(
    () => () => {
      Object.values(mats).forEach((m) => m.dispose())
    },
    [mats],
  )

  const beams = useMemo(() => {
    const a: BoxInstance[] = []
    for (let m = 0; m < N; m++)
      for (const sign of [1, -1])
        a.push({ x: sign * (R - BEAM_W / 2), y: BEAM_H / 2, z: m * ML + ML / 2, sx: BEAM_W, sy: BEAM_H, sz: ML - 0.04, zEnd: (m + 1) * ML })
    return a
  }, [N, ML, R])

  const drains = useMemo(() => {
    const a: BoxInstance[] = []
    for (let m = 0; m < N; m++)
      for (const sign of [1, -1])
        a.push({ x: sign * (R - BEAM_W - DRAIN_W / 2 - 0.03), y: DRAIN_H / 2, z: m * ML + ML / 2, sx: DRAIN_W, sy: DRAIN_H, sz: ML - 0.5, zEnd: (m + 1) * ML })
    return a
  }, [N, ML, R])

  // Tubos de interconexión entre cajas de drenaje consecutivas
  const links = useMemo(() => {
    const a: BoxInstance[] = []
    for (let m = 1; m < N; m++)
      for (const sign of [1, -1])
        a.push({ x: sign * (R - BEAM_W - DRAIN_W / 2 - 0.03), y: DRAIN_H * 0.55, z: m * ML, sx: 0.22, sy: 0.16, sz: 0.56, zEnd: m * ML + 0.28 })
    return a
  }, [N, ML, R])

  const inspections = useMemo(() => {
    const a: BoxInstance[] = []
    if (inspectionSpacing <= 0) return a
    for (let z = inspectionSpacing / 2; z < total; z += inspectionSpacing)
      for (const sign of [1, -1])
        a.push({ x: sign * (R - BEAM_W - DRAIN_W / 2 - 0.03), y: DRAIN_H + 0.09, z, sx: 0.7, sy: 0.18, sz: 0.9, zEnd: z })
    return a
  }, [inspectionSpacing, total, R])

  const electrical = useMemo(() => {
    const out: Record<ElectricalKind, BoxInstance[]> = { MH: [], A1: [], A2: [] }
    for (const b of data.boxes) {
      const dim = BOX_DIMS[b.kind]
      if (!dim) continue
      out[b.kind].push({
        x: sideSign(b.side) * (R - dim.d / 2),
        y: (b.y ?? dim.y0) + dim.h / 2,
        z: b.z,
        sx: dim.d,
        sy: dim.h,
        sz: dim.w,
        zEnd: b.z,
      })
    }
    for (const k of Object.keys(out) as ElectricalKind[]) out[k].sort((p, q) => p.zEnd - q.zEnd)
    return out
  }, [data.boxes, R])

  return (
    <group visible={visible}>
      <InstancedBoxes items={beams} material={mats.beam} visibleCount={countBuilt(beams, fronts.beam)} />
      <InstancedBoxes items={drains} material={mats.drain} visibleCount={countBuilt(drains, fronts.drain)} />
      <InstancedBoxes items={links} material={mats.link} visibleCount={countBuilt(links, fronts.drain)} />
      <InstancedBoxes items={inspections} material={mats.insp} visibleCount={countBuilt(inspections, fronts.boxes)} />
      <InstancedBoxes items={electrical.MH} material={mats.MH} visibleCount={countBuilt(electrical.MH, fronts.boxes)} />
      <InstancedBoxes items={electrical.A1} material={mats.A1} visibleCount={countBuilt(electrical.A1, fronts.boxes)} />
      <InstancedBoxes items={electrical.A2} material={mats.A2} visibleCount={countBuilt(electrical.A2, fronts.boxes)} />
    </group>
  )
}
