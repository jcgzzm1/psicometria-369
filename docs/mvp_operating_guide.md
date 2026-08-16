# Guía operativa y técnica — MVP de Psicometría Empresarial

## Propósito y alcance

Este MVP permite a Recursos Humanos registrar personas, cargar un catálogo inicial de cuatro instrumentos, asignar evaluaciones, resguardar el consentimiento, aplicar cuestionarios con guardado automático y generar resultados individuales y agrupados. Está orientado a selección, evaluación y desarrollo de mandos medios y perfiles operativos en México.

> Los resultados son un **insumo para revisión humana**. No deben utilizarse como una decisión automatizada de contratación, promoción, sanción o separación.

## Puesta en marcha operativa

| Paso | Acción de Recursos Humanos | Resultado esperado |
|---|---|---|
| 1 | Ingresar a **Instrumentos** y cargar el catálogo MVP. | Se habilitan razonamiento verbal, razonamiento numérico, Big Five adaptado y competencias laborales. |
| 2 | Completar **Aviso de privacidad y responsable**. | Se registran nombre, razón social, domicilio, canal ARCO/revocación, correo y versión del aviso. Sin estos datos no se puede recabar consentimiento. |
| 3 | Registrar una persona en **Personas**. | Se crea un expediente mínimo con correo, tipo, puesto y área. |
| 4 | Asignar una evaluación en **Asignaciones**. | Se genera una sesión trazable, ligada a la persona, prueba y proceso. |
| 5 | Solicitar a la persona que ingrese con el mismo correo asociado a su expediente. | La persona visualiza únicamente sus propias evaluaciones. |
| 6 | Consultar el resultado y el dashboard. | RR. HH. accede a reporte individual y a grupos por área, puesto o proceso. |

## Privacidad y tratamiento de datos

La plataforma registra la aceptación del aviso con versión, fecha, sesión y persona. Antes de iniciar, presenta un aviso simplificado con responsable, domicilio, datos tratados, finalidades, canales para ejercer derechos ARCO, limitación/revocación y comunicación de cambios. La LFPDPPP vigente exige informar las características principales del tratamiento, habilitar mecanismos ARCO y tomar medidas de seguridad administrativas, técnicas y físicas.[1]

El responsable debe completar los datos reales y obtener revisión jurídica del aviso integral antes de uso productivo. Cuando el tratamiento automatizado pueda afectar significativamente los intereses, derechos o libertades de una persona, esta cuenta con derecho de oposición bajo el marco legal aplicable.[1]

## Método de puntuación en el MVP

Los puntajes se calculan por dimensión y a nivel de instrumento. El **índice de resultado** se expresa como `puntaje obtenido / puntaje máximo × 100`. Los niveles bajo, medio y alto son umbrales configurables por prueba; se utilizan para organización interna y no constituyen una norma poblacional.

Un valor de **percentil** solo se muestra si RR. HH. captura una tabla de referencia documentada con puntos P25, P50 y P75. El motor interpola el resultado entre dichos puntos. En ausencia de tabla, el reporte muestra un índice y etiqueta explícitamente que no existe un baremo percentilar configurado. Esta distinción evita representar el porcentaje de aciertos como un percentil.

| Componente | Estado MVP | Restricción de uso |
|---|---|---|
| Razonamiento verbal y numérico | Reactivos de demostración y puntuación objetiva. | Requiere calibración con muestra objetivo antes de uso decisorio. |
| Big Five adaptado | Ítems breves de autoinforme, con reactivos inversos. | No es un inventario clínico ni un instrumento validado final. |
| Competencias laborales | Autoinforme descriptivo por dimensión. | Debe contrastarse con entrevista estructurada, evidencia laboral y perfil de puesto. |
| Percentiles | Configurables mediante P25/P50/P75. | Solo capturar baremos documentados y pertinentes para la población mexicana objetivo. |

## Ruta de validación posterior al MVP

La validación debe preceder cualquier uso de alto impacto. Se recomienda definir constructos y perfiles de puesto, someter reactivos a juicio experto, aplicar un piloto representativo, analizar calidad de ítems, confiabilidad y estructura interna, y construir normas por población relevante. También se deberá documentar evidencia de validez relacionada con criterio y análisis de impacto adverso. Las fuentes de benchmarking consultadas enfatizan normas, calibración, sesgos, ética y límites de inferencia.[2]

| Horizonte | Entregable de validación |
|---|---|
| 30 días | Matriz de puestos–competencias, comité técnico y protocolo de pilotaje. |
| 60 días | Piloto, limpieza de datos, análisis de ítems y confiabilidad. |
| 90 días | Baremos preliminares, análisis de equidad, manual técnico y capacitación de usuarios. |

## Accesibilidad

La interfaz incorpora etiquetas visibles, navegación de teclado, foco visible, contraste, controles táctiles, mensajes comprensibles y alternativa textual para la gráfica de radar. WCAG 2.2 organiza sus criterios bajo los principios perceptible, operable, comprensible y robusto, con criterios verificables en niveles A, AA y AAA.[3]

## Referencias

[1] [Cámara de Diputados, Ley Federal de Protección de Datos Personales en Posesión de los Particulares, texto vigente](https://www.diputados.gob.mx/LeyesBiblio/doc/LFPDPPP.doc)

[2] [PerformanSe, guía sobre pruebas psicométricas](https://www.performanse.com/es/blog/articulo/guia-para-saber-todo-sobre-las-pruebas-psicometricas/)

[3] [W3C, Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/)
