# Historias de Usuario — Incubadora ESP32

**Última actualización:** 6 de octubre de 2026

## Backlog con Estado de Implementación

| ID | Prioridad | Estado | Historia | Criterios de Aceptación |
|----|-----------|--------|----------|------------------------|
| HU-01 | Alta | ✅ Completo | Como usuario, quiero iniciar sesión para acceder a datos protegidos. | Credenciales válidas devuelven JWT; las inválidas no revelan qué campo falló; rutas protegidas redirigen al login sin token. |
| HU-02 | Alta | ✅ Completo | Como usuario, quiero ver la última temperatura y humedad para conocer el estado inmediato de la incubadora. | Se muestran ambas métricas con unidad, fecha y badge Normal/Crítico; se actualizan cada minuto automáticamente. |
| HU-03 | Alta | ✅ Completo | Como usuario, quiero recibir alertas cuando los valores salgan del rango para actuar a tiempo. | Card con borde rojo animado + alarma sonora en bucle; botón para silenciar el sonido sin afectar la configuración. |
| HU-04 | Media | ✅ Completo | Como usuario, quiero consultar el historial y gráficas para observar tendencias. | Tabla paginada de 20 registros; gráficas Chart.js de temperatura y humedad con colores claros por tipo; valores fuera de rango en rojo. |
| HU-05 | Alta | ✅ Completo | Como administrador, quiero configurar umbrales de temperatura y humedad para adaptar las alertas. | Solo ADMIN puede guardar; campos numéricos con paso de 0.1; cambio se refleja en el dashboard en la siguiente actualización. |
| HU-06 | Media | ✅ Completo | Como administrador, quiero iniciar y detener un ciclo por tipo de ave para hacer seguimiento a la incubación. | Se guarda fecha de inicio y tipo de ave; Dashboard muestra contador de días transcurridos; detener requiere confirmación. |
| HU-07 | Media | ✅ Completo | Como administrador, quiero gestionar cuentas de usuarios para controlar el acceso. | Puedo listar, crear, **editar** (modal con nombre/email/rol/contraseña) y eliminar usuarios; email único; contraseña hasheada; ID=1 protegido. |
| HU-08 | Alta | 🔲 Pendiente | Como responsable técnico, quiero que los secretos estén fuera del código para desplegar de forma segura. | JWT, MySQL y ThingSpeak se leen desde `.env`; existe `.env.example`; secretos actuales rotados. |
| HU-09 | Alta | ✅ Completo | Como operador, quiero identificar si el ESP32 está enviando datos para no confiar en datos obsoletos. | Indicador 🟢 En Línea (≤3 min) o 🔴 Desconectado (>3 min) visible en el navbar del Dashboard; tooltip con fecha de última lectura. |
| HU-10 | Media | ✅ Completo | Como equipo IoT, quiero versionar el firmware para reproducir la integración. | `codigoesp32.ino` en raíz del repositorio con DHT11 (GPIO 27), WiFiManager, LEDs indicadores y ThingSpeak; documentado en `guia.md`. |
| HU-11 | Baja | 🔲 Pendiente | Como administrador, quiero recibir notificaciones remotas (email/push) cuando los valores estén fuera de rango. | Notificación enviada cuando temperatura o humedad supera umbral; no requiere que el navegador esté abierto. |
| HU-12 | Baja | 🔲 Pendiente | Como administrador, quiero un registro de auditoría de cambios de usuarios para tener trazabilidad. | Tabla `audit_log` con usuario, acción, timestamp y valores anteriores/nuevos. |

---

## Definición de Terminado

Una historia se considera **terminada** cuando cumple todos estos criterios:

- [ ] Código revisado y funcional en el branch principal.
- [ ] Comportamiento manual verificado en entorno de desarrollo.
- [ ] Documentación actualizada (este archivo + `ESTADO_DEL_PROYECTO.md`).
- [ ] Sin secretos hardcodeados en el código nuevo.
- [ ] Sin regresiones en el login, dashboard y panel admin.
