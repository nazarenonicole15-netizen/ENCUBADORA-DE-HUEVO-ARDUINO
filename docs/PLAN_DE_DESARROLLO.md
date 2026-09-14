# Plan de desarrollo por sprints

Propuesta para sprints de dos semanas, ordenada por reducción de riesgo operativo y de seguridad. Las estimaciones se expresan en puntos relativos y se revisan al iniciar cada sprint.

| Sprint | Objetivo | Historias / trabajo | Entregables | Estimación |
| --- | --- | --- | --- | --- |
| 0 — Base segura | Hacer el proyecto instalable y seguro para continuar. | HU-08, README operativo, scripts `dev`, `start`, migraciones idempotentes, `.env.example`, rotación de claves. | Configuración por entorno, guía de arranque y control de secretos. | 13 pts |
| 1 — Telemetría confiable | Detectar y comunicar datos inválidos, vencidos o fallos de sincronización. | HU-02, HU-03, HU-09; validación de `page/limit`, estado de worker, indicador de antigüedad, pruebas API. | Dashboard con estado de conexión y API probada. | 21 pts |
| 2 — Ciclos y reglas | Convertir la guía de incubación en reglas consistentes y verificables. | HU-05, HU-06; validación de rangos, reglas por ave, alertas para especies soportadas, persistencia de eventos. | Ciclos confiables y alertas de fase documentadas. | 20 pts |
| 3 — Operación y acceso | Completar administración y trazabilidad. | HU-01, HU-07; edición/desactivación de usuarios, protección contra eliminación propia, auditoría básica y expiración controlada. | Administración robusta y pruebas de autorización. | 18 pts |
| 4 — Integración IoT | Versionar y validar el extremo de hardware. | HU-10; firmware, contrato de payload, autenticación de dispositivo, prueba de extremo a extremo. | Repositorio reproducible desde sensor a panel. | 21 pts |

## Ceremonias y calidad

- Planificación: definir capacidad y aceptar historias con criterios claros.
- Seguimiento diario: revisar bloqueos de hardware, datos y despliegue.
- Revisión: demostrar sobre datos de prueba y registrar decisiones.
- Retrospectiva: ajustar estimaciones y riesgos.
- Calidad mínima por sprint: `npm run build` en frontend, pruebas de rutas del backend, análisis de secretos y revisión de migraciones antes de integrar.

## Dependencias

- Acceso a una instancia MySQL de prueba.
- Propiedad y rotación del canal/clave de ThingSpeak.
- Hardware ESP32/Arduino, sensores y firmware para el Sprint 4.
- Decisión de despliegue (red local, servidor o nube) para dejar de depender de `localhost`.
