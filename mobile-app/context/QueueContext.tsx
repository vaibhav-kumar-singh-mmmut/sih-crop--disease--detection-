/**
 * context/QueueContext.tsx
 * Manages the local offline queue for crop reports.
 * Listens to network connectivity changes and synchronizes queued reports.
 */
import React, {
  createContext, useContext, useState, useEffect, useCallback, ReactNode,
} from 'react'
import NetInfo from '@react-native-community/netinfo'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as FileSystem from 'expo-file-system'
import { uploadReport } from '../services/api'
import { useAuth } from './AuthContext'

export interface QueuedReport {
  id: string
  imageUri: string
  latitude: number
  longitude: number
  capturedAt: string
  isSyncing?: boolean
  error?: string
}

interface QueueContextType {
  offlineQueue: QueuedReport[]
  isOffline: boolean
  queueReport: (imageUri: string, lat: number, lng: number, capturedAt: string) => Promise<string>
  syncQueue: () => Promise<void>
  isSyncingAll: boolean
}

const QueueContext = createContext<QueueContextType | null>(null)
const QUEUE_KEY = "offline_reports_queue"
const REPORT_DIR = `${FileSystem.documentDirectory}reports/`

export function QueueProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [offlineQueue, setOfflineQueue] = useState<QueuedReport[]>([])
  const [isOffline, setIsOffline] = useState(false)
  const [isSyncingAll, setIsSyncingAll] = useState(false)

  // 1. Listen for network connectivity status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      // Connect check: must be connected AND internet reachable (or not false)
      const offline = !(state.isConnected && state.isInternetReachable !== false)
      setIsOffline(offline)
    })
    return unsubscribe
  }, [])

  // 2. Load queue on startup or auth token change
  useEffect(() => {
    ;(async () => {
      try {
        const stored = await AsyncStorage.getItem(QUEUE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored) as QueuedReport[]
          // Clean up any isSyncing flag from previous run
          const cleaned = parsed.map(r => ({ ...r, isSyncing: false }))
          setOfflineQueue(cleaned)
        }
      } catch (ex) {
        console.error("Failed to load offline queue:", ex)
      }
    })()
  }, [])

  // 3. Auto-sync queue when we go online and have a token
  useEffect(() => {
    if (!isOffline && token && offlineQueue.length > 0 && !isSyncingAll) {
      syncQueue()
    }
  }, [isOffline, token, offlineQueue.length])

  // 4. Helper to queue a report offline
  const queueReport = useCallback(async (
    imageUri: string,
    lat: number,
    lng: number,
    capturedAt: string
  ): Promise<string> => {
    const id = `${Date.now()}-${Math.floor(Math.random() * 1000)}`
    
    // Ensure document directory exists
    const dirInfo = await FileSystem.getInfoAsync(REPORT_DIR)
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(REPORT_DIR, { intermediates: true })
    }

    // Move file to persistent storage
    const fileExt = imageUri.split('.').pop() || 'jpg'
    const newUri = `${REPORT_DIR}${id}.${fileExt}`
    await FileSystem.copyAsync({ from: imageUri, to: newUri })

    const newReport: QueuedReport = {
      id,
      imageUri: newUri,
      latitude: lat,
      longitude: lng,
      capturedAt,
      isSyncing: false
    }

    const updatedQueue = [...offlineQueue, newReport]
    setOfflineQueue(updatedQueue)
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updatedQueue))
    return id
  }, [offlineQueue])

  // 5. Sync queue to server
  const syncQueue = useCallback(async () => {
    if (isOffline || !token || offlineQueue.length === 0 || isSyncingAll) return

    setIsSyncingAll(true)
    const currentQueue = [...offlineQueue]
    const updatedQueue = [...offlineQueue]

    for (let i = 0; i < currentQueue.length; i++) {
      const item = currentQueue[i]
      if (item.isSyncing) continue

      // Mark item as syncing
      const indexInState = updatedQueue.findIndex(r => r.id === item.id)
      if (indexInState !== -1) {
        updatedQueue[indexInState].isSyncing = true
        setOfflineQueue([...updatedQueue])
      }

      // Prepare Form Data
      const formData = new FormData()
      formData.append('latitude', String(item.latitude))
      formData.append('longitude', String(item.longitude))
      formData.append('captured_at', item.capturedAt)

      // In react-native / expo, we cast file object like this:
      const filename = item.imageUri.split('/').pop() || 'report.jpg'
      const filePayload = {
        uri: item.imageUri,
        name: filename,
        type: 'image/jpeg'
      } as any

      formData.append('file', filePayload)

      try {
        await uploadReport(formData)
        
        // Success -> Delete local file and remove from queue
        await FileSystem.deleteAsync(item.imageUri, { immigrant: true }).catch(() => {})
        
        const filterIdx = updatedQueue.findIndex(r => r.id === item.id)
        if (filterIdx !== -1) {
          updatedQueue.splice(filterIdx, 1)
          setOfflineQueue([...updatedQueue])
          await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updatedQueue))
        }
      } catch (err: any) {
        console.error(`Sync failed for report ${item.id}:`, err)
        
        // If it's a validation error (400) like missing EXIF/GPS, remove from queue to avoid blockages
        const errStatus = err.response?.status
        if (errStatus === 400) {
          await FileSystem.deleteAsync(item.imageUri, { immigrant: true }).catch(() => {})
          const filterIdx = updatedQueue.findIndex(r => r.id === item.id)
          if (filterIdx !== -1) {
            updatedQueue.splice(filterIdx, 1)
            setOfflineQueue([...updatedQueue])
            await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updatedQueue))
          }
        } else {
          // General connection failure -> reset syncing state to retry later
          const filterIdx = updatedQueue.findIndex(r => r.id === item.id)
          if (filterIdx !== -1) {
            updatedQueue[filterIdx].isSyncing = false
            updatedQueue[filterIdx].error = err.response?.data?.detail || "Connection lost"
            setOfflineQueue([...updatedQueue])
          }
        }
      }
    }
    setIsSyncingAll(false)
  }, [offlineQueue, isOffline, token, isSyncingAll])

  return (
    <QueueContext.Provider value={{
      offlineQueue, isOffline, queueReport, syncQueue, isSyncingAll
    }}>
      {children}
    </QueueContext.Provider>
  )
}

export function useQueue() {
  const ctx = useContext(QueueContext)
  if (!ctx) throw new Error('useQueue must be used inside <QueueProvider>')
  return ctx
}
