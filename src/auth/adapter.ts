import type { SignInCredentials, User } from '../shared/types'

/**
 * Contrato que cumple cualquier proveedor de autenticación.
 * Hoy: mockAdapter (demostración). Mañana: supabaseAdapter, sin tocar componentes.
 */
export interface AuthAdapter {
  /** Sesión guardada al cargar la app (síncrono para evitar parpadeo en rutas protegidas). */
  getSession(): User | null
  signIn(credentials: SignInCredentials): Promise<User>
  signOut(): Promise<void>
}
