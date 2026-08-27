/**
 * app/(tabs)/index.tsx — Farmer/Pradhan Home Screen (Phase 2 redesign)
 *
 * Features:
 * - Auto-speaks home screen TTS script on focus
 * - 2×2 large action card grid (Scan Crop, My Reports, Weather Alert, Ask Expert)
 * - Welcome message with user name + village in selected language
 * - Language switcher shortcut in header
 * - Speaker button to re-play TTS narration
 */
import React, { useEffect, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useSpeech } from '../../hooks/useSpeech'
import { useQueue } from '../../context/QueueContext'
import ActionCard from '../../components/ActionCard'
import SpeakerButton from '../../components/SpeakerButton'

const ACTIONS = [
  {
    key: 'scan',
    emoji:     '📸',
    labelKey:  'scanCrop',
    subLabel:  { hi: 'फसल की बीमारी पहचानें', en: 'Detect crop disease', mr: 'फसल रोग ओळखा', pa: 'ਫਸਲ ਰੋਗ ਪਛਾਣੋ', te: 'పంట వ్యాధి గుర్తించండి', ta: 'பயிர் நோயை கண்டறியுங்கள்', kn: 'ಬೆಳೆ ರೋಗ ಗುರುತಿಸಿ', gu: 'પાક રોગ ઓળखو', bn: 'ফসলের রোগ সনাক্ত করুন', or: 'ଫସଲ ରୋଗ ଚିହ୍ନଟ' },
    color:    '#4ade80',
    route:    '/(tabs)/scan',
    isComingSoon: true,
  },
  {
    key: 'reports',
    emoji:     '📋',
    labelKey:  'myReports',
    subLabel:  { hi: 'पिछली जांच देखें', en: 'View past diagnoses', mr: 'मागील तपासणी', pa: 'ਪਿਛਲੀਆਂ ਜਾਂਚਾਂ', te: 'గత నివేదికలు', ta: 'கடந்த கால பரிசோதனைகள்', kn: 'ಹಿಂದಿನ ವರದಿಗಳು', gu: 'ભૂતકાળની તપاسో', bn: 'পূর্ববর্তী রিপোর্ট', or: 'ଅତୀତ ରିପୋର୍ଟ' },
    color:    '#60a5fa',
    route:    '/(tabs)/reports',
    isComingSoon: true,
  },
  {
    key: 'weather',
    emoji:     '🌦️',
    labelKey:  'weatherAlert',
    subLabel:  { hi: 'रोग का खतरा जानें', en: 'Disease risk forecast', mr: 'रोग धोका अंदाज', pa: 'ਰੋਗ ਖਤਰਾ ਭਵਿੱਖਬਾਣੀ', te: 'వ్యాధి ప్రమాద అంచనా', ta: 'நோய் அபாய கணிப்பு', kn: 'ರೋಗ ಅಪಾಯ ಮುನ್ಸೂಚನೆ', gu: 'રોગ જોخیم અನुমান', bn: 'রোগ ঝুঁকি পূর্বাভাস', or: 'ରୋଗ ଆଶଙ୍କା ପୂର୍ବାନୁମାନ' },
    color:    '#fbbf24',
    route:    '/(tabs)/weather',
    isComingSoon: true,
  },
  {
    key: 'expert',
    emoji:     '🔬',
    labelKey:  'askExpert',
    subLabel:  { hi: 'विशेषज्ञ से सलाह लें', en: 'Get expert advice', mr: 'तज्ञांचा सल्ला घ्या', pa: 'ਮਾਹਰ ਦੀ ਸਲਾਹ ਲਓ', te: 'నిపుణుని సలహా తీసుకోండి', ta: 'நிபுணரின் ஆலோசனை பெறுங்கள்', kn: 'ತಜ್ಞರ ಸಲಹೆ ಪಡೆಯಿರಿ', gu: 'નિष्णातな सলाह मेળवो', bn: 'বিশেষজ্ঞের পরামর্শ নিন', or: 'ବିଶେଷଜ୍ଞ ପରାମର୍ଶ ନିଅ' },
    color:    '#c084fc',
    route:    '/(tabs)/ask-expert',
    isComingSoon: false,
  },
]

