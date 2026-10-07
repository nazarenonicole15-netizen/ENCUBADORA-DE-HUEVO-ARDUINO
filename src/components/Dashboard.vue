<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))

// Helper to get fresh token/headers on every API call (prevents stale token issues)
const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

const latestData = ref({ temp: null, hum: null, date: null })
const loading = ref(true)
const historyData = ref([])
const currentPage = ref(1)
const totalPages = ref(1)

// Configuraciones dinámicas y ciclo
const settings = ref({ temp_min: 37.5, temp_max: 37.9, hum_min: 50, hum_max: 70, start_date: null, bird_type: 'gallina' })

const incubationDay = computed(() => {
  if (!settings.value.start_date) return null;
  const start = new Date(settings.value.start_date);
  const now = new Date();
  const diffTime = Math.abs(now - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

const showAlert = ref(false);
const alertMessage = ref('');
const alertImage = ref('');

let alarmAudio = null;

const checkIncubationAlerts = () => {
  if (!incubationDay.value) return;
  const day = incubationDay.value;
  const bird = settings.value.bird_type;

  if (bird === 'gallina') {
    if (day >= 18 && day <= 21 && !localStorage.getItem(`alert_day_${day}`)) {
      alertMessage.value = `¡Día ${day}! Fin del volteo e incrementar entrada de O2. Debes abrir un poco la puerta para que entre más oxígeno (recomendado para los días 18, 19, 20 y 21). Disminuye la temperatura a 35-36ºC.`;
      
      if (day === 21) {
        alertMessage.value += ' ¡FASE DE ECLOSIÓN HOY! Sube la humedad al 70-80%.';
      }

      alertImage.value = '/chicken_embryo_day_18.jpg';
      showAlert.value = true;
      playAudio();
      localStorage.setItem(`alert_day_${day}`, 'true');
    }
  }
}

const playAudio = () => {
  if (alarmAudio) {
    alarmAudio.pause();
  }
  alarmAudio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
  alarmAudio.loop = true; // El sonido se repetirá infinitamente
  alarmAudio.play().catch(e => console.log('Audio autoplay blocked', e));
}

const closeAlert = () => {
  showAlert.value = false;
  if (alarmAudio) {
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
  }
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: { legend: { display: false } },
  scales: { x: { display: false }, y: { grid: { color: 'rgba(255, 255, 255, 0.05)' } } }
}

const tempChartData = ref({ labels: [], datasets: [] })
const humChartData = ref({ labels: [], datasets: [] })

// ALARMAS
const tempError = computed(() => {
  if (latestData.value.temp === null) return false
  const t = parseFloat(latestData.value.temp)
  return t < settings.value.temp_min || t > settings.value.temp_max
})
const humError = computed(() => {
  if (latestData.value.hum === null) return false
  const h = parseFloat(latestData.value.hum)
  return h < settings.value.hum_min || h > settings.value.hum_max
})

let outOfBoundsAudio = null;
const isMuted = ref(false);

watch([tempError, humError], ([tErr, hErr]) => {
  if (!outOfBoundsAudio) {
    outOfBoundsAudio = new Audio('/error_alarm.ogg');
    outOfBoundsAudio.loop = true;
    outOfBoundsAudio.volume = 1.0; // Forzar volumen al máximo (1.0 = 100%)
  }
  
  if ((tErr || hErr) && !isMuted.value) {
    outOfBoundsAudio.play().catch(e => console.log('Autoplay blocked:', e));
  } else {
    outOfBoundsAudio.pause();
    outOfBoundsAudio.currentTime = 0;
  }
});

const toggleMute = () => {
  isMuted.value = !isMuted.value;
  if (isMuted.value && outOfBoundsAudio) {
    outOfBoundsAudio.pause();
  } else if ((tempError.value || humError.value) && outOfBoundsAudio) {
    outOfBoundsAudio.play().catch(e => console.log('Autoplay blocked:', e));
  }
}

const fetchSettings = async () => {
  try {
    const res = await axios.get('http://localhost:3001/api/settings', getAuthHeaders())
    if (res.data) {
      settings.value = res.data;
      checkIncubationAlerts();
    }
  } catch (err) {
    console.error('Error fetching settings:', err)
  }
}

const fetchLatest = async () => {
  try {
    const res = await axios.get('http://localhost:3001/api/readings/latest', getAuthHeaders())
    if (res.data) {
      latestData.value = {
        temp: parseFloat(res.data.temperatura).toFixed(1),
        hum: parseFloat(res.data.humedad).toFixed(1),
        date: new Date(res.data.timestamp).toLocaleString()
      }
    }
  } catch (err) {
    // 401 is handled globally by the axios interceptor in main.js
    console.error('Error fetching latest reading:', err)
  }
}

const fetchHistory = async (page = 1) => {
  try {
    const res = await axios.get(`http://localhost:3001/api/readings?page=${page}&limit=20`, getAuthHeaders())
    historyData.value = res.data.data
    currentPage.value = res.data.page
    totalPages.value = res.data.totalPages

    // Actualizar gráficas (invertimos para que el más viejo esté a la izquierda)
    const reversed = [...res.data.data].reverse()
    const labels = reversed.map(r => {
      const d = new Date(r.timestamp)
      return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`
    })
    
    tempChartData.value = {
      labels,
      datasets: [{
        label: 'Temperatura', data: reversed.map(r => r.temperatura),
        borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.4
      }]
    }
    humChartData.value = {
      labels,
      datasets: [{
        label: 'Humedad', data: reversed.map(r => r.humedad),
        borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4
      }]
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

onMounted(() => {
  fetchSettings()
  fetchLatest()
  fetchHistory()
  setInterval(() => {
    fetchLatest()
    if (currentPage.value === 1) fetchHistory(1)
  }, 60000)
})
</script>

<template>
  <div class="min-h-screen bg-pi-gray-100 font-sans text-pi-gray-700">
    <!-- Navbar -->
    <header class="bg-pi-blue-900 shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <svg class="w-8 h-8 text-pi-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          <h1 class="text-xl font-bold text-white m-0 tracking-wide">Incubadora ESP32</h1>
        </div>
        <div class="flex items-center gap-6">
          <span class="text-pi-sky-100 text-sm font-medium">Hola, {{ user.nombre }}</span>
          <router-link v-if="user.role === 'ADMIN'" to="/admin/users" class="text-pi-sky-400 hover:text-white transition-colors text-sm font-medium">Panel Admin</router-link>
          <button @click="logout" class="border border-pi-sky-400 text-pi-sky-400 hover:bg-pi-sky-400 hover:text-pi-blue-900 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">Salir</button>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Contador de Ciclo -->
      <div v-if="incubationDay" class="bg-pi-white rounded-xl shadow-sm border border-pi-sky-100 p-6 mb-8 text-center flex flex-col items-center">
        <h2 class="text-lg font-semibold text-pi-blue-900 mb-2">Incubación en Progreso: <span class="uppercase">{{ settings.bird_type }}</span></h2>
        <div class="bg-pi-sky-100 text-pi-blue-700 px-6 py-2 rounded-full">
          <p class="text-3xl font-extrabold m-0">Día {{ incubationDay }}</p>
        </div>
      </div>

      <!-- Modal de Alerta Multimedia -->
      <div v-if="showAlert" class="fixed inset-0 bg-pi-blue-900/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
        <div class="bg-white rounded-2xl p-8 max-w-lg w-full text-center shadow-2xl border-t-4 border-pi-warning">
          <div class="flex justify-center mb-4">
            <span class="bg-pi-warning/20 text-pi-warning p-3 rounded-full">
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
          </div>
          <h2 class="text-2xl font-bold text-pi-gray-700 mb-4">Alerta de Incubación</h2>
          <p class="text-base text-pi-gray-700 mb-6">{{ alertMessage }}</p>
          <img v-if="alertImage" :src="alertImage" alt="Estado del embrión" class="w-full max-h-64 object-contain rounded-lg mb-6 border border-gray-100" />
          <button @click="closeAlert" class="bg-pi-blue-700 hover:bg-pi-blue-900 text-white font-medium py-3 px-8 rounded-lg transition-colors w-full">Entendido</button>
        </div>
      </div>

      <!-- Alarmas Visuales y Sonoras de Rango -->
      <div v-if="tempError || humError" class="bg-red-50 border-l-4 border-pi-danger p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center mb-8 shadow-sm">
        <div class="flex items-center gap-3 mb-4 sm:mb-0">
          <svg class="w-6 h-6 text-pi-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="font-semibold text-pi-danger">Parámetros fuera del rango ideal</span>
        </div>
        <button @click="toggleMute" class="bg-white border border-red-200 text-pi-danger hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          {{ isMuted ? '🔇 Silenciado' : '🔊 Silenciar Alarma' }}
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <!-- Cards -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col relative overflow-hidden" :class="{ 'ring-2 ring-pi-danger animate-pulse': tempError }">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-base font-semibold text-pi-gray-700 m-0">Temperatura</h3>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-medium" :class="tempError ? 'bg-red-100 text-pi-danger' : 'bg-pi-success/10 text-pi-success'">
              {{ tempError ? 'Crítico' : 'Normal' }}
            </span>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-4xl font-bold tracking-tight" :class="tempError ? 'text-pi-danger' : 'text-pi-blue-900'">{{ latestData.temp }}</span>
            <span class="text-xl font-medium text-gray-500">°C</span>
          </div>
          <div class="mt-4 text-sm text-gray-500 border-t border-gray-50 pt-4">Rango ideal: {{ settings.temp_min }} - {{ settings.temp_max }} °C</div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col relative overflow-hidden" :class="{ 'ring-2 ring-pi-danger animate-pulse': humError }">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-base font-semibold text-pi-gray-700 m-0">Humedad</h3>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-medium" :class="humError ? 'bg-red-100 text-pi-danger' : 'bg-pi-success/10 text-pi-success'">
              {{ humError ? 'Crítico' : 'Normal' }}
            </span>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-4xl font-bold tracking-tight" :class="humError ? 'text-pi-danger' : 'text-pi-blue-900'">{{ latestData.hum }}</span>
            <span class="text-xl font-medium text-gray-500">%</span>
          </div>
          <div class="mt-4 text-sm text-gray-500 border-t border-gray-50 pt-4">Rango ideal: {{ settings.hum_min }}% - {{ settings.hum_max }}%</div>
        </div>

        <!-- Charts -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-72">
          <Line v-if="tempChartData.labels.length" :data="tempChartData" :options="chartOptions" />
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-72">
          <Line v-if="humChartData.labels.length" :data="humChartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Tabla Histórica -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-0 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 class="text-lg font-semibold text-pi-blue-900 m-0">Historial de Lecturas</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-gray-500 uppercase bg-white border-b border-gray-100">
              <tr>
                <th scope="col" class="px-6 py-4 font-medium">Fecha y Hora</th>
                <th scope="col" class="px-6 py-4 font-medium">Temperatura (°C)</th>
                <th scope="col" class="px-6 py-4 font-medium">Humedad (%)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="row in historyData" :key="row.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-pi-gray-700">{{ new Date(row.timestamp).toLocaleString() }}</td>
                <td class="px-6 py-4 whitespace-nowrap font-medium" :class="row.temperatura < settings.temp_min || row.temperatura > settings.temp_max ? 'text-pi-danger' : 'text-pi-blue-700'">{{ row.temperatura }}</td>
                <td class="px-6 py-4 whitespace-nowrap font-medium" :class="row.humedad < settings.hum_min || row.humedad > settings.hum_max ? 'text-pi-danger' : 'text-pi-blue-700'">{{ row.humedad }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <button @click="fetchHistory(currentPage - 1)" :disabled="currentPage === 1" class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Anterior</button>
          <span class="text-sm text-gray-500 font-medium">Página {{ currentPage }} de {{ totalPages }}</span>
          <button @click="fetchHistory(currentPage + 1)" :disabled="currentPage === totalPages" class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Siguiente</button>
        </div>
      </div>
    </main>
  </div>
</template>
