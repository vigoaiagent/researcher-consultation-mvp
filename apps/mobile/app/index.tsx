import { Redirect } from 'expo-router'
import { useAuthStore } from '../stores/authStore'

export default function Index() {
  const user = useAuthStore(s => s.user)

  if (!user) {
    return <Redirect href="/login" />
  }

  return <Redirect href="/lobby" />
}
