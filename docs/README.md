# Documentación del proyecto

Esta carpeta reúne la documentación funcional y técnica de **Incubadora ESP32**, elaborada a partir de la implementación disponible el 14 de septiembre de 2026.

| Documento | Contenido |
| --- | --- |
| [Arquitectura](ARQUITECTURA.md) | Componentes, flujos, datos y decisiones técnicas. |
| [Casos de uso](CASOS_DE_USO.md) | Actores, casos de uso y diagrama UML. |
| [UML](UML.md) | Diagramas de componentes, clases de dominio y secuencia. |
| [Historias de usuario](HISTORIAS_DE_USUARIO.md) | Backlog priorizado con criterios de aceptación. |
| [Plan de desarrollo](PLAN_DE_DESARROLLO.md) | Sprints propuestos, objetivos y entregables. |
| [Estado del proyecto](ESTADO_DEL_PROYECTO.md) | Inventario, brechas, riesgos y próximos pasos. |

## Convenciones

- Los diagramas se expresan en Mermaid y se previsualizan en GitHub, GitLab y editores compatibles.
- **Implementado** significa que existe código en este repositorio; **propuesto** identifica trabajo pendiente.
- La aplicación consulta la telemetría mediante ThingSpeak. El firmware que envía mediciones desde Arduino/ESP32 no está versionado en este directorio.
