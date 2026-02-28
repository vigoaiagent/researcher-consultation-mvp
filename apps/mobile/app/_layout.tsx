import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { configureApi } from '@rcm/shared'
import { useAuthStore } from '../stores/authStore'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'

export default function RootLayout() {
  const restoreSession = useAuthStore(s => s.restoreSession)

  useEffect(() => {
    configureApi({
      baseUrl: API_URL,
      getToken: () => useAuthStore.getState().token,
    })
    restoreSession()
  }, [])

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A0A0A' },
          animation: 'slide_from_right',
        }}
      />
    </>
  )
}
