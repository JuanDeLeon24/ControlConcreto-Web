import { useCallback, useEffect, useRef, useState } from 'react'
import { parseTunnelData } from '../data/parse'
import { TunnelScene } from '../components/TunnelScene'
import { ControlPanel } from '../components/ui/ControlPanel'
import { ModuleBar } from '../components/ui/ModuleBar'
import { MoveButtons } from '../components/ui/MoveButtons'
import { useTunnelData } from '../hooks/useTunnelData'
import { PageLoader } from '../pages/PageLoader'
import { useTunnelStore } from '../store/useTunnelStore'
import type { FlyTo, MoveInput, TunnelData } from '../types'

/** Vista completa del túnel 3D: carga los datos del frente activo y muestra el visor. */
export function TunnelView() {
  const projectId = useTunnelStore((s) => s.activeProjectId)
  const query = useTunnelData(projectId)
  // JSON cargado a mano desde el panel: tiene prioridad sobre los datos del servidor.
  const [uploaded, setUploaded] = useState<TunnelData | null>(null)
  const data = uploaded ?? query.data

  if (!data) {
    if (query.isError) {
      return (
        <div role="alert" className="mx-auto max-w-md py-16 text-center">
          <p className="font-semibold text-neutral-900 dark:text-white">No se pudo cargar el modelo 3D.</p>
          <p className="mt-2 text-sm text-neutral-500">{query.error.message}</p>
          <button type="button" onClick={() => query.refetch()} className="mt-4 font-medium text-primary-600 underline">
            Reintentar
          </button>
        </div>
      )
    }
    return <PageLoader label="Cargando datos del túnel…" />
  }

  // key: al cambiar de proyecto o de archivo, el visor se reinicia limpio.
  return <TunnelViewer key={`${projectId}:${uploaded ? 'local' : 'server'}`} data={data} onUploaded={setUploaded} />
}

function TunnelViewer({ data, onUploaded }: { data: TunnelData; onUploaded: (d: TunnelData) => void }) {
  const total = data.moduleLength * data.moduleCount
  const storedFront = useTunnelStore((s) => s.front)
  const setStoredFront = useTunnelStore((s) => s.setFront)
  const layers = useTunnelStore((s) => s.layers)
  const setLayers = useTunnelStore((s) => s.setLayers)
  const mode = useTunnelStore((s) => s.mode)
  const setMode = useTunnelStore((s) => s.setMode)
  const storedFocus = useTunnelStore((s) => s.focusZ)
  const setFocusZ = useTunnelStore((s) => s.setFocusZ)

  const front = Math.min(storedFront ?? data.progress.liningFront, total)
  const setFront = useCallback((v: number | ((f: number) => number)) => {
    const s = useTunnelStore.getState()
    const current = s.front ?? data.progress.liningFront
    s.setFront(typeof v === 'function' ? v(current) : v)
  }, [data.progress.liningFront])
  const focusZ = Math.min(storedFocus ?? Math.max(1, data.progress.liningFront - 12), total - 1)

  const [flyTo, setFlyTo] = useState<FlyTo | null>(null)
  const [playing, setPlaying] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const moveRef = useRef<MoveInput>({ fwd: 0, strafe: 0, turn: 0 })
  const flyKey = useRef(0)

  const fly = useCallback((z: number) => {
    flyKey.current += 1
    setFlyTo({ z, key: flyKey.current })
  }, [])

  // Animación del avance del revestimiento
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setFront((f) => Math.min(total, f + 0.4)), 80)
    return () => clearInterval(id)
  }, [playing, total, setFront])
  useEffect(() => {
    if (playing && front >= total) setPlaying(false)
  }, [playing, front, total])

  const onSelectModule = (m: number) => {
    const z0 = (m - 1) * data.moduleLength
    fly(mode === 'walk' ? Math.max(1, z0 - 6) : z0 + data.moduleLength / 2)
  }

  const onUpload = async (file: File) => {
    try {
      const next = parseTunnelData(await file.text())
      setPlaying(false)
      setStoredFront(null)
      setFocusZ(null)
      setError(null)
      onUploaded(next)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo leer el archivo.')
    }
  }

  const onDownload = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tunel0-datos.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden bg-[#07090c]">
      {/* Canvas 3D del túnel - full screen */}
      <div className="absolute inset-0">
        <TunnelScene
          data={data}
          front={front}
          layers={layers}
          mode={mode}
          flyTo={flyTo}
          moveRef={moveRef}
          focusZ={focusZ}
          onFocusChange={setFocusZ}
        />
      </div>

      {/* Header overlay con info de posición */}
      <header className="pointer-events-none absolute left-0 top-0 z-10 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-xl bg-black/60 px-4 py-3 backdrop-blur-sm border border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h1 className="text-sm font-semibold text-white">ControlConcreto · {data.name}</h1>
                <p className="text-xs text-neutral-300">
                  Posición z = {focusZ.toFixed(0)} m · módulo {Math.min(data.moduleCount, Math.floor(focusZ / data.moduleLength) + 1)} de {data.moduleCount}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs font-medium bg-primary-600/20 text-primary-300 rounded-full border border-primary-500/30">
                  {mode === 'walk' ? '🚶 Recorrido' : '🛰️ Vista exterior'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Controles flotantes - modo walk */}
      {mode === 'walk' && (
        <div className="pointer-events-none absolute bottom-24 left-4 md:hidden z-20">
          <div className="pointer-events-auto">
            <MoveButtons moveRef={moveRef} />
          </div>
        </div>
      )}

      {/* Panel de control lateral */}
      <div className="pointer-events-none absolute right-4 top-20 bottom-24 z-20 w-full max-w-sm md:max-w-[320px]">
        <ControlPanel
          data={data}
          front={front}
          onFront={(v) => {
            setPlaying(false)
            setFront(v)
          }}
          playing={playing}
          onPlay={() => {
            if (front >= total) setFront(0)
            setPlaying((p) => !p)
          }}
          onReset={() => {
            setPlaying(false)
            setStoredFront(null)
          }}
          layers={layers}
          onLayers={setLayers}
          mode={mode}
          onMode={setMode}
          onDownload={onDownload}
          onUpload={onUpload}
          error={error}
          open={panelOpen}
          onToggle={() => setPanelOpen((o) => !o)}
        />
      </div>

      {/* Barra de módulos inferior */}
      <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-10 px-4 pb-4 md:pb-8">
        <div className="max-w-7xl mx-auto">
          <ModuleBar
            moduleCount={data.moduleCount}
            moduleLength={data.moduleLength}
            front={front}
            plannedFront={data.progress.plannedFront}
            focusZ={focusZ}
            onSelect={onSelectModule}
          />
        </div>
      </div>
    </div>
  )
}