# Plan de Desarrollo por Sprints — Incubadora ESP32

**Última actualización:** 6 de octubre de 2026

---

## Estado General

```
Sprint 0 — Base segura          🔲 Parcialmente completo
Sprint 1 — Telemetría confiable ✅ Completado
Sprint 2 — Ciclos y reglas      ✅ Completado
Sprint 3 — Operación y acceso   ✅ Completado
Sprint 4 — Integración IoT      ✅ Completado
Sprint 5 — Seguridad y prod.    🔲 Próxima iteración
```

---

## Sprints Completados

### ✅ Sprint 1 — Telemetría Confiable
**Objetivo:** Dashboard en tiempo real con estado de conexión del ESP32.

| Historia | Entregable | Estado |
|----------|-----------|--------|
| HU-02 | Temperatura y humedad en vivo con badge Normal/Crítico | ✅ |
| HU-03 | Alertas visual y sonora; botón silenciar | ✅ |
| HU-09 | Indicador 🟢/🔴 de conexión del ESP32 en Navbar | ✅ |
| — | Sincronización ThingSpeak → MySQL cada 60s | ✅ |
| — | Historial paginado y gráficas Chart.js | ✅ |

---

### ✅ Sprint 2 — Ciclos y Reglas de Incubación
**Objetivo:** Ciclos de incubación funcionales con guías por tipo de ave.

| Historia | Entregable | Estado |
|----------|-----------|--------|
| HU-05 | Configuración de umbrales temp/hum para Admin | ✅ |
| HU-06 | Iniciar/Detener ciclo; contador de días en Dashboard | ✅ |
| — | Guías de incubación: Gallina, Codorniz, Ganso, Pavo, Pato | ✅ |
| — | Alerta multimedia para días críticos de gallina (días 18–21) | ✅ |

---

### ✅ Sprint 3 — Gestión de Usuarios
**Objetivo:** CRUD completo de usuarios con edición en modal.

| Historia | Entregable | Estado |
|----------|-----------|--------|
| HU-01 | Login JWT con guardias de Vue Router por rol | ✅ |
| HU-07 | Crear, listar, **editar** (modal) y eliminar usuarios | ✅ |
| — | Endpoint `PUT /api/users/:id` en backend | ✅ |
| — | Protección del usuario administrador inicial (ID=1) | ✅ |

---

### ✅ Sprint 4 — Firmware ESP32
**Objetivo:** Versionar y documentar el firmware del dispositivo IoT.

| Historia | Entregable | Estado |
|----------|-----------|--------|
| HU-10 | `codigoesp32.ino` con WiFiManager + DHT11 + ThingSpeak | ✅ |
| — | LEDs indicadores de estado (GPIO 25 y 26) | ✅ |
| — | Reconexión automática al Wi-Fi con WiFiManager fallback | ✅ |
| — | Documentación de firmware en `guia.md` | ✅ |

---

### ✅ Diseño UI/UX (Transversal)
**Objetivo:** Interfaz institucional moderna y responsive.

| Entregable | Estado |
|-----------|--------|
| Paleta institucional azul-celeste con Tailwind CSS | ✅ |
| `Login.vue` — formulario centrado con validación visual | ✅ |
| `Dashboard.vue` — navbar, cards, gráficas, tabla paginada | ✅ |
| `AdminUsers.vue` — tabla de usuarios, modal edición, guías de ave | ✅ |

---

## Sprint Pendiente

### 🔲 Sprint 5 — Seguridad y Producción
**Objetivo:** Hacer el sistema apto para despliegue en producción.

| Historia | Trabajo | Estimación |
|----------|---------|-----------|
| HU-08 | Mover JWT, MySQL y ThingSpeak a `.env`; crear `.env.example` | 5 pts |
| — | Restringir CORS a dominio específico | 2 pts |
| — | Centralizar URL de API en `VITE_API_URL` | 2 pts |
| — | Añadir pruebas automatizadas para rutas de Auth y Lecturas | 8 pts |
| HU-11 | Notificaciones remotas (email) cuando valores salen de rango | 8 pts |
| HU-12 | Tabla de auditoría de cambios de usuarios | 5 pts |

**Estimación total:** ~30 puntos

---

## Dependencias

- Acceso a servidor de producción (Linux + Nginx + PM2) para despliegue real.
- Decisión de dominio o IP pública para dejar de usar `localhost`.
- Canal ThingSpeak activo con el ESP32 enviando datos regularmente.
