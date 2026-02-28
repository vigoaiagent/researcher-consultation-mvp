import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { useCallStore } from '../stores/callStore'
import { formatDuration, RATING_QUICK_TAGS, CALL_DURATION } from '@rcm/shared'

export default function InCallScreen() {
  const router = useRouter()
  const {
    status, topicText, remainingSeconds, isMuted, isLast30s,
    showRating, researcherName, endCall, toggleMute, submitRating, reset,
  } = useCallStore()
  const [ratingScore, setRatingScore] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useEffect(() => {
    if (status === 'idle') {
      router.replace('/lobby')
    }
  }, [status])

  const handleEndCall = async () => {
    await endCall()
  }

  const handleRatingSubmit = async () => {
    if (ratingScore > 0) {
      await submitRating(ratingScore)
    }
    reset()
    router.replace('/lobby')
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  return (
    <View style={styles.container}>
      {/* Topic Bar */}
      <View style={styles.topicBar}>
        <Text style={styles.topicBarText} numberOfLines={1}>{topicText}</Text>
      </View>

      {/* Countdown */}
      <View style={styles.mainArea}>
        <Text style={[styles.countdown, isLast30s && styles.countdownWarning]}>
          {formatDuration(remainingSeconds)}
        </Text>

        {/* PRD: Show "Connected with researcher XX" */}
        {status === 'connected' && (
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              Connected with {researcherName || 'Researcher'}
            </Text>
          </View>
        )}
        {status === 'connecting' && (
          <Text style={styles.connectingText}>
            Connecting to {researcherName || 'Researcher'}...
          </Text>
        )}
        {isLast30s && (
          <Text style={styles.warningText}>Call ending soon</Text>
        )}
      </View>

      {/* Controls */}
      {(status === 'connected' || status === 'connecting') && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.muteButton, isMuted && styles.muteButtonActive]}
            onPress={toggleMute}
          >
            <Text style={styles.muteIcon}>{isMuted ? '🔇' : '🎤'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.hangupButton} onPress={handleEndCall}>
            <Text style={styles.hangupIcon}>📞</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Rating Modal with Quick Tags */}
      <Modal visible={showRating} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rate This Call</Text>
            {researcherName && (
              <Text style={styles.modalResearcher}>with {researcherName}</Text>
            )}
            <Text style={styles.modalSubtitle}>How was your consultation experience?</Text>

            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((i) => (
                <TouchableOpacity key={i} onPress={() => setRatingScore(i)}>
                  <Text style={[styles.star, i <= ratingScore && styles.starActive]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Quick Tags */}
            {ratingScore > 0 && (
              <View style={styles.tagsRow}>
                {RATING_QUICK_TAGS.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tagChip, selectedTags.includes(tag) && styles.tagChipSelected]}
                    onPress={() => toggleTag(tag)}
                  >
                    <Text style={[styles.tagChipText, selectedTags.includes(tag) && styles.tagChipTextSelected]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.skipButton} onPress={handleRatingSubmit}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, ratingScore === 0 && styles.submitButtonDisabled]}
                onPress={handleRatingSubmit}
                disabled={ratingScore === 0}
              >
                <Text style={[styles.submitButtonText, ratingScore === 0 && styles.submitButtonTextDisabled]}>
                  Submit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  topicBar: {
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#2D2D2D',
  },
  topicBarText: { fontSize: 14, color: '#666', textAlign: 'center' },
  mainArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  countdown: { fontSize: 52, fontWeight: 'bold', color: '#fff', fontVariant: ['tabular-nums'] },
  countdownWarning: { color: '#ef4444' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80' },
  statusText: { fontSize: 14, color: '#4ade80' },
  connectingText: { fontSize: 14, color: '#666', marginTop: 8 },
  warningText: { fontSize: 13, color: '#ef4444', marginTop: 8 },
  controls: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 24, paddingBottom: 60,
  },
  muteButton: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#1A1A1A',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2D2D2D',
  },
  muteButtonActive: { backgroundColor: '#ef444430', borderColor: '#ef444460' },
  muteIcon: { fontSize: 22 },
  hangupButton: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#ef4444',
    justifyContent: 'center', alignItems: 'center',
  },
  hangupIcon: { fontSize: 24, transform: [{ rotate: '135deg' }] },
  modalOverlay: {
    flex: 1, backgroundColor: '#00000099', justifyContent: 'center', alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1A1A', borderRadius: 20, padding: 28, width: 320,
    alignItems: 'center', borderWidth: 1, borderColor: '#2D2D2D',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  modalResearcher: { fontSize: 14, color: '#E8D48B', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#666', marginBottom: 20 },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  star: { fontSize: 36, color: '#2D2D2D' },
  starActive: { color: '#C9A84C' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 20 },
  tagChip: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14,
    borderWidth: 1, borderColor: '#2D2D2D', backgroundColor: '#2D2D2D50',
  },
  tagChipSelected: { borderColor: '#C9A84C60', backgroundColor: '#C9A84C20' },
  tagChipText: { fontSize: 12, color: '#999' },
  tagChipTextSelected: { color: '#C9A84C' },
  modalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  skipButton: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
    borderWidth: 1, borderColor: '#2D2D2D',
  },
  skipButtonText: { fontSize: 14, color: '#666' },
  submitButton: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
    backgroundColor: '#C9A84C',
  },
  submitButtonDisabled: { backgroundColor: '#2D2D2D' },
  submitButtonText: { fontSize: 14, fontWeight: '600', color: '#000' },
  submitButtonTextDisabled: { color: '#666' },
})
