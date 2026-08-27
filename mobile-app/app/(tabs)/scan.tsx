/**
 * app/(tabs)/scan.tsx — Geotagged camera scan flow with client compression and offline queueing.
 */
import React, { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator, Alert,
} from 'react-native'
import { useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'

import { useLanguage } from '../../context/LanguageContext'
import { useSpeech } from '../../hooks/useSpeech'
import { useQueue } from '../../context/QueueContext'
import ScreenHeader from '../../components/ScreenHeader'

export default function ScanScreen() {
  const { t, language } = useLanguage()
  const { speakScreen, speak, stop, isSpeaking } = useSpeech()
  const { queueReport, isOffline } = useQueue()

  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => speakScreen('scan'), 600)
      return () => { clearTimeout(timer); stop() }
    }, [language])
  )

  const requestPermissions = async () => {
    // Request location foreground permission
    const { status: locStatus } = await Location.requestForegroundPermissionsAsync()
    if (locStatus !== 'granted') {
      const msg = language === 'hi'
        ? "⚠️ कृपया ऐप सेटिंग्स में जाकर लोकेशन की अनुमति चालू करें ताकि रिपोर्ट जियोटैग हो सके।"
        : "⚠️ Please enable location permissions in app settings to geotag your report."
      speak(msg)
      Alert.alert("Permission Denied", msg)
      return false
    }

    // Request camera permission
    const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync()
    if (camStatus !== 'granted') {
      const msg = language === 'hi'
        ? "⚠️ कृपया फोटो खींचने के लिए कैमरा अनुमति की अनुमति दें।"
        : "⚠️ Please grant camera permissions to capture crop photos."
      speak(msg)
      Alert.alert("Permission Denied", msg)
      return false
    }

    return true
  }

  const handleCapture = async (source: 'camera' | 'gallery') => {
    stop()
    const hasPerm = await requestPermissions()
    if (!hasPerm) return

    setLoading(true)
    setSuccessMsg(null)

    try {
      // 1. Get GPS Geotag info
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      const { latitude, longitude } = location.coords
      const capturedAt = new Date().toISOString()

      // 2. Launch ImagePicker (Camera or Media Library)
      let result: ImagePicker.ImagePickerResult
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.7, // client-side compression
          exif: true,
        })
      } else {
        const { status: galStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (galStatus !== 'granted') {
          setLoading(false)
          return
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.7, // client-side compression
          exif: true,
        })
      }

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setLoading(false)
        return
      }

      const imageUri = result.assets[0].uri

      // 3. Save report in local sync Queue
      await queueReport(imageUri, latitude, longitude, capturedAt)

      // 4. Vocalize success state
      let message = ""
      if (isOffline) {
        message = language === 'hi'
          ? "स्कैन सुरक्षित रूप से ऑफलाइन सहेज लिया गया है। नेटवर्क आने पर यह स्वतः भेज दिया जाएगा।"
          : "Saved offline. Your report will automatically synchronize when you are online."
      } else {
        message = language === 'hi'
          ? "फसल की फोटो सफलतापूर्वक अपलोड के लिए कतार में डाल दी गई है।"
          : "Report successfully queued for upload."
      }
      speak(message)
      setSuccessMsg(message)
      
      // Clear success overlay banner after 5 seconds
      setTimeout(() => setSuccessMsg(null), 5000)

    } catch (err: any) {
      console.error("Scan error:", err)
      const errAlert = language === 'hi'
        ? "जियोटैग फोटो लेने में त्रुटि हुई। कृपया पुनः प्रयास करें।"
        : "Failed to take geotagged photo. Please try again."
      speak(errAlert)
      Alert.alert("Error", errAlert)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t('scanCrop')}
        isSpeaking={isSpeaking}
        onSpeak={() => isSpeaking ? stop() : speakScreen('scan')}
      />

      <View style={styles.body}>
        {/* Success overlay alert */}
        {successMsg && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={24} color="#4ade80" />
            <Text style={styles.successText}>{successMsg}</Text>
          </View>
        )}

        {/* Action card / camera hub */}
        <View style={styles.cameraArea}>
          <View style={styles.cameraRing}>
            <View style={styles.cameraInner}>
              {loading ? (
                <ActivityIndicator size="large" color="#4ade80" />
              ) : (
                <Text style={styles.cameraEmoji}>📸</Text>
              )}
            </View>
          </View>
          <Text style={styles.hint}>
            {language === 'hi' ? 'फोटो लेने के लिए नीचे बटन दबाएं' : 'Select an option below to scan'}
          </Text>
        </View>

        {/* Interactive buttons row */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            testID="camera-scan-btn"
            style={[styles.btn, styles.cameraBtn, loading && styles.btnDisabled]}
            activeOpacity={0.8}
            onPress={() => handleCapture('camera')}
            disabled={loading}
          >
            <Ionicons name="camera" size={26} color="#052e16" />
            <Text style={styles.cameraBtnText}>
              {language === 'hi' ? 'कैमरा खोलें' : 'Use Camera'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="gallery-scan-btn"
            style={[styles.btn, styles.galleryBtn, loading && styles.btnDisabled]}
            activeOpacity={0.8}
            onPress={() => handleCapture('gallery')}
            disabled={loading}
          >
            <Ionicons name="images-outline" size={24} color="#4ade80" />
            <Text style={styles.galleryBtnText}>
              {language === 'hi' ? 'गैलरी से चुनें' : 'Choose Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Offline status indicator tag */}
        <View style={styles.phaseBadge}>
          <Text style={styles.phaseText}>
            {isOffline 
              ? (language === 'hi' ? "📱 ऑफलाइन मोड: कतार चालू है" : "📱 Offline mode: Queue active")
              : (language === 'hi' ? "🌐 ऑनलाइन मोड: ऑटो सिंक सक्षम है" : "🌐 Online mode: Auto sync enabled")}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f0d' },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  successBanner: {
    backgroundColor: 'rgba(74,222,128,0.12)',
    borderWidth: 1,
    borderColor: '#4ade80',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    position: 'absolute',
    top: 10,
    zIndex: 10,
  },
  successText: {
    color: '#f0fdf4',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  cameraArea: { alignItems: 'center', gap: 16 },
  cameraRing: {
    width: 170, height: 170,
    borderRadius: 85,
    borderWidth: 2,
    borderColor: 'rgba(74,222,128,0.2)',
    borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  cameraInner: {
    width: 130, height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(74,222,128,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(74,222,128,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  cameraEmoji: { fontSize: 52 },
  hint: { color: 'rgba(240,253,244,0.4)', fontSize: 14, textAlign: 'center', paddingHorizontal: 16 },
  buttonsRow: {
    width: '100%',
    gap: 14,
  },
  btn: {
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
  },
  btnDisabled: { opacity: 0.5 },
  cameraBtn: {
    backgroundColor: '#22c55e',
    ...Platform.select({
      ios:     { shadowColor: '#4ade80', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 6 },
    }),
  },
  cameraBtnText: { color: '#052e16', fontSize: 18, fontWeight: '800' },
  galleryBtn: {
    backgroundColor: 'rgba(74,222,128,0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(74,222,128,0.35)',
  },
  galleryBtnText: { color: '#4ade80', fontSize: 17, fontWeight: '700' },
  phaseBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16, paddingVertical: 8,
  },
  phaseText: { color: 'rgba(240,253,244,0.6)', fontSize: 13, fontWeight: '600' },
})
