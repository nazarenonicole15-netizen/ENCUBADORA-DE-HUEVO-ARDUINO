import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// --- Global Axios Interceptor for session persistence ---
// If any API call returns 401 (token expired/invalid), clear session and redirect to login
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Avoid redirect loop if already on login page
      if (router.currentRoute.value.path !== '/login') {
        router.push('/login')
      }
    }
    return Promise.reject(error)
  }
)

// --- Check token expiry on app startup ---
const token = localStorage.getItem('token')
if (token) {
  try {
    // JWT payload is the second base64 segment
    const payload = JSON.parse(atob(token.split('.')[1]))
    // exp is in seconds, Date.now() in milliseconds
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  } catch (e) {
    // Malformed token — clear it
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}

const app = createApp(App)
app.use(router)
app.mount('#app')
