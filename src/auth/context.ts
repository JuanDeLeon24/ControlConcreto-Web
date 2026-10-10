import { createContext } from 'react'
import type { SignInCredentials, User } from '../shared/types'
import type { Permission } from './permissions'

export interface AuthContextValue {
  user: User | null
  signIn: (credentials: SignInCredentials) => Promise<User>
  signOut: () => Promise<void>
  can: (permission: Permission) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)
