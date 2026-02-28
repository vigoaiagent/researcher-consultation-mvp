import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import LoginPage from './pages/LoginPage'
import LobbyPage from './pages/LobbyPage'
import CallingPage from './pages/CallingPage'
import InCallPage from './pages/InCallPage'
import ResearcherDetailPage from './pages/ResearcherDetailPage'
import ResearcherVoicePage from './pages/ResearcherVoicePage'
import HistoryPage from './pages/HistoryPage'
import AdminPage from './pages/AdminPage'
import { useEffect } from 'react'
import { configureApi } from '@rcm/shared'

const API_URL = import.meta.env.VITE_API_URL || ''

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user)
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const restoreSession = useAuthStore(s => s.restoreSession)

  useEffect(() => {
    configureApi({
      baseUrl: API_URL,
      getToken: () => localStorage.getItem('auth_token'),
    })
    restoreSession()
  }, [restoreSession])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-genesis-black">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><LobbyPage /></ProtectedRoute>} />
          <Route path="/calling/:consultationId" element={<ProtectedRoute><CallingPage /></ProtectedRoute>} />
          <Route path="/in-call/:consultationId" element={<ProtectedRoute><InCallPage /></ProtectedRoute>} />
          <Route path="/researcher/:id" element={<ProtectedRoute><ResearcherDetailPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          <Route path="/researcher/voice/:roomId" element={<ResearcherVoicePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
