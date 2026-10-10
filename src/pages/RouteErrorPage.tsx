import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'

/** errorElement del router: 404 y errores inesperados de render o de carga. */
export function RouteErrorPage() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404

  if (!notFound) console.error(error)

  return (
    <main className="mx-auto max-w-md overflow-auto px-4 py-16 text-center">
      <p className="text-5xl font-bold text-neutral-300">{notFound ? '404' : 'Error'}</p>
      <h1 className="mt-2 text-xl font-semibold text-neutral-900 dark:text-white">
        {notFound ? 'Esta página no existe' : 'Algo salió mal'}
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        {notFound ? 'Revisa la dirección o vuelve al inicio.' : 'Recarga la página. Si el error sigue, avísale al administrador.'}
      </p>
      <Link to="/dashboard" className="mt-6 inline-block font-medium text-primary-600 underline">
        Volver al inicio
      </Link>
    </main>
  )
}
