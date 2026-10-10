import { useRef } from 'react'
import { ChevronDown, ChevronUp, Download, Pause, Play, RotateCcw, SlidersHorizontal, Upload, Layers, Map, Eye, Tag, Database } from 'lucide-react'
import { Button, Badge, ProgressBar, Card, CardHeader, CardBody } from './index'
import type { Layers as LayersType, NavMode, TunnelData } from '../../types'

interface Props {
  data: TunnelData
  front: number
  onFront: (v: number) => void
  playing: boolean
  onPlay: () => void
  onReset: () => void
  layers: LayersType
  onLayers: (l: LayersType) => void
  mode: NavMode
  onMode: (m: NavMode) => void
  onDownload: () => void
  onUpload: (f: File) => void
  error: string | null
  open: boolean
  onToggle: () => void
}

const LAYER_LABELS: [keyof LayersType, string, React.ReactNode][] = [
  ['excavation', 'Excavación', <Layers size={14} />],
  ['lining', 'Revestimiento', <Map size={14} />],
  ['elements', 'Elementos', <Eye size={14} />],
  ['labels', 'Deformaciones', <Tag size={14} />],
  ['gallery', 'Galería', <Map size={14} />],
  ['elementsFollow', 'Elementos siguen avance', <Database size={14} />],
]

const LEGEND = [
  { color: 'bg-emerald-500', label: 'Terminado', status: 'done' as const },
  { color: 'bg-amber-400', label: 'En ejecución', status: 'active' as const },
  { color: 'bg-red-500', label: 'Retrasado', status: 'late' as const },
  { color: 'bg-neutral-600', label: 'Sin iniciar', status: 'idle' as const },
]

export function ControlPanel(p: Props) {
  const { data } = p
  const total = data.moduleLength * data.moduleCount
  const file = useRef<HTMLInputElement>(null)
  const doneModules = Math.floor(p.front / data.moduleLength)
  const pct = (p.front / total) * 100
  const step = data.moduleLength

  return (
    <Card
      className="pointer-events-auto w-full shadow-xl border-neutral-700 bg-neutral-900/95 backdrop-blur-sm md:w-80"
      hover={false}
      bordered
      elevated
    >
      <CardHeader
        className="px-4 py-3 border-neutral-700 bg-neutral-900/50"
        title={`${data.name} · Controles`}
        action={
          <button
            onClick={p.onToggle}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors md:hidden"
            aria-expanded={p.open}
            aria-label={p.open ? 'Colapsar panel' : 'Expandir panel'}
          >
            {p.open ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        }
      >
        <SlidersHorizontal size={16} className="text-primary-400" aria-hidden="true" />
      </CardHeader>

      <CardBody className={`${p.open ? 'block' : 'hidden'} max-h-[48vh] overflow-y-auto pb-2 md:block md:max-h-[calc(100dvh-14rem)] px-4`}>
        {/* Avance del revestimiento */}
        <section className="mb-6" aria-labelledby="front-heading">
          <h3 id="front-heading" className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
            Avance del Revestimiento
          </h3>
          
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-sm text-neutral-300">Progreso</span>
            <span className="text-sm font-mono font-semibold text-amber-300 tabular-nums">
              {p.front.toFixed(1)} m
            </span>
          </div>
          
          <ProgressBar
            value={pct}
            variant="warning"
            size="md"
            showLabel
            labelPosition="outside"
            striped
            animated={p.playing}
            className="h-3"
            aria-label={`Avance del revestimiento: ${pct.toFixed(1)} por ciento`}
          />
          
          <div className="mt-2 text-xs text-neutral-500 flex items-center justify-between">
            <span>{doneModules} de {data.moduleCount} módulos revestidos</span>
            <span className="font-medium text-amber-300">{pct.toFixed(1)}%</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant={p.playing ? 'secondary' : 'primary'}
              size="sm"
              onClick={p.onPlay}
              leftIcon={p.playing ? <Pause size={14} /> : <Play size={14} />}
            >
              {p.playing ? 'Pausar' : 'Animar'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => p.onFront(Math.max(0, p.front - step))} aria-label="Retroceder un módulo">
              −1 mód.
            </Button>
            <Button variant="ghost" size="sm" onClick={() => p.onFront(Math.min(total, p.front + step))} aria-label="Avanzar un módulo">
              +1 mód.
            </Button>
            <Button variant="ghost" size="sm" onClick={p.onReset} aria-label="Restablecer avance" leftIcon={<RotateCcw size={14} />}>
              Reset
            </Button>
          </div>
        </section>

        {/* Navegación */}
        <section className="mb-6" aria-labelledby="nav-heading">
          <h3 id="nav-heading" className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
            Navegación
          </h3>
          
          <div className="grid grid-cols-2 gap-2 mb-3" role="radiogroup" aria-label="Modo de navegación">
            {(['walk', 'orbit'] as NavMode[]).map((m) => (
              <Button
                key={m}
                variant={p.mode === m ? 'primary' : 'ghost'}
                size="sm"
                className="w-full"
                onClick={() => p.onMode(m)}
                aria-pressed={p.mode === m}
              >
                {m === 'walk' ? '🚶 Recorrido' : '🛰️ Vista exterior'}
              </Button>
            ))}
          </div>
          
          <p className="text-xs leading-relaxed text-neutral-500">
            {p.mode === 'walk'
              ? 'Arrastra para mirar · Rueda o W/S para avanzar · A/D para desplazarte · Shift = rápido'
              : 'Arrastra para orbitar · Rueda para acercar/alejar · Clic derecho o dos dedos para desplazar'}
          </p>
        </section>

        {/* Capas */}
        <section className="mb-6" aria-labelledby="layers-heading">
          <h3 id="layers-heading" className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
            Capas Visibles
          </h3>
          
          <div className="flex flex-wrap gap-2" role="group" aria-label="Capas del modelo">
            {LAYER_LABELS.map(([k, label, icon]) => (
              <Button
                key={k}
                variant={p.layers[k] ? 'primary' : 'ghost'}
                size="sm"
                className="gap-1.5 px-3"
                onClick={() => p.onLayers({ ...p.layers, [k]: !p.layers[k] })}
                aria-pressed={p.layers[k]}
                leftIcon={icon}
              >
                {label}
              </Button>
            ))}
          </div>
        </section>

        {/* Estado de módulos */}
        <section className="mb-6" aria-labelledby="legend-heading">
          <h3 id="legend-heading" className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
            Leyenda de Módulos
          </h3>
          
          <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs text-neutral-300">
            {LEGEND.map(({ label, status }) => (
              <Badge key={label} variant={status === 'done' ? 'success' : status === 'active' ? 'warning' : status === 'late' ? 'danger' : 'neutral'} dot>
                {label}
              </Badge>
            ))}
          </div>
        </section>

        {/* Datos JSON */}
        <section aria-labelledby="data-heading">
          <h3 id="data-heading" className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
            Datos (JSON)
          </h3>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <Button variant="outline" size="sm" onClick={p.onDownload} leftIcon={<Download size={14} />}>
              Descargar
            </Button>
            <Button variant="outline" size="sm" onClick={() => file.current?.click()} leftIcon={<Upload size={14} />}>
              Cargar
            </Button>
            <input
              ref={file}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) p.onUpload(f)
                e.target.value = ''
              }}
              aria-label="Cargar archivo JSON de túnel"
            />
          </div>
          
          {p.error && (
            <div role="alert" className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{p.error}</span>
              </div>
            </div>
          )}
        </section>
      </CardBody>
    </Card>
  )
}