// ===== User =====
export interface User {
  id: string
  walletAddress: string
  isWhitelist: boolean
  ticketBalance: number
  userBadge: string | null
  level: UserLevel
  lastLoginAt: string | null
  createdAt: string
}

export type UserLevel = 'Bronze' | 'Silver' | 'Gold' | 'Diamond'

// ===== Researcher =====
export interface Researcher {
  id: string
  name: string
  bio: string | null
  avatarUrl: string | null
  specialties: string[]
  status: ResearcherStatus
  ratingScore: number
  serviceCount: number
  responseTimeAvg: number
  quickQuestions: string[]
  badges: ResearcherBadge[]
}

export type ResearcherStatus = 'OFFLINE' | 'ONLINE' | 'BUSY'

export type ResearcherBadge = 'top_rated' | 'expert' | 'verified' | 'hot' | 'rising_star' | 'veteran'

export interface ResearcherCard {
  id: string
  name: string
  bio: string | null
  avatarUrl: string | null
  specialties: string[]
  status: ResearcherStatus
  ratingScore: number
  serviceCount: number
  quickQuestions: string[]
  badges: ResearcherBadge[]
}

export interface ResearcherDetail extends ResearcherCard {
  topics: TopicPoolEntry[]
}

// ===== Topic =====
export interface TopicPoolEntry {
  id: string
  topic: string
  researcherId: string
  researcherName: string
  category: string
  usageCount: number
}

// ===== Voice Consultation =====
export interface VoiceConsultation {
  id: string
  userId: string
  researcherId: string | null
  topicText: string
  dispatchType: DispatchType
  roomId: string | null
  status: VoiceConsultationStatus
  callDuration: number
  maxDuration: number
  startedAt: string | null
  endedAt: string | null
  createdAt: string
}

export type DispatchType = 'broadcast' | 'directed'

export type VoiceConsultationStatus =
  | 'PENDING'
  | 'DISPATCHING'
  | 'ACCEPTED'
  | 'IN_CALL'
  | 'COMPLETED'
  | 'TIMEOUT'
  | 'CANCELLED'
  | 'INVALID'

// ===== Voice Dispatch =====
export interface VoiceDispatch {
  id: string
  voiceConsultationId: string
  researcherId: string
  priority: number
  response: DispatchResponse
  respondedAt: string | null
}

export type DispatchResponse = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'TIMEOUT'

// ===== Rating =====
export interface VoiceRating {
  voiceConsultationId: string
  userId: string
  researcherId: string
  score: number
  createdAt: string
}

// ===== Ticket =====
export interface TicketTransaction {
  id: string
  userId: string
  amount: number
  type: TicketTransactionType
  refId: string | null
  remark: string | null
  createdAt: string
}

export type TicketTransactionType = 'GRANT' | 'CONSUME' | 'REFUND' | 'INVALID_REFUND'

// ===== Call State =====
export type CallStatus =
  | 'idle'
  | 'requesting'
  | 'dispatching'
  | 'connecting'
  | 'connected'
  | 'ended'
  | 'failed'

export type DispatchPhase = 'author_priority' | 'broadcast'

// ===== API Responses =====
export interface AuthResponse {
  token: string
  user: User
}

export interface NonceResponse {
  message: string
  walletAddress: string
}

export interface TopicPoolResponse {
  topics: TopicPoolEntry[]
}

export interface ResearcherCardsResponse {
  researchers: ResearcherCard[]
}

export interface InitiateVoiceResponse {
  consultationId: string
  ticketBalance: number
}

export interface TicketBalanceResponse {
  balance: number
}

export interface VoiceHistoryResponse {
  consultations: VoiceConsultation[]
}

export interface OnlineCountResponse {
  onlineCount: number
}

export interface ResearcherDetailResponse {
  researcher: ResearcherDetail
}

// ===== Rating Quick Tags =====
export const RATING_QUICK_TAGS = [
  'Professional',
  'Insightful',
  'Patient',
  'Clear',
  'Helpful',
  'Excellent',
] as const

export type RatingQuickTag = (typeof RATING_QUICK_TAGS)[number]

// ===== Global Announcement =====
export interface GlobalAnnouncement {
  message: string
}
