import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { isMetaMaskAvailable } from '../services/wallet'
import { BRAND } from '@rcm/shared'
import { Wallet } from 'lucide-react'

export default function LoginPage() {
  const { user, isLoading, error, loginWithMetaMask, loginWithWalletConnect, loginDemo } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Brand */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-genesis-gold to-genesis-gold-dark flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl font-bold text-black">G</span>
        </div>
        <h1 className="text-2xl font-bold text-white">{BRAND.NAME}</h1>
        <p className="text-genesis-gold mt-1 text-sm font-medium">{BRAND.TAGLINE}</p>
        <p className="text-gray-500 mt-3 text-sm max-w-xs mx-auto">
          Connect with expert researchers through 1-on-1 voice consultations
        </p>
      </div>

      {/* Login Options */}
      <div className="w-full max-w-sm space-y-3">
        {isMetaMaskAvailable() && (
          <button
            onClick={loginWithMetaMask}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-genesis-gold text-black font-semibold hover:bg-genesis-gold-light transition-colors disabled:opacity-50"
          >
            <Wallet size={20} />
            {isLoading ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        )}

        <button
          onClick={loginWithWalletConnect}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-genesis-gold text-genesis-gold font-semibold hover:bg-genesis-gold/10 transition-colors disabled:opacity-50"
        >
          <Wallet size={20} />
          {isLoading ? 'Connecting...' : 'WalletConnect'}
        </button>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-genesis-slate" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-genesis-black text-xs text-gray-500">or try demo</span>
          </div>
        </div>

        <button
          onClick={() => loginDemo('0xDemo' + Math.random().toString(36).slice(2, 10))}
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-genesis-charcoal border border-genesis-slate text-gray-300 text-sm hover:bg-genesis-slate transition-colors disabled:opacity-50"
        >
          Demo Login
        </button>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}
