import { create } from 'zustand'
import type { CallStatus, DispatchPhase } from '@rcm/shared'
import { voiceApi, SOCKET_EVENTS } from '@rcm/shared'
import { getSocket } from '../services/socket'

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
  showRating: false,
  error: null,

  initiateCall: async (data) => {
    set({ status: 'requesting', topicText: data.topicText, error: null })
    try {
      const { consultationId } = await voiceApi.initiate(data)
      set({ consultationId, status: 'dispatching' })

      const socket = getSocket()

      socket.emit(SOCKET_EVENTS.VOICE_INITIATE, {
        consultationId,
        topicText: data.topicText,
        dispatchType: data.dispatchType,
        researcherId: data.researcherId,
        topicId: data.topicId,
      })

      socket.on(SOCKET_EVENTS.VOICE_DISPATCHING, (d: any) => {
        if (d.consultationId === consultationId) {
          set({ dispatchPhase: d.phase })
        }
      })

      socket.on(SOCKET_EVENTS.VOICE_RESEARCHER_ACCEPTED, (d: any) => {
        if (d.consultationId === consultationId) {
          set({ status: 'connecting', roomId: d.roomId, researcherId: d.researcherId, researcherName: d.researcherName || 'Researcher' })
          // react-native-agora integration would go here
          set({ status: 'connected' })
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
          set({ status: 'ended' })
        }
      })

      socket.on(SOCKET_EVENTS.VOICE_INVALID_CALL, (d: any) => {
        if (d.consultationId === consultationId) {
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
      getSocket().emit(SOCKET_EVENTS.VOICE_CANCEL, { consultationId })
      get().reset()
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  endCall: async () => {
    const { consultationId } = get()
    if (!consultationId) return
    getSocket().emit(SOCKET_EVENTS.VOICE_END_CALL, { consultationId })
    set({ status: 'ended' })
  },

  toggleMute: () => {
    set(s => ({ isMuted: !s.isMuted }))
    // react-native-agora mute toggle would go here
  },

  submitRating: async (score: number) => {
    const { consultationId } = get()
    if (!consultationId) return
    try {
      await voiceApi.rate(consultationId, score)
      set({ showRating: false })
    } catch {
      // ignore
    }
  },

  reset: () => {
    const socket = getSocket()
    socket.off(SOCKET_EVENTS.VOICE_DISPATCHING)
    socket.off(SOCKET_EVENTS.VOICE_RESEARCHER_ACCEPTED)
    socket.off(SOCKET_EVENTS.VOICE_COUNTDOWN)
    socket.off(SOCKET_EVENTS.VOICE_LAST_30S_WARNING)
    socket.off(SOCKET_EVENTS.VOICE_CALL_ENDED)
    socket.off(SOCKET_EVENTS.VOICE_INVALID_CALL)
    socket.off(SOCKET_EVENTS.VOICE_PROMPT_RATING)
    socket.off(SOCKET_EVENTS.VOICE_TIMEOUT_REFUND)
    set({
      status: 'idle', consultationId: null, roomId: null, researcherId: null, researcherName: null,
      topicText: null, dispatchPhase: null, remainingSeconds: 300,
      isMuted: false, isLast30s: false, showRating: false, error: null,
    })
  },
}))
