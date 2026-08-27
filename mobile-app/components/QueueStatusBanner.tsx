/**
 * components/QueueStatusBanner.tsx
 * Status bar showing network connectivity and sync progress for offline queues.
 */
import React from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useQueue } from '../context/QueueContext'
import { useLanguage } from '../context/LanguageContext'

export default function QueueStatusBanner() {
  const { offlineQueue, isOffline, isSyncingAll } = useQueue()
  const { language } = useLanguage()

  const pendingCount = offlineQueue.length

  if (!isOffline && pendingCount === 0) return null

  // Localized texts
  const labels = {
    offline: {
      hi: "⚠️ आप ऑफलाइन हैं · रिपोर्ट सुरक्षित रूप से फोन में जमा होगी",
      en: "⚠️ Network Offline · Reports will queue locally"
    },
    syncing: {
      hi: `🔄 ${pendingCount} रिपोर्ट सर्वर पर अपलोड हो रही है…`,
      en: `🔄 Syncing ${pendingCount} report(s) to server…`
    },
    pending: {
      hi: `⏳ ${pendingCount} रिपोर्ट अपलोड के लिए तैयार है`,
      en: `⏳ ${pendingCount} report(s) pending sync`
    }
  }

  const getLabel = (type: 'offline' | 'syncing' | 'pending') => {
    return labels[type][language === 'hi' ? 'hi' : 'en']
  }

  let content = null
  let containerStyle = {}

  if (isOffline) {
    containerStyle = styles.containerOffline
    content = (
      <Text style={styles.textOffline}>
        {getLabel('offline')}
      </Text>
    )
  } else if (isSyncingAll) {
    containerStyle = styles.containerSyncing
    content = (
      <View style={styles.row}>
        <ActivityIndicator size="small" color="#60a5fa" />
        <Text style={styles.textSyncing}>
          {getLabel('syncing')}
        </Text>
      </View>
    )
  } else {
    containerStyle = styles.containerPending
    content = (
      <Text style={styles.textPending}>
        {getLabel('pending')}
      </Text>
    )
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {content}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  containerOffline: {
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245,158,11,0.25)',
  },
  containerSyncing: {
    backgroundColor: 'rgba(59,130,246,0.12)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59,130,246,0.25)',
  },
  containerPending: {
    backgroundColor: 'rgba(74,222,128,0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74,222,128,0.2)',
  },
  textOffline: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  textSyncing: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: '600',
  },
  textPending: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
})
