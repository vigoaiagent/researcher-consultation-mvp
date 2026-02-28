import { API_PATHS } from '../constants/index.js'
import type {
  AuthResponse,
  NonceResponse,
  TopicPoolResponse,
  ResearcherCardsResponse,
  ResearcherDetailResponse,
  InitiateVoiceResponse,
  TicketBalanceResponse,
  VoiceHistoryResponse,
  OnlineCountResponse,
} from '../types/index.js'

type FetchFn = typeof fetch

let _baseUrl = ''
let _getToken: () => string | null = () => null
let _fetchFn: FetchFn = fetch

export function configureApi(opts: {
  baseUrl: string
  getToken: () => string | null
  fetchFn?: FetchFn
}) {
  _baseUrl = opts.baseUrl
  _getToken = opts.getToken
  if (opts.fetchFn) _fetchFn = opts.fetchFn
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = _getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await _fetchFn(`${_baseUrl}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, (body as any).message || res.statusText)
  }

  return res.json() as Promise<T>
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ===== Auth API =====
export const authApi = {
  getNonce: (address: string) =>
    request<NonceResponse>(`${API_PATHS.AUTH_NONCE}/${address}`),

  verify: (walletAddress: string, signature: string, message: string) =>
    request<AuthResponse>(API_PATHS.AUTH_VERIFY, {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature, message }),
    }),

  getMe: () => request<{ user: any }>(API_PATHS.AUTH_ME),

  demoLogin: (walletAddress: string) =>
    request<AuthResponse>(API_PATHS.AUTH_DEMO_LOGIN, {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    }),
}

// ===== Topic API =====
export const topicApi = {
  getPool: () => request<TopicPoolResponse>(API_PATHS.TOPIC_POOL),

  getByResearcher: (researcherId: string) =>
    request<TopicPoolResponse>(`${API_PATHS.TOPIC_BY_RESEARCHER}/${researcherId}`),
}

// ===== Researcher API =====
export const researcherApi = {
  getCards: () => request<ResearcherCardsResponse>(API_PATHS.RESEARCHER_CARDS),

  getDetail: (id: string) =>
    request<ResearcherDetailResponse>(
      `${API_PATHS.RESEARCHER_DETAIL}/${id}`,
    ),

  getOnlineCount: () =>
    request<OnlineCountResponse>(API_PATHS.RESEARCHER_ONLINE_COUNT),
}

// ===== Ticket API =====
export const ticketApi = {
  getBalance: () => request<TicketBalanceResponse>(API_PATHS.TICKET_BALANCE),

  grant: (userId: string, amount: number, remark?: string) =>
    request<{ balance: number }>(API_PATHS.TICKET_GRANT, {
      method: 'POST',
      body: JSON.stringify({ userId, amount, remark }),
    }),
}

// ===== Voice API =====
export const voiceApi = {
  initiate: (data: {
    topicText: string
    dispatchType: 'broadcast' | 'directed'
    researcherId?: string
    topicId?: string
  }) =>
    request<InitiateVoiceResponse>(API_PATHS.VOICE_INITIATE, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  cancel: (consultationId: string) =>
    request<{ success: boolean }>(API_PATHS.VOICE_CANCEL, {
      method: 'POST',
      body: JSON.stringify({ consultationId }),
    }),

  rate: (consultationId: string, score: number) =>
    request<{ success: boolean }>(API_PATHS.VOICE_RATE, {
      method: 'POST',
      body: JSON.stringify({ consultationId, score }),
    }),

  getHistory: (userId: string) =>
    request<VoiceHistoryResponse>(`${API_PATHS.VOICE_HISTORY}/${userId}`),
}
