import { create } from 'zustand'
import type { TopicPoolEntry, ResearcherCard } from '@rcm/shared'
import { topicApi, researcherApi } from '@rcm/shared'

interface LobbyState {
  topics: TopicPoolEntry[]
  researchers: ResearcherCard[]
  isLoadingTopics: boolean
  isLoadingResearchers: boolean

  fetchTopics: () => Promise<void>
  fetchResearchers: () => Promise<void>
  refreshAll: () => Promise<void>
}

export const useLobbyStore = create<LobbyState>()((set) => ({
  topics: [],
  researchers: [],
  isLoadingTopics: false,
  isLoadingResearchers: false,

  fetchTopics: async () => {
    set({ isLoadingTopics: true })
    try {
      const { topics } = await topicApi.getPool()
      set({ topics, isLoadingTopics: false })
    } catch {
      set({ isLoadingTopics: false })
    }
  },

  fetchResearchers: async () => {
    set({ isLoadingResearchers: true })
    try {
      const { researchers } = await researcherApi.getCards()
      set({ researchers, isLoadingResearchers: false })
    } catch {
      set({ isLoadingResearchers: false })
    }
  },

  refreshAll: async () => {
    const fetchTopics = async () => {
      set({ isLoadingTopics: true })
      try {
        const { topics } = await topicApi.getPool()
        set({ topics, isLoadingTopics: false })
      } catch {
        set({ isLoadingTopics: false })
      }
    }
    const fetchResearchers = async () => {
      set({ isLoadingResearchers: true })
      try {
        const { researchers } = await researcherApi.getCards()
        set({ researchers, isLoadingResearchers: false })
      } catch {
        set({ isLoadingResearchers: false })
      }
    }
    await Promise.all([fetchTopics(), fetchResearchers()])
  },
}))
