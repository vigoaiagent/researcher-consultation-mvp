import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { voiceApi, formatDuration, formatRating } from '@rcm/shared'
import type { VoiceConsultation } from '@rcm/shared'
import StatusBar from '../components/StatusBar'
import { ArrowLeft, Star, Clock, Phone } from 'lucide-react'

export default function HistoryPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const [consultations, setConsultations] = useState<VoiceConsultation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchHistory = async () => {
      try {
        const { consultations: data } = await voiceApi.getHistory(user.id)
        setConsultations(data)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-400 bg-green-400/10'
      case 'IN_CALL': return 'text-blue-400 bg-blue-400/10'
      case 'CANCELLED': return 'text-gray-400 bg-gray-400/10'
      case 'TIMEOUT': return 'text-yellow-400 bg-yellow-400/10'
      case 'INVALID': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  return (
    <div className="min-h-screen bg-genesis-black">
      <StatusBar />

      <div className="max-w-3xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-genesis-slate transition-colors">
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <h1 className="text-lg font-bold text-white">Consultation History</h1>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading...</div>
        ) : consultations.length === 0 ? (
          <div className="text-center py-16">
            <Phone size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">No consultations yet</p>
            <p className="text-gray-500 text-sm">Start a consultation from the lobby</p>
          </div>
        ) : (
          <div className="space-y-3">
            {consultations.map((c) => (
              <div
                key={c.id}
                className="bg-genesis-charcoal rounded-xl border border-genesis-slate p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm text-white font-medium flex-1 pr-4">{c.topicText}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${getStatusColor(c.status)}`}>
                    {c.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {c.callDuration > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{formatDuration(c.callDuration)}</span>
                    </div>
                  )}
                  <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  <span className="text-gray-600">{c.dispatchType}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
