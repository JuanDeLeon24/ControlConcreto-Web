import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './api'

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        // En obra la señal es intermitente: se sirve la caché y se reintenta al recuperar conexión.
        networkMode: 'offlineFirst',
        // 404 y 403 no se arreglan reintentando.
        retry: (count, error) => !(error instanceof ApiError && error.status >= 400 && error.status < 500) && count < 2,
        refetchOnWindowFocus: false,
      },
    },
  })
}
