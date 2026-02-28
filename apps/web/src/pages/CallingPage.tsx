import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCallStore } from '../stores/callStore'
import RippleAnimation from '../components/RippleAnimation'
import { X } from 'lucide-react'

export default function CallingPage() {
  const { consultationId } = useParams()
  const navigate = useNavigate()
  const { status, dispatchPhase, topicText, error, cancelCall, reset } = useCallStore()

  useEffect(() => {
    if (status === 'connecting' || status === 'connected') {
      navigate(`/in-call/${consultationId}`, { replace: true })
    }
    if (status === 'idle') {
      navigate('/', { replace: true })
    }
  }, [status, consultationId, navigate])

  const handleCancel = async () => {
    await cancelCall()
    navigate('/', { replace: true })
  }

  const handleBack = () => {
    reset()
    navigate('/', { replace: true })
  }

  const phaseLabel = dispatchPhase === 'author_priority'
    ? 'Connecting to expert...'
    : dispatchPhase === 'broadcast'
    ? 'Finding available researcher...'
    : 'Connecting to researcher...'

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-genesis-black flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
          <X size={32} className="text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Connection Failed</h2>
        <p className="text-sm text-gray-400 text-center max-w-xs mb-6">
          {error || 'Unable to connect'}
        </p>
        <button
          onClick={handleBack}
          className="px-8 py-3 rounded-xl bg-genesis-charcoal border border-genesis-slate text-white hover:bg-genesis-slate transition-colors"
        >
          Back to Lobby
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-genesis-black flex flex-col items-center justify-center px-4">
      <RippleAnimation label={phaseLabel} />

      {topicText && (
        <div className="mt-8 px-4 py-2 rounded-xl bg-genesis-charcoal border border-genesis-slate max-w-sm">
          <p className="text-sm text-gray-300 text-center">{topicText}</p>
        </div>
      )}

      <button
        onClick={handleCancel}
        className="mt-10 px-8 py-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors"
      >
        Cancel
      </button>
    </div>
  )
}
