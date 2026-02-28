import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { voiceApi, formatDuration } from '@rcm/shared'
import type { VoiceConsultation } from '@rcm/shared'

export default function HistoryScreen() {
  const router = useRouter()
  const user = useAuthStore(s => s.user)
  const [consultations, setConsultations] = useState<VoiceConsultation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchHistory = async () => {
    if (!user) return
    try {
      const { consultations: data } = await voiceApi.getHistory(user.id)
      setConsultations(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [user])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchHistory()
    setRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#4ade80'
      case 'IN_CALL': return '#60a5fa'
      case 'CANCELLED': return '#9ca3af'
      case 'TIMEOUT': return '#facc15'
      case 'INVALID': return '#f87171'
      default: return '#9ca3af'
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Consultation History</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C9A84C" />}
      >
        {loading ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : consultations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📞</Text>
            <Text style={styles.emptyTitle}>No consultations yet</Text>
            <Text style={styles.emptyText}>Start a consultation from the lobby</Text>
          </View>
        ) : (
          consultations.map((c) => (
            <View key={c.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.topicText} numberOfLines={2}>{c.topicText}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(c.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(c.status) }]}>{c.status}</Text>
                </View>
              </View>
              <View style={styles.cardMeta}>
                {c.callDuration > 0 && (
                  <Text style={styles.metaText}>⏱ {formatDuration(c.callDuration)}</Text>
                )}
                <Text style={styles.metaText}>{new Date(c.createdAt).toLocaleDateString()}</Text>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#2D2D2D',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 20, color: '#999' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  list: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  card: {
    backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#2D2D2D',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  topicText: { fontSize: 14, fontWeight: '500', color: '#fff', flex: 1, paddingRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600' },
  cardMeta: { flexDirection: 'row', gap: 12 },
  metaText: { fontSize: 12, color: '#666' },
  emptyContainer: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, color: '#999', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center' },
})
