# Historias de usuario

## Backlog priorizado

| ID | Prioridad | Historia | Criterios de aceptación |
| --- | --- | --- | --- |
| HU-01 | Alta | Como usuario, quiero iniciar sesión para acceder a datos protegidos. | Credenciales válidas devuelven un JWT; las inválidas no revelan cuál dato falló; rutas protegidas redirigen al login sin token. |
| HU-02 | Alta | Como usuario, quiero ver la última temperatura y humedad para conocer el estado inmediato de la incubadora. | Se muestran ambas métricas con unidad y fecha; se actualizan cada minuto; se informa claramente si no hay lectura. |
| HU-03 | Alta | Como usuario, quiero recibir alertas al salir los valores de rango para actuar a tiempo. | Temperatura y humedad se comparan contra límites vigentes; se muestra aviso visual y alarma; puedo silenciar el sonido de la sesión. |
| HU-04 | Media | Como usuario, quiero consultar el historial y las gráficas para observar tendencias. | La tabla es paginada; las gráficas corresponden a las lecturas visibles; fechas y unidades son legibles. |
| HU-05 | Alta | Como administrador, quiero configurar límites de temperatura y humedad para adaptar las alertas. | Solo `ADMIN` puede guardar; valores son numéricos; mínimo debe ser menor o igual a máximo; la modificación se refleja al recargar. |
| HU-06 | Media | Como administrador, quiero iniciar y detener un ciclo por tipo de ave para seguir la incubación. | Se guarda fecha de inicio y ave; se muestra día transcurrido; detener borra el ciclo activo con confirmación. |
| HU-07 | Media | Como administrador, quiero administrar las cuentas de usuarios para controlar el acceso. | Puedo listar, crear y eliminar usuarios; email único; contraseña se almacena cifrada; no puedo eliminar el administrador inicial desde la UI. |
| HU-08 | Alta | Como responsable técnico, quiero que las credenciales estén fuera del código para desplegar de manera segura. | JWT, MySQL y ThingSpeak se leen desde `.env`; existe `.env.example`; secretos versionados se rotan; falla de configuración se reporta al inicio. |
| HU-09 | Alta | Como operador, quiero identificar si el flujo de telemetría se interrumpe para no confiar en datos obsoletos. | Se muestra timestamp y antigüedad; se marca una lectura vencida; backend registra y expone estado de la última sincronización. |
| HU-10 | Media | Como equipo IoT, quiero versionar el firmware y contrato de datos para reproducir la integración. | Existe carpeta de firmware con instrucciones; los campos de telemetría están documentados; el dispositivo se autentica ante el servicio elegido. |

## Definición de terminado propuesta

Una historia se considera terminada cuando tiene código revisado, pruebas automatizadas que cubren el camino principal y de error, documentación actualizada, configuración no secreta por defecto y validación manual en un entorno de prueba.
