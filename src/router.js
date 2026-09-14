import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from './components/Dashboard.vue'
import Login from './components/Login.vue'
import AdminUsers from './components/AdminUsers.vue'

const routes = [
  { path: '/login', component: Login },
  { path: '/', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/admin/users', component: AdminUsers, meta: { requiresAuth: true, requiresAdmin: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Helper to check if token is valid and not expired
const isTokenValid = (token) => {
  if (!token) return false
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp && payload.exp * 1000 > Date.now()
  } catch (e) {
    return false
  }
}

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  if (to.meta.requiresAuth && !isTokenValid(token)) {
    // Token missing or expired — clean up and redirect to login
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return '/login'
  } else if (to.meta.requiresAdmin && user.role !== 'ADMIN') {
    return '/'
  } else if (to.path === '/login' && isTokenValid(token)) {
    // Already logged in — redirect away from login page
    return '/'
  }
  // Allow navigation (implicit return)
})

export default router
