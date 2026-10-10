/** Indicador mientras se descarga una ruta pesada (p. ej. el visor 3D). */
export function PageLoader({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex h-64 items-center justify-center text-sm text-neutral-500">
      <span className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-primary-600" aria-hidden="true" />
      {label}
    </div>
  )
}
