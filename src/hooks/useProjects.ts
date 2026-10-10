import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { queryKeys } from '../services/keys'

/** Lista de frentes del contrato. */
export function useProjects() {
  return useQuery({ queryKey: queryKeys.projects, queryFn: () => api.getProjects(), staleTime: 5 * 60_000 })
}
