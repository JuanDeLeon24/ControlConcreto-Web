import { useEffect, useMemo, useRef, type ComponentRef, type RefObject } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { FlyTo, MoveInput } from '../types'

const clamp = THREE.MathUtils.clamp
const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)

interface CommonProps {
  length: number
  focusRef: RefObject<number>
  onFocusChange: (z: number) => void
  flyTo: FlyTo | null
}

interface WalkProps extends CommonProps {
  limitX: number
  eyeHeight: number
  startZ: number
  moveRef: RefObject<MoveInput>
}

/**
 * Navegación en primera persona "sobre rieles": avanza por el eje Z y se limita lateralmente
 * para que el usuario nunca atraviese las paredes.
 * Ratón: arrastrar = mirar, rueda = avanzar, W/S/A/D o flechas. Táctil: arrastrar = mirar + botones en pantalla.
 */
export function WalkRig({ length, limitX, eyeHeight, startZ, flyTo, moveRef, focusRef, onFocusChange }: WalkProps) {
  const camera = useThree((s) => s.camera)
  const dom = useThree((s) => s.gl.domElement)
  const st = useRef({
    x: 0,
    z: startZ,
    yaw: 0,
    pitch: -0.04,
    tz: null as number | null,
    keys: new Set<string>(),
    drag: false,
    lx: 0,
    ly: 0,
    lastEmit: -999,
  })

  useEffect(() => {
    const s = st.current
    camera.rotation.order = 'YXZ'
    const down = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      s.drag = true
      s.lx = e.clientX
      s.ly = e.clientY
      s.tz = null
      dom.setPointerCapture(e.pointerId)
    }
    const move = (e: PointerEvent) => {
      if (!s.drag) return
      s.yaw += (e.clientX - s.lx) * 0.004
      s.pitch = clamp(s.pitch + (e.clientY - s.ly) * 0.004, -1.2, 1.2)
      s.lx = e.clientX
      s.ly = e.clientY
    }
    const up = (e: PointerEvent) => {
      s.drag = false
      if (dom.hasPointerCapture(e.pointerId)) dom.releasePointerCapture(e.pointerId)
    }
    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      s.tz = null
      s.z = clamp(s.z - e.deltaY * 0.02, 0.8, length - 0.8)
    }
    const kd = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return
      s.keys.add(e.code)
      if (e.code.startsWith('Arrow')) e.preventDefault()
    }
    const ku = (e: KeyboardEvent) => s.keys.delete(e.code)
    const blur = () => s.keys.clear()
    dom.addEventListener('pointerdown', down)
    dom.addEventListener('pointermove', move)
    dom.addEventListener('pointerup', up)
    dom.addEventListener('pointercancel', up)
    dom.addEventListener('wheel', wheel, { passive: false })
    window.addEventListener('keydown', kd)
    window.addEventListener('keyup', ku)
    window.addEventListener('blur', blur)
    return () => {
      dom.removeEventListener('pointerdown', down)
      dom.removeEventListener('pointermove', move)
      dom.removeEventListener('pointerup', up)
      dom.removeEventListener('pointercancel', up)
      dom.removeEventListener('wheel', wheel)
      window.removeEventListener('keydown', kd)
      window.removeEventListener('keyup', ku)
      window.removeEventListener('blur', blur)
    }
  }, [camera, dom, length])

  useEffect(() => {
    if (flyTo) st.current.tz = clamp(flyTo.z, 0.8, length - 0.8)
  }, [flyTo, length])

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const s = st.current
    const k = s.keys
    const mv = moveRef.current
    const fwd = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0) + mv.fwd
    const str = (k.has('KeyD') ? 1 : 0) - (k.has('KeyA') ? 1 : 0) + mv.strafe
    const turn = (k.has('ArrowLeft') ? 1 : 0) - (k.has('ArrowRight') ? 1 : 0) + mv.turn
    const speed = k.has('ShiftLeft') || k.has('ShiftRight') ? 14 : 5
    if (fwd || str) s.tz = null
    s.yaw += turn * 1.6 * dt

    const sin = Math.sin(s.yaw)
    const cos = Math.cos(s.yaw)
    // adelante = (sin, cos) ; derecha = (-cos, sin) en el plano XZ
    s.x += (fwd * sin - str * cos) * speed * dt
    s.z += (fwd * cos + str * sin) * speed * dt

    if (s.tz !== null) {
      s.z = THREE.MathUtils.damp(s.z, s.tz, 3.5, dt)
      s.x = THREE.MathUtils.damp(s.x, 0, 3, dt)
      s.yaw = THREE.MathUtils.damp(Math.atan2(Math.sin(s.yaw), Math.cos(s.yaw)), 0, 3, dt)
      s.pitch = THREE.MathUtils.damp(s.pitch, -0.06, 3, dt)
      if (Math.abs(s.z - s.tz) < 0.05) s.tz = null
    }

    s.z = clamp(s.z, 0.8, length - 0.8)
    s.x = clamp(s.x, -limitX, limitX)
    camera.position.set(s.x, eyeHeight, s.z)
    camera.rotation.set(s.pitch, Math.PI + s.yaw, 0)

    focusRef.current = s.z
    if (Math.abs(s.z - s.lastEmit) > 3) {
      s.lastEmit = s.z
      onFocusChange(s.z)
    }
  })

  return null
}

interface OrbitProps extends CommonProps {
  startZ: number
}

/** Vista exterior orbital: el objetivo queda confinado al eje del túnel; zoom y paneo limitados. */
export function OrbitRig({ length, startZ, flyTo, focusRef, onFocusChange }: OrbitProps) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null)
  const camera = useThree((s) => s.camera)
  const lim = useMemo(
    () => ({ min: new THREE.Vector3(-3, 0, 0), max: new THREE.Vector3(3, 6, length) }),
    [length],
  )
  const last = useRef(-999)

  useEffect(() => {
    camera.position.set(24, 13, startZ - 22)
    const c = controls.current
    if (c) {
      c.target.set(0, 3, startZ)
      c.update()
    }
    // solo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const c = controls.current
    if (!flyTo || !c) return
    const z = clamp(flyTo.z, 0, length)
    const dz = z - c.target.z
    c.target.z = z
    camera.position.z += dz
    c.update()
  }, [flyTo, length, camera])

  useFrame(() => {
    const c = controls.current
    if (!c) return
    c.target.clamp(lim.min, lim.max)
    focusRef.current = c.target.z
    if (Math.abs(c.target.z - last.current) > 3) {
      last.current = c.target.z
      onFocusChange(c.target.z)
    }
  })

  return (
    <OrbitControls
      ref={controls}
      enableDamping
      dampingFactor={0.08}
      minDistance={4}
      maxDistance={70}
      minPolarAngle={0.15}
      maxPolarAngle={Math.PI / 2.05}
      screenSpacePanning={false}
    />
  )
}
