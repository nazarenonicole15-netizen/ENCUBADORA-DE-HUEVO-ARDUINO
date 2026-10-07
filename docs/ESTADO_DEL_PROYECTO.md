# Estado del Proyecto — Incubadora de Huevos con ESP32

**Última actualización:** 6 de octubre de 2026  
**Estado general:** Prototipo funcional — sistema completo de monitoreo con UI/UX modernizada.

---

## ✅ Funcionalidades Implementadas

| Área | Estado | Detalle |
|------|--------|---------|
| 🔐 Login con JWT | ✅ Completo | `backend/index.js`, `Login.vue`. Tokens con expiración 24h. |
| 👥 Roles ADMIN / CLIENTE | ✅ Completo | Middleware en API y guardias de Vue Router. |
| 👤 Crear usuario | ✅ Completo | Formulario con validación y hash bcrypt. |
| ✏️ Editar usuario | ✅ Completo | Modal con nombre, email, rol y contraseña opcional. `PUT /api/users/:id`. |
| 🗑️ Eliminar usuario | ✅ Completo | Con protección para el usuario ID=1. |
| 📡 Indicador ESP32 Online/Offline | ✅ Completo | Punto verde animado en navbar; se basa en antigüedad de la última lectura (≤3 min = online). |
| 📥 Sincronización ThingSpeak | ✅ Completo | Worker Node.js cada 60s. Canal `3442278`. |
| 🌡️ Lectura en vivo (Temp/Humedad) | ✅ Completo | Polling del frontend cada 60s. |
| 📈 Gráficas históricas | ✅ Completo | Chart.js, líneas de temperatura y humedad. |
| 📋 Tabla paginada | ✅ Completo | API paginada (`?page&limit`), 20 registros por página. |
| 🚨 Alarmas de rango | ✅ Completo | Visual (ring rojo animado) + sonora (audio loop). Botón silenciar. |
| 🐔 Guías de incubación | ✅ Completo | Gallina (21d tabla diaria), Codorniz (17d), Ganso (30d), Pavo (28d), Pato (28d). |
| 🔄 Control de ciclo | ✅ Completo | Iniciar/Detener por tipo de ave. Contador de días en Dashboard. |
| ⚙️ Config. de umbrales | ✅ Completo | Temp min/max, Humedad min/max desde panel Admin. |
| 🎨 UI/UX Moderna | ✅ Completo | Tailwind CSS, paleta institucional azul-celeste, cards, modales con backdrop-blur. |
| 📄 Código ESP32 (WiFiManager) | ✅ Completo | `codigoesp32.ino` con DHT11, LEDs indicadores, WiFiManager y ThingSpeak. |

---

## ⚠️ Brechas y Mejoras Pendientes

| Prioridad | Hallazgo | Impacto | Acción recomendada |
|-----------|----------|---------|-------------------|
| Alta | Secreto JWT y claves ThingSpeak están en el código fuente. | Riesgo de exposición. | Mover a archivo `.env` y agregar a `.gitignore`. |
| Alta | CORS abierto (`app.use(cors())`). | Cualquier origen puede llamar la API. | Restringir a `http://localhost:8080` en producción. |
| Media | Sin pruebas automatizadas. | Regresiones al modificar el código. | Añadir pruebas con Jest/Vitest. |
| Media | No hay registros de auditoría de cambios. | No hay trazabilidad de ediciones de usuarios. | Añadir tabla `audit_log` en MySQL. |
| Media | Configuración de ciclo es global (1 incubadora). | No permite múltiples incubadoras. | Modelar entidades `Incubadora` y `Ciclo`. |
| Baja | Sin notificación remota de alertas. | Las alertas solo son visibles en el navegador abierto. | Integrar email o push notification. |

---

## 🏁 Hitos Completados

- [x] Arquitectura cliente-servidor funcional (Vue 3 + Node.js + MySQL)
- [x] Integración con ThingSpeak (sincronización automática)
- [x] Sistema de autenticación y autorización por roles
- [x] CRUD completo de usuarios (con edición en modal)
- [x] Dashboard en tiempo real con alertas visuales y sonoras
- [x] Guías de incubación por tipo de ave con tabla diaria
- [x] Control de ciclo de incubación
- [x] Indicador de conexión del ESP32 en tiempo real
- [x] Código fuente del firmware ESP32 con WiFiManager
- [x] Diseño UI/UX moderno con Tailwind CSS
- [x] Repositorio en GitHub con commits organizados

---

## 🎯 Próximos Pasos Recomendados

1. **Variables de entorno:** Crear `.env` con `JWT_SECRET`, `THINGSPEAK_API_KEY`, credenciales MySQL.
2. **Pruebas automatizadas:** Cubrir endpoints de autenticación y lecturas con Jest.
3. **Despliegue en producción:** Configurar un servidor Linux con Nginx + PM2.
