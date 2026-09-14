# Estado del proyecto

**Fecha de evaluación:** 14 de septiembre de 2026  
**Estado general:** prototipo funcional de monitoreo; no listo para producción.

## Funcionalidades observadas

| Área | Estado | Evidencia |
| --- | --- | --- |
| Inicio de sesión con JWT | Implementado | `backend/index.js`, `Login.vue`. |
| Roles ADMIN / CLIENTE | Implementado | Middleware de API y guardia de Vue Router. |
| Gestión de usuarios | Implementado parcialmente | Crear, listar y eliminar; no editar/desactivar ni auditoría. |
| Lectura de ThingSpeak | Implementado | Worker al inicio y cada 60 segundos. |
| Historial y gráficas | Implementado | API paginada, tabla y Chart.js. |
| Alertas de rango | Implementado en navegador | Visual y sonora; sin notificación remota ni registro de alerta. |
| Ciclo de incubación | Implementado parcialmente | Fecha/ave globales y alerta para gallina en días 18–21. |
| Guías por ave | Implementado como contenido UI | Gallina, codorniz, ganso, pavo y pato. |
| Firmware Arduino/ESP32 | No presente | No hay sketch, plataforma ni contrato de dispositivo en el árbol. |
| Pruebas automatizadas | No presentes | `backend/package.json` contiene un script de prueba marcador. |
| CI/CD y Git remoto | No presente | El directorio no es aún un repositorio Git. |

## Riesgos y brechas prioritarias

| Prioridad | Hallazgo | Impacto | Acción recomendada |
| --- | --- | --- | --- |
| Crítica | Secreto JWT, clave ThingSpeak y configuración MySQL están codificados. | Acceso indebido y fuga de datos. | Mover a `.env`, rotar claves y añadir validación de entorno. |
| Alta | El canal permite CORS abierto y API/DB usan valores locales fijos. | Despliegue inseguro o frágil. | Restringir orígenes y parametrizar URLs/conexión. |
| Alta | No hay pruebas ni pipeline. | Regresiones al modificar autenticación o datos. | Añadir pruebas de API, componente y CI. |
| Alta | No se muestra antigüedad ni salud de telemetría. | Decisiones basadas en datos desactualizados. | Publicar estado de sincronización y alarma por staleness. |
| Media | Configuración y ciclo son globales. | No permite varias incubadoras o lotes. | Modelar incubadora, lote, ciclo y eventos. |
| Media | Sin validación de límites ni límites de paginación. | Rango incoherente o carga excesiva en base de datos. | Validar DTOs y acotar `limit`. |
| Media | La API no ofrece control de actuadores. | El producto solo monitorea; no automatiza el ambiente. | Definir explícitamente alcance o integrar comandos de dispositivo. |

## Próximo hito recomendado

Completar el Sprint 0 antes de ampliar funciones: eliminar secretos del código, documentar instalación, dejar migraciones repetibles e introducir pruebas de autenticación/lecturas. Después, priorizar salud de telemetría, pues es la condición para confiar en todo el dashboard.
