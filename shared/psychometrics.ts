export type ItemOption = {
  label: string;
  value: number;
};

export type TestDimensionDefinition = {
  id: string;
  name: string;
  description: string;
};

export type TestItemDefinition = {
  id: string;
  dimensionId: string;
  prompt: string;
  type: "single_choice" | "likert";
  options: ItemOption[];
  reverseScored?: boolean;
};

export type TestDefinition = {
  code: string;
  name: string;
  category: "reasoning" | "personality" | "competency";
  audience: "operativo" | "mandos_medios" | "todos";
  durationMinutes: number;
  instructions: string;
  scoringConfig: {
    lowMax: number;
    mediumMax: number;
    referenceLabel: string;
    version: string;
    percentileReference?: {
      p25Score: number;
      p50Score: number;
      p75Score: number;
    };
  };
  dimensions: TestDimensionDefinition[];
  items: TestItemDefinition[];
};

const likertOptions: ItemOption[] = [
  { label: "Totalmente en desacuerdo", value: 1 },
  { label: "En desacuerdo", value: 2 },
  { label: "Ni de acuerdo ni en desacuerdo", value: 3 },
  { label: "De acuerdo", value: 4 },
  { label: "Totalmente de acuerdo", value: 5 },
];

export const TEST_CATALOG: TestDefinition[] = [
  {
    code: "RV_MVP_01",
    name: "Razonamiento verbal — MVP",
    category: "reasoning",
    audience: "todos",
    durationMinutes: 8,
    instructions:
      "Lee cada reactivo con atención y selecciona la respuesta que complete mejor la relación o el significado. Responde con base en tu primer análisis; no se permite pausar el temporizador.",
    scoringConfig: {
      lowMax: 39,
      mediumMax: 69,
      referenceLabel: "Índice de referencia preliminar",
      version: "mvp-0.1",
    },
    dimensions: [
      {
        id: "comprension_verbal",
        name: "Comprensión verbal",
        description: "Capacidad para identificar relaciones de significado y comprender instrucciones escritas.",
      },
    ],
    items: [
      {
        id: "rv_01",
        dimensionId: "comprension_verbal",
        prompt: "Ruta es a destino como proceso es a…",
        type: "single_choice",
        options: [
          { label: "Resultado", value: 1 },
          { label: "Reunión", value: 0 },
          { label: "Turno", value: 0 },
          { label: "Mensaje", value: 0 },
        ],
      },
      {
        id: "rv_02",
        dimensionId: "comprension_verbal",
        prompt: "En una instrucción, “conciso” significa:",
        type: "single_choice",
        options: [
          { label: "Claro y breve", value: 1 },
          { label: "Complejo y técnico", value: 0 },
          { label: "Extenso y detallado", value: 0 },
          { label: "Rápido y urgente", value: 0 },
        ],
      },
      {
        id: "rv_03",
        dimensionId: "comprension_verbal",
        prompt: "Completa la relación: supervisar es a calidad como registrar es a…",
        type: "single_choice",
        options: [
          { label: "Trazabilidad", value: 1 },
          { label: "Velocidad", value: 0 },
          { label: "Creatividad", value: 0 },
          { label: "Descanso", value: 0 },
        ],
      },
      {
        id: "rv_04",
        dimensionId: "comprension_verbal",
        prompt: "Si un procedimiento indica “verificar antes de liberar”, ¿qué acción corresponde primero?",
        type: "single_choice",
        options: [
          { label: "Comprobar que se cumplieron los criterios definidos", value: 1 },
          { label: "Liberar para no retrasar el proceso", value: 0 },
          { label: "Delegar la decisión sin revisar", value: 0 },
          { label: "Cambiar los criterios durante la revisión", value: 0 },
        ],
      },
      {
        id: "rv_05",
        dimensionId: "comprension_verbal",
        prompt: "“Mitigar un riesgo” implica principalmente:",
        type: "single_choice",
        options: [
          { label: "Reducir su probabilidad o impacto", value: 1 },
          { label: "Ignorarlo hasta que ocurra", value: 0 },
          { label: "Eliminar toda incertidumbre", value: 0 },
          { label: "Transferirlo sin informar", value: 0 },
        ],
      },
    ],
  },
  {
    code: "RN_MVP_01",
    name: "Razonamiento numérico — MVP",
    category: "reasoning",
    audience: "todos",
    durationMinutes: 8,
    instructions:
      "Selecciona la respuesta numérica correcta. Puedes realizar cálculos mentales o con papel, pero evita detenerte demasiado tiempo en un solo reactivo.",
    scoringConfig: {
      lowMax: 39,
      mediumMax: 69,
      referenceLabel: "Índice de referencia preliminar",
      version: "mvp-0.1",
    },
    dimensions: [
      {
        id: "analisis_numerico",
        name: "Análisis numérico",
        description: "Capacidad para interpretar relaciones cuantitativas y resolver problemas aritméticos de trabajo.",
      },
    ],
    items: [
      {
        id: "rn_01",
        dimensionId: "analisis_numerico",
        prompt: "Tres paquetes cuestan $450. Al mismo precio unitario, ¿cuánto cuestan cinco paquetes?",
        type: "single_choice",
        options: [
          { label: "$600", value: 0 },
          { label: "$700", value: 0 },
          { label: "$750", value: 1 },
          { label: "$900", value: 0 },
        ],
      },
      {
        id: "rn_02",
        dimensionId: "analisis_numerico",
        prompt: "Un equipo completa 48 unidades en 6 horas. Si conserva el ritmo, ¿cuántas unidades completa en 9 horas?",
        type: "single_choice",
        options: [
          { label: "64", value: 0 },
          { label: "72", value: 1 },
          { label: "81", value: 0 },
          { label: "96", value: 0 },
        ],
      },
      {
        id: "rn_03",
        dimensionId: "analisis_numerico",
        prompt: "Un inventario baja de 240 a 204 piezas. ¿Cuál fue la disminución porcentual?",
        type: "single_choice",
        options: [
          { label: "10%", value: 0 },
          { label: "12%", value: 0 },
          { label: "15%", value: 1 },
          { label: "18%", value: 0 },
        ],
      },
      {
        id: "rn_04",
        dimensionId: "analisis_numerico",
        prompt: "La secuencia 4, 7, 13, 22, 34, … continúa con:",
        type: "single_choice",
        options: [
          { label: "46", value: 0 },
          { label: "47", value: 0 },
          { label: "49", value: 1 },
          { label: "51", value: 0 },
        ],
      },
      {
        id: "rn_05",
        dimensionId: "analisis_numerico",
        prompt: "Si 18% de 350 solicitudes requiere seguimiento, ¿cuántas solicitudes son aproximadamente?",
        type: "single_choice",
        options: [
          { label: "53", value: 0 },
          { label: "63", value: 1 },
          { label: "72", value: 0 },
          { label: "81", value: 0 },
        ],
      },
    ],
  },
  {
    code: "BF_MVP_01",
    name: "Estilo de trabajo Big Five — adaptado MVP",
    category: "personality",
    audience: "todos",
    durationMinutes: 10,
    instructions:
      "Indica el grado en que cada afirmación describe tu forma habitual de actuar en el trabajo. No hay respuestas correctas o incorrectas; responde con sinceridad.",
    scoringConfig: {
      lowMax: 39,
      mediumMax: 69,
      referenceLabel: "Índice descriptivo preliminar",
      version: "mvp-0.1",
    },
    dimensions: [
      { id: "apertura", name: "Apertura", description: "Preferencia por aprender, explorar alternativas y adaptarse a nuevas ideas." },
      { id: "responsabilidad", name: "Responsabilidad", description: "Tendencia a organizarse, cumplir acuerdos y mantener estándares." },
      { id: "extraversión", name: "Extraversión", description: "Energía para interactuar, expresar ideas y participar activamente." },
      { id: "amabilidad", name: "Amabilidad", description: "Orientación a la cooperación, respeto y consideración por otras personas." },
      { id: "estabilidad", name: "Estabilidad emocional", description: "Manejo de presión y recuperación ante imprevistos." },
    ],
    items: [
      { id: "bf_01", dimensionId: "apertura", prompt: "Busco aprender maneras nuevas de realizar mi trabajo.", type: "likert", options: likertOptions },
      { id: "bf_02", dimensionId: "apertura", prompt: "Prefiero que nada cambie, incluso si hay una mejora posible.", type: "likert", options: likertOptions, reverseScored: true },
      { id: "bf_03", dimensionId: "responsabilidad", prompt: "Planeo mis actividades para cumplir compromisos a tiempo.", type: "likert", options: likertOptions },
      { id: "bf_04", dimensionId: "responsabilidad", prompt: "Dejo los detalles importantes para el último momento.", type: "likert", options: likertOptions, reverseScored: true },
      { id: "bf_05", dimensionId: "extraversión", prompt: "Me resulta natural aportar ideas en conversaciones de trabajo.", type: "likert", options: likertOptions },
      { id: "bf_06", dimensionId: "extraversión", prompt: "Evito participar aunque tenga información útil para el equipo.", type: "likert", options: likertOptions, reverseScored: true },
      { id: "bf_07", dimensionId: "amabilidad", prompt: "Busco entender la perspectiva de otras personas antes de responder.", type: "likert", options: likertOptions },
      { id: "bf_08", dimensionId: "amabilidad", prompt: "Me cuesta colaborar cuando una persona trabaja de forma distinta a mí.", type: "likert", options: likertOptions, reverseScored: true },
      { id: "bf_09", dimensionId: "estabilidad", prompt: "Mantengo la calma cuando surge un imprevisto relevante.", type: "likert", options: likertOptions },
      { id: "bf_10", dimensionId: "estabilidad", prompt: "Una presión moderada suele impedirme continuar con mis tareas.", type: "likert", options: likertOptions, reverseScored: true },
    ],
  },
  {
    code: "CL_MVP_01",
    name: "Competencias laborales transversales — MVP",
    category: "competency",
    audience: "todos",
    durationMinutes: 8,
    instructions:
      "Responde según tu conducta habitual en el trabajo. El objetivo es identificar oportunidades de desarrollo, no sustituir una entrevista o la evaluación humana.",
    scoringConfig: {
      lowMax: 39,
      mediumMax: 69,
      referenceLabel: "Índice descriptivo preliminar",
      version: "mvp-0.1",
    },
    dimensions: [
      { id: "orientacion_resultados", name: "Orientación a resultados", description: "Seguimiento de prioridades y cumplimiento de compromisos." },
      { id: "colaboracion", name: "Colaboración", description: "Coordinación efectiva y contribución al trabajo conjunto." },
      { id: "calidad_seguridad", name: "Calidad y seguridad", description: "Atención a procedimientos, riesgos y estándares de calidad." },
      { id: "adaptabilidad", name: "Adaptabilidad", description: "Capacidad para responder constructivamente ante cambios operativos." },
    ],
    items: [
      { id: "cl_01", dimensionId: "orientacion_resultados", prompt: "Convierto los objetivos de mi puesto en prioridades claras para la semana.", type: "likert", options: likertOptions },
      { id: "cl_02", dimensionId: "orientacion_resultados", prompt: "Cuando surge una dificultad, comunico el riesgo antes de que afecte la entrega.", type: "likert", options: likertOptions },
      { id: "cl_03", dimensionId: "colaboracion", prompt: "Comparto información relevante para que el equipo pueda avanzar.", type: "likert", options: likertOptions },
      { id: "cl_04", dimensionId: "colaboracion", prompt: "Busco acuerdos prácticos cuando hay opiniones distintas en el equipo.", type: "likert", options: likertOptions },
      { id: "cl_05", dimensionId: "calidad_seguridad", prompt: "Verifico los puntos críticos antes de cerrar una tarea.", type: "likert", options: likertOptions },
      { id: "cl_06", dimensionId: "calidad_seguridad", prompt: "Detengo o reporto una actividad si identifico un riesgo de seguridad o calidad.", type: "likert", options: likertOptions },
      { id: "cl_07", dimensionId: "adaptabilidad", prompt: "Ajusto mi plan de trabajo cuando cambian las prioridades.", type: "likert", options: likertOptions },
      { id: "cl_08", dimensionId: "adaptabilidad", prompt: "Pido el contexto necesario para adaptarme a un cambio de proceso.", type: "likert", options: likertOptions },
    ],
  },
];

export const getCatalogTest = (code: string) => TEST_CATALOG.find(test => test.code === code);
