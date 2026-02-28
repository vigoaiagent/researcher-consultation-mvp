import { View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { useLobbyStore } from '../stores/lobbyStore'
import { useCallStore } from '../stores/callStore'
import { useAuthStore } from '../stores/authStore'
import { truncateAddress, formatRating, BRAND, researcherApi } from '@rcm/shared'
import type { TopicPoolEntry, ResearcherCard } from '@rcm/shared'

export default function LobbyScreen() {
  const router = useRouter()
  const { topics, researchers, refreshAll } = useLobbyStore()
  const initiateCall = useCallStore(s => s.initiateCall)
  const callStatus = useCallStore(s => s.status)
  const consultationId = useCallStore(s => s.consultationId)
  const { user, ticketBalance, refreshTicketBalance } = useAuthStore()
  const [refreshing, setRefreshing] = useState(false)
  const [onlineCount, setOnlineCount] = useState(0)

  useEffect(() => {
    refreshAll()
    refreshTicketBalance()
    const fetchOnline = async () => {
      try {
        const { onlineCount: c } = await researcherApi.getOnlineCount()
        setOnlineCount(c)
      } catch {}
    }
    fetchOnline()
    const interval = setInterval(fetchOnline, 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (callStatus === 'dispatching' && consultationId) {
      router.push(`/calling?id=${consultationId}`)
    }
  }, [callStatus, consultationId])

  const onRefresh = async () => {
    setRefreshing(true)
    await refreshAll()
    await refreshTicketBalance()
    setRefreshing(false)
  }

  // PRD: Non-whitelist guard
  if (user && !user.isWhitelist) {
    return (
      <View style={styles.guardContainer}>
        <Text style={styles.guardEmoji}>🔒</Text>
        <Text style={styles.guardTitle}>Internal Test Only</Text>
        <Text style={styles.guardText}>
          Genesis Consultation Black Card is currently in closed beta.
          Only whitelisted wallet addresses can access the platform.
        </Text>
      </View>
    )
  }

  const handleTopicPress = async (topic: TopicPoolEntry) => {
    if (ticketBalance <= 0) {
      // TODO: show proper alert
      return
    }
    await initiateCall({
      topicText: topic.topic,
      dispatchType: 'broadcast',
      topicId: topic.id,
    })
  }

  const handleResearcherPress = (researcher: ResearcherCard) => {
    router.push(`/researcher/${researcher.id}`)
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C9A84C" />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{BRAND.FULL}</Text>
        <View style={styles.headerRight}>
          <View style={styles.onlineBadge}>
            <View style={[styles.breathingDot, onlineCount > 0 && styles.breathingDotActive]} />
            <Text style={styles.onlineText}>{onlineCount} online</Text>
          </View>
          <View style={styles.timeBadge}>
            <Text style={styles.timeText}>5 min</Text>
          </View>
          <View style={styles.ticketBadge}>
            <Text style={styles.ticketText}>{ticketBalance}</Text>
          </View>
        </View>
      </View>

      {/* Topics — PRD: click-only, no manual input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hot Topics</Text>
        <Text style={styles.sectionSubtitle}>Tap a topic to start a consultation</Text>
        <View style={styles.topicsGrid}>
          {topics.map((topic) => (
            <TouchableOpacity
              key={topic.id}
              style={styles.topicBubble}
              onPress={() => handleTopicPress(topic)}
              activeOpacity={0.7}
            >
              <Text style={styles.topicText}>{topic.topic}</Text>
              <View style={styles.topicMeta}>
                <Text style={styles.topicAuthor}>by {topic.researcherName}</Text>
                <Text style={styles.topicCategory}>{topic.category}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Researchers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chief Analysts</Text>
        <Text style={styles.sectionSubtitle}>Tap to view profile & call directly</Text>
        <FlatList
          horizontal
          data={researchers}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.researcherCard}
              onPress={() => handleResearcherPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.researcherHeader}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{item.name[0]}</Text>
                  <View style={[styles.statusDot, {
                    backgroundColor: item.status === 'ONLINE' ? '#4ade80' : item.status === 'BUSY' ? '#facc15' : '#6b7280',
                  }]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.researcherName}>{item.name}</Text>
                  <Text style={styles.researcherRating}>
                    ★ {formatRating(item.ratingScore)} · {item.serviceCount} calls
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </View>
              {item.bio && <Text style={styles.researcherBio} numberOfLines={2}>{item.bio}</Text>}
              <View style={styles.specialtiesRow}>
                {item.specialties.slice(0, 3).map((s) => (
                  <View key={s} style={styles.specialtyTag}>
                    <Text style={styles.specialtyText}>{s}</Text>
                  </View>
                ))}
              </View>
              <View style={[styles.statusBadge, item.status === 'ONLINE' ? styles.statusOnline : styles.statusOffline]}>
                <Text style={item.status === 'ONLINE' ? styles.statusOnlineText : styles.statusOfflineText}>
                  {item.status === 'ONLINE' ? 'Available' : item.status}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  guardContainer: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center', padding: 32 },
  guardEmoji: { fontSize: 48, marginBottom: 16 },
  guardTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  guardText: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#2D2D2D',
  },
  headerTitle: { fontSize: 14, fontWeight: 'bold', color: '#C9A84C' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  onlineBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#1A1A1A', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
  },
  breathingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#6b7280' },
  breathingDotActive: { backgroundColor: '#4ade80' },
  onlineText: { fontSize: 11, color: '#999' },
  timeBadge: { backgroundColor: '#1A1A1A', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  timeText: { fontSize: 11, color: '#E8D48B' },
  ticketBadge: {
    backgroundColor: '#1A1A1A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  ticketText: { fontSize: 13, fontWeight: '600', color: '#E8D48B' },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  sectionSubtitle: { fontSize: 13, color: '#666', marginTop: 4, marginBottom: 16 },
  topicsGrid: { gap: 10 },
  topicBubble: {
    backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#2D2D2D',
  },
  topicText: { fontSize: 14, fontWeight: '500', color: '#fff', lineHeight: 20 },
  topicMeta: { flexDirection: 'row', gap: 8, marginTop: 8 },
  topicAuthor: { fontSize: 12, color: '#666' },
  topicCategory: { fontSize: 12, color: '#C9A84C80' },
  researcherCard: {
    width: 240, backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16,
    marginRight: 12, borderWidth: 1, borderColor: '#2D2D2D',
  },
  researcherHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  avatarCircle: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#2D2D2D',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#C9A84C' },
  statusDot: {
    position: 'absolute', bottom: 0, right: 0, width: 12, height: 12,
    borderRadius: 6, borderWidth: 2, borderColor: '#1A1A1A',
  },
  chevron: { fontSize: 20, color: '#666' },
  researcherName: { fontSize: 14, fontWeight: '600', color: '#fff' },
  researcherRating: { fontSize: 12, color: '#E8D48B', marginTop: 2 },
  researcherBio: { fontSize: 12, color: '#666', marginBottom: 8, lineHeight: 16 },
  specialtiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 12 },
  specialtyTag: { backgroundColor: '#2D2D2D', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  specialtyText: { fontSize: 11, color: '#999' },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, alignSelf: 'flex-start' },
  statusOnline: { backgroundColor: '#4ade8020' },
  statusOffline: { backgroundColor: '#6b728020' },
  statusOnlineText: { fontSize: 12, color: '#4ade80' },
  statusOfflineText: { fontSize: 12, color: '#6b7280' },
})
