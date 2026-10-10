import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { queryKeys } from '../services/keys'

/** Estaciones de convergencia (EMR) de un frente. */
export function useEmrStations(projectId: string) {
  return useQuery({
    queryKey: queryKeys.emr(projectId),
    queryFn: () => api.getEmrStations(projectId),
    enabled: projectId.length > 0,
  })
}
