import { describe, expect, it } from "vitest";
import { getCatalogTest } from "./psychometrics";
import { scoreTest } from "./scoring";

describe("scoreTest", () => {
  it("calcula puntajes y corrige reactivos inversos", () => {
    const test = getCatalogTest("BF_MVP_01");
    if (!test) throw new Error("Catalog test is required");

    const result = scoreTest(test, {
      bf_01: 5,
      bf_02: 1,
      bf_03: 5,
      bf_04: 1,
      bf_05: 5,
      bf_06: 1,
      bf_07: 5,
      bf_08: 1,
      bf_09: 5,
      bf_10: 1,
    });

    expect(result.scorePercent).toBe(100);
    expect(result.level).toBe("alto");
    expect(result.recommendation).toBe("seleccion");
    expect(result.dimensions).toHaveLength(5);
  });

  it("clasifica un resultado incompleto como alerta", () => {
    const test = getCatalogTest("RN_MVP_01");
    if (!test) throw new Error("Catalog test is required");

    const result = scoreTest(test, { rn_01: 1 });

    expect(result.scorePercent).toBe(20);
    expect(result.level).toBe("bajo");
    expect(result.recommendation).toBe("alerta");
  });
});
