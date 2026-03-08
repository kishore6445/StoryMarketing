"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  fullName: string
  role: string
}

interface AuthState {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  })
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('sessionToken')
      if (!token) {
        setAuthState({
          user: null,
          loading: false,
          isAuthenticated: false,
        })
        return
      }

      console.log('[v0] Checking authentication...')
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      console.log('[v0] Auth check response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('[v0] Auth check successful, user:', data.user)
        setAuthState({
          user: data.user,
          loading: false,
          isAuthenticated: true,
        })
      } else {
        console.log('[v0] Auth check failed - not authenticated')
        localStorage.removeItem('sessionToken')
        setAuthState({
          user: null,
          loading: false,
          isAuthenticated: false,
        })
      }
    } catch (error) {
      console.error('[v0] Auth check failed:', error)
      localStorage.removeItem('sessionToken')
      setAuthState({
        user: null,
        loading: false,
        isAuthenticated: false,
      })
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log('[v0] Attempting login...')
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      const data = await response.json()
      console.log('[v0] Login response:', response.status, data)

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      console.log('[v0] Login successful, storing token and updating auth state')
      localStorage.setItem('sessionToken', data.sessionToken)
      
      setAuthState({
        user: data.user,
        loading: false,
        isAuthenticated: true,
      })

      console.log('[v0] Auth state updated, redirecting to /')
      router.push('/')
      return { success: true }
    } catch (error: any) {
      console.error('[v0] Login error:', error)
      return { success: false, error: error.message }
    }
  }

  const register = async (email: string, password: string, fullName: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      localStorage.setItem('sessionToken', data.sessionToken)
      
      setAuthState({
        user: data.user,
        loading: false,
        isAuthenticated: true,
      })

      router.push('/')
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      localStorage.removeItem('sessionToken')
      await fetch('/api/auth/logout', { 
        method: 'POST',
      })
      setAuthState({
        user: null,
        loading: false,
        isAuthenticated: false,
      })
      router.push('/login')
    } catch (error) {
      console.error('[v0] Logout failed:', error)
    }
  }

  return {
    ...authState,
    login,
    register,
    logout,
  }
}
