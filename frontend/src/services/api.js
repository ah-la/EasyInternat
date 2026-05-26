import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { Accept: 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.clear()
      if (window.location.pathname !== '/') window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default api

export function apiUrl(path) {
  const base = import.meta.env.VITE_API_URL || '/api'
  return `${base}${path}`
}
