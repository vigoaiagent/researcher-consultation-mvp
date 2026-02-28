import AgoraRTC, {
  IAgoraRTCClient,
  IMicrophoneAudioTrack,
  IRemoteAudioTrack,
} from 'agora-rtc-sdk-ng'

export type CallStatus = 'idle' | 'connecting' | 'connected' | 'ended' | 'failed'

interface CallCallbacks {
  onStatusChange?: (status: CallStatus) => void
  onRemoteStream?: () => void
  onError?: (error: Error) => void
}

const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID || ''

class VoiceCallService {
  private client: IAgoraRTCClient | null = null
  private localAudioTrack: IMicrophoneAudioTrack | null = null
  private remoteAudioTrack: IRemoteAudioTrack | null = null
  private callbacks: CallCallbacks = {}
  private isMuted = false

  setCallbacks(callbacks: CallCallbacks) {
    this.callbacks = callbacks
  }

  async join(channelName: string): Promise<void> {
    try {
      this.callbacks.onStatusChange?.('connecting')

      this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })

      // Fetch token from server
      const API_URL = import.meta.env.VITE_API_URL || ''
      const token = localStorage.getItem('auth_token')
      const res = await fetch(`${API_URL}/api/call/agora-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ channelName, uid: 0 }),
      })
      const { token: agoraToken } = await res.json()

      // Subscribe to remote user audio
      this.client.on('user-published', async (user, mediaType) => {
        if (mediaType === 'audio') {
          await this.client!.subscribe(user, mediaType)
          this.remoteAudioTrack = user.audioTrack as IRemoteAudioTrack
          this.remoteAudioTrack.play()
          this.callbacks.onRemoteStream?.()
          this.callbacks.onStatusChange?.('connected')
        }
      })

      this.client.on('user-unpublished', () => {
        this.remoteAudioTrack = null
      })

      await this.client.join(AGORA_APP_ID, channelName, agoraToken || null, null)

      // Create and publish local audio track with AEC/ANS/AGC
      this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        AEC: true,
        ANS: true,
        AGC: true,
      })
      await this.client.publish([this.localAudioTrack])

      this.callbacks.onStatusChange?.('connected')
    } catch (error) {
      console.error('Failed to join voice call:', error)
      this.callbacks.onStatusChange?.('failed')
      this.callbacks.onError?.(error as Error)
    }
  }

  toggleMute(): boolean {
    if (this.localAudioTrack) {
      this.isMuted = !this.isMuted
      this.localAudioTrack.setEnabled(!this.isMuted)
    }
    return this.isMuted
  }

  async endCall(): Promise<{ duration: number }> {
    try {
      if (this.localAudioTrack) {
        this.localAudioTrack.stop()
        this.localAudioTrack.close()
        this.localAudioTrack = null
      }
      if (this.client) {
        await this.client.leave()
        this.client = null
      }
      this.remoteAudioTrack = null
      this.isMuted = false
    } catch (error) {
      console.error('Error ending call:', error)
    }
    this.callbacks.onStatusChange?.('ended')
    return { duration: 0 }
  }
}

export const voiceCallService = new VoiceCallService()
