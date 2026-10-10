import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { ForbiddenPage } from '../pages/ForbiddenPage'
import type { Permission } from './permissions'
import { useAuth } from './useAuth'

interface Props {
  children: ReactNode
  /** Permiso necesario para ver la ruta. Sin permiso: solo exige sesión iniciada. */
  permission?: Permission
}

/** Envuelve una ruta: sin sesión redirige a /login; sin permiso muestra 403. */
export function RequireAuth({ children, permission }: Props) {
  const { user, can } = useAuth()
  const location = useLocation()

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (permission && !can(permission)) return <ForbiddenPage />
  return <>{children}</>
}
