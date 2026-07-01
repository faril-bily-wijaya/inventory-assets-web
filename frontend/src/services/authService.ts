import { api } from './api'
import type { User, LoginRequest, LoginResponse } from '../types'

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', data)
    return response.data
  },

  async register(data: LoginRequest & { email: string; fullName?: string }): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/register', data)
    return response.data
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<{ user: User }>('/auth/me')
    return response.data.user
  },
}
