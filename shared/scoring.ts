import type { TestDefinition } from "./psychometrics";

export type DimensionScore = {
  id: string;
  name: string;
  rawScore: number;
  maxScore: number;
  scorePercent: number;
  level: "bajo" | "medio" | "alto";
};

export type ScoringResult = {
  rawScore: number;
  maxScore: number;
  scorePercent: number;
  percentile: number | null;
  level: "bajo" | "medio" | "alto";
  recommendation: "seleccion" | "desarrollo" | "alerta";
  dimensions: DimensionScore[];
  note: string;
};

type AnswerMap = Record<string, number | undefined>;

function getLevel(scorePercent: number, config: TestDefinition["scoringConfig"]): "bajo" | "medio" | "alto" {
  if (scorePercent <= config.lowMax) return "bajo";
  if (scorePercent <= config.mediumMax) return "medio";
  return "alto";
}

function calculatePercentile(scorePercent: number, config: TestDefinition["scoringConfig"]): number | null {
  const reference = config.percentileReference;
  if (!reference || !(reference.p25Score < reference.p50Score && reference.p50Score < reference.p75Score)) return null;
  if (scorePercent <= reference.p25Score) return Math.round((scorePercent / reference.p25Score) * 25);
  if (scorePercent <= reference.p50Score) return Math.round(25 + ((scorePercent - reference.p25Score) / (reference.p50Score - reference.p25Score)) * 25);
  if (scorePercent <= reference.p75Score) return Math.round(50 + ((scorePercent - reference.p50Score) / (reference.p75Score - reference.p50Score)) * 25);
  return Math.min(99, Math.round(75 + ((scorePercent - reference.p75Score) / (100 - reference.p75Score)) * 24));
}

export function scoreTest(definition: TestDefinition, answers: AnswerMap): ScoringResult {
  const dimensions = definition.dimensions.map(dimension => {
    const items = definition.items.filter(item => item.dimensionId === dimension.id);
    const rawScore = items.reduce((total, item) => {
      const answer = answers[item.id];
      if (typeof answer !== "number") return total;
      const highestOptionValue = Math.max(...item.options.map(option => option.value));
      const lowestOptionValue = Math.min(...item.options.map(option => option.value));
      const corrected = item.reverseScored ? highestOptionValue + lowestOptionValue - answer : answer;
      return total + Math.max(0, corrected);
    }, 0);
    const maxScore = items.reduce((total, item) => total + Math.max(...item.options.map(option => option.value)), 0);
    const scorePercent = maxScore === 0 ? 0 : Math.round((rawScore / maxScore) * 100);
    return {
      id: dimension.id,
      name: dimension.name,
      rawScore,
      maxScore,
      scorePercent,
      level: getLevel(scorePercent, definition.scoringConfig),
    };
  });

  const rawScore = dimensions.reduce((total, dimension) => total + dimension.rawScore, 0);
  const maxScore = dimensions.reduce((total, dimension) => total + dimension.maxScore, 0);
  const scorePercent = maxScore === 0 ? 0 : Math.round((rawScore / maxScore) * 100);
  const level = getLevel(scorePercent, definition.scoringConfig);
  const recommendation = level === "alto" ? "seleccion" : level === "medio" ? "desarrollo" : "alerta";
  const percentile = calculatePercentile(scorePercent, definition.scoringConfig);

  return {
    rawScore,
    maxScore,
    scorePercent,
    percentile,
    level,
    recommendation,
    dimensions,
    note: `${definition.scoringConfig.referenceLabel}: resultado calculado con la configuración ${definition.scoringConfig.version}. ${percentile === null ? "No existe un baremo percentilar configurado para este instrumento." : "El percentil se estimó a partir de la tabla de referencia configurada por la organización."} Requiere interpretación humana y validación psicométrica antes de usarse para decisiones de alto impacto.`,
  };
}
