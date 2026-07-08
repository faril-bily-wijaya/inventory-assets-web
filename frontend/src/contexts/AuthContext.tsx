import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

interface User {
  id: string
  username: string
  email: string
  fullName?: string
  role: 'ADMIN' | 'STAFF'
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>
  register: (data: any) => Promise<void>
  updateProfile: (data: any) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const storedToken = sessionStorage.getItem('token') || localStorage.getItem('token')
    const storedUser = sessionStorage.getItem('user') || localStorage.getItem('user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string, rememberMe: boolean = true) => {
    const response = await api.post('/auth/login', { username, password })
    const { token: newToken, user: newUser } = response.data

    const storage = rememberMe ? localStorage : sessionStorage
    storage.setItem('token', newToken)
    storage.setItem('user', JSON.stringify(newUser))

    setToken(newToken)
    setUser(newUser)
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

    navigate('/')
  }

  const registerUser = async (data: any) => {
    const response = await api.post('/auth/register', data)
    const { token: newToken, user: newUser } = response.data

    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))

    setToken(newToken)
    setUser(newUser)
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

    navigate('/')
  }

  const updateProfile = async (data: any) => {
    const response = await api.put('/auth/me', data)
    const { user: updatedUser } = response.data

    const isRemembered = localStorage.getItem('token') !== null
    const storage = isRemembered ? localStorage : sessionStorage
    
    storage.setItem('user', JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    setToken(null)
    setUser(null)
    delete api.defaults.headers.common['Authorization']
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated: !!user, login, register: registerUser, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