export default function HomeScreen() {
  const { user, role, logout } = useAuth()
  const { t, language, isFirstLaunch } = useLanguage()
  const { speakScreen, stop, isSpeaking } = useSpeech()
  const { offlineQueue } = useQueue()
  const router = useRouter()

  // Auto-speak home script when screen gains focus
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        speakScreen('home')
      }, 600) // small delay for screen transition to settle
      return () => {
        clearTimeout(timer)
        stop()
      }
    }, [language]) // re-speak when language changes
  )

  const handleSpeak = () => {
    if (isSpeaking) stop()
    else speakScreen('home')
  }

  const getSubLabel = (action: typeof ACTIONS[0]) =>
    (action.subLabel as any)[language] ?? (action.subLabel as any)['en'] ?? ''

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={{ fontSize: 26 }}>🌿</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>
              {t('welcome')}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
            </Text>
            <Text style={styles.greetingSub} numberOfLines={1}>
              {user?.village ? `${user.village}, ${user.district}` : 'Crop Health Advisory'}
            </Text>
          </View>
          <SpeakerButton isSpeaking={isSpeaking} onPress={handleSpeak} size={44} />
        </View>

        {/* ── Role + Language row ── */}
        <View style={styles.metaRow}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{role}</Text>
          </View>
          <TouchableOpacity
            testID="change-language-btn"
            style={styles.langBtn}
            onPress={() => router.push('/language-select')}
            activeOpacity={0.7}
          >
            <Ionicons name="language-outline" size={14} color="#4ade80" />
            <Text style={styles.langBtnText}>{language.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Status banner ── */}
        <View style={[styles.banner, offlineQueue.length > 0 && styles.bannerWarning]}>
          <Text style={styles.bannerIcon}>{offlineQueue.length > 0 ? "⏳" : "📸"}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerTitle, offlineQueue.length > 0 && { color: '#fbbf24' }]}>
              {offlineQueue.length > 0 
                ? (language === 'hi' ? "ऑफ़लाइन सिंक चालू है" : "Offline Sync Active")
                : (language === 'hi' ? "फसल जांच तैयार है" : "Crop Scan Active")}
            </Text>
            <Text style={styles.bannerSub}>
              {offlineQueue.length > 0 
                ? (language === 'hi' ? `${offlineQueue.length} स्कैन इंटरनेट की प्रतीक्षा कर रहे हैं` : `${offlineQueue.length} scan(s) waiting for internet to sync`)
                : (language === 'hi' ? "अपनी फसल का फोटो खींचकर रोग की जांच करें" : "Tap 'Scan Crop' below to diagnose leaf disease")}
            </Text>
          </View>
        </View>

        {/* ── Action grid ── */}
        <View style={styles.grid}>
          {ACTIONS.map((action, i) => (
            <ActionCard
              key={action.key}
              testID={`action-${action.key}`}
              emoji={action.emoji}
              label={t(action.labelKey)}
              subLabel={getSubLabel(action)}
              color={action.color}
              isComingSoon={action.isComingSoon}
              onPress={() => router.push(action.route as any)}
            />
          ))}
        </View>

        {/* ── Logout ── */}
        <TouchableOpacity
          testID="logout-btn"
          style={styles.logoutBtn}
          onPress={() => { stop(); logout() }}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={18} color="rgba(240,253,244,0.4)" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f0d' },
  scroll:    { padding: 20, paddingTop: 52, gap: 18, paddingBottom: 32 },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  logoBox: {
    width: 52, height: 52, backgroundColor: '#16a34a',
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#4ade80', shadowOpacity: 0.35, shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 }, elevation: 8,
  },
  greeting:    { color: '#f0fdf4', fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  greetingSub: { color: 'rgba(240,253,244,0.45)', fontSize: 13, marginTop: 2 },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  roleBadge: {
    paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: 'rgba(74,222,128,0.1)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(74,222,128,0.2)',
  },
  roleBadgeText: { color: '#4ade80', fontSize: 11, fontWeight: '700' },
  langBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: 'rgba(74,222,128,0.06)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(74,222,128,0.15)',
  },
  langBtnText: { color: '#4ade80', fontSize: 11, fontWeight: '700' },

  banner: {
    backgroundColor: 'rgba(74,222,128,0.07)',
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(74,222,128,0.18)',
    padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  bannerWarning: {
    backgroundColor: 'rgba(245,158,11,0.07)',
    borderColor: 'rgba(245,158,11,0.18)',
  },
  bannerIcon:  { fontSize: 26 },
  bannerTitle: { color: '#4ade80', fontWeight: '700', fontSize: 14 },
  bannerSub:   { color: 'rgba(240,253,244,0.45)', fontSize: 12, marginTop: 2 },

  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 14,
  },

  logoutBtn: {
    marginTop: 8, padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  logoutText: { color: 'rgba(240,253,244,0.4)', fontWeight: '600', fontSize: 14 },
})
