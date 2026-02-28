// ===== Call Duration =====
export const CALL_DURATION = 300 // 5 minutes in seconds
export const INVALID_CALL_THRESHOLD = 30 // < 30s = invalid call
export const LAST_WARNING_SECONDS = 30

// ===== Dispatch Timeouts =====
export const DISPATCH_TIMEOUT = {
  AUTHOR_PRIORITY: 60, // 60s for original author
  BROADCAST_TOTAL: 180, // 180s total broadcast timeout
  DIRECTED: 120, // 120s for direct researcher call
} as const

// ===== Socket Event Names =====
export const SOCKET_EVENTS = {
  // Client → Server
  VOICE_INITIATE: 'voice:initiate',
  VOICE_CANCEL: 'voice:cancel',
  VOICE_RESEARCHER_ACCEPT: 'voice:researcher-accept',
  VOICE_RESEARCHER_REJECT: 'voice:researcher-reject',
  VOICE_END_CALL: 'voice:end-call',
  VOICE_RATE: 'voice:rate',

  // Server → User
  VOICE_DISPATCHING: 'voice:dispatching',
  VOICE_RESEARCHER_ACCEPTED: 'voice:researcher-accepted',
  VOICE_COUNTDOWN: 'voice:countdown',
  VOICE_LAST_30S_WARNING: 'voice:last-30s-warning',
  VOICE_CALL_ENDED: 'voice:call-ended',
  VOICE_INVALID_CALL: 'voice:invalid-call',
  VOICE_PROMPT_RATING: 'voice:prompt-rating',
  VOICE_TIMEOUT_REFUND: 'voice:timeout-refund',

  // Server → Researcher
  VOICE_INCOMING: 'voice:incoming',
  VOICE_CALL_CANCELLED: 'voice:call-cancelled',
  VOICE_CALL_CONNECTED: 'voice:call-connected',

  // Global
  VOICE_GLOBAL_ANNOUNCEMENT: 'voice:global-announcement',

  // General
  JOIN_USER: 'join_user',
  JOIN_RESEARCHER_WEB: 'join_researcher_web',
} as const

// ===== API Paths =====
export const API_PREFIX = '/api/v2'

export const API_PATHS = {
  // Auth
  AUTH_NONCE: '/api/auth/nonce',
  AUTH_VERIFY: '/api/auth/verify',
  AUTH_ME: '/api/auth/me',
  AUTH_DEMO_LOGIN: '/api/auth/demo-login',

  // Topic
  TOPIC_POOL: `${API_PREFIX}/topic/pool`,
  TOPIC_BY_RESEARCHER: `${API_PREFIX}/topic/by-researcher`,

  // Researcher
  RESEARCHER_CARDS: `${API_PREFIX}/researcher/cards`,
  RESEARCHER_DETAIL: `${API_PREFIX}/researcher/detail`,
  RESEARCHER_ONLINE_COUNT: `${API_PREFIX}/researcher/online-count`,

  // Ticket
  TICKET_BALANCE: `${API_PREFIX}/ticket/balance`,
  TICKET_GRANT: `${API_PREFIX}/ticket/grant`,

  // Voice
  VOICE_INITIATE: `${API_PREFIX}/voice/initiate`,
  VOICE_CANCEL: `${API_PREFIX}/voice/cancel`,
  VOICE_RATE: `${API_PREFIX}/voice/rate`,
  VOICE_HISTORY: `${API_PREFIX}/voice/history`,
} as const

// ===== Topic Categories =====
export const TOPIC_CATEGORIES = [
  'BTC',
  'ETH',
  'DeFi',
  'NFT',
  'Layer2',
  'Macro',
  'Gold',
  'Perp',
] as const

export type TopicCategory = (typeof TOPIC_CATEGORIES)[number]

// ===== Brand =====
export const BRAND = {
  NAME: 'Genesis Consultation',
  TAGLINE: 'Black Card',
  FULL: 'Genesis Consultation Black Card',
} as const
