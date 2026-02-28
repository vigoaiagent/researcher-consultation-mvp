import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { voiceCallService, type CallStatus } from '../services/voiceCall'
import CountdownTimer from '../components/CountdownTimer'
import { Mic, MicOff, PhoneOff } from 'lucide-react'
import { CALL_DURATION } from '@rcm/shared'
import { getSocket } from '../services/socket'

export default function ResearcherVoicePage() {
  const { roomId } = useParams<{ roomId: string }>()
  const [searchParams] = useSearchParams()
  const consultationId = searchParams.get('consultationId') || ''
  const researcherId = searchParams.get('researcherId') || ''

  const [callStatus, setCallStatus] = useState<CallStatus>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(CALL_DURATION)
  const [isLast30s, setIsLast30s] = useState(false)
  const [topicText, setTopicText] = useState('')
  const [userBadge, setUserBadge] = useState<string | null>(null)
  const [callEnded, setCallEnded] = useState(false)
  const beepPlayedRef = useRef(false)

  // Fetch consultation info
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || ''
    const fetchInfo = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v2/voice/session-info/${consultationId}`)
        if (res.ok) {
          const data = await res.json()
          setTopicText(data.topicText || '')
          setUserBadge(data.userBadge || null)
        }
      } catch {
        // ignore
      }
    }
    if (consultationId) fetchInfo()
  }, [consultationId])

  // Join Agora room
  useEffect(() => {
    if (!roomId) return

    voiceCallService.setCallbacks({
      onStatusChange: (status) => {
        setCallStatus(status)
      },
    })

    voiceCallService.join(roomId)

    return () => {
      voiceCallService.endCall()
    }
  }, [roomId])

  // Listen for server countdown events via socket
  useEffect(() => {
    if (!consultationId) return

    const socket = getSocket()

    socket.emit('researcher:join', { consultationId, researcherId })

    const handleCountdown = (d: any) => {
      if (d.consultationId === consultationId) {
        setRemainingSeconds(d.remainingSeconds)
      }
    }

    const handleLast30s = (d: any) => {
      if (d.consultationId === consultationId) {
        setIsLast30s(true)
      }
    }

    const handleCallEnded = (d: any) => {
      if (d.consultationId === consultationId) {
        setCallEnded(true)
        voiceCallService.endCall()
      }
    }

    socket.on('voice:countdown', handleCountdown)
    socket.on('voice:last-30s-warning', handleLast30s)
    socket.on('voice:call-ended', handleCallEnded)

    return () => {
      socket.off('voice:countdown', handleCountdown)
      socket.off('voice:last-30s-warning', handleLast30s)
      socket.off('voice:call-ended', handleCallEnded)
    }
  }, [consultationId, researcherId])

  // Beep at last 30s
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

  const handleToggleMute = () => {
    const muted = voiceCallService.toggleMute()
    setIsMuted(muted)
  }

  const handleEndCall = async () => {
    setCallEnded(true)
    await voiceCallService.endCall()
    // Notify server via socket
    const socket = getSocket()
    socket.emit('voice:end-call', { consultationId })
  }

  if (callEnded) {
    return (
      <div className="min-h-screen bg-genesis-black flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 rounded-full bg-genesis-charcoal flex items-center justify-center mb-6">
          <PhoneOff size={28} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Call Ended</h2>
        <p className="text-sm text-gray-400">You can close this page now.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-genesis-black flex flex-col">
      {/* Topic Bar */}
      <div className="px-6 py-4 border-b border-genesis-slate">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400 truncate flex-1">{topicText || 'Voice Consultation'}</p>
          {userBadge && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-genesis-gold/10 text-genesis-gold border border-genesis-gold/20 ml-2">
              {userBadge}
            </span>
          )}
        </div>
        <p className="text-xs text-genesis-gold mt-1">Researcher View</p>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <CountdownTimer remainingSeconds={remainingSeconds} isLast30s={isLast30s} />

        {callStatus === 'connected' && (
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-green-400">Connected</span>
            </div>
          </div>
        )}

        {callStatus === 'connecting' && (
          <p className="mt-4 text-sm text-gray-400 animate-pulse">
            Connecting to voice room...
          </p>
        )}

        {callStatus === 'idle' && (
          <p className="mt-4 text-sm text-gray-400 animate-pulse">
            Joining voice room...
          </p>
        )}
      </div>

      {/* Controls */}
      {(callStatus === 'connected' || callStatus === 'connecting') && (
        <div className="flex items-center justify-center gap-6 pb-12">
          <button
            onClick={handleToggleMute}
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
    </div>
  )
}
