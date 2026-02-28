/**
 * React Native Agora voice service placeholder.
 *
 * In production, this uses react-native-agora:
 *
 * import createAgoraRtcEngine, { ChannelProfileType, ClientRoleType } from 'react-native-agora'
 *
 * const engine = createAgoraRtcEngine()
 * engine.initialize({ appId: AGORA_APP_ID })
 * engine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication)
 * engine.joinChannel(token, channelName, 0, { clientRoleType: ClientRoleType.ClientRoleBroadcaster })
 * engine.enableAudio()
 *
 * For the MVP, Agora native integration requires:
 * 1. expo prebuild (no Expo Go)
 * 2. Native iOS/Android microphone permissions configured in app.json
 * 3. Agora app ID from env
 */

const AGORA_APP_ID = process.env.EXPO_PUBLIC_AGORA_APP_ID || ''

export async function joinChannel(channelName: string, token: string): Promise<void> {
  console.log(`[Agora] Would join channel: ${channelName} with app ID: ${AGORA_APP_ID}`)
  // react-native-agora integration in production build
}

export async function leaveChannel(): Promise<void> {
  console.log('[Agora] Would leave channel')
}

export function muteLocalAudio(mute: boolean): void {
  console.log(`[Agora] Would ${mute ? 'mute' : 'unmute'} local audio`)
}
