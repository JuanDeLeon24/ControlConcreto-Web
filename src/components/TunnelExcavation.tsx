import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { TunnelData } from '../types'
import { createDeformationField } from '../lib/deformation'
import { buildTunnelSurface } from '../lib/geometry'
import { getRock } from '../lib/textures'

interface Props {
  data: TunnelData
  /** Uniforms compartidos: uFront (m) y uBlend (m). */
  uniforms: { uFront: THREE.IUniform<number>; uBlend: THREE.IUniform<number> }
  /** Plano que conserva solo z >= frente. */
  plane: THREE.Plane
  visible: boolean
}

/**
 * Roca desnuda con sobre-excavaciones y convergencias.
 * - Clipping plane: oculta la roca ya cubierta por el revestimiento.
 * - Vertex shader: justo delante del frente la roca se "corrige" suavemente hacia la sección teórica.
 */
export function TunnelExcavation({ data, uniforms, plane, visible }: Props) {
  const total = data.moduleLength * data.moduleCount

  const geometry = useMemo(() => {
    const field = createDeformationField(data.section, data.deformations, data.seed)
    return buildTunnelSurface({
      section: data.section,
      z0: 0,
      z1: total,
      zStep: 0.75,
      segments: 72,
      uTile: 5,
      vTile: 5,
      offsetFn: field.offsetAt,
    })
  }, [data.section, data.deformations, data.seed, total])

  const material = useMemo(() => {
    const t = getRock()
    const m = new THREE.MeshStandardMaterial({
      map: t.map,
      normalMap: t.normalMap,
      roughnessMap: t.roughnessMap,
      normalScale: new THREE.Vector2(1.3, 1.3),
      roughness: 1,
      metalness: 0,
      clippingPlanes: [plane],
    })
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uFront = uniforms.uFront
      shader.uniforms.uBlend = uniforms.uBlend
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nattribute vec3 aTheo;\nuniform float uFront;\nuniform float uBlend;')
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
float wCorr = 1.0 - smoothstep(uFront, uFront + uBlend, position.z);
transformed = mix(transformed, aTheo, wCorr);`,
        )
    }
    m.customProgramCacheKey = () => 'rock-correction'
    return m
  }, [plane, uniforms])

  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => material.dispose(), [material])

  return <mesh geometry={geometry} material={material} visible={visible} frustumCulled={false} />
}
