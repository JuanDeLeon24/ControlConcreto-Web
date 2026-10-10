import { useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type { FlyTo, Layers, MoveInput, NavMode, TunnelData } from '../types'
import { buildOpenings } from '../lib/openings'
import { buildRingBand, scaleUV } from '../lib/geometry'
import { getConcretePlain } from '../lib/textures'
import { OrbitRig, WalkRig } from './CameraRig'
import { DeformationLabels } from './DeformationLabels'
import { EmergencyGallery } from './EmergencyGallery'
import { Lighting } from './Lighting'
import { Niches } from './Niches'
import { StructuralElements } from './StructuralElements'
import { TunnelExcavation } from './TunnelExcavation'
import { TunnelLining } from './TunnelLining'

const BG = '#07090c'

export interface TunnelSceneProps {
  /** Datos externos que construyen el modelo (ver src/types.ts). */
  data: TunnelData
  /** Avance del revestimiento (m). */
  front: number
  layers: Layers
  mode: NavMode
  flyTo: FlyTo | null
  moveRef: RefObject<MoveInput>
  focusZ: number
  onFocusChange: (z: number) => void
}

export function TunnelScene(props: TunnelSceneProps) {
  const total = props.data.moduleLength * props.data.moduleCount
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ fov: 65, near: 0.1, far: 400, position: [0, 1.7, 0] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ touchAction: 'none' }}
    >
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, props.mode === 'walk' ? 4 : 30, props.mode === 'walk' ? 75 : 200]} />
      <SceneContents {...props} total={total} />
    </Canvas>
  )
}

function Floor({ width, total }: { width: number; total: number }) {
  const geo = useMemo(() => scaleUV(new THREE.PlaneGeometry(width, total), width / 3, total / 3), [width, total])
  const mat = useMemo(() => {
    const t = getConcretePlain()
    return new THREE.MeshStandardMaterial({ map: t.map, normalMap: t.normalMap, roughnessMap: t.roughnessMap, color: '#7b7e82', roughness: 1 })
  }, [])
  useEffect(() => () => geo.dispose(), [geo])
  useEffect(() => () => mat.dispose(), [mat])
  return <mesh geometry={geo} material={mat} position={[0, 0, total / 2]} rotation={[-Math.PI / 2, 0, 0]} />
}

function SceneContents(p: TunnelSceneProps & { total: number }) {
  const { data, front, layers, mode, total } = p
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    gl.localClippingEnabled = true
  }, [gl])

  const uniforms = useMemo(() => ({ uFront: { value: front }, uBlend: { value: 6 } }), []) // eslint-disable-line react-hooks/exhaustive-deps
  const liningPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, -1), front), []) // eslint-disable-line react-hooks/exhaustive-deps
  const rockPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), -front), []) // eslint-disable-line react-hooks/exhaustive-deps
  const focusRef = useRef(p.focusZ)
  const markerRef = useRef<THREE.Mesh>(null)

  // Frente animado: el slider fija el objetivo y aquí se amortigua.
  const frontRef = useRef(front)
  useFrame((_, dt) => {
    frontRef.current = THREE.MathUtils.damp(frontRef.current, front, 6, Math.min(dt, 0.05))
    const f = frontRef.current
    uniforms.uFront.value = f
    liningPlane.constant = f
    rockPlane.constant = -f
    if (markerRef.current) markerRef.current.position.z = f
  })

  const openings = useMemo(() => buildOpenings(data), [data])
  const bandGeo = useMemo(() => buildRingBand(data.section, -0.14, -0.02), [data.section])
  useEffect(() => () => bandGeo.dispose(), [bandGeo])

  const R = data.section.width / 2
  const crownY = data.section.wallHeight + R - 0.45
  const f = layers.elementsFollow
  const fronts = {
    beam: f ? Math.max(data.progress.beamFront, front) : data.progress.beamFront,
    drain: f ? Math.max(data.progress.drainFront, front) : data.progress.drainFront,
    boxes: f ? Math.max(data.progress.boxesFront, front) : data.progress.boxesFront,
  }
  const startZ = Math.min(Math.max(p.focusZ, 1), total - 1)

  return (
    <>
      <Lighting total={total} spacing={data.lampSpacing} crownY={crownY} focusRef={focusRef} />
      <Floor width={data.section.width + 6} total={total} />

      <TunnelExcavation data={data} uniforms={uniforms} plane={rockPlane} visible={layers.excavation} />
      <TunnelLining
        section={data.section}
        total={total}
        moduleLength={data.moduleLength}
        openings={openings}
        plane={liningPlane}
        visible={layers.lining}
      />
      <Niches niches={data.niches} section={data.section} plane={liningPlane} visible={layers.lining} />
      <StructuralElements data={data} fronts={fronts} visible={layers.elements} />
      <EmergencyGallery gallery={data.gallery} section={data.section} visible={layers.gallery} />
      <DeformationLabels data={data} front={front} focusZ={p.focusZ} visible={layers.labels && layers.excavation} />

      {/* Anillo naranja = frente de revestimiento */}
      <mesh ref={markerRef} geometry={bandGeo} visible={layers.lining} renderOrder={5}>
        <meshBasicMaterial color="#f59e0b" side={THREE.DoubleSide} toneMapped={false} />
      </mesh>

      {mode === 'walk' ? (
        <WalkRig
          length={total}
          limitX={Math.max(0.5, R - 1.2)}
          eyeHeight={1.7}
          startZ={startZ}
          flyTo={p.flyTo}
          moveRef={p.moveRef}
          focusRef={focusRef}
          onFocusChange={p.onFocusChange}
        />
      ) : (
        <OrbitRig length={total} startZ={startZ} flyTo={p.flyTo} focusRef={focusRef} onFocusChange={p.onFocusChange} />
      )}
    </>
  )
}
