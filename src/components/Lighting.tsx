import { useLayoutEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Environment, Lightformer, Sparkles } from '@react-three/drei'
import { InstancedBoxes, type BoxInstance } from './InstancedBoxes'

const POOL = 6

interface Props {
  total: number
  spacing: number
  crownY: number
  focusRef: RefObject<number>
}

/**
 * Iluminación de obra: luminarias emisivas en toda la corona (instanciadas, baratas) +
 * un pool de 6 SpotLight reales que se desplazan con el usuario, más ambiente tenue y reflejos procedurales.
 */
export function Lighting({ total, spacing, crownY, focusRef }: Props) {
  const lamps = useMemo(() => {
    const a: BoxInstance[] = []
    for (let z = spacing / 2; z < total; z += spacing) a.push({ x: 0, y: crownY + 0.05, z, sx: 0.9, sy: 0.1, sz: 0.28, zEnd: z })
    return a
  }, [total, spacing, crownY])

  const lampMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: new THREE.Color('#fff1d0').multiplyScalar(2.2), toneMapped: false }),
    [],
  )

  return (
    <>
      <ambientLight intensity={0.35} color="#9fb0c8" />
      <Environment resolution={64} frames={1} environmentIntensity={0.2}>
        <Lightformer form="rect" intensity={1.2} position={[0, 8, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[12, 12, 1]} color="#ffe2b8" />
      </Environment>
      <InstancedBoxes items={lamps} material={lampMat} visibleCount={lamps.length} />
      {Array.from({ length: POOL }, (_, i) => (
        <PooledSpot key={i} index={i} total={total} spacing={spacing} y={crownY} focusRef={focusRef} />
      ))}
      <FollowDust focusRef={focusRef} y={3.5} />
    </>
  )
}

function PooledSpot({
  index,
  total,
  spacing,
  y,
  focusRef,
}: {
  index: number
  total: number
  spacing: number
  y: number
  focusRef: RefObject<number>
}) {
  const light = useRef<THREE.SpotLight>(null)
  const target = useMemo(() => new THREE.Object3D(), [])
  useLayoutEffect(() => {
    if (light.current) light.current.target = target
  }, [target])

  useFrame(() => {
    const l = light.current
    if (!l) return
    const maxIdx = Math.max(0, Math.floor(total / spacing) - 1)
    const idx = Math.min(maxIdx, Math.max(0, Math.floor(focusRef.current / spacing) + index - 2))
    const z = idx * spacing + spacing / 2
    l.position.set(0, y, z)
    target.position.set(0, 0, z)
  })

  return (
    <>
      <spotLight ref={light} color="#ffe9c8" intensity={170} distance={42} angle={1.15} penumbra={0.8} decay={2} />
      <primitive object={target} />
    </>
  )
}

/** Polvo en suspensión que acompaña al usuario. */
function FollowDust({ focusRef, y }: { focusRef: RefObject<number>; y: number }) {
  const g = useRef<THREE.Group>(null)
  useFrame(() => {
    if (g.current) g.current.position.set(0, y, focusRef.current)
  })
  return (
    <group ref={g}>
      <Sparkles count={260} scale={[8, 6, 70]} size={2.4} speed={0.15} opacity={0.35} color="#ffe9c4" />
    </group>
  )
}
