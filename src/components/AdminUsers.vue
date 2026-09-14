<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const users = ref([])
const loading = ref(true)
const showForm = ref(false)

const newUser = ref({ nombre: '', email: '', password: '', role: 'CLIENTE' })
const errorMsg = ref('')

const settings = ref({ temp_min: 0, temp_max: 0, hum_min: 0, hum_max: 0, start_date: null, bird_type: 'gallina' })
const settingsMsg = ref('')
const activeTab = ref('gallina')

const birdData = {
  gallina: { 
    name: 'Gallina', 
    total: '21 días',
    schedule: [
      { day: 1, temp: '37.5-38 ºC', hum: '55-60%', action: '' },
      { day: 2, temp: '37.5-38 ºC', hum: '55-60%', action: '' },
      { day: 3, temp: '37.5-38 ºC', hum: '55-60%', action: 'Iniciar volteo' },
      { day: 4, temp: '37.5-38 ºC', hum: '55-60%', action: 'volteo' },
      { day: 5, temp: '37.5-38 ºC', hum: '55-60%', action: 'volteo' },
      { day: 6, temp: '37.5-38 ºC', hum: '55-60%', action: 'volteo' },
      { day: 7, temp: '37.5-38 ºC', hum: '55-60%', action: 'volteo' },
      { day: 8, temp: '37.5-38 ºC', hum: '55-60%', action: 'volteo' },
      { day: 9, temp: '37.5-38 ºC', hum: '55-60%', action: 'volteo' },
      { day: 10, temp: '37.5-38 ºC', hum: '55-60%', action: 'volteo' },
      { day: 11, temp: '37.5-38 ºC', hum: '55-60%', action: 'volteo' },
      { day: 12, temp: '37.5-38 ºC', hum: '55-60%', action: 'volteo' },
      { day: 13, temp: '37.5-38 ºC', hum: '55-60%', action: 'volteo' },
      { day: 14, temp: '37.5-38 ºC', hum: '55-60%', action: 'volteo' },
      { day: 15, temp: '37.5-38 ºC', hum: '55-60%', action: 'volteo' },
      { day: 16, temp: '37.5-38 ºC', hum: '55-60%', action: 'volteo' },
      { day: 17, temp: '37.5-38 ºC', hum: '55-60%', action: '' },
      { day: 18, temp: '35-36 ºC', hum: '55-60%', action: 'Fin volteo, Incrementar entrada de O2' },
      { day: 19, temp: '35-36 ºC', hum: '70-80%', action: '' },
      { day: 20, temp: '35-36 ºC', hum: '70-80%', action: '' },
      { day: 21, temp: '35-36 ºC', hum: '70-80%', action: 'Eclosión' }
    ]
  },
  codorniz: { name: 'Codorniz', temp: '37.5 - 37.8 °C', hum1: '45% - 50%', hum2: '65% - 70%', days1: '1 al 14', days2: '15 al 17 (Eclosión)', total: '17 días' },

  ganso: { name: 'Ganso', temp: '37.2 - 37.6 °C', hum1: '50% - 55%', hum2: '70% - 75%', days1: '1 al 27', days2: '28 al 30 (Eclosión)', total: '30 días' },
  pavo: { name: 'Pavo', temp: '37.5 - 37.7 °C', hum1: '50% - 55%', hum2: '65% - 70%', days1: '1 al 25', days2: '26 al 28 (Eclosión)', total: '28 días' },
  pato: { name: 'Pato', temp: '37.5 - 37.7 °C', hum1: '55% - 60%', hum2: '65% - 70%', days1: '1 al 25', days2: '26 al 28 (Eclosión)', total: '28 días' }
}

// Helper to get fresh token/headers on every API call (prevents stale token issues)
const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

const fetchUsers = async () => {
  try {
    const res = await axios.get('http://localhost:3001/api/users', getAuthHeaders())
    users.value = res.data
  } catch (err) {
    console.error('Error fetching users:', err)
  } finally {
    loading.value = false
  }
}

const createUser = async () => {
  errorMsg.value = ''
  try {
    await axios.post('http://localhost:3001/api/users', newUser.value, getAuthHeaders())
    showForm.value = false
    newUser.value = { nombre: '', email: '', password: '', role: 'CLIENTE' }
    fetchUsers()
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Error al crear usuario'
  }
}

const deleteUser = async (id) => {
  if (!confirm('¿Estás seguro de eliminar este usuario?')) return
  try {
    await axios.delete(`http://localhost:3001/api/users/${id}`, getAuthHeaders())
    fetchUsers()
  } catch (err) {
    console.error('Error deleting user:', err)
  }
}

