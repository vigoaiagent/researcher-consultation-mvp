import { useEffect, useState } from 'react'
import { getSocket } from '../services/socket'
import { SOCKET_EVENTS } from '@rcm/shared'

export default function FomoMarquee() {
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    const socket = getSocket()
    const handler = (data: { message: string }) => {
      setMessages(prev => [...prev.slice(-4), data.message])
    }
    socket.on(SOCKET_EVENTS.VOICE_GLOBAL_ANNOUNCEMENT, handler)
    return () => {
      socket.off(SOCKET_EVENTS.VOICE_GLOBAL_ANNOUNCEMENT, handler)
    }
  }, [])

  if (messages.length === 0) return null

  const latestMessage = messages[messages.length - 1]

  return (
    <div className="bg-genesis-charcoal/80 border-b border-genesis-gold/20 overflow-hidden">
      <div className="py-2 flex items-center">
        <span className="text-genesis-gold text-xs font-bold px-3 shrink-0">LIVE</span>
        <div className="overflow-hidden flex-1">
          <p className="text-xs text-genesis-gold-light whitespace-nowrap animate-marquee">
            {latestMessage}
          </p>
        </div>
      </div>
    </div>
  )
}
