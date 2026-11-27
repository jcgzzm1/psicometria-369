import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BRAND_NAME, DOCUMENT_TITLE } from "../shared/brand";

const readProjectFile = (relativePath: string) =>
  readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");

describe("marca del producto", () => {
  it("usa Psicometria 369 como nombre visible y título de documento", () => {
    expect(BRAND_NAME).toBe("Psicometria 369");
    expect(DOCUMENT_TITLE).toBe("Psicometria 369 | Evaluaciones psicométricas");
  });

  it.skipIf(!process.env.VITE_APP_TITLE)("el título configurado de WebDev coincide con la marca", () => {
    expect(process.env.VITE_APP_TITLE).toBe(BRAND_NAME);
  });

  it("el título HTML usa la nueva marca", () => {
    const html = readProjectFile("client/index.html");
    expect(html).toContain(`<title>${DOCUMENT_TITLE}</title>`);
  });

  it("portada y panel comparten la marca y ya no incluyen el nombre anterior", () => {
    for (const path of ["client/src/pages/Home.tsx", "client/src/components/DashboardLayout.tsx"]) {
      const source = readProjectFile(path);
      expect(source).toContain('import { BRAND_NAME } from "@shared/brand";');
      expect(source).toContain("{BRAND_NAME}");
      expect(source).not.toContain("Nexo Persona");
    }
  });
});
