import { ROLES, type Role, type User } from '../shared/types'
import type { AuthAdapter } from './adapter'

const STORAGE_KEY = 'cc-auth-session'
export const ALLOWED_DOMAIN = '@elcondor.com'

function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value)
}

function readSession(storage: Storage): User | null {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data: unknown = JSON.parse(raw)
    if (typeof data !== 'object' || data === null) return null
    const u = data as Record<string, unknown>
    if (typeof u.id !== 'string' || typeof u.email !== 'string' || typeof u.name !== 'string' || !isRole(u.role)) return null
    return { id: u.id, email: u.email, name: u.name, role: u.role }
  } catch {
    return null
  }
}

function nameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? ''
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}

/**
 * Autenticación de DEMOSTRACIÓN: no valida contraseña ni consulta servidor.
 * Sirve para desarrollar y probar roles. NO usar con datos reales.
 */
export function createMockAdapter(storage: Storage = localStorage): AuthAdapter {
  return {
    getSession: () => readSession(storage),
    async signIn({ email, demoRole }) {
      const normalized = email.trim().toLowerCase()
      if (!normalized.endsWith(ALLOWED_DOMAIN)) {
        throw new Error(`Usa tu correo corporativo (${ALLOWED_DOMAIN}).`)
      }
      const user: User = {
        id: `demo-${normalized}`,
        email: normalized,
        name: nameFromEmail(normalized),
        role: demoRole ?? 'inspector',
      }
      storage.setItem(STORAGE_KEY, JSON.stringify(user))
      return user
    },
    async signOut() {
      storage.removeItem(STORAGE_KEY)
    },
  }
}
