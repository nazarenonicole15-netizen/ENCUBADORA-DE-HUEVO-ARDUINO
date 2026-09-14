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
  <div class="login-container">
    <div class="login-card">
      <div class="logo">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
        <h2>Incubadora ESP32</h2>
      </div>
      
      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="email" required placeholder="admin@admin.com" />
        </div>
        <div class="form-group">
          <label>Contraseña</label>
          <input type="password" v-model="password" required placeholder="••••••••" />
        </div>
        
        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        
        <button type="submit" :disabled="loading" class="btn-primary">
          {{ loading ? 'Ingresando...' : 'Iniciar Sesión' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0f172a;
  color: #f8fafc;
}

.login-card {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2.5rem;
  border-radius: 1rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

.logo svg {
  width: 3rem;
  height: 3rem;
  color: #818cf8;
  margin-bottom: 1rem;
}

.logo h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-size: 0.875rem;
  color: #cbd5e1;
}

input {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  color: white;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #818cf8;
}

.error-msg {
  color: #ef4444;
  font-size: 0.875rem;
  background: rgba(239, 68, 68, 0.1);
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.btn-primary {
  background: linear-gradient(to right, #6366f1, #a855f7);
  color: white;
  border: none;
  padding: 0.875rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
