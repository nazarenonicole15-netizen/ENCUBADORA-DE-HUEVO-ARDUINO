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
  <div class="dashboard">
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <h1>Incubadora ESP32</h1>
        </div>
        <div class="nav-right">
          <span class="user-name">Hola, {{ user.nombre }}</span>
          <router-link v-if="user.role === 'ADMIN'" to="/admin/users" class="nav-link">Panel Admin</router-link>
          <button @click="logout" class="btn-outline">Salir</button>
        </div>
      </div>
    </header>

    <main class="main-content">
      <!-- Contador de Ciclo -->
      <div v-if="incubationDay" class="cycle-banner mb-4">
        <h2>Incubación en Progreso: <strong>{{ settings.bird_type.toUpperCase() }}</strong></h2>
        <p class="day-counter">Día {{ incubationDay }}</p>
      </div>

      <!-- Modal de Alerta Multimedia -->
      <div v-if="showAlert" class="modal-overlay">
        <div class="modal-content alarm-modal">
          <h2>🔔 Alerta de Incubación</h2>
          <p class="alert-text">{{ alertMessage }}</p>
          <img v-if="alertImage" :src="alertImage" alt="Estado del embrión" class="embryo-img" />
          <button @click="closeAlert" class="btn-primary mt-4">Entendido</button>
        </div>
      </div>

      <!-- Alarmas Visuales y Sonoras de Rango -->
      <div v-if="tempError || humError" class="alert-banner">
        <span>⚠️ ATENCIÓN: Parámetros fuera del rango ideal de incubación</span>
        <button @click="toggleMute" class="btn-mute">
          {{ isMuted ? '🔇 Silenciar Activado' : '🔊 Silenciar Alarma' }}
        </button>
      </div>

      <div class="grid">
        <!-- Cards -->
        <div class="metric-card temp-card" :class="{ 'alarm-pulse': tempError }">
          <div class="card-header">
            <h3>Temperatura</h3>
          </div>
          <div class="card-value" :class="{ 'text-danger': tempError }">
            <span class="value">{{ latestData.temp }}</span>
            <span class="unit">°C</span>
          </div>
          <div class="range-info">Rango ideal: {{ settings.temp_min }} - {{ settings.temp_max }} °C</div>
        </div>

        <div class="metric-card hum-card" :class="{ 'alarm-pulse': humError }">
          <div class="card-header">
            <h3>Humedad</h3>
          </div>
          <div class="card-value" :class="{ 'text-danger': humError }">
            <span class="value">{{ latestData.hum }}</span>
            <span class="unit">%</span>
          </div>
          <div class="range-info">Rango ideal: {{ settings.hum_min }}% - {{ settings.hum_max }}%</div>
        </div>

        <!-- Charts -->
        <div class="chart-container">
          <div class="chart-wrapper">
            <Line v-if="tempChartData.labels.length" :data="tempChartData" :options="chartOptions" />
          </div>
        </div>

        <div class="chart-container">
          <div class="chart-wrapper">
            <Line v-if="humChartData.labels.length" :data="humChartData" :options="chartOptions" />
          </div>
        </div>
      </div>

      <!-- Tabla Histórica -->
      <div class="table-card mt-4">
        <h3>Histórico (Tomado cada minuto)</h3>
        <table class="data-table mt-2">
          <thead>
            <tr>
              <th>Fecha y Hora</th>
              <th>Temperatura (°C)</th>
              <th>Humedad (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in historyData" :key="row.id">
              <td>{{ new Date(row.timestamp).toLocaleString() }}</td>
              <td>{{ row.temperatura }}</td>
              <td>{{ row.humedad }}</td>
            </tr>
          </tbody>
        </table>
        <div class="pagination mt-4">
          <button @click="fetchHistory(currentPage - 1)" :disabled="currentPage === 1">Anterior</button>
          <span>Página {{ currentPage }} de {{ totalPages }}</span>
          <button @click="fetchHistory(currentPage + 1)" :disabled="currentPage === totalPages">Siguiente</button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard { min-height: 100vh; background: #0f172a; color: #f8fafc; font-family: 'Inter', sans-serif; }
.header { background: rgba(15, 23, 42, 0.8); border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
.header-content { max-width: 1280px; margin: 0 auto; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
.logo h1 { font-size: 1.25rem; font-weight: 600; margin: 0; background: linear-gradient(to right, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.nav-right { display: flex; gap: 1rem; align-items: center; }
.user-name { color: #94a3b8; }
.nav-link { color: #818cf8; text-decoration: none; font-size: 0.875rem; }
.btn-outline { background: transparent; border: 1px solid #475569; color: white; padding: 0.25rem 0.75rem; border-radius: 0.5rem; cursor: pointer; }

.main-content { max-width: 1280px; margin: 0 auto; padding: 2rem; }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
.metric-card { background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 1rem; padding: 1.5rem; }
.card-value .value { font-size: 3rem; font-weight: 700; }
.range-info { font-size: 0.75rem; color: #64748b; margin-top: 0.5rem; }
.chart-container { background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 1rem; padding: 1rem; grid-column: span 1; height: 250px;}

.alert-banner { background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #fca5a5; padding: 1rem; border-radius: 0.5rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; font-weight: 600; }
.btn-mute { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 0.25rem 0.75rem; border-radius: 0.25rem; cursor: pointer; font-size: 0.8rem; }
.btn-mute:hover { background: rgba(0,0,0,0.5); }
.alarm-pulse { animation: alarmPulse 1.5s infinite; border-color: #ef4444; }
.text-danger { color: #ef4444 !important; }

@keyframes alarmPulse {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

.table-card { background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 1rem; padding: 1.5rem; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; }
.pagination button { background: #334155; border: none; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; }
.pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
.mt-2 { margin-top: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }

.cycle-banner { background: linear-gradient(to right, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2)); border: 1px solid rgba(168, 85, 247, 0.5); padding: 1.5rem; border-radius: 1rem; text-align: center; }
.cycle-banner h2 { margin: 0 0 0.5rem 0; font-size: 1.25rem; color: #e2e8f0; }
.day-counter { font-size: 2.5rem; font-weight: 800; color: #c084fc; margin: 0; }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(5px); }
.modal-content { background: #1e293b; padding: 2.5rem; border-radius: 1rem; max-width: 500px; text-align: center; border: 1px solid #818cf8; box-shadow: 0 0 30px rgba(129, 140, 248, 0.3); }
.modal-content h2 { color: #f8fafc; margin-top: 0; }
.alert-text { font-size: 1.1rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 1.5rem; }
.embryo-img { width: 100%; max-height: 300px; object-fit: contain; border-radius: 0.5rem; margin-bottom: 1rem; background: white; }
.btn-primary { background: #6366f1; color: white; border: none; padding: 0.75rem 2rem; border-radius: 0.5rem; font-size: 1rem; cursor: pointer; }
.btn-primary:hover { background: #4f46e5; }
</style>
