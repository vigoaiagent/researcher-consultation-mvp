import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../stores/authStore'
import { useEffect } from 'react'
import { BRAND } from '@rcm/shared'

export default function LoginScreen() {
  const router = useRouter()
  const { user, isLoading, error, loginWithWalletConnect, loginDemo } = useAuthStore()

  useEffect(() => {
    if (user) router.replace('/lobby')
  }, [user])

  return (
    <View style={styles.container}>
      <View style={styles.brandContainer}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>G</Text>
        </View>
        <Text style={styles.brandName}>{BRAND.NAME}</Text>
        <Text style={styles.brandTag}>{BRAND.TAGLINE}</Text>
        <Text style={styles.brandDesc}>
          Connect with expert researchers through 1-on-1 voice consultations
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={loginWithWalletConnect}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.primaryButtonText}>Connect Wallet</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.demoButton}
          onPress={() => loginDemo('0xDemo' + Math.random().toString(36).slice(2, 10))}
          disabled={isLoading}
        >
          <Text style={styles.demoButtonText}>Demo Login</Text>
        </TouchableOpacity>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#C9A84C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  brandName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  brandTag: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C9A84C',
    marginTop: 4,
  },
  brandDesc: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 280,
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 320,
  },
  primaryButton: {
    backgroundColor: '#C9A84C',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  demoButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  demoButtonText: {
    color: '#999',
    fontSize: 14,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
  },
})
