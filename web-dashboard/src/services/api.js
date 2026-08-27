import axios from 'axios'

/**
 * Axios instance pre-configured for the Crop Health API.
 * - Automatically attaches JWT token from localStorage.
 * - Redirects to /login on 401 responses.
 */
const api = axios.create({
  baseURL: '/',   // Vite proxy forwards /auth and /users to FastAPI
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach Bearer token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crop_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — clear auth state on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('crop_token')
      localStorage.removeItem('crop_role')
      localStorage.removeItem('crop_user_id')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth API calls ────────────────────────────────────────────────────────────

export const sendOTP = (phone) =>
  api.post('/auth/send-otp', { phone })

export const verifyOTP = (phone, code) =>
  api.post('/auth/verify-otp', { phone, code })

export const registerFarmer = (data) =>
  api.post('/auth/register/farmer', data)

export const registerOfficer = (data) =>
  api.post('/auth/register/officer', data)

export const getMyProfile = () =>
  api.get('/users/me')

// ── Expert API calls ───────────────────────────────────────────────────────────

export const getExpertQueue = () =>
  api.get('/expert/queue')

export const validateReport = (reportId, payload) =>
  api.post(`/expert/validate/${reportId}`, payload)

export const getExpertStats = () =>
  api.get('/expert/stats')

// ── Officer API calls ──────────────────────────────────────────────────────────

export const getOfficerReports = (params) =>
  api.get('/officer/reports', { params })

export const getOfficerStats = (params) =>
  api.get('/officer/stats', { params })

export default api
