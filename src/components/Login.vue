<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)
const router = useRouter()

const login = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await axios.post('http://localhost:3001/api/login', {
      email: email.value,
      password: password.value
    })
    
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    
    router.push('/')
  } catch (err) {
    errorMsg.value = 'Credenciales inválidas'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-pi-blue-900 to-pi-sky-400 text-pi-gray-700">
    <div class="bg-pi-white p-10 rounded-2xl w-full max-w-md shadow-2xl">
      <div class="flex flex-col items-center mb-8">
        <svg class="w-12 h-12 text-pi-blue-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
        <h2 class="text-2xl font-bold text-pi-blue-900 m-0">Incubadora ESP32</h2>
        <p class="text-sm text-pi-gray-700 mt-1">Panel de Control</p>
      </div>
      
      <form @submit.prevent="login" class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-pi-gray-700">Correo Electrónico</label>
          <input type="email" v-model="email" required placeholder="admin@admin.com" 
                 class="bg-pi-gray-100 border border-gray-300 px-4 py-3 rounded-lg text-pi-gray-700 focus:outline-none focus:ring-2 focus:ring-pi-sky-400 focus:border-transparent transition-all" />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-pi-gray-700">Contraseña</label>
          <input type="password" v-model="password" required placeholder="••••••••" 
                 class="bg-pi-gray-100 border border-gray-300 px-4 py-3 rounded-lg text-pi-gray-700 focus:outline-none focus:ring-2 focus:ring-pi-sky-400 focus:border-transparent transition-all" />
        </div>
        
        <div v-if="errorMsg" class="bg-red-100 text-pi-danger text-sm px-4 py-3 rounded-lg border border-red-200">
          {{ errorMsg }}
        </div>
        
        <button type="submit" :disabled="loading" 
                class="bg-pi-blue-700 hover:bg-pi-blue-900 text-white border-none py-3 px-4 rounded-lg text-base font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
          <span v-if="loading" class="animate-spin inline-block w-4 h-4 border-[2px] border-current border-t-transparent text-white rounded-full" role="status" aria-label="loading"></span>
          <span>{{ loading ? 'Ingresando...' : 'Iniciar Sesión' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>
