import type { Role } from '../shared/types'

export type Permission =
  | 'dashboard:view'
  | 'tunnel:view'
  | 'monitoring:view'
  | 'projects:view'
  | 'projects:manage'
  | 'registro:create'
  | 'import:run'

/**
 * Matriz de permisos por rol. Es la única fuente de verdad en el frontend.
 * OJO: el frontend solo oculta opciones; la protección real debe estar en el backend (RLS).
 */
const MATRIX: Record<Role, readonly Permission[]> = {
  admin: ['dashboard:view', 'tunnel:view', 'monitoring:view', 'projects:view', 'projects:manage', 'registro:create', 'import:run'],
  jefe_obra: ['dashboard:view', 'tunnel:view', 'monitoring:view', 'projects:view', 'projects:manage', 'registro:create', 'import:run'],
  inspector: ['dashboard:view', 'tunnel:view', 'monitoring:view', 'projects:view', 'registro:create'],
  gerencia: ['dashboard:view', 'tunnel:view', 'monitoring:view', 'projects:view'],
}

/** true si el rol tiene el permiso. Sin rol (no autenticado) siempre es false. */
export function can(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false
  return MATRIX[role].includes(permission)
}