const fetchSettings = async () => {
  try {
    const res = await axios.get('http://localhost:3001/api/settings', getAuthHeaders())
    if (res.data) settings.value = res.data
  } catch (err) {
    console.error('Error fetching settings:', err)
  }
}

const updateSettings = async () => {
  settingsMsg.value = ''
  try {
    await axios.post('http://localhost:3001/api/settings', settings.value, getAuthHeaders())
    settingsMsg.value = 'Configuración actualizada exitosamente'
    setTimeout(() => settingsMsg.value = '', 3000)
  } catch (err) {
    settingsMsg.value = 'Error al actualizar'
  }
}

const startCycle = async (type) => {
  if (!confirm(`¿Iniciar nuevo ciclo de incubación para: ${type}?`)) return
  try {
    await axios.post('http://localhost:3001/api/settings/start', { bird_type: type }, getAuthHeaders())
    fetchSettings()
    alert('Ciclo iniciado exitosamente')
  } catch (err) {
    console.error(err)
  }
}

const stopCycle = async () => {
  if (!confirm('¿Detener el ciclo actual?')) return
  try {
    await axios.post('http://localhost:3001/api/settings/stop', {}, getAuthHeaders())
    fetchSettings()
    alert('Ciclo detenido')
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  fetchUsers()
  fetchSettings()
})
</script>

<template>
  <div class="admin-container">
    <header class="header">
      <div class="header-content">
        <h2>Panel de Administrador</h2>
        <nav>
          <router-link to="/" class="nav-link">Ir al Dashboard</router-link>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <div class="card">
        <div class="card-header">
          <h3>Gestión de Usuarios</h3>
          <button @click="showForm = !showForm" class="btn-primary">
            {{ showForm ? 'Cancelar' : 'Nuevo Usuario' }}
          </button>
        </div>

        <div v-if="showForm" class="form-container">
          <form @submit.prevent="createUser">
            <div class="form-grid">
              <div class="form-group">
                <label>Nombre</label>
                <input v-model="newUser.nombre" required />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" v-model="newUser.email" required />
              </div>
              <div class="form-group">
                <label>Contraseña</label>
                <input type="password" v-model="newUser.password" required />
              </div>
              <div class="form-group">
                <label>Rol</label>
                <select v-model="newUser.role">
                  <option value="CLIENTE">Cliente</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>
            <div v-if="errorMsg" class="error-msg mt-2">{{ errorMsg }}</div>
            <button type="submit" class="btn-primary mt-4">Guardar Usuario</button>
          </form>
        </div>

        <div v-if="loading" class="loading">Cargando usuarios...</div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.nombre }}</td>
              <td>{{ user.email }}</td>
              <td><span :class="'badge ' + user.role.toLowerCase()">{{ user.role }}</span></td>
              <td>
                <button @click="deleteUser(user.id)" class="btn-danger" :disabled="user.id === 1">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card mt-4">
        <div class="card-header">
          <h3>Guía de Referencia para Incubación</h3>
          <div v-if="settings.start_date">
            <span class="badge admin">Ciclo Activo: {{ settings.bird_type.toUpperCase() }}</span>
            <button @click="stopCycle" class="btn-danger ml-2">Detener Ciclo</button>
          </div>
          <div v-else>
            <span class="badge">Sin ciclo activo</span>
          </div>
        </div>
        <div class="tabs">
          <button v-for="(bird, key) in birdData" :key="key" 
                  :class="['tab-btn', { active: activeTab === key }]"
                  @click="activeTab = key">
            {{ bird.name }}
          </button>
        </div>
        <div class="tab-content" v-if="birdData[activeTab]">
          <div class="info-grid mb-4">
            <div class="info-box">
              <h4>Días Totales</h4>
              <p class="highlight">{{ birdData[activeTab].total }}</p>
            </div>
            <div class="info-box" v-if="!birdData[activeTab].schedule">
              <h4>Temperatura Ideal</h4>
              <p class="highlight temp">{{ birdData[activeTab].temp }}</p>
              <span class="subtext">Constante durante todo el ciclo</span>
            </div>
            <div class="info-box" style="display: flex; align-items: center; justify-content: center;">
              <button @click="startCycle(activeTab)" class="btn-primary" style="width: 100%;">
                Iniciar Ciclo de {{ birdData[activeTab].name }}
              </button>
            </div>
          </div>
          
          <template v-if="birdData[activeTab].schedule">
            <h4 class="mt-4 mb-2">Registro de Incubación Diario</h4>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Día</th>
                  <th>Temperatura (ºC)</th>
                  <th>Humedad (Hr)</th>
                  <th>Acción / Recomendación</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="day in birdData[activeTab].schedule" :key="day.day">
                  <td><strong>Día {{ day.day }}</strong></td>
                  <td class="text-temp">{{ day.temp }}</td>
                  <td class="text-blue">{{ day.hum }}</td>
                  <td>{{ day.action }}</td>
                </tr>
              </tbody>
            </table>
          </template>
          
          <template v-else>
            <h4 class="mt-4 mb-2">Humedad Recomendada por Fases</h4>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Fase de Incubación</th>
                  <th>Días Correspondientes</th>
                  <th>Humedad Recomendada</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Desarrollo inicial</td>
                  <td><strong>Días {{ birdData[activeTab].days1 }}</strong></td>
                  <td class="text-blue">{{ birdData[activeTab].hum1 }}</td>
                </tr>
                <tr>
                  <td>Fase de Eclosión</td>
                  <td><strong>Días {{ birdData[activeTab].days2 }}</strong></td>
                  <td class="text-blue">{{ birdData[activeTab].hum2 }}</td>
                </tr>
              </tbody>
            </table>
          </template>
        </div>
      </div>

      <div class="card mt-4">
        <div class="card-header">
          <h3>Configuración de Alarmas (Incubadora)</h3>
        </div>
        <div class="form-container">
          <form @submit.prevent="updateSettings">
            <div class="form-grid">
              <div class="form-group">
                <label>Temp. Mínima (°C)</label>
                <input type="number" step="0.1" v-model="settings.temp_min" required />
              </div>
              <div class="form-group">
                <label>Temp. Máxima (°C)</label>
                <input type="number" step="0.1" v-model="settings.temp_max" required />
              </div>
              <div class="form-group">
                <label>Humedad Mínima (%)</label>
                <input type="number" step="0.1" v-model="settings.hum_min" required />
              </div>
              <div class="form-group">
                <label>Humedad Máxima (%)</label>
                <input type="number" step="0.1" v-model="settings.hum_max" required />
              </div>
            </div>
            <div v-if="settingsMsg" class="success-msg mt-2">{{ settingsMsg }}</div>
            <button type="submit" class="btn-primary mt-4">Guardar Rangos</button>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-container {
  min-height: 100vh;
  background-color: #0f172a;
  color: #f8fafc;
}

