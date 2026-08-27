/**
 * app/(tabs)/reports.tsx — Displays a unified list of uploaded and queued crop reports.
 * Includes status checks, pull-to-refresh, localized strings, and voice guidance.
 */
import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl, Platform
} from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { getMyReports } from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'
import { useSpeech } from '../../hooks/useSpeech'
import { useQueue } from '../../context/QueueContext'
import ScreenHeader from '../../components/ScreenHeader'

interface ApiReport {
  id: string
  image_path: string
  latitude: number
  longitude: number
  captured_at: string
  status: string
  is_suspicious: boolean
  disease_detected: string | null
  confidence: number | null
}

const CACHE_KEY = "reports_list_cache"

export default function ReportsScreen() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const { speakScreen, stop, isSpeaking } = useSpeech()
  const { offlineQueue, isOffline } = useQueue()

  const [reports, setReports] = useState<ApiReport[]>([])
  const [loading, setLoading] = useState(false)

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => speakScreen('reports'), 600)
      return () => { clearTimeout(timer); stop() }
    }, [language])
  )

  const fetchReports = async () => {
    if (isOffline) {
      try {
        const stored = await AsyncStorage.getItem(CACHE_KEY)
        if (stored) {
          setReports(JSON.parse(stored))
        }
      } catch (ex) {
        console.error("Failed to load cached reports:", ex)
      }
      return
    }

    setLoading(true)
    try {
      const { data } = await getMyReports()
      setReports(data)
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data))
    } catch (err) {
      console.error("Failed to load reports from backend:", err)
      try {
        const stored = await AsyncStorage.getItem(CACHE_KEY)
        if (stored) {
          setReports(JSON.parse(stored))
        }
      } catch {}
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [isOffline])

  const onRefresh = useCallback(() => {
    fetchReports()
  }, [isOffline])

  // Combine offline items and synced items
  const renderItem = ({ item, index }: { item: any, index: number }) => {
    const isOfflineItem = item.isOffline

    // Host formatting for remote images (Android emulator uses 10.0.2.2)
    // In production we read from API base config
    const imageUrl = isOfflineItem 
      ? item.imageUri
      : `http://10.0.2.2:8000${item.image_path}`

    const date = new Date(isOfflineItem ? item.capturedAt : item.captured_at)
    const formattedDate = date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })

    // Status chips
    let statusText = ""
    let statusColor = "#94a3b8"
    let statusBg = "rgba(148,163,184,0.12)"

    if (isOfflineItem) {
      if (item.isSyncing) {
        statusText = language === 'hi' ? "🔄 सिंक हो रहा है…" : "🔄 Syncing…"
        statusColor = "#60a5fa"
        statusBg = "rgba(59,130,246,0.15)"
      } else {
        statusText = language === 'hi' ? "⏳ कतार में (ऑफलाइन)" : "⏳ Queued (Offline)"
        statusColor = "#fbbf24"
        statusBg = "rgba(251,191,36,0.15)"
      }
    } else {
      const apiStatus = item.status // PENDING_ML, PENDING_EXPERT, RESOLVED
      if (apiStatus === 'PENDING_ML') {
        statusText = language === 'hi' ? "🟢 सिंक किया गया (जांच लंबित)" : "🟢 Synced (ML Pending)"
        statusColor = "#34d399"
        statusBg = "rgba(52,211,153,0.15)"
      } else if (apiStatus === 'PENDING_EXPERT') {
        statusText = language === 'hi' ? "🔬 विशेषज्ञ जांच" : "🔬 Expert Validation"
        statusColor = "#c084fc"
        statusBg = "rgba(192,132,252,0.15)"
      } else {
        statusText = language === 'hi' ? "✅ निदान समाप्त" : "✅ Resolved"
        statusColor = "#4ade80"
        statusBg = "rgba(74,222,128,0.15)"
      }
    }

    return (
      <TouchableOpacity
        style={styles.card}
        testID={`report-item-${index}`}
        activeOpacity={0.75}
        onPress={() => router.push({ pathname: '/report-details', params: { id: item.id } })}
      >
        <Image source={{ uri: imageUrl }} style={styles.cardImage} />
        
        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardDate}>{formattedDate}</Text>
            {item.is_suspicious && (
              <View style={styles.suspiciousBadge}>
                <Text style={styles.suspiciousText}>⚠️ Flagged</Text>
              </View>
            )}
          </View>

          {/* Disease tag */}
          <Text style={styles.cardTitle}>
            {isOfflineItem 
              ? (language === 'hi' ? "विश्लेषण की प्रतीक्षा है..." : "Awaiting sync...") 
              : (item.disease_detected || (language === 'hi' ? "फसल रोग विश्लेषण लंबित" : "Diagnosis Pending (Phase 4)"))
            }
          </Text>

          {/* Coordinates display */}
          <Text style={styles.cardCoords}>
            📍 {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
          </Text>

          {/* Status badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusBg, borderColor: statusColor + '40' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  // Prepend offline items to the list
  const offlineItems = offlineQueue.map(r => ({ ...r, isOffline: true }))
  const combinedList = [...offlineItems, ...reports]

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t('myReports')}
        isSpeaking={isSpeaking}
        onSpeak={() => isSpeaking ? stop() : speakScreen('reports')}
      />

      {combinedList.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyTitle}>{t('noReports')}</Text>
          <Text style={styles.emptyHint}>
            {language === 'hi'
              ? 'पहली जांच के लिए फसल स्कैन टैब पर जाएं'
              : 'Go to Scan Crop tab to create your first report'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={combinedList}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
              tintColor="#4ade80"
              colors={["#4ade80"]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f0d' },
  list: { padding: 20, gap: 14, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    gap: 14,
    alignItems: 'center',
  },
  cardImage: {
    width: 86,
    height: 86,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  cardContent: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    color: 'rgba(240,253,244,0.45)',
    fontSize: 12,
    fontWeight: '500',
  },
  suspiciousBadge: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  suspiciousText: {
    color: '#ef4444',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: '#f0fdf4',
    fontSize: 16,
    fontWeight: '700',
  },
  cardCoords: {
    color: 'rgba(240,253,244,0.3)',
    fontSize: 11,
    fontWeight: '500',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 2,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 72 },
  emptyTitle: { color: '#f0fdf4', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  emptyHint:  { color: 'rgba(240,253,244,0.45)', fontSize: 15, textAlign: 'center', lineHeight: 22 },
})
