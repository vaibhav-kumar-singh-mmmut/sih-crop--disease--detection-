/**
 * app/report-details.tsx — Detailed view of crop scan analysis and advisory treatments.
 * Supports localized descriptions, progress rings, TTS narration read-alouds, and offline caching.
 */
import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Platform
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Speech from 'expo-speech'

import { useLanguage } from '../context/LanguageContext'
import { useQueue } from '../context/QueueContext'
import { useSpeech } from '../hooks/useSpeech'
import { CROP_ADVISORIES, AdvisoryDetails } from '../constants/advisory'
import ScreenHeader from '../components/ScreenHeader'

const CACHE_KEY = "reports_list_cache"

export default function ReportDetailsScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { t, language } = useLanguage()
  const { offlineQueue } = useQueue()
  const { speak, stop, isSpeaking } = useSpeech()

  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      if (!id) {
        setLoading(false)
        return
      }

      // 1. Try to find in local offline queue first
      const offlineItem = offlineQueue.find(r => r.id === id)
      if (offlineItem) {
        setReport({
          id: offlineItem.id,
          imageUri: offlineItem.imageUri,
          latitude: offlineItem.latitude,
          longitude: offlineItem.longitude,
          capturedAt: offlineItem.capturedAt,
          isOffline: true,
          disease_detected: null,
          confidence: null,
          status: "PENDING_ML"
        })
        setLoading(false)
        return
      }

      // 2. Try to find in AsyncStorage reports list cache
      try {
        const stored = await AsyncStorage.getItem(CACHE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          const matched = parsed.find((r: any) => r.id === id)
          if (matched) {
            setReport({
              ...matched,
              imageUri: `http://10.0.2.2:8000${matched.image_path}`,
              isOffline: false
            })
            setLoading(false)
            return
          }
        }
      } catch (ex) {
        console.error("Cache load error in details:", ex)
      }

      setLoading(false)
    })()
  }, [id, offlineQueue])

  // Stop speaking when leaving screen
  useEffect(() => {
    return () => {
      stop()
    }
  }, [])

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    )
  }

  if (!report) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Report not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const isOfflineItem = report.isOffline
  const diseaseKey = report.disease_detected || "Healthy"
  
  // Fetch localized advisory strings
  const cropAdvisory: AdvisoryDetails = (CROP_ADVISORIES as any)[diseaseKey]?.[language] || 
                                        (CROP_ADVISORIES as any)[diseaseKey]?.['en'] || {
                                          name: diseaseKey,
                                          desc: "Crop analysis is pending sync.",
                                          chemical: "N/A",
                                          cultural: "N/A",
                                          biological: "N/A"
                                        }

  const handleSpeech = () => {
    if (isSpeaking) {
      stop()
      return
    }

    // Build speech text depending on status
    let speechText = ""
    if (isOfflineItem) {
      speechText = language === 'hi'
        ? "यह रिपोर्ट अभी सिंक नहीं हुई है। उपचार की सलाह इंटरनेट सिंक होने के बाद उपलब्ध होगी।"
        : "This report has not been synced yet. Advisory details will be generated once synced."
    } else {
      speechText = language === 'hi'
        ? `निदान है: ${cropAdvisory.name}। विवरण: ${cropAdvisory.desc}। रासायनिक उपचार: ${cropAdvisory.chemical}। जैविक उपचार: ${cropAdvisory.biological}। सांस्कृतिक उपचार: ${cropAdvisory.cultural}`
        : `Diagnosis is: ${cropAdvisory.name}. Description: ${cropAdvisory.desc}. Chemical control: ${cropAdvisory.chemical}. Biological control: ${cropAdvisory.biological}. Cultural control: ${cropAdvisory.cultural}`
    }

    speak(speechText)
  }

  const confidencePct = report.confidence ? Math.round(report.confidence * 100) : 0

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={isOfflineItem ? t('noReports') : cropAdvisory.name}
        showBack
        isSpeaking={isSpeaking}
        onSpeak={handleSpeech}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Crop photo */}
        <Image source={{ uri: report.imageUri }} style={styles.cropImage} />

        {/* Status banner */}
        {isOfflineItem ? (
          <View style={styles.syncBanner}>
            <Ionicons name="cloud-offline" size={22} color="#fbbf24" />
            <Text style={styles.syncBannerText}>
              {language === 'hi' 
                ? "यह रिपोर्ट स्थानीय रूप से सहेजी गई है। इंटरनेट उपलब्ध होने पर सिंक होगी।"
                : "This report is saved locally. It will sync once internet is available."}
            </Text>
          </View>
        ) : (
          <View style={styles.metricsContainer}>
            {/* Confidence Progress Ring/Bar */}
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>
                {language === 'hi' ? "सटीकता दर (Confidence)" : "Confidence Rate"}
              </Text>
              <View style={styles.progressRow}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${confidencePct}%` }]} />
                </View>
                <Text style={styles.progressPct}>{confidencePct}%</Text>
              </View>
            </View>

            {/* GPS details */}
            <View style={styles.coordsCard}>
              <Ionicons name="location-outline" size={18} color="rgba(240,253,244,0.5)" />
              <Text style={styles.coordsText}>
                📍 {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
              </Text>
            </View>
          </View>
        )}

        {/* Diagnosis overview */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ℹ️ {language === 'hi' ? "बीमारी का सारांश" : "Disease Summary"}</Text>
          <Text style={styles.cardText}>
            {isOfflineItem 
              ? (language === 'hi' ? "रिपोर्ट कतार में है। सर्वर सिंक का इंतजार करें।" : "Report queued. Awaiting server sync analysis.") 
              : cropAdvisory.desc
            }
          </Text>
        </View>

        {!isOfflineItem && (
          <>
            {/* Speak advisory button */}
            <TouchableOpacity style={styles.speakAdvisoryBtn} onPress={handleSpeech} activeOpacity={0.8}>
              <Ionicons name={isSpeaking ? "volume-mute" : "volume-high"} size={22} color="#052e16" />
              <Text style={styles.speakAdvisoryBtnText}>
                {isSpeaking 
                  ? (language === 'hi' ? "आवाज़ बंद करें" : "Mute Narration")
                  : (language === 'hi' ? "उपचार की सलाह सुनें" : "Listen to Advisory")}
              </Text>
            </TouchableOpacity>

            {/* Chemical Treatment */}
            <View style={[styles.card, styles.cardChemical]}>
              <Text style={[styles.cardTitle, { color: '#f87171' }]}>🧪 {language === 'hi' ? "रासायनिक उपचार" : "Chemical Control"}</Text>
              <Text style={styles.cardText}>{cropAdvisory.chemical}</Text>
            </View>

            {/* Biological Treatment */}
            <View style={[styles.card, styles.cardBiological]}>
              <Text style={[styles.cardTitle, { color: '#c084fc' }]}>🦠 {language === 'hi' ? "जैविक उपचार" : "Biological Control"}</Text>
              <Text style={styles.cardText}>{cropAdvisory.biological}</Text>
            </View>

            {/* Cultural Treatment */}
            <View style={[styles.card, styles.cardCultural]}>
              <Text style={[styles.cardTitle, { color: '#60a5fa' }]}>🌾 {language === 'hi' ? "सांस्कृतिक / कृषि कार्य" : "Cultural Control"}</Text>
              <Text style={styles.cardText}>{cropAdvisory.cultural}</Text>
            </View>
          </>
        )}

        {/* Report Flag Warning */}
        {report.is_suspicious && (
          <View style={styles.flagCard}>
            <Ionicons name="warning" size={24} color="#ef4444" />
            <View style={{ flex: 1 }}>
              <Text style={styles.flagTitle}>Flagged for Auditing</Text>
              <Text style={styles.flagText}>{report.suspicion_reason}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f0d' },
  centerContainer: { flex: 1, backgroundColor: '#0a0f0d', alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText: { color: 'rgba(240,253,244,0.5)', fontSize: 16 },
  backBtn: {
    paddingVertical: 12, paddingHorizontal: 24,
    backgroundColor: '#22c55e', borderRadius: 14,
  },
  backBtnText: { color: '#052e16', fontWeight: '700' },

  scroll: { padding: 20, gap: 18, paddingBottom: 40 },
  cropImage: {
    width: '100%', height: 220,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },

  syncBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(251,191,36,0.08)',
    borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(251,191,36,0.2)',
    padding: 16,
  },
  syncBannerText: { color: '#fbbf24', fontSize: 13, fontWeight: '600', flex: 1, lineHeight: 18 },

  metricsContainer: { flexDirection: 'row', gap: 12 },
  metricCard: {
    flex: 1.4,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    padding: 14, gap: 6,
  },
  metricLabel: { color: 'rgba(240,253,244,0.4)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBarBg: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#22c55e', borderRadius: 4 },
  progressPct: { color: '#f0fdf4', fontSize: 13, fontWeight: '700' },
  coordsCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    padding: 14, alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  coordsText: { color: 'rgba(240,253,244,0.6)', fontSize: 13, fontWeight: '600' },

  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    padding: 20, gap: 8,
  },
  cardChemical:   { backgroundColor: 'rgba(239,68,68,0.05)',   borderColor: 'rgba(239,68,68,0.15)' },
  cardBiological: { backgroundColor: 'rgba(192,132,252,0.05)', borderColor: 'rgba(192,132,252,0.15)' },
  cardCultural:   { backgroundColor: 'rgba(59,130,246,0.05)',  borderColor: 'rgba(59,130,246,0.15)' },

  cardTitle: { color: '#f0fdf4', fontSize: 16, fontWeight: '800' },
  cardText:  { color: 'rgba(240,253,244,0.7)', fontSize: 14, lineHeight: 22 },

  speakAdvisoryBtn: {
    backgroundColor: '#22c55e',
    borderRadius: 16, padding: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    ...Platform.select({
      ios:     { shadowColor: '#4ade80', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 6 },
    }),
  },
  speakAdvisoryBtnText: { color: '#052e16', fontSize: 16, fontWeight: '800' },

  flagCard: {
    flexDirection: 'row', gap: 12, padding: 16,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.2)',
  },
  flagTitle: { color: '#ef4444', fontSize: 14, fontWeight: '700' },
  flagText:  { color: 'rgba(240,253,244,0.5)', fontSize: 12, marginTop: 2, lineHeight: 18 },
})
