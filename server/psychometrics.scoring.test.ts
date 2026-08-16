import { describe, expect, it } from "vitest";
import { getCatalogTest } from "../shared/psychometrics";
import { scoreTest } from "../shared/scoring";

describe("motor de scoring psicométrico", () => {
  it("corrige reactivos inversos y entrega un resultado alto", () => {
    const test = getCatalogTest("BF_MVP_01");
    if (!test) throw new Error("El instrumento Big Five debe existir.");

    const result = scoreTest(test, {
      bf_01: 5, bf_02: 1, bf_03: 5, bf_04: 1, bf_05: 5,
      bf_06: 1, bf_07: 5, bf_08: 1, bf_09: 5, bf_10: 1,
    });

    expect(result.scorePercent).toBe(100);
    expect(result.level).toBe("alto");
    expect(result.recommendation).toBe("seleccion");
  });

  it("mantiene una clasificación de alerta para un resultado incompleto", () => {
    const test = getCatalogTest("RN_MVP_01");
    if (!test) throw new Error("El instrumento numérico debe existir.");

    const result = scoreTest(test, { rn_01: 1 });

    expect(result.scorePercent).toBe(20);
    expect(result.level).toBe("bajo");
    expect(result.recommendation).toBe("alerta");
    expect(result.percentile).toBeNull();
  });

  it("calcula percentil solo cuando existe una tabla de referencia", () => {
    const test = getCatalogTest("RN_MVP_01");
    if (!test) throw new Error("El instrumento numérico debe existir.");
    const configured = { ...test, scoringConfig: { ...test.scoringConfig, percentileReference: { p25Score: 25, p50Score: 50, p75Score: 75 } } };

    const result = scoreTest(configured, { rn_01: 1, rn_02: 1, rn_03: 1 });

    expect(result.scorePercent).toBe(60);
    expect(result.percentile).toBe(60);
  });
});
