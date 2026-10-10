import { useEffect, useRef } from 'react'
import { Badge } from './index'

interface Props {
  moduleCount: number
  moduleLength: number
  front: number
  plannedFront?: number
  focusZ: number
  onSelect: (module: number) => void
}

type Status = 'done' | 'active' | 'late' | 'idle'

const STATUS_CONFIG: Record<Status, { variant: 'success' | 'warning' | 'danger' | 'neutral'; label: string }> = {
  done: { variant: 'success', label: 'Terminado' },
  active: { variant: 'warning', label: 'En ejecución' },
  late: { variant: 'danger', label: 'Retrasado' },
  idle: { variant: 'neutral', label: 'Sin iniciar' },
}

const status = (m: number, moduleLength: number, front: number, plannedFront?: number): Status => {
  const z0 = (m - 1) * moduleLength
  const z1 = m * moduleLength
  if (z1 <= front + 1e-6) return 'done'
  if (z0 < front) return 'active'
  if (plannedFront !== undefined && z1 <= plannedFront) return 'late'
  return 'idle'
}

/** Barra longitudinal de módulos con diseño corporativo */
export function ModuleBar({ moduleCount, moduleLength, front, plannedFront, focusZ, onSelect }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const active = Math.min(moduleCount, Math.max(1, Math.floor(focusZ / moduleLength) + 1))

  useEffect(() => {
    const el = box.current?.querySelector<HTMLElement>(`[data-m="${active}"]`)
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [active])

  const total = moduleLength * moduleCount
  const progressPct = (front / total) * 100

  return (
    <div className="w-full">
      {/* Progress overview */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Badge variant="success" dot size="sm">Terminado</Badge>
            <Badge variant="warning" dot size="sm">En ejecución</Badge>
            <Badge variant="danger" dot size="sm">Retrasado</Badge>
            <Badge variant="neutral" dot size="sm">Sin iniciar</Badge>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-500">Progreso global</p>
          <p className="text-sm font-semibold text-primary-600 tabular-nums">{progressPct.toFixed(1)}%</p>
        </div>
      </div>

      {/* Module bar */}
      <div
        ref={box}
        className="flex gap-1 overflow-x-auto px-1 pb-2 snap-x"
        role="tablist"
        aria-label="Módulos del túnel"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#6b7280 transparent' }}
      >
        {Array.from({ length: moduleCount }, (_, i) => i + 1).map((m) => {
          const s = status(m, moduleLength, front, plannedFront)
          const config = STATUS_CONFIG[s]
          const isActive = m === active
          const z0 = (m - 1) * moduleLength
          const z1 = m * moduleLength

          return (
            <button
              key={m}
              data-m={m}
              role="tab"
              aria-selected={isActive}
              aria-label={`Módulo ${m}: ${config.label}, ${z0}-${z1}m`}
              onClick={() => onSelect(m)}
              className={`
                relative flex-shrink-0 min-w-[44px] h-10
                rounded-lg border-2 font-semibold text-xs
                transition-all duration-200
                snap-center
                ${config.variant === 'success' ? 'bg-green-600 text-white border-green-700 hover:bg-green-700' : ''}
                ${config.variant === 'warning' ? 'bg-amber-400 text-black border-amber-500 hover:bg-amber-500' : ''}
                ${config.variant === 'danger' ? 'bg-red-600 text-white border-red-700 hover:bg-red-700' : ''}
                ${config.variant === 'neutral' ? 'bg-neutral-600 text-white border-neutral-700 hover:bg-neutral-700' : ''}
                ${isActive ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-neutral-900 scale-105 z-10' : ''}
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
              `}
              style={{ transformOrigin: 'center' }}
            >
              <span className="flex items-center justify-center h-full px-2">{m}</span>
              
              {/* Indicador de posición actual */}
              {isActive && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" aria-hidden="true" />
              )}

              {/* Tooltip en hover */}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-medium text-white bg-neutral-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Módulo {m} · {config.label} · {z0}-{z1}m
              </span>
            </button>
          )
        })}
      </div>

      {/* Leyenda compacta */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-neutral-500">
        <span className="font-medium text-neutral-700 dark:text-neutral-300">Módulo actual: <span className="text-primary-600 font-bold">{active}</span></span>
        <span>Longitud: {moduleLength}m</span>
        <span>Total: {total}m</span>
        {plannedFront && (
          <span className="text-amber-600 font-medium">Planeado: {plannedFront}m</span>
        )}
      </div>
    </div>
  )
}