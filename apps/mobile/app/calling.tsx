import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'
import { useCallStore } from '../stores/callStore'

export default function CallingScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { status, dispatchPhase, topicText, error, cancelCall, reset } = useCallStore()

  useEffect(() => {
    if (status === 'connecting' || status === 'connected') {
      router.replace(`/in-call?id=${id}`)
    }
    if (status === 'idle') {
      router.replace('/lobby')
    }
  }, [status])

  const handleCancel = async () => {
    await cancelCall()
    router.replace('/lobby')
  }

  const handleBack = () => {
    reset()
    router.replace('/lobby')
  }

  const phaseLabel = dispatchPhase === 'author_priority'
    ? 'Connecting to expert...'
    : dispatchPhase === 'broadcast'
    ? 'Finding available researcher...'
    : 'Connecting to researcher...'

  if (status === 'failed') {
    return (
      <View style={styles.container}>
        <View style={styles.errorIcon}>
          <Text style={styles.errorIconText}>✕</Text>
        </View>
        <Text style={styles.errorTitle}>Connection Failed</Text>
        <Text style={styles.errorMessage}>{error || 'Unable to connect'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Back to Lobby</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Ripple Animation */}
      <View style={styles.rippleContainer}>
        <View style={[styles.ripple, styles.ripple1]} />
        <View style={[styles.ripple, styles.ripple2]} />
        <View style={[styles.ripple, styles.ripple3]} />
        <View style={styles.centerIcon}>
          <Text style={styles.phoneIcon}>📞</Text>
        </View>
      </View>

      <Text style={styles.phaseLabel}>{phaseLabel}</Text>

      {topicText && (
        <View style={styles.topicBox}>
          <Text style={styles.topicBoxText}>{topicText}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#0A0A0A',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24,
  },
  rippleContainer: {
    width: 120, height: 120, justifyContent: 'center', alignItems: 'center',
  },
  ripple: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    borderWidth: 2, borderColor: '#C9A84C40',
  },
  ripple1: { transform: [{ scale: 1 }], opacity: 0.6 },
  ripple2: { transform: [{ scale: 1.4 }], opacity: 0.3 },
  ripple3: { transform: [{ scale: 1.8 }], opacity: 0.1 },
  centerIcon: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#C9A84C30',
    justifyContent: 'center', alignItems: 'center',
  },
  phoneIcon: { fontSize: 24 },
  phaseLabel: { fontSize: 14, color: '#666', marginTop: 24 },
  topicBox: {
    marginTop: 20, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#2D2D2D', maxWidth: 300,
  },
  topicBoxText: { fontSize: 13, color: '#ccc', textAlign: 'center' },
  cancelButton: {
    marginTop: 40, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#ef444430', borderWidth: 1, borderColor: '#ef444460',
  },
  cancelButtonText: { fontSize: 14, fontWeight: '500', color: '#ef4444' },
  errorIcon: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#ef444430',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  errorIconText: { fontSize: 24, color: '#ef4444' },
  errorTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  errorMessage: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 },
  backButton: {
    paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#2D2D2D',
  },
  backButtonText: { fontSize: 14, color: '#fff' },
})
