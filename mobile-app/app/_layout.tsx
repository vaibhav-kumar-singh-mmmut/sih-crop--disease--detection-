/**
 * app/_layout.tsx — Root layout for Expo Router.
 * Wraps the entire app in AuthProvider + LanguageProvider.
 * Handles auth-based and first-launch routing:
 *   - No language selected → /language-select
 *   - Not logged in → /(auth)/login
 *   - Logged in → /(tabs)/
 */
import React, { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { View, ActivityIndicator, StatusBar } from 'react-native'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { LanguageProvider, useLanguage } from '../context/LanguageContext'
import { QueueProvider } from '../context/QueueContext'

function AuthAndLangGate({ children }: { children: React.ReactNode }) {
  const { token, loading: authLoading } = useAuth()
  const { isFirstLaunch }               = useLanguage()
  const router    = useRouter()
  const segments  = useSegments()

  useEffect(() => {
    if (authLoading) return

    const inAuthGroup     = segments[0] === '(auth)'
    const inLangSelect    = segments[0] === 'language-select'
    const inTabs          = segments[0] === '(tabs)'

    // Priority 1: first-launch language picker
    if (isFirstLaunch && !inLangSelect) {
      router.replace('/language-select')
      return
    }

    // Priority 2: auth gate
    if (!isFirstLaunch) {
      if (!token && !inAuthGroup) {
        router.replace('/(auth)/login')
      } else if (token && inAuthGroup) {
        router.replace('/(tabs)/')
      }
    }
  }, [token, authLoading, isFirstLaunch, segments])

  if (authLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0f0d' }}>
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    )
  }

  return <>{children}</>
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <QueueProvider>
          <StatusBar barStyle="light-content" backgroundColor="#0a0f0d" />
          <AuthAndLangGate>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0a0f0d' } }}>
              <Stack.Screen name="language-select" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)"          options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)"          options={{ headerShown: false }} />
              <Stack.Screen name="report-details"  options={{ headerShown: false }} />
            </Stack>
          </AuthAndLangGate>
        </QueueProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}
