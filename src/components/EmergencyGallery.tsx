import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import type { GalleryParams, SectionParams } from '../types'
import { buildSectionLines, buildTunnelSurface } from '../lib/geometry'
import { sideSign } from '../lib/profile'

interface Props {
  gallery: GalleryParams
  section: SectionParams
  visible: boolean
}

/**
 * Galería de emergencia: proyección fantasma en baja resolución (aros + generatrices).
 * Se dibuja sin prueba de profundidad para que el rumbo y la pendiente se lean aun a través de la roca.
 */
export function EmergencyGallery({ gallery: g, section, visible }: Props) {
  const R = section.width / 2
  const sign = sideSign(g.side)
  const a = THREE.MathUtils.degToRad(g.headingDeg)
  const grade = g.gradePct / 100
  const shape = useMemo(() => ({ width: g.width, wallHeight: Math.max(0.5, g.height - g.width / 2) }), [g.width, g.height])
  // desplaza el arranque para que el aro inicial no invada el interior del Túnel 0
  const start = Math.max(0, g.width / 2 / Math.tan(Math.max(0.2, a)))

  const lines = useMemo(() => buildSectionLines(shape, g.length, 6, 14, start), [shape, g.length, start])
  const fill = useMemo(
    () => buildTunnelSurface({ section: shape, z0: start, z1: start + g.length, zStep: 6, segments: 14, uTile: 5, vTile: 5 }),
    [shape, g.length, start],
  )
  const euler = useMemo(() => new THREE.Euler(-Math.atan(grade), sign * a, 0, 'YXZ'), [grade, sign, a])

  useEffect(() => () => lines.dispose(), [lines])
  useEffect(() => () => fill.dispose(), [fill])

  const end = start + g.length
  return (
    <group position={[sign * R, 0, g.z]} rotation={euler} visible={visible}>
      <lineSegments geometry={lines} renderOrder={10}>
        <lineBasicMaterial color="#22d3ee" transparent opacity={0.75} depthTest={false} />
      </lineSegments>
      <mesh geometry={fill} renderOrder={9}>
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.06} depthWrite={false} depthTest={false} side={THREE.DoubleSide} />
      </mesh>
      {/* flecha del rumbo */}
      <mesh position={[0, 0.2, end + 0.8]} rotation={[Math.PI / 2, 0, 0]} renderOrder={10}>
        <coneGeometry args={[0.7, 1.6, 14]} />
        <meshBasicMaterial color="#22d3ee" depthTest={false} />
      </mesh>
      <Html position={[0, g.height + 0.8, start + g.length * 0.5]} center distanceFactor={14} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className="whitespace-nowrap rounded-md border border-cyan-400/60 bg-black/70 px-2 py-1 text-[11px] leading-tight text-cyan-100">
          <div className="font-semibold">Galería de emergencia (placeholder)</div>
          <div>
            Rumbo {g.headingDeg}° · pendiente {g.gradePct > 0 ? '+' : ''}
            {g.gradePct}% · {g.length} m
          </div>
        </div>
      </Html>
    </group>
  )
}
