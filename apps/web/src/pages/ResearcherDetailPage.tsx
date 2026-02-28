import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { researcherApi, type ResearcherDetail, type TopicPoolEntry } from '@rcm/shared'
import { useCallStore } from '../stores/callStore'
import { useAuthStore } from '../stores/authStore'
import { formatRating } from '@rcm/shared'
import { Star, Phone, ArrowLeft, ExternalLink } from 'lucide-react'

export default function ResearcherDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [researcher, setResearcher] = useState<ResearcherDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const initiateCall = useCallStore(s => s.initiateCall)
  const callStatus = useCallStore(s => s.status)
  const consultationId = useCallStore(s => s.consultationId)
  const ticketBalance = useAuthStore(s => s.ticketBalance)

  useEffect(() => {
    if (!id) return
    const fetch = async () => {
      try {
        const { researcher: r } = await researcherApi.getDetail(id)
        setResearcher(r)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  useEffect(() => {
    if (callStatus === 'dispatching' && consultationId) {
      navigate(`/calling/${consultationId}`)
    }
  }, [callStatus, consultationId, navigate])

  const handleTopicSelect = (topic: TopicPoolEntry) => {
    setSelectedTopic(topic.topic)
  }

  const handleCall = async () => {
    if (!researcher || !selectedTopic) return
    if (ticketBalance <= 0) {
      alert('No tickets available')
      return
    }
    await initiateCall({
      topicText: selectedTopic,
      dispatchType: 'directed',
      researcherId: researcher.id,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-genesis-black flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!researcher) {
    return (
      <div className="min-h-screen bg-genesis-black flex flex-col items-center justify-center">
        <p className="text-gray-400 mb-4">Researcher not found</p>
        <button onClick={() => navigate('/')} className="text-genesis-gold text-sm">
          Back to Lobby
        </button>
      </div>
    )
  }

  const isOnline = researcher.status === 'ONLINE'

  return (
    <div className="min-h-screen bg-genesis-black">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-genesis-slate">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-genesis-slate transition-colors">
          <ArrowLeft size={20} className="text-gray-400" />
        </button>
        <h1 className="text-lg font-bold text-white">Researcher Profile</h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Profile Card */}
        <div className="bg-genesis-charcoal rounded-2xl border border-genesis-slate p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-genesis-slate flex items-center justify-center text-2xl font-bold text-genesis-gold">
                {researcher.avatarUrl ? (
                  <img src={researcher.avatarUrl} alt={researcher.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  researcher.name[0]
                )}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-genesis-charcoal ${
                isOnline ? 'bg-green-400' : researcher.status === 'BUSY' ? 'bg-yellow-400' : 'bg-gray-500'
              }`} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{researcher.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Star size={14} className="text-genesis-gold fill-genesis-gold" />
                <span className="text-sm text-genesis-gold-light">{formatRating(researcher.ratingScore)}</span>
                <span className="text-sm text-gray-500">{researcher.serviceCount} calls</span>
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                  isOnline ? 'bg-green-400/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {researcher.status}
                </span>
              </div>
              {researcher.bio && (
                <p className="text-sm text-gray-400 mt-2">{researcher.bio}</p>
              )}
            </div>
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-2 mt-4">
            {researcher.specialties.map((s) => (
              <span key={s} className="text-xs px-3 py-1 rounded-full bg-genesis-slate text-gray-300">
                {s}
              </span>
            ))}
          </div>

          {/* Badges */}
          {researcher.badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {researcher.badges.map((b) => (
                <span key={b} className="text-xs px-2 py-0.5 rounded-full bg-genesis-gold/10 text-genesis-gold border border-genesis-gold/20">
                  {b.replace('_', ' ')}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Topic Selection */}
        <div className="mb-6">
          <h3 className="text-md font-bold text-white mb-3">Select a Topic</h3>
          {researcher.topics && researcher.topics.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {researcher.topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicSelect(topic)}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    selectedTopic === topic.topic
                      ? 'bg-genesis-gold/10 border-genesis-gold/40 text-genesis-gold'
                      : 'bg-genesis-charcoal border-genesis-slate text-gray-300 hover:border-genesis-gold/20'
                  }`}
                >
                  <span className="text-sm">{topic.topic}</span>
                  <span className="ml-2 text-xs text-gray-500">{topic.category}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No predefined topics</p>
          )}
        </div>

        {/* Call Button */}
        <button
          onClick={handleCall}
          disabled={!isOnline || !selectedTopic}
          className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl text-md font-bold transition-all ${
            isOnline && selectedTopic
              ? 'bg-genesis-gold text-black hover:bg-genesis-gold-light active:scale-[0.98]'
              : 'bg-genesis-slate text-gray-500 cursor-not-allowed'
          }`}
        >
          <Phone size={20} />
          {isOnline ? (selectedTopic ? 'Start 1-on-1 Call' : 'Select a topic first') : 'Researcher is offline'}
        </button>
      </div>
    </div>
  )
}
