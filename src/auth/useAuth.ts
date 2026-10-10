import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from './context'

/** Usuario actual, login/logout y verificación de permisos. Debe usarse dentro de <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>.')
  return ctx
}
