import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { SignInCredentials, User } from '../shared/types'
import type { AuthAdapter } from './adapter'
import { AuthContext, type AuthContextValue } from './context'
import { createMockAdapter } from './mockAdapter'
import { can as canRole, type Permission } from './permissions'

const defaultAdapter = createMockAdapter()

export function AuthProvider({ children, adapter = defaultAdapter }: { children: ReactNode; adapter?: AuthAdapter }) {
  const [user, setUser] = useState<User | null>(() => adapter.getSession())

  const signIn = useCallback(
    async (credentials: SignInCredentials) => {
      const u = await adapter.signIn(credentials)
      setUser(u)
      return u
    },
    [adapter],
  )

  const signOut = useCallback(async () => {
    await adapter.signOut()
    setUser(null)
  }, [adapter])

  const value = useMemo<AuthContextValue>(
    () => ({ user, signIn, signOut, can: (p: Permission) => canRole(user?.role, p) }),
    [user, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
