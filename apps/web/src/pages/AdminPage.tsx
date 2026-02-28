import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { ArrowLeft, Plus, Trash2, RefreshCw, Send } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || ''

// Admin address guard — if VITE_ADMIN_ADDRESSES is set, only those addresses can access
const ADMIN_ADDRESSES = (import.meta.env.VITE_ADMIN_ADDRESSES || '').split(',').filter(Boolean).map((a: string) => a.toLowerCase())

function getHeaders() {
  const token = localStorage.getItem('auth_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function adminFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}/api/v2/admin${path}`, {
    ...options,
    headers: { ...getHeaders(), ...(options.headers as Record<string, string> || {}) },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as any).error || res.statusText)
  }
  return res.json()
}

type Tab = 'whitelist' | 'topics' | 'researchers' | 'tickets' | 'consultations'

export default function AdminPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const [activeTab, setActiveTab] = useState<Tab>('whitelist')

  // Guard: check admin access
  if (!user) return null
  if (ADMIN_ADDRESSES.length > 0 && !ADMIN_ADDRESSES.includes(user.walletAddress.toLowerCase())) {
    return (
      <div className="min-h-screen bg-genesis-black flex flex-col items-center justify-center px-4">
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-sm text-gray-400 mb-6">Admin privileges required.</p>
        <button onClick={() => navigate('/')} className="text-genesis-gold text-sm">Back to Lobby</button>
      </div>
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'whitelist', label: 'Whitelist' },
    { key: 'topics', label: 'Topics' },
    { key: 'researchers', label: 'Researchers' },
    { key: 'tickets', label: 'Tickets' },
    { key: 'consultations', label: 'Records' },
  ]

  return (
    <div className="min-h-screen bg-genesis-black">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-genesis-slate">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-genesis-slate transition-colors">
          <ArrowLeft size={20} className="text-gray-400" />
        </button>
        <h1 className="text-lg font-bold text-white">Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-genesis-slate px-6 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === t.key
                ? 'border-genesis-gold text-genesis-gold'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        {activeTab === 'whitelist' && <WhitelistTab />}
        {activeTab === 'topics' && <TopicsTab />}
        {activeTab === 'researchers' && <ResearchersTab />}
        {activeTab === 'tickets' && <TicketsTab />}
        {activeTab === 'consultations' && <ConsultationsTab />}
      </div>
    </div>
  )
}

