import { useId, useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { ALLOWED_DOMAIN } from '../auth/mockAdapter'
import { Logo } from '../components/brand/Logo'
import { Button } from '../components/ui/Button'
import { ROLES, ROLE_LABELS, type Role } from '../shared/types'

export function LoginPage() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('inspector')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const emailId = useId()
  const roleId = useId()
  const errorId = useId()

  if (user) return <Navigate to={from} replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn({ email, demoRole: role })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex h-dvh items-center justify-center overflow-auto bg-neutral-100 p-4 dark:bg-neutral-950">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg dark:bg-neutral-900">
        <div className="mb-6 flex justify-center">
          <Logo variant="default" withTagline={false} />
        </div>
        <h1 className="mb-1 text-xl font-bold text-neutral-900 dark:text-white">Iniciar sesión</h1>
        <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">ControlConcreto · CC-167</p>

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor={emailId} className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
              Correo corporativo
            </label>
            <input
              id={emailId}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`nombre${ALLOWED_DOMAIN}`}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor={roleId} className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
              Rol (solo demostración)
            </label>
            <select
              id={roleId}
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth loading={loading}>
            Entrar
          </Button>
        </form>

        <p className="mt-6 text-xs text-neutral-500 dark:text-neutral-400">
          Modo demostración: no se valida contraseña. En producción se usará la cuenta corporativa.
        </p>
      </div>
    </main>
  )
}
