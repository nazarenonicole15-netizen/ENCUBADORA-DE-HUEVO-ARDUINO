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
  <div class="min-h-screen bg-pi-gray-100 font-sans text-pi-gray-700">
    <!-- Navbar -->
    <header class="bg-pi-blue-900 shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h2 class="text-xl font-bold text-white m-0 tracking-wide">Panel de Administrador</h2>
        <nav>
          <router-link to="/" class="text-pi-sky-400 hover:text-white transition-colors text-sm font-medium">Volver al Dashboard</router-link>
        </nav>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Gestión de Usuarios Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-pi-blue-900 m-0">Gestión de Usuarios</h3>
          <button @click="showForm = !showForm" class="bg-pi-blue-700 hover:bg-pi-blue-900 text-white border-none py-2 px-4 rounded-lg text-sm font-medium transition-colors">
            {{ showForm ? 'Cancelar' : 'Nuevo Usuario' }}
          </button>
        </div>

        <div v-if="showForm" class="bg-pi-gray-100 p-6 rounded-xl border border-gray-200 mb-6">
          <form @submit.prevent="createUser" class="flex flex-col gap-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-pi-gray-700">Nombre</label>
                <input v-model="newUser.nombre" required class="bg-white border border-gray-300 px-4 py-2.5 rounded-lg text-pi-gray-700 focus:outline-none focus:ring-2 focus:ring-pi-sky-400 focus:border-transparent transition-all" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-pi-gray-700">Email</label>
                <input type="email" v-model="newUser.email" required class="bg-white border border-gray-300 px-4 py-2.5 rounded-lg text-pi-gray-700 focus:outline-none focus:ring-2 focus:ring-pi-sky-400 focus:border-transparent transition-all" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-pi-gray-700">Contraseña</label>
                <input type="password" v-model="newUser.password" required class="bg-white border border-gray-300 px-4 py-2.5 rounded-lg text-pi-gray-700 focus:outline-none focus:ring-2 focus:ring-pi-sky-400 focus:border-transparent transition-all" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-pi-gray-700">Rol</label>
                <select v-model="newUser.role" class="bg-white border border-gray-300 px-4 py-2.5 rounded-lg text-pi-gray-700 focus:outline-none focus:ring-2 focus:ring-pi-sky-400 focus:border-transparent transition-all">
                  <option value="CLIENTE">Cliente</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>
            <div v-if="errorMsg" class="bg-red-100 text-pi-danger text-sm px-4 py-3 rounded-lg border border-red-200">{{ errorMsg }}</div>
            <div>
              <button type="submit" class="bg-pi-blue-700 hover:bg-pi-blue-900 text-white border-none py-2.5 px-6 rounded-lg text-sm font-medium transition-colors">Guardar Usuario</button>
            </div>
          </form>
        </div>

        <div v-if="loading" class="text-center py-8 text-gray-500 font-medium animate-pulse">Cargando usuarios...</div>
        <div v-else class="overflow-x-auto border border-gray-100 rounded-xl">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th scope="col" class="px-6 py-4 font-medium">ID</th>
                <th scope="col" class="px-6 py-4 font-medium">Nombre</th>
                <th scope="col" class="px-6 py-4 font-medium">Email</th>
                <th scope="col" class="px-6 py-4 font-medium">Rol</th>
                <th scope="col" class="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-pi-gray-700">{{ user.id }}</td>
                <td class="px-6 py-4 whitespace-nowrap font-medium text-pi-blue-900">{{ user.nombre }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-pi-gray-700">{{ user.email }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2.5 py-1 rounded-full text-xs font-semibold" :class="user.role === 'ADMIN' ? 'bg-pi-blue-100 text-pi-blue-700' : 'bg-green-100 text-green-700'">{{ user.role }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <button @click="deleteUser(user.id)" :disabled="user.id === 1" class="bg-white border border-red-200 text-pi-danger hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Guía de Referencia y Ciclo Activo -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 class="text-lg font-semibold text-pi-blue-900 m-0">Guía de Referencia para Incubación</h3>
          <div v-if="settings.start_date" class="flex items-center gap-3">
            <span class="px-3 py-1.5 rounded-full text-sm font-semibold bg-pi-blue-100 text-pi-blue-900 border border-pi-blue-200">Ciclo Activo: {{ settings.bird_type.toUpperCase() }}</span>
            <button @click="stopCycle" class="bg-white border border-red-200 text-pi-danger hover:bg-red-50 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">Detener Ciclo</button>
          </div>
          <div v-else>
            <span class="px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-600 border border-gray-200">Sin ciclo activo</span>
          </div>
        </div>

        <div class="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <button v-for="(bird, key) in birdData" :key="key" 
                  :class="['whitespace-nowrap px-6 py-3 font-medium text-sm rounded-t-lg transition-colors', activeTab === key ? 'bg-pi-sky-100 text-pi-blue-700 border-b-2 border-pi-blue-700' : 'text-gray-500 hover:text-pi-gray-700 hover:bg-gray-50']"
                  @click="activeTab = key">
            {{ bird.name }}
          </button>
        </div>

        <div v-if="birdData[activeTab]">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-pi-gray-100 p-6 rounded-xl border border-gray-200">
              <h4 class="text-sm font-medium text-gray-500 mb-1">Días Totales</h4>
              <p class="text-2xl font-bold text-pi-blue-900 m-0">{{ birdData[activeTab].total }}</p>
            </div>
            <div class="bg-pi-gray-100 p-6 rounded-xl border border-gray-200" v-if="!birdData[activeTab].schedule">
              <h4 class="text-sm font-medium text-gray-500 mb-1">Temperatura Ideal</h4>
              <p class="text-2xl font-bold text-orange-500 m-0">{{ birdData[activeTab].temp }}</p>
              <span class="text-xs text-gray-500 mt-1 block">Constante durante todo el ciclo</span>
            </div>
            <div class="flex items-center justify-center p-2">
              <button @click="startCycle(activeTab)" class="bg-pi-blue-700 hover:bg-pi-blue-900 text-white font-medium py-3 px-6 rounded-lg transition-colors w-full shadow-sm">
                Iniciar Ciclo de {{ birdData[activeTab].name }}
              </button>
            </div>
          </div>
          
          <template v-if="birdData[activeTab].schedule">
            <h4 class="text-base font-semibold text-pi-gray-700 mb-4">Registro de Incubación Diario</h4>
            <div class="overflow-x-auto border border-gray-100 rounded-xl">
              <table class="w-full text-sm text-left">
                <thead class="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th class="px-6 py-4 font-medium">Día</th>
                    <th class="px-6 py-4 font-medium">Temperatura (ºC)</th>
                    <th class="px-6 py-4 font-medium">Humedad (Hr)</th>
                    <th class="px-6 py-4 font-medium">Acción / Recomendación</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr v-for="day in birdData[activeTab].schedule" :key="day.day" class="hover:bg-gray-50">
                    <td class="px-6 py-3 font-semibold text-pi-gray-700">Día {{ day.day }}</td>
                    <td class="px-6 py-3 font-medium text-orange-500">{{ day.temp }}</td>
                    <td class="px-6 py-3 font-medium text-pi-sky-400">{{ day.hum }}</td>
                    <td class="px-6 py-3 text-gray-600">{{ day.action }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
          
          <template v-else>
            <h4 class="text-base font-semibold text-pi-gray-700 mb-4">Humedad Recomendada por Fases</h4>
            <div class="overflow-x-auto border border-gray-100 rounded-xl">
              <table class="w-full text-sm text-left">
                <thead class="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th class="px-6 py-4 font-medium">Fase de Incubación</th>
                    <th class="px-6 py-4 font-medium">Días Correspondientes</th>
                    <th class="px-6 py-4 font-medium">Humedad Recomendada</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 text-pi-gray-700 font-medium">Desarrollo inicial</td>
                    <td class="px-6 py-4 font-semibold text-gray-600">Días {{ birdData[activeTab].days1 }}</td>
                    <td class="px-6 py-4 font-medium text-pi-sky-400">{{ birdData[activeTab].hum1 }}</td>
                  </tr>
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 text-pi-gray-700 font-medium">Fase de Eclosión</td>
                    <td class="px-6 py-4 font-semibold text-gray-600">Días {{ birdData[activeTab].days2 }}</td>
                    <td class="px-6 py-4 font-medium text-pi-sky-400">{{ birdData[activeTab].hum2 }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>
      </div>

      <!-- Configuración de Alarmas Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-pi-blue-900 m-0">Configuración de Alarmas (Limites)</h3>
        </div>
        <div class="bg-pi-gray-100 p-6 rounded-xl border border-gray-200">
          <form @submit.prevent="updateSettings">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-pi-gray-700">Temp. Mínima (°C)</label>
                <input type="number" step="0.1" v-model="settings.temp_min" required class="bg-white border border-gray-300 px-4 py-2.5 rounded-lg text-pi-gray-700 focus:outline-none focus:ring-2 focus:ring-pi-sky-400 focus:border-transparent transition-all" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-pi-gray-700">Temp. Máxima (°C)</label>
                <input type="number" step="0.1" v-model="settings.temp_max" required class="bg-white border border-gray-300 px-4 py-2.5 rounded-lg text-pi-gray-700 focus:outline-none focus:ring-2 focus:ring-pi-sky-400 focus:border-transparent transition-all" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-pi-gray-700">Humedad Mínima (%)</label>
                <input type="number" step="0.1" v-model="settings.hum_min" required class="bg-white border border-gray-300 px-4 py-2.5 rounded-lg text-pi-gray-700 focus:outline-none focus:ring-2 focus:ring-pi-sky-400 focus:border-transparent transition-all" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-pi-gray-700">Humedad Máxima (%)</label>
                <input type="number" step="0.1" v-model="settings.hum_max" required class="bg-white border border-gray-300 px-4 py-2.5 rounded-lg text-pi-gray-700 focus:outline-none focus:ring-2 focus:ring-pi-sky-400 focus:border-transparent transition-all" />
              </div>
            </div>
            <div v-if="settingsMsg" class="mt-4 bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg border border-green-200 font-medium">{{ settingsMsg }}</div>
            <div class="mt-6">
              <button type="submit" class="bg-pi-blue-700 hover:bg-pi-blue-900 text-white border-none py-2.5 px-6 rounded-lg text-sm font-medium transition-colors shadow-sm">Guardar Rangos</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>
