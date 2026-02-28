import { create } from 'zustand'
import type { User } from '@rcm/shared'
import { authApi, ticketApi } from '@rcm/shared'
import { connectSocket, disconnectSocket, joinUserRoom } from '../services/socket'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  ticketBalance: number

  loginWithWalletConnect: () => Promise<void>
  loginDemo: (walletAddress: string) => Promise<void>
  logout: () => void
  restoreSession: () => Promise<void>
  refreshTicketBalance: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  ticketBalance: 0,

  loginWithWalletConnect: async () => {
    set({ isLoading: true, error: null })
    try {
      // WalletConnect v2 for React Native would go here
      // For MVP, using demo login as fallback
      const address = '0xWC' + Math.random().toString(36).slice(2, 10)
      const { token, user } = await authApi.demoLogin(address)
      set({ token, user, isLoading: false, ticketBalance: user.ticketBalance })
      connectSocket(token)
      joinUserRoom(user.id)
    } catch (error: any) {
      set({ isLoading: false, error: error.message })
    }
  },

  loginDemo: async (walletAddress: string) => {
    set({ isLoading: true, error: null })
    try {
      const { token, user } = await authApi.demoLogin(walletAddress)
      set({ token, user, isLoading: false, ticketBalance: user.ticketBalance })
      connectSocket(token)
      joinUserRoom(user.id)
    } catch (error: any) {
      set({ isLoading: false, error: error.message })
    }
  },

  logout: () => {
    disconnectSocket()
    set({ user: null, token: null, ticketBalance: 0, error: null })
  },

  restoreSession: async () => {
    const token = get().token
    if (!token) return
    try {
      const { user } = await authApi.getMe()
      connectSocket(token)
      joinUserRoom(user.id)
      set({ user, ticketBalance: user.ticketBalance ?? 0 })
    } catch {
      set({ token: null })
    }
  },

  refreshTicketBalance: async () => {
    try {
      const { balance } = await ticketApi.getBalance()
      set({ ticketBalance: balance })
    } catch {
      // ignore
    }
  },
}))
