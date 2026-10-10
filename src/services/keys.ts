/** Query keys centralizadas: evita errores de tipeo al invalidar caché. */
export const queryKeys = {
  projects: ['projects'] as const,
  tunnel: (projectId: string) => ['projects', projectId, 'tunnel'] as const,
  emr: (projectId: string) => ['projects', projectId, 'emr'] as const,
}
