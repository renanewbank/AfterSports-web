import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { TOKEN_KEY } from '../lib/api'
import { get, post } from '../lib/api'
import type { AuthResponse, UserDTO } from '../types/dto'

type AuthState = {
  ready: boolean
  user: UserDTO | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthState>({
  ready: false,
  user: null,
  token: null,
  async login() {},
  async register() {},
  logout() {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState<UserDTO | null>(null)
  const [token, setToken] = useState<string | null>(null)

  const persistToken = (tok: string | null) => {
    if (tok) localStorage.setItem(TOKEN_KEY, tok)
    else localStorage.removeItem(TOKEN_KEY)
    setToken(tok)
  }

  const fetchMe = useCallback(async () => {
    try {
      const me = await get<UserDTO>('/api/auth/me')
      setUser(me)
    } catch {
      setUser(null)
      persistToken(null)
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY)
    if (saved) {
      setToken(saved)
      // /api/auth/me vai validar o token pelo interceptor
      fetchMe()
    } else {
      setReady(true)
    }
  }, [fetchMe])

  const login = useCallback(async (email: string, password: string) => {
    const data = await post<AuthResponse, { email: string; password: string }>(
      '/api/auth/login',
      { email, password },
    )
    persistToken(data.token)
    setUser(data.user)
  }, [])

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const data = await post<AuthResponse, { name: string; email: string; password: string }>(
        '/api/auth/register',
        { name, email, password },
      )
      persistToken(data.token)
      setUser(data.user)
    },
    [],
  )

  const logout = useCallback(() => {
    persistToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ ready, user, token, login, register, logout }),
    [ready, user, token, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
