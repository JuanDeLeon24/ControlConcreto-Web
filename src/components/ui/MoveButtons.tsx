import type { RefObject } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react'
import type { MoveInput } from '../../types'

interface Props {
  moveRef: RefObject<MoveInput>
}

/** Botones táctiles de desplazamiento (se mantienen presionados). */
export function MoveButtons({ moveRef }: Props) {
  const hold = (key: keyof MoveInput, value: number) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId)
      moveRef.current[key] = value
    },
    onPointerUp: () => {
      moveRef.current[key] = 0
    },
    onPointerCancel: () => {
      moveRef.current[key] = 0
    },
  })
  const cls =
    'flex h-12 w-12 select-none items-center justify-center rounded-full bg-black/60 text-white backdrop-blur active:bg-amber-400 active:text-black'
  return (
    <div className="grid grid-cols-3 gap-1" style={{ touchAction: 'none' }}>
      <span />
      <button aria-label="Avanzar" className={cls} {...hold('fwd', 1)}>
        <ArrowUp size={22} />
      </button>
      <span />
      <button aria-label="Girar a la izquierda" className={cls} {...hold('turn', 1)}>
        <ArrowLeft size={22} />
      </button>
      <button aria-label="Retroceder" className={cls} {...hold('fwd', -1)}>
        <ArrowDown size={22} />
      </button>
      <button aria-label="Girar a la derecha" className={cls} {...hold('turn', -1)}>
        <ArrowRight size={22} />
      </button>
    </div>
  )
}
