import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { researcherApi, formatRating, type ResearcherDetail, type TopicPoolEntry } from '@rcm/shared'
import { useCallStore } from '../../stores/callStore'
import { useAuthStore } from '../../stores/authStore'

export default function ResearcherDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [researcher, setResearcher] = useState<ResearcherDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTopic, setSelectedTopic] = useState('')
  const initiateCall = useCallStore(s => s.initiateCall)
  const callStatus = useCallStore(s => s.status)
  const consultationId = useCallStore(s => s.consultationId)
  const ticketBalance = useAuthStore(s => s.ticketBalance)

  useEffect(() => {
    if (!id) return
    const fetch = async () => {
      try {
        const { researcher: r } = await researcherApi.getDetail(id)
        setResearcher(r)
      } catch {} finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  useEffect(() => {
    if (callStatus === 'dispatching' && consultationId) {
      router.push(`/calling?id=${consultationId}`)
    }
  }, [callStatus, consultationId])

  const handleCall = async () => {
    if (!researcher || !selectedTopic || ticketBalance <= 0) return
    await initiateCall({
      topicText: selectedTopic,
      dispatchType: 'directed',
      researcherId: researcher.id,
    })
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  if (!researcher) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Researcher not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const isOnline = researcher.status === 'ONLINE'

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Researcher Profile</Text>
      </View>

      {/* Profile */}
      <View style={styles.profileCard}>
        <View style={styles.profileRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{researcher.name[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{researcher.name}</Text>
            <Text style={styles.rating}>★ {formatRating(researcher.ratingScore)} · {researcher.serviceCount} calls</Text>
            <View style={[styles.statusPill, isOnline ? styles.onlinePill : styles.offlinePill]}>
              <Text style={isOnline ? styles.onlineText : styles.offlineText}>{researcher.status}</Text>
            </View>
          </View>
        </View>
        {researcher.bio && <Text style={styles.bio}>{researcher.bio}</Text>}
        <View style={styles.tags}>
          {researcher.specialties.map(s => (
            <View key={s} style={styles.tag}><Text style={styles.tagText}>{s}</Text></View>
          ))}
        </View>
      </View>

      {/* Topics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select a Topic</Text>
        {researcher.topics && researcher.topics.length > 0 ? (
          researcher.topics.map(topic => (
            <TouchableOpacity
              key={topic.id}
              style={[styles.topicItem, selectedTopic === topic.topic && styles.topicItemSelected]}
              onPress={() => setSelectedTopic(topic.topic)}
            >
              <Text style={styles.topicItemText}>{topic.topic}</Text>
              <Text style={styles.topicItemCategory}>{topic.category}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No predefined topics</Text>
        )}
      </View>

      {/* Custom input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Or enter a custom topic</Text>
        <TextInput
          style={styles.input}
          value={selectedTopic}
          onChangeText={setSelectedTopic}
          placeholder="Type your consultation topic..."
          placeholderTextColor="#666"
        />
      </View>

      {/* Call */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.callButton, (!isOnline || !selectedTopic) && styles.callDisabled]}
          onPress={handleCall}
          disabled={!isOnline || !selectedTopic}
        >
          <Text style={styles.callText}>
            {isOnline ? (selectedTopic ? 'Start 1-on-1 Call' : 'Select a topic first') : 'Researcher is offline'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  center: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#666', fontSize: 14 },
  backLink: { color: '#C9A84C', fontSize: 14, marginTop: 12 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#2D2D2D',
  },
  backButton: { padding: 4 },
  backArrow: { fontSize: 28, color: '#666' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#fff' },
  profileCard: {
    margin: 20, backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: '#2D2D2D',
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarCircle: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#2D2D2D',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: 'bold', color: '#C9A84C' },
  name: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  rating: { fontSize: 13, color: '#E8D48B', marginTop: 2 },
  statusPill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 4 },
  onlinePill: { backgroundColor: '#4ade8020' },
  offlinePill: { backgroundColor: '#6b728020' },
  onlineText: { fontSize: 11, color: '#4ade80' },
  offlineText: { fontSize: 11, color: '#6b7280' },
  bio: { fontSize: 13, color: '#999', marginTop: 12, lineHeight: 18 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  tag: { backgroundColor: '#2D2D2D', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  tagText: { fontSize: 12, color: '#999' },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  topicItem: {
    padding: 14, borderRadius: 12, backgroundColor: '#1A1A1A',
    borderWidth: 1, borderColor: '#2D2D2D', marginBottom: 8,
  },
  topicItemSelected: { borderColor: '#C9A84C', borderWidth: 2 },
  topicItemText: { fontSize: 14, color: '#fff' },
  topicItemCategory: { fontSize: 12, color: '#666', marginTop: 4 },
  emptyText: { fontSize: 13, color: '#666' },
  input: {
    backgroundColor: '#1A1A1A', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#2D2D2D',
  },
  callButton: {
    backgroundColor: '#C9A84C', paddingVertical: 16, borderRadius: 14, alignItems: 'center',
  },
  callDisabled: { backgroundColor: '#2D2D2D' },
  callText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
})
