import axios from 'axios'

// @ts-ignore
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
const defaultApiUrl = isLocalhost ? 'http://localhost:3000/api' : '/api'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default api
