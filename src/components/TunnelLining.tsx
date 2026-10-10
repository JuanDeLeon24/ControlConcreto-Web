import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { SectionParams } from '../types'
import type { Opening } from '../lib/openings'
import { buildTunnelSurface } from '../lib/geometry'
import { getConcrete } from '../lib/textures'

const MAX_OPENINGS = 24

interface Props {
  section: SectionParams
  total: number
  moduleLength: number
  openings: Opening[]
  /** Plano que conserva solo z <= frente. */
  plane: THREE.Plane
  visible: boolean
}

/** Revestimiento teórico (liso). Los nichos y la boca de la galería se recortan en el fragment shader. */
export function TunnelLining({ section, total, moduleLength, openings, plane, visible }: Props) {
  const geometry = useMemo(
    () =>
      buildTunnelSurface({
        section,
        z0: 0,
        z1: total,
        zStep: moduleLength,
        segments: 96,
        uTile: 4,
        vTile: moduleLength,
      }),
    [section, total, moduleLength],
  )

  const uniforms = useMemo(
    () => ({
      uOpen: { value: Array.from({ length: MAX_OPENINGS }, () => new THREE.Vector4()) },
      uOpenSide: { value: new Array<number>(MAX_OPENINGS).fill(0) },
      uOpenCount: { value: 0 },
      uXMin: { value: 0 },
    }),
    [],
  )

  useEffect(() => {
    const list = openings.slice(0, MAX_OPENINGS)
    list.forEach((o, i) => {
      uniforms.uOpen.value[i].set(o.z0, o.z1, o.y0, o.y1)
      uniforms.uOpenSide.value[i] = o.sign
    })
    uniforms.uOpenCount.value = list.length
    uniforms.uXMin.value = (section.width / 2) * 0.7
  }, [openings, section.width, uniforms])

  const material = useMemo(() => {
    const t = getConcrete()
    const m = new THREE.MeshStandardMaterial({
      map: t.map,
      normalMap: t.normalMap,
      roughnessMap: t.roughnessMap,
      color: '#cfcfc9',
      roughness: 1,
      metalness: 0,
      clippingPlanes: [plane],
    })
    m.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms)
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vOP;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvOP = position;')
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
varying vec3 vOP;
uniform vec4 uOpen[${MAX_OPENINGS}];
uniform float uOpenSide[${MAX_OPENINGS}];
uniform int uOpenCount;
uniform float uXMin;`,
        )
        .replace(
          '#include <clipping_planes_fragment>',
          `#include <clipping_planes_fragment>
for (int i = 0; i < ${MAX_OPENINGS}; i++) {
  if (i >= uOpenCount) break;
  vec4 o = uOpen[i];
  if (vOP.z > o.x && vOP.z < o.y && vOP.y > o.z && vOP.y < o.w && vOP.x * uOpenSide[i] > uXMin) discard;
}`,
        )
    }
    m.customProgramCacheKey = () => 'lining-openings'
    return m
  }, [plane, uniforms])

  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => material.dispose(), [material])

  return <mesh geometry={geometry} material={material} visible={visible} frustumCulled={false} />
}
