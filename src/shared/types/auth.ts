/** Roles del sistema. El orden no implica jerarquía; los permisos se definen en auth/permissions.ts. */
export const ROLES = ['admin', 'jefe_obra', 'inspector', 'gerencia'] as const
export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrador',
  jefe_obra: 'Jefe de obra',
  inspector: 'Inspector',
  gerencia: 'Gerencia',
}

export interface User {
  id: string
  name: string
  email: string
  role: Role
}

export interface SignInCredentials {
  email: string
  password?: string
  /** Solo para el adaptador de demostración: rol elegido en el login. */
  demoRole?: Role
}
