import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { queryKeys } from '../services/keys'

/**
 * Datos del modelo 3D de un frente.
 * @param projectId id del frente (p. ej. "cc167-t0"). Si es vacío, la consulta no se ejecuta.
 * @returns el resultado de React Query: `data`, `isPending`, `error`, `refetch`…
 */
export function useTunnelData(projectId: string) {
  return useQuery({
    queryKey: queryKeys.tunnel(projectId),
    queryFn: () => api.getTunnelData(projectId),
    enabled: projectId.length > 0,
  })
}
