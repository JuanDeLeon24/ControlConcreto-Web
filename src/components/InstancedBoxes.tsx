import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'

export interface BoxInstance {
  x: number
  y: number
  z: number
  sx: number
  sy: number
  sz: number
  /** Abscisa final del elemento: se usa para decidir si ya está construido. */
  zEnd: number
}

const boxGeo = new THREE.BoxGeometry(1, 1, 1)

/** Cuenta cuántas instancias (ordenadas por zEnd) ya quedan antes del frente. */
export function countBuilt(items: BoxInstance[], front: number): number {
  let n = 0
  while (n < items.length && items[n].zEnd <= front + 1e-6) n++
  return n
}

interface Props {
  items: BoxInstance[]
  material: THREE.Material
  visibleCount: number
}

/** Un solo draw call para miles de cajas (THREE.InstancedMesh). */
export function InstancedBoxes({ items, material, visibleCount }: Props) {
  const ref = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const dummy = new THREE.Object3D()
    items.forEach((it, i) => {
      dummy.position.set(it.x, it.y, it.z)
      dummy.scale.set(it.sx, it.sy, it.sz)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [items])

  useLayoutEffect(() => {
    if (ref.current) ref.current.count = Math.min(visibleCount, items.length)
  }, [visibleCount, items.length])

  if (items.length === 0) return null
  return <instancedMesh key={items.length} ref={ref} args={[boxGeo, material, items.length]} frustumCulled={false} />
}
