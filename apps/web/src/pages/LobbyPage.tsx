import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusBar from '../components/StatusBar'
import TopicBubble from '../components/TopicBubble'
import ResearcherCard from '../components/ResearcherCard'
import FomoMarquee from '../components/FomoMarquee'
import { useLobbyStore } from '../stores/lobbyStore'
import { useCallStore } from '../stores/callStore'
import { useAuthStore } from '../stores/authStore'
import type { TopicPoolEntry, ResearcherCard as ResearcherCardType } from '@rcm/shared'
import { RefreshCw } from 'lucide-react'

export default function LobbyPage() {
  const { topics, researchers, isLoadingTopics, isLoadingResearchers, refreshAll, fetchTopics } = useLobbyStore()
  const initiateCall = useCallStore(s => s.initiateCall)
  const callStatus = useCallStore(s => s.status)
  const consultationId = useCallStore(s => s.consultationId)
  const user = useAuthStore(s => s.user)
  const ticketBalance = useAuthStore(s => s.ticketBalance)
  const refreshTicketBalance = useAuthStore(s => s.refreshTicketBalance)
  const navigate = useNavigate()

  useEffect(() => {
    refreshAll()
    refreshTicketBalance()
  }, [refreshAll, refreshTicketBalance])

  useEffect(() => {
    if (callStatus === 'dispatching' && consultationId) {
      navigate(`/calling/${consultationId}`)
    }
  }, [callStatus, consultationId, navigate])

  // PRD: Non-whitelist user guard
  if (user && !user.isWhitelist) {
    return (
      <div className="min-h-screen bg-genesis-black flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 rounded-full bg-genesis-gold/10 flex items-center justify-center mb-6">
          <span className="text-3xl">🔒</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Internal Test Only</h2>
        <p className="text-sm text-gray-400 text-center max-w-sm mb-6">
          Genesis Consultation Black Card is currently in closed beta.
          Only whitelisted wallet addresses can access the platform.
        </p>
        <p className="text-xs text-gray-500">
          Your wallet: {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
        </p>
      </div>
    )
  }

  const handleTopicClick = async (topic: TopicPoolEntry) => {
    if (ticketBalance <= 0) {
      alert('No tickets available')
      return
    }
    await initiateCall({
      topicText: topic.topic,
      dispatchType: 'broadcast',
      topicId: topic.id,
    })
  }

  const handleRefreshTopics = () => {
    fetchTopics()
  }

  const handleResearcherClick = (researcher: ResearcherCardType) => {
    navigate(`/researcher/${researcher.id}`)
  }

  return (
    <div className="min-h-screen bg-genesis-black">
      <StatusBar />
      <FomoMarquee />

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Topic Pool Section — PRD: click-only, no manual input */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Hot Topics</h2>
              <p className="text-sm text-gray-500 mt-0.5">Tap a topic to start a consultation</p>
            </div>
            <button
              onClick={handleRefreshTopics}
              disabled={isLoadingTopics}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-genesis-slate transition-colors text-gray-400 text-sm"
            >
              <RefreshCw size={14} className={isLoadingTopics ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {topics.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {topics.map((topic) => (
                <TopicBubble
                  key={topic.id}
                  topic={topic}
                  onClick={handleTopicClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {isLoadingTopics ? 'Loading topics...' : 'No topics available'}
            </div>
          )}
        </div>

        {/* Researcher Wall Section */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white">Chief Analysts</h2>
            <p className="text-sm text-gray-500 mt-0.5">Tap a researcher to view profile & call directly</p>
          </div>

          {researchers.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-thin">
              {researchers.map((researcher) => (
                <ResearcherCard
                  key={researcher.id}
                  researcher={researcher}
                  onCall={handleResearcherClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {isLoadingResearchers ? 'Loading researchers...' : 'No researchers available'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
