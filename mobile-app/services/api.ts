/**
 * services/api.ts — Axios instance for the mobile app.
 * Reads the API base URL from Expo config (app.json extra.apiBaseUrl).
 * Android emulator: use 10.0.2.2 to reach host machine's localhost.
 * Physical device: use your machine's local IP address.
 */
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

const BASE_URL = 'http://10.0.2.2:8000'   // override in .env or app.json for real device

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token from SecureStore on every request
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('crop_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch {
    // SecureStore unavailable on web — skip
  }
  return config
})

// ── Auth helpers ──────────────────────────────────────────────────────────────

export const sendOTP = (phone: string) =>
  api.post('/auth/send-otp', { phone })

export const verifyOTP = (phone: string, code: string) =>
  api.post('/auth/verify-otp', { phone, code })

export const registerFarmer = (data: {
  phone: string
  code: string
  role: string
  name: string
  village: string
  block: string
  district: string
  preferred_language: string
}) => api.post('/auth/register/farmer', data)

export const getMyProfile = () => api.get('/users/me')

// ── Reports helpers ────────────────────────────────────────────────────────────

export const uploadReport = (formData: FormData) =>
  api.post('/reports/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const getMyReports = () => api.get('/reports/')

export default api
