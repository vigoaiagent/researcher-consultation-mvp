import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@rcm/shared'
import { authApi, ticketApi } from '@rcm/shared'
import { connectMetaMask, connectWalletConnect, signMessage, disconnect as walletDisconnect } from '../services/wallet'
import { connectSocket, disconnectSocket, joinUserRoom } from '../services/socket'

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  ticketBalance: number

  loginWithMetaMask: () => Promise<void>
  loginWithWalletConnect: () => Promise<void>
  loginDemo: (walletAddress: string) => Promise<void>
  logout: () => void
  restoreSession: () => Promise<void>
  refreshTicketBalance: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      ticketBalance: 0,

      loginWithMetaMask: async () => {
        set({ isLoading: true, error: null })
        try {
          const address = await connectMetaMask()
          const { message } = await authApi.getNonce(address)
          const signature = await signMessage(message)
          const { token, user } = await authApi.verify(address, signature, message)
          localStorage.setItem('auth_token', token)
          connectSocket()
          joinUserRoom(user.id)
          set({ user, isLoading: false, ticketBalance: user.ticketBalance })
        } catch (error: any) {
          set({ isLoading: false, error: error.message })
        }
      },

      loginWithWalletConnect: async () => {
        set({ isLoading: true, error: null })
        try {
          const address = await connectWalletConnect()
          const { message } = await authApi.getNonce(address)
          const signature = await signMessage(message)
          const { token, user } = await authApi.verify(address, signature, message)
          localStorage.setItem('auth_token', token)
          connectSocket()
          joinUserRoom(user.id)
          set({ user, isLoading: false, ticketBalance: user.ticketBalance })
        } catch (error: any) {
          set({ isLoading: false, error: error.message })
        }
      },

      loginDemo: async (walletAddress: string) => {
        set({ isLoading: true, error: null })
        try {
          const { token, user } = await authApi.demoLogin(walletAddress)
          localStorage.setItem('auth_token', token)
          connectSocket()
          joinUserRoom(user.id)
          set({ user, isLoading: false, ticketBalance: user.ticketBalance })
        } catch (error: any) {
          set({ isLoading: false, error: error.message })
        }
      },

      logout: () => {
        walletDisconnect()
        disconnectSocket()
        set({ user: null, ticketBalance: 0, error: null })
      },

      restoreSession: async () => {
        const token = localStorage.getItem('auth_token')
        if (!token) return
        try {
          const { user } = await authApi.getMe()
          connectSocket()
          joinUserRoom(user.id)
          set({ user, ticketBalance: user.ticketBalance ?? 0 })
        } catch {
          localStorage.removeItem('auth_token')
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
    }),
    {
      name: 'rcm-auth',
      partialize: (state) => ({ user: state.user, ticketBalance: state.ticketBalance }),
    },
  ),
)
