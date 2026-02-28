import { create } from 'zustand'
import type { CallStatus, DispatchPhase } from '@rcm/shared'
import { voiceApi, SOCKET_EVENTS } from '@rcm/shared'
import { getSocket } from '../services/socket'
import { voiceCallService } from '../services/voiceCall'

interface CallState {
  status: CallStatus
  consultationId: string | null
  roomId: string | null
  researcherId: string | null
  researcherName: string | null
  topicText: string | null
  dispatchPhase: DispatchPhase | null
  remainingSeconds: number
  isMuted: boolean
  isLast30s: boolean
  ratingScore: number | null
  showRating: boolean
  error: string | null

  initiateCall: (data: {
    topicText: string
    dispatchType: 'broadcast' | 'directed'
    researcherId?: string
    topicId?: string
  }) => Promise<void>
  cancelCall: () => Promise<void>
  endCall: () => Promise<void>
  toggleMute: () => void
  submitRating: (score: number) => Promise<void>
  reset: () => void
}

export const useCallStore = create<CallState>()((set, get) => ({
  status: 'idle',
  consultationId: null,
  roomId: null,
  researcherId: null,
  researcherName: null,
  topicText: null,
  dispatchPhase: null,
  remainingSeconds: 300,
  isMuted: false,
  isLast30s: false,
  ratingScore: null,
  showRating: false,
  error: null,

  initiateCall: async (data) => {
    set({ status: 'requesting', topicText: data.topicText, error: null })
    try {
      const { consultationId } = await voiceApi.initiate(data)
      set({ consultationId, status: 'dispatching' })

      const socket = getSocket()

      // Emit socket event to start dispatch
      socket.emit(SOCKET_EVENTS.VOICE_INITIATE, {
        consultationId,
        topicText: data.topicText,
        dispatchType: data.dispatchType,
        researcherId: data.researcherId,
        topicId: data.topicId,
      })

      // Listen for dispatch events
      socket.on(SOCKET_EVENTS.VOICE_DISPATCHING, (d: any) => {
        if (d.consultationId === consultationId) {
          set({ dispatchPhase: d.phase })
        }
      })

      socket.on(SOCKET_EVENTS.VOICE_RESEARCHER_ACCEPTED, async (d: any) => {
        if (d.consultationId === consultationId) {
          set({
            status: 'connecting',
            roomId: d.roomId,
            researcherId: d.researcherId,
            researcherName: d.researcherName || 'Researcher',
          })

          // Join Agora channel
          voiceCallService.setCallbacks({
            onStatusChange: (s) => {
              if (s === 'connected') set({ status: 'connected' })
              if (s === 'failed') set({ status: 'failed', error: 'Connection failed' })
            },
          })
          await voiceCallService.join(d.roomId)
        }
      })

      socket.on(SOCKET_EVENTS.VOICE_COUNTDOWN, (d: any) => {
        if (d.consultationId === consultationId) {
          set({ remainingSeconds: d.remainingSeconds })
        }
      })

      socket.on(SOCKET_EVENTS.VOICE_LAST_30S_WARNING, (d: any) => {
        if (d.consultationId === consultationId) {
          set({ isLast30s: true })
        }
      })

      socket.on(SOCKET_EVENTS.VOICE_CALL_ENDED, (d: any) => {
        if (d.consultationId === consultationId) {
          voiceCallService.endCall()
          set({ status: 'ended' })
        }
      })

      socket.on(SOCKET_EVENTS.VOICE_INVALID_CALL, (d: any) => {
        if (d.consultationId === consultationId) {
          voiceCallService.endCall()
          set({ status: 'ended', error: 'Call too short, ticket refunded' })
        }
      })

      socket.on(SOCKET_EVENTS.VOICE_PROMPT_RATING, (d: any) => {
        if (d.consultationId === consultationId) {
          set({ showRating: true })
        }
      })

      socket.on(SOCKET_EVENTS.VOICE_TIMEOUT_REFUND, (d: any) => {
        if (d.consultationId === consultationId) {
          set({ status: 'failed', error: 'No researcher available, ticket refunded' })
        }
      })

    } catch (error: any) {
      set({ status: 'failed', error: error.message })
    }
  },

  cancelCall: async () => {
    const { consultationId } = get()
    if (!consultationId) return
    try {
      await voiceApi.cancel(consultationId)
      const socket = getSocket()
      socket.emit(SOCKET_EVENTS.VOICE_CANCEL, { consultationId })
      get().reset()
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  endCall: async () => {
    const { consultationId } = get()
    if (!consultationId) return
    await voiceCallService.endCall()
    const socket = getSocket()
    socket.emit(SOCKET_EVENTS.VOICE_END_CALL, { consultationId })
    set({ status: 'ended' })
  },

  toggleMute: () => {
    const muted = voiceCallService.toggleMute()
    set({ isMuted: muted })
  },

  submitRating: async (score: number) => {
    const { consultationId } = get()
    if (!consultationId) return
    try {
      await voiceApi.rate(consultationId, score)
      set({ ratingScore: score, showRating: false })
    } catch {
      // ignore
    }
  },

  reset: () => {
    const { consultationId } = get()
    if (consultationId) {
      const socket = getSocket()
      // Clean up all listeners
      socket.off(SOCKET_EVENTS.VOICE_DISPATCHING)
      socket.off(SOCKET_EVENTS.VOICE_RESEARCHER_ACCEPTED)
      socket.off(SOCKET_EVENTS.VOICE_COUNTDOWN)
      socket.off(SOCKET_EVENTS.VOICE_LAST_30S_WARNING)
      socket.off(SOCKET_EVENTS.VOICE_CALL_ENDED)
      socket.off(SOCKET_EVENTS.VOICE_INVALID_CALL)
      socket.off(SOCKET_EVENTS.VOICE_PROMPT_RATING)
      socket.off(SOCKET_EVENTS.VOICE_TIMEOUT_REFUND)
    }
    set({
      status: 'idle',
      consultationId: null,
      roomId: null,
      researcherId: null,
      researcherName: null,
      topicText: null,
      dispatchPhase: null,
      remainingSeconds: 300,
      isMuted: false,
      isLast30s: false,
      ratingScore: null,
      showRating: false,
      error: null,
    })
  },
}))
