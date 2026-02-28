import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { truncateAddress, BRAND, researcherApi } from '@rcm/shared'
import { LogOut, CreditCard, Users, Clock, History } from 'lucide-react'

export default function StatusBar() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const ticketBalance = useAuthStore(s => s.ticketBalance)
  const logout = useAuthStore(s => s.logout)
  const [onlineCount, setOnlineCount] = useState(0)

  useEffect(() => {
    const fetchOnlineCount = async () => {
      try {
        const { onlineCount } = await researcherApi.getOnlineCount()
        setOnlineCount(onlineCount)
      } catch {
        // ignore
      }
    }
    fetchOnlineCount()
    const interval = setInterval(fetchOnlineCount, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-genesis-slate">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-genesis-gold">{BRAND.FULL}</h1>
      </div>
      <div className="flex items-center gap-4">
        {/* Online Expert Count with Breathing Light */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-genesis-charcoal">
          <div className="relative flex items-center justify-center">
            <div className={`w-2 h-2 rounded-full ${onlineCount > 0 ? 'bg-green-400 animate-breathing' : 'bg-gray-500'}`} />
          </div>
          <Users size={14} className="text-gray-400" />
          <span className="text-sm text-gray-300">
            {onlineCount} <span className="text-gray-500 text-xs">online</span>
          </span>
        </div>

        {/* 5-min Call Duration Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-genesis-charcoal">
          <Clock size={14} className="text-genesis-gold" />
          <span className="text-sm text-genesis-gold-light">5 min</span>
        </div>

        {/* Ticket Balance */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-genesis-charcoal">
          <CreditCard size={16} className="text-genesis-gold" />
          <span className="text-sm font-medium text-genesis-gold-light">
            {ticketBalance}
          </span>
        </div>

        {/* History */}
        <button
          onClick={() => navigate('/history')}
          className="p-2 rounded-lg hover:bg-genesis-slate transition-colors"
          title="Consultation History"
        >
          <History size={18} className="text-gray-400" />
        </button>

        {user && (
          <span className="text-sm text-gray-400">
            {truncateAddress(user.walletAddress)}
          </span>
        )}
        <button
          onClick={logout}
          className="p-2 rounded-lg hover:bg-genesis-slate transition-colors"
        >
          <LogOut size={18} className="text-gray-400" />
        </button>
      </div>
    </div>
  )
}
