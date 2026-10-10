import { useMemo } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import type { TunnelData } from '../types'
import { createDeformationField } from '../lib/deformation'
import { positionToS, profileAt } from '../lib/profile'

const POS_LABEL = { left: 'hastial izq.', crown: 'clave', right: 'hastial der.' } as const

interface Props {
  data: TunnelData
  front: number
  focusZ: number
  visible: boolean
}

/** Etiquetas <Html> ancladas a la roca con el delta de deformación de cada punto. */
export function DeformationLabels({ data, front, focusZ, visible }: Props) {
  const anchors = useMemo(() => {
    const field = createDeformationField(data.section, data.deformations, data.seed)
    return data.deformations.map((p) => {
      const s = positionToS(data.section, p.position)
      const pr = profileAt(data.section, s)
      const d = field.offsetAt(p.z, s)
      // un poco hacia el interior de la roca para que no quede enterrada
      const inward = Math.max(0.1, d - 0.2)
      return { p, pos: new THREE.Vector3(pr.x + pr.nx * inward, pr.y + pr.ny * inward, p.z) }
    })
  }, [data])

  if (!visible) return null
  const shown = anchors
    .filter((a) => a.p.z >= front && Math.abs(a.p.z - focusZ) < 90)
    .sort((a, b) => Math.abs(a.p.z - focusZ) - Math.abs(b.p.z - focusZ))
    .slice(0, 12)

  return (
    <group>
      {shown.map(({ p, pos }) => {
        const cm = Math.round(p.deltaM * 100)
        const over = cm >= 0
        return (
          <Html key={p.id} position={pos} center distanceFactor={10} zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
            <div
              className={`whitespace-nowrap rounded-md border bg-black/75 px-2 py-1 text-[11px] leading-tight text-white ${
                over ? 'border-amber-400/70' : 'border-sky-400/70'
              }`}
            >
              <div className={`font-semibold ${over ? 'text-amber-300' : 'text-sky-300'}`}>
                Δ {over ? '+' : ''}
                {cm} cm
              </div>
              <div className="text-white/80">
                {over ? 'Sobre-excavación' : 'Convergencia'} · {POS_LABEL[p.position]}
              </div>
              <div className="text-white/50">z = {p.z} m</div>
            </div>
          </Html>
        )
      })}
    </group>
  )
}
