import { Link } from 'react-router-dom'

export function ForbiddenPage() {
  return (
    <section className="mx-auto max-w-md py-16 text-center" aria-labelledby="forbidden-title">
      <p className="text-5xl font-bold text-neutral-300">403</p>
      <h1 id="forbidden-title" className="mt-2 text-xl font-semibold text-neutral-900 dark:text-white">
        No tienes permiso para ver esta sección
      </h1>
      <p className="mt-2 text-sm text-neutral-500">Si crees que es un error, pide a un administrador que revise tu rol.</p>
      <Link to="/dashboard" className="mt-6 inline-block font-medium text-primary-600 underline">
        Volver al inicio
      </Link>
    </section>
  )
}
