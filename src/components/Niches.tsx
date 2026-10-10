import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { Niche, SectionParams } from '../types'
import { scaleUV } from '../lib/geometry'
import { sideSign } from '../lib/profile'
import { getConcretePlain, makeWireMeshTexture } from '../lib/textures'

const CELL = 0.15 // separación de la malla electrosoldada (m)

interface Props {
  niches: Niche[]
  section: SectionParams
  /** Mismo plano de corte del revestimiento: los nichos solo se ven en la zona revestida. */
  plane: THREE.Plane
  visible: boolean
}

export function Niches({ niches, section, plane, visible }: Props) {
  const wallMat = useMemo(() => {
    const t = getConcretePlain()
    return new THREE.MeshStandardMaterial({
      map: t.map,
      normalMap: t.normalMap,
      roughnessMap: t.roughnessMap,
      color: '#8d8d88',
      roughness: 1,
      side: THREE.BackSide,
      clippingPlanes: [plane],
    })
  }, [plane])

  const meshTex = useMemo(() => makeWireMeshTexture(), [])
  const meshMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: meshTex,
        alphaTest: 0.5,
        side: THREE.DoubleSide,
        color: '#b9c2cc',
        metalness: 0.8,
        roughness: 0.35,
        clippingPlanes: [plane],
      }),
    [meshTex, plane],
  )

  useEffect(() => () => wallMat.dispose(), [wallMat])
  useEffect(
    () => () => {
      meshMat.dispose()
      meshTex.dispose()
    },
    [meshMat, meshTex],
  )

  const R = section.width / 2
  return (
    <group visible={visible}>
      {niches.map((n) => (
        <NicheMesh key={n.id} niche={n} x={sideSign(n.side) * R} wallMat={wallMat} meshMat={meshMat} />
      ))}
    </group>
  )
}

function NicheMesh({
  niche: n,
  x,
  wallMat,
  meshMat,
}: {
  niche: Niche
  x: number
  wallMat: THREE.Material
  meshMat: THREE.Material
}) {
  const geos = useMemo(
    () => ({
      back: scaleUV(new THREE.PlaneGeometry(n.length, n.height), n.length / CELL, n.height / CELL),
      top: scaleUV(new THREE.PlaneGeometry(n.depth, n.length), n.depth / CELL, n.length / CELL),
      side: scaleUV(new THREE.PlaneGeometry(n.depth, n.height), n.depth / CELL, n.height / CELL),
    }),
    [n.length, n.height, n.depth],
  )
  useEffect(
    () => () => {
      geos.back.dispose()
      geos.top.dispose()
      geos.side.dispose()
    },
    [geos],
  )

  const inset = 0.06
  return (
    <group position={[x, n.yBase + n.height / 2, n.z]} rotation={[0, n.side === 'left' ? 0 : Math.PI, 0]}>
      {/* Huecos de la excavación del nicho (caras interiores del cajón) */}
      <mesh position={[n.depth / 2, 0, 0]} material={wallMat}>
        <boxGeometry args={[n.depth, n.height, n.length]} />
      </mesh>
      {/* Mallas electrosoldadas: fondo, techo, piso y laterales */}
      <mesh position={[n.depth - inset, 0, 0]} rotation={[0, Math.PI / 2, 0]} geometry={geos.back} material={meshMat} />
      <mesh position={[n.depth / 2, n.height / 2 - inset, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={geos.top} material={meshMat} />
      <mesh position={[n.depth / 2, -n.height / 2 + inset, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={geos.top} material={meshMat} />
      <mesh position={[n.depth / 2, 0, n.length / 2 - inset]} geometry={geos.side} material={meshMat} />
      <mesh position={[n.depth / 2, 0, -n.length / 2 + inset]} geometry={geos.side} material={meshMat} />
    </group>
  )
}
