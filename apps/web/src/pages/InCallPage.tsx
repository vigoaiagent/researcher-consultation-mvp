import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCallStore } from '../stores/callStore'
import { useAuthStore } from '../stores/authStore'
import CountdownTimer from '../components/CountdownTimer'
import RatingPopup from '../components/RatingPopup'
import SharePoster from '../components/SharePoster'
import { Mic, MicOff, PhoneOff } from 'lucide-react'
import { CALL_DURATION } from '@rcm/shared'

export default function InCallPage() {
  const navigate = useNavigate()
  const {
    status, topicText, remainingSeconds, isMuted, isLast30s,
    showRating, researcherName, consultationId, ratingScore,
    endCall, toggleMute, submitRating, reset,
  } = useCallStore()
  const user = useAuthStore(s => s.user)

  const [showPoster, setShowPoster] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [localRating, setLocalRating] = useState<number | null>(null)
  const beepPlayedRef = useRef(false)

  // PRD: Beep sound at last 30 seconds
  useEffect(() => {
    if (isLast30s && !beepPlayedRef.current) {
      beepPlayedRef.current = true
      try {
        const ctx = new AudioContext()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = 880
        gain.gain.value = 0.3
        osc.start()
        setTimeout(() => {
          osc.stop()
          ctx.close()
        }, 200)
      } catch {
        // Audio not available
      }
    }
  }, [isLast30s])

  useEffect(() => {
    if (status === 'idle' && !showPoster) {
      navigate('/', { replace: true })
    }
  }, [status, navigate, showPoster])

  const handleEndCall = async () => {
    setCallDuration(CALL_DURATION - remainingSeconds)
    await endCall()
  }

  const handleRatingSubmit = async (score: number, _tags?: string[]) => {
    setLocalRating(score)
    setCallDuration(CALL_DURATION - remainingSeconds)
    await submitRating(score)
    setShowPoster(true)
  }

  const handleRatingSkip = () => {
    setCallDuration(CALL_DURATION - remainingSeconds)
    setShowPoster(true)
  }

  const handlePosterClose = () => {
    setShowPoster(false)
    reset()
    navigate('/', { replace: true })
  }

  if (status === 'ended' && !showRating && !showPoster) {
    setCallDuration(CALL_DURATION - remainingSeconds)
    setShowPoster(true)
  }

  return (
    <div className="min-h-screen bg-genesis-black flex flex-col">
      {/* Topic Bar */}
      <div className="px-6 py-4 border-b border-genesis-slate">
        <p className="text-sm text-gray-400 text-center truncate">{topicText}</p>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <CountdownTimer remainingSeconds={remainingSeconds} isLast30s={isLast30s} />

        {/* PRD: "Connected with researcher XX" */}
        {status === 'connected' && (
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-green-400">
                Connected with {researcherName || 'Researcher'}
              </span>
            </div>
          </div>
        )}

        {status === 'connecting' && (
          <p className="mt-4 text-sm text-gray-400 animate-pulse">
            Connecting to {researcherName || 'Researcher'}...
          </p>
        )}

        {status === 'ended' && !showPoster && (
          <p className="mt-4 text-sm text-gray-400">Call ended</p>
        )}
      </div>

      {/* Controls */}
      {(status === 'connected' || status === 'connecting') && (
        <div className="flex items-center justify-center gap-6 pb-12">
          <button
            onClick={toggleMute}
            className={`
              w-14 h-14 rounded-full flex items-center justify-center transition-all
              ${isMuted
                ? 'bg-red-500/20 border border-red-500/40'
                : 'bg-genesis-charcoal border border-genesis-slate hover:bg-genesis-slate'}
            `}
          >
            {isMuted ? (
              <MicOff size={22} className="text-red-400" />
            ) : (
              <Mic size={22} className="text-white" />
            )}
          </button>

          <button
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors active:scale-95"
          >
            <PhoneOff size={24} className="text-white" />
          </button>
        </div>
      )}

      {/* Rating Popup */}
      {showRating && !showPoster && (
        <RatingPopup
          onSubmit={handleRatingSubmit}
          onSkip={handleRatingSkip}
          researcherName={researcherName || undefined}
          duration={CALL_DURATION - remainingSeconds}
        />
      )}

      {/* Share Poster */}
      {showPoster && (
        <SharePoster
          consultationNumber={consultationId?.slice(-6).toUpperCase() || '000000'}
          userBadge={user?.userBadge || null}
          topicText={topicText || 'Consultation'}
          researcherName={researcherName || 'Researcher'}
          duration={callDuration}
          ratingScore={localRating ?? ratingScore}
          onClose={handlePosterClose}
        />
      )}
    </div>
  )
}