// ===== Whitelist Tab =====
function WhitelistTab() {
  const [users, setUsers] = useState<any[]>([])
  const [newAddress, setNewAddress] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchList = async () => {
    try {
      const data = await adminFetch('/whitelist')
      setUsers(data.users)
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { fetchList() }, [])

  const handleAdd = async () => {
    if (!newAddress.trim()) return
    try {
      await adminFetch('/whitelist', { method: 'POST', body: JSON.stringify({ walletAddress: newAddress.trim() }) })
      setNewAddress('')
      fetchList()
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleRemove = async (address: string) => {
    try {
      await adminFetch(`/whitelist/${address}`, { method: 'DELETE' })
      fetchList()
    } catch (e: any) {
      alert(e.message)
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          value={newAddress}
          onChange={e => setNewAddress(e.target.value)}
          placeholder="0x... wallet address"
          className="flex-1 px-4 py-2.5 rounded-lg bg-genesis-charcoal border border-genesis-slate text-white text-sm placeholder-gray-500 focus:border-genesis-gold/40 focus:outline-none"
        />
        <button onClick={handleAdd} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-genesis-gold text-black text-sm font-bold">
          <Plus size={14} /> Add
        </button>
      </div>

      {loading ? <p className="text-gray-500">Loading...</p> : (
        <div className="space-y-2">
          {users.map(u => (
            <div key={u.id} className="flex items-center justify-between bg-genesis-charcoal rounded-lg border border-genesis-slate px-4 py-3">
              <div>
                <span className="text-sm text-white font-mono">{u.walletAddress}</span>
                <span className="ml-3 text-xs text-gray-500">Tickets: {u.ticketBalance}</span>
                {u.userBadge && <span className="ml-2 text-xs text-genesis-gold">{u.userBadge}</span>}
              </div>
              <button onClick={() => handleRemove(u.walletAddress)} className="p-1.5 rounded hover:bg-red-500/10">
                <Trash2 size={14} className="text-red-400" />
              </button>
            </div>
          ))}
          {users.length === 0 && <p className="text-gray-500 text-sm text-center py-8">No whitelist users</p>}
        </div>
      )}
    </div>
  )
}

// ===== Topics Tab =====
function TopicsTab() {
  const [topics, setTopics] = useState<any[]>([])
  const [researchers, setResearchers] = useState<any[]>([])
  const [newTopic, setNewTopic] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newResearcherId, setNewResearcherId] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchTopics = async () => {
    try {
      const [topicData, researcherData] = await Promise.all([
        adminFetch('/topics'),
        adminFetch('/researchers'),
      ])
      setTopics(topicData.topics)
      setResearchers(researcherData.researchers)
      if (researcherData.researchers.length > 0 && !newResearcherId) {
        setNewResearcherId(researcherData.researchers[0].id)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { fetchTopics() }, [])

  const handleAdd = async () => {
    if (!newTopic.trim() || !newCategory.trim() || !newResearcherId) return
    try {
      await adminFetch('/topics', {
        method: 'POST',
        body: JSON.stringify({ topic: newTopic.trim(), category: newCategory.trim(), researcherId: newResearcherId }),
      })
      setNewTopic('')
      setNewCategory('')
      fetchTopics()
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await adminFetch(`/topics/${id}`, { method: 'DELETE' })
      fetchTopics()
    } catch (e: any) {
      alert(e.message)
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-4">
        <input
          value={newTopic}
          onChange={e => setNewTopic(e.target.value)}
          placeholder="Topic text"
          className="sm:col-span-2 px-4 py-2.5 rounded-lg bg-genesis-charcoal border border-genesis-slate text-white text-sm placeholder-gray-500 focus:border-genesis-gold/40 focus:outline-none"
        />
        <input
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          placeholder="Category"
          className="px-4 py-2.5 rounded-lg bg-genesis-charcoal border border-genesis-slate text-white text-sm placeholder-gray-500 focus:border-genesis-gold/40 focus:outline-none"
        />
        <div className="flex gap-2">
          <select
            value={newResearcherId}
            onChange={e => setNewResearcherId(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-lg bg-genesis-charcoal border border-genesis-slate text-white text-sm focus:outline-none"
          >
            {researchers.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <button onClick={handleAdd} className="flex items-center gap-1 px-4 py-2.5 rounded-lg bg-genesis-gold text-black text-sm font-bold shrink-0">
            <Plus size={14} />
          </button>
        </div>
      </div>

      {loading ? <p className="text-gray-500">Loading...</p> : (
        <div className="space-y-2">
          {topics.map(t => (
            <div key={t.id} className="flex items-center justify-between bg-genesis-charcoal rounded-lg border border-genesis-slate px-4 py-3">
              <div className="flex-1">
                <p className="text-sm text-white">{t.topic}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-genesis-gold">{t.category}</span>
                  <span className="text-xs text-gray-500">by {t.researcher?.name || 'Unknown'}</span>
                  <span className="text-xs text-gray-600">Used: {t.usageCount}</span>
                </div>
              </div>
              <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded hover:bg-red-500/10">
                <Trash2 size={14} className="text-red-400" />
              </button>
            </div>
          ))}
          {topics.length === 0 && <p className="text-gray-500 text-sm text-center py-8">No topics</p>}
        </div>
      )}
    </div>
  )
}

// ===== Researchers Tab =====
function ResearchersTab() {
  const [researchers, setResearchers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchResearchers = async () => {
    try {
      const data = await adminFetch('/researchers')
      setResearchers(data.researchers)
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { fetchResearchers() }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE': return 'text-green-400 bg-green-400/10'
      case 'BUSY': return 'text-yellow-400 bg-yellow-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{researchers.length} researchers</p>
        <button onClick={fetchResearchers} className="p-2 rounded-lg hover:bg-genesis-slate">
          <RefreshCw size={14} className="text-gray-400" />
        </button>
      </div>

      {loading ? <p className="text-gray-500">Loading...</p> : (
        <div className="space-y-2">
          {researchers.map(r => (
            <div key={r.id} className="bg-genesis-charcoal rounded-lg border border-genesis-slate px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-genesis-slate flex items-center justify-center text-genesis-gold font-bold">
                    {r.name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{r.name}</p>
                    <p className="text-xs text-gray-500">TG: {r.tgUserId} · Rating: {r.ratingScore} · Calls: {r.serviceCount}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(r.status)}`}>
                  {r.status}
                </span>
              </div>
              {r.bio && <p className="text-xs text-gray-500 mt-2">{r.bio}</p>}
              <div className="flex flex-wrap gap-1 mt-2">
                {JSON.parse(r.specialties || '[]').map((s: string) => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded bg-genesis-slate text-gray-400">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ===== Tickets Tab =====
function TicketsTab() {
  const [walletAddress, setWalletAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [remark, setRemark] = useState('')
  const [result, setResult] = useState<string | null>(null)

  const handleGrant = async () => {
    if (!walletAddress.trim() || !amount) return
    try {
      const data = await adminFetch('/tickets/grant', {
        method: 'POST',
        body: JSON.stringify({ walletAddress: walletAddress.trim(), amount: parseInt(amount), remark: remark.trim() || undefined }),
      })
      setResult(`Granted! New balance: ${data.newBalance}`)
      setWalletAddress('')
      setAmount('')
      setRemark('')
    } catch (e: any) {
      setResult(`Error: ${e.message}`)
    }
  }

  return (
    <div className="max-w-lg">
      <h3 className="text-md font-bold text-white mb-4">Grant Experience Tickets</h3>
      <div className="space-y-3">
        <input
          value={walletAddress}
          onChange={e => setWalletAddress(e.target.value)}
          placeholder="0x... wallet address"
          className="w-full px-4 py-2.5 rounded-lg bg-genesis-charcoal border border-genesis-slate text-white text-sm placeholder-gray-500 focus:border-genesis-gold/40 focus:outline-none"
        />
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Amount"
            min="1"
            className="w-32 px-4 py-2.5 rounded-lg bg-genesis-charcoal border border-genesis-slate text-white text-sm placeholder-gray-500 focus:border-genesis-gold/40 focus:outline-none"
          />
          <input
            value={remark}
            onChange={e => setRemark(e.target.value)}
            placeholder="Remark (optional)"
            className="flex-1 px-4 py-2.5 rounded-lg bg-genesis-charcoal border border-genesis-slate text-white text-sm placeholder-gray-500 focus:border-genesis-gold/40 focus:outline-none"
          />
        </div>
        <button
          onClick={handleGrant}
          disabled={!walletAddress.trim() || !amount}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-genesis-gold text-black text-sm font-bold disabled:opacity-40"
        >
          <Send size={14} /> Grant Tickets
        </button>
        {result && (
          <p className={`text-sm ${result.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>{result}</p>
        )}
      </div>
    </div>
  )
}

// ===== Consultations Tab =====
function ConsultationsTab() {
  const [consultations, setConsultations] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchConsultations = async (p: number) => {
    try {
      const data = await adminFetch(`/consultations?page=${p}&limit=20`)
      setConsultations(data.consultations)
      setTotal(data.total)
      setPage(p)
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { fetchConsultations(1) }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-400'
      case 'IN_CALL': return 'text-blue-400'
      case 'CANCELLED': return 'text-gray-400'
      case 'TIMEOUT': return 'text-yellow-400'
      case 'INVALID': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{total} total records</p>
        <button onClick={() => fetchConsultations(page)} className="p-2 rounded-lg hover:bg-genesis-slate">
          <RefreshCw size={14} className="text-gray-400" />
        </button>
      </div>

      {loading ? <p className="text-gray-500">Loading...</p> : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-genesis-slate">
                  <th className="pb-2 pr-4">Topic</th>
                  <th className="pb-2 pr-4">User</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Duration</th>
                  <th className="pb-2 pr-4">Rating</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {consultations.map(c => (
                  <tr key={c.id} className="border-b border-genesis-slate/50">
                    <td className="py-2.5 pr-4 text-white max-w-[200px] truncate">{c.topicText}</td>
                    <td className="py-2.5 pr-4 text-gray-400 font-mono text-xs">
                      {c.user?.walletAddress ? `${c.user.walletAddress.slice(0, 6)}...${c.user.walletAddress.slice(-4)}` : '-'}
                    </td>
                    <td className={`py-2.5 pr-4 ${getStatusColor(c.status)}`}>{c.status}</td>
                    <td className="py-2.5 pr-4 text-gray-400">{c.callDuration > 0 ? formatDuration(c.callDuration) : '-'}</td>
                    <td className="py-2.5 pr-4 text-genesis-gold">{c.rating?.score ? `${c.rating.score}/5` : '-'}</td>
                    <td className="py-2.5 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => fetchConsultations(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded bg-genesis-charcoal text-gray-400 text-sm disabled:opacity-30"
              >
                Prev
              </button>
              <span className="text-sm text-gray-500">Page {page} of {Math.ceil(total / 20)}</span>
              <button
                onClick={() => fetchConsultations(page + 1)}
                disabled={page >= Math.ceil(total / 20)}
                className="px-3 py-1.5 rounded bg-genesis-charcoal text-gray-400 text-sm disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