.header {
  background: rgba(15, 23, 42, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 2rem;
}

.header-content {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-link {
  color: #818cf8;
  text-decoration: none;
}

.main-content {
  max-width: 1280px;
  margin: 2rem auto;
  padding: 0 2rem;
}

.card {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 2rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.btn-primary {
  background: #6366f1;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
}

.btn-danger {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
}
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

.form-container {
  background: rgba(15, 23, 42, 0.5);
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

input, select {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.5rem;
  border-radius: 0.25rem;
  color: white;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge.admin { background: rgba(99, 102, 241, 0.2); color: #818cf8; }
.badge.cliente { background: rgba(16, 185, 129, 0.2); color: #34d399; }

.mt-2 { margin-top: 0.5rem; }
.mt-4 { margin-top: 2rem; }
.mb-2 { margin-bottom: 0.5rem; }
.error-msg { color: #ef4444; }
.success-msg { color: #34d399; font-weight: 500; }
.text-blue { color: #60a5fa; font-weight: 600; }

.tabs { display: flex; gap: 0.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 1.5rem; overflow-x: auto; padding-bottom: 0.5rem; }
.tab-btn { background: transparent; color: #94a3b8; border: none; padding: 0.75rem 1.5rem; cursor: pointer; border-radius: 0.5rem 0.5rem 0 0; font-weight: 500; transition: all 0.2s; white-space: nowrap; }
.tab-btn:hover { background: rgba(255, 255, 255, 0.05); color: white; }
.tab-btn.active { background: rgba(99, 102, 241, 0.1); color: #818cf8; border-bottom: 2px solid #818cf8; }
.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
.info-box { background: rgba(15, 23, 42, 0.5); padding: 1.5rem; border-radius: 0.5rem; border: 1px solid rgba(255, 255, 255, 0.05); }
.info-box h4 { margin: 0 0 0.5rem 0; color: #cbd5e1; font-weight: 500; }
.info-box .highlight { font-size: 1.5rem; font-weight: 700; color: #f8fafc; margin: 0; }
.info-box .highlight.temp { color: #fb923c; }
.info-box .subtext { font-size: 0.75rem; color: #64748b; margin-top: 0.25rem; display: block; }
.ml-2 { margin-left: 0.5rem; }
</style>
