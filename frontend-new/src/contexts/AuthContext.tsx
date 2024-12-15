import { createContext, useState, useContext, ReactNode } from 'react'
import axios from 'axios'

interface User {
  username: string
  email?: string
  role?: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const BASE_URL = 'http://localhost:8000/api'

// Create a custom axios instance for auth
const authAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    return token && savedUser ? JSON.parse(savedUser) : null
  })

  const login = async (username: string, password: string) => {
    try {
      const response = await authAxios.post('/token/', { 
        username, 
        password 
      });
      
      const { access, refresh } = response.data;
      localStorage.setItem('token', access);
      localStorage.setItem('refresh', refresh);
      
      // Save user info
      const userInfo = { 
        username,
        role: response.data.role || 'operator', // Default to operator if no role provided
        email: response.data.email
      };
      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));
      
      // Set the token for future requests
      authAxios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.detail || error.response?.data?.error || 'Login failed';
        console.error('Error details:', error.response?.data);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('refresh')
    localStorage.removeItem('user')
    delete authAxios.defaults.headers.common['Authorization']
  }

  const register = async (userData: any) => {
    try {
      const response = await authAxios.post('/register/', userData)
      await login(userData.username, userData.password)
      return response.data
    } catch (error) {
      console.error('Registration failed:', error)
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Registration failed')
      }
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
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
