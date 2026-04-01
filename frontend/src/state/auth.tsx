import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { tokenStorage, unauthorizedEvent } from '../lib/storage'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [token, setToken] = useState(() => tokenStorage.get())

  const signOut = useCallback(() => {
    tokenStorage.clear()
    setToken(null)
    queryClient.clear()
  }, [queryClient])

  const signIn = useCallback(
    (nextToken: string) => {
      tokenStorage.set(nextToken)
      setToken(nextToken)
      queryClient.invalidateQueries()
    },
    [queryClient],
  )

  useEffect(() => {
    window.addEventListener(unauthorizedEvent, signOut)
    return () => window.removeEventListener(unauthorizedEvent, signOut)
  }, [signOut])

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      signIn,
      signOut,
    }),
    [signIn, signOut, token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
