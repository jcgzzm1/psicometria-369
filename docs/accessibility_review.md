# Revisión de accesibilidad — MVP

## Alcance de revisión

La revisión cubrió la página de inicio, el dashboard de RR. HH. y la configuración de instrumentos en escritorio y móvil. Para las rutas autenticadas de evaluación y reporte se verificó el contrato de sesión, el consentimiento, la persistencia de respuestas, la reanudación, la confirmación de finalización y la exposición de una alternativa textual para las gráficas. La prueba manual con una cuenta de evaluado real queda como requisito previo a producción, porque no se introdujeron personas o resultados ficticios en la base del proyecto.

| Criterio WCAG 2.2 AA | Evidencia implementada | Estado MVP |
|---|---|---|
| Contraste de texto y componentes | Paleta de primer plano oscuro sobre fondo claro, botones primarios con texto claro y estados de nivel con etiquetas textuales. | Revisado visualmente. |
| Navegación por teclado y foco | Botones, enlaces, radios, campos y selectores nativos o accesibles; se conservan anillos de foco visibles. | Implementado; requiere auditoría con teclado asistida antes de producción. |
| Etiquetas y nombre accesible | Consentimiento con `Label`, campos administrativos etiquetados, radio-grupos identificables, temporizador visible y alternativa textual para la gráfica de radar. | Implementado y cubierto por contrato de sesión. |
| Información sin depender del color | Estados expresados con texto, badges y etiquetas; los resultados incluyen porcentaje y nivel. | Implementado. |
| Reflujo y objetivo táctil | Diseño responsive verificado a 375 px y controles con separación y altura apropiadas. | Revisado visualmente. |
| Prevención de errores | Confirmación de finalización, aviso de salida accidental, guardado automático, reanudación y validación de opciones en servidor. | Implementado y cubierto por pruebas de procedimiento. |

## Evidencia de verificación

Se capturaron pantallas de inicio, dashboard y configuración de instrumentos en 1280 × 720 y 375 × 812. También se inspeccionaron visualmente, con un fixture aislado y posteriormente eliminado, la aplicación autenticada de una evaluación y su reporte individual en ambos tamaños.

| Ruta inspeccionada | Comprobaciones visuales | Resultado |
|---|---|---|
| `/evaluacion/:id` | Jerarquía de título, temporizador, progreso, indicador de guardado, opciones de respuesta, acciones anterior/siguiente y aviso de salida. | Correcto en escritorio y 375 px; sin desbordamiento horizontal observado. |
| `/resultados/:id` | Índice de resultado sin percentil, nivel textual, recomendación no determinante, gráfica con alternativa textual y lectura por dimensión. | Correcto en escritorio y 375 px; se corrigió la presentación del índice para mostrar el puntaje cuando no existe baremo. |
| `/admin/personas/:id` | Navegación de regreso, datos del expediente, trazabilidad de consentimiento y acceso al reporte. | Implementado; el listado no requiere datos ficticios persistentes. |

Las pruebas de contrato cubren el flujo autenticado hasta la sesión, respuestas reanudables y finalización. La verificación completa de conformidad WCAG AA debe incluir auditoría automática, navegación manual con teclado y pruebas con tecnologías de asistencia antes de liberar a producción.[1]

## Referencia

[1] [W3C, Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/)
